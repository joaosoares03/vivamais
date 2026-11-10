"use client";
import { useCallback, useEffect, useState, type FormEvent } from "react";
import { consultarDominio } from "../services/dominio";

type Conta = {
  id: string;
  email: string;
  nome: string;
  papel: "PROFESSIONAL" | "ADMIN";
  ativa: boolean;
  mfaConfirmado: boolean;
};
type Convite = { id: string; convite: string; expiraEm: string };

export function linkConvite(origem: string, convite: string) {
  return `${origem}/ativar-conta#${convite}`;
}

export function ContasEquipe() {
  const [contas, definirContas] = useState<Conta[] | null>(null),
    [link, definirLink] = useState(""),
    [selecionada, definirSelecionada] = useState(""),
    [erro, definirErro] = useState(""),
    [ocupado, definirOcupado] = useState(false);
  const atualizar = useCallback(async () => {
    try {
      definirContas(await consultarDominio<Conta[]>("/contas-institucionais"));
    } catch (falha) {
      definirErro(
        falha instanceof Error
          ? falha.message
          : "Não foi possível carregar a equipe.",
      );
    }
  }, []);
  useEffect(() => {
    void atualizar();
  }, [atualizar]);
  async function executar(
    formulario: HTMLFormElement,
    acao: () => Promise<Convite | void>,
  ) {
    definirOcupado(true);
    definirErro("");
    definirLink("");
    try {
      const convite = await acao();
      if (convite)
        definirLink(linkConvite(window.location.origin, convite.convite));
      await atualizar();
    } catch (falha) {
      definirErro(
        falha instanceof Error ? falha.message : "Verifique sua conexão.",
      );
    } finally {
      formulario.reset();
      definirOcupado(false);
    }
  }
  function criar(evento: FormEvent<HTMLFormElement>) {
    evento.preventDefault();
    const formulario = evento.currentTarget,
      dados = new FormData(formulario);
    void executar(formulario, () =>
      consultarDominio<Convite>("/contas-institucionais", "POST", {
        nome: dados.get("nome"),
        email: dados.get("email"),
        papel: dados.get("papel"),
        senhaAdministrador: dados.get("senhaAdministrador"),
        codigoMfa: dados.get("codigoMfa"),
      }),
    );
  }
  function alterar(evento: FormEvent<HTMLFormElement>) {
    evento.preventDefault();
    const formulario = evento.currentTarget,
      dados = new FormData(formulario),
      acao = (evento.nativeEvent as SubmitEvent).submitter?.getAttribute(
        "value",
      );
    const corpo = {
      senhaAdministrador: dados.get("senhaAdministrador"),
      codigoMfa: dados.get("codigoMfa"),
    };
    void executar(formulario, async () => {
      const caminho = `/contas-institucionais/${selecionada}`;
      if (acao === "desativar") {
        await consultarDominio<void>(`${caminho}/desativar`, "POST", corpo);
        return;
      }
      return consultarDominio<Convite>(`${caminho}/convite`, "POST", corpo);
    });
  }
  const camposConfirmacao = (
    <>
      <label>
        Sua senha
        <input
          type="password"
          name="senhaAdministrador"
          required
          maxLength={72}
          autoComplete="current-password"
          disabled={ocupado}
        />
      </label>
      <label>
        Código do seu autenticador
        <input
          name="codigoMfa"
          inputMode="numeric"
          autoComplete="one-time-code"
          required
          maxLength={32}
          disabled={ocupado}
        />
      </label>
    </>
  );
  return (
    <section className="panel padded spaced">
      <h1>Equipe</h1>
      <p>
        Cada pessoa recebe um convite individual, cria a própria senha e
        configura um autenticador. Um novo convite também serve para recuperar o
        acesso: ele encerra as sessões da pessoa e apaga o autenticador
        anterior.
      </p>
      {erro && <p role="alert">{erro}</p>}
      {link && (
        <div className="notice" role="status">
          <p>
            Envie este link à pessoa por um canal seguro. Ele vale por 48 horas,
            funciona uma vez e não será mostrado de novo.
          </p>
          <p>
            <code>{link}</code>
          </p>
        </div>
      )}
      {contas === null ? (
        !erro && <p role="status">Carregando equipe…</p>
      ) : (
        <div className="tabela-responsiva">
          <table className="care-table">
            <thead>
              <tr>
                <th scope="col">Nome</th>
                <th scope="col">E-mail</th>
                <th scope="col">Perfil</th>
                <th scope="col">Situação</th>
              </tr>
            </thead>
            <tbody>
              {contas.map((conta) => (
                <tr key={conta.id}>
                  <td>{conta.nome}</td>
                  <td>{conta.email}</td>
                  <td>
                    {conta.papel === "ADMIN" ? "Administração" : "Profissional"}
                  </td>
                  <td>
                    {conta.ativa
                      ? conta.mfaConfirmado
                        ? "Ativa"
                        : "Ativa, sem autenticador"
                      : "Aguardando ativação ou desativada"}
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      )}
      <form className="care-form" onSubmit={criar}>
        <h2>Convidar pessoa</h2>
        <label>
          Nome
          <input name="nome" required maxLength={160} disabled={ocupado} />
        </label>
        <label>
          E-mail
          <input
            name="email"
            type="email"
            required
            maxLength={254}
            disabled={ocupado}
          />
        </label>
        <label>
          Perfil
          <select name="papel" defaultValue="PROFESSIONAL" disabled={ocupado}>
            <option value="PROFESSIONAL">Profissional</option>
            <option value="ADMIN">Administração</option>
          </select>
        </label>
        {camposConfirmacao}
        <button className="button button-primary" disabled={ocupado}>
          {ocupado ? "Processando…" : "Gerar convite"}
        </button>
      </form>
      {contas && contas.length > 1 && (
        <form className="care-form" onSubmit={alterar}>
          <h2>Recuperar ou desativar acesso</h2>
          <label>
            Pessoa
            <select
              required
              value={selecionada}
              onChange={(evento) => definirSelecionada(evento.target.value)}
              disabled={ocupado}
            >
              <option value="">Selecione</option>
              {contas.map((conta) => (
                <option key={conta.id} value={conta.id}>
                  {conta.nome}
                </option>
              ))}
            </select>
          </label>
          {camposConfirmacao}
          <button
            className="button button-secondary"
            name="acao"
            value="convite"
            disabled={ocupado}
          >
            Gerar novo convite
          </button>
          <button
            className="button button-secondary"
            name="acao"
            value="desativar"
            disabled={ocupado}
          >
            Desativar acesso
          </button>
        </form>
      )}
    </section>
  );
}
