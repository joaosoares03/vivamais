// @vitest-environment jsdom
import { afterEach, expect, it, vi } from "vitest";
import { cleanup, fireEvent, render, screen } from "@testing-library/react";
import { type ReactNode } from "react";
import { RoteiroAtividade } from "../../components/RoteiroAtividade";
import { ProvedorAtividade } from "../../contexts/ContextoAtividade";

// Pressable real do adaptador web: simular aria-checked aqui ocultaria a regressão.
vi.mock("react-native", async () => vi.importActual("react-native-web"));
vi.mock("expo-router", () => ({
  Redirect: () => null,
  router: { push: vi.fn(), dismissTo: vi.fn() },
}));
vi.mock("../../hooks/useAutenticacao", () => ({
  useAutenticacao: () => ({
    sessao: { usuario: { id: "paciente-sintetico" } },
    restaurando: false,
  }),
}));
vi.mock("../../hooks/useDadosAtividade", () => ({
  useDadosAtividade: () => ({ data: null, isPending: false, isError: false }),
}));
vi.mock("../../components/TextoAcessivel", async () => {
  const { createElement } = await import("react");
  return {
    Text: ({ children }: { children?: ReactNode }) =>
      createElement("span", null, children),
  };
});
vi.mock("../../components/ElementosInterface", async () => {
  const { createElement } = await import("react");
  return {
    Tela: ({ children }: { children?: ReactNode }) =>
      createElement("div", null, children),
    Botao: ({
      rotulo,
      onPress,
      desabilitado,
    }: {
      rotulo: string;
      onPress: () => void;
      desabilitado?: boolean;
    }) =>
      createElement(
        "button",
        { onClick: onPress, disabled: desabilitado },
        rotulo,
      ),
    Carregando: () => null,
    MensagemErro: () => null,
  };
});
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
afterEach(cleanup);

it("anuncia uma única opção de sentimento marcada no navegador", () => {
  render(
    <ProvedorAtividade>
      <RoteiroAtividade etapa="sentimento" />
    </ProvedorAtividade>,
  );
  const bem = screen.getByRole("radio", { name: "Estou bem" });
  const mal = screen.getByRole("radio", {
    name: "Estou com tontura ou me sentindo mal",
  });
  expect(
    (screen.getByRole("button", { name: "Continuar" }) as HTMLButtonElement)
      .disabled,
  ).toBe(true);
  fireEvent.click(bem);
  expect(screen.getAllByRole("radio", { checked: true })).toHaveLength(1);
  expect(bem.getAttribute("aria-checked")).toBe("true");
  fireEvent.click(mal);
  expect(bem.getAttribute("aria-checked")).toBe("false");
  expect(mal.getAttribute("aria-checked")).toBe("true");
  expect(screen.getAllByRole("radio", { checked: true })).toHaveLength(1);
});

it("sim e não alternam o estado acessível da conferência de pressão", () => {
  render(
    <ProvedorAtividade>
      <RoteiroAtividade etapa="pressao" />
    </ProvedorAtividade>,
  );
  const sim = screen.getByRole("radio", { name: "Sim, já verifiquei" });
  const nao = screen.getByRole("radio", { name: "Ainda não verifiquei" });
  expect(
    (screen.getByRole("button", { name: "Continuar" }) as HTMLButtonElement)
      .disabled,
  ).toBe(true);
  fireEvent.click(sim);
  expect(sim.getAttribute("aria-checked")).toBe("true");
  fireEvent.click(nao);
  expect(sim.getAttribute("aria-checked")).toBe("false");
  expect(nao.getAttribute("aria-checked")).toBe("true");
  expect(screen.getAllByRole("radio", { checked: true })).toHaveLength(1);
  expect(
    (screen.getByRole("button", { name: "Continuar" }) as HTMLButtonElement)
      .disabled,
  ).toBe(false);
});
