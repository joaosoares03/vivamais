import { expect, test } from "@playwright/test";

test("acesso anônimo não abre o portal nem a lista de pacientes", async ({
  page,
}) => {
  for (const path of [
    "/painel",
    "/pacientes",
    "/pacientes/novo",
    "/consultas",
    "/relatorios",
    "/configuracoes",
  ]) {
    await page.goto(path);
    await expect(page).toHaveURL(/\/\?sessao=necessaria$/);
    await expect(
      page.getByRole("heading", { name: "Acesso do Profissional" }),
    ).toBeVisible();
    await expect(page.getByLabel("Senha", { exact: true })).toHaveAttribute(
      "type",
      "password",
    );
  }
});

test("rotas públicas informam pendências e não simulam envio de exclusão", async ({
  page,
}) => {
  for (const [path, heading] of [
    ["/privacidade", "Privacidade"],
    ["/suporte", "Ajuda e suporte"],
    ["/exclusao-de-conta", "Exclusão de conta e dados"],
  ]) {
    await page.goto(path);
    await expect(
      page.getByRole("heading", { name: heading, exact: true }),
    ).toBeVisible();
    await expect(
      page.getByText("INFORMAÇÕES DO SERVIÇO", { exact: true }),
    ).toBeVisible();
  }
  await expect(page.locator("form")).toHaveCount(0);
  await expect(
    page.getByText("Esta página não envia nem registra solicitações.", {
      exact: false,
    }),
  ).toBeVisible();
});

test("BFF rejeita tentativas de login e saída com origem externa", async ({
  request,
}) => {
  const login = await request.post("/api/session", {
    headers: { Origin: "https://foreign.example.org" },
    form: { email: "synthetic@example.org", password: "synthetic-test-input" },
  });
  expect(login.status()).toBe(403);
  expect(login.headers()["set-cookie"]).toBeUndefined();
  const logout = await request.post("/api/logout", {
    headers: { Origin: "https://foreign.example.org" },
  });
  expect(logout.status()).toBe(403);
});

test("profissional entra, consulta dados reais autorizados e encerra a sessão", async ({
  page,
  context,
}) => {
  const password = process.env.E2E_PASSWORD;
  test.skip(
    !password,
    "Defina E2E_PASSWORD fora do repositório para executar o fluxo com a API real.",
  );
  const email =
    process.env.E2E_PROFESSIONAL_EMAIL ||
    "profissional.a@demo.vivamais.invalid";
  const browserErrors: string[] = [];
  page.on("pageerror", (error) => browserErrors.push(error.message));
  await page.goto("/");
  await page.getByLabel("E-mail institucional").fill(email);
  await page.getByLabel("Senha", { exact: true }).fill(password!);
  const submittedRequest = page.waitForRequest(
    (request) =>
      new URL(request.url()).pathname === "/api/session" &&
      request.method() === "POST",
  );
  await page
    .getByRole("button", { name: "Entrar na plataforma", exact: true })
    .click();
  const submittedOrigin = (await submittedRequest).headers().origin;
  expect(submittedOrigin).toBe(new URL(page.url()).origin);
  await expect(page).toHaveURL(/\/painel$/);
  await expect(
    page.getByRole("heading", { name: "Pacientes e últimas medições" }),
  ).toBeVisible();
  await expect(
    page.getByLabel("Indicadores da unidade", { exact: true }),
  ).toBeVisible();
  const cookie = (await context.cookies()).find(
    (value) => value.name === "viva_session",
  );
  expect(cookie?.httpOnly).toBe(true);
  expect(cookie?.sameSite).toBe("Strict");
  if (process.env.E2E_PRODUCTION === "true") expect(cookie?.secure).toBe(true);
  expect(
    await page.evaluate(() => document.cookie.includes("viva_session")),
  ).toBe(false);
  expect(await page.evaluate(() => localStorage.length)).toBe(0);
  await page
    .getByRole("link", { name: "Lista de pacientes", exact: true })
    .click();
  await expect(page).toHaveURL(/\/pacientes$/);
  await expect(
    page.getByRole("heading", { name: "Lista de pacientes", exact: true }),
  ).toBeVisible();
  const patientLink = page.locator(".celula-paciente a").first();
  await expect(patientLink).toBeVisible();
  await patientLink.click();
  await expect(page).toHaveURL(/\/pacientes\/[0-9a-f-]{36}$/);
  await expect(
    page.getByText("FICHA DE IDENTIFICAÇÃO", { exact: true }),
  ).toBeVisible();
  await expect(
    page.getByText("Acesso autorizado", { exact: true }),
  ).toBeVisible();
  await expect(
    page.getByRole("tab", { name: "Visão geral", exact: true }),
  ).toHaveAttribute("aria-selected", "true");
  await page
    .getByRole("tab", { name: "Pressão arterial", exact: true })
    .click();
  await expect(
    page.getByRole("heading", { name: "Histórico da pressão", exact: true }),
  ).toBeVisible();
  await page.getByRole("button", { name: "Sair", exact: true }).click();
  await expect(page).toHaveURL(/\/\?saida=confirmada$/);
  await expect(
    page.getByText("Sessão encerrada com segurança.", { exact: true }),
  ).toBeVisible();
  expect(
    (await context.cookies()).some((value) => value.name === "viva_session"),
  ).toBe(false);
  await page.goto("/pacientes");
  await expect(page).toHaveURL(/\/\?sessao=necessaria$/);
  expect(browserErrors).toEqual([]);
});
