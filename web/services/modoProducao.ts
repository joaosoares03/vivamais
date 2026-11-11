// PORTAL_MODO_PRODUCAO só existe para ensaiar a interface de produção em servidor local.
export function portalEmProducao() {
  return (
    process.env.APP_ENV === "production" ||
    process.env.PORTAL_MODO_PRODUCAO === "true"
  );
}

export function emailSuporte() {
  return process.env.PORTAL_EMAIL_SUPORTE?.trim() ?? "";
}
