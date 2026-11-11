import { test, expect } from "@playwright/test";
import {
  gerarCpfSintetico,
  gerarCelularSintetico,
  solicitarSmsPeloPortal,
} from "./apoio-acesso-paciente";
import { mkdir, writeFile } from "node:fs/promises";
import { resolve, join } from "node:path";
import type { Page } from "@playwright/test";

test("CPF e nascimento, ativação assistida, aparelho persistido, saída e revogação", async ({
  page,
  browser,
}) => {
  test.setTimeout(120000);
  const senha = process.env.E2E_PASSWORD;
  test.skip(!senha, "Credencial profissional sintética privada necessária.");
  const cpf = gerarCpfSintetico();
  const pastaEvidencias = resolve(
    "docs/evidencias/cadastro-sms-interface/acesso",
  );
  const capturas: Array<{
    tela: string;
    largura: number;
    rolagemHorizontal: boolean;
  }> = [];
  async function capturar(pagina: Page, nome: string) {
    if (process.env.VIVA_CAPTURAR_ACESSO !== "true") return;
    await mkdir(pastaEvidencias, { recursive: true });
    await pagina.screenshot({
      path: join(pastaEvidencias, nome + ".png"),
      fullPage: true,
      mask: [
        pagina.locator(
          "input[type=password]:visible,input[name=cpf]:visible,input[name=dataNascimento]:visible,input[name=email]:visible",
        ),
      ],
    });
    capturas.push({
      tela: nome,
      largura: pagina.viewportSize()?.width ?? 0,
      rolagemHorizontal: await pagina.evaluate(
        () => document.documentElement.scrollWidth > innerWidth + 1,
      ),
    });
  }
  await page.goto("/");
  await page
    .getByLabel("E-mail institucional")
    .fill("profissional.b@demo.vivamais.invalid");
  await page.getByLabel("Senha", { exact: true }).fill(senha!);
  await page
    .getByRole("button", { name: "Entrar na plataforma", exact: true })
    .click();
  await expect(page).toHaveURL(/\/painel$/);
  await page
    .locator(".sidebar")
    .getByRole("link", { name: "Cadastrar paciente", exact: true })
    .click();
  await capturar(page, "cadastro_profissional");
  await page
    .getByLabel("Nome completo", { exact: true })
    .fill("Pessoa Sintética Acesso Sem Senha");
  await page.getByLabel("CPF", { exact: true }).fill(cpf);
  await page
    .getByLabel("Data de nascimento", { exact: true })
    .fill("01/01/1950");
  await page
    .getByLabel("Telefone com DDD", { exact: true })
    .fill(gerarCelularSintetico());
  await page
    .getByRole("button", { name: "Salvar paciente", exact: true })
    .click();
  await expect(
    page.getByRole("heading", { name: "Paciente cadastrado" }),
  ).toBeVisible();
  await expect(
    page.getByText("Acesso ainda não ativado", { exact: true }),
  ).toBeVisible();
  await capturar(page, "emissao_profissional");
  const codigo = await solicitarSmsPeloPortal(page);
  const contexto = await browser.newContext({
    viewport: { width: 390, height: 844 },
  });
  const movel = await contexto.newPage();
  const desconhecido = await browser.newContext({
    viewport: { width: 390, height: 844 },
  });
  const outro = await desconhecido.newPage();
  try {
    await movel.goto("http://127.0.0.1:8081/acesso");
    await expect(movel.getByLabel("CPF", { exact: true })).toBeVisible();
    await capturar(movel, "acesso_paciente");
    await expect(movel.getByLabel("Senha", { exact: true })).toHaveCount(0);
    await expect(movel.getByLabel("E-mail", { exact: true })).toHaveCount(0);
    await movel.getByLabel("CPF", { exact: true }).fill("00000000000");
    await movel.getByRole("button", { name: "ENTRAR", exact: true }).click();
    await expect(
      movel.getByText("Confira o CPF. Digite os 11 números.", { exact: true }),
    ).toBeVisible();
    await movel.getByLabel("CPF", { exact: true }).fill(cpf);
    await movel
      .getByLabel("Data de nascimento", { exact: true })
      .fill("01011950");
    await movel.getByRole("button", { name: "ENTRAR", exact: true }).click();
    await expect(movel).toHaveURL(/\/ativar-conta$/);
    await capturar(movel, "ativacao_paciente");
    await expect(movel.getByLabel("Nova senha", { exact: true })).toHaveCount(
      0,
    );
    await movel.getByLabel("Código de ativação", { exact: true }).fill(codigo);
    await movel
      .getByRole("button", { name: "ATIVAR CONTA", exact: true })
      .click();
    await expect(
      movel.getByRole("heading", { name: "Acesso ativado!" }),
    ).toBeVisible();
    await movel
      .getByRole("button", { name: "Ir para o início", exact: true })
      .click();
    await expect(movel).toHaveURL(/\/inicio$/);
    await expect(movel.getByTestId("module-blood-pressure")).toBeVisible();
    await capturar(movel, "inicio_paciente");
    await page
      .getByRole("button", {
        name: "Atualizar estado do acesso",
        exact: true,
      })
      .click();
    await expect(
      page.getByText("Acesso ativado", { exact: true }),
    ).toBeVisible();
    await expect(
      page.getByLabel("Código de ativação", { exact: true }),
    ).toHaveCount(0);
    await capturar(page, "estado_ativado_portal");
    // Chromium aceita Secure no loopback; o filtro HTTP da API Playwright omite esses cookies.
    const cookies = await contexto.cookies();
    const autorizacao = cookies.find(
      (c) => c.name === "__Secure-viva_paciente",
    );
    expect(
      Boolean(
        autorizacao?.secure &&
          autorizacao.httpOnly &&
          autorizacao.sameSite === "Strict" &&
          autorizacao.domain === "127.0.0.1" &&
          autorizacao.path === "/api/v1/auth/paciente",
      ),
    ).toBe(true);
    expect(
      await movel.evaluate(() => ({
        local: localStorage.length,
        sessao: sessionStorage.length,
        exposto: document.cookie.includes("viva_paciente"),
      })),
    ).toEqual({ local: 0, sessao: 0, exposto: false });
    await movel.reload();
    await expect(movel.getByTestId("module-blood-pressure")).toBeVisible();
    await movel
      .getByRole("button", { name: "Configurações", exact: true })
      .click();
    await capturar(movel, "configuracoes_paciente");
    await movel
      .getByRole("button", { name: "Sair da minha conta", exact: true })
      .click();
    await expect(movel.getByLabel("CPF", { exact: true })).toBeVisible();
    await movel.reload();
    await expect(movel.getByLabel("CPF", { exact: true })).toBeVisible();
    await movel.getByLabel("CPF", { exact: true }).fill(cpf);
    await movel
      .getByLabel("Data de nascimento", { exact: true })
      .fill("01011950");
    await movel.getByRole("button", { name: "ENTRAR", exact: true }).click();
    await expect(movel).toHaveURL(/\/inicio$/);
    await outro.goto("http://127.0.0.1:8081/acesso");
    await outro.getByLabel("CPF", { exact: true }).fill(cpf);
    await outro
      .getByLabel("Data de nascimento", { exact: true })
      .fill("01011950");
    await outro.getByRole("button", { name: "ENTRAR", exact: true }).click();
    await expect(outro).toHaveURL(/\/ativar-conta$/);
    await expect(outro.getByTestId("module-blood-pressure")).toHaveCount(0);
    await movel
      .getByRole("button", { name: "Configurações", exact: true })
      .click();
    await movel
      .getByRole("button", { name: "Desautorizar este aparelho", exact: true })
      .click();
    await movel
      .getByRole("button", { name: "Confirmar desautorização", exact: true })
      .click();
    await expect(movel.getByLabel("CPF", { exact: true })).toBeVisible();
    await movel.getByLabel("CPF", { exact: true }).fill(cpf);
    await movel
      .getByLabel("Data de nascimento", { exact: true })
      .fill("01011950");
    await movel.getByRole("button", { name: "ENTRAR", exact: true }).click();
    await expect(movel).toHaveURL(/\/ativar-conta$/);
    await page
      .getByRole("button", {
        name: "Atualizar estado do acesso",
        exact: true,
      })
      .click();
    await expect(
      page.getByLabel("Código de ativação", { exact: true }),
    ).toHaveCount(0);
    await page.getByRole("button", { name: "Sair", exact: true }).click();
    if (process.env.VIVA_CAPTURAR_ACESSO === "true")
      await writeFile(
        join(pastaEvidencias, "capturas.json"),
        JSON.stringify(
          {
            executadoEm: new Date().toISOString(),
            origem:
              "Percurso E2E real com Java/PostgreSQL; dados sinteticos e segredos ocultos",
            capturas,
          },
          null,
          2,
        ),
      );
  } finally {
    await contexto.close();
    await desconhecido.close();
  }
});
