-- Não autoriza aparelhos nem altera a ativação segura das contas.
CREATE TABLE sessao_demonstracao (
    id_sessao uuid PRIMARY KEY REFERENCES auth_session(id),
    id_paciente uuid NOT NULL,
    id_unidade uuid NOT NULL,
    FOREIGN KEY (id_paciente, id_unidade) REFERENCES patient(id, organization_id)
);
ALTER TABLE sessao_demonstracao ENABLE ROW LEVEL SECURITY;
REVOKE ALL ON sessao_demonstracao FROM PUBLIC;
DO $$ BEGIN
    IF EXISTS (SELECT 1 FROM pg_roles WHERE rolname='anon') THEN
        REVOKE ALL ON sessao_demonstracao FROM anon;
    END IF;
    IF EXISTS (SELECT 1 FROM pg_roles WHERE rolname='authenticated') THEN
        REVOKE ALL ON sessao_demonstracao FROM authenticated;
    END IF;
END $$;
