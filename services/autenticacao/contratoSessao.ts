import { sessaoExpirada } from "../transporteApi";
import type { UsuarioSessao } from "@viva/contracts";

export type OrigemAcessoPaciente = "PACIENTE" | "TESTADOR";

export interface SessaoProtegida {
  accessToken: string;
  expiresAt: string;
  user?: UsuarioSessao;
  /** Metadado local para restaurar a interface; não autoriza acesso no servidor. */
  origemAcesso?: OrigemAcessoPaciente;
}

export interface AcessoProtegidoLido {
  sessao: SessaoProtegida | null;
  origemAcesso: OrigemAcessoPaciente | null;
}

export function interpretarAcessoProtegido(
  valor: string | null,
): AcessoProtegidoLido {
  const vazio = { sessao: null, origemAcesso: null };
  if (!valor) return vazio;
  try {
    const candidato: unknown = JSON.parse(valor);
    if (typeof candidato !== "object" || !candidato) return vazio;
    const sessao = candidato as Partial<SessaoProtegida> & {
      somenteOrigem?: unknown;
    };
    const origemAcesso =
      sessao.origemAcesso === "PACIENTE" || sessao.origemAcesso === "TESTADOR"
        ? sessao.origemAcesso
        : null;
    if (
      sessao.somenteOrigem === true &&
      origemAcesso &&
      Object.keys(candidato).every((chave) =>
        ["somenteOrigem", "origemAcesso"].includes(chave),
      )
    )
      return { sessao: null, origemAcesso };
    if (
      typeof sessao.accessToken !== "string" ||
      !sessao.accessToken ||
      typeof sessao.expiresAt !== "string" ||
      !Number.isFinite(Date.parse(sessao.expiresAt))
    )
      return vazio;
    // Uma sessão expirada nunca autentica ou libera consulta offline. Somente
    // a origem protegida orienta qual renovação deve ser validada pelo servidor.
    if (sessaoExpirada(sessao.expiresAt)) return { sessao: null, origemAcesso };
    const identity = sessao.user;
    const validIdentity =
      identity &&
      typeof identity.id === "string" &&
      /^[a-f0-9-]{36}$/.test(identity.id) &&
      typeof identity.organizationId === "string" &&
      /^[a-f0-9-]{36}$/.test(identity.organizationId) &&
      typeof identity.displayName === "string" &&
      identity.displayName.length <= 160 &&
      typeof identity.email === "string" &&
      identity.email.length <= 254 &&
      ["PATIENT", "PROFESSIONAL", "ADMIN"].includes(identity.role);
    return {
      origemAcesso,
      sessao: {
        accessToken: sessao.accessToken,
        expiresAt: sessao.expiresAt,
        ...(sessao.origemAcesso === "PACIENTE" ||
        sessao.origemAcesso === "TESTADOR"
          ? { origemAcesso: sessao.origemAcesso }
          : {}),
        ...(validIdentity
          ? {
              user: {
                id: identity.id,
                organizationId: identity.organizationId,
                displayName: identity.displayName,
                email: identity.email,
                role: identity.role,
              },
            }
          : {}),
      },
    };
  } catch {
    return vazio;
  }
}

export function interpretarSessaoProtegida(
  valor: string | null,
): SessaoProtegida | null {
  return interpretarAcessoProtegido(valor).sessao;
}
