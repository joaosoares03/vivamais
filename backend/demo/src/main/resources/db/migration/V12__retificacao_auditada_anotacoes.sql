ALTER TABLE consultation ADD CONSTRAINT consulta_identidade_paciente UNIQUE(id,patient_id);
ALTER TABLE printed_diary_entry ADD CONSTRAINT diario_identidade_paciente UNIQUE(id,patient_id);
CREATE TABLE retificacao_registro (
    id uuid PRIMARY KEY,
    id_paciente uuid NOT NULL,
    id_unidade uuid NOT NULL,
    id_consulta uuid,
    id_diario uuid,
    id_autor uuid NOT NULL,
    papel_autor varchar(16) NOT NULL CHECK (papel_autor IN ('PROFESSIONAL','ADMIN')),
    versao integer NOT NULL CHECK (versao>0),
    motivo varchar(1000) NOT NULL CHECK (length(trim(motivo)) BETWEEN 10 AND 1000),
    conteudo jsonb NOT NULL CHECK (jsonb_typeof(conteudo)='object' AND conteudo<>'{}'::jsonb
        AND (conteudo - ARRAY['notes','medicationReport','goals','carePlan'])='{}'::jsonb),
    criado_em timestamptz NOT NULL DEFAULT now(),
    CHECK ((id_consulta IS NULL) <> (id_diario IS NULL)),
    FOREIGN KEY (id_paciente,id_unidade) REFERENCES patient(id,organization_id),
    FOREIGN KEY (id_autor,id_unidade,papel_autor) REFERENCES user_account(id,organization_id,role),
    FOREIGN KEY (id_consulta,id_paciente) REFERENCES consultation(id,patient_id),
    FOREIGN KEY (id_diario,id_paciente) REFERENCES printed_diary_entry(id,patient_id),
    UNIQUE NULLS NOT DISTINCT (id_consulta,id_diario,versao)
);
CREATE INDEX retificacao_paciente_tempo ON retificacao_registro(id_paciente,criado_em,id);
ALTER TABLE retificacao_registro ENABLE ROW LEVEL SECURITY;
REVOKE ALL ON retificacao_registro FROM PUBLIC;
DO $$ BEGIN
    IF EXISTS (SELECT 1 FROM pg_roles WHERE rolname='anon') THEN REVOKE ALL ON retificacao_registro FROM anon; END IF;
    IF EXISTS (SELECT 1 FROM pg_roles WHERE rolname='authenticated') THEN REVOKE ALL ON retificacao_registro FROM authenticated; END IF;
END $$;
CREATE FUNCTION preservar_retificacao() RETURNS trigger LANGUAGE plpgsql AS $$
BEGIN RAISE EXCEPTION 'Retificacoes sao imutaveis; registre uma nova versao.'; END $$;
CREATE TRIGGER retificacao_imutavel BEFORE UPDATE OR DELETE ON retificacao_registro FOR EACH ROW EXECUTE FUNCTION preservar_retificacao();
CREATE TRIGGER retificacao_sem_truncate BEFORE TRUNCATE ON retificacao_registro FOR EACH STATEMENT EXECUTE FUNCTION preservar_retificacao();
