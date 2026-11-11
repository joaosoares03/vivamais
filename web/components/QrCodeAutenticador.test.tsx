import { describe, expect, it } from "vitest";
import { render, screen } from "@testing-library/react";
import { caminhoQrCode, QrCodeAutenticador } from "./QrCodeAutenticador";

const endereco =
  "otpauth://totp/Viva%2B%3Apessoa%40exemplo.org?secret=ABCDEFGHIJKLMNOPQRSTUVWXYZ234567&issuer=Viva%2B&digits=6&period=30";

describe("QR code do autenticador", () => {
  it("gera uma matriz válida com margem e padrão de posição no canto", () => {
    const { caminho, lado } = caminhoQrCode(endereco);
    const modulos = lado - 8;
    // Versões QR têm 21 + 4n módulos por lado.
    expect((modulos - 21) % 4).toBe(0);
    expect(modulos).toBeGreaterThanOrEqual(21);
    // Canto superior esquerdo do padrão de posição, já deslocado pela margem.
    expect(caminho.startsWith("M4 4h1v1h-1z")).toBe(true);
  });

  it("muda com o conteúdo e não usa estilo inline", () => {
    expect(caminhoQrCode(endereco).caminho).not.toBe(
      caminhoQrCode(endereco.replace("ABCDEFGH", "HGFEDCBA")).caminho,
    );
    const { container } = render(<QrCodeAutenticador endereco={endereco} />);
    expect(
      screen.getByRole("img", {
        name: "QR code para o aplicativo autenticador",
      }),
    ).toBeInTheDocument();
    expect(container.querySelector("[style]")).toBeNull();
  });
});
