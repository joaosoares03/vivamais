import { defineConfig } from "@playwright/test";
import { resolve } from "node:path";

// Aceitação explícita contra a demonstração local já iniciada; não inicia serviços públicos.
export default defineConfig({
  testDir: "./tests/e2e-demonstracao",
  workers: 1,
  timeout: 60000,
  retries: 0,
  reporter: "list",
  outputDir: ".local/resultados-demonstracao",
  use: {
    launchOptions: {
      downloadsPath: resolve(__dirname, ".local/transferencias-demonstracao"),
    },
    actionTimeout: 10000,
    browserName: "chromium",
    locale: "pt-BR",
    timezoneId: "America/Sao_Paulo",
    trace: "off",
    screenshot: "off",
    video: "off",
  },
});
