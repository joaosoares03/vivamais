import { beforeEach, expect, it, vi } from "vitest";
import {
  interpretarAcessoProtegido,
  interpretarSessaoProtegida,
} from "../../services/autenticacao/contratoSessao";
import {
  lerSessaoProtegida,
  lerAcessoProtegido,
  salvarSessaoProtegida,
} from "../../services/autenticacao/armazenamentoSessao";

const apoio = vi.hoisted(() => ({
  plataforma: { OS: "android" },
  cofre: new Map<string, string>(),
  salvar: vi.fn(),
}));
vi.mock("react-native", () => ({ Platform: apoio.plataforma }));
vi.mock("expo-secure-store", () => ({
  getItemAsync: async (chave: string) => apoio.cofre.get(chave) ?? null,
  setItemAsync: async (chave: string, valor: string, opcoes: unknown) => {
    apoio.salvar(chave, valor, opcoes);
    apoio.cofre.set(chave, valor);
  },
  deleteItemAsync: async (chave: string) => {
    apoio.cofre.delete(chave);
  },
  WHEN_UNLOCKED_THIS_DEVICE_ONLY: 1,
}));
beforeEach(() => {
  apoio.plataforma.OS = "android";
  apoio.cofre.clear();
  apoio.salvar.mockClear();
});
const base = () => ({
  accessToken: "sessao-sintetica",
  expiresAt: new Date(Date.now() + 60000).toISOString(),
});
it("sessão expirada preserva só a origem para renovação e remove o token do cofre", async () => {
  const valor = JSON.stringify({
    ...base(),
    expiresAt: new Date(Date.now() - 60000).toISOString(),
    origemAcesso: "TESTADOR",
  });
  apoio.cofre.set("viva.session.v1", valor);
  expect(interpretarSessaoProtegida(valor)).toBeNull();
  expect(interpretarAcessoProtegido(valor)).toEqual({
    sessao: null,
    origemAcesso: "TESTADOR",
  });
  expect(await lerAcessoProtegido()).toEqual({
    sessao: null,
    origemAcesso: "TESTADOR",
  });
  expect(JSON.parse(apoio.cofre.get("viva.session.v1")!)).toEqual({
    somenteOrigem: true,
    origemAcesso: "TESTADOR",
  });
  expect(await lerSessaoProtegida()).toBeNull();
});
it.each(["PACIENTE", "TESTADOR"] as const)(
  "persiste e recupera origem %s somente no cofre nativo",
  async (origemAcesso) => {
    await salvarSessaoProtegida({ ...base(), origemAcesso });
    expect(await lerSessaoProtegida()).toMatchObject({ origemAcesso });
    expect(apoio.salvar.mock.calls[0]?.[2]).toEqual({ keychainAccessible: 1 });
  },
);
it("aceita sessão antiga sem inventar origem", () => {
  expect(interpretarSessaoProtegida(JSON.stringify(base()))).not.toHaveProperty(
    "origemAcesso",
  );
});
it.each(["ADMIN", "PATIENT", "", 1, {}, null])(
  "descarta origem inválida %j sem elevar privilégios",
  (origemAcesso) => {
    const lida = interpretarSessaoProtegida(
      JSON.stringify({ ...base(), origemAcesso }),
    );
    expect(lida).not.toBeNull();
    expect(lida).not.toHaveProperty("origemAcesso");
  },
);
it("não lê nem grava token ou origem no armazenamento do navegador", async () => {
  apoio.plataforma.OS = "web";
  await salvarSessaoProtegida({ ...base(), origemAcesso: "TESTADOR" });
  expect(await lerSessaoProtegida()).toBeNull();
  expect(apoio.salvar).not.toHaveBeenCalled();
  expect(apoio.cofre.size).toBe(0);
});
