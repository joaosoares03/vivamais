import { useQuery } from "@tanstack/react-query";
import type { PlanoExercicios } from "@viva/contracts";
import { useAutenticacao } from "./useAutenticacao";
import { useResumoPaciente } from "./useResumoPaciente";

export function chavePlanoExercicios(idPaciente: string | undefined) {
  return ["plano-exercicios", idPaciente] as const;
}

/** Plano definido pela equipe; null quando não existe plano para o paciente. */
export function usePlanoExercicios() {
  const { requisicao } = useAutenticacao(),
    resumo = useResumoPaciente(),
    idPaciente = resumo.data?.id;
  return useQuery({
    queryKey: chavePlanoExercicios(idPaciente),
    enabled: Boolean(idPaciente),
    queryFn: async () =>
      (await requisicao<PlanoExercicios | undefined>(
        `/pacientes/${idPaciente}/plano-exercicios`,
      )) ?? null,
  });
}
