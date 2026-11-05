import type { PlanoLembretes } from "./calculoLembretes";
import { preferenciasLembretesPadrao, type PreferenciasLembretes } from "./preferenciasLembretes";
export async function lerPreferenciasLembretes(_titular:string) {return {...preferenciasLembretesPadrao};}
export async function salvarPreferenciasLembretes(_titular:string,_preferencias:PreferenciasLembretes) {throw new Error("Configure notificações em um build Android/iOS.");}
export async function agendarLembretes(
  _owner: string,
  _plans: PlanoLembretes[],
  _ask: boolean,
) {
  return "Lembretes locais não são suportados neste navegador. Use um build Android/iOS e autorize as notificações.";
}
export async function cancelarLembretes(_owner: string) {}
