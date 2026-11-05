const fs = require("node:fs");
const path = require("node:path");
const { createRequire } = require("node:module");
const assert = require("node:assert/strict");
const raiz = path.resolve(__dirname, "../..");
const carregar = createRequire(path.join(raiz, "package.json"));
const { chromium } = carregar("@playwright/test");
const origem = "https://vivamais-portal-viva-mais3.vercel.app";
const saida = path.join(raiz, "docs/evidencias/nuvem-2026-11-04");
(async () => {
  fs.mkdirSync(saida, { recursive: true });
  const navegador = await chromium.launch({ headless: true });
  try {
    const pagina = await navegador.newPage({
      viewport: { width: 1440, height: 960 },
    });
    const erros = [];
    pagina.on("pageerror", () => erros.push("erro-javascript"));
    const resposta = await pagina.goto(origem, { waitUntil: "networkidle" });
    assert.equal(resposta.status(), 200);
    assert.match(resposta.headers()["content-security-policy"], /nonce-/);
    await pagina
      .getByLabel("E-mail institucional")
      .waitFor({ state: "visible" });
    await pagina
      .getByRole("button", { name: "Entrar na plataforma", exact: true })
      .waitFor({ state: "visible" });
    await pagina.screenshot({
      path: path.join(saida, "portal-login-1440.png"),
      fullPage: true,
    });
    await pagina.setViewportSize({ width: 390, height: 844 });
    await pagina.screenshot({
      path: path.join(saida, "portal-login-390.png"),
      fullPage: true,
    });
    assert.ok(
      await pagina.evaluate(
        () => document.documentElement.scrollWidth <= window.innerWidth + 1,
      ),
    );
    await pagina.goto(origem + "/painel");
    assert.equal(new URL(pagina.url()).pathname, "/");
    const csrf = await pagina.request.post(origem + "/api/session", {
      headers: { Origin: "https://origem-invalida.example" },
      form: {
        email: "nao-usado@demo.invalid",
        password: require("node:crypto").randomUUID(),
      },
    });
    assert.equal(csrf.status(), 403);
    assert.equal(erros.length, 0);
    const relatorio = {
      quando: new Date().toISOString(),
      origem,
      alvo: "staging",
      paginasPublicas: true,
      loginRenderizado: true,
      larguras: [1440, 390],
      semOverflow390: true,
      rotaProtegida: true,
      csrfOrigemInvalida: 403,
      errosJavascript: erros.length,
      loginAutenticadoTestado: false,
    };
    fs.writeFileSync(
      path.join(saida, "portal-publico.json"),
      JSON.stringify(relatorio, null, 2),
    );
    console.log(JSON.stringify(relatorio));
  } finally {
    await navegador.close();
  }
})().catch((erro) => {
  console.error(String(erro.message).slice(0, 650));
  console.error(
    "Verificacao visual/publica do portal falhou. Login autenticado nao declarado.",
  );
  process.exitCode = 1;
});
