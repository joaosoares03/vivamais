-- Plano de exercícios definido pela equipe, liberado somente depois de aprovação clínica
-- registrada para a versão do catálogo na unidade. Mudança aditiva: V1–V17 não são alteradas.

-- 1. O grupo do catálogo passa a ter coluna própria. Antes ele era guardado como marcador
--    no início de professional_guidance; os registros existentes são migrados aqui.
ALTER TABLE physical_activity_profile
 ADD COLUMN grupo_catalogo varchar(40) NOT NULL DEFAULT 'NAO_DEFINIDO'
  CHECK (grupo_catalogo IN ('NAO_DEFINIDO','COM_RISCO_QUEDA_SENTADO','SEM_RISCO_QUEDA_EM_PE')),
 ADD COLUMN versao integer NOT NULL DEFAULT 1 CHECK (versao >= 1);

UPDATE physical_activity_profile
 SET grupo_catalogo = substring(professional_guidance FROM '^\[\[VIVAMAIS_G16=(COM_RISCO_QUEDA_SENTADO|SEM_RISCO_QUEDA_EM_PE)\]\]'),
     professional_guidance = regexp_replace(professional_guidance, '^\[\[VIVAMAIS_G16=(COM_RISCO_QUEDA_SENTADO|SEM_RISCO_QUEDA_EM_PE)\]\]\r?\n?', '')
 WHERE professional_guidance ~ '^\[\[VIVAMAIS_G16=(COM_RISCO_QUEDA_SENTADO|SEM_RISCO_QUEDA_EM_PE)\]\]';

-- 2. Aprovação clínica do catálogo, por unidade e versão. Quem registra é um administrador;
--    o responsável clínico fica identificado por nome, conselho e número de registro.
CREATE TABLE aprovacao_catalogo_exercicio (
 id uuid PRIMARY KEY,
 id_unidade uuid NOT NULL REFERENCES organization(id),
 versao_catalogo varchar(20) NOT NULL CHECK (versao_catalogo ~ '^[0-9]{4}-[0-9]{2}-[0-9]{2}$'),
 registrado_por uuid NOT NULL REFERENCES user_account(id),
 nome_responsavel varchar(160) NOT NULL CHECK (length(btrim(nome_responsavel)) >= 3),
 conselho varchar(40) NOT NULL CHECK (length(btrim(conselho)) >= 2),
 registro_conselho varchar(40) NOT NULL CHECK (length(btrim(registro_conselho)) >= 2),
 observacao varchar(1000) NOT NULL DEFAULT '',
 aprovado_em timestamptz NOT NULL DEFAULT now(),
 revogado_em timestamptz,
 revogado_por uuid REFERENCES user_account(id),
 CHECK ((revogado_em IS NULL) = (revogado_por IS NULL))
);
CREATE UNIQUE INDEX aprovacao_catalogo_vigente ON aprovacao_catalogo_exercicio(id_unidade, versao_catalogo) WHERE revogado_em IS NULL;

-- 3. Plano por paciente. Cada alteração cria um plano novo e encerra o anterior, o que
--    preserva o histórico e serve de controle de concorrência.
CREATE TABLE plano_exercicio (
 id uuid PRIMARY KEY,
 id_paciente uuid NOT NULL REFERENCES patient(id),
 id_aprovacao uuid NOT NULL REFERENCES aprovacao_catalogo_exercicio(id),
 versao_catalogo varchar(20) NOT NULL,
 autor_id uuid NOT NULL REFERENCES user_account(id),
 orientacao varchar(1000) NOT NULL DEFAULT '',
 criado_em timestamptz NOT NULL DEFAULT now(),
 encerrado_em timestamptz,
 encerrado_por uuid REFERENCES user_account(id),
 CHECK ((encerrado_em IS NULL) = (encerrado_por IS NULL))
);
CREATE UNIQUE INDEX plano_exercicio_vigente ON plano_exercicio(id_paciente) WHERE encerrado_em IS NULL;
CREATE INDEX plano_exercicio_paciente ON plano_exercicio(id_paciente, criado_em DESC);

-- dias_semana: bit 0 = segunda-feira ... bit 6 = domingo.
CREATE TABLE plano_exercicio_item (
 id_plano uuid NOT NULL REFERENCES plano_exercicio(id),
 id_exercicio varchar(60) NOT NULL CHECK (id_exercicio ~ '^ex[0-9]{2}-[a-z0-9-]+$'),
 ordem smallint NOT NULL CHECK (ordem BETWEEN 1 AND 10),
 dias_semana smallint NOT NULL CHECK (dias_semana BETWEEN 1 AND 127),
 duracao_minutos smallint NOT NULL CHECK (duracao_minutos BETWEEN 1 AND 60),
 observacao varchar(300) NOT NULL DEFAULT '',
 PRIMARY KEY (id_plano, id_exercicio),
 UNIQUE (id_plano, ordem)
);

-- 4. O registro de atividade pode apontar para o item do plano que a pessoa realizou.
ALTER TABLE activity_record
 ADD COLUMN id_plano_exercicio uuid REFERENCES plano_exercicio(id),
 ADD COLUMN id_exercicio varchar(60),
 ADD CONSTRAINT activity_record_exercicio_plano CHECK ((id_plano_exercicio IS NULL) = (id_exercicio IS NULL));
CREATE INDEX activity_record_plano ON activity_record(id_plano_exercicio, occurred_at) WHERE id_plano_exercicio IS NOT NULL;

ALTER TABLE aprovacao_catalogo_exercicio ENABLE ROW LEVEL SECURITY;
ALTER TABLE plano_exercicio ENABLE ROW LEVEL SECURITY;
ALTER TABLE plano_exercicio_item ENABLE ROW LEVEL SECURITY;
REVOKE ALL ON aprovacao_catalogo_exercicio FROM PUBLIC;
REVOKE ALL ON plano_exercicio FROM PUBLIC;
REVOKE ALL ON plano_exercicio_item FROM PUBLIC;
DO $$ BEGIN
 IF EXISTS(SELECT 1 FROM pg_roles WHERE rolname='anon') THEN
  REVOKE ALL ON aprovacao_catalogo_exercicio FROM anon;
  REVOKE ALL ON plano_exercicio FROM anon;
  REVOKE ALL ON plano_exercicio_item FROM anon;
 END IF;
 IF EXISTS(SELECT 1 FROM pg_roles WHERE rolname='authenticated') THEN
  REVOKE ALL ON aprovacao_catalogo_exercicio FROM authenticated;
  REVOKE ALL ON plano_exercicio FROM authenticated;
  REVOKE ALL ON plano_exercicio_item FROM authenticated;
 END IF;
END $$;
