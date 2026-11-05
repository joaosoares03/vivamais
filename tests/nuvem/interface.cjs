const fs = require("node:fs"),
  path = require("node:path"),
  crypto = require("node:crypto");
const { createRequire } = require("node:module");
const raiz = path.resolve(__dirname, "../..");
const { chromium, expect } = createRequire(path.join(raiz, "package.json"))(
  "@playwright/test",
);
const senha =
  process.env.VIVA_NUVEM_SENHA ||
  JSON.parse(
    fs.readFileSync(path.join(raiz, ".local/nuvem/credenciais.json"), "utf8"),
  ).senhaInicial;
const portal = "https://vivamais-portal-viva-mais3.vercel.app",
  app = "https://viva-api-paciente-homologacao.up.railway.app";
const saida = path.join(raiz, "docs/evidencias/nuvem-2026-11-04");
let etapa = "iniciar navegador",
  navegador;
function cpf() {
  const n = Array.from({ length: 9 }, () => crypto.randomInt(10));
  for (const m of [9, 10]) {
    const r = 11 - (n.reduce((s, v, i) => s + v * (m + 1 - i), 0) % 11);
    n.push(r >= 10 ? 0 : r);
  }
  return n.join("");
}
(async () => {
  fs.mkdirSync(saida, { recursive: true });
  navegador = await chromium.launch({ headless: true });
  const contexto = await navegador.newContext({
    viewport: { width: 1440, height: 1000 },
    locale: "pt-BR",
    timezoneId: "America/Sao_Paulo",
  });
  const pagina = await contexto.newPage();
  const erros = [];
  pagina.on("pageerror", () => erros.push("portal"));
  etapa = "login profissional pelo portal";
  await pagina.goto(portal);
  await pagina
    .getByLabel("E-mail institucional")
    .fill("profissional.a@demo.vivamais.invalid");
  await pagina.getByLabel("Senha", { exact: true }).fill(senha);
  await pagina
    .getByRole("button", { name: "Entrar na plataforma", exact: true })
    .click();
  await pagina.waitForURL("**/painel", { timeout: 45000 });
  const cookie = (await contexto.cookies()).find(
    (c) => c.name === "viva_session",
  );
  expect(
    cookie?.httpOnly && cookie?.secure && cookie?.sameSite === "Strict",
  ).toBeTruthy();
  await pagina.screenshot({
    path: path.join(saida, "portal-painel-autenticado-1440.png"),
    fullPage: true,
  });
  etapa = "cadastro pelo formulario";
  await pagina.goto(portal + "/pacientes/novo");
  await pagina
    .locator('[name="displayName"]')
    .fill("Ensaio visual DEMO " + crypto.randomUUID().slice(0, 8));
  await pagina.locator('[name="cpf"]').fill(cpf());
  await pagina
    .getByLabel("Data de nascimento", { exact: true })
    .fill("01/01/1950");
  await pagina.locator('[name="telefone"]').fill("11990000002");
  const gravado = pagina.waitForResponse(
    (r) =>
      r.url().endsWith("/api/domain/patients") &&
      r.request().method() === "POST",
  );
  await pagina
    .getByRole("button", { name: "Salvar paciente", exact: true })
    .click();
  const cadastro = await gravado;
  expect(cadastro.status()).toBe(200);
  const dados = await cadastro.json();
  const id = dados.patient.id;
  expect(dados.acesso.estado).toBe("TESTE_POR_CONVITE");
  etapa = "plano sintetico pela API do portal";
  const hoje = new Intl.DateTimeFormat("en-CA", {
    timeZone: "America/Sao_Paulo",
    year: "numeric",
    month: "2-digit",
    day: "2-digit",
  }).format(new Date());
  const plano = await pagina.request.post(
    portal + `/api/domain/patients/${id}/medications`,
    {
      headers: { Origin: portal },
      data: {
        name: "Plano ficticio do ensaio visual",
        instruction: "Exemplo sintetico sem uso clinico",
        dosagem: "Exemplo para teste",
        startsOn: hoje,
        timeZone: "America/Sao_Paulo",
        schedules: ["08:00", "20:00"],
      },
    },
  );
  expect(plano.status()).toBe(200);
  etapa = "emissao de convite pela interface";
  await pagina
    .getByLabel("Sua senha profissional", { exact: true })
    .fill(senha);
  await pagina
    .getByRole("button", { name: "Criar convite privado", exact: true })
    .click();
  const campo = pagina.getByLabel("Link privado para iPhone e navegador", {
    exact: true,
  });
  await expect(campo).toBeVisible({ timeout: 30000 });
  const convite = await campo.inputValue();
  expect(convite.startsWith(app + "/convite#")).toBeTruthy();
  await pagina.goto(portal + "/painel");
  const paciente = await navegador.newContext({
    viewport: { width: 390, height: 844 },
    locale: "pt-BR",
    timezoneId: "America/Sao_Paulo",
  });
  const tela = await paciente.newPage();
  tela.on("pageerror", () => erros.push("paciente"));
  etapa = "entrada do paciente por convite";
  await tela.goto(convite);
  await expect(tela.getByTestId("convite-input")).toHaveValue(
    /[A-Za-z0-9_-]{43}/,
  );
  expect(new URL(tela.url()).hash).toBe("");
  await tela.getByRole("button", { name: "ENTRAR", exact: true }).click();
  await tela.waitForURL("**/inicio", { timeout: 45000 });
  await tela.screenshot({
    path: path.join(saida, "paciente-inicio-390.png"),
    fullPage: true,
  });
  etapa = "medicamentos conectados na interface";
  await tela.getByTestId("module-medications").click();
  await expect(
    tela.getByText("Plano ficticio do ensaio visual", { exact: true }).first(),
  ).toBeVisible({ timeout: 30000 });
  await tela
    .getByRole("button", { name: "Tomei este medicamento", exact: true })
    .first()
    .click();
  await expect(
    tela.getByText("Registrado como tomado", { exact: true }),
  ).toBeVisible({ timeout: 30000 });
  await tela.screenshot({
    path: path.join(saida, "paciente-medicamentos-390.png"),
    fullPage: true,
  });
  etapa = "reabertura e renovacao de sessao";
  await tela.reload();
  await expect(
    tela.getByText("Registrado como tomado", { exact: true }),
  ).toBeVisible({ timeout: 30000 });
  expect(
    await tela.evaluate(
      () => document.documentElement.scrollWidth <= window.innerWidth + 1,
    ),
  ).toBeTruthy();
  etapa = "consulta do mesmo relato no portal";
  await pagina.goto(portal + "/pacientes/" + id);
  await pagina.getByRole("tab", { name: "Medicamentos", exact: true }).click();
  await expect(
    pagina
      .getByText("Plano ficticio do ensaio visual", { exact: true })
      .first(),
  ).toBeVisible({ timeout: 30000 });
  await pagina.screenshot({
    path: path.join(saida, "portal-medicamentos-conectado-1440.png"),
    fullPage: true,
  });
  expect(erros.length).toBe(0);
  const resultado = {
    quando: new Date().toISOString(),
    portal,
    app,
    paciente: id,
    aprovado: true,
    loginProfissional: true,
    cadastroFormulario: true,
    conviteInterface: true,
    cookieSeguro: true,
    fragmentoRemovido: true,
    autorrelatoInterface: true,
    reaberturaSessao: true,
    consultaPortal: true,
    larguraPaciente: 390,
    errosJavascript: erros.length,
    aparelhoFisico: false,
  };
  fs.writeFileSync(
    path.join(saida, "interface-autenticada.json"),
    JSON.stringify(resultado, null, 2),
  );
  console.log(JSON.stringify(resultado));
})()
  .catch((erro) => {
    const mensagem = String(erro.message)
      .replaceAll(senha, "[REDACTED]")
      .replace(/[A-Za-z0-9_-]{43}/g, "[REDACTED]")
      .slice(0, 1100);
    fs.writeFileSync(
      path.join(raiz, ".local/nuvem/validacao-ui-falha.json"),
      JSON.stringify({ etapa, mensagem, aprovado: false }, null, 2),
    );
    console.error(
      "Ensaio de interface interrompido: " +
        etapa +
        ". Diagnostico privado salvo.",
    );
    process.exitCode = 1;
  })
  .finally(async () => {
    await navegador?.close();
  });
