import { describe, expect, it } from "vitest";
import { apresentacaoAnaliseAlimentarWeb } from "./apresentacaoAnaliseAlimentar";

describe("semáforo educativo no portal", () => {
  it("diferencia fornecedor indisponível de uma avaliação", () => {
    const resultado = apresentacaoAnaliseAlimentarWeb(null);
    expect(resultado.rotulo).toBe("Análise automatizada indisponível");
    expect(resultado.classe).toBe("food-unavailable");
  });

  it.each([
    ["GREEN", "food-green"],
    ["YELLOW", "food-yellow"],
    ["RED", "food-red"],
  ])("usa texto e contraste próprios para %s", (trafficLight, classe) => {
    const resultado = apresentacaoAnaliseAlimentarWeb({
      status: "ASSESSED",
      trafficLight,
    });
    expect(resultado.classe).toBe(classe);
    expect(resultado.explicacaoHas).toContain("hipertensão");
  });
});
