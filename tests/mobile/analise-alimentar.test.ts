import { describe, expect, it } from "vitest";
import { apresentacaoAnaliseAlimentar } from "../../services/alimentacao/apresentacao";

describe("apresentação G17 da análise educativa", () => {
  it("mantém UNAVAILABLE sem semáforo", () => {
    const resultado = apresentacaoAnaliseAlimentar(null);
    expect(resultado.titulo).toBe("Análise educativa indisponível");
    expect(resultado.exibeSemaforo).toBe(false);
    expect(resultado.descricaoHas).toContain("não mede sódio");
  });

  it.each([
    ["GREEN", "✓", "Verde · orientação educativa"],
    ["YELLOW", "!", "Amarelo · pontos para conversar"],
    ["RED", "⚠", "Vermelho · discutir com a equipe"],
  ])("explica o semáforo %s como orientação para HAS", (cor, icone, titulo) => {
    const resultado = apresentacaoAnaliseAlimentar({
      status: "ASSESSED",
      trafficLight: cor,
    });
    expect(resultado).toMatchObject({ icone, titulo, exibeSemaforo: true });
    expect(resultado.descricaoHas).toContain("hipertensão");
  });

  it("não apresenta semáforo para resposta inconclusiva", () => {
    expect(
      apresentacaoAnaliseAlimentar({ status: "UNCERTAIN" }).exibeSemaforo,
    ).toBe(false);
  });
});
