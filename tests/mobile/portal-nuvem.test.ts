import { afterEach, expect, it, vi } from "vitest";
afterEach(() => {
  vi.unstubAllEnvs();
  vi.resetModules();
});
it("não compila portal público com URL ausente, HTTP, privada ou contendo credenciais", async () => {
  vi.stubEnv("APP_ENV", "preview");
  vi.stubEnv("API_BASE_URL", "https://api.example.org");
  vi.stubEnv("NEXT_PUBLIC_APLICATIVO_URL", "https://paciente.example.org");
  const { default: config } = await import("../../web/next.config");
  expect(config.poweredByHeader).toBe(false);
  for (const endereco of [
    "",
    "http://api.example.org",
    "https://192.168.0.8",
    "https://10.0.0.2",
    "https://localhost",
    "https://*.example.org",
    "https://api.example.org/caminho",
    "https://usuario:senha@api.example.org",
  ]) {
    vi.resetModules();
    vi.stubEnv("API_BASE_URL", endereco);
    await expect(import("../../web/next.config")).rejects.toThrow();
  }
});
