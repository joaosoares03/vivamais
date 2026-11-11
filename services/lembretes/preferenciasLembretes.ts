export type PreferenciasLembretes={habilitados:boolean;antecipar:boolean};
export const preferenciasLembretesPadrao: PreferenciasLembretes={habilitados:false,antecipar:true};
export function normalizarPreferenciasLembretes(valor: unknown): PreferenciasLembretes {
  if(!valor||typeof valor!=="object")return {...preferenciasLembretesPadrao};
  const entrada=valor as Partial<PreferenciasLembretes>;
  return {habilitados:entrada.habilitados===true,antecipar:entrada.antecipar!==false};
}
