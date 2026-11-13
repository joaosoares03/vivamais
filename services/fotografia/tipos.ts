import { ErroApi } from "../transporteApi";

export const LIMITE_ORIGINAL = 10 * 1024 * 1024;
export const LIMITE_OTIMIZADO = 1800 * 1024;
export type FotografiaPreparada = {
  uri: string;
  arquivo?: File;
  largura: number;
  altura: number;
  tamanho: number;
  liberar: () => void;
};
export function mensagemFalhaFotografia(falha: unknown): string {
  if (falha instanceof ErroApi) {
    if (falha.estadoResposta === 413)
      return "A foto excedeu o limite de envio. Escolha outra imagem para preparação automática.";
    if (falha.estadoResposta === 415) return "Use uma foto PNG ou JPEG válida.";
    if (falha.estadoResposta === 0)
      return "Não foi possível salvar sua foto. Verifique a conexão e tente novamente. Sua seleção foi mantida.";
  }
  if (
    !(falha instanceof Error) ||
    ["TypeError", "TimeoutError", "AbortError"].includes(falha.name)
  )
    return "Não foi possível salvar sua foto. Verifique a conexão e tente novamente. Sua seleção foi mantida.";
  return falha.message;
}
export function validarOriginal(
  tamanho: number,
  largura: number,
  altura: number,
) {
  if (tamanho <= 0 || tamanho > LIMITE_ORIGINAL)
    throw new Error(
      "Escolha uma foto de até 10 MB. As fotos aceitas são reduzidas automaticamente.",
    );
  if (
    largura < 20 ||
    altura < 20 ||
    largura > 12000 ||
    altura > 12000 ||
    largura * altura > 50000000
  )
    throw new Error(
      "Não foi possível preparar esta imagem. Escolha outra foto.",
    );
}
