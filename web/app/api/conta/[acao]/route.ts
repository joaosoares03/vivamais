import { NextRequest, NextResponse } from "next/server";
import { ErroApi, requisicaoApi } from "@/services/api";
import { origemPermitida, origemPublica } from "@/services/validacoes";

const cabecalhos = { "Cache-Control": "no-store" };
const responder = (detail: string, status: number) =>
  NextResponse.json({ detail }, { status, headers: cabecalhos });

export async function POST(
  requisicao: NextRequest,
  { params }: { params: Promise<{ acao: string }> },
) {
  const { acao } = await params;
  if (acao !== "convite" && acao !== "ativar")
    return responder("Rota não permitida.", 404);
  if (
    !origemPermitida(
      requisicao.headers.get("origin"),
      origemPublica(
        requisicao.url,
        requisicao.headers.get("host"),
        process.env.APP_ORIGIN,
      ),
    )
  )
    return responder("Origem não permitida.", 403);
  if (!requisicao.headers.get("content-type")?.startsWith("application/json"))
    return responder("Use JSON.", 415);
  const texto = await requisicao.text();
  if (texto.length > 2048) return responder("Formulário muito grande.", 413);
  let dados: unknown;
  try {
    dados = JSON.parse(texto);
  } catch {
    return responder("Confira o convite.", 400);
  }
  try {
    const resultado = await requisicaoApi<unknown>(`/auth/conta/${acao}`, {
      method: "POST",
      body: dados,
    });
    return NextResponse.json(resultado, { headers: cabecalhos });
  } catch (falha) {
    if (falha instanceof ErroApi)
      return responder(falha.message, falha.estadoResposta);
    return responder("Serviço indisponível. Tente novamente.", 503);
  }
}
