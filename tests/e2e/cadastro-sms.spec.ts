import { test, expect } from "@playwright/test";
import {
  gerarCpfSintetico,
  gerarCelularSintetico,
  solicitarSmsPeloPortal,
  entrarNaTela,
} from "./apoio-acesso-paciente";

test("cadastro valida CPF e celular, troca assistida e ativação por caixa SMS local", async ({
  page,
  browser,
}) => {
  test.setTimeout(90000);
  const senha = process.env.E2E_PASSWORD!;
  expect(Boolean(senha)).toBe(true);
  await page.goto("/");
  await page
    .getByLabel("E-mail institucional")
    .fill("profissional.b@demo.vivamais.invalid");
  await page.getByLabel("Senha", { exact: true }).fill(senha);
  await page
    .getByRole("button", { name: "Entrar na plataforma", exact: true })
    .click();
  await expect(page).toHaveURL(/\/painel$/);
  await page.goto("/pacientes/novo");
  await page
    .getByLabel("Nome completo", { exact: true })
    .fill("Pessoa Sintética Cadastro SMS");
  await page.getByLabel("CPF", { exact: true }).fill("00000000000");
  await page
    .getByLabel("Data de nascimento", { exact: true })
    .fill("01/01/1950");
  const celular = page.getByLabel("Telefone com DDD", { exact: true });
  await page
    .getByRole("button", { name: "Salvar paciente", exact: true })
    .click();
  expect(
    await celular.evaluate(
      (campo: HTMLInputElement) => campo.validity.valueMissing,
    ),
  ).toBe(true);
  await celular.fill(gerarCelularSintetico());
  await page
    .getByRole("button", { name: "Salvar paciente", exact: true })
    .click();
  await expect(page.locator("p[role=alert]")).toContainText("CPF");
  const cpf = gerarCpfSintetico();
  await page.getByLabel("CPF", { exact: true }).fill(cpf);
  await celular.fill("(23) 91111-1111");
  await page
    .getByRole("button", { name: "Salvar paciente", exact: true })
    .click();
  await expect(page.locator("p[role=alert]")).toContainText("celular válido");
  await celular.fill(gerarCelularSintetico());
  await page
    .getByRole("button", { name: "Salvar paciente", exact: true })
    .click();
  await expect(
    page.getByRole("heading", { name: "Paciente cadastrado com sucesso!", exact: true }),
  ).toBeVisible();
  await page
    .getByRole("link", { name: "Abrir ficha do paciente", exact: true })
    .click();
  await page
    .getByRole("button", { name: "Editar cadastro", exact: true })
    .click();
  await page
    .getByLabel("Telefone com DDD", { exact: true })
    .fill(gerarCelularSintetico());
  const senhaTroca = page.getByLabel(
    "Sua senha profissional para confirmar a troca",
    { exact: true },
  );
  await expect(senhaTroca).toBeVisible();
  await page
    .getByLabel("Conferi a identidade e o novo celular com o paciente.")
    .check();
  await senhaTroca.fill(senha);
  await page
    .getByRole("button", { name: "Salvar alterações do cadastro", exact: true })
    .click();
  await expect(
    page.getByText("Cadastro atualizado.", { exact: true }),
  ).toBeVisible();
  const codigo = await solicitarSmsPeloPortal(page);
  const contexto = await browser.newContext({
    viewport: { width: 390, height: 844 },
  });
  try {
    const movel = await contexto.newPage();
    await movel.goto("http://127.0.0.1:8081/acesso");
    await entrarNaTela(movel, cpf, "1950-01-01", codigo);
    await expect(movel.getByTestId("module-blood-pressure")).toBeVisible();
  } finally {
    await contexto.close();
  }
});
