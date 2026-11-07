import { defineConfig, devices } from "@playwright/test";
// Ensaio da interface de produção contra servidores já iniciados. Não inicia Next nem API.
export default defineConfig({
  testDir: "./tests/producao",
  workers: 1,
  fullyParallel: false,
  timeout: 240_000,
  reporter: [["list"]],
  use: {
    ...devices["Desktop Chrome"],
    baseURL: process.env.E2E_BASE_URL || "http://127.0.0.1:3000",
    trace: "off",
    screenshot: "off",
    video: "off",
  },
  projects: [{ name: "chromium" }],
});
