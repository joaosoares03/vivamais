import { describe, expect, it } from "vitest";
import {
  atividadesDoGrupo,
  atividadesDoGrupoProfissional,
  avaliarBloqueioSugestaoAtividade,
  catalogoAtividadesAprovadas,
  grupoCatalogoAtividadeAprovado,
} from "../../services/atividades/atividades";

describe("catálogo G16 de atividades", () => {
  it("separa os dez materiais aprovados nos dois grupos definidos pela gestão", () => {
    expect(catalogoAtividadesAprovadas).toHaveLength(10);
    expect(
      atividadesDoGrupo("RISCO_QUEDA_MOBILIDADE_REDUZIDA").map(
        (atividade) => atividade.id,
      ),
    ).toEqual([
      "ex02-marcha-sentada",
      "ex03-bomba-panturrilha",
      "ex04-extensao-joelho",
      "ex07-alongamento-pescoco",
      "ex08-alongamento-panturrilha",
    ]);
    expect(
      atividadesDoGrupo("SEM_RISCO_QUEDA_MOBILIDADE_PRESERVADA").map(
        (atividade) => atividade.id,
      ),
    ).toEqual([
      "ex01-caminhada-plano",
      "ex05-giro-ombros",
      "ex06-abertura-peito",
      "ex09-passo-lateral",
      "ex10-elevacao-calcanhar-pe",
    ]);
  });

  it("mantém o roteiro bloqueado sem dados ou sem grupo liberado", () => {
    expect(
      avaliarBloqueioSugestaoAtividade({
        dados: undefined,
        estadoInformado: "WELL",
        pressaoVerificada: true,
      }),
    ).toBe("DADOS_AUSENTES");
    expect(
      avaliarBloqueioSugestaoAtividade({
        dados: {
          idade: 70,
          perfil: {
            mobilidade: "Registrada",
            equilibrio: "Registrado",
            restricoes: "",
            orientacoes: "",
            grupoCatalogoAprovado: "NAO_DEFINIDO",
          },
          ultimaMedicao: null,
        },
        estadoInformado: "WELL",
        pressaoVerificada: true,
      }),
    ).toBe("GRUPO_PROFISSIONAL_NAO_LIBERADO");
  });

  it("filtra o roteiro para os cinco materiais sentados aprovados", () => {
    expect(
      grupoCatalogoAtividadeAprovado("COM_RISCO_QUEDA_SENTADO"),
    ).toBe("RISCO_QUEDA_MOBILIDADE_REDUZIDA");
    expect(
      atividadesDoGrupoProfissional("COM_RISCO_QUEDA_SENTADO").map(
        (atividade) => atividade.id,
      ),
    ).toEqual([
      "ex02-marcha-sentada",
      "ex03-bomba-panturrilha",
      "ex04-extensao-joelho",
      "ex07-alongamento-pescoco",
      "ex08-alongamento-panturrilha",
    ]);
    expect(
      avaliarBloqueioSugestaoAtividade({
        dados: {
          idade: 70,
          perfil: {
            mobilidade: "Registrada",
            equilibrio: "Registrado",
            restricoes: "",
            orientacoes: "",
            grupoCatalogoAprovado: "COM_RISCO_QUEDA_SENTADO",
          },
          ultimaMedicao: null,
        },
        estadoInformado: "WELL",
        pressaoVerificada: true,
      }),
    ).toBeNull();
  });

  it("filtra o roteiro para os cinco materiais em pé aprovados", () => {
    expect(
      grupoCatalogoAtividadeAprovado("SEM_RISCO_QUEDA_EM_PE"),
    ).toBe("SEM_RISCO_QUEDA_MOBILIDADE_PRESERVADA");
    expect(
      atividadesDoGrupoProfissional("SEM_RISCO_QUEDA_EM_PE").map(
        (atividade) => atividade.id,
      ),
    ).toEqual([
      "ex01-caminhada-plano",
      "ex05-giro-ombros",
      "ex06-abertura-peito",
      "ex09-passo-lateral",
      "ex10-elevacao-calcanhar-pe",
    ]);
  });

  it.each([
    ["mal-estar informado", "UNWELL", ""],
    ["restrição ativa", "WELL", "Não realizar hoje"],
  ])(
    "mantém o bloqueio com %s mesmo havendo grupo aprovado",
    (_motivo, estadoInformado, restricoes) => {
    expect(
      avaliarBloqueioSugestaoAtividade({
        dados: {
          idade: 70,
          perfil: {
            mobilidade: "Registrada",
            equilibrio: "Registrado",
            restricoes,
            orientacoes: "",
            grupoCatalogoAprovado: "SEM_RISCO_QUEDA_EM_PE",
          },
          ultimaMedicao: null,
        },
        estadoInformado: estadoInformado as "WELL" | "UNWELL",
        pressaoVerificada: true,
      }),
    ).toBe("SINAL_DE_ALERTA_OU_CONTRAINDICACAO");
    },
  );
});
