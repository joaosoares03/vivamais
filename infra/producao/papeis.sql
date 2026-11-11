-- Rodar como dono do schema viva, depois de cada migração.
-- Antes da primeira vez, um administrador do banco cria os papéis e a senha fora deste arquivo:
--   CREATE ROLE viva_migrador LOGIN; CREATE ROLE viva_runtime LOGIN;
--   CREATE SCHEMA viva AUTHORIZATION viva_migrador;
--   ALTER ROLE viva_migrador SET search_path = viva; ALTER ROLE viva_runtime SET search_path = viva;
GRANT USAGE ON SCHEMA viva TO viva_runtime;
GRANT SELECT, INSERT, UPDATE, DELETE ON ALL TABLES IN SCHEMA viva TO viva_runtime;
GRANT USAGE, SELECT ON ALL SEQUENCES IN SCHEMA viva TO viva_runtime;
GRANT EXECUTE ON ALL FUNCTIONS IN SCHEMA viva TO viva_runtime;

-- Trilhas imutáveis e histórico de migração: o runtime só lê ou acrescenta.
REVOKE UPDATE, DELETE ON viva.audit_event FROM viva_runtime;
REVOKE UPDATE, DELETE ON viva.retificacao_registro FROM viva_runtime;
REVOKE INSERT, UPDATE, DELETE ON viva.flyway_schema_history FROM viva_runtime;

-- RLS sem política bloqueia quem não é dono. Esta política vale só para o papel da API;
-- clientes continuam sem acesso, e a API segue como autoridade de escopo.
DO $$
DECLARE tabela record;
BEGIN
 FOR tabela IN
  SELECT c.relname FROM pg_class c JOIN pg_namespace n ON n.oid = c.relnamespace
  WHERE n.nspname = 'viva' AND c.relkind = 'r' AND c.relrowsecurity
 LOOP
  IF NOT EXISTS (SELECT 1 FROM pg_policies WHERE schemaname = 'viva' AND tablename = tabela.relname AND policyname = 'api_runtime') THEN
   EXECUTE format('CREATE POLICY api_runtime ON viva.%I TO viva_runtime USING (true) WITH CHECK (true)', tabela.relname);
  END IF;
 END LOOP;
END $$;
