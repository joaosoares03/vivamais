const fs = require("node:fs"),
  path = require("node:path"),
  assert = require("node:assert/strict");
const raiz = path.resolve(__dirname, "../..");
const api = "https://viva-api-paciente-homologacao.up.railway.app",
  portal = "https://vivamais-portal-viva-mais3.vercel.app";
(async () => {
  const redirecionamentos = [];
  for (const origem of [api, portal]) {
    const r = await fetch(origem.replace("https:", "http:"), {
      redirect: "manual",
      signal: AbortSignal.timeout(15000),
    });
    assert.ok([301, 302, 307, 308].includes(r.status));
    assert.ok(r.headers.get("location")?.startsWith(origem));
    redirecionamentos.push(r.status);
  }
  const cors = await fetch(api + "/api/v1/auth/testadores/convite", {
    method: "OPTIONS",
    headers: {
      Origin: "https://origem-invalida.example",
      "Access-Control-Request-Method": "POST",
      "Access-Control-Request-Headers": "content-type",
    },
  });
  assert.equal(cors.status, 403);
  assert.notEqual(cors.headers.get("access-control-allow-origin"), "*");
  const n = Array.from({ length: 9 }, () =>
    require("node:crypto").randomInt(10),
  );
  for (const m of [9, 10]) {
    const r = 11 - (n.reduce((s, v, i) => s + v * (m + 1 - i), 0) % 11);
    n.push(r >= 10 ? 0 : r);
  }
  const demo = await fetch(api + "/api/v1/auth/paciente/demonstracao", {
    method: "POST",
    headers: { Origin: api, "Content-Type": "application/json" },
    body: JSON.stringify({
      cpf: n.join(""),
      dataNascimento: "1950-01-01",
      tipo: "WEB",
    }),
  });
  assert.equal(demo.status, 403);
  for (const caminho of [
    "/application.yml",
    "/.env",
    "/paciente-web/index.html",
  ]) {
    const r = await fetch(api + caminho);
    assert.equal(r.status, 401);
  }
  const pagina = await (await fetch(api + "/convite")).text();
  const scripts = Array.from(
    pagina.matchAll(/<script[^>]+src="([^"]+)"/g),
    (m) => new URL(m[1], api),
  );
  assert.ok(scripts.length);
  const privado = path.join(raiz, ".local/nuvem/credenciais.json");
  const conhecidos = fs.existsSync(privado)
    ? Object.values(JSON.parse(fs.readFileSync(privado, "utf8"))).filter(
        (x) => typeof x === "string" && x.length >= 24,
      )
    : [];
  let bytes = 0;
  for (const url of scripts) {
    assert.equal(url.origin, api);
    const texto = await (await fetch(url)).text();
    bytes += Buffer.byteLength(texto);
    assert.ok(!/sb_secret_[A-Za-z0-9_-]{20,}/.test(texto));
    for (const segredo of conhecidos) assert.ok(!texto.includes(segredo));
  }
  const resultado = {
    quando: new Date().toISOString(),
    aprovado: true,
    redirecionamentosHttpParaHttps: redirecionamentos,
    corsForjado: 403,
    loginCpfNascimentoDesativado: 403,
    arquivosConfiguracaoNegados: 3,
    scriptsPropriaOrigem: scripts.length,
    bytesVerificados: bytes,
    chaveStorageNaoEncontradaNoBundle: true,
    segredosPrivadosConhecidosNaoEncontrados: true,
  };
  fs.writeFileSync(
    path.join(raiz, "docs/evidencias/nuvem-2026-11-04/seguranca-publica.json"),
    JSON.stringify(resultado, null, 2),
  );
  console.log(JSON.stringify(resultado));
})().catch(() => {
  console.error(
    "Verificacao publica de seguranca falhou; nenhum segredo exibido.",
  );
  process.exitCode = 1;
});
