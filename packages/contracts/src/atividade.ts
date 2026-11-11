export const gruposCatalogoProfissional = [
  "NAO_DEFINIDO",
  "COM_RISCO_QUEDA_SENTADO",
  "SEM_RISCO_QUEDA_EM_PE",
] as const;

export type GrupoCatalogoProfissional =
  (typeof gruposCatalogoProfissional)[number];

export function normalizarGrupoCatalogoProfissional(
  valor: unknown,
): GrupoCatalogoProfissional {
  return gruposCatalogoProfissional.includes(
    valor as GrupoCatalogoProfissional,
  )
    ? (valor as GrupoCatalogoProfissional)
    : "NAO_DEFINIDO";
}

export function grupoCatalogoProfissionalEstaLiberado(
  grupo: GrupoCatalogoProfissional,
) {
  return grupo !== "NAO_DEFINIDO";
}
