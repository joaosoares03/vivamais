import {
  gerarCpfSintetico,
  entrarNaTela,
  gerarCelularSintetico,
  solicitarSmsPeloPortal,
} from "./apoio-acesso-paciente";
import { expect, test } from "@playwright/test";
import { randomUUID } from "node:crypto";

test("roteiro local: páginas do portal, sete dias reais, filtros e informações da atividade", async ({
  page,
  browser,
}) => {
  const senha = process.env.E2E_PASSWORD;
  if (!senha)
    throw new Error("Configure a credencial sintética fora do repositório.");
  await page.goto("/");
  await page
    .getByLabel("E-mail institucional")
    .fill("profissional.b@demo.vivamais.invalid");
  await page.getByLabel("Senha", { exact: true }).fill(senha);
  await page
    .getByRole("button", { name: "Entrar na plataforma", exact: true })
    .click();
  await expect(page).toHaveURL(/\/painel$/);
  for (const [nome, titulo] of [
    ["Consultas", "Consultas de enfermagem"],
    ["Relatórios", "Relatórios e resumos"],
    ["Configurações", "Configurações"],
  ]) {
    await page
      .getByRole("navigation", { name: "Menu principal" })
      .getByRole("link", { name: nome, exact: true })
      .click();
    await expect(
      page.getByRole("heading", { name: titulo, exact: true }),
    ).toBeVisible();
  }
  const cpf = gerarCpfSintetico();
  const email = `local-${randomUUID()}@demo.invalid`;
  const cadastro = await page.evaluate(
    async ({ email, cpf, telefone }) => {
      const resposta = await fetch("/api/domain/patients", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          displayName: "Pessoa Sintética Guia Local",
          modality: "APP",
          email,
          cpf,
          telefone,
          dataNascimento: "1954-01-01",
        }),
      });
      if (!resposta.ok) throw new Error("Cadastro de ensaio falhou.");
      return resposta.json();
    },
    { email, cpf, telefone: gerarCelularSintetico() },
  );
  const id = cadastro.patient.id;
  await page.goto("/pacientes/" + id);
  const codigo = await solicitarSmsPeloPortal(page);
  const dia = new Intl.DateTimeFormat("en-CA", {
    timeZone: "America/Sao_Paulo",
    year: "numeric",
    month: "2-digit",
    day: "2-digit",
  }).format(new Date());
  const inicio = new Date(`${dia}T12:00:00Z`);
  inicio.setUTCDate(inicio.getUTCDate() - 6);
  const entradas = [
    [
      "medications",
      {
        name: "Plano sintético de sete dias",
        instruction: "Instrução apenas de teste",
        startsOn: inicio.toISOString().slice(0, 10),
        timeZone: "America/Sao_Paulo",
        schedules: ["00:01"],
      },
    ],
    ...[1, 40 * 1440].map((minutos) => [
      "readings",
      {
        id: randomUUID(),
        systolic: 110,
        diastolic: 70,
        measuredAt: new Date(
          Date.now() - Number(minutos) * 60000,
        ).toISOString(),
        source: "PROFESSIONAL",
      },
    ]),
  ];
  for (const [caminho, corpo] of entradas) {
    const estado = await page.evaluate(
      async ({ id, caminho, corpo }) =>
        (
          await fetch(`/api/domain/patients/${id}/${caminho}`, {
            method: "POST",
            headers: { "Content-Type": "application/json" },
            body: JSON.stringify(corpo),
          })
        ).status,
      { id, caminho, corpo },
    );
    expect(estado).toBe(200);
  }
  const contexto = await browser.newContext({
    viewport: { width: 390, height: 844 },
  });
  const movel = await contexto.newPage();
  await entrarNaTela(movel, cpf, "1954-01-01", codigo);
  await movel.getByTestId("module-medications").click();
  await movel
    .getByRole("button", { name: "Tomei este medicamento", exact: true })
    .click();
  await expect(
    movel.getByText("Registrado como tomado", { exact: true }),
  ).toBeVisible();
  await movel
    .getByRole("button", { name: "Voltar ao início", exact: true })
    .click();
  await movel
    .getByRole("button", {
      name: "Atividade Física. Abrir módulo.",
      exact: true,
    })
    .click();
  await movel
    .getByRole("button", {
      name: "Mensagens e orientações da atividade",
      exact: true,
    })
    .click();
  await expect(
    movel.getByRole("heading", {
      name: "Mensagens e orientações",
      exact: true,
    }),
  ).toBeVisible();
  await movel.getByRole("button", { name: "Início", exact: true }).click();
  await movel
    .getByRole("button", {
      name: "Atividade Física. Abrir módulo.",
      exact: true,
    })
    .click();
  await movel
    .getByRole("button", { name: "Ver minhas informações", exact: true })
    .click();
  await movel.getByRole("radio", { name: "Estou bem", exact: true }).click();
  await movel.getByRole("button", { name: "Continuar", exact: true }).click();
  await movel
    .getByRole("radio", { name: "Sim, já verifiquei", exact: true })
    .click();
  await movel.getByRole("button", { name: "Continuar", exact: true }).click();
  const anoBrasilia = Number(dia.slice(0, 4));
  await expect(
    movel.getByText(`${anoBrasilia - 1954} anos`, { exact: true }),
  ).toBeVisible();
  await movel.getByRole("button", { name: "Início", exact: true }).click();
  await movel
    .getByRole("button", { name: "Sair da minha conta", exact: true })
    .click();
  await expect(movel).toHaveURL(/\/acesso$/);
  await page.goto(`/pacientes/${id}?aba=medications`);
  await page
    .getByRole("combobox", { name: "Período dos autorrelatos", exact: true })
    .selectOption("7");
  await expect(
    page.getByLabel("Resumo dos autorrelatos", { exact: true }),
  ).toHaveText(
    "1 Tomei · 0 Não tomei · 6 Sem confirmação · 7 horários no período.",
  );
  await expect(
    page.getByText("Autorrelatos do período de sete dias", { exact: true }),
  ).toBeVisible();
  const rotaHorarios = `**/api/domain/patients/${id}/medication-events?date=*`;
  await page.route(rotaHorarios, (rota) =>
    rota.fulfill({
      status: 503,
      contentType: "application/json",
      body: JSON.stringify({ detail: "Falha de leitura do ensaio" }),
    }),
  );
  await page
    .getByRole("combobox", { name: "Período dos autorrelatos", exact: true })
    .selectOption("1");
  await expect(
    page.getByRole("alert").filter({ hasText: "Falha de leitura do ensaio" }),
  ).toHaveText("Falha de leitura do ensaio");
  await expect(
    page.getByLabel("Resumo dos autorrelatos", { exact: true }),
  ).toHaveCount(0);
  await page.unroute(rotaHorarios);
  await page
    .getByRole("combobox", { name: "Período dos autorrelatos", exact: true })
    .selectOption("7");
  await expect(
    page.getByLabel("Resumo dos autorrelatos", { exact: true }),
  ).toHaveText(
    "1 Tomei · 0 Não tomei · 6 Sem confirmação · 7 horários no período.",
  );
  await page
    .getByRole("tab", { name: "Pressão arterial", exact: true })
    .click();
  await page
    .getByRole("button", { name: "Últimos 7 dias", exact: true })
    .click();
  await expect(
    page.getByText("Página 1 · 1 registros", { exact: true }),
  ).toBeVisible();
  await page
    .getByRole("button", { name: "Todos os registros", exact: true })
    .click();
  await expect(
    page.getByText("Página 1 · 2 registros", { exact: true }),
  ).toBeVisible();
  await page.reload();
  await expect(
    page.getByRole("heading", {
      name: "Pessoa Sintética Guia Local",
      exact: true,
    }),
  ).toBeVisible();
  await page.getByRole("button", { name: "Sair", exact: true }).click();
  await contexto.close();
});
