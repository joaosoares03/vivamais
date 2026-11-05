import "server-only";
import { cache } from "react";
import { cookies } from "next/headers";
import { redirect } from "next/navigation";
import type { UsuarioSessao } from "@viva/contracts";
import { podeAcessarPortal } from "./validacoes";

export const SESSION_COOKIE = "viva_session";

export class ErroApi extends Error {
  /** Alias técnico do código HTTP para consumidores do contrato anterior. */
  get status() {
    return this.estadoResposta;
  }
  constructor(
    public readonly estadoResposta: number,
    public readonly detail: string,
  ) {
    super(detail);
    this.name = "ApiError";
  }
}

export function enderecoApi(): string {
  const url = new URL(process.env.API_BASE_URL || "http://127.0.0.1:8080");
  if (
    process.env.NODE_ENV === "production" &&
    url.protocol !== "https:" &&
    !["localhost", "127.0.0.1"].includes(url.hostname)
  ) {
    throw new Error("API_BASE_URL exige HTTPS no ambiente de demonstração.");
  }
  return url.origin;
}

export async function requisicaoApi<T>(
  caminho: string,
  opcoes: {
    token?: string;
    method?: "GET" | "POST" | "PUT" | "DELETE";
    body?: unknown;
  } = {},
): Promise<T> {
  let resposta: Response;
  try {
    resposta = await fetch(`${enderecoApi()}/api/v1${caminho}`, {
      method: opcoes.method || "GET",
      headers: {
        Accept: "application/json",
        ...(opcoes.body ? { "Content-Type": "application/json" } : {}),
        ...(opcoes.token ? { Authorization: `Bearer ${opcoes.token}` } : {}),
      },
      body: opcoes.body ? JSON.stringify(opcoes.body) : undefined,
      cache: "no-store",
      redirect: "error",
      // A criação do grupo inclui dados fictícios e foto privada, além da conta.
      signal: AbortSignal.timeout(caminho === "/grupo-testes" && opcoes.method === "POST" ? 60_000 : 10_000),
    });
  } catch {
    throw new ErroApi(
      503,
      "Não foi possível conectar ao serviço. Verifique a conexão e tente novamente.",
    );
  }
  if (!resposta.ok) {
    const details: Record<number, string> = {
      400: "Confira as informações enviadas.",
      401: "A sessão expirou. Entre novamente.",
      403: "Sua conta não tem permissão para acessar este recurso.",
      404: "Este registro não foi encontrado ou não está disponível para sua conta.",
      409: "Este registro já existe ou foi alterado. Atualize a página e confira os dados.",
      413: "O arquivo ou formulário ultrapassa o tamanho permitido.",
      415: "O formato enviado não é permitido.",
      429: "Muitas tentativas. Aguarde um pouco antes de tentar novamente.",
    };
    // Não retransmitir mensagens internas, SQL ou conteúdo sensível de uma falha do backend.
    throw new ErroApi(
      resposta.status,
      details[resposta.status] ||
        "Não foi possível concluir esta solicitação. Tente novamente.",
    );
  }
  if (resposta.status === 204) return undefined as T;
  return resposta.json() as Promise<T>;
}

export const buscarSessao = cache(
  async (): Promise<{ user: UsuarioSessao; token: string }> => {
    const token = (await cookies()).get(SESSION_COOKIE)?.value;
    if (!token) redirect("/?sessao=necessaria");
    try {
      const user = await requisicaoApi<UsuarioSessao>("/auth/me", {
        token: token,
      });
      if (!podeAcessarPortal(user.role)) redirect("/?perfil=paciente");
      return { user, token: token };
    } catch (erro) {
      if (erro instanceof ErroApi && erro.estadoResposta === 401)
        redirect("/?sessao=expirada");
      throw erro;
    }
  },
);

export async function requisicaoAutenticada<T>(caminho: string): Promise<T> {
  const { token: token } = await buscarSessao();
  try {
    return await requisicaoApi<T>(caminho, { token: token });
  } catch (erro) {
    if (erro instanceof ErroApi && erro.estadoResposta === 401)
      redirect("/?sessao=expirada");
    throw erro;
  }
}
