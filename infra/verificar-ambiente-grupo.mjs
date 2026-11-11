import { pathToFileURL } from "node:url";
export function verificarAmbienteGrupo(ambiente) {
  const falhas = [];
  for (const [chave, valor] of Object.entries({
    APP_ENV: "preview",
    TESTER_ACCESS_ENABLED: "true",
    PATIENT_DEMO_LOGIN_ENABLED: "false",
    SMS_PROVIDER: "DESABILITADO",
    SMS_LOCAL_TEST_ENABLED: "false",
    SMS_REAL_AUTHORIZED: "false",
    FOOD_ANALYSIS_ENABLED: "false",
  }))
    if (ambiente[chave] !== valor) falhas.push(`Confira ${chave}.`);
  for (const chave of [
    "DATABASE_URL",
    "DATABASE_USER",
    "DATABASE_PASSWORD",
    "FILES_ENCRYPTION_KEY",
    "PATIENT_AUTH_HMAC_KEY",
    "SUPABASE_URL",
  ])
    if (!ambiente[chave]?.trim())
      falhas.push(`Preencha ${chave} no gerenciador privado de segredos.`);
  if (
    !(
      ambiente.SUPABASE_SECRET_KEY || ambiente.SUPABASE_SERVICE_ROLE_KEY
    )?.trim()
  )
    falhas.push(
      "Preencha SUPABASE_SECRET_KEY no cofre da API (service_role legado também é aceito).",
    );
  if (
    (
      ambiente.SUPABASE_SECRET_KEY || ambiente.SUPABASE_SERVICE_ROLE_KEY
    )?.startsWith("sb_publishable_")
  )
    falhas.push("Não use chave pública para o armazenamento privado.");
  if (!/^[0-9a-f-]{36}$/i.test(ambiente.TESTER_ORGANIZATION_ID ?? ""))
    falhas.push("Informe a unidade fictícia autorizada.");
  if (
    !ambiente.DATABASE_URL?.startsWith("jdbc:postgresql://") ||
    !/[?&]sslmode=verify-full(?:&|$)/.test(ambiente.DATABASE_URL ?? "")
  )
    falhas.push(
      "Use JDBC PostgreSQL com sslmode=verify-full e certificado de confiança.",
    );
  const origens = (ambiente.CORS_ALLOWED_ORIGINS ?? "").split(",");
  if (
    !origens.length ||
    origens.some((valor) => {
      try {
        const u = new URL(valor);
        return (
          u.protocol !== "https:" ||
          u.origin !== valor ||
          u.hostname.includes("*")
        );
      } catch {
        return true;
      }
    })
  )
    falhas.push("Use origens HTTPS exatas, sem caminho ou wildcard.");
  if (ambiente.STORAGE_BACKEND !== "supabase")
    falhas.push(
      "Este perfil usa o bucket privado Supabase; mantenha a chave somente na API.",
    );
  for (const chave of [
    "PATIENT_DEMO_LAN_ADDRESS",
    "PATIENT_DEMO_LAN_CLIENT",
    "PATIENT_DEMO_APK_PATH",
  ])
    if (ambiente[chave]) falhas.push(`Remova ${chave} da homologação.`);
  if (
    ambiente.SERVER_FORWARD_HEADERS_STRATEGY === "NATIVE" &&
    (!ambiente.SERVER_TOMCAT_REMOTEIP_INTERNAL_PROXIES ||
      [".*", ".+", "^.*$"].includes(
        ambiente.SERVER_TOMCAT_REMOTEIP_INTERNAL_PROXIES,
      ))
  )
    falhas.push(
      "Configure somente os proxies confiáveis do provedor antes de aceitar cabeçalhos encaminhados.",
    );
  return falhas;
}
if (
  process.argv[1] &&
  import.meta.url === pathToFileURL(process.argv[1]).href
) {
  const falhas = verificarAmbienteGrupo(process.env);
  if (falhas.length) {
    for (const falha of falhas) console.error(falha);
    process.exitCode = 1;
  } else
    console.log(
      "Configuração sintética consistente. HTTPS, TLS do banco, bucket, backups e isolamento ainda precisam de ensaio no serviço implantado. Nenhum recurso criado.",
    );
}
