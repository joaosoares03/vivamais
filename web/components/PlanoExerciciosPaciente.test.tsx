import { describe, expect, it } from "vitest";
import { entradaDoFormulario } from "./PlanoExerciciosPaciente";

const grupo = ["ex02-marcha-sentada", "ex03-bomba-panturrilha"];
function formulario(campos: [string, string][]) {
  const dados = new FormData();
  for (const [nome, valor] of campos) dados.append(nome, valor);
  return dados;
}

describe("editor do plano de exercícios", () => {
  it("monta a entrada só com os exercícios marcados do grupo", () => {
    expect(
      entradaDoFormulario(
        formulario([
          ["incluir-ex02-marcha-sentada", "on"],
          ["dias-ex02-marcha-sentada", "1"],
          ["dias-ex02-marcha-sentada", "5"],
          ["duracao-ex02-marcha-sentada", "10"],
          ["observacao-ex02-marcha-sentada", " Devagar "],
          ["dias-ex03-bomba-panturrilha", "2"],
          ["duracao-ex03-bomba-panturrilha", "5"],
          ["incluir-ex01-caminhada-plano", "on"],
          ["orientacao", "Plano sintético"],
        ]),
        "plano-atual",
        grupo,
      ),
    ).toEqual({
      idPlanoAtual: "plano-atual",
      orientacao: "Plano sintético",
      itens: [
        {
          idExercicio: "ex02-marcha-sentada",
          diasSemana: [1, 5],
          duracaoMinutos: 10,
          observacao: "Devagar",
        },
      ],
    });
  });

  it("explica o que falta em vez de enviar um plano incompleto", () => {
    expect(entradaDoFormulario(formulario([]), null, grupo)).toBe(
      "Marque pelo menos um exercício.",
    );
    expect(
      entradaDoFormulario(
        formulario([
          ["incluir-ex02-marcha-sentada", "on"],
          ["duracao-ex02-marcha-sentada", "10"],
        ]),
        null,
        grupo,
      ),
    ).toMatch(/pelo menos um dia/);
    expect(
      entradaDoFormulario(
        formulario([
          ["incluir-ex02-marcha-sentada", "on"],
          ["dias-ex02-marcha-sentada", "1"],
          ["duracao-ex02-marcha-sentada", "90"],
        ]),
        null,
        grupo,
      ),
    ).toMatch(/entre 1 e 60/);
  });
});
