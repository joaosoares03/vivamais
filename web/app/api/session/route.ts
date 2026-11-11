import { NextRequest, NextResponse } from "next/server";
import type { RespostaAutenticacao } from "@viva/contracts";
import { ErroApi, requisicaoApi, SESSION_COOKIE } from "@/services/api";
import {
  podeAcessarPortal,
  origemPermitida,
  parseLogin,
  origemPublica,
} from "@/services/validacoes";

export const dynamic = "force-dynamic";

function loginRedirect(requisicao: NextRequest, reason: string) {
  const resposta = NextResponse.redirect(
    new URL(
      `/?erro=${reason}`,
      origemPublica(
        requisicao.url,
        requisicao.headers.get("host"),
        process.env.APP_ORIGIN,
      ),
    ),
    303,
  );
  resposta.headers.set("Cache-Control", "no-store");
  return resposta;
}

export async function POST(requisicao: NextRequest) {
  const origin = origemPublica(
    requisicao.url,
    requisicao.headers.get("host"),
    process.env.APP_ORIGIN,
  );
  if (!origemPermitida(requisicao.headers.get("origin"), origin)) {
    return NextResponse.json(
      { detail: "Origem da solicitação não permitida." },
      { status: 403, headers: { "Cache-Control": "no-store" } },
    );
  }
  const contentType = requisicao.headers.get("content-type") || "";
  if (!contentType.startsWith("application/x-www-form-urlencoded")) {
    return NextResponse.json(
      { detail: "Formato de formulário não permitido." },
      { status: 415 },
    );
  }
  if (Number(requisicao.headers.get("content-length") || "0") > 4096) {
    return NextResponse.json(
      { detail: "Solicitação muito grande." },
      { status: 413 },
    );
  }
  let formulario: URLSearchParams;
  try {
    // Limite também no stream: Content-Length não é confiável e pode estar ausente.
    const reader = requisicao.body?.getReader();
    if (!reader) return loginRedirect(requisicao, "dados");
    const chunks: Uint8Array[] = [];
    let length = 0;
    while (true) {
      const { done: concluido, value: valor } = await reader.read();
      if (concluido) break;
      length += valor.byteLength;
      if (length > 4096) {
        await reader.cancel();
        return NextResponse.json(
          { detail: "Solicitação muito grande." },
          { status: 413 },
        );
      }
      chunks.push(valor);
    }
    const bytes = new Uint8Array(length);
    let offset = 0;
    for (const chunk of chunks) {
      bytes.set(chunk, offset);
      offset += chunk.byteLength;
    }
    formulario = new URLSearchParams(new TextDecoder().decode(bytes));
  } catch {
    return loginRedirect(requisicao, "dados");
  }
  if (
    formulario.getAll("email").length !== 1 ||
    formulario.getAll("password").length !== 1
  )
    return loginRedirect(requisicao, "dados");
  const entrada = parseLogin({
    email: formulario.get("email"),
    password: formulario.get("password"),
    codigoMfa: formulario.get("codigoMfa"),
  });
  if (!entrada) return loginRedirect(requisicao, "dados");
  try {
    const auth = await requisicaoApi<RespostaAutenticacao>("/auth/login", {
      method: "POST",
      body: entrada,
    });
    if (!podeAcessarPortal(auth.user.role)) {
      await requisicaoApi<void>("/auth/logout", {
        method: "POST",
        token: auth.accessToken,
      });
      return loginRedirect(requisicao, "perfil");
    }
    const resposta = NextResponse.redirect(new URL("/painel", origin), 303);
    resposta.headers.set("Cache-Control", "no-store");
    resposta.cookies.set(SESSION_COOKIE, auth.accessToken, {
      httpOnly: true,
      sameSite: "strict",
      secure: process.env.NODE_ENV === "production",
      path: "/",
      expires: new Date(auth.expiresAt),
    });
    return resposta;
  } catch (erro) {
    const reason =
      erro instanceof ErroApi
        ? erro.estadoResposta === 401
          ? "credenciais"
          : erro.estadoResposta === 429
            ? "limite"
            : "conexao"
        : "conexao";
    return loginRedirect(requisicao, reason);
  }
}
