export type AnaliseEducativaWeb = {
  status?: string;
  trafficLight?: string | null;
  criteriaVersion?: string;
  modelVersion?: string;
};

export function apresentacaoAnaliseAlimentarWeb(
  analise: AnaliseEducativaWeb | null | undefined,
) {
  if (analise?.status === "ASSESSED") {
    if (analise.trafficLight === "GREEN")
      return {
        icone: "✓",
        rotulo: "Verde · orientação educativa",
        classe: "food-green",
        explicacaoHas:
          "Semáforo educativo verde: converse com a equipe sobre esta refeição no cuidado da hipertensão.",
      };
    if (analise.trafficLight === "YELLOW")
      return {
        icone: "!",
        rotulo: "Amarelo · pontos para conversar",
        classe: "food-yellow",
        explicacaoHas:
          "Semáforo educativo amarelo: leve a foto para conversar com a equipe sobre hipertensão.",
      };
    if (analise.trafficLight === "RED")
      return {
        icone: "⚠",
        rotulo: "Vermelho · discutir com a equipe",
        classe: "food-red",
        explicacaoHas:
          "Semáforo educativo vermelho: converse com a equipe antes de concluir algo sobre alimentação e hipertensão.",
      };
  }
  if (analise?.status === "UNCERTAIN" || analise?.status === "REJECTED")
    return {
      icone: "ⓘ",
      rotulo: "Avaliação educativa inconclusiva",
      classe: "food-uncertain",
      explicacaoHas:
        "Não há semáforo para esta foto. Converse com a equipe sobre hipertensão.",
    };
  return {
    icone: "ⓘ",
    rotulo: "Análise automatizada indisponível",
    classe: "food-unavailable",
    explicacaoHas:
      "Nenhum semáforo foi gerado; a foto não mede sódio, gordura, calorias ou pressão arterial.",
  };
}
