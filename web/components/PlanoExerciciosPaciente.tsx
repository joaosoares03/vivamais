"use client";
import { useCallback, useEffect, useState, type FormEvent } from "react";
import {
  descreverDiasSemana,
  diasSemanaPlano,
  progressoSemana,
  type CatalogoExercicios,
  type EntradaPlanoExercicios,
  type PlanoExercicios,
} from "@viva/contracts";
import { consultarDominio } from "../services/dominio";
import { formatarDataHora } from "./AprovacaoCatalogoExercicios";

const MAXIMO_ITENS = 5;

export type GrupoPerfil =
  | "NAO_DEFINIDO"
  | "COM_RISCO_QUEDA_SENTADO"
  | "SEM_RISCO_QUEDA_EM_PE";

/** Lê o formulário do editor e monta a entrada da API. Exportada para teste. */
export function entradaDoFormulario(
  dados: FormData,
  idPlanoAtual: string | null,
  idsDoGrupo: readonly string[],
): EntradaPlanoExercicios | string {
  const itens: EntradaPlanoExercicios["itens"] = [];
  for (const id of idsDoGrupo) {
    if (dados.get(`incluir-${id}`) !== "on") continue;
    const diasSemana = dados
      .getAll(`dias-${id}`)
      .map(Number)
      .filter((dia) => dia >= 1 && dia <= 7);
    const duracaoMinutos = Number(dados.get(`duracao-${id}`));
    if (!diasSemana.length)
      return "Escolha pelo menos um dia para cada exercício marcado.";
    if (
      !Number.isInteger(duracaoMinutos) ||
      duracaoMinutos < 1 ||
      duracaoMinutos > 60
    )
      return "A duração deve ficar entre 1 e 60 minutos.";
    itens.push({
      idExercicio: id,
      diasSemana,
      duracaoMinutos,
      observacao: String(dados.get(`observacao-${id}`) ?? "").trim(),
    });
  }
  if (!itens.length) return "Marque pelo menos um exercício.";
  if (itens.length > MAXIMO_ITENS)
    return `O plano aceita até ${MAXIMO_ITENS} exercícios.`;
  return {
    idPlanoAtual,
    orientacao: String(dados.get("orientacao") ?? "").trim(),
    itens,
  };
}

export function PlanoExerciciosPaciente({
  idPaciente,
  grupo,
  restricoes,
}: {
  idPaciente: string;
  grupo: GrupoPerfil;
  restricoes: string;
}) {
  const caminho = `/pacientes/${idPaciente}/plano-exercicios`;
  const [catalogo, definirCatalogo] = useState<CatalogoExercicios | null>(null),
    [plano, definirPlano] = useState<PlanoExercicios | null>(null),
    [carregado, definirCarregado] = useState(false),
    [editando, definirEditando] = useState(false),
    [confirmandoEncerramento, definirConfirmandoEncerramento] = useState(false),
    [erro, definirErro] = useState(""),
    [aviso, definirAviso] = useState(""),
    [ocupado, definirOcupado] = useState(false);

  const carregar = useCallback(async () => {
    try {
      const [dadosCatalogo, dadosPlano] = await Promise.all([
        consultarDominio<CatalogoExercicios>("/exercicios/catalogo"),
        consultarDominio<PlanoExercicios | undefined>(caminho),
      ]);
      definirCatalogo(dadosCatalogo);
      definirPlano(dadosPlano ?? null);
    } catch (falha) {
      definirErro(
        falha instanceof Error ? falha.message : "Plano indisponível.",
      );
    } finally {
      definirCarregado(true);
    }
  }, [caminho]);
  useEffect(() => {
    void carregar();
  }, [carregar, grupo]);

  async function salvar(evento: FormEvent<HTMLFormElement>) {
    evento.preventDefault();
    if (!catalogo) return;
    definirErro("");
    definirAviso("");
    const idsDoGrupo = catalogo.itens
      .filter((item) => item.grupo === grupo)
      .map((item) => item.id);
    const entrada = entradaDoFormulario(
      new FormData(evento.currentTarget),
      plano?.id ?? null,
      idsDoGrupo,
    );
    if (typeof entrada === "string") {
      definirErro(entrada);
      return;
    }
    definirOcupado(true);
    try {
      definirPlano(
        await consultarDominio<PlanoExercicios>(caminho, "PUT", entrada),
      );
      definirEditando(false);
      definirAviso("Plano salvo. O paciente vê a nova versão no aplicativo.");
    } catch (falha) {
      definirErro(
        falha instanceof Error ? falha.message : "Não foi possível salvar.",
      );
    } finally {
      definirOcupado(false);
    }
  }
  async function encerrar() {
    if (!plano) return;
    definirOcupado(true);
    definirErro("");
    try {
      await consultarDominio(`${caminho}/encerrar`, "POST", {
        idPlanoAtual: plano.id,
      });
      definirPlano(null);
      definirAviso("Plano encerrado.");
    } catch (falha) {
      definirErro(
        falha instanceof Error ? falha.message : "Não foi possível encerrar.",
      );
    } finally {
      definirOcupado(false);
      definirConfirmandoEncerramento(false);
    }
  }

  const aprovado = catalogo?.situacao === "APROVADO";
  const itensDoGrupo =
    catalogo?.itens.filter((item) => item.grupo === grupo) ?? [];
  const progresso = progressoSemana(plano);
  const bloqueio = !carregado
    ? "Carregando…"
    : !aprovado
      ? "O catálogo ainda não tem aprovação clínica registrada nesta unidade. A administração registra a aprovação em Configurações."
      : grupo === "NAO_DEFINIDO"
        ? "Defina o grupo do catálogo no perfil funcional para montar o plano."
        : "";

  return (
    <section
      className="panel padded plano-exercicios"
      aria-labelledby="titulo-plano-exercicios"
    >
      <div className="section-heading">
        <div>
          <p className="eyebrow">Definido pela equipe</p>
          <h3 id="titulo-plano-exercicios">Plano de exercícios</h3>
        </div>
        {plano && (
          <span
            className={`badge ${plano.situacao === "ATIVO" ? "badge-sucesso" : "badge-alerta"}`}
          >
            {plano.situacao === "ATIVO" ? "Ativo" : "Bloqueado"}
          </span>
        )}
      </div>
      {bloqueio && <p className="notice">{bloqueio}</p>}
      {restricoes.trim() && (
        <p className="form-hint">
          O perfil registra restrições. No aplicativo, o roteiro continua
          pedindo a conferência do dia antes de cada atividade.
        </p>
      )}
      {plano && !editando && (
        <>
          {plano.situacao !== "ATIVO" && (
            <p className="notice">
              A aprovação usada neste plano foi revogada. O paciente não vê o
              plano até ele ser salvo de novo com a aprovação vigente.
            </p>
          )}
          <table className="tabela-cartoes plano-exercicios-tabela">
            <caption className="titulo-tabela">
              Semana iniciada em{" "}
              {new Date(`${plano.semana.inicio}T12:00:00Z`).toLocaleDateString(
                "pt-BR",
                { timeZone: "UTC" },
              )}
            </caption>
            <thead>
              <tr>
                <th scope="col">Exercício</th>
                <th scope="col">Dias</th>
                <th scope="col">Duração</th>
                <th scope="col">Registros na semana</th>
              </tr>
            </thead>
            <tbody>
              {plano.itens.map((item) => {
                const andamento = progresso.find(
                  (linha) => linha.idExercicio === item.idExercicio,
                );
                return (
                  <tr key={item.idExercicio}>
                    <td data-rotulo="Exercício">
                      <strong>{item.nome}</strong>
                      {item.observacao && (
                        <>
                          <br />
                          <small>{item.observacao}</small>
                        </>
                      )}
                    </td>
                    <td data-rotulo="Dias">
                      {descreverDiasSemana(item.diasSemana)}
                    </td>
                    <td data-rotulo="Duração">{item.duracaoMinutos} min</td>
                    <td data-rotulo="Registros na semana">
                      {andamento
                        ? `${andamento.diasComRegistro} de ${andamento.previstosSemana} dias`
                        : "—"}
                    </td>
                  </tr>
                );
              })}
            </tbody>
          </table>
          {plano.orientacao && (
            <p>
              <strong>Orientação:</strong> {plano.orientacao}
            </p>
          )}
          <p className="form-hint">
            Salvo por {plano.autorNome} em {formatarDataHora(plano.criadoEm)}.
            Catálogo {plano.versaoCatalogo}, aprovado por{" "}
            {plano.aprovacao.nomeResponsavel} ({plano.aprovacao.conselho}{" "}
            {plano.aprovacao.registroConselho}). Registros são informados pelo
            paciente e não comprovam a execução.
          </p>
        </>
      )}
      {!plano && carregado && !bloqueio && !editando && (
        <p className="empty-state">Nenhum plano ativo para este paciente.</p>
      )}
      {!bloqueio && !editando && (
        <div className="state-actions">
          <button
            type="button"
            className="button button-primary"
            onClick={() => {
              definirAviso("");
              definirEditando(true);
            }}
          >
            {plano ? "Alterar plano" : "Montar plano"}
          </button>
          {plano &&
            (confirmandoEncerramento ? (
              <>
                <button
                  type="button"
                  className="button button-perigo"
                  disabled={ocupado}
                  onClick={() => void encerrar()}
                >
                  Confirmar encerramento
                </button>
                <button
                  type="button"
                  className="button button-secondary"
                  onClick={() => definirConfirmandoEncerramento(false)}
                >
                  Cancelar
                </button>
              </>
            ) : (
              <button
                type="button"
                className="button button-secondary"
                onClick={() => definirConfirmandoEncerramento(true)}
              >
                Encerrar plano
              </button>
            ))}
        </div>
      )}
      {editando && !bloqueio && (
        <form className="care-form plano-exercicios-editor" onSubmit={salvar}>
          <p className="form-hint">
            Marque até {MAXIMO_ITENS} exercícios do grupo definido no perfil.
            Esta é uma decisão profissional: o sistema não sugere exercícios.
          </p>
          {itensDoGrupo.map((item) => {
            const atual = plano?.itens.find(
              (linha) =>
                linha.idExercicio === item.id && plano.situacao === "ATIVO",
            );
            return (
              <fieldset key={item.id} className="plano-item">
                <legend>
                  <label>
                    <input
                      type="checkbox"
                      name={`incluir-${item.id}`}
                      defaultChecked={Boolean(atual)}
                    />{" "}
                    {item.nome}
                  </label>
                </legend>
                <div
                  className="plano-dias"
                  role="group"
                  aria-label={`Dias de ${item.nome}`}
                >
                  {diasSemanaPlano.map((dia) => (
                    <label key={dia.dia} title={dia.nome}>
                      <input
                        type="checkbox"
                        name={`dias-${item.id}`}
                        value={dia.dia}
                        defaultChecked={atual?.diasSemana.includes(dia.dia)}
                        aria-label={`${item.nome}, ${dia.nome}`}
                      />
                      {dia.curto}
                    </label>
                  ))}
                </div>
                <label>
                  Duração (minutos)
                  <input
                    type="number"
                    name={`duracao-${item.id}`}
                    min={1}
                    max={60}
                    defaultValue={atual?.duracaoMinutos ?? 10}
                  />
                </label>
                <label>
                  Observação para o paciente (opcional)
                  <input
                    name={`observacao-${item.id}`}
                    maxLength={300}
                    defaultValue={atual?.observacao ?? ""}
                  />
                </label>
              </fieldset>
            );
          })}
          <label className="campo-inteiro">
            Orientação geral (opcional)
            <textarea
              name="orientacao"
              maxLength={1000}
              defaultValue={plano?.orientacao ?? ""}
            />
          </label>
          <div className="state-actions">
            <button className="button button-primary" disabled={ocupado}>
              Salvar plano
            </button>
            <button
              type="button"
              className="button button-secondary"
              onClick={() => {
                definirErro("");
                definirEditando(false);
              }}
            >
              Cancelar
            </button>
          </div>
        </form>
      )}
      <p aria-live="polite">{aviso}</p>
      {erro && (
        <p className="notice notice-error" role="alert">
          {erro}
        </p>
      )}
    </section>
  );
}
