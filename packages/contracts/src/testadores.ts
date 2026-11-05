import type { RespostaAutenticacao } from "./index";
export interface ConviteTestador {
  id: string;
  convite: string;
  expiraEm: string;
}
export interface ConviteTestadorListado {
  id: string;
  criadoEm: string;
  expiraEm: string;
  utilizadoEm: string | null;
  revogadoEm: string | null;
}
export interface RespostaTestador {
  sessao: RespostaAutenticacao;
  credencialRenovacao?: string;
  expiraEm: string;
}
export function extrairConviteTeste(valor: string): string | null {
  const texto = valor.trim();
  if (/^[A-Za-z0-9_-]{43}$/.test(texto)) return texto;
  try {
    const endereco = new URL(texto);
    if (!["vivamais-teste:", "https:"].includes(endereco.protocol)) return null;
    const fragmento = decodeURIComponent(endereco.hash.slice(1));
    return /^[A-Za-z0-9_-]{43}$/.test(fragmento) ? fragmento : null;
  } catch {
    return null;
  }
}
