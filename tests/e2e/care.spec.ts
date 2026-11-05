import {
  gerarCpfSintetico,
  ativarPorApi,
  gerarCelularSintetico,
  solicitarSmsPeloPortal,
} from "./apoio-acesso-paciente";
import { test, expect } from "@playwright/test";
test("cadastro no portal, ativação e leitura compartilhada persistem na API", async ({
  page,
  request,
}) => {
  const password = process.env.E2E_PASSWORD;
  test.skip(!password, "Senha de teste definida no ambiente.");
  const cpf = gerarCpfSintetico();
  const email = `pessoa-${Date.now()}@demo.invalid`;
  await page.goto("/");
  await page
    .getByLabel("E-mail institucional")
    .fill("profissional.a@demo.vivamais.invalid");
  await page.getByLabel("Senha", { exact: true }).fill(password!);
  await page
    .getByRole("button", { name: "Entrar na plataforma", exact: true })
    .click();
  await expect(page).toHaveURL(/\/painel$/);
  await page
    .locator(".sidebar")
    .getByRole("link", { name: "Cadastrar paciente", exact: true })
    .click();
  await page.getByLabel("Nome completo").fill("Pessoa Teste Cadastro");
  await page.getByLabel("E-mail de contato (opcional)").fill(email);
  await page.getByLabel("CPF", { exact: true }).fill(cpf);
  await page
    .getByLabel("Data de nascimento", { exact: true })
    .fill("01/01/1950");
  await page
    .getByLabel("Telefone com DDD", { exact: true })
    .fill(gerarCelularSintetico());
  await expect(
    page.locator("form").filter({
      has: page.getByRole("button", { name: "Salvar paciente", exact: true }),
    }),
  ).toHaveAttribute("method", "post");
  await page
    .getByRole("button", { name: "Salvar paciente", exact: true })
    .click();
  await expect(
    page.getByRole("heading", { name: "Paciente cadastrado" }),
  ).toBeVisible();
  const code = await solicitarSmsPeloPortal(page);
  const href = await page
    .getByRole("link", { name: "Abrir ficha do paciente" })
    .getAttribute("href");
  const patientId = href!.split("/").pop()!;
  const api = process.env.API_BASE_URL || "http://127.0.0.1:8080";
  const auth = await ativarPorApi(request, cpf, "1950-01-01", code);
  const reading = {
    id: crypto.randomUUID(),
    systolic: 118,
    diastolic: 76,
    pulse: 71,
    measuredAt: new Date(Date.now() - 60000).toISOString(),
    source: "MANUAL",
  };
  for (let i = 0; i < 2; i++)
    expect(
      (
        await request.post(`${api}/api/v1/patients/${patientId}/readings`, {
          headers: { Authorization: `Bearer ${auth.accessToken}` },
          data: reading,
        })
      ).status(),
    ).toBe(200);
  await page.getByRole("link", { name: "Abrir ficha do paciente" }).click();
  await expect(page.getByLabel("Visão geral dos cuidados")).toContainText(
    "118 / 76",
  );
  await page
    .getByRole("tab", { name: "Pressão arterial", exact: true })
    .click();
  await expect(
    page.getByRole("heading", { name: "Histórico da pressão", exact: true }),
  ).toBeVisible();
  await expect(page.getByText("118 / 76 mmHg", { exact: true })).toBeVisible();
  await expect(page.locator(".care-table tbody tr")).toHaveCount(1);
  await page.getByRole("tab", { name: "Medicamentos", exact: true }).click();
  await page
    .getByRole("button", { name: "Adicionar medicamento", exact: true })
    .click();
  await page.getByLabel("Nome do medicamento").fill("Plano Sintético E2E");
  await page
    .getByLabel("Instruções cadastradas pela equipe")
    .fill("Instrução fictícia da equipe");
  await page
    .getByLabel("Horários separados por vírgula, ex.: 08:00, 20:00")
    .fill("08:00, 20:00");
  await page
    .getByRole("button", { name: "Salvar registro", exact: true })
    .click();
  await expect(
    page.getByText("Plano Sintético E2E", { exact: true }).first(),
  ).toBeVisible();
  const plans = await request.get(
    `${api}/api/v1/patients/${patientId}/medications`,
    { headers: { Authorization: `Bearer ${auth.accessToken}` } },
  );
  expect(plans.status()).toBe(200);
  expect((await plans.json())[0].name).toBe("Plano Sintético E2E");
  let liberarLeitura: () => void = () => undefined;
  const liberacao = new Promise<void>((resolver) => {
    liberarLeitura = resolver;
  });
  const padraoLeituras = `**/api/domain/patients/${patientId}/readings?*`;
  await page.route(padraoLeituras, async (rota) => {
    const resposta = await rota.fetch();
    await liberacao;
    await rota.fulfill({ response: resposta });
  });
  const leituraIniciada = page.waitForRequest(
    (requisicao) =>
      new URL(requisicao.url()).pathname ===
      `/api/domain/patients/${patientId}/readings`,
  );
  await page
    .getByRole("tab", { name: "Pressão arterial", exact: true })
    .click();
  await leituraIniciada;
  await page.getByRole("tab", { name: "Medicamentos", exact: true }).click();
  await expect(page.locator("table.tabela-cuidado")).toContainText(
    "Plano Sintético E2E",
  );
  const leituraFinalizada = page.waitForResponse(
    (resposta) =>
      new URL(resposta.url()).pathname ===
      `/api/domain/patients/${patientId}/readings`,
  );
  liberarLeitura();
  await leituraFinalizada;
  await expect(page.locator("table.tabela-cuidado")).toContainText(
    "Plano Sintético E2E",
  );
  await expect(page.locator("table.tabela-cuidado")).not.toContainText(
    "118 / 76 mmHg",
  );
  await page.unroute(padraoLeituras);
  await page.getByRole("tab", { name: "Consultas", exact: true }).click();
  await page
    .getByRole("button", { name: "Nova consulta", exact: true })
    .click();
  await page
    .getByLabel("Anotações da consulta", { exact: true })
    .fill("Consulta sintética confirmada pela interface");
  await page
    .getByLabel("Objetivos acordados", { exact: true })
    .fill("Objetivo sintético acordado");
  await page
    .getByLabel("Plano de cuidado profissional", { exact: true })
    .fill("Plano sintético para verificar persistência");
  await page
    .getByRole("button", { name: "Salvar registro", exact: true })
    .click();
  await expect(page.locator("table.tabela-cuidado")).toContainText(
    "Consulta sintética confirmada pela interface",
  );
  // O navegador envia seu cookie Secure no contexto local; o cliente HTTP do Node aplica regras diferentes em HTTP.
  const consultas = await page.evaluate(async (caminho) => {
    const resposta = await fetch(caminho, {
      credentials: "same-origin",
      cache: "no-store",
    });
    return {
      estado: resposta.status,
      dados: resposta.ok ? await resposta.json() : null,
    };
  }, `/api/domain/patients/${patientId}/consultations`);
  expect(consultas.estado).toBe(200);
  expect(consultas.dados.items[0].notes).toBe(
    "Consulta sintética confirmada pela interface",
  );
  const denied = await request.post(`${api}/api/v1/auth/login`, {
    data: { email: "profissional.b@demo.vivamais.invalid", password },
  });
  const other = await denied.json();
  expect(
    (
      await request.get(`${api}/api/v1/patients/${patientId}/readings`, {
        headers: { Authorization: `Bearer ${other.accessToken}` },
      })
    ).status(),
  ).toBe(403);
  for (const accessToken of [auth.accessToken, other.accessToken])
    await request.post(`${api}/api/v1/auth/logout`, {
      headers: { Authorization: `Bearer ${accessToken}` },
    });
  await page.getByRole("button", { name: "Sair", exact: true }).click();
});
