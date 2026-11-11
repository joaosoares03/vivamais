-- Segundo fator de contas profissionais e ativação presencial do paciente.
CREATE TABLE mfa_conta (
 id_usuario uuid PRIMARY KEY REFERENCES user_account(id),
 segredo_cifrado text NOT NULL,
 confirmado_em timestamptz,
 ultimo_passo bigint NOT NULL DEFAULT 0,
 criado_em timestamptz NOT NULL DEFAULT now()
);
CREATE TABLE codigo_recuperacao_mfa (
 id uuid PRIMARY KEY,
 id_usuario uuid NOT NULL REFERENCES user_account(id),
 hash_codigo char(64) NOT NULL UNIQUE CHECK(hash_codigo ~ '^[0-9a-f]{64}$'),
 usado_em timestamptz,
 criado_em timestamptz NOT NULL DEFAULT now()
);
CREATE INDEX codigo_recuperacao_usuario ON codigo_recuperacao_mfa(id_usuario);

ALTER TABLE mfa_conta ENABLE ROW LEVEL SECURITY;
ALTER TABLE codigo_recuperacao_mfa ENABLE ROW LEVEL SECURITY;
REVOKE ALL ON mfa_conta FROM PUBLIC;
REVOKE ALL ON codigo_recuperacao_mfa FROM PUBLIC;
DO $$ BEGIN
 IF EXISTS(SELECT 1 FROM pg_roles WHERE rolname='anon') THEN
  REVOKE ALL ON mfa_conta FROM anon;
  REVOKE ALL ON codigo_recuperacao_mfa FROM anon;
 END IF;
 IF EXISTS(SELECT 1 FROM pg_roles WHERE rolname='authenticated') THEN
  REVOKE ALL ON mfa_conta FROM authenticated;
  REVOKE ALL ON codigo_recuperacao_mfa FROM authenticated;
 END IF;
END $$;

ALTER TABLE envio_sms_ativacao DROP CONSTRAINT envio_sms_ativacao_provedor_check;
ALTER TABLE envio_sms_ativacao DROP CONSTRAINT envio_sms_ativacao_estado_check;
ALTER TABLE envio_sms_ativacao ADD CONSTRAINT envio_sms_ativacao_provedor_check
 CHECK (provedor IN ('DESABILITADO','LOCAL','TWILIO','PRESENCIAL'));
ALTER TABLE envio_sms_ativacao ADD CONSTRAINT envio_sms_ativacao_estado_check
 CHECK (estado IN ('PREPARADO','NAO_CONFIGURADO','TESTE_LOCAL','ACEITO_PROVEDOR','ENTREGUE','FALHA','NAO_ENTREGUE','INDETERMINADO','PRESENCIAL'));
