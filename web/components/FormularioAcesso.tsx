"use client";

import { useState } from "react";
import { Icone } from "./Icones";

export function FormularioAcesso({
  exigirCodigo = false,
}: {
  exigirCodigo?: boolean;
}) {
  const [visivel, definirVisivel] = useState(false);
  const [pendentes, definirPendentes] = useState(false);
  return (
    <form
      action="/api/session"
      method="post"
      onSubmit={() => definirPendentes(true)}
      className="login-form"
    >
      <div className="field">
        <label htmlFor="email">E-mail institucional</label>
        <input
          id="email"
          name="email"
          type="email"
          autoComplete="username"
          autoCapitalize="none"
          required
          maxLength={254}
          placeholder="seu.nome@instituicao.edu.br"
        />
      </div>
      <div className="field">
        <label htmlFor="password">Senha</label>
        <div className="password-field">
          <input
            id="password"
            name="password"
            type={visivel ? "text" : "password"}
            autoComplete="current-password"
            required
            maxLength={128}
          />
          <button
            type="button"
            className="password-toggle"
            onClick={() => definirVisivel(!visivel)}
            aria-label={visivel ? "Ocultar senha" : "Mostrar senha"}
            aria-pressed={visivel}
          >
            {visivel ? "Ocultar" : "Mostrar"}
          </button>
        </div>
      </div>
      {exigirCodigo && (
        <div className="field">
          <label htmlFor="codigoMfa">
            Código do autenticador ou de recuperação
          </label>
          <input
            id="codigoMfa"
            name="codigoMfa"
            autoComplete="one-time-code"
            autoCapitalize="none"
            required
            maxLength={32}
          />
        </div>
      )}
      <p className="form-hint">
        Use a conta individual fornecida pela equipe do projeto.
      </p>
      <button
        className="button button-primary login-submit"
        type="submit"
        disabled={pendentes}
        aria-busy={pendentes}
        aria-label="Entrar na plataforma"
      >
        {pendentes ? "Entrando…" : "Entrar"}
      </button>
      <p className="secure-caption">
        <Icone name="lock" size={16} /> Acesso exclusivo para profissionais
        autorizados
      </p>
    </form>
  );
}
