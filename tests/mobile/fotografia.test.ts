import { describe, it, expect } from "vitest";
import { validarOriginal, mensagemFalhaFotografia, LIMITE_ORIGINAL } from "../../services/fotografia/tipos";
describe("limites e mensagens de fotografias", () => {
  it("aceita fotografia comum acima de 2 MiB e no limite original", () => {
    expect(() => validarOriginal(3 * 1024 * 1024, 4032, 3024)).not.toThrow();
    expect(() => validarOriginal(LIMITE_ORIGINAL, 8064, 6048)).not.toThrow();
  });
  it("rejeita excesso de bytes e de pixels", () => {
    expect(() => validarOriginal(LIMITE_ORIGINAL + 1, 20, 20)).toThrow();
    expect(() => validarOriginal(100, 12000, 12000)).toThrow();
  });
  it("traduz falhas de transporte e conserva mensagens de validação", () => {
    expect(mensagemFalhaFotografia(new TypeError("Failed to fetch"))).toContain("Verifique a conexão");
    expect(mensagemFalhaFotografia(new Error("Escolha outra foto."))).toBe("Escolha outra foto.");
  });
});
