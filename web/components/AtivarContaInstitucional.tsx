"use client";
import { useEffect, useRef, useState, type FormEvent } from "react";
import { MarcaViva } from "./Icones";

type DadosMfa = { email: string; segredo: string; uri: string };

async function chamar<T>(acao: "convite" | "ativar", corpo: unknown) {
  const resposta = await fetch(`/api/conta/${acao}`, {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify(corpo),
    redirect: "error",
  });
  const resultado = await resposta.json();
  if (!resposta.ok)
    throw new Error(resultado.detail || "Não foi possível usar o convite.");
  return resultado as T;
}

export function AtivarContaInstitucional() {
  const convite = useRef("");
  const [dados, definirDados] = useState<DadosMfa | null>(null),
    [codigos, definirCodigos] = useState<string[] | null>(null),
    [carregando, definirCarregando] = useState(true),
    [ocupado, definirOcupado] = useState(false),
    [erro, definirErro] = useState("");
  useEffect(() => {
    const fragmento = window.location.hash.slice(1);
    // O fragmento sai da barra de endereços antes de qualquer requisição.
    window.history.replaceState(null, "", window.location.pathname);
    if (!/^[A-Za-z0-9_-]{43}$/.test(fragmento)) {
      definirCarregando(false);
      return;
    }
    convite.current = fragmento;
    chamar<DadosMfa>("convite", { convite: fragmento })
      .then(definirDados)
      .catch((falha: Error) => definirErro(falha.message))
      .finally(() => definirCarregando(false));
  }, []);
  async function ativar(evento: FormEvent<HTMLFormElement>) {
    evento.preventDefault();
    if (ocupado) return;
    const formulario = evento.currentTarget,
      campos = new FormData(formulario);
    if (campos.get("senha") !== campos.get("confirmacao")) {
      definirErro("As senhas precisam ser iguais.");
      return;
    }
    definirOcupado(true);
    definirErro("");
    try {
      const resultado = await chamar<{ codigosRecuperacao: string[] }>(
        "ativar",
        {
          convite: convite.current,
          senha: campos.get("senha"),
          codigoMfa: campos.get("codigoMfa"),
        },
      );
      convite.current = "";
      definirCodigos(resultado.codigosRecuperacao);
      formulario.reset();
    } catch (falha) {
      definirErro(
        falha instanceof Error ? falha.message : "Verifique sua conexão.",
      );
    } finally {
      definirOcupado(false);
    }
  }
  return (
    <main id="conteudo" className="panel padded spaced ativar-conta-portal">
      <header>
        <MarcaViva />
        <h1>Ativar conta profissional</h1>
      </header>
      {erro && <p role="alert" className="aviso-acesso">{erro}</p>}
      {codigos ? (
        <div className="care-form">
          <h2>Conta ativada</h2>
          <p>
            Guarde estes códigos de recuperação em local seguro. Cada um entra
            uma única vez no lugar do autenticador, e eles não serão mostrados
            de novo.
          </p>
          <ul aria-label="Códigos de recuperação">
            {codigos.map((codigo) => (
              <li key={codigo}>
                <code>{codigo}</code>
              </li>
            ))}
          </ul>
          <a className="button button-primary" href="/">
            Entrar no portal
          </a>
        </div>
      ) : dados ? (
        <form onSubmit={ativar} className="care-form">
          <p>
            Conta: <strong>{dados.email}</strong>
          </p>
          <h2>1. Configure o autenticador</h2>
          <p>
            No Google Authenticator, Microsoft Authenticator ou aplicativo
            equivalente, adicione uma conta e digite esta chave. No celular,
            você também pode{" "}
            <a href={dados.uri}>abrir direto no autenticador</a>.
          </p>
          <p>
            <code aria-label="Chave do autenticador">{dados.segredo}</code>
          </p>
          <h2>2. Crie sua senha</h2>
          <label>
            Senha, com pelo menos 12 caracteres
            <input
              name="senha"
              type="password"
              autoComplete="new-password"
              required
              minLength={12}
              maxLength={72}
              disabled={ocupado}
            />
          </label>
          <label>
            Repita a senha
            <input
              name="confirmacao"
              type="password"
              autoComplete="new-password"
              required
              minLength={12}
              maxLength={72}
              disabled={ocupado}
            />
          </label>
          <h2>3. Confirme</h2>
          <label>
            Código de 6 números do autenticador
            <input
              name="codigoMfa"
              inputMode="numeric"
              autoComplete="one-time-code"
              pattern="[0-9]{6}"
              required
              maxLength={6}
              disabled={ocupado}
            />
          </label>
          <button className="button button-primary" disabled={ocupado}>
            {ocupado ? "Ativando…" : "Ativar minha conta"}
          </button>
        </form>
      ) : (
        !carregando &&
        !erro && (
          <p>
            Abra o link completo recebido do administrador. Convites usados ou
            expirados precisam ser reemitidos.
          </p>
        )
      )}
      {carregando && <p role="status">Conferindo convite…</p>}
    </main>
  );
}
