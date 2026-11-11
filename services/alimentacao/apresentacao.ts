export type AnaliseEducativa = {
  status?: string;
  trafficLight?: string | null;
  explanation?: string;
  limitations?: string;
  identifiedFoods?: string[];
  modelVersion?: string;
  criteriaVersion?: string;
  provider?: string;
  professionalReviewRecommended?: boolean;
};

export type ApresentacaoAnaliseAlimentar = {
  icone: "✓" | "!" | "⚠" | "ⓘ";
  titulo: string;
  corDeFundo: string;
  descricaoHas: string;
  exibeSemaforo: boolean;
};

export function apresentacaoAnaliseAlimentar(
  analise: AnaliseEducativa | null | undefined,
): ApresentacaoAnaliseAlimentar {
  if (analise?.status === "ASSESSED") {
    if (analise.trafficLight === "GREEN")
      return {
        icone: "✓",
        titulo: "Verde · orientação educativa",
        corDeFundo: "#e8f8ee",
        descricaoHas:
          "Semáforo educativo verde: converse com a equipe sobre como esta refeição se encaixa no cuidado da hipertensão.",
        exibeSemaforo: true,
      };
    if (analise.trafficLight === "YELLOW")
      return {
        icone: "!",
        titulo: "Amarelo · pontos para conversar",
        corDeFundo: "#fff7e5",
        descricaoHas:
          "Semáforo educativo amarelo: leve esta foto e os pontos identificados para conversar com a equipe sobre hipertensão.",
        exibeSemaforo: true,
      };
    if (analise.trafficLight === "RED")
      return {
        icone: "⚠",
        titulo: "Vermelho · discutir com a equipe",
        corDeFundo: "#fff0f2",
        descricaoHas:
          "Semáforo educativo vermelho: converse com a equipe de saúde antes de tirar conclusões sobre a alimentação e hipertensão.",
        exibeSemaforo: true,
      };
  }
  if (analise?.status === "UNCERTAIN" || analise?.status === "REJECTED")
    return {
      icone: "ⓘ",
      titulo: "Avaliação educativa inconclusiva",
      corDeFundo: "#fff7e5",
      descricaoHas:
        "A foto não permite uma orientação educativa confiável. Não há semáforo; converse com a equipe sobre hipertensão.",
      exibeSemaforo: false,
    };
  return {
    icone: "ⓘ",
    titulo: "Análise educativa indisponível",
    corDeFundo: "#eef4fa",
    descricaoHas:
      "Nenhum semáforo foi gerado. A foto não mede sódio, gordura, calorias ou pressão arterial.",
    exibeSemaforo: false,
  };
}
