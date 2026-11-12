// @vitest-environment jsdom
import { afterEach, beforeEach, describe, expect, it, vi } from "vitest";
import { act, cleanup, render, waitFor } from "@testing-library/react";
import { useContext } from "react";
import {
  ContextoAutenticacao,
  ProvedorAutenticacao,
  type ValorContextoAutenticacao,
} from "../../contexts/ContextoAutenticacao";
import { ErroApi } from "../../services/transporteApi";

type OpcoesApi = { token?: string; body?: Record<string, unknown> };
const apoio = vi.hoisted(() => ({
  convites: true,
  paciente: false,
  manterPaciente: false,
  testador: false,
  semRede: false,
  revogado: false,
  cofre: new Map<string, string>(),
  cliente: { clear: vi.fn() },
  retomar: null as null | ((estado: string) => void),
  api: vi.fn<(caminho: string, opcoes?: OpcoesApi) => Promise<unknown>>(),
}));
vi.mock("react-native", () => ({
  Platform: { OS: "android" },
  AppState: {
    addEventListener: (_evento: string, callback: (estado: string) => void) => {
      apoio.retomar = callback;
      return {
        remove: () => {
          apoio.retomar = null;
        },
      };
    },
  },
}));
vi.mock("expo-secure-store", () => ({
  getItemAsync: async (chave: string) => apoio.cofre.get(chave) ?? null,
  setItemAsync: async (chave: string, valor: string) => {
    apoio.cofre.set(chave, valor);
  },
  deleteItemAsync: async (chave: string) => {
    apoio.cofre.delete(chave);
  },
  WHEN_UNLOCKED_THIS_DEVICE_ONLY: 1,
}));
vi.mock("@tanstack/react-query", () => ({
  useQueryClient: () => apoio.cliente,
}));
vi.mock("../../services/ambiente", () => ({
  acessoDemonstracao: false,
  get acessoTestadores() {
    return apoio.convites;
  },
}));
vi.mock("../../services/api", () => ({ api: apoio.api }));
vi.mock("../../services/sincronizacao/consultasLocais", () => ({
  consultasLocais: {
    excluir: async () => {},
    guardar: async () => {},
    recuperar: async () => null,
  },
}));
vi.mock("../../services/lembretes/lembretes", () => ({
  cancelarLembretes: async () => {},
}));

const chaveSessao = "viva.session.v1";
function sessao(
  pessoa: "A" | "B",
  origemAcesso?: "PACIENTE" | "TESTADOR",
  expirada = false,
) {
  return {
    accessToken: `sessao-sintetica-${pessoa}`,
    expiresAt: new Date(
      Date.now() + (expirada ? -60000 : 3600000),
    ).toISOString(),
    user: {
      id: `00000000-0000-4000-8000-00000000000${pessoa === "A" ? 1 : 2}`,
      email: `ficticio-${pessoa}@teste.invalid`,
      displayName: `Pessoa Sintética ${pessoa}`,
      role: "PATIENT" as const,
      organizationId: "00000000-0000-4000-8000-000000000003",
    },
    ...(origemAcesso ? { origemAcesso } : {}),
  };
}
function guardar(
  pessoa: "A" | "B",
  origem?: "PACIENTE" | "TESTADOR",
  expirada = false,
) {
  apoio.cofre.set(
    chaveSessao,
    JSON.stringify(sessao(pessoa, origem, expirada)),
  );
  if (pessoa === "B") {
    apoio.testador = true;
    apoio.cofre.set("viva.testador.renovacao.v1", "r".repeat(43));
  } else {
    apoio.paciente = apoio.manterPaciente = true;
    apoio.cofre.set("viva.dispositivo.paciente.v1", "p".repeat(43));
  }
}
let contexto: ValorContextoAutenticacao;
function Capturar() {
  const valor = useContext(ContextoAutenticacao);
  if (!valor) throw new Error("Contexto de teste ausente");
  contexto = valor;
  return null;
}
async function abrir() {
  const pagina = render(
    <ProvedorAutenticacao>
      <Capturar />
    </ProvedorAutenticacao>,
  );
  await waitFor(() => expect(contexto.restaurando).toBe(false));
  return pagina;
}
beforeEach(() => {
  vi.restoreAllMocks();
  apoio.api.mockReset();
  apoio.cofre.clear();
  apoio.convites = true;
  apoio.paciente =
    apoio.manterPaciente =
    apoio.testador =
    apoio.semRede =
    apoio.revogado =
      false;
  apoio.retomar = null;
  apoio.api.mockImplementation(async (caminho, opcoes) => {
    if (apoio.semRede) throw new ErroApi("Sem conexão no teste", 0);
    if (caminho === "/auth/me") {
      if (apoio.revogado) throw new ErroApi("Sessão revogada", 401);
      return sessao(opcoes?.token?.endsWith("B") ? "B" : "A").user;
    }
    if (caminho === "/auth/paciente/iniciar") {
      apoio.paciente = apoio.manterPaciente = true;
      return {
        estado: "AUTENTICADO",
        sessao: sessao("A"),
        credencialDispositivo: "p".repeat(43),
      };
    }
    if (caminho === "/auth/paciente/renovar") {
      if (!apoio.paciente || !apoio.manterPaciente || apoio.revogado)
        throw new ErroApi("Não autorizado", 401);
      return {
        estado: "AUTENTICADO",
        sessao: sessao("A"),
        credencialDispositivo: "p".repeat(43),
      };
    }
    if (
      caminho === "/auth/testadores/convite" ||
      caminho === "/auth/testadores/renovar"
    ) {
      if (caminho.endsWith("renovar") && (!apoio.testador || apoio.revogado))
        throw new ErroApi("Convite revogado", 401);
      apoio.testador = true;
      return { sessao: sessao("B"), credencialRenovacao: "r".repeat(43) };
    }
    if (caminho === "/auth/logout") {
      if (opcoes?.token?.endsWith("A")) apoio.manterPaciente = false;
      if (opcoes?.token?.endsWith("B")) apoio.testador = false;
      return;
    }
    throw new Error(`Rota inesperada no teste: ${caminho}`);
  });
});
afterEach(cleanup);

describe("restauração e persistência da origem no cofre nativo", () => {
  it.each([
    ["A", "PACIENTE"],
    ["B", "TESTADOR"],
  ] as const)(
    "restaura %s e a origem %s sem renovar sessão válida",
    async (pessoa, origem) => {
      guardar(pessoa, origem);
      await abrir();
      expect(contexto.sessao?.usuario.id).toBe(sessao(pessoa).user.id);
      expect(contexto.origemAcesso).toBe(origem);
      expect(contexto.sessaoPorConvite).toBe(origem === "TESTADOR");
      expect(apoio.api.mock.calls.map(([rota]) => rota)).toEqual(["/auth/me"]);
    },
  );
  it("grava a origem após entrar por CPF", async () => {
    await abrir();
    await act(async () => {
      await contexto.entrar("cpf-sintetico", "1950-01-01");
    });
    expect(JSON.parse(apoio.cofre.get(chaveSessao)!)).toMatchObject({
      origemAcesso: "PACIENTE",
    });
  });
  it("grava a origem após entrar por convite", async () => {
    await abrir();
    await act(async () => {
      await contexto.entrarComConvite("x".repeat(43));
    });
    expect(JSON.parse(apoio.cofre.get(chaveSessao)!)).toMatchObject({
      origemAcesso: "TESTADOR",
    });
  });
  it("mantém o convite após CPF, saída, novo convite e reabertura", async () => {
    const pagina = await abrir();
    await act(async () => {
      await contexto.entrar("cpf-sintetico", "1950-01-01");
    });
    await act(async () => {
      await contexto.sair();
    });
    expect(apoio.manterPaciente).toBe(false);
    await act(async () => {
      await contexto.entrarComConvite("x".repeat(43));
    });
    pagina.unmount();
    await abrir();
    expect(contexto.sessao?.usuario.id).toBe(sessao("B").user.id);
    expect(contexto.sessaoPorConvite).toBe(true);
  });
  it("mantém sessão antiga sem inferir a origem no build misto", async () => {
    guardar("B");
    await abrir();
    expect(contexto.sessao?.usuario.id).toBe(sessao("B").user.id);
    expect(contexto.origemAcesso).toBeNull();
  });
  it("preserva compatibilidade de sessão antiga no build somente CPF", async () => {
    apoio.convites = false;
    guardar("A");
    await abrir();
    expect(contexto.origemAcesso).toBe("PACIENTE");
  });
  it("ao sair de sessão antiga sem origem não promete manter a autorização", async () => {
    guardar("B");
    await abrir();
    await act(async () => {
      await contexto.sair();
    });
    expect(contexto.aviso).toBe(
      "Sessão encerrada. Para voltar a entrar, procure sua equipe.",
    );
  });
  it.each(["TESTADOR", undefined] as const)(
    "origem %s não usa a desautorização exclusiva do CPF",
    async (origem) => {
      guardar("B", origem);
      await abrir();
      await expect(contexto.esquecerDispositivo()).rejects.toMatchObject({
        estadoResposta: 409,
      });
      expect(
        apoio.api.mock.calls.some(
          ([rota]) => rota === "/auth/paciente/esquecer",
        ),
      ).toBe(false);
      expect(contexto.sessao?.usuario.id).toBe(sessao("B").user.id);
    },
  );
  it.each([
    ["A", "PACIENTE"],
    ["B", "TESTADOR"],
  ] as const)(
    "renova sessão expirada %s e persiste origem %s",
    async (pessoa, origem) => {
      guardar(pessoa, origem, true);
      await abrir();
      expect(contexto.sessao?.usuario.id).toBe(sessao(pessoa).user.id);
      expect(contexto.origemAcesso).toBe(origem);
      expect(JSON.parse(apoio.cofre.get(chaveSessao)!)).toMatchObject({
        origemAcesso: origem,
      });
    },
  );
  it("preserva origem em consulta offline com sessão válida", async () => {
    guardar("B", "TESTADOR");
    apoio.semRede = true;
    await abrir();
    expect(contexto.sessao?.usuario.id).toBe(sessao("B").user.id);
    expect(contexto.sessaoPorConvite).toBe(true);
  });
  it("origem expirada de convite prevalece sobre outra credencial de CPF disponível", async () => {
    guardar("B", "TESTADOR", true);
    apoio.paciente = apoio.manterPaciente = true;
    apoio.cofre.set("viva.dispositivo.paciente.v1", "p".repeat(43));
    await abrir();
    expect(contexto.sessao?.usuario.id).toBe(sessao("B").user.id);
    expect(
      apoio.api.mock.calls.some(([rota]) => rota === "/auth/paciente/renovar"),
    ).toBe(false);
  });
  it("origem expirada de CPF recusada não migra para outra sessão de convite", async () => {
    guardar("A", "PACIENTE", true);
    apoio.manterPaciente = false;
    apoio.testador = true;
    apoio.cofre.set("viva.testador.renovacao.v1", "r".repeat(43));
    await abrir();
    expect(contexto.sessao).toBeNull();
    expect(
      apoio.api.mock.calls.some(
        ([rota]) => rota === "/auth/testadores/renovar",
      ),
    ).toBe(false);
  });
  it("sair remove sessão e renovação do convite, impedindo restauração", async () => {
    guardar("B", "TESTADOR");
    const pagina = await abrir();
    await act(async () => {
      await contexto.sair();
    });
    expect(apoio.cofre.has(chaveSessao)).toBe(false);
    expect(apoio.cofre.has("viva.testador.renovacao.v1")).toBe(false);
    expect(contexto.origemAcesso).toBeNull();
    pagina.unmount();
    await abrir();
    expect(contexto.sessao).toBeNull();
  });
  it("sessão revogada não é restaurada nem mantém o token no cofre", async () => {
    guardar("B", "TESTADOR");
    apoio.revogado = true;
    await abrir();
    expect(contexto.sessao).toBeNull();
    expect(JSON.parse(apoio.cofre.get(chaveSessao)!)).toEqual({
      somenteOrigem: true,
      origemAcesso: "TESTADOR",
    });
  });
  it("reabertura após expirar offline mantém o canal sem conservar o token expirado", async () => {
    guardar("B", "TESTADOR", true);
    apoio.paciente = apoio.manterPaciente = true;
    apoio.cofre.set("viva.dispositivo.paciente.v1", "p".repeat(43));
    apoio.semRede = true;
    const pagina = await abrir();
    expect(contexto.sessao).toBeNull();
    expect(JSON.parse(apoio.cofre.get(chaveSessao)!)).toEqual({
      somenteOrigem: true,
      origemAcesso: "TESTADOR",
    });
    pagina.unmount();
    apoio.semRede = false;
    await abrir();
    expect(contexto.sessao?.usuario.id).toBe(sessao("B").user.id);
  });
});
