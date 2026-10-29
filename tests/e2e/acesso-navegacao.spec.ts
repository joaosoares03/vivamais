import { formatarCelularBrasileiro } from "../../packages/contracts/src/cadastro";
import {
  solicitarSmsPeloPortal,
  gerarCelularSintetico,
} from "./apoio-acesso-paciente";
import { entrarNaTela } from "./apoio-acesso-paciente";
import { test, expect } from "@playwright/test";

function gerarDocumentoSintetico() {
  let documento = Array.from(
    crypto.getRandomValues(new Uint8Array(9)),
    (numero) => String(numero % 10),
  ).join("");
  for (let posicao = 9; posicao < 11; posicao++) {
    let soma = 0;
    for (let indice = 0; indice < posicao; indice++)
      soma += Number(documento[indice]) * (posicao + 1 - indice);
    documento += String(((soma * 10) % 11) % 10);
  }
  return documento;
}

test("cadastro completo → ativação na interface → início, módulos, perfil e semana reais", async ({
  page,
  browser,
}) => {
  test.setTimeout(90_000);
  const senha = process.env.E2E_PASSWORD;
  test.skip(!senha, "Credencial sintética local necessária.");
  const email = `navegacao-${Date.now()}@demo.invalid`,
    aplicativo = process.env.MOBILE_WEB_URL || "http://127.0.0.1:8081";
  await page.goto("/");
  await expect(
    page.getByRole("link", {
      name: "Abrir aplicativo do paciente",
      exact: true,
    }),
  ).toHaveAttribute("href", aplicativo);
  await page
    .getByLabel("E-mail institucional")
    .fill("profissional.a@demo.vivamais.invalid");
  await page.getByLabel("Senha", { exact: true }).fill(senha!);
  await page
    .getByRole("button", { name: "Entrar na plataforma", exact: true })
    .click();
  await expect(page).toHaveURL(/\/painel$/);
  await page.goto("/");
  await expect(page).toHaveURL(/\/painel$/);
  await page
    .locator(".sidebar")
    .getByRole("link", { name: "Cadastrar paciente", exact: true })
    .click();
  await page
    .getByLabel("Nome completo", { exact: true })
    .fill("Pessoa Sintética Navegação");
  const cpf = gerarDocumentoSintetico();
  const telefone = gerarCelularSintetico();
  await page.getByLabel("CPF", { exact: true }).fill(cpf);
  await page
    .getByLabel("Data de nascimento", { exact: true })
    .fill("1952-04-20");
  await page.getByLabel("Telefone com DDD", { exact: true }).fill(telefone);
  await page.getByLabel("Sexo", { exact: true }).selectOption("NAO_INFORMADO");
  await page
    .getByLabel("Endereço", { exact: true })
    .fill("Endereço sintético de teste");
  await page
    .getByLabel("E-mail de contato (opcional)", { exact: true })
    .fill(email);
  await page
    .getByRole("button", { name: "Salvar paciente", exact: true })
    .click();
  await expect(
    page.getByRole("heading", { name: "Paciente cadastrado", exact: true }),
  ).toBeVisible();
  const codigo = await solicitarSmsPeloPortal(page);
  const enderecoFicha = await page
    .getByRole("link", { name: "Abrir ficha do paciente" })
    .getAttribute("href");
  await page.getByRole("link", { name: "Abrir ficha do paciente" }).click();
  await expect(page.getByLabel("Dados pessoais do paciente")).toContainText(
    "20/04/1952",
  );
  await page
    .getByRole("button", { name: "Editar cadastro", exact: true })
    .click();
  await page
    .getByLabel("Nome completo", { exact: true })
    .fill("Pessoa Sintética Navegação Atualizada");
  await page
    .getByRole("button", { name: "Salvar alterações do cadastro", exact: true })
    .click();
  await expect(
    page.getByRole("heading", {
      name: "Pessoa Sintética Navegação Atualizada",
      exact: true,
    }),
  ).toBeVisible();

  const contexto = await browser.newContext({
      viewport: { width: 390, height: 844 },
      isMobile: true,
      hasTouch: true,
    }),
    movel = await contexto.newPage();
  await movel.goto(aplicativo);
  await movel
    .getByRole("button", {
      name: "Cadastrar ou ativar minha conta",
      exact: true,
    })
    .click();
  await expect(
    movel.getByRole("heading", { name: "Seu cadastro no Viva+", exact: true }),
  ).toBeVisible();
  await movel
    .getByRole("button", { name: "Já tenho código: ativar conta", exact: true })
    .click();
  await entrarNaTela(movel, cpf, "1952-04-20", codigo);
  await expect(movel.getByLabel("Senha", { exact: true })).toHaveCount(0);
  await expect(
    movel.getByRole("button", { name: "Início", exact: true }),
  ).toBeInViewport();
  await expect(
    movel.getByRole("heading", { name: "Olá, Pessoa!", exact: true }),
  ).toBeVisible();
  await expect(movel.getByLabel("Meu acompanhamento")).toContainText(
    "Você ainda não registrou sua pressão.",
  );
  for (const [modulo, titulo] of [
    ["blood-pressure", "Minha Pressão"],
    ["medications", "Meus Medicamentos"],
    ["food", "Minha Alimentação"],
  ]) {
    await movel.getByTestId(`module-${modulo}`).click();
    await expect(
      movel.getByRole("heading", { name: titulo, exact: true }),
    ).toBeVisible();
    if (modulo === "blood-pressure")
      await movel
        .getByRole("button", { name: "Voltar ao início", exact: true })
        .click();
    else
      await movel
        .getByRole("button", { name: "Voltar ao início", exact: true })
        .click();
    await expect(movel).toHaveURL(/\/inicio$/);
  }
  await movel.getByTestId("module-activity").click();
  await movel
    .getByRole("button", { name: "Registrar atividade realizada", exact: true })
    .click();
  await movel.getByRole("button", { name: "Estou bem", exact: true }).click();
  await movel
    .getByLabel("Atividade realizada", { exact: true })
    .fill("Movimento voluntário sintético");
  await movel.getByLabel("Duração em minutos", { exact: true }).fill("12");
  await movel
    .getByRole("button", { name: "Registrar atividade realizada", exact: true })
    .click();
  await expect(
    movel.getByText("Registro salvo.", { exact: true }),
  ).toBeVisible();
  await movel
    .getByRole("button", {
      name: "Ver minha semana de atividades",
      exact: true,
    })
    .click();
  await expect(
    movel.getByText("Total da semana: 12 minutos · 1 registros", {
      exact: true,
    }),
  ).toBeVisible();
  await movel
    .getByRole("button", { name: "Semana anterior", exact: true })
    .click();
  await expect(
    movel.getByText("Total da semana: 0 minutos · 0 registros", {
      exact: true,
    }),
  ).toBeVisible();
  await movel
    .getByRole("button", { name: "Próxima semana", exact: true })
    .click();
  await expect(
    movel.getByText("Total da semana: 12 minutos · 1 registros", {
      exact: true,
    }),
  ).toBeVisible();
  await movel
    .getByRole("button", { name: "Voltar ao início", exact: true })
    .click();
  await movel.getByTestId("module-activity").click();
  await movel
    .getByRole("button", {
      name: "Catálogo de materiais aprovados",
      exact: true,
    })
    .click();
  const cartaoMarcha = movel
    .getByText("Marcha sentada", { exact: true })
    .locator("..");
  await cartaoMarcha
    .getByRole("button", {
      name: "Registrar somente se já realizei esta atividade",
      exact: true,
    })
    .click();
  await expect(
    movel.getByLabel("Atividade realizada", { exact: true }),
  ).toHaveValue("Marcha sentada");
  const rotaAtividades = "**/api/v1/patients/*/activities";
  await movel.route(rotaAtividades, (rota) =>
    rota.request().method() === "POST" ? rota.abort("failed") : rota.continue(),
  );
  await movel.getByRole("button", { name: "Estou bem", exact: true }).click();
  await movel.getByLabel("Duração em minutos", { exact: true }).fill("3");
  await movel
    .getByRole("button", { name: "Registrar atividade realizada", exact: true })
    .click();
  await expect(
    movel.getByText("Atividade aguardando envio", { exact: true }),
  ).toBeVisible();
  await movel.unroute(rotaAtividades);
  await movel
    .getByRole("button", { name: "Reenviar atividade", exact: true })
    .click();
  await expect(
    movel.getByText("Registro salvo.", { exact: true }),
  ).toBeVisible();
  const atividadesPersistidas = await page.evaluate(async (endereco) => {
    const id = endereco!.split("/").pop();
    return (
      await fetch(`/api/domain/patients/${id}/activities`, {
        credentials: "same-origin",
      })
    ).json();
  }, enderecoFicha);
  expect(atividadesPersistidas.total).toBe(2);
  expect(
    atividadesPersistidas.items.filter(
      (item: { type: string }) => item.type === "Marcha sentada",
    ),
  ).toHaveLength(1);
  await movel
    .getByRole("button", { name: "Voltar ao início", exact: true })
    .click();
  await movel.getByTestId("history-button").click();
  for (const rotulo of [
    "Histórico de atividades",
    "Histórico de medicamentos",
    "Histórico de refeições",
    "Histórico da pressão",
  ]) {
    await movel.getByRole("button", { name: rotulo, exact: true }).click();
    await expect(
      movel.getByRole("button", { name: "Voltar ao início", exact: true }),
    ).toBeVisible();
  }
  await movel
    .getByRole("button", { name: "Voltar ao início", exact: true })
    .click();
  await movel.getByRole("button", { name: "Meu Perfil", exact: true }).click();
  await expect(
    movel.getByText("Nome: Pessoa Sintética Navegação Atualizada", {
      exact: true,
    }),
  ).toBeVisible();
  await expect(
    movel.getByRole("button", { name: "Editar meu telefone", exact: true }),
  ).toHaveCount(0);
  await expect(
    movel.getByText(/A confirmação profissional protege seu acesso/),
  ).toBeVisible();
  await page.goto(enderecoFicha!);
  await expect(page.getByLabel("Dados pessoais do paciente")).toContainText(
    formatarCelularBrasileiro(telefone),
  );
  await movel
    .getByRole("button", {
      name: "Configurações e acessibilidade",
      exact: true,
    })
    .click();
  const titulo = movel.getByRole("heading", {
      name: "Configurações",
      exact: true,
    }),
    fonteAnterior = await titulo.evaluate((elemento) =>
      parseFloat(getComputedStyle(elemento).fontSize),
    );
  await movel
    .getByLabel("Ampliar os textos do aplicativo", { exact: true })
    .click();
  await expect
    .poll(() =>
      titulo.evaluate((elemento) =>
        parseFloat(getComputedStyle(elemento).fontSize),
      ),
    )
    .toBeGreaterThan(fonteAnterior);
  await movel
    .getByRole("button", { name: "Voltar ao início", exact: true })
    .click();
  await movel
    .getByRole("button", { name: "Meus Lembretes", exact: true })
    .click();
  await expect(
    movel.getByRole("heading", { name: "Meus Lembretes", exact: true }),
  ).toBeVisible();
  await movel
    .getByRole("button", { name: "Voltar ao início", exact: true })
    .click();
  await movel
    .getByRole("button", { name: "Sair da minha conta", exact: true })
    .click();
  await expect(movel).toHaveURL(/\/acesso$/);
  await contexto.close();
  await page.getByRole("button", { name: "Sair", exact: true }).click();
});
