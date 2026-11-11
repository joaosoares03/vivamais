const fs = require("node:fs"),
  path = require("node:path");
const { createRequire } = require("node:module");
const raiz = path.resolve(__dirname, "../..");
const { chromium, expect } = createRequire(path.join(raiz, "package.json"))(
  "@playwright/test",
);
const origem = "https://viva-api-paciente-homologacao.up.railway.app";
const evidencia = path.join(raiz, "docs/evidencias/nuvem-2026-11-04");
const senha =
  process.env.VIVA_NUVEM_SENHA ||
  JSON.parse(
    fs.readFileSync(path.join(raiz, ".local/nuvem/credenciais.json"), "utf8"),
  ).senhaInicial;
const paciente = JSON.parse(
  fs.readFileSync(path.join(evidencia, "interface-autenticada.json"), "utf8"),
).paciente;
let etapa = "login",
  navegador;
async function api(
  rota,
  token,
  corpo,
  metodo = corpo ? "POST" : "GET",
  esperado = 200,
) {
  const r = await fetch(origem + "/api/v1" + rota, {
    method: metodo,
    headers: {
      ...(token ? { Authorization: "Bearer " + token } : {}),
      ...(corpo ? { "Content-Type": "application/json" } : {}),
    },
    body: corpo ? JSON.stringify(corpo) : undefined,
    signal: AbortSignal.timeout(30000),
  });
  expect(r.status).toBe(esperado);
  return esperado === 204 ? null : r.json();
}
(async () => {
  const token = (
    await api("/auth/login", "", {
      email: "profissional.a@demo.vivamais.invalid",
      password: senha,
    })
  ).accessToken;
  const convite = await api(`/patients/${paciente}/test-invites`, token, {
    senhaProfissional: senha,
    validadeDias: 1,
  });
  navegador = await chromium.launch({ headless: true });
  const contexto = await navegador.newContext({
    viewport: { width: 390, height: 844 },
    timezoneId: "America/Sao_Paulo",
  });
  const tela = await contexto.newPage();
  etapa = "convite para ensaio offline";
  await tela.goto(origem + "/convite#" + convite.convite);
  await expect(tela.getByTestId("convite-input")).toHaveValue(
    /[A-Za-z0-9_-]{43}/,
  );
  await tela.getByRole("button", { name: "ENTRAR", exact: true }).click();
  await tela.waitForURL("**/inicio", { timeout: 45000 });
  await tela.getByTestId("module-medications").click();
  await expect(
    tela.getByText("Registrado como tomado", { exact: true }),
  ).toBeVisible({ timeout: 30000 });
  etapa = "fila de autorrelato offline";
  await contexto.setOffline(true);
  await tela
    .getByRole("button", { name: "Não tomei neste horário", exact: true })
    .click();
  await expect(
    tela.getByText("Resposta aguardando envio protegido."),
  ).toBeVisible({ timeout: 15000 });
  await tela.screenshot({
    path: path.join(evidencia, "paciente-fila-offline-390.png"),
    fullPage: true,
  });
  await contexto.setOffline(false);
  const repetir = tela.getByRole("button", {
    name: "Tentar sincronizar registros",
    exact: true,
  });
  if (await repetir.count()) await repetir.click();
  await expect(
    tela.getByText("Registrado como não tomado", { exact: true }),
  ).toBeVisible({ timeout: 30000 });
  etapa = "reabertura e calendario";
  await tela.reload();
  await expect(
    tela.getByText("Registrado como não tomado", { exact: true }),
  ).toBeVisible({ timeout: 30000 });
  await tela
    .getByRole("button", { name: "Escolher dia no calendário", exact: true })
    .click();
  await expect(
    tela.getByText("Calendário de medicamentos", { exact: true }),
  ).toBeVisible();
  await tela.screenshot({
    path: path.join(evidencia, "paciente-calendario-390.png"),
    fullPage: true,
  });
  const hoje = new Intl.DateTimeFormat("en-CA", {
    timeZone: "America/Sao_Paulo",
    year: "numeric",
    month: "2-digit",
    day: "2-digit",
  }).format(new Date());
  const resumo = (
    await api(
      `/patients/${paciente}/medication-agenda?from=${hoje}&to=${hoje}`,
      token,
    )
  ).dias[0].resumo;
  expect(resumo.tomadas).toBe(1);
  expect(resumo.naoTomadas).toBe(1);
  expect(resumo.pendentes).toBe(0);
  etapa = "consulta e exportacao";
  const consulta = await api(`/patients/${paciente}/consultations`, token, {
    id: require("node:crypto").randomUUID(),
    occurredAt: new Date().toISOString(),
    notes: "Ensaio de consulta ficticia",
    goals: "Verificar integracao",
    carePlan: "Dados sinteticos sem uso clinico",
  });
  expect(consulta.id).toBeTruthy();
  await api(`/patients/${paciente}/export`, token);
  etapa = "revogacao apos ensaio";
  await api(
    `/patients/${paciente}/test-invites/${convite.id}/revoke`,
    token,
    {},
    "POST",
    204,
  );
  await tela.reload();
  await tela.waitForURL("**/convite", { timeout: 30000 });
  await api("/auth/logout", token, {}, "POST", 204);
  const resultado = {
    quando: new Date().toISOString(),
    paciente,
    aprovado: true,
    filaOffline: true,
    sincronizacaoReal: true,
    reabertura: true,
    calendario: true,
    consulta: consulta.id,
    exportacao: true,
    revogacao: true,
    aparelhoFisico: false,
  };
  fs.writeFileSync(
    path.join(evidencia, "offline-e-revogacao.json"),
    JSON.stringify(resultado, null, 2),
  );
  console.log(JSON.stringify(resultado));
})()
  .catch((erro) => {
    const mensagem = String(erro.message)
      .replaceAll(senha, "[REDACTED]")
      .replace(/[A-Za-z0-9_-]{43}/g, "[REDACTED]")
      .slice(0, 1200);
    fs.writeFileSync(
      path.join(raiz, ".local/nuvem/validacao-offline-falha.json"),
      JSON.stringify({ etapa, mensagem }, null, 2),
    );
    console.error("Ensaio offline interrompido: " + etapa);
    process.exitCode = 1;
  })
  .finally(async () => navegador?.close());
