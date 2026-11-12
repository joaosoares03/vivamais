import { defineConfig } from "@playwright/test";
import configuracaoBase from "./playwright.config";

for (const endereco of [
  process.env.E2E_BASE_URL || "http://127.0.0.1:3000",
  process.env.API_BASE_URL || "http://127.0.0.1:8080",
]) {
  let url: URL;
  try {
    url = new URL(endereco);
  } catch {
    throw new Error("Defina endereços locais válidos para a matriz de acesso.");
  }
  if (
    !["127.0.0.1", "localhost"].includes(url.hostname) ||
    url.username ||
    url.password
  )
    throw new Error(
      "A matriz de acesso usa somente API e portal locais, sem credenciais na URL.",
    );
}

export default defineConfig({
  ...configuracaoBase,
  testDir: "./tests/acesso",
  retries: 0,
  timeout: 120000,
  projects: [
    { name: "seguro", use: { ...configuracaoBase.use } },
    { name: "convites", use: { ...configuracaoBase.use } },
  ],
  webServer: [
    ...(Array.isArray(configuracaoBase.webServer)
      ? configuracaoBase.webServer
      : []),
    {
      command: "node infra/serve-mobile-preview.mjs",
      url: "http://127.0.0.1:8084",
      reuseExistingServer: !process.env.CI,
      timeout: 30000,
      env: {
        VIVA_PREVIEW_PORT: "8084",
        VIVA_PREVIEW_DIRECTORY: ".local/export-convites-validacao",
      },
    },
  ],
});
