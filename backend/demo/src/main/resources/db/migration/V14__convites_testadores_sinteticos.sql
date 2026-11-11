-- Homologação sintética: convite de alta entropia, uso único e renovação revogável.
CREATE TABLE convite_testador (
 id uuid PRIMARY KEY,
 id_paciente uuid NOT NULL,
 id_unidade uuid NOT NULL,
 id_emissor uuid NOT NULL,
 papel_emissor varchar(16) NOT NULL CHECK(papel_emissor IN('PROFESSIONAL','ADMIN')),
 hash_convite char(64) NOT NULL UNIQUE CHECK(hash_convite ~ '^[0-9a-f]{64}$'),
 hash_renovacao char(64) UNIQUE CHECK(hash_renovacao ~ '^[0-9a-f]{64}$'),
 tipo varchar(8) CHECK(tipo IN('WEB','NATIVO')),
 criado_em timestamptz NOT NULL DEFAULT now(),
 expira_em timestamptz NOT NULL CHECK(expira_em>criado_em),
 utilizado_em timestamptz,
 revogado_em timestamptz,
 FOREIGN KEY(id_paciente,id_unidade) REFERENCES patient(id,organization_id),
 FOREIGN KEY(id_emissor,id_unidade,papel_emissor) REFERENCES user_account(id,organization_id,role),
 UNIQUE(id,id_paciente,id_unidade)
);
CREATE INDEX convite_testador_paciente ON convite_testador(id_paciente,criado_em DESC);
CREATE TABLE sessao_testador (
 id_sessao uuid PRIMARY KEY REFERENCES auth_session(id),
 id_convite uuid NOT NULL,
 id_paciente uuid NOT NULL,
 id_unidade uuid NOT NULL,
 FOREIGN KEY(id_convite,id_paciente,id_unidade) REFERENCES convite_testador(id,id_paciente,id_unidade)
);
ALTER TABLE convite_testador ENABLE ROW LEVEL SECURITY;
ALTER TABLE sessao_testador ENABLE ROW LEVEL SECURITY;
REVOKE ALL ON convite_testador,sessao_testador FROM PUBLIC;
DO $$ BEGIN
 IF EXISTS(SELECT 1 FROM pg_roles WHERE rolname='anon') THEN REVOKE ALL ON convite_testador,sessao_testador FROM anon; END IF;
 IF EXISTS(SELECT 1 FROM pg_roles WHERE rolname='authenticated') THEN REVOKE ALL ON convite_testador,sessao_testador FROM authenticated; END IF;
END $$;
