import { beforeEach, it, expect, vi } from "vitest";
const apoio = vi.hoisted(() => ({
  plataforma: { OS: "ios" },
  cofre: new Map<string, string>(),
  api: vi.fn(),
  navegador: new Map<string, string>(),
}));
vi.mock("react-native", () => ({ Platform: apoio.plataforma }));
vi.mock("expo-secure-store", () => ({
  getItemAsync: async (k: string) => apoio.cofre.get(k),
  setItemAsync: async (k: string, v: string) => {
    apoio.cofre.set(k, v);
  },
  deleteItemAsync: async (k: string) => {
    apoio.cofre.delete(k);
  },
  WHEN_UNLOCKED_THIS_DEVICE_ONLY: 1,
}));
vi.mock("../../services/api", () => ({ api: apoio.api }));
beforeEach(() => {
  vi.resetModules();
  vi.clearAllMocks();
  apoio.plataforma.OS = "ios";
  apoio.cofre.clear();
  apoio.navegador.clear();
  vi.stubGlobal("localStorage", {
    getItem: (k: string) => apoio.navegador.get(k),
    setItem: (k: string, v: string) => apoio.navegador.set(k, v),
    removeItem: (k: string) => apoio.navegador.delete(k),
  });
});
const resposta = {
  sessao: {
    accessToken: "sessao-unitaria",
    expiresAt: "2026-11-05T10:00Z",
    user: { role: "PATIENT" },
  },
  credencialRenovacao: "r".repeat(43),
  expiraEm: "2026-11-10T10:00Z",
};
it("protege a renovação no cofre nativo e a envia somente ao endpoint próprio", async () => {
  const modulo = await import("../../services/autenticacao/acessoTestadores");
  await modulo.protegerAcessoTestador(resposta as never);
  apoio.api.mockResolvedValue({
    ...resposta,
    credencialRenovacao: "s".repeat(43),
  });
  await modulo.renovarAcessoTestador();
  expect(apoio.api).toHaveBeenCalledWith("/auth/testadores/renovar", {
    method: "POST",
    body: { tipo: "NATIVO", credencialRenovacao: "r".repeat(43) },
  });
  expect([...apoio.cofre.values()]).toEqual(["s".repeat(43)]);
  await modulo.excluirRenovacaoTestador();
  expect(apoio.cofre.size).toBe(0);
});
it("navegador não armazena segredos e não renova depois de sair", async () => {
  apoio.plataforma.OS = "web";
  const modulo = await import("../../services/autenticacao/acessoTestadores");
  await modulo.protegerAcessoTestador({
    ...resposta,
    credencialRenovacao: undefined,
  } as never);
  expect(apoio.navegador.size).toBe(0);
  expect(apoio.cofre.size).toBe(0);
  await modulo.excluirRenovacaoTestador();
  await expect(modulo.renovarAcessoTestador()).rejects.toThrow("novo convite");
  expect(apoio.api).not.toHaveBeenCalled();
  expect([...apoio.navegador.values()]).toEqual(["1"]);
});
it("renovação atrasada não reautoriza uma sessão encerrada", async () => {
  apoio.api.mockResolvedValue(resposta);
  const modulo = await import("../../services/autenticacao/acessoTestadores");
  await expect(modulo.renovarAcessoTestador(() => false)).rejects.toThrow();
  expect(apoio.api).toHaveBeenLastCalledWith("/auth/logout", {
    method: "POST",
    token: resposta.sessao.accessToken,
  });
  expect(apoio.cofre.size).toBe(0);
});
