"use client";
import { useCallback, useEffect, useState, type FormEvent } from "react";
import type { CatalogoExercicios } from "@viva/contracts";
import { consultarDominio } from "../services/dominio";

export function formatarDataHora(valor: string) {
  return new Date(valor).toLocaleString("pt-BR", {
    timeZone: "America/Sao_Paulo",
    dateStyle: "short",
    timeStyle: "short",
  });
}

export function AprovacaoCatalogoExercicios({
  administrador,
}: {
  administrador: boolean;
}) {
  const [catalogo, definirCatalogo] = useState<CatalogoExercicios | null>(null),
    [erro, definirErro] = useState(""),
    [aviso, definirAviso] = useState(""),
    [ocupado, definirOcupado] = useState(false),
    [confirmandoRevogacao, definirConfirmandoRevogacao] = useState(false);
  const atualizar = useCallback(async () => {
    try {
      definirCatalogo(
        await consultarDominio<CatalogoExercicios>("/exercicios/catalogo"),
      );
    } catch (falha) {
      definirErro(
        falha instanceof Error
          ? falha.message
          : "Não foi possível carregar o catálogo.",
      );
    }
  }, []);
  useEffect(() => {
    void atualizar();
  }, [atualizar]);

  async function executar(acao: () => Promise<CatalogoExercicios>) {
    definirOcupado(true);
    definirErro("");
    definirAviso("");
    try {
      definirCatalogo(await acao());
      return true;
    } catch (falha) {
      definirErro(
        falha instanceof Error ? falha.message : "Verifique sua conexão.",
      );
      return false;
    } finally {
      definirOcupado(false);
    }
  }
  async function aprovar(evento: FormEvent<HTMLFormElement>) {
    evento.preventDefault();
    const formulario = evento.currentTarget;
    const dados = new FormData(formulario);
    const ok = await executar(() =>
      consultarDominio<CatalogoExercicios>(
        "/exercicios/catalogo/aprovacao",
        "POST",
        {
          nomeResponsavel: String(dados.get("nomeResponsavel") ?? ""),
          conselho: String(dados.get("conselho") ?? ""),
          registroConselho: String(dados.get("registroConselho") ?? ""),
          observacao: String(dados.get("observacao") ?? ""),
          confirmacao: dados.get("confirmacao") === "on",
        },
      ),
    );
    if (ok) {
      formulario.reset();
      definirAviso("Aprovação registrada. A equipe já pode montar planos.");
    }
  }
  async function revogar() {
    const ok = await executar(() =>
      consultarDominio<CatalogoExercicios>(
        "/exercicios/catalogo/aprovacao/revogar",
        "POST",
      ),
    );
    definirConfirmandoRevogacao(false);
    if (ok)
      definirAviso(
        "Aprovação revogada. Os planos existentes ficam bloqueados para os pacientes.",
      );
  }

  const aprovado = catalogo?.situacao === "APROVADO";
  return (
    <section
      className="panel padded configuracoes-exercicios"
      aria-labelledby="titulo-catalogo-exercicios"
    >
      <h2 id="titulo-catalogo-exercicios">Catálogo de exercícios</h2>
      {!catalogo && !erro && <p>Carregando…</p>}
      {catalogo && (
        <>
          <p>
            Versão {catalogo.versaoCatalogo} · {catalogo.itens.length}{" "}
            exercícios em dois grupos.{" "}
            {aprovado ? (
              <span className="badge badge-sucesso">Aprovado</span>
            ) : (
              <span className="badge badge-alerta">
                Aguardando aprovação clínica
              </span>
            )}
          </p>
          {aprovado && catalogo.aprovacao ? (
            <dl className="dados-conta">
              <div>
                <dt>Responsável clínico</dt>
                <dd>{catalogo.aprovacao.nomeResponsavel}</dd>
              </div>
              <div>
                <dt>Registro</dt>
                <dd>
                  {catalogo.aprovacao.conselho}{" "}
                  {catalogo.aprovacao.registroConselho}
                </dd>
              </div>
              <div>
                <dt>Registrado em</dt>
                <dd>
                  {formatarDataHora(catalogo.aprovacao.aprovadoEm)}
                  {catalogo.aprovacao.registradoPorNome
                    ? ` por ${catalogo.aprovacao.registradoPorNome}`
                    : ""}
                </dd>
              </div>
            </dl>
          ) : (
            <p>
              Enquanto não houver aprovação clínica registrada, nenhum plano de
              exercícios pode ser montado e o paciente não vê planos no
              aplicativo.
            </p>
          )}
        </>
      )}
      {administrador && catalogo && !aprovado && (
        <form className="care-form" onSubmit={aprovar}>
          <p className="form-hint">
            Registre aqui a revisão feita pelo profissional responsável. O
            registro fica na auditoria da unidade.
          </p>
          <label>
            Nome do responsável clínico
            <input
              name="nomeResponsavel"
              required
              minLength={3}
              maxLength={160}
            />
          </label>
          <label>
            Conselho (ex.: COREN-SP, CREFITO-3)
            <input name="conselho" required minLength={2} maxLength={40} />
          </label>
          <label>
            Número de registro
            <input
              name="registroConselho"
              required
              minLength={2}
              maxLength={40}
            />
          </label>
          <label>
            Observação (opcional)
            <textarea name="observacao" maxLength={1000} />
          </label>
          <label className="campo-inteiro">
            <input type="checkbox" name="confirmacao" required /> Confirmo que
            os {catalogo.itens.length} exercícios desta versão foram revisados
            pelo responsável indicado.
          </label>
          <button className="button button-primary" disabled={ocupado}>
            Registrar aprovação
          </button>
        </form>
      )}
      {administrador &&
        aprovado &&
        (confirmandoRevogacao ? (
          <div className="state-actions">
            <p>
              Revogar bloqueia todos os planos da unidade até nova aprovação.
            </p>
            <button
              type="button"
              className="button button-perigo"
              disabled={ocupado}
              onClick={() => void revogar()}
            >
              Confirmar revogação
            </button>
            <button
              type="button"
              className="button button-secondary"
              onClick={() => definirConfirmandoRevogacao(false)}
            >
              Cancelar
            </button>
          </div>
        ) : (
          <button
            type="button"
            className="button button-secondary"
            onClick={() => definirConfirmandoRevogacao(true)}
          >
            Revogar aprovação
          </button>
        ))}
      {!administrador && !aprovado && catalogo && (
        <p className="form-hint">
          Somente a administração da unidade registra a aprovação.
        </p>
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
