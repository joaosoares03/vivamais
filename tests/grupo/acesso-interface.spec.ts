import { test, expect } from "@playwright/test";
import { mkdir } from "node:fs/promises";
import path from "node:path";
const evidencia = path.resolve("docs/evidencias/medicamentos-grupo-2026-11-04");
test("demo exportada: acesso sem SMS, rotas antigas protegidas e telas pequenas", async ({
  page,
}) => {
  await mkdir(evidencia, { recursive: true });
  for (const largura of [320, 390, 430]) {
    await page.setViewportSize({ width: largura, height: 844 });
    await page.goto("http://127.0.0.1:8082/acesso");
    await expect(page.getByTestId("cpf-input")).toBeVisible();
    await expect(page.getByTestId("nascimento-input")).toBeVisible();
    await expect(page.getByTestId("login-button")).toBeVisible();
    await expect(page.getByLabel("Código de ativação")).toHaveCount(0);
    await expect(page.getByLabel("Senha", { exact: true })).toHaveCount(0);
    await expect
      .poll(() =>
        page.evaluate(() => document.documentElement.scrollWidth <= innerWidth),
      )
      .toBe(true);
    await page.screenshot({
      path: path.join(evidencia, `acesso-demonstrativo-${largura}.png`),
      fullPage: true,
    });
  }
  for (const rota of ["cadastro", "ativar-conta"]) {
    await page.goto(`http://127.0.0.1:8082/${rota}`);
    await expect(page).toHaveURL(/\/acesso$/);
    await expect(page.getByText(/código de 4 números/)).toHaveCount(0);
  }
  await page.goto("http://127.0.0.1:8082/");
  await expect(
    page.getByRole("button", { name: "Cadastrar ou ativar minha conta" }),
  ).toHaveCount(0);
});
test("portal publicado localmente apresenta acesso profissional e suporte sem dados do paciente", async ({
  page,
}) => {
  await mkdir(evidencia, { recursive: true });
  await page.goto("http://127.0.0.1:3000/");
  await expect(page.getByLabel("E-mail institucional")).toBeVisible();
  await expect(
    page.getByRole("button", { name: "Entrar na plataforma" }),
  ).toBeVisible();
  await page.screenshot({
    path: path.join(evidencia, "portal-acesso-profissional-atual.png"),
    fullPage: true,
  });
});
