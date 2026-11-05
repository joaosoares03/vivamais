"use client";
import { useCallback, useEffect, useState, type FormEvent } from "react";
import type { ConviteTestador, ConviteTestadorListado } from "@viva/contracts";
import { consultarDominio } from "../services/dominio";

export function ConvitesTestadores({ idPaciente }: { idPaciente: string }) {
  const [convites, definirConvites] = useState<ConviteTestadorListado[]>([]),
    [emitido, definirEmitido] = useState<ConviteTestador | null>(null),
    [erro, definirErro] = useState(""),
    [ocupado, definirOcupado] = useState(false);
  const base = `/patients/${idPaciente}/test-invites`;
  const enderecoWeb = process.env.NEXT_PUBLIC_APLICATIVO_URL;
  const conviteWeb =
    emitido && enderecoWeb?.startsWith("https://")
      ? new URL(`/convite#${emitido.convite}`, enderecoWeb).href
      : null;
  const atualizar = useCallback(async () => {
    definirConvites(await consultarDominio<ConviteTestadorListado[]>(base));
  }, [base]);
  useEffect(() => {
    let ativo = true;
    definirEmitido(null);
    void consultarDominio<ConviteTestadorListado[]>(base)
      .then((dados) => {
        if (ativo) definirConvites(dados);
      })
      .catch(() => {
        if (ativo) definirErro("Não foi possível consultar os convites.");
      });
    return () => {
      ativo = false;
    };
  }, [base]);
  async function emitir(evento: FormEvent<HTMLFormElement>) {
    evento.preventDefault();
    if (ocupado) return;
    const formulario = evento.currentTarget,
      dados = new FormData(formulario);
    definirOcupado(true);
    definirErro("");
    definirEmitido(null);
    try {
      definirEmitido(
        await consultarDominio<ConviteTestador>(base, "POST", {
          senhaProfissional: dados.get("senhaProfissional"),
          validadeDias: Number(dados.get("validadeDias")),
        }),
      );
      await atualizar();
    } catch (falha) {
      definirErro(
        falha instanceof Error
          ? falha.message
          : "Não foi possível emitir o convite.",
      );
    } finally {
      formulario.reset();
      definirOcupado(false);
    }
  }
  return (
    <section className="ativacao-paciente" aria-label="Convites de testes">
      <h2>Acesso privado aos testes</h2>
      <p>
        Esta conta é fictícia. Emita um convite individual e entregue por um
        canal privado ao participante. Para separar os testes, cadastre um
        paciente por pessoa.
      </p>
      <form className="grupo-ativacao" onSubmit={emitir}>
        <label>
          Validade do acesso
          <select name="validadeDias" defaultValue="7" disabled={ocupado}>
            <option value="1">1 dia</option>
            <option value="3">3 dias</option>
            <option value="7">7 dias</option>
          </select>
        </label>
        <label>
          Sua senha profissional
          <input
            name="senhaProfissional"
            type="password"
            required
            autoComplete="current-password"
            maxLength={72}
            disabled={ocupado}
          />
        </label>
        <button className="button button-primary" disabled={ocupado}>
          {ocupado ? "Aguarde…" : "Criar convite privado"}
        </button>
      </form>
      {emitido && (
        <div className="notice" role="status">
          <h3>Convite criado</h3>
          <p>
            Copie agora. O segredo não será exibido novamente. Ele autoriza um
            aparelho até {new Date(emitido.expiraEm).toLocaleString("pt-BR")}.
          </p>
          <label>
            Convite individual
            <input
              aria-label="Convite individual"
              readOnly
              value={emitido.convite}
              onFocus={(evento) => evento.currentTarget.select()}
            />
          </label>
          {conviteWeb && (
            <label>
              Link para iPhone e navegador
              <input
                aria-label="Link privado para iPhone e navegador"
                readOnly
                value={conviteWeb}
                onFocus={(evento) => evento.currentTarget.select()}
              />
            </label>
          )}
          <label>
            Link para o aplicativo instalado
            <input
              aria-label="Link privado do convite"
              readOnly
              value={`vivamais-teste://convite#${emitido.convite}`}
              onFocus={(evento) => evento.currentTarget.select()}
            />
          </label>
          <button
            className="button button-secondary"
            onClick={() => definirEmitido(null)}
          >
            Ocultar convite
          </button>
        </div>
      )}
      {!!erro && <p role="alert">{erro}</p>}
      <h3>Convites desta conta</h3>
      <ul>
        {convites.map((convite) => (
          <li key={convite.id}>
            Criado em {new Date(convite.criadoEm).toLocaleString("pt-BR")} ·{" "}
            {convite.revogadoEm
              ? "Revogado"
              : Date.parse(convite.expiraEm) <= Date.now()
                ? "Expirado"
                : convite.utilizadoEm
                  ? "Em uso"
                  : "Aguardando uso"}
            {!convite.revogadoEm && (
              <button
                type="button"
                className="button button-secondary"
                disabled={ocupado}
                onClick={() => {
                  definirOcupado(true);
                  definirErro("");
                  void consultarDominio(
                    `${base}/${convite.id}/revoke`,
                    "POST",
                    {},
                  )
                    .then(atualizar)
                    .catch(() =>
                      definirErro("Não foi possível revogar o convite."),
                    )
                    .finally(() => definirOcupado(false));
                }}
              >
                Revogar acesso
              </button>
            )}
          </li>
        ))}
      </ul>
      {!convites.length && <p>Nenhum convite cadastrado.</p>}
    </section>
  );
}
