// @vitest-environment jsdom
import { afterEach, beforeEach, expect, it, vi } from "vitest";
import {
  cleanup,
  fireEvent,
  render,
  screen,
  waitFor,
} from "@testing-library/react";
import { type ReactNode } from "react";
import { FluxoFotografia } from "../../components/FluxoFotografia";
import { ErroApi } from "../../services/transporteApi";

const apoio = vi.hoisted(() => ({
  requisicao:
    vi.fn<
      (rota: string, opcoes?: Record<string, unknown>) => Promise<unknown>
    >(),
  selecionar: vi.fn(),
  liberar: vi.fn(),
}));
vi.mock("react-native", async () => {
  const { createElement } = await import("react");
  return {
    View: ({ children }: { children?: ReactNode }) =>
      createElement("div", null, children),
    Image: ({ accessibilityLabel }: { accessibilityLabel: string }) =>
      createElement("img", { alt: accessibilityLabel }),
    TextInput: ({
      value,
      onChangeText,
      accessibilityLabel,
    }: {
      value: string;
      onChangeText: (valor: string) => void;
      accessibilityLabel: string;
    }) =>
      createElement("textarea", {
        value,
        "aria-label": accessibilityLabel,
        onChange: (evento: { currentTarget: { value: string } }) =>
          onChangeText(evento.currentTarget.value),
      }),
  };
});
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
    Botao: ({
      rotulo,
      onPress,
      ocupado,
      desabilitado,
    }: {
      rotulo: string;
      onPress: () => void;
      ocupado?: boolean;
      desabilitado?: boolean;
    }) =>
      createElement(
        "button",
        { onClick: onPress, disabled: ocupado || desabilitado },
        rotulo,
      ),
    MensagemErro: ({ mensagem }: { mensagem: string }) =>
      createElement("div", { role: "alert" }, mensagem),
  };
});
vi.mock("../../components/estilos", () => ({ estilos: {} }));
vi.mock("../../components/ImagemPrivada", () => ({
  ImagemPrivada: () => null,
}));
vi.mock("expo-router", () => ({ router: { push: vi.fn() } }));
vi.mock("../../services/api", () => ({
  enderecoApi: "https://api.teste.invalid",
}));
vi.mock("../../services/fotografia/prepararFotografia", () => ({
  selecionarFotografia: apoio.selecionar,
}));
vi.mock("../../hooks/useEstadoAnaliseAlimentar", () => ({
  useEstadoAnaliseAlimentar: () => ({
    data: { enabled: false, message: "Análise não habilitada." },
  }),
}));
vi.mock("../../hooks/useAutenticacao", () => ({
  useAutenticacao: () => ({
    sessao: {
      tokenAcesso: "token-sintetico-expirado",
      expiraEm: "2000-01-01T00:00:00Z",
    },
    requisicao: apoio.requisicao,
  }),
}));

const paciente = "00000000-0000-4000-8000-000000000001";
const arquivo = "00000000-0000-4000-8000-000000000002";
async function responder(rota: string, opcoes?: Record<string, unknown>) {
  if (rota.endsWith("/files")) return { id: arquivo };
  if (rota.endsWith("/ocr"))
    return {
      id: arquivo,
      status: "RECOGNIZED",
      systolic: 118,
      diastolic: 76,
      pulse: 71,
      reviewRequired: true,
      message: "Confira os valores.",
    };
  if (opcoes?.method === "POST") return { id: "refeicao-sintetica" };
  return { items: [], total: 0 };
}
beforeEach(() => {
  apoio.requisicao.mockReset().mockImplementation(responder);
  apoio.liberar.mockReset();
  apoio.selecionar.mockReset().mockResolvedValue({
    uri: "blob:foto-sintetica",
    arquivo: new File(["foto sintética"], "foto.jpg", { type: "image/jpeg" }),
    largura: 100,
    altura: 100,
    tamanho: 20,
    liberar: apoio.liberar,
  });
  // Um envio direto com o token da renderização antiga seria recusado.
  vi.stubGlobal(
    "fetch",
    vi.fn().mockResolvedValue(new Response(null, { status: 401 })),
  );
});
afterEach(() => {
  cleanup();
  vi.unstubAllGlobals();
});

async function selecionar(
  finalidade: "MEAL" | "PRESSURE_DISPLAY",
  aoReconhecer = vi.fn(),
) {
  render(
    <FluxoFotografia
      idPaciente={paciente}
      finalidade={finalidade}
      aoReconhecer={aoReconhecer}
    />,
  );
  fireEvent.click(screen.getByRole("button", { name: "Escolher da galeria" }));
  return screen.findByRole("button", {
    name: finalidade === "MEAL" ? "Salvar refeição" : "Enviar foto para OCR",
  });
}

it.each(["MEAL", "PRESSURE_DISPLAY"] as const)(
  "%s usa a requisição protegida mesmo com token antigo na renderização",
  async (finalidade) => {
    const reconhecer = vi.fn();
    const salvar = await selecionar(finalidade, reconhecer);
    fireEvent.click(salvar);
    if (finalidade === "MEAL")
      await screen.findByText(
        "Refeição salva com sucesso. Sua foto permanece privada.",
      );
    else
      await waitFor(() =>
        expect(reconhecer).toHaveBeenCalledWith(
          expect.objectContaining({
            reviewRequired: true,
            systolic: 118,
            diastolic: 76,
          }),
        ),
      );
    expect(fetch).not.toHaveBeenCalled();
    const envio = apoio.requisicao.mock.calls.find(([rota]) =>
      rota.endsWith("/files"),
    );
    expect(envio?.[0]).toBe(`/patients/${paciente}/files`);
    expect(envio?.[1]?.method).toBe("POST");
    expect(envio?.[1]?.formulario).toBeInstanceOf(FormData);
    expect((envio?.[1]?.formulario as FormData).get("purpose")).toBe(
      finalidade,
    );
    expect(
      apoio.requisicao.mock.calls.some(([rota]) => rota.endsWith("/readings")),
    ).toBe(false);
  },
);

it.each([
  [413, "A foto excedeu o limite de envio."],
  [415, "Use uma foto PNG ou JPEG válida."],
] as const)(
  "mantém a foto selecionada quando o servidor recusa com %s",
  async (status, mensagem) => {
    apoio.requisicao.mockImplementation(async (rota, opcoes) => {
      if (rota.endsWith("/files"))
        throw new ErroApi("Texto interno que não deve aparecer.", status);
      return responder(rota, opcoes);
    });
    fireEvent.click(await selecionar("MEAL"));
    await waitFor(() =>
      expect(screen.getByRole("alert").textContent).toContain(mensagem),
    );
    expect(
      screen.getByRole("img", { name: "Foto selecionada para envio" }),
    ).toBeTruthy();
    expect(
      apoio.requisicao.mock.calls.some(
        ([rota, opcoes]) =>
          rota.endsWith("/meals") && opcoes?.method === "POST",
      ),
    ).toBe(false);
  },
);

it("repetir após falha no registro da refeição reutiliza o arquivo já enviado", async () => {
  let tentativas = 0;
  apoio.requisicao.mockImplementation(async (rota, opcoes) => {
    if (
      rota.endsWith("/meals") &&
      opcoes?.method === "POST" &&
      ++tentativas === 1
    )
      throw new ErroApi("Sem rede no teste.", 0);
    return responder(rota, opcoes);
  });
  fireEvent.click(await selecionar("MEAL"));
  await screen.findByRole("alert");
  expect(
    screen.getByRole("img", { name: "Foto selecionada para envio" }),
  ).toBeTruthy();
  fireEvent.click(screen.getByRole("button", { name: "Salvar refeição" }));
  await screen.findByText(
    "Refeição salva com sucesso. Sua foto permanece privada.",
  );
  expect(
    apoio.requisicao.mock.calls.filter(([rota]) => rota.endsWith("/files")),
  ).toHaveLength(1);
  expect(tentativas).toBe(2);
  expect(apoio.liberar).toHaveBeenCalledTimes(1);
});
