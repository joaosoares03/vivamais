import type { RespostaAutenticacao } from "./index";
import { interpretarDataCivil, hojeBrasil } from "./datas";
export type TipoDispositivoPaciente = "WEB" | "NATIVO";
export interface RespostaAcessoPaciente {
  estado: "AUTENTICADO" | "VERIFICACAO_NECESSARIA";
  desafio?: string;
  desafioExpiraEm?: string;
  sessao?: RespostaAutenticacao;
  credencialDispositivo?: string;
  dispositivoExpiraEm?: string;
}
export interface EstadoAtivacaoPaciente {
  estado:
    | "DEMONSTRACAO_HABILITADA"
    | "TESTE_POR_CONVITE"
    | "TESTE_DESATIVADO"
    | "AGUARDANDO_EMISSAO"
    | "AGUARDANDO_ATIVACAO"
    | "EXPIRADO"
    | "ATIVADO"
    | "UTILIZADO_OU_SUBSTITUIDO";
  expiraEm: string | null;
  dispositivosAutorizados: number;
  smsDisponivel?: boolean;
  provedorSms?: string;
  envioSms?: {
    idEnvio: string;
    estado: string;
    destinoMascarado: string | null;
    provedor: string;
    atualizadoEm: string;
  } | null;
}

export interface SolicitacaoSmsPaciente {
  idEnvio: string;
  estadoEnvio: string;
  expiraEm: string;
  destinoMascarado: string;
  provedor: string;
}
export function formatarCpf(valor: string): string {
  return valor
    .replace(/\D/g, "")
    .slice(0, 11)
    .replace(/^(\d{3})(\d)/, "$1.$2")
    .replace(/^(\d{3})\.(\d{3})(\d)/, "$1.$2.$3")
    .replace(/(\d{3})\.(\d{3})\.(\d{3})(\d)/, "$1.$2.$3-$4");
}
export function formatarNascimento(valor: string): string {
  return valor
    .replace(/\D/g, "")
    .slice(0, 8)
    .replace(/^(\d{2})(\d)/, "$1/$2")
    .replace(/^(\d{2})\/(\d{2})(\d)/, "$1/$2/$3");
}
export function interpretarNascimento(
  valor: string,
  hoje = new Date(),
): string | null {
  const iso = interpretarDataCivil(valor);
  return iso && iso <= hojeBrasil(hoje) ? iso : null;
}
