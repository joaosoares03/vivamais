import {
  test,
  expect,
  type APIRequestContext,
  type Page,
} from "@playwright/test";
import { readFile } from "node:fs/promises";
import {
  gerarCpfSintetico,
  gerarCelularSintetico,
} from "../e2e/apoio-acesso-paciente";

const api = "http://127.0.0.1:8080/api/v1";
const aplicativo = "http://127.0.0.1:8082";
const portal = "http://127.0.0.1:3000";

test("histórico e navegação continuam utilizáveis com fonte ampliada em 320px", async ({
  page,
  request,
}) => {
  const pessoa = await preparar(request);
  try {
    await page.setViewportSize({ width: 320, height: 844 });
    await entrarPaciente(page, pessoa.cpf);
    await page.getByRole("button", { name: /Configurações/ }).click();
    const controle = page.getByRole("switch", {
      name: "Ampliar os textos do aplicativo",
    });
    await controle.click();
    await expect(controle).toBeChecked();
    await page
      .getByRole("button", { name: "Voltar ao início", exact: true })
      .click();
    const cartao = page.getByTestId("module-medications");
    const textoCartao = cartao.getByText("Meus Medicamentos", { exact: true });
    const caixaCartao = await cartao.boundingBox(),
      caixaTexto = await textoCartao.boundingBox();
    expect(caixaCartao).not.toBeNull();
    expect(caixaTexto).not.toBeNull();
    expect(caixaTexto!.x).toBeGreaterThanOrEqual(caixaCartao!.x);
    expect(caixaTexto!.x + caixaTexto!.width).toBeLessThanOrEqual(
      caixaCartao!.x + caixaCartao!.width,
    );
    await page.getByRole("button", { name: /Atividade Física/ }).click();
    await page
      .getByRole("button", {
        name: "Ver minha semana de atividades",
        exact: true,
      })
      .click();
    for (const nome of [
      "Semana anterior",
      "Próxima semana",
      "Página anterior de atividades",
      "Próxima página de atividades",
    ]) {
      const botao = page.getByRole("button", { name: nome, exact: true });
      await botao.scrollIntoViewIfNeeded();
      const area = await botao.boundingBox();
      expect(area).not.toBeNull();
      expect(area!.x).toBeGreaterThanOrEqual(0);
      expect(area!.x + area!.width).toBeLessThanOrEqual(320);
      expect(area!.height).toBeGreaterThanOrEqual(48);
    }
    const inicio = await page
      .getByRole("button", { name: "Início", exact: true })
      .boundingBox();
    const perfil = await page
      .getByRole("button", { name: "Perfil", exact: true })
      .boundingBox();
    expect(inicio).not.toBeNull();
    expect(perfil).not.toBeNull();
    expect(perfil!.y).toBeGreaterThan(inicio!.y);
    expect(perfil!.x + perfil!.width).toBeLessThanOrEqual(320);
  } finally {
    await request.post(`${api}/auth/logout`, {
      headers: { Authorization: `Bearer ${pessoa.token}` },
    });
  }
});

async function preparar(request: APIRequestContext) {
  if (!process.env.E2E_PASSWORD)
    throw new Error("Defina a credencial sintética no ambiente privado.");
  const autenticacao = await request.post(`${api}/auth/login`, {
    data: {
      email: "profissional.a@demo.vivamais.invalid",
      password: process.env.E2E_PASSWORD,
    },
  });
  expect(autenticacao.status()).toBe(200);
  const token = (await autenticacao.json()).accessToken;
  const cpf = gerarCpfSintetico();
  const cadastro = await request.post(`${api}/patients`, {
    headers: { Authorization: `Bearer ${token}` },
    data: {
      displayName: "Pessoa sintética — aceitação final",
      modality: "APP",
      cpf,
      dataNascimento: "1950-01-01",
      telefone: gerarCelularSintetico(),
    },
  });
  expect(cadastro.status()).toBe(200);
  return { cpf, id: (await cadastro.json()).patient.id as string, token };
}
async function entrarPaciente(page: Page, cpf: string) {
  await page.goto(`${aplicativo}/acesso`);
  await page.getByLabel("CPF", { exact: true }).fill(cpf);
  await page
    .getByLabel("Data de nascimento", { exact: true })
    .fill("01/01/1950");
  const acesso = page.waitForResponse(
    (r) =>
      r.url().endsWith("/auth/paciente/demonstracao") &&
      r.request().method() === "POST",
  );
  await page.getByRole("button", { name: "ENTRAR", exact: true }).click();
  const resposta = await acesso;
  expect(resposta.status()).toBe(200);
  const sessao = (await resposta.json()).sessao;
  await expect(page).toHaveURL(`${aplicativo}/inicio`);
  await expect(
    page.getByLabel("Código de ativação", { exact: true }),
  ).toHaveCount(0);
  return sessao as { accessToken: string };
}

test("login sem SMS, data civil, consulta offline e reconexão com dados reais", async ({
  page,
  context,
  request,
}) => {
  const pessoa = await preparar(request);
  try {
    const sessao = await entrarPaciente(page, pessoa.cpf);
    const outro = await request.post(`${api}/patients`, {
      headers: { Authorization: `Bearer ${pessoa.token}` },
      data: {
        displayName: "Outra pessoa sintética — isolamento",
        modality: "APP",
        cpf: gerarCpfSintetico(),
        dataNascimento: "1950-01-01",
        telefone: gerarCelularSintetico(),
      },
    });
    expect(outro.status()).toBe(200);
    const outroId = (await outro.json()).patient.id;
    expect(
      (
        await request.get(`${api}/patients/${outroId}/readings`, {
          headers: { Authorization: `Bearer ${sessao.accessToken}` },
        })
      ).status(),
    ).toBe(403);
    await page
      .getByRole("button", {
        name: "Minhas consultas e orientações",
        exact: true,
      })
      .click();
    await expect(
      page.getByText("Nenhuma consulta registrada pela equipe até agora."),
    ).toBeVisible();
    await context.setOffline(true);
    await page
      .getByRole("button", { name: "Atualizar consultas", exact: true })
      .click();
    await expect(
      page.getByText(/Sem conexão · exibindo dados guardados/).last(),
    ).toBeVisible();
    await expect(
      page.getByText("Nenhuma consulta registrada pela equipe até agora."),
    ).toBeVisible();
    await context.setOffline(false);
    await page
      .getByRole("button", { name: "Atualizar consultas", exact: true })
      .click();
    await expect(
      page.getByText(/Sem conexão · exibindo dados guardados/).last(),
    ).toHaveCount(0);
    await page
      .getByRole("button", { name: "Voltar ao início", exact: true })
      .click();
    await page.getByRole("button", { name: /Minha Pressão/ }).click();
    await page
      .getByRole("button", { name: "Digitar os valores", exact: true })
      .click();
    await page
      .getByRole("button", { name: "Pulso e data da medição", exact: true })
      .click();
    await expect(
      page.getByLabel("Data da medição", { exact: true }),
    ).toHaveValue(/\d{2}\/\d{2}\/\d{4}/);
    await expect(page.getByText(/ISO com fuso/)).toHaveCount(0);
    await page.getByRole("button", { name: "Perfil", exact: true }).click();
    await page
      .getByRole("button", {
        name: "Configurações e acessibilidade",
        exact: true,
      })
      .click();
    await expect(
      page.getByText(/entre novamente com CPF e nascimento, sem código SMS/),
    ).toBeVisible();
    await expect(
      page.getByRole("button", {
        name: "Desautorizar este aparelho",
        exact: true,
      }),
    ).toHaveCount(0);
    await page
      .getByRole("button", { name: "Sair da minha conta", exact: true })
      .click();
    await expect(page).toHaveURL(`${aplicativo}/acesso`);
    expect(
      (
        await request.get(`${api}/auth/me`, {
          headers: { Authorization: `Bearer ${sessao.accessToken}` },
        })
      ).status(),
    ).toBe(401);
  } finally {
    await context.setOffline(false);
    await request.post(`${api}/auth/logout`, {
      headers: { Authorization: `Bearer ${pessoa.token}` },
    });
  }
});

test("retificação na interface preserva original, exporta histórico e compartilha somente orientações", async ({
  page,
  request,
  browser,
}) => {
  test.setTimeout(120000);
  const pessoa = await preparar(request);
  try {
    const idConsulta = crypto.randomUUID();
    const resposta = await request.post(
      `${api}/patients/${pessoa.id}/consultations`,
      {
        headers: { Authorization: `Bearer ${pessoa.token}` },
        data: {
          id: idConsulta,
          occurredAt: new Date(Date.now() - 60000).toISOString(),
          notes: "Anotação interna original sintética",
          goals: "Objetivo original sintético",
          carePlan: "Orientação original sintética",
        },
      },
    );
    expect(resposta.status()).toBe(200);
    // Excede uma página real de exportação, sem fixtures no lugar da API.
    for (let inicio = 0; inicio < 102; inicio += 4) {
      await Promise.all(
        Array.from({ length: Math.min(4, 102 - inicio) }, async (_, indice) => {
          const registro = await request.post(
            `${api}/patients/${pessoa.id}/consultations`,
            {
              headers: { Authorization: `Bearer ${pessoa.token}` },
              data: {
                id: crypto.randomUUID(),
                occurredAt: new Date(
                  Date.parse("2026-10-01T15:00:00Z") + (inicio + indice) * 1000,
                ).toISOString(),
                notes: "Anotação sintética de paginação",
                goals: "Objetivo sintético de teste",
                carePlan: "Texto sintético para conferir exportação",
              },
            },
          );
          expect(registro.status()).toBe(200);
        }),
      );
    }
    await page.goto(portal);
    await page
      .getByLabel("E-mail institucional")
      .fill("profissional.a@demo.vivamais.invalid");
    await page
      .getByLabel("Senha", { exact: true })
      .fill(process.env.E2E_PASSWORD!);
    await page
      .getByRole("button", { name: "Entrar na plataforma", exact: true })
      .click();
    await expect(page).toHaveURL(/\/painel$/);
    await page.goto(`${portal}/pacientes/${pessoa.id}`);
    await page.getByRole("tab", { name: "Consultas", exact: true }).click();
    await page
      .getByRole("row")
      .filter({ hasText: "Anotação interna original sintética" })
      .getByRole("button", { name: "Retificar anotações", exact: true })
      .click();
    const formulario = page.getByRole("region", {
      name: "Retificar anotações",
      exact: true,
    });
    await formulario
      .getByRole("textbox", { name: "Objetivos acordados", exact: true })
      .fill("Objetivo retificado sintético");
    await formulario
      .getByRole("textbox", { name: "Orientações da equipe", exact: true })
      .fill("Orientação retificada sintética");
    await formulario
      .getByLabel("Motivo da retificação")
      .fill("Correção textual de teste sintético");
    await formulario
      .getByRole("button", { name: "Registrar retificação", exact: true })
      .click();
    await expect(page.locator(".tabela-cuidado")).toContainText(
      "Orientação retificada sintética",
    );
    const diario = await request.post(`${api}/patients/${pessoa.id}/diary`, {
      headers: { Authorization: `Bearer ${pessoa.token}` },
      data: {
        id: crypto.randomUUID(),
        occurredAt: new Date(Date.now() - 60000).toISOString(),
        systolic: 118,
        diastolic: 76,
        pulse: 70,
        notes: "Observação sintética original do diário",
        medicationReport: "Relato sintético original",
      },
    });
    expect(diario.status()).toBe(200);
    await page
      .getByRole("tab", { name: "Diário impresso", exact: true })
      .click();
    await page
      .getByRole("button", { name: "Retificar anotações", exact: true })
      .click();
    await formulario
      .getByRole("textbox", { name: "Observações da transcrição", exact: true })
      .fill("Observação sintética retificada do diário");
    await formulario
      .getByRole("textbox", { name: "Motivo da retificação", exact: true })
      .fill("Conferência textual do diário sintético");
    await formulario
      .getByRole("button", { name: "Registrar retificação", exact: true })
      .click();
    await expect(page.locator(".tabela-cuidado")).toContainText(
      "Observação sintética retificada do diário",
    );
    await page.getByRole("tab", { name: "Consultas", exact: true }).click();
    await page
      .getByText("Exportar histórico do paciente", { exact: true })
      .click();
    const transferencia = page.waitForEvent("download");
    await page
      .getByRole("button", {
        name: "Baixar histórico completo (JSON)",
        exact: true,
      })
      .click();
    const arquivo = await transferencia;
    const dados = JSON.parse(await readFile((await arquivo.path())!, "utf8"));
    expect(dados.registros.CONSULTAS).toHaveLength(103);
    expect(
      dados.registros.CONSULTAS.find(
        (registro: { id: string }) => registro.id === idConsulta,
      ).goals,
    ).toBe("Objetivo original sintético");
    expect(dados.registros.RETIFICACOES[0].conteudo.goals).toBe(
      "Objetivo retificado sintético",
    );
    expect(dados.registros.RETIFICACOES).toHaveLength(2);
    expect(dados.registros.DIARIO[0]).toMatchObject({
      notes: "Observação sintética original do diário",
      systolic: 118,
      diastolic: 76,
      pulse: 70,
    });
    // O mesmo fluxo de download respeita datas civis brasileiras.
    await page
      .getByLabel("Data inicial da exportação", { exact: true })
      .fill("03/11/2026");
    await page
      .getByLabel("Data final da exportação", { exact: true })
      .fill("03/11/2026");
    const downloadPeriodo = page.waitForEvent("download");
    await page
      .getByRole("button", {
        name: "Baixar histórico completo (JSON)",
        exact: true,
      })
      .click();
    const arquivoPeriodo = await downloadPeriodo;
    const periodo = JSON.parse(
      await readFile((await arquivoPeriodo.path())!, "utf8"),
    );
    expect(periodo.inicio).toBe("2026-11-03");
    expect(periodo.registros.CONSULTAS).toHaveLength(1);
    expect(periodo.registros.CONSULTAS[0].id).toBe(idConsulta);
    expect(periodo.registros.RETIFICACOES).toHaveLength(2);
    const contextoPaciente = await browser.newContext({ locale: "pt-BR" });
    try {
      const paciente = await contextoPaciente.newPage();
      await entrarPaciente(paciente, pessoa.cpf);
      await paciente
        .getByRole("button", {
          name: "Minhas consultas e orientações",
          exact: true,
        })
        .click();
      await expect(
        paciente.getByText("Orientação retificada sintética", { exact: true }),
      ).toBeVisible();
      await expect(
        paciente.getByText("Anotação interna original sintética"),
      ).toHaveCount(0);
      await expect(
        paciente.getByText("Correção textual de teste sintético"),
      ).toHaveCount(0);
    } finally {
      await contextoPaciente.close();
    }
  } finally {
    await request.post(`${api}/auth/logout`, {
      headers: { Authorization: `Bearer ${pessoa.token}` },
    });
  }
});
