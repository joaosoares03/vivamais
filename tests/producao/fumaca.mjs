// Conferência pós-deploy, só com leitura anônima. Uso:
// PRODUCAO_API=https://... PRODUCAO_PORTAL=https://... node tests/producao/fumaca.mjs
const api = process.env.PRODUCAO_API?.replace(/\/$/, "");
const portal = process.env.PRODUCAO_PORTAL?.replace(/\/$/, "");
if (!api || !portal) throw new Error("Defina PRODUCAO_API e PRODUCAO_PORTAL.");

const falhas = [];
function conferir(nome, aprovado, detalhe = "") {
  console.log(
    `${aprovado ? "ok  " : "FALHA"} ${nome}${detalhe ? ` (${detalhe})` : ""}`,
  );
  if (!aprovado) falhas.push(nome);
}
const pedir = (url, opcoes = {}) =>
  fetch(url, {
    redirect: "manual",
    signal: AbortSignal.timeout(30_000),
    ...opcoes,
  });
const json = {
  method: "POST",
  headers: { "Content-Type": "application/json" },
  body: "{}",
};

const prontidao = await pedir(`${api}/actuator/health/readiness`);
conferir("API pronta", prontidao.status === 200, `HTTP ${prontidao.status}`);
for (const rota of [
  "/actuator/env",
  "/actuator/info",
  "/v3/api-docs",
  "/api/v1/auth/me",
  "/api/v1/patients/search",
]) {
  const resposta = await pedir(api + rota);
  conferir(
    `${rota} exige sessão`,
    [401, 404].includes(resposta.status),
    `HTTP ${resposta.status}`,
  );
}
for (const rota of [
  "/api/v1/auth/testadores/convite",
  "/api/v1/auth/grupo/ativar-profissional",
]) {
  const resposta = await pedir(api + rota, json);
  conferir(
    `${rota} não existe`,
    resposta.status === 404,
    `HTTP ${resposta.status}`,
  );
}
const instalador = await pedir(`${api}/demonstracao/vivamais.apk`);
conferir(
  "instalador LAN não existe",
  instalador.status === 404,
  `HTTP ${instalador.status}`,
);
const forjada = await pedir(`${api}/api/v1/auth/login`, {
  method: "OPTIONS",
  headers: {
    Origin: "https://origem-forjada.invalid",
    "Access-Control-Request-Method": "POST",
  },
});
conferir(
  "CORS recusa origem forjada",
  !forjada.headers.get("access-control-allow-origin"),
);
const aceita = await pedir(`${api}/api/v1/auth/login`, {
  method: "OPTIONS",
  headers: { Origin: portal, "Access-Control-Request-Method": "POST" },
});
conferir(
  "CORS aceita o portal",
  aceita.headers.get("access-control-allow-origin") === portal,
);

const pagina = await pedir(`${portal}/`);
conferir("portal responde", pagina.status === 200, `HTTP ${pagina.status}`);
conferir(
  "portal com CSP",
  (pagina.headers.get("content-security-policy") ?? "").includes(
    "default-src 'self'",
  ),
);
conferir(
  "portal com HSTS",
  Boolean(pagina.headers.get("strict-transport-security")),
);
const html = await pagina.text();
conferir("login pede segundo fator", html.includes("codigoMfa"));
conferir(
  "portal sem aviso de desenvolvimento",
  !html.includes("Ambiente de desenvolvimento"),
);
const painel = await (await pedir(`${portal}/painel`)).text();
conferir("painel exige sessão", painel.includes("sessao=necessaria"));
const formulario = await pedir(`${portal}/api/session`, {
  method: "POST",
  headers: {
    Origin: "https://origem-forjada.invalid",
    "Content-Type": "application/x-www-form-urlencoded",
  },
  body: "email=a%40b.c&password=x",
});
conferir(
  "login recusa origem externa",
  formulario.status === 403,
  `HTTP ${formulario.status}`,
);

if (falhas.length) {
  console.error(`${falhas.length} verificação(ões) falharam.`);
  process.exitCode = 1;
} else console.log("Todas as verificações passaram.");
