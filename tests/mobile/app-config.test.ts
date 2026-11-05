import { afterEach, describe, expect, it, vi } from "vitest";

afterEach(() => {
  vi.unstubAllEnvs();
  vi.resetModules();
});

describe("distribution configuration", () => {
  it("exporta web por convite na própria origem sem compilar endereço local de API", async () => {
    vi.stubEnv("APP_ENV", "preview");
    vi.stubEnv("VIVA_ACESSO_TESTADORES", "true");
    vi.stubEnv("VIVA_WEB_MESMA_ORIGEM", "true");
    const { default: c } = await import("../../app.config");
    expect(c.extra?.webMesmaOrigem).toBe(true);
    vi.resetModules();
    vi.stubEnv("EAS_BUILD_PLATFORM", "ios");
    await expect(import("../../app.config")).rejects.toThrow(
      "exclusivo da exportação web",
    );
    vi.unstubAllEnvs();
    vi.resetModules();
    vi.stubEnv("VIVA_WEB_MESMA_ORIGEM", "true");
    await expect(import("../../app.config")).rejects.toThrow(
      "exclusivo da exportação web",
    );
  });
  it("separa os testes por convite e bloqueia esse acesso em produção", async () => {
    vi.stubEnv("APP_ENV", "preview");
    vi.stubEnv("VIVA_ACESSO_TESTADORES", "true");
    vi.stubEnv("EXPO_PUBLIC_API_BASE_URL", "https://api.example.org");
    const { default: c } = await import("../../app.config");
    expect(c.scheme).toBe("vivamais-teste");
    expect(c.ios?.bundleIdentifier).toBe("org.vivamais.academicdemo.teste");
    expect(c.android?.versionCode).toBe(2);
    expect(c.runtimeVersion).toEqual({ policy: "fingerprint" });
    vi.resetModules();
    vi.stubEnv("APP_ENV", "production");
    await expect(import("../../app.config")).rejects.toThrow(
      "ambiente de testes separado",
    );
  });
  it("atualizações só são habilitadas com projeto EAS real e fora da demonstração local", async () => {
    vi.stubEnv("VIVA_ATUALIZACOES", "true");
    await expect(import("../../app.config")).rejects.toThrow(
      "projeto EAS vinculado",
    );
  });
  it("identifica o aplicativo demonstrativo separadamente e impede reutilizar o identificador público", async () => {
    vi.stubEnv("APP_ENV", "development");
    vi.stubEnv("VIVA_LOGIN_DEMONSTRACAO", "true");
    vi.stubEnv("EXPO_PUBLIC_API_BASE_URL", "http://127.0.0.1:8080");
    const { default: configuracao } = await import("../../app.config");
    expect(configuracao.android?.package).toBe(
      "org.vivamais.academicdemo.local",
    );
    expect(configuracao.ios?.bundleIdentifier).toBe(
      "org.vivamais.academicdemo.local",
    );
    expect(configuracao.name).toBe("Viva+ Demo local");
    vi.resetModules();
    vi.stubEnv("VIVA_ANDROID_APPLICATION_ID", "org.vivamais.publico");
    await expect(import("../../app.config")).rejects.toThrow(
      "identificadores exclusivos",
    );
  });
  it("bloqueia login demonstrativo em preview e produção, inclusive pelo perfil EAS", async () => {
    vi.stubEnv("VIVA_LOGIN_DEMONSTRACAO", "true");
    for (const ambiente of ["preview", "production"]) {
      vi.resetModules();
      vi.stubEnv("APP_ENV", ambiente);
      await expect(import("../../app.config")).rejects.toThrow(
        "builds de distribuição",
      );
    }
    vi.resetModules();
    vi.stubEnv("APP_ENV", "development");
    vi.stubEnv("EAS_BUILD_PROFILE", "production");
    await expect(import("../../app.config")).rejects.toThrow(
      "builds de distribuição",
    );
  });
  it("rejects a preview build pointing at a local API before bundling", async () => {
    vi.stubEnv("APP_ENV", "preview");
    for (const nomeServidor of [
      "localhost",
      "127.0.0.1",
      "10.0.2.2",
      "192.168.1.20",
      "[::1]",
    ]) {
      vi.resetModules();
      vi.stubEnv("EXPO_PUBLIC_API_BASE_URL", `https://${nomeServidor}`);
      await expect(import("../../app.config")).rejects.toThrow("API pública");
    }
  });

  it("accepts a public HTTPS API and removes native cleartext allowances", async () => {
    vi.stubEnv("APP_ENV", "production");
    vi.stubEnv("EXPO_PUBLIC_API_BASE_URL", "https://api.example.org");
    const { default: config } = await import("../../app.config");
    expect(config.ios?.infoPlist?.NSAppTransportSecurity).toBeUndefined();
    expect(config.plugins).toContainEqual([
      "expo-build-properties",
      { android: { usesCleartextTraffic: false } },
    ]);
  });
});
