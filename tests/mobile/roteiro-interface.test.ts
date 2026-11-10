import { createElement, type ReactNode } from "react";
import { renderToStaticMarkup } from "react-dom/server";
import { beforeEach, describe, expect, it, vi } from "vitest";

const estado = vi.hoisted(() => ({
  pressao: null as boolean | null,
  definirPressao: vi.fn(),
  navegar: vi.fn(),
  botoes: new Map<string, () => void>(),
}));
vi.mock("expo-router", () => ({
  Redirect: () => null,
  router: { push: estado.navegar },
}));
vi.mock("react-native", () => ({
  View: ({ children }: { children: ReactNode }) =>
    createElement("div", null, children),
  Image: () => null,
  Pressable: (p: {
    children: ReactNode;
    accessibilityLabel: string;
    accessibilityState?: { checked: boolean };
    onPress: () => void;
  }) => {
    estado.botoes.set(p.accessibilityLabel, p.onPress);
    return createElement(
      "button",
      {
        "aria-label": p.accessibilityLabel,
        "aria-checked": p.accessibilityState?.checked,
      },
      p.children,
    );
  },
}));
vi.mock("../../components/TextoAcessivel", () => ({
  Text: ({ children }: { children: ReactNode }) =>
    createElement("span", null, children),
}));
vi.mock("../../components/estilos", () => ({ estilos: {} }));
vi.mock("../../components/BarraNavegacao", () => ({
  BarraNavegacao: () => null,
}));
vi.mock("../../components/IlustracoesViva", () => ({
  IlustracaoViva: () => null,
}));
vi.mock("../../components/VideoGuiadoAtividade", () => ({
  VideoGuiadoAtividade: () => null,
}));
vi.mock("../../components/ElementosInterface", () => ({
  Tela: ({ children }: { children: ReactNode }) =>
    createElement("main", null, children),
  Botao: ({ rotulo, onPress }: { rotulo: string; onPress: () => void }) => {
    estado.botoes.set(rotulo, onPress);
    return createElement("button", null, rotulo);
  },
  Carregando: () => null,
  MensagemErro: () => null,
}));
vi.mock("../../hooks/useAutenticacao", () => ({
  useAutenticacao: () => ({ sessao: {}, restaurando: false }),
}));
vi.mock("../../hooks/useDadosAtividade", () => ({
  useDadosAtividade: () => ({ data: null }),
}));
vi.mock("../../hooks/useRoteiroAtividade", () => ({
  useRoteiroAtividade: () => ({
    pressaoVerificada: estado.pressao,
    definirPressaoVerificada: estado.definirPressao,
    grupoCatalogoAtivo: () => null,
    atividadesDoGrupoProfissional: () => [],
    gruposCatalogo: [],
    avaliarBloqueioSugestao: () => "DADOS_AUSENTES",
  }),
}));
vi.mock("../../services/atividades/atividades", () => ({
  buscarAtividadeAprovada: () => ({
    id: "ex02-marcha-sentada",
    nome: "Marcha sentada",
  }),
  obterMidiasAtividade: () => ({}),
}));

import { RoteiroAtividade } from "../../components/RoteiroAtividade";

describe("regressões observadas na homologação de exercícios", () => {
  beforeEach(() => {
    estado.pressao = null;
    estado.botoes.clear();
    vi.clearAllMocks();
  });

  it.each([null, true, false])(
    "mostra o indicador coerente com a resposta %s",
    (resposta) => {
      estado.pressao = resposta;
      const html = renderToStaticMarkup(
        createElement(RoteiroAtividade, { etapa: "pressao" }),
      );
      for (const [rotulo, valor] of [
        ["Sim, já verifiquei", true],
        ["Ainda não verifiquei", false],
      ] as const) {
        const selecionado = resposta === valor;
        expect(html).toContain(
          `aria-label="${rotulo}" aria-checked="${selecionado}"><span>${selecionado ? "✓" : "○"}</span>`,
        );
      }
      estado.botoes.get("Ainda não verifiquei")!();
      expect(estado.definirPressao).toHaveBeenCalledWith(false);
    },
  );

  it("abre o formulário pelo vídeo apenas após ação explícita, sem registrar ao assistir", () => {
    const html = renderToStaticMarkup(
      createElement(RoteiroAtividade, {
        etapa: "video",
        atividadeId: "ex02-marcha-sentada",
      }),
    );
    expect(html).toContain("Assistir ao vídeo não registra uma atividade.");
    expect(estado.navegar).not.toHaveBeenCalled();
    estado.botoes.get("Registrar somente se já realizei esta atividade")!();
    expect(estado.navegar).toHaveBeenCalledWith({
      pathname: "/atividade-fisica/registro",
      params: { atividade: "Marcha sentada" },
    });
  });
});
