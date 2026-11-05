#!/bin/sh
# Uso: entrada-producao.sh [migrar|provisionar]. Sem argumento, atende tráfego.
# As regras de produção ficam no Java (ValidadorProducao); aqui só se prepara o certificado do banco.
set -eu
umask 077
falhar() { echo "Configuração de produção incompleta: $1. Nenhum segredo foi exibido." >&2; exit 1; }
[ "${APP_ENV:-}" = production ] || falhar APP_ENV
[ -n "${DATABASE_CA_CERT_BASE64:-}" ] || falhar DATABASE_CA_CERT_BASE64
printf '%s' "$DATABASE_CA_CERT_BASE64" | base64 -d > /app/.local/certificados/postgres.crt || falhar DATABASE_CA_CERT_BASE64
openssl x509 -in /app/.local/certificados/postgres.crt -noout >/dev/null 2>&1 || falhar DATABASE_CA_CERT_BASE64
unset DATABASE_CA_CERT_BASE64
case "${1:-servir}" in
  servir) exec java -jar /app/app.jar --spring.profiles.active=producao ;;
  migrar)
    [ -n "${DATABASE_MIGRATION_USER:-}" ] || falhar DATABASE_MIGRATION_USER
    [ -n "${DATABASE_MIGRATION_PASSWORD:-}" ] || falhar DATABASE_MIGRATION_PASSWORD
    DATABASE_USER="$DATABASE_MIGRATION_USER" DATABASE_PASSWORD="$DATABASE_MIGRATION_PASSWORD" \
      exec java -jar /app/app.jar --spring.profiles.active=producao,migracao ;;
  provisionar) exec java -jar /app/app.jar --spring.profiles.active=producao,provisionar ;;
  *) falhar "comando desconhecido" ;;
esac
