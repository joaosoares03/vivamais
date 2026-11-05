-- Contas sintéticas individuais, sem privilégios administrativos.
CREATE TABLE integrante_grupo_teste (
 id uuid PRIMARY KEY,
 id_unidade uuid NOT NULL,
 id_usuario uuid NOT NULL UNIQUE,
 papel varchar(16) NOT NULL CHECK(papel IN('PATIENT','PROFESSIONAL')),
 id_paciente uuid,
 id_emissor uuid NOT NULL,
 nome varchar(100) NOT NULL,
 hash_convite char(64) UNIQUE CHECK(hash_convite ~ '^[0-9a-f]{64}$'),
 criado_em timestamptz NOT NULL DEFAULT now(),
 expira_em timestamptz NOT NULL CHECK(expira_em>criado_em),
 utilizado_em timestamptz,
 desativado_em timestamptz,
 FOREIGN KEY(id_usuario,id_unidade,papel) REFERENCES user_account(id,organization_id,role),
 FOREIGN KEY(id_emissor,id_unidade) REFERENCES user_account(id,organization_id),
 FOREIGN KEY(id_paciente,id_unidade) REFERENCES patient(id,organization_id)
);
CREATE INDEX integrante_grupo_unidade ON integrante_grupo_teste(id_unidade,criado_em DESC);
CREATE INDEX integrante_grupo_emissor ON integrante_grupo_teste(id_emissor,id_unidade);
CREATE INDEX integrante_grupo_paciente ON integrante_grupo_teste(id_paciente,id_unidade);
ALTER TABLE integrante_grupo_teste ENABLE ROW LEVEL SECURITY;
REVOKE ALL ON integrante_grupo_teste FROM PUBLIC;
DO $$ BEGIN
 IF EXISTS(SELECT 1 FROM pg_roles WHERE rolname='anon') THEN REVOKE ALL ON integrante_grupo_teste FROM anon; END IF;
 IF EXISTS(SELECT 1 FROM pg_roles WHERE rolname='authenticated') THEN REVOKE ALL ON integrante_grupo_teste FROM authenticated; END IF;
END $$;
