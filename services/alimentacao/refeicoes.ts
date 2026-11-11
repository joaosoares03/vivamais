type Requisicao = <T>(
  caminho: string,
  opcoes?: { method?: "GET" | "POST" | "PUT"; body?: unknown },
) => Promise<T>;
interface RefeicaoApi {
  id: string;
  fileId: string;
  occurredAt: string;
  notes: string;
  analysisStatus: string;
  assessment?: AnaliseEducativa | null;
}
export interface ResultadoRefeicao {
  id: string;
  idArquivo: string;
  dataOcorrencia: string;
  observacoes: string;
  situacaoAnalise: string;
  avaliacao: (AnaliseEducativa & {
    cor?: string;
    alimentos: string[];
    explicacao: string;
    limitacoes: string;
  }) | null;
}
export async function buscarResultadoRefeicao(
  requisicao: Requisicao,
  idRefeicao: string,
): Promise<ResultadoRefeicao> {
  const resposta = await requisicao<RefeicaoApi>(`/refeicoes/${idRefeicao}`);
  return {
    id: resposta.id,
    idArquivo: resposta.fileId,
    dataOcorrencia: resposta.occurredAt,
    observacoes: resposta.notes,
    situacaoAnalise: resposta.analysisStatus,
    avaliacao: resposta.assessment
      ? {
          ...resposta.assessment,
          cor: resposta.assessment.trafficLight || undefined,
          alimentos: resposta.assessment.identifiedFoods || [],
          explicacao: resposta.assessment.explanation ?? "",
          limitacoes: resposta.assessment.limitations ?? "",
        }
      : null,
  };
}
export async function obterLinkFotoPrivada(
  requisicao: Requisicao,
  idArquivo: string,
) {
  return requisicao<{ path: string }>(`/files/${idArquivo}/link`, {
    method: "POST",
    body: {},
  });
}
import type { AnaliseEducativa } from "./apresentacao";
