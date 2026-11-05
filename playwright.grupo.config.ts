import { defineConfig, devices } from "@playwright/test";
// Ensaio explícito contra os servidores já iniciados pelo operador. Não inicia Next/API.
export default defineConfig({
  testDir: "./tests/grupo",
  workers: 1,
  fullyParallel: false,
  timeout: 90000,
  reporter: [["list"]],
  use: {
    ...devices["Desktop Chrome"],
    baseURL: "http://127.0.0.1:3000",
    trace: "off",
    screenshot: "off",
    video: "off",
  },
  projects: [{ name: "chromium" }],
});
