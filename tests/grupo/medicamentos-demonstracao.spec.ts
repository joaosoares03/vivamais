import { test, expect } from "@playwright/test";
import { randomInt, randomUUID } from "node:crypto";
import { mkdir } from "node:fs/promises";
import path from "node:path";
const api = "http://127.0.0.1:8080/api/v1",
  aplicativo = process.env.E2E_APLICATIVO_DEMO ?? "http://127.0.0.1:8082",
  senha = process.env.E2E_BOOTSTRAP_PASSWORD;
const evidencia = path.resolve("docs/evidencias/medicamentos-grupo-2026-11-04");
function cpfFicticio() {
  const n = Array.from({ length: 9 }, () => randomInt(10));
  for (const m of [9, 10]) {
    const resto = 11 - (n.reduce((s, v, i) => s + v * (m + 1 - i), 0) % 11);
    n.push(resto >= 10 ? 0 : resto);
  }
  return n.join("");
}
test("cadastro sem SMS, doses persistidas, calendário, offline e portal com autoria", async ({
  page,
  context,
  request,
  browser,
}) => {
  expect(
    senha,
    "Informe a credencial sintética pelo ambiente privado",
  ).toBeTruthy();
  await mkdir(evidencia, { recursive: true });
  const autenticacao = await request.post(api + "/auth/login", {
    data: { email: "profissional.a@demo.vivamais.invalid", password: senha },
  });
  expect(autenticacao.status()).toBe(200);
  const token = (await autenticacao.json()).accessToken,
    headers = { Authorization: `Bearer ${token}` };
  const documento = cpfFicticio(),
    nome = "Ensaio sintético de medicamentos " + randomUUID().slice(0, 8);
  await page.goto("/");
  await page
    .getByLabel("E-mail institucional")
    .fill("profissional.a@demo.vivamais.invalid");
  await page.getByLabel("Senha", { exact: true }).fill(senha!);
  await page
    .getByRole("button", { name: "Entrar na plataforma", exact: true })
    .click();
  await expect(page).toHaveURL(/painel/);
  await page.goto("/pacientes/novo");
  await page.locator('[name="displayName"]').fill(nome);
  await page.locator('[name="cpf"]').fill(documento);
  await page
    .getByLabel("Data de nascimento", { exact: true })
    .fill("01/01/1950");
  await page.locator('[name="telefone"]').fill("11990000002");
  const salvo = page.waitForResponse(
    (r) =>
      r.url().endsWith("/api/domain/patients") &&
      r.request().method() === "POST",
  );
  await page.getByRole("button", { name: "Salvar paciente" }).click();
  const cadastro = await (await salvo).json(),
    id = cadastro.patient.id;
  await expect(
    page.getByRole("heading", { name: "Paciente cadastrado com sucesso!" }),
  ).toBeVisible();
  expect(cadastro.acesso.estado).toBe("DEMONSTRACAO_HABILITADA");
  await expect(page.getByRole("button", { name: /SMS/ })).toHaveCount(0);
  await expect(page.getByLabel("Sua senha profissional")).toHaveCount(0);
  await page.screenshot({
    path: path.join(evidencia, "portal-cadastro-sem-sms.png"),
    fullPage: true,
  });
  const hoje = new Intl.DateTimeFormat("en-CA", {
    timeZone: "America/Sao_Paulo",
    year: "numeric",
    month: "2-digit",
    day: "2-digit",
  }).format(new Date());
  const anterior = new Date(hoje + "T12:00:00Z");
  anterior.setUTCDate(anterior.getUTCDate() - 1);
  const plano = await request.post(`${api}/patients/${id}/medications`, {
    headers,
    data: {
      name: "Medicamento fictício do ensaio",
      dosagem: "10 mg — exemplo sintético",
      instruction: "Orientação fictícia, sem uso clínico.",
      startsOn: anterior.toISOString().slice(0, 10),
      timeZone: "America/Sao_Paulo",
      schedules: ["08:00", "20:00"],
    },
  });
  expect(plano.status()).toBe(200);
  const paciente = await browser.newContext({
      viewport: { width: 390, height: 844 },
    }),
    tela = await paciente.newPage();
  await tela.goto(aplicativo + "/acesso");
  await expect(tela.getByLabel("Código de ativação")).toHaveCount(0);
  await tela.screenshot({
    path: path.join(evidencia, "app-acesso-sem-sms.png"),
    fullPage: true,
  });
  await tela.getByTestId("cpf-input").fill(documento);
  await tela.getByTestId("nascimento-input").fill("01011950");
  await tela.getByTestId("login-button").click();
  await expect(tela).toHaveURL(/inicio/);
  await tela.getByTestId("module-medications").click();
  await expect(
    tela.getByText("2 sem registro", { exact: false }),
  ).toBeVisible();
  await tela
    .getByRole("button", { name: "Tomei este medicamento", exact: true })
    .first()
    .click();
  await expect(
    tela.getByText("Registrado como tomado", { exact: true }),
  ).toBeVisible();
  await expect(tela.getByText("1 de 2", { exact: true })).toBeVisible();
  await paciente.setOffline(true);
  await tela
    .getByRole("button", { name: "Não tomei neste horário", exact: true })
    .click();
  await expect(
    tela.getByText("Resposta aguardando envio protegido."),
  ).toBeVisible();
  const antes = await request.get(
    `${api}/patients/${id}/medication-agenda?from=${hoje}&to=${hoje}`,
    { headers },
  );
  expect((await antes.json()).dias[0].resumo.naoTomadas).toBe(0);
  await tela.screenshot({
    path: path.join(evidencia, "app-medicamentos-fila-offline.png"),
    fullPage: true,
  });
  await paciente.setOffline(false);
  await tela
    .getByRole("button", { name: "Tentar sincronizar registros" })
    .click();
  await expect(
    tela.getByText("Registrado como não tomado", { exact: true }),
  ).toBeVisible();
  await tela.reload();
  await expect(
    tela.getByText("Registrado como tomado", { exact: true }),
  ).toBeVisible();
  await expect(
    tela.getByText("Registrado como não tomado", { exact: true }),
  ).toBeVisible();
  const depois = await request.get(
    `${api}/patients/${id}/medication-agenda?from=${hoje}&to=${hoje}`,
    { headers },
  );
  expect((await depois.json()).dias[0].resumo).toEqual({
    previstas: 2,
    tomadas: 1,
    naoTomadas: 1,
    pendentes: 0,
  });
  for (const largura of [320, 390, 430]) {
    await tela.setViewportSize({ width: largura, height: 844 });
    await expect
      .poll(() =>
        tela.evaluate(() => document.documentElement.scrollWidth <= innerWidth),
      )
      .toBe(true);
    await tela.screenshot({
      path: path.join(evidencia, `app-medicamentos-${largura}.png`),
      fullPage: true,
    });
  }
  await tela.getByRole("button", { name: "Ontem", exact: true }).click();
  await expect(
    tela.getByText("2 sem registro", { exact: false }),
  ).toBeVisible();
  await tela
    .getByRole("button", { name: "Escolher dia no calendário" })
    .click();
  await expect(
    tela.getByText("Calendário de medicamentos", { exact: true }),
  ).toBeVisible();
  await tela.screenshot({
    path: path.join(evidencia, "app-medicamentos-calendario.png"),
    fullPage: true,
  });
  await tela.getByRole("button", { name: "7 dias", exact: true }).click();
  await expect(tela.getByRole("progressbar")).toHaveCount(7);
  await tela.goto(aplicativo + "/configuracoes");
  await tela
    .getByRole("switch", { name: "Ampliar os textos do aplicativo" })
    .click();
  await tela.goto(aplicativo + "/medicamentos");
  await expect(
    tela.getByText("Registrado como tomado", { exact: true }),
  ).toBeVisible();
  await tela.screenshot({
    path: path.join(evidencia, "app-medicamentos-fonte-ampliada.png"),
    fullPage: true,
  });
  await tela.goto(aplicativo + "/lembretes");
  await expect(
    tela.getByText(/As notificações locais estão disponíveis/),
  ).toBeVisible();
  await tela.screenshot({
    path: path.join(evidencia, "app-preferencias-lembretes.png"),
    fullPage: true,
  });
  await page.goto(`/pacientes/${id}`);
  await page.getByRole("tab", { name: "Medicamentos", exact: true }).click();
  await expect(
    page.getByText("Programação e histórico de doses", { exact: true }),
  ).toBeVisible();
  await expect(
    page.getByText(/SELF_REPORT|Autorrelato/, { exact: false }).first(),
  ).toBeVisible();
  await page.screenshot({
    path: path.join(evidencia, "portal-agenda-autoria.png"),
    fullPage: true,
  });
  await paciente.close();
  await request.post(api + "/auth/logout", { headers });
});
