#!/bin/sh
set -eu
umask 077
falhar() { echo 'Configuração de homologação incompleta ou insegura. Confira os segredos e infra/nuvem.env.example; nenhum segredo foi exibido.' >&2; exit 1; }
[ "${APP_ENV:-}" = preview ] || falhar
[ "${TESTER_ACCESS_ENABLED:-}" = true ] || falhar
[ "${PATIENT_DEMO_LOGIN_ENABLED:-}" = false ] || falhar
case "${SMS_PROVIDER:-}" in DESABILITADO|PRESENCIAL) ;; *) falhar ;; esac
[ "${SMS_LOCAL_TEST_ENABLED:-}" = false ] || falhar
[ "${SMS_REAL_AUTHORIZED:-}" = false ] || falhar
[ "${FOOD_ANALYSIS_ENABLED:-}" = false ] || falhar
[ "${STORAGE_BACKEND:-}" = supabase ] || falhar
for nome in DATABASE_URL DATABASE_USER DATABASE_PASSWORD DATABASE_CA_CERT_BASE64 FILES_ENCRYPTION_KEY PATIENT_AUTH_HMAC_KEY TESTER_ORGANIZATION_ID CORS_ALLOWED_ORIGINS SUPABASE_URL SUPABASE_STORAGE_BUCKET; do
  printenv "$nome" >/dev/null 2>&1 || falhar
  [ -n "$(printenv "$nome")" ] || falhar
done
[ -n "${SUPABASE_SECRET_KEY:-${SUPABASE_SERVICE_ROLE_KEY:-}}" ] || falhar
case "${SUPABASE_SECRET_KEY:-${SUPABASE_SERVICE_ROLE_KEY:-}}" in sb_publishable_*) falhar ;; esac
[ -z "${PATIENT_DEMO_LAN_ADDRESS:-}${PATIENT_DEMO_LAN_CLIENT:-}${PATIENT_DEMO_APK_PATH:-}" ] || falhar
[ -z "${SERVER_TOMCAT_REMOTEIP_INTERNAL_PROXIES:-}" ] || falhar
case "${SERVER_FORWARD_HEADERS_STRATEGY:-NATIVE}" in NATIVE|native) ;; *) falhar ;; esac
case "$DATABASE_URL" in jdbc:postgresql://*\?*sslmode=verify-full\&*|jdbc:postgresql://*\&sslmode=verify-full\&*) ;; *) falhar ;; esac
case "$DATABASE_URL" in *sslrootcert=/app/.local/certificados/postgres.crt|*sslrootcert=/app/.local/certificados/postgres.crt\&*) ;; *) falhar ;; esac
restante="${DATABASE_URL#*sslmode=verify-full}"
case "$restante" in *sslmode=*) falhar ;; esac
restante="${DATABASE_URL#*sslrootcert=/app/.local/certificados/postgres.crt}"
case "$restante" in *sslrootcert=*) falhar ;; esac
printf '%s' "$DATABASE_CA_CERT_BASE64" | base64 -d > /app/.local/certificados/postgres.crt || falhar
openssl x509 -in /app/.local/certificados/postgres.crt -noout >/dev/null 2>&1 || falhar
unset DATABASE_CA_CERT_BASE64
exec java -jar /app/app.jar --spring.profiles.include=nuvem
