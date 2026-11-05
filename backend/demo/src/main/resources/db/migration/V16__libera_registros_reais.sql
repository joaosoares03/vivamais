-- Permite registros reais em produção. O default continua true para o binário anterior;
-- depois que todos os INSERT informarem a coluna, uma migration futura remove o default.
ALTER TABLE organization DROP CONSTRAINT organization_demo_only_check;
ALTER TABLE user_account DROP CONSTRAINT user_account_demo_only_check;
ALTER TABLE patient DROP CONSTRAINT patient_demo_only_check;

CREATE FUNCTION exigir_modo_da_unidade() RETURNS trigger
LANGUAGE plpgsql SET search_path FROM CURRENT AS $$
DECLARE modo_unidade boolean;
BEGIN
    SELECT demo_only INTO modo_unidade FROM organization WHERE id = NEW.organization_id;
    IF modo_unidade IS DISTINCT FROM NEW.demo_only THEN
        RAISE EXCEPTION 'demo_only difere da unidade' USING ERRCODE = '23514';
    END IF;
    RETURN NEW;
END;
$$;

CREATE FUNCTION impedir_troca_modo_unidade() RETURNS trigger
LANGUAGE plpgsql SET search_path = pg_catalog AS $$
BEGIN
    RAISE EXCEPTION 'demo_only da unidade é imutável' USING ERRCODE = '23514';
END;
$$;

REVOKE ALL ON FUNCTION exigir_modo_da_unidade() FROM PUBLIC;
REVOKE ALL ON FUNCTION impedir_troca_modo_unidade() FROM PUBLIC;

CREATE TRIGGER usuario_no_modo_da_unidade BEFORE INSERT OR UPDATE OF demo_only, organization_id ON user_account
    FOR EACH ROW EXECUTE FUNCTION exigir_modo_da_unidade();
CREATE TRIGGER paciente_no_modo_da_unidade BEFORE INSERT OR UPDATE OF demo_only, organization_id ON patient
    FOR EACH ROW EXECUTE FUNCTION exigir_modo_da_unidade();
CREATE TRIGGER unidade_mantem_modo BEFORE UPDATE OF demo_only ON organization
    FOR EACH ROW WHEN (OLD.demo_only IS DISTINCT FROM NEW.demo_only) EXECUTE FUNCTION impedir_troca_modo_unidade();
