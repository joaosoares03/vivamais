import { readFileSync } from "node:fs";
import { resolve } from "node:path";
import { describe, expect, it } from "vitest";
import {
  descreverDiasSemana,
  diaSemanaIso,
  itensDeHoje,
  planoEstaAtivo,
  progressoSemana,
  type PlanoExercicios,
} from "@viva/contracts";
import {
  catalogoAtividadesAprovadas,
  grupoCatalogoAtividadeAprovado,
  VERSAO_CATALOGO_ATIVIDADES,
} from "../../services/atividades/atividades";

function plano(parcial: Partial<PlanoExercicios> = {}): PlanoExercicios {
  return {
    id: "00000000-0000-4000-8000-000000000001",
    situacao: "ATIVO",
    versaoCatalogo: "2026-10-21",
    orientacao: "",
    autorNome: "Profissional sintético",
    criadoEm: "2026-11-09T12:00:00Z",
    aprovacao: {
      nomeResponsavel: "Responsável sintética",
      conselho: "COREN-SP",
      registroConselho: "000000",
      aprovadoEm: "2026-11-09T12:00:00Z",
    },
    itens: [
      {
        idExercicio: "ex02-marcha-sentada",
        nome: "Marcha sentada",
        ordem: 1,
        diasSemana: [1, 3, 5],
        duracaoMinutos: 10,
        observacao: "",
      },
      {
        idExercicio: "ex04-extensao-joelho",
        nome: "Extensão de joelho",
        ordem: 2,
        diasSemana: [2, 3],
        duracaoMinutos: 5,
        observacao: "",
      },
    ],
    // 11/11/2026 é quarta-feira.
    semana: {
      inicio: "2026-11-09",
      hoje: "2026-11-11",
      registros: [
        {
          idExercicio: "ex02-marcha-sentada",
          data: "2026-11-09",
          registros: 1,
        },
        {
          idExercicio: "ex02-marcha-sentada",
          data: "2026-11-11",
          registros: 2,
        },
      ],
    },
    ...parcial,
  };
}

describe("plano de exercícios da equipe", () => {
  it("usa dia da semana ISO no fuso local informado pela API", () => {
    expect(diaSemanaIso("2026-11-09")).toBe(1);
    expect(diaSemanaIso("2026-11-15")).toBe(7);
  });

  it("mostra só os itens previstos para hoje e marca o que já foi registrado", () => {
    expect(itensDeHoje(plano())).toEqual([
      expect.objectContaining({
        idExercicio: "ex02-marcha-sentada",
        registradoHoje: true,
      }),
      expect.objectContaining({
        idExercicio: "ex04-extensao-joelho",
        registradoHoje: false,
      }),
    ]);
  });

  it("não mostra nada quando o plano está bloqueado ou vazio", () => {
    const bloqueado = plano({ situacao: "BLOCKED_PENDING_CLINICAL_APPROVAL" });
    expect(planoEstaAtivo(bloqueado)).toBe(false);
    expect(itensDeHoje(bloqueado)).toEqual([]);
    expect(itensDeHoje(plano({ itens: [] }))).toEqual([]);
    expect(itensDeHoje(null)).toEqual([]);
  });

  it("conta dias com registro sem tratar ausência como falta", () => {
    expect(progressoSemana(plano())).toEqual([
      expect.objectContaining({
        idExercicio: "ex02-marcha-sentada",
        diasComRegistro: 2,
        previstosAteHoje: 2,
        previstosSemana: 3,
      }),
      expect.objectContaining({
        idExercicio: "ex04-extensao-joelho",
        diasComRegistro: 0,
        previstosAteHoje: 2,
        previstosSemana: 2,
      }),
    ]);
  });

  it("descreve os dias de forma legível", () => {
    expect(descreverDiasSemana([1, 2, 3, 4, 5, 6, 7])).toBe("Todos os dias");
    expect(descreverDiasSemana([5, 1, 2, 3, 4])).toBe("Segunda a sexta");
    expect(descreverDiasSemana([5, 1, 3])).toBe("Seg, Qua, Sex");
  });

  it("o catálogo do app é o mesmo que a API usa para validar o plano", () => {
    const daApi = JSON.parse(
      readFileSync(
        resolve(
          process.cwd(),
          "backend/demo/src/main/resources/exercicios/catalogo.json",
        ),
        "utf8",
      ),
    ) as {
      versao: string;
      itens: { id: string; nome: string; grupo: string }[];
    };
    expect(daApi.versao).toBe(VERSAO_CATALOGO_ATIVIDADES);
    expect(
      daApi.itens.map((item) => [
        item.id,
        item.nome,
        grupoCatalogoAtividadeAprovado(item.grupo),
      ]),
    ).toEqual(
      catalogoAtividadesAprovadas.map((item) => [
        item.id,
        item.nome,
        item.grupo,
      ]),
    );
  });
});
