import { NextRequest, NextResponse } from "next/server";
import { ErroApi, requisicaoApi } from "@/services/api";
import { origemPermitida, origemPublica } from "@/services/validacoes";
export async function POST(requisicao: NextRequest) {
  const cabecalhos = { "Cache-Control": "no-store" };
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
    return NextResponse.json(
      { detail: "Origem não permitida." },
      { status: 403, headers: cabecalhos },
    );
  if (!requisicao.headers.get("content-type")?.startsWith("application/json"))
    return NextResponse.json(
      { detail: "Use JSON." },
      { status: 415, headers: cabecalhos },
    );
  const leitor = requisicao.body?.getReader();
  let total = 0;
  const partes: Uint8Array[] = [];
  if (!leitor)
    return NextResponse.json(
      { detail: "Confira o convite." },
      { status: 400, headers: cabecalhos },
    );
  while (true) {
    const parte = await leitor.read();
    if (parte.done) break;
    total += parte.value.length;
    if (total > 2048) {
      await leitor.cancel();
      return NextResponse.json(
        { detail: "Formulário muito grande." },
        { status: 413, headers: cabecalhos },
      );
    }
    partes.push(parte.value);
  }
  try {
    const bytes = new Uint8Array(total);
    let posicao = 0;
    for (const parte of partes) {
      bytes.set(parte, posicao);
      posicao += parte.length;
    }
    const dados = JSON.parse(new TextDecoder().decode(bytes));
    if (
      typeof dados.convite !== "string" ||
      !/^[A-Za-z0-9_-]{43}$/.test(dados.convite) ||
      typeof dados.senha !== "string" ||
      dados.senha.length < 12 ||
      new TextEncoder().encode(dados.senha).length > 72
    )
      return NextResponse.json(
        {
          detail:
            "Confira o convite e use uma senha de 12 a 72 caracteres (até 72 bytes).",
        },
        { status: 400, headers: cabecalhos },
      );
    const resultado = await requisicaoApi("/auth/grupo/ativar-profissional", {
      method: "POST",
      body: { convite: dados.convite, senha: dados.senha },
    });
    return NextResponse.json(resultado, { headers: cabecalhos });
  } catch (falha) {
    return NextResponse.json(
      {
        detail:
          falha instanceof ErroApi
            ? falha.detail
            : "Confira o formulário e tente novamente.",
      },
      {
        status: falha instanceof ErroApi ? falha.status : 400,
        headers: cabecalhos,
      },
    );
  }
}
