import {
  expect,
  test,
  type APIRequestContext,
  type Page,
  type TestInfo,
} from "@playwright/test";
import { mkdir, writeFile } from "node:fs/promises";
import { join } from "node:path";
import {
  cadastrarComCodigo,
  gerarCpfSintetico,
  gerarCelularSintetico,
} from "../e2e/apoio-acesso-paciente";

const api = process.env.API_BASE_URL || "http://127.0.0.1:8080";
if (!["127.0.0.1", "localhost"].includes(new URL(api).hostname))
  throw new Error(
    "A matriz cria dados sintéticos somente na API local isolada.",
  );
const senha = process.env.E2E_PASSWORD;
const aplicativo = (info: TestInfo) =>
  `http://127.0.0.1:${info.project.name === "convites" ? 8084 : 8081}`;

async function profissional(request: APIRequestContext, unidade: "a" | "b") {
  const email = `profissional.${unidade}@demo.vivamais.invalid`;
  const resposta = await request.post(`${api}/api/v1/auth/login`, {
    data: { email, password: senha },
  });
  expect(resposta.status()).toBe(200);
  const acesso = await resposta.json();
  return {
    email,
    headers: { Authorization: `Bearer ${acesso.accessToken}` },
    organizationId: acesso.user.organizationId,
  };
}
async function entrarPortal(page: Page, email: string) {
  await page.goto("/");
  await page.getByLabel("E-mail institucional").fill(email);
  await page.getByLabel("Senha", { exact: true }).fill(senha!);
  await page
    .getByRole("button", { name: "Entrar na plataforma", exact: true })
    .click();
  await expect(page).toHaveURL(/\/painel$/);
}
async function preencherCpf(page: Page, cpf: string) {
  await page.getByLabel("CPF", { exact: true }).fill(cpf);
  await page.getByLabel("Data de nascimento", { exact: true }).fill("01011950");
  await page.getByRole("button", { name: "ENTRAR", exact: true }).click();
}
async function registrarEConferir(
  paciente: Page,
  portal: Page,
  origemApp: string,
  idPaciente: string,
  request: APIRequestContext,
  pro: Awaited<ReturnType<typeof profissional>>,
  info: TestInfo,
) {
  const atividade = `Atividade sintética ${info.project.name} ${Date.now()}`;
  await paciente.goto(`${origemApp}/atividade-fisica/registro`);
  await paciente
    .getByRole("button", { name: "Estou bem", exact: true })
    .click();
  await paciente
    .getByLabel("Atividade realizada", { exact: true })
    .fill(atividade);
  await paciente.getByLabel("Duração em minutos", { exact: true }).fill("5");
  const gravacao = paciente.waitForResponse(
    (r) =>
      r.request().method() === "POST" &&
      new URL(r.url()).pathname === `/api/v1/patients/${idPaciente}/activities`,
  );
  await paciente
    .getByRole("button", { name: "Registrar atividade realizada", exact: true })
    .click();
  const resposta = await gravacao;
  expect(resposta.status()).toBe(200);
  const registro = await resposta.json();
  expect(registro.id).toMatch(/^[a-f0-9-]{36}$/);
  expect(registro.patientId).toBe(idPaciente);
  await expect(
    paciente.getByText("Sua atividade foi registrada", { exact: true }),
  ).toBeVisible();
  const consulta = await request.get(
    `${api}/api/v1/patients/${idPaciente}/activities`,
    { headers: pro.headers },
  );
  expect(consulta.status()).toBe(200);
  const dados = await consulta.json();
  expect(dados.items).toEqual(
    expect.arrayContaining([
      expect.objectContaining({
        id: registro.id,
        type: atividade,
        patientId: idPaciente,
        durationMinutes: 5,
      }),
    ]),
  );
  await portal.goto(`/pacientes/${idPaciente}?aba=activities`);
  await expect(
    portal.getByRole("heading", { name: "Atividade física", exact: true }),
  ).toBeVisible();
  await expect(
    portal.getByRole("cell", { name: atividade, exact: true }),
  ).toBeVisible();
  await portal.reload();
  await expect(
    portal.getByRole("cell", { name: atividade, exact: true }),
  ).toBeVisible();
  const pasta = join("test-results", "acesso-compartilhado");
  await mkdir(pasta, { recursive: true });
  await writeFile(
    join(pasta, `${info.project.name}-${idPaciente}.json`),
    JSON.stringify(
      {
        syntheticOnly: true,
        mode: info.project.name,
        patientId: idPaciente,
        organizationId: pro.organizationId,
        activityId: registro.id,
        samePatientInRequestAndPortal: true,
        persistedAfterReload: true,
      },
      null,
      2,
    ),
  );
}

test("CPF/código: restauração, registro compartilhado, saída e revogação", async ({
  page,
  browser,
  request,
}, info) => {
  test.skip(!senha, "Defina a credencial sintética do bootstrap local.");
  const pro = await profissional(request, "a");
  const cadastro = await cadastrarComCodigo(request, pro.headers, {
    displayName: "Pessoa Sintética Matriz CPF",
    modality: "APP",
  });
  await entrarPortal(page, pro.email);
  const contexto = await browser.newContext({
    viewport: { width: 390, height: 844 },
  });
  const movel = await contexto.newPage();
  const origemApp = aplicativo(info);
  try {
    await movel.goto(`${origemApp}/acesso`);
    await preencherCpf(movel, cadastro.cpf);
    await expect(movel).toHaveURL(/\/ativar-conta$/);
    await movel
      .getByLabel("Código de ativação", { exact: true })
      .fill(cadastro.activationToken);
    await movel
      .getByRole("button", { name: "ATIVAR CONTA", exact: true })
      .click();
    await movel
      .getByRole("button", { name: "Ir para o início", exact: true })
      .click();
    await expect(movel.getByTestId("module-blood-pressure")).toBeVisible();
    await movel.reload();
    await expect(movel.getByTestId("module-blood-pressure")).toBeVisible();
    await registrarEConferir(
      movel,
      page,
      origemApp,
      cadastro.patient.id,
      request,
      pro,
      info,
    );
    await movel.goto(`${origemApp}/configuracoes`);
    await expect(
      movel.getByRole("button", {
        name: "Desautorizar este aparelho",
        exact: true,
      }),
    ).toBeVisible();
    await movel
      .getByRole("button", { name: "Sair da minha conta", exact: true })
      .click();
    await movel.reload();
    await expect(movel.getByLabel("CPF", { exact: true })).toBeVisible();
    await preencherCpf(movel, cadastro.cpf);
    await expect(movel.getByTestId("module-blood-pressure")).toBeVisible();
    await movel.goto(`${origemApp}/configuracoes`);
    await movel
      .getByRole("button", { name: "Desautorizar este aparelho", exact: true })
      .click();
    await movel
      .getByRole("button", { name: "Confirmar desautorização", exact: true })
      .click();
    await preencherCpf(movel, cadastro.cpf);
    await expect(movel).toHaveURL(/\/ativar-conta$/);
  } finally {
    await contexto.close();
  }
});

test("convite: disponibilidade do build, restauração, vínculo e revogação", async ({
  page,
  browser,
  request,
}, info) => {
  test.skip(!senha, "Defina a credencial sintética do bootstrap local.");
  const contexto = await browser.newContext({
    viewport: { width: 390, height: 844 },
  });
  const movel = await contexto.newPage();
  const origemApp = aplicativo(info);
  try {
    await movel.goto(`${origemApp}/acesso`);
    if (info.project.name === "seguro") {
      await expect(
        movel.getByRole("button", { name: "Tenho um convite de testes" }),
      ).toHaveCount(0);
      await movel.goto(`${origemApp}/convite`);
      await expect(movel.getByLabel("CPF", { exact: true })).toBeVisible();
      await expect(movel.getByTestId("convite-input")).toHaveCount(0);
      return;
    }
    await movel
      .getByRole("button", { name: "Tenho um convite de testes", exact: true })
      .click();
    const pro = await profissional(request, "b");
    const criacao = await request.post(`${api}/api/v1/patients`, {
      headers: pro.headers,
      data: {
        displayName: "Pessoa Sintética Matriz Convite",
        modality: "APP",
        cpf: gerarCpfSintetico(),
        dataNascimento: "1950-01-01",
        telefone: gerarCelularSintetico(),
      },
    });
    expect(criacao.status()).toBe(200);
    const { patient } = await criacao.json();
    const emissao = await request.post(
      `${api}/api/v1/patients/${patient.id}/test-invites`,
      {
        headers: pro.headers,
        data: { senhaProfissional: senha, validadeDias: 1 },
      },
    );
    expect(emissao.status()).toBe(200);
    const convite = await emissao.json();
    if (process.env.GITHUB_ACTIONS === "true")
      console.log(`::add-mask::${convite.convite}`);
    await movel.getByTestId("convite-input").fill(convite.convite);
    await movel.getByRole("button", { name: "ENTRAR", exact: true }).click();
    await expect(movel.getByTestId("module-blood-pressure")).toBeVisible();
    await movel.reload();
    await expect(movel.getByTestId("module-blood-pressure")).toBeVisible();
    await movel.goto(`${origemApp}/configuracoes`);
    await expect(
      movel.getByText(/O convite autoriza este aparelho por tempo limitado/),
    ).toBeVisible();
    await expect(
      movel.getByRole("button", { name: "Desautorizar este aparelho" }),
    ).toHaveCount(0);
    await entrarPortal(page, pro.email);
    await registrarEConferir(
      movel,
      page,
      origemApp,
      patient.id,
      request,
      pro,
      info,
    );
    const outraUnidade = await profissional(request, "a");
    expect(
      (
        await request.get(`${api}/api/v1/patients/${patient.id}/activities`, {
          headers: outraUnidade.headers,
        })
      ).status(),
    ).toBe(403);
    expect(
      (
        await request.post(
          `${api}/api/v1/patients/${patient.id}/test-invites/${convite.id}/revoke`,
          { headers: pro.headers },
        )
      ).status(),
    ).toBe(204);
    await movel.reload();
    await expect(movel.getByLabel("CPF", { exact: true })).toBeVisible();
    await expect(movel.getByTestId("module-blood-pressure")).toHaveCount(0);
  } finally {
    await contexto.close();
  }
});
