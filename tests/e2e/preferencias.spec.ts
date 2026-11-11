import {
  gerarCelularSintetico,
  solicitarSmsPeloPortal,
} from "./apoio-acesso-paciente";
import { gerarCpfSintetico, entrarNaTela } from "./apoio-acesso-paciente";
import { expect, test } from "@playwright/test";
import { randomUUID } from "node:crypto";

test.use({ actionTimeout: 10_000 });

test("preferências persistem no portal e no aplicativo após nova sessão", async ({
  page,
  browser,
}) => {
  const violacoesEstilo: string[] = [];
  page.on("console", (mensagem) => {
    if (mensagem.text().includes("Refused to apply inline style"))
      violacoesEstilo.push("Estilo bloqueado");
  });
  const senha = process.env.E2E_PASSWORD;
  if (!senha) throw new Error("Credencial sintética obrigatória.");
  async function entrarPortal() {
    await page.goto("/");
    await page
      .getByLabel("E-mail institucional")
      .fill("profissional.b@demo.vivamais.invalid");
    await page.getByLabel("Senha", { exact: true }).fill(senha!);
    await page
      .getByRole("button", { name: "Entrar na plataforma", exact: true })
      .click();
    await expect(page).toHaveURL(/\/painel$/);
  }
  await entrarPortal();
  await page.goto("/configuracoes");
  const anteriores = await page.evaluate(async () =>
    (await fetch("/api/domain/conta/preferencias")).json(),
  );
  const tamanhoTeste = anteriores.tamanhoPagina === 10 ? "50" : "10";
  let contexto;
  try {
    const ampliado = page.getByRole("checkbox", {
      name: "Ampliar os textos do portal",
    });
    if (!(await ampliado.isChecked())) {
      const gravacao = page.waitForResponse(
        (resposta) =>
          resposta.url().endsWith("/conta/preferencias") &&
          resposta.request().method() === "PUT",
      );
      await ampliado.click();
      expect((await gravacao).status()).toBe(200);
      await expect(ampliado).toBeChecked();
      await expect(ampliado).toBeEnabled();
    }
    const gravacaoPagina = page.waitForResponse(
      (resposta) =>
        resposta.url().endsWith("/conta/preferencias") &&
        resposta.request().method() === "PUT",
    );
    await page
      .getByRole("combobox", { name: "Registros por página na ficha" })
      .selectOption(tamanhoTeste);
    expect((await gravacaoPagina).status()).toBe(200);
    await expect(ampliado).toBeEnabled();
    await page.getByRole("button", { name: "Sair", exact: true }).click();
    await entrarPortal();
    await page.goto("/configuracoes");
    await expect(
      page.getByRole("checkbox", { name: "Ampliar os textos do portal" }),
    ).toBeChecked();
    await expect(
      page.getByRole("combobox", { name: "Registros por página na ficha" }),
    ).toHaveValue(tamanhoTeste);
    expect(violacoesEstilo).toHaveLength(0);
    const cpf = gerarCpfSintetico();
    const email = `preferencia-${randomUUID()}@demo.invalid`;
    const criado = await page.evaluate(
      async ({ email, cpf, telefone }) => {
        const resposta = await fetch("/api/domain/patients", {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({
            displayName: "Pessoa Sintética Preferências",
            modality: "APP",
            email,
            cpf,
            telefone,
            dataNascimento: "1950-01-01",
          }),
        });
        if (!resposta.ok) throw Error("Cadastro de teste falhou");
        return resposta.json();
      },
      { email, cpf, telefone: gerarCelularSintetico() },
    );
    await page.goto("/pacientes/" + criado.patient.id);
    const codigo = await solicitarSmsPeloPortal(page);
    contexto = await browser.newContext({
      viewport: { width: 390, height: 844 },
    });
    for (let acesso = 0; acesso < 2; acesso++) {
      const movel = await contexto.newPage();
      await entrarNaTela(
        movel,
        cpf,
        "1950-01-01",
        acesso === 0 ? codigo : undefined,
      );
      await movel
        .getByRole("button", {
          name: "Configurações",
          exact: true,
        })
        .click();
      const chave = movel.getByRole("switch", {
        name: "Ampliar os textos do aplicativo",
      });
      await expect(chave).toBeEnabled();
      if (acesso === 0) {
        await expect(chave).not.toBeChecked();
        await chave.click();
      }
      await expect(chave).toBeChecked();
      await expect(chave).toBeEnabled();
      await movel
        .getByRole("button", { name: "Sair da minha conta", exact: true })
        .click();
      await expect(movel).toHaveURL(/\/acesso$/);
      await movel.close();
    }
  } finally {
    await contexto?.close();
    await page.evaluate(async (anteriores) => {
      const atual = await (
        await fetch("/api/domain/conta/preferencias")
      ).json();
      const resposta = await fetch("/api/domain/conta/preferencias", {
        method: "PUT",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ ...anteriores, versao: atual.versao }),
      });
      if (!resposta.ok) throw Error("Restaurar preferência do ensaio falhou");
    }, anteriores);
    await page.getByRole("button", { name: "Sair", exact: true }).click();
  }
});
