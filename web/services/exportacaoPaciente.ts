export const categoriasExportacao = {
  PRESSAO: "Pressões",
  MEDICAMENTOS: "Planos de medicamentos",
  AUTORRELATOS: "Autorrelatos",
  ALIMENTACAO: "Alimentação",
  ATIVIDADES: "Atividades",
  DIARIO: "Diário",
  CONSULTAS: "Consultas",
  RETIFICACOES: "Retificações de anotações",
} as const;
type Pagina = {
  itens: Record<string, unknown>[];
  total: number;
  pagina: number;
  tamanho: number;
  corteCriacao: string;
};
export async function reunirExportacaoPaciente(
  consultar: (caminho: string) => Promise<Pagina>,
  idPaciente: string,
  inicio = "",
  fim = "",
  aoAvancar: (mensagem: string) => void = () => undefined,
) {
  const registros: Record<string, Record<string, unknown>[]> = {};
  let corte = "",
    quantidade = 0;
  for (const [categoria, rotulo] of Object.entries(categoriasExportacao)) {
    const itens: Record<string, unknown>[] = [],
      identificadores = new Set();
    let pagina = 0,
      total = 0;
    do {
      const filtros = new URLSearchParams({
        pagina: String(pagina),
        tamanho: "100",
      });
      if (inicio) filtros.set("inicio", inicio);
      if (fim) filtros.set("fim", fim);
      if (corte) filtros.set("corteCriacao", corte);
      const resposta = await consultar(
        `/pacientes/${idPaciente}/exportacao/${categoria}?${filtros}`,
      );
      if (
        !Number.isSafeInteger(resposta.total) ||
        resposta.total < 0 ||
        resposta.pagina !== pagina ||
        resposta.tamanho !== 100 ||
        (pagina > 0 && total !== resposta.total) ||
        (corte && corte !== resposta.corteCriacao)
      )
        throw new Error(
          "Os registros mudaram durante a exportação. Tente novamente.",
        );
      corte ||= resposta.corteCriacao;
      total = resposta.total;
      if (quantidade + total > 50000)
        throw new Error(
          "Escolha um período menor para exportar até 50 mil registros por arquivo.",
        );
      for (const item of resposta.itens) {
        if (!item.id || identificadores.has(item.id))
          throw new Error(
            "Não foi possível conferir os registros da exportação. Tente novamente.",
          );
        identificadores.add(item.id);
        itens.push(item);
      }
      aoAvancar(`${rotulo}: ${itens.length} de ${total}`);
      if (
        (!resposta.itens.length && itens.length < total) ||
        itens.length > total
      )
        throw new Error("Exportação incompleta. Nenhum arquivo foi gerado.");
      pagina++;
    } while (itens.length < total);
    registros[categoria] = itens;
    quantidade += itens.length;
  }
  return {
    formato: "Viva+ JSON 1",
    idPaciente,
    inicio: inicio || null,
    fim: fim || null,
    corteCriacao: corte,
    geradoEm: new Date().toISOString(),
    quantidade,
    registros,
    observacao:
      "Dados autorizados consultados durante a exportação. Fotografias e credenciais não são incluídas.",
  };
}
