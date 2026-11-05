import { afterEach, describe, expect, it, vi } from "vitest";
import { fireEvent, render, screen, waitFor } from "@testing-library/react";
import { AtivarContaInstitucional } from "./AtivarContaInstitucional";

const convite = "a".repeat(43);
const responder = (corpo: unknown, status = 200) =>
  new Response(JSON.stringify(corpo), { status });

afterEach(() => {
  vi.restoreAllMocks();
  window.history.replaceState(null, "", "/");
});

describe("ativação de conta institucional", () => {
  it("retira o convite da URL, confirma o autenticador e mostra os códigos", async () => {
    window.history.replaceState(null, "", `/ativar-conta#${convite}`);
    const chamada = vi
      .spyOn(globalThis, "fetch")
      .mockResolvedValueOnce(
        responder({
          email: "pessoa@exemplo.org",
          segredo: "ABCDEFGH",
          uri: "otpauth://totp/Viva",
        }),
      )
      .mockResolvedValueOnce(
        responder({
          email: "pessoa@exemplo.org",
          codigosRecuperacao: ["codigo-um", "codigo-dois"],
        }),
      );
    render(<AtivarContaInstitucional />);
    expect(window.location.hash).toBe("");
    expect(
      await screen.findByLabelText("Chave do autenticador"),
    ).toHaveTextContent("ABCDEFGH");
    fireEvent.change(screen.getByLabelText(/Senha, com pelo menos/), {
      target: { value: "senha-de-teste-longa" },
    });
    fireEvent.change(screen.getByLabelText("Repita a senha"), {
      target: { value: "senha-de-teste-longa" },
    });
    fireEvent.change(screen.getByLabelText(/Código de 6 números/), {
      target: { value: "123456" },
    });
    fireEvent.click(screen.getByRole("button", { name: "Ativar minha conta" }));
    expect(await screen.findByText("codigo-um")).toBeInTheDocument();
    expect(chamada.mock.calls[1][0]).toBe("/api/conta/ativar");
    expect(JSON.parse(chamada.mock.calls[1][1]?.body as string)).toEqual({
      convite,
      senha: "senha-de-teste-longa",
      codigoMfa: "123456",
    });
  });

  it("não chama a API sem convite e explica o que fazer", async () => {
    const chamada = vi.spyOn(globalThis, "fetch");
    render(<AtivarContaInstitucional />);
    await waitFor(() =>
      expect(screen.getByText(/Abra o link completo/)).toBeInTheDocument(),
    );
    expect(chamada).not.toHaveBeenCalled();
  });

  it("mostra o motivo quando o convite não vale", async () => {
    window.history.replaceState(null, "", `/ativar-conta#${convite}`);
    vi.spyOn(globalThis, "fetch").mockResolvedValueOnce(
      responder({ detail: "Convite inválido." }, 401),
    );
    render(<AtivarContaInstitucional />);
    expect(await screen.findByRole("alert")).toHaveTextContent(
      "Convite inválido.",
    );
  });
});
