"use client";
import { useEffect, useRef, useState, type FormEvent } from "react";
export function AtivarProfissionalTeste() {
  const segredo = useRef("");
  const campoEmail = useRef<HTMLTextAreaElement>(null);
  const [valido, definirValido] = useState(false),
    [erro, definirErro] = useState(""),
    [email, definirEmail] = useState(""),
    [ocupado, definirOcupado] = useState(false);
  const [mensagemCopia, definirMensagemCopia] = useState("");
  useEffect(() => {
    const fragmento = window.location.hash.slice(1);
    // O fragmento é retirado antes de qualquer requisição e nunca é registrado.
    window.history.replaceState(null, "", window.location.pathname);
    if (/^[A-Za-z0-9_-]{43}$/.test(fragmento)) {
      segredo.current = fragmento;
      definirValido(true);
    }
  }, []);
  async function ativar(evento: FormEvent<HTMLFormElement>) {
    evento.preventDefault();
    if (ocupado) return;
    const formulario = evento.currentTarget,
      dados = new FormData(formulario);
    if (dados.get("senha") !== dados.get("confirmacao")) {
      definirErro("As senhas precisam ser iguais.");
      return;
    }
    definirOcupado(true);
    definirErro("");
    try {
      const resposta = await fetch("/api/grupo/ativar-profissional", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          convite: segredo.current,
          senha: dados.get("senha"),
        }),
        redirect: "error",
      });
      const resultado = await resposta.json();
      if (!resposta.ok)
        throw new Error(
          resultado.detail || "Não foi possível ativar o convite.",
        );
      definirEmail(resultado.email);
      segredo.current = "";
      definirValido(false);
      formulario.reset();
    } catch (falha) {
      definirErro(
        falha instanceof Error ? falha.message : "Verifique sua conexão.",
      );
    } finally {
      definirOcupado(false);
    }
  }
  async function copiarEmail() {
    try {
      await navigator.clipboard.writeText(email);
      definirMensagemCopia("E-mail copiado.");
    } catch {
      campoEmail.current?.focus();
      campoEmail.current?.select();
      definirMensagemCopia("Copie manualmente o e-mail selecionado.");
    }
  }
  return (
    <main className="panel padded spaced">
      <h1>Viva+ Profissional · convite de teste</h1>
      <p>
        Use somente dados fictícios. Seu perfil acessa os pacientes atribuídos
        pelo responsável e aqueles que você cadastrar.
      </p>
      {erro && <p role="alert">{erro}</p>}
      {email ? (
        <div className="care-form">
          <h2>Conta ativada</h2>
          <p>
            Use o e-mail abaixo e a senha que você acabou de definir para entrar
            no portal.
          </p>
          <label>
            Identificador de acesso
            <textarea ref={campoEmail} readOnly rows={3} value={email} />
          </label>
          <div>
            <button
              type="button"
              className="button button-secondary"
              onClick={copiarEmail}
            >
              Copiar e-mail
            </button>
            <div role="status">{mensagemCopia}</div>
          </div>
          <a className="button button-primary" href="/">
            Entrar no portal
          </a>
        </div>
      ) : valido ? (
        <form onSubmit={ativar} className="care-form">
          <label>
            Crie sua senha
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
            Repita sua senha
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
          <button className="button button-primary" disabled={ocupado}>
            {ocupado ? "Ativando…" : "Ativar minha conta profissional"}
          </button>
        </form>
      ) : (
        <p>
          Abra o link completo recebido do responsável. Convites usados ou
          expirados precisam ser reemitidos.
        </p>
      )}
    </main>
  );
}
