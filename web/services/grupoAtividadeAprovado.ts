import {
  normalizarGrupoCatalogoProfissional,
  type GrupoCatalogoProfissional,
} from "@viva/contracts";

export const opcoesGrupoAtividadeAprovado: ReadonlyArray<{
  valor: GrupoCatalogoProfissional;
  rotulo: string;
  descricao: string;
}> = [
  {
    valor: "NAO_DEFINIDO",
    rotulo: "Não liberado / Aguardando avaliação presencial",
    descricao:
      "Mantém o roteiro de atividades bloqueado para este paciente.",
  },
  {
    valor: "COM_RISCO_QUEDA_SENTADO",
    rotulo:
      "Grupo Sentado — HAS com mobilidade reduzida ou risco de queda (5 exercícios)",
    descricao: "Vincula os cinco materiais educativos do grupo sentado.",
  },
  {
    valor: "SEM_RISCO_QUEDA_EM_PE",
    rotulo:
      "Grupo em Pé — HAS sem risco de queda e mobilidade preservada (5 exercícios)",
    descricao:
      "Vincula os cinco materiais educativos do grupo em pé e mobilidade preservada.",
  },
];

export function grupoAtividadeAprovadoDoPerfil(
  valor: unknown,
): GrupoCatalogoProfissional {
  return normalizarGrupoCatalogoProfissional(valor);
}

export function descricaoGrupoAtividadeAprovado(valor: unknown) {
  const grupo = grupoAtividadeAprovadoDoPerfil(valor);
  return (
    opcoesGrupoAtividadeAprovado.find((opcao) => opcao.valor === grupo)
      ?.rotulo ?? opcoesGrupoAtividadeAprovado[0].rotulo
  );
}
