import { RoteiroAtividade } from "../../components/RoteiroAtividade";
import { useLocalSearchParams } from "expo-router";
export default function EtapaAtividade() {
  const parametros = useLocalSearchParams<{ atividade?: string | string[] }>(),
    atividade = Array.isArray(parametros.atividade)
      ? parametros.atividade[0]
      : parametros.atividade;
  return <RoteiroAtividade etapa="video" atividadeId={atividade} />;
}
