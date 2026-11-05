import { useQuery } from "@tanstack/react-query";
import { useAutenticacao } from "./useAutenticacao";
export function useEstadoAnaliseAlimentar() {
  const { sessao, requisicao } = useAutenticacao();
  return useQuery({
    queryKey: ["estado-analise-alimentar", sessao?.usuario.id],
    enabled: Boolean(sessao),
    staleTime: 60000,
    queryFn: () =>
      requisicao<{ enabled: boolean; status: string; message: string }>(
        "/food/status",
      ),
  });
}
