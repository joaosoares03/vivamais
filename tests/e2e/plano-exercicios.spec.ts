import { expect, test, type Page } from "@playwright/test";
import { ativarPorApi, cadastrarComCodigo } from "./apoio-acesso-paciente";

const api = process.env.API_BASE_URL || "http://127.0.0.1:8080";

async function entrarNoPortal(page: Page, email: string, senha: string) {
  await page.context().clearCookies();
  await page.goto("/");
  await page.getByLabel("E-mail institucional").fill(email);
  await page.getByLabel("Senha", { exact: true }).fill(senha);
  await page
    .getByRole("button", { name: "Entrar na plataforma", exact: true })
    .click();
  await expect(page).toHaveURL(/\/painel$/);
}

test("administração aprova o catálogo, profissional monta o plano e o paciente o recebe", async ({
  page,
  request,
}) => {
  test.setTimeout(120000);
  const senha = process.env.E2E_PASSWORD;
  test.skip(!senha, "Defina credencial sintética no ambiente.");

  // 1. Administração registra a aprovação clínica em Configurações.
  await entrarNoPortal(page, "admin.a@demo.vivamais.invalid", senha!);
  await page.goto("/configuracoes");
  const cartao = page.locator("section.configuracoes-exercicios");
  await expect(
    cartao.getByRole("heading", { name: "Catálogo de exercícios" }),
  ).toBeVisible();
  const registrar = cartao.getByRole("button", {
    name: "Registrar aprovação",
  });
  await expect(
    cartao.getByText(/^(Aprovado|Aguardando aprovação clínica)$/),
  ).toBeVisible();
  if (await registrar.isVisible()) {
    await cartao
      .getByLabel("Nome do responsável clínico")
      .fill("Responsável Sintética");
    await cartao.getByLabel(/Conselho/).fill("COREN-SP");
    await cartao.getByLabel("Número de registro").fill("000000");
    await cartao.getByRole("checkbox").check();
    await registrar.click();
  }
  await expect(cartao.getByText("Aprovado", { exact: true })).toBeVisible();
  await expect(cartao.getByText("COREN-SP 000000")).toBeVisible();

  // 2. Paciente sintético com grupo definido no perfil funcional.
  const login = await request.post(`${api}/api/v1/auth/login`, {
    data: { email: "profissional.a@demo.vivamais.invalid", password: senha },
  });
  expect(login.status()).toBe(200);
  const headers = {
    Authorization: `Bearer ${(await login.json()).accessToken}`,
  };
  const { patient, activationToken, cpf, dataNascimento } =
    await cadastrarComCodigo(request, headers, {
      displayName: "Pessoa Sintetica Plano",
      email: `plano-${Date.now()}@demo.invalid`,
      modality: "APP",
    });
  const perfil = await request.put(
    `${api}/api/v1/patients/${patient.id}/activity-profile`,
    {
      headers,
      data: {
        mobility: "Informação sintética",
        balance: "Informação sintética",
        restrictions: "",
        professionalGuidance: "",
        approvedCatalogGroup: "COM_RISCO_QUEDA_SENTADO",
      },
    },
  );
  expect(perfil.status()).toBe(200);

  // 3. Profissional monta o plano na ficha.
  await entrarNoPortal(page, "profissional.a@demo.vivamais.invalid", senha!);
  await page.goto(`/pacientes/${patient.id}?aba=activities`);
  const plano = page.locator("section.plano-exercicios");
  await plano.getByRole("button", { name: "Montar plano" }).click();
  await plano
    .getByRole("checkbox", { name: "Marcha sentada", exact: true })
    .check();
  await plano
    .getByRole("checkbox", { name: "Marcha sentada, segunda-feira" })
    .check();
  await plano
    .getByRole("checkbox", { name: "Marcha sentada, quarta-feira" })
    .check();
  await plano
    .locator("fieldset", { hasText: "Marcha sentada" })
    .getByLabel("Duração (minutos)")
    .fill("12");
  await expect(
    plano.getByRole("checkbox", { name: "Caminhada no plano", exact: true }),
  ).toHaveCount(0);
  await plano.getByRole("button", { name: "Salvar plano" }).click();
  await expect(plano.getByText("Plano salvo.", { exact: false })).toBeVisible();
  await expect(plano.getByText("Ativo", { exact: true })).toBeVisible();
  await expect(
    plano.getByRole("cell", { name: /Marcha sentada/ }),
  ).toBeVisible();
  await expect(plano.getByText("Seg, Qua")).toBeVisible();

  // 4. O paciente recebe o plano e o registro aparece para a equipe.
  const sessao = await ativarPorApi(
    request,
    cpf,
    dataNascimento,
    activationToken,
  );
  const paciente = { Authorization: `Bearer ${sessao.accessToken}` };
  const recebido = await request.get(
    `${api}/api/v1/pacientes/${patient.id}/plano-exercicios`,
    { headers: paciente },
  );
  expect(recebido.status()).toBe(200);
  const dados = await recebido.json();
  expect(dados.situacao).toBe("ATIVO");
  expect(dados.itens).toEqual([
    expect.objectContaining({
      idExercicio: "ex02-marcha-sentada",
      diasSemana: [1, 3],
      duracaoMinutos: 12,
    }),
  ]);
  const registro = await request.post(
    `${api}/api/v1/patients/${patient.id}/activities`,
    {
      headers: paciente,
      data: {
        id: crypto.randomUUID(),
        type: "Marcha sentada",
        durationMinutes: 12,
        occurredAt: new Date(Date.now() - 60000).toISOString(),
        feeling: "WELL",
        notes: "",
        exerciseId: "ex02-marcha-sentada",
      },
    },
  );
  expect(registro.status()).toBe(200);
  await page.reload();
  await expect(plano.getByText("1 de 2 dias")).toBeVisible();
});
