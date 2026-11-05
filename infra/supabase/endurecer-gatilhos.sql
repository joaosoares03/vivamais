-- Configuração operacional após Flyway V1-V14, aplicada na homologação em 04/11/2026.
-- As duas funções somente rejeitam mutações; não consultam tabelas ou objetos do domínio.
-- Preserva corpo, proprietário, SECURITY INVOKER e as migrações clínicas existentes.
ALTER FUNCTION viva.reject_audit_mutation() SET search_path = pg_catalog;
ALTER FUNCTION viva.preservar_retificacao() SET search_path = pg_catalog;
