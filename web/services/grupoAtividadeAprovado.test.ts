import { describe, expect, it } from "vitest";
import {
  descricaoGrupoAtividadeAprovado,
  grupoAtividadeAprovadoDoPerfil,
} from "./grupoAtividadeAprovado";

describe("grupo de atividade aprovado pelo profissional", () => {
  it.each([
    ["NAO_DEFINIDO", "Não liberado / Aguardando avaliação presencial"],
    [
      "COM_RISCO_QUEDA_SENTADO",
      "Grupo Sentado — HAS com mobilidade reduzida ou risco de queda (5 exercícios)",
    ],
    [
      "SEM_RISCO_QUEDA_EM_PE",
      "Grupo em Pé — HAS sem risco de queda e mobilidade preservada (5 exercícios)",
    ],
  ])("mantém o estado %s disponível para a ficha", (grupo, rotulo) => {
    expect(grupoAtividadeAprovadoDoPerfil(grupo)).toBe(grupo);
    expect(descricaoGrupoAtividadeAprovado(grupo)).toBe(rotulo);
  });

  it("bloqueia de forma segura um valor ausente ou fora do contrato", () => {
    expect(grupoAtividadeAprovadoDoPerfil(undefined)).toBe("NAO_DEFINIDO");
    expect(grupoAtividadeAprovadoDoPerfil("OUTRO_GRUPO")).toBe(
      "NAO_DEFINIDO",
    );
  });
});
