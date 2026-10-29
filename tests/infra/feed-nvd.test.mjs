import assert from "node:assert/strict";
import { test } from "node:test";
import {
  URL_METADADOS_NVD,
  validarMetadadosNvd,
  verificarFeedNvd,
} from "../../infra/verificar-feed-nvd.mjs";

const agora = Date.parse("2026-10-29T15:00:00Z");
const metadados = `lastModifiedDate:2026-10-29T10:00:00-04:00\r\nsize:160000000\r\nzipSize:14000000\r\ngzSize:14000000\r\nsha256:${"A".repeat(64)}\r\n`;

test("aceita metadados recentes com fuso e define chave UTC do cache", () => {
  const resultado = validarMetadadosNvd(metadados, agora);
  assert.equal(resultado.idadeHoras, 1);
  assert.equal(resultado.dia, "2026-10-29");
});
for (const [nome, conteudo] of [
  [
    "feed com mais de 24 horas",
    metadados.replace("2026-10-29T10:00:00-04:00", "2026-10-27T10:00:00Z"),
  ],
  [
    "data futura",
    metadados.replace("2026-10-29T10:00:00-04:00", "2026-10-30T10:00:00Z"),
  ],
  ["data inválida", metadados.replace("2026-10-29T10:00:00-04:00", "invalida")],
  ["hash ausente", metadados.replace(/^sha256:.*$/m, "sha256:")],
  ["tamanho vazio", metadados.replace("gzSize:14000000", "gzSize:0")],
  ["HTML em vez de metadados", "<html>indisponível</html>"],
  ["campo duplicado", metadados + "size:1\n"],
  ["resposta acima do limite", "a".repeat(4097)],
]) {
  test(`recusa ${nome} e bloqueia a auditoria`, () => {
    assert.throws(() => validarMetadadosNvd(conteudo, agora));
  });
}

test("consulta somente HTTPS oficial com prazo e sem redirecionamento", async () => {
  const resultado = await verificarFeedNvd(async (url, opcoes) => {
    assert.equal(url, URL_METADADOS_NVD);
    assert.equal(new URL(url).hostname, "nvd.nist.gov");
    assert.equal(opcoes.redirect, "error");
    assert.ok(opcoes.signal instanceof AbortSignal);
    return new Response(metadados);
  }, agora);
  assert.equal(resultado.idadeHoras, 1);
});

test("HTTP 503 não é convertido em auditoria aprovada", async () => {
  await assert.rejects(
    verificarFeedNvd(
      async () => new Response("indisponível", { status: 503 }),
      agora,
    ),
    /HTTP 503/,
  );
});

test("erro de rede não autoriza usar silenciosamente uma base antiga", async () => {
  await assert.rejects(
    verificarFeedNvd(async () => {
      throw new Error("rede indisponível");
    }, agora),
    /rede indisponível/,
  );
});
