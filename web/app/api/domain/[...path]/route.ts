import { NextRequest, NextResponse } from "next/server";
import { cookies } from "next/headers";
import {
  ErroApi,
  requisicaoApi,
  enderecoApi,
  SESSION_COOKIE,
} from "@/services/api";
import { origemPermitida, origemPublica } from "@/services/validacoes";

export const dynamic = "force-dynamic";
export const maxDuration = 90;
const uuid = "[0-9a-fA-F-]{36}";
const allowed = new RegExp(
  `^(?:grupo-testes(?:/${uuid}/(?:convite|desativar))?|contas-institucionais(?:/${uuid}/(?:convite|desativar))?|food/status|conta/preferencias|pacientes/${uuid}/(?:dados-pessoais|registros/(?:CONSULTAS|DIARIO)/${uuid}/retificacoes|exportacao/(?:PRESSAO|MEDICAMENTOS|AUTORRELATOS|ALIMENTACAO|ATIVIDADES|DIARIO|CONSULTAS|RETIFICACOES))|patients(?:/search|/${uuid}(?:/(?:readings|medications|medication-events|medication-agenda|test-invites(?:/${uuid}/revoke)?|medication-reports|diary|activities|activity-profile|consultations|summary|export|access-reset|access-status|assignments(?:/revoke)?|device(?:/configurations)?|meals|files))?)?|medications/${uuid}(?:/history)?|files/${uuid}/(?:link|ocr)|meals/${uuid}/analyze|professionals)$`,
);

async function proxy(
  requisicao: NextRequest,
  context: { params: Promise<{ path: string[] }> },
) {
  const caminho = (await context.params).path.join("/");
  if (!allowed.test(caminho))
    return NextResponse.json(
      { detail: "Rota não permitida." },
      { status: 404 },
    );
  if (
    requisicao.method !== "GET" &&
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
      { status: 403 },
    );
  const token = (await cookies()).get(SESSION_COOKIE)?.value;
  if (!token)
    return NextResponse.json({ detail: "Entre novamente." }, { status: 401 });
  try {
    if (
      requisicao.method === "POST" &&
      /^patients\/[a-fA-F0-9-]{36}\/files$/.test(caminho)
    ) {
      if (
        !requisicao.headers
          .get("content-type")
          ?.startsWith("multipart/form-data")
      )
        return NextResponse.json(
          { detail: "Selecione uma imagem." },
          { status: 415 },
        );
      const reader = requisicao.body?.getReader();
      const chunks: Uint8Array[] = [];
      let bytes = 0;
      if (reader)
        while (true) {
          const part = await reader.read();
          if (part.done) break;
          bytes += part.value.length;
          if (bytes > 3145728) {
            await reader.cancel();
            return NextResponse.json(
              { detail: "Use foto com até 2 MB." },
              { status: 413 },
            );
          }
          chunks.push(part.value);
        }
      const payload = new Uint8Array(bytes);
      let offset = 0;
      for (const part of chunks) {
        payload.set(part, offset);
        offset += part.length;
      }
      const resposta = await fetch(`${enderecoApi()}/api/v1/${caminho}`, {
        method: "POST",
        headers: {
          Authorization: `Bearer ${token}`,
          "Content-Type": requisicao.headers.get("content-type")!,
        },
        body: payload,
        cache: "no-store",
        redirect: "error",
        signal: AbortSignal.timeout(20000),
      });
      if (!resposta.ok)
        return NextResponse.json(
          {
            detail:
              resposta.status === 413
                ? "Use foto com até 2 MB."
                : resposta.status === 415
                  ? "Selecione PNG ou JPEG válido."
                  : "Não foi possível enviar a foto.",
          },
          { status: resposta.status },
        );
      return NextResponse.json(await resposta.json(), {
        headers: { "Cache-Control": "no-store" },
      });
    }
    let corpo: unknown;
    if (requisicao.method !== "GET") {
      if (
        !requisicao.headers.get("content-type")?.startsWith("application/json")
      )
        return NextResponse.json({ detail: "Use JSON." }, { status: 415 });
      const reader = requisicao.body?.getReader();
      let bytes = 0;
      const chunks: Uint8Array[] = [];
      if (reader)
        while (true) {
          const item = await reader.read();
          if (item.done) break;
          bytes += item.value.length;
          if (bytes > 32768) {
            await reader.cancel();
            return NextResponse.json(
              { detail: "Formulário muito grande." },
              { status: 413 },
            );
          }
          chunks.push(item.value);
        }
      const all = new Uint8Array(bytes);
      let offset = 0;
      for (const chunk of chunks) {
        all.set(chunk, offset);
        offset += chunk.length;
      }
      try {
        corpo = JSON.parse(new TextDecoder().decode(all));
      } catch {
        return NextResponse.json({ detail: "JSON inválido." }, { status: 400 });
      }
    }
    const resposta = await requisicaoApi<unknown>(
      `/${caminho}${requisicao.nextUrl.search}`,
      {
        token: token,
        method: requisicao.method as "GET" | "POST" | "PUT",
        body: corpo,
      },
    );
    if (resposta === undefined) return new NextResponse(null, { status: 204 });
    return NextResponse.json(resposta, {
      headers: { "Cache-Control": "private, no-store" },
    });
  } catch (erro) {
    const estadoResposta = erro instanceof ErroApi ? erro.estadoResposta : 503;
    return NextResponse.json(
      {
        detail: erro instanceof ErroApi ? erro.detail : "Serviço indisponível.",
      },
      { status: estadoResposta, headers: { "Cache-Control": "no-store" } },
    );
  }
}
export { proxy as GET, proxy as POST, proxy as PUT };
