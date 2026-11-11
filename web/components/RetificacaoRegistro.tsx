"use client";
import { useEffect, useState, type FormEvent } from "react";
import { consultarDominio } from "../services/dominio";

type Retificacao = {
  id: string;
  versao: number;
  motivo: string;
  conteudo: Record<string, string>;
  autor: string;
  criadoEm: string;
};
export function RetificacaoRegistro({
  idPaciente,
  tipo,
  registro,
  aoSalvar,
  aoFechar,
}: {
  idPaciente: string;
  tipo: "diary" | "consultations";
  registro: Record<string, unknown>;
  aoSalvar: () => void;
  aoFechar: () => void;
}) {
  const campos =
    tipo === "consultations"
      ? {
          notes: "Anotações da consulta",
          goals: "Objetivos acordados",
          carePlan: "Orientações da equipe",
        }
      : {
          notes: "Observações da transcrição",
          medicationReport: "Relato sobre medicamentos",
        };
  const [historico, definirHistorico] = useState<Retificacao[]>([]),
    [carregando, definirCarregando] = useState(true);
  const [erro, definirErro] = useState(""),
    [ocupado, definirOcupado] = useState(false),
    [versao, definirVersao] = useState(0);
  const [conteudo, definirConteudo] = useState<Record<string, string>>({});
  const caminho = `/pacientes/${idPaciente}/registros/${tipo === "diary" ? "DIARIO" : "CONSULTAS"}/${registro.id}/retificacoes`;
  useEffect(() => {
    let ativo = true;
    consultarDominio<Retificacao[]>(caminho)
      .then((versoes) => {
        if (!ativo) return;
        definirHistorico(versoes);
        definirVersao(versoes[0]?.versao ?? 0);
        const atual: Record<string, string> = {};
        for (const chave of Object.keys(
          tipo === "consultations"
            ? { notes: 1, goals: 1, carePlan: 1 }
            : { notes: 1, medicationReport: 1 },
        ))
          atual[chave] =
            versoes[0]?.conteudo[chave] ?? String(registro[chave] ?? "");
        definirConteudo(atual);
      })
      .catch(() => {
        if (ativo)
          definirErro(
            "Não foi possível consultar as versões. Feche e abra novamente antes de editar.",
          );
      })
      .finally(() => {
        if (ativo) definirCarregando(false);
      });
    return () => {
      ativo = false;
    };
  }, [caminho, registro, tipo]);
  async function salvar(evento: FormEvent<HTMLFormElement>) {
    evento.preventDefault();
    if (ocupado || carregando) return;
    const dados = new FormData(evento.currentTarget);
    definirOcupado(true);
    definirErro("");
    try {
      await consultarDominio(caminho, "POST", {
        versaoAtual: versao,
        motivo: String(dados.get("motivo") ?? ""),
        conteudo,
      });
      aoSalvar();
    } catch (falha) {
      definirErro(
        falha instanceof Error
          ? falha.message
          : "Não foi possível retificar. Atualize as versões antes de repetir.",
      );
    } finally {
      definirOcupado(false);
    }
  }
  return (
    <section className="panel padded" aria-label="Retificar anotações">
      <h3>Retificar anotações</h3>
      <p>
        O registro original será preservado. Esta ação cria uma versão com seu
        nome, motivo e horário. Valores de pressão, pulso e data da ocorrência
        permanecem no registro original.
      </p>
      {carregando ? (
        <p role="status">Consultando versões…</p>
      ) : (
        <form className="care-form" onSubmit={salvar}>
          {Object.entries(campos).map(([chave, rotulo]) => (
            <label key={chave}>
              {rotulo}
              <textarea
                name={chave}
                value={conteudo[chave] ?? ""}
                onChange={(evento) =>
                  definirConteudo({ ...conteudo, [chave]: evento.target.value })
                }
                required={tipo === "consultations"}
                maxLength={tipo === "diary" || chave === "goals" ? 2000 : 4000}
              />
            </label>
          ))}
          <label>
            Motivo da retificação
            <textarea name="motivo" required minLength={10} maxLength={1000} />
          </label>
          <button
            className="button button-primary"
            disabled={ocupado || !Object.keys(conteudo).length}
          >
            Registrar retificação
          </button>
        </form>
      )}
      {erro && (
        <p className="notice notice-error" role="alert">
          {erro}
        </p>
      )}
      <button
        className="button button-secondary"
        onClick={aoFechar}
        disabled={ocupado}
      >
        Fechar retificação
      </button>
      <details>
        <summary>Versões anteriores ({historico.length})</summary>
        {historico.map((item) => (
          <article key={item.id} className="care-record">
            <strong>
              Versão {item.versao} · {item.autor}
            </strong>
            <p>
              {new Date(item.criadoEm).toLocaleString("pt-BR", {
                timeZone: "America/Sao_Paulo",
              })}
            </p>
            <p>Motivo: {item.motivo}</p>
            {Object.entries(campos).map(([chave, rotulo]) => (
              <p key={chave}>
                {rotulo}: {item.conteudo[chave]}
              </p>
            ))}
          </article>
        ))}
      </details>
    </section>
  );
}
