import { expect, test, type Browser, type Page } from "@playwright/test";
import { createHmac, randomBytes } from "node:crypto";
import { gerarCpfSintetico } from "../e2e/apoio-acesso-paciente";

// Roda contra a API em modo produção, com a primeira unidade recém-provisionada.
const conviteInicial = process.env.PRODUCAO_CONVITE ?? "";
const passoAtual = () => Math.floor(Date.now() / 30000);
const usados = new Map<string, number>();

function gerarTotp(segredo: string, passo: number) {
  const alfabeto = "ABCDEFGHIJKLMNOPQRSTUVWXYZ234567";
  let buffer = 0,
    bits = 0;
  const bytes: number[] = [];
  for (const letra of segredo) {
    buffer = ((buffer << 5) | alfabeto.indexOf(letra)) & 0xfff;
    bits += 5;
    if (bits >= 8) {
      bytes.push((buffer >> (bits - 8)) & 255);
      bits -= 8;
    }
  }
  const tempo = Buffer.alloc(8);
  tempo.writeBigUInt64BE(BigInt(passo));
  const resumo = createHmac("sha1", Buffer.from(bytes)).update(tempo).digest();
  const inicio = resumo[19] & 15;
  return String(
    (resumo.readUInt32BE(inicio) & 0x7fffffff) % 1_000_000,
  ).padStart(6, "0");
}

/** O servidor recusa reuso, então cada uso espera um passo novo de 30 segundos. */
async function novoCodigo(page: Page, segredo: string) {
  const ultimo = usados.get(segredo) ?? -1;
  while (passoAtual() + 1 <= ultimo) await page.waitForTimeout(1000);
  const passo = passoAtual() + 1;
  usados.set(segredo, passo);
  return gerarTotp(segredo, passo);
}

async function ativar(page: Page, link: string, senha: string) {
  await page.goto(link);
  await expect(page).toHaveURL(/\/ativar-conta$/);
  const chave = page.getByLabel("Chave do autenticador");
  await expect(chave).toBeVisible();
  const segredo = (await chave.textContent()) ?? "";
  await page.getByLabel(/Senha, com pelo menos/).fill(senha);
  await page.getByLabel("Repita a senha").fill(senha);
  const passo = passoAtual();
  usados.set(segredo, passo);
  await page.getByLabel(/Código de 6 números/).fill(gerarTotp(segredo, passo));
  await page.getByRole("button", { name: "Ativar minha conta" }).click();
  await expect(
    page
      .getByRole("list", { name: "Códigos de recuperação" })
      .getByRole("listitem"),
  ).toHaveCount(8);
  return segredo;
}

async function entrar(
  page: Page,
  email: string,
  senha: string,
  segredo: string,
) {
  await page.goto("/");
  await page.getByLabel("E-mail institucional").fill(email);
  await page.getByLabel("Senha", { exact: true }).fill(senha);
  await page
    .getByLabel("Código do autenticador ou de recuperação")
    .fill(await novoCodigo(page, segredo));
  await page.getByRole("button", { name: /Entrar/ }).click();
  await expect(page).toHaveURL(/\/painel$/);
}

async function semRolagemLateral(
  browser: Browser,
  caminho: string,
  page: Page,
) {
  const estado = await page.context().storageState();
  const contexto = await browser.newContext({
    baseURL: process.env.E2E_BASE_URL || "http://127.0.0.1:3000",
    viewport: { width: 320, height: 640 },
    storageState: estado,
  });
  const estreita = await contexto.newPage();
  await estreita.goto(caminho);
  await estreita.waitForLoadState("networkidle");
  const excesso = await estreita.evaluate(
    () => document.documentElement.scrollWidth - window.innerWidth,
  );
  expect(excesso, caminho).toBeLessThanOrEqual(0);
  await contexto.close();
}

test("administração ativa, convida equipe e profissional ativa paciente presencialmente", async ({
  page,
  browser,
}) => {
  expect(conviteInicial, "Defina PRODUCAO_CONVITE").toMatch(/^[\w-]{43}$/);
  const senhaAdmin = randomBytes(18).toString("base64url");
  const senhaProf = randomBytes(18).toString("base64url");
  const emailProf = `pessoa-${Date.now()}@ensaio.invalid`;

  const segredoAdmin = await ativar(
    page,
    `/ativar-conta#${conviteInicial}`,
    senhaAdmin,
  );
  await page.getByRole("link", { name: "Entrar no portal" }).click();
  await entrar(page, "admin@ensaio.invalid", senhaAdmin, segredoAdmin);

  const menu = page.getByRole("navigation", { name: "Menu principal" });
  await expect(menu.getByRole("link", { name: /Grupo de testes/ })).toHaveCount(
    0,
  );
  await menu.getByRole("link", { name: /Equipe/ }).click();
  await expect(
    page.getByRole("heading", { name: "Equipe", level: 1 }),
  ).toBeVisible();
  await semRolagemLateral(browser, "/contas", page);

  const convidar = page.locator("form", {
    has: page.getByRole("heading", { name: "Convidar pessoa" }),
  });
  await convidar.getByLabel("Nome").fill("Profissional de ensaio");
  await convidar.getByLabel("E-mail").fill(emailProf);
  await convidar.getByLabel("Sua senha").fill("senha-errada-de-teste");
  await convidar.getByLabel("Código do seu autenticador").fill("000000");
  await convidar.getByRole("button", { name: "Gerar convite" }).click();
  await expect(page.locator('p[role="alert"]')).toContainText(
    "Confira sua senha e o código do autenticador",
  );
  await convidar.getByLabel("Nome").fill("Profissional de ensaio");
  await convidar.getByLabel("E-mail").fill(emailProf);
  await convidar.getByLabel("Sua senha").fill(senhaAdmin);
  await convidar
    .getByLabel("Código do seu autenticador")
    .fill(await novoCodigo(page, segredoAdmin));
  await convidar.getByRole("button", { name: "Gerar convite" }).click();
  const link = await page
    .locator(".notice code")
    .filter({ hasText: "/ativar-conta#" })
    .textContent();
  expect(link).toMatch(/\/ativar-conta#[\w-]{43}$/);
  await expect(page.getByRole("cell", { name: emailProf })).toBeVisible();

  const profissional = await browser.newContext({
    baseURL: process.env.E2E_BASE_URL || "http://127.0.0.1:3000",
  });
  const tela = await profissional.newPage();
  const segredoProf = await ativar(tela, link!, senhaProf);
  await entrar(tela, emailProf, senhaProf, segredoProf);
  await expect(
    tela
      .getByRole("navigation", { name: "Menu principal" })
      .getByRole("link", { name: /Equipe/ }),
  ).toHaveCount(0);
  await tela.goto("/contas");
  await expect(
    tela.getByRole("heading", { name: "Acesso restrito" }),
  ).toBeVisible();

  const criado = await tela.evaluate(async (cpf) => {
    const resposta = await fetch("/api/domain/patients", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({
        displayName: "Pessoa fictícia de ensaio",
        modality: "APP",
        cpf,
        dataNascimento: "1950-01-01",
        telefone: "(11) 92222-2222",
      }),
    });
    return { status: resposta.status, corpo: await resposta.json() };
  }, gerarCpfSintetico());
  expect(criado.status).toBe(200);
  await tela.goto(`/pacientes/${criado.corpo.patient.id}`);
  await tela.getByRole("tab", { name: "Acesso ao aplicativo" }).click();
  await tela
    .getByLabel("Conferi pessoalmente a identidade e o celular cadastrado.")
    .check();
  await tela
    .getByLabel("Sua senha profissional", { exact: true })
    .fill(senhaProf);
  await tela.getByRole("button", { name: "Gerar código presencial" }).click();
  await expect(
    tela.getByText("Mostre este código ao paciente agora."),
  ).toBeVisible();
  await expect(tela.getByText(/^\d{6}$/)).toBeVisible();
  await expect(tela.getByText(/São seis números/)).toBeVisible();
  await tela.reload();
  await expect(
    tela.getByText("Mostre este código ao paciente agora."),
  ).toHaveCount(0);
  await profissional.close();
});

test("convite usado não reabre e página pública cabe em tela estreita", async ({
  page,
  browser,
}) => {
  await page.goto(`/ativar-conta#${conviteInicial}`);
  await expect(page.locator('p[role="alert"]')).toContainText(
    "Convite inválido",
  );
  await semRolagemLateral(browser, "/ativar-conta", page);
});
