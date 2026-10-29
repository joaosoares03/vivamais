import { useContext } from "react";
import { ContextoAtividade } from "../contexts/ContextoAtividade";
import {
  avaliarBloqueioSugestaoAtividade,
  atividadesDoGrupoProfissional,
  catalogoAtividadesAprovadas,
  grupoCatalogoAtividadeAprovado,
  gruposCatalogoAtividade,
} from "../services/atividades/atividades";
export function useRoteiroAtividade() {
  const contexto = useContext(ContextoAtividade);
  if (!contexto) throw new Error("Provedor de atividade ausente.");
  return {
    ...contexto,
    catalogo: catalogoAtividadesAprovadas,
    gruposCatalogo: gruposCatalogoAtividade,
    avaliarBloqueioSugestao: avaliarBloqueioSugestaoAtividade,
    grupoCatalogoAtivo: grupoCatalogoAtividadeAprovado,
    atividadesDoGrupoProfissional,
  };
}
