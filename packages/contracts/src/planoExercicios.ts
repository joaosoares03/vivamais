// Plano de exercícios definido pela equipe. O sistema não escolhe exercícios: só mostra o que
// o profissional registrou, e só quando a unidade tem aprovação clínica vigente do catálogo.

export const SITUACAO_BLOQUEADA = "BLOCKED_PENDING_CLINICAL_APPROVAL" as const;

export type AprovacaoCatalogoExercicios = {
  id?: string;
  versaoCatalogo?: string;
  nomeResponsavel: string;
  conselho: string;
  registroConselho: string;
  observacao?: string;
  aprovadoEm: string;
  registradoPorNome?: string;
};

export type ItemCatalogoExercicio = {
  id: string;
  nome: string;
  grupo: "COM_RISCO_QUEDA_SENTADO" | "SEM_RISCO_QUEDA_EM_PE";
};

export type CatalogoExercicios = {
  versaoCatalogo: string;
  situacao: "APROVADO" | typeof SITUACAO_BLOQUEADA;
  aprovacao: AprovacaoCatalogoExercicios | null;
  itens: ItemCatalogoExercicio[];
};

export type ItemPlanoExercicio = {
  idExercicio: string;
  nome: string;
  ordem: number;
  /** 1 = segunda-feira ... 7 = domingo. */
  diasSemana: number[];
  duracaoMinutos: number;
  observacao: string;
};

export type PlanoExercicios = {
  id: string;
  situacao: "ATIVO" | typeof SITUACAO_BLOQUEADA;
  versaoCatalogo: string;
  orientacao: string;
  autorNome: string;
  criadoEm: string;
  aprovacao: Pick<
    AprovacaoCatalogoExercicios,
    "nomeResponsavel" | "conselho" | "registroConselho" | "aprovadoEm"
  >;
  itens: ItemPlanoExercicio[];
  semana: {
    inicio: string;
    hoje: string;
    registros: { idExercicio: string; data: string; registros: number }[];
  };
};

export type EntradaPlanoExercicios = {
  idPlanoAtual: string | null;
  orientacao: string;
  itens: {
    idExercicio: string;
    diasSemana: number[];
    duracaoMinutos: number;
    observacao: string;
  }[];
};

export const diasSemanaPlano: ReadonlyArray<{
  dia: number;
  curto: string;
  nome: string;
}> = [
  { dia: 1, curto: "Seg", nome: "segunda-feira" },
  { dia: 2, curto: "Ter", nome: "terça-feira" },
  { dia: 3, curto: "Qua", nome: "quarta-feira" },
  { dia: 4, curto: "Qui", nome: "quinta-feira" },
  { dia: 5, curto: "Sex", nome: "sexta-feira" },
  { dia: 6, curto: "Sáb", nome: "sábado" },
  { dia: 7, curto: "Dom", nome: "domingo" },
];

/** Dia da semana ISO (1 = segunda) de uma data local AAAA-MM-DD. */
export function diaSemanaIso(dataLocal: string): number {
  const semana = new Date(`${dataLocal}T12:00:00Z`).getUTCDay();
  return semana === 0 ? 7 : semana;
}

export function descreverDiasSemana(dias: readonly number[]): string {
  const ordenados = [...dias].sort((a, b) => a - b);
  if (ordenados.length === 7) return "Todos os dias";
  if (ordenados.join(",") === "1,2,3,4,5") return "Segunda a sexta";
  return ordenados
    .map((dia) => diasSemanaPlano.find((item) => item.dia === dia)?.curto)
    .filter(Boolean)
    .join(", ");
}

export function planoEstaAtivo(
  plano: PlanoExercicios | null | undefined,
): plano is PlanoExercicios {
  return Boolean(plano && plano.situacao === "ATIVO" && plano.itens.length);
}

/** Itens previstos para hoje, com a indicação de que já houve registro hoje. */
export function itensDeHoje(plano: PlanoExercicios | null | undefined) {
  if (!planoEstaAtivo(plano)) return [];
  const hoje = plano.semana.hoje;
  const dia = diaSemanaIso(hoje);
  return plano.itens
    .filter((item) => item.diasSemana.includes(dia))
    .map((item) => ({
      ...item,
      registradoHoje: plano.semana.registros.some(
        (registro) =>
          registro.idExercicio === item.idExercicio && registro.data === hoje,
      ),
    }));
}

/** Quantas vezes cada item foi registrado na semana, contra quantas estavam previstas até hoje. */
export function progressoSemana(plano: PlanoExercicios | null | undefined) {
  if (!planoEstaAtivo(plano)) return [];
  const diaHoje = diaSemanaIso(plano.semana.hoje);
  return plano.itens.map((item) => ({
    idExercicio: item.idExercicio,
    nome: item.nome,
    previstosAteHoje: item.diasSemana.filter((dia) => dia <= diaHoje).length,
    previstosSemana: item.diasSemana.length,
    diasComRegistro: new Set(
      plano.semana.registros
        .filter((registro) => registro.idExercicio === item.idExercicio)
        .map((registro) => registro.data),
    ).size,
  }));
}
