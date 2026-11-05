package com.vivamais.repositories;
import com.vivamais.config.*;
import com.vivamais.controller.*;
import com.vivamais.dto.*;
import com.vivamais.repositories.*;
import com.vivamais.security.*;
import com.vivamais.service.*;
import com.vivamais.model.*;

import static com.vivamais.dto.ModelosApi.*;
import java.sql.ResultSet;
import java.sql.SQLException;
import java.time.Instant;
import java.util.List;
import java.util.Optional;
import java.util.UUID;
import org.springframework.jdbc.core.JdbcTemplate;
import org.springframework.stereotype.Repository;

@Repository
public class InstituicaoRepository {
    public long contarConsultasSemana(Usuario usuario) {
        return jdbc.queryForObject("SELECT count(*) FROM consultation c JOIN patient p ON p.id=c.patient_id WHERE p.organization_id=? AND (?='ADMIN' OR EXISTS(SELECT 1 FROM patient_professional_assignment a WHERE a.patient_id=p.id AND a.professional_id=?)) AND c.occurred_at >= (date_trunc('week',now() AT TIME ZONE 'America/Sao_Paulo') AT TIME ZONE 'America/Sao_Paulo') AND c.occurred_at < ((date_trunc('week',now() AT TIME ZONE 'America/Sao_Paulo')+interval '7 days') AT TIME ZONE 'America/Sao_Paulo')",Long.class,usuario.idUnidade(),usuario.papel().name(),usuario.id());
    }
    private final JdbcTemplate jdbc;
    private final ConfiguracaoAcessoDemonstracao demonstracao;
    private final ConfiguracaoTestadores testadores;
    @org.springframework.beans.factory.annotation.Autowired
    public InstituicaoRepository(JdbcTemplate jdbc, ConfiguracaoAcessoDemonstracao demonstracao,ConfiguracaoTestadores testadores) {
        this.jdbc = jdbc; this.demonstracao=demonstracao;this.testadores=testadores;
    }
    public InstituicaoRepository(JdbcTemplate jdbc,ConfiguracaoAcessoDemonstracao demonstracao){this(jdbc,demonstracao,null);}
    private static Usuario usuario(ResultSet rs) throws SQLException {
        return new Usuario(rs.getObject("id", UUID.class), rs.getString("email"), rs.getString("display_name"),
                Papel.valueOf(rs.getString("role")), rs.getObject("organization_id", UUID.class));
    }
    private static Paciente paciente(ResultSet rs) throws SQLException {
        return new Paciente(rs.getObject("id", UUID.class), rs.getString("display_name"),
                rs.getString("modality"), rs.getObject("organization_id", UUID.class));
    }
    public record Credenciais(@com.fasterxml.jackson.annotation.JsonProperty("user") Usuario usuario,@com.fasterxml.jackson.annotation.JsonProperty("passwordHash")  String hashSenha) { }
    public Optional<Credenciais> buscarCredenciais(String email) {
        return jdbc.query("SELECT * FROM user_account WHERE email=? AND enabled=true",
                (rs, linha) -> new Credenciais(usuario(rs), rs.getString("password_hash")), email).stream().findFirst();
    }
    public Optional<SessaoAutenticada> principalAutenticado(String hash) {
        return jdbc.query("""
                SELECT u.*, s.id AS session_id FROM auth_session s JOIN user_account u ON u.id=s.user_account_id
                WHERE s.token_hash=? AND s.expires_at > now() AND s.revoked_at IS NULL
                  AND ((u.enabled=true AND NOT EXISTS(SELECT 1 FROM sessao_demonstracao sd WHERE sd.id_sessao=s.id)
                    AND NOT EXISTS(SELECT 1 FROM sessao_testador st WHERE st.id_sessao=s.id)
                    AND (u.role<>'PATIENT' OR EXISTS(SELECT 1 FROM dispositivo_acesso_paciente d
                      WHERE d.id=s.id_dispositivo_paciente AND d.id_usuario=u.id AND d.revogado_em IS NULL AND d.expira_em>now())))
                  OR (? AND u.role='PATIENT' AND u.demo_only=true AND EXISTS(
                    SELECT 1 FROM sessao_demonstracao sd JOIN patient p ON p.id=sd.id_paciente
                      JOIN organization o ON o.id=p.organization_id
                    WHERE sd.id_sessao=s.id AND sd.id_unidade=? AND p.user_account_id=u.id
                      AND p.organization_id=u.organization_id AND p.demo_only=true AND o.demo_only=true))
                  OR (? AND u.role='PATIENT' AND u.demo_only=true AND EXISTS(
                    SELECT 1 FROM sessao_testador st JOIN convite_testador c ON c.id=st.id_convite
                      JOIN patient p ON p.id=st.id_paciente JOIN organization o ON o.id=p.organization_id
                    WHERE st.id_sessao=s.id AND c.id_unidade=? AND c.revogado_em IS NULL AND c.expira_em>now()
                      AND c.hash_renovacao IS NOT NULL AND p.user_account_id=u.id
                      AND p.organization_id=u.organization_id AND p.demo_only=true AND o.demo_only=true)))
                """, (rs, linha) -> new SessaoAutenticada(usuario(rs), rs.getObject("session_id", UUID.class)),
                hash, demonstracao.habilitado(), demonstracao.unidade(),testadores!=null&&testadores.habilitado(),testadores==null?null:testadores.unidade())
                .stream().findFirst();
    }
    public UUID inserirSessao(UUID accountId, String hash, Instant agora, Instant expiraEm) {
        UUID id = UUID.randomUUID();
        jdbc.update("INSERT INTO auth_session(id,user_account_id,token_hash,created_at,expires_at) VALUES(?,?,?,?,?)",
                id, accountId, hash, java.sql.Timestamp.from(agora), java.sql.Timestamp.from(expiraEm));
        return id;
    }
    public void revogarSessao(UUID id) { jdbc.update("UPDATE auth_session SET revoked_at=now() WHERE id=? AND revoked_at IS NULL", id); }
    public Optional<Usuario> buscarUsuario(UUID id) {
        return jdbc.query("SELECT * FROM user_account WHERE id=? AND enabled=true",(rs,n)->usuario(rs),id).stream().findFirst();
    }
    public void desativarRenovacaoPaciente(UUID sessao) {
        jdbc.update("UPDATE dispositivo_acesso_paciente SET manter_sessao=false WHERE id=(SELECT id_dispositivo_paciente FROM auth_session WHERE id=?)",sessao);
        jdbc.update("UPDATE convite_testador SET hash_renovacao=NULL WHERE id IN(SELECT id_convite FROM sessao_testador WHERE id_sessao=?)",sessao);
    }
    public void auditar(Usuario ator, String action, String resourceType, UUID resourceId) {
        jdbc.update("INSERT INTO audit_event(id,organization_id,actor_id,action,resource_type,resource_id) VALUES(?,?,?,?,?,?)",
                UUID.randomUUID(), ator.idUnidade(), ator.id(), action, resourceType, resourceId);
    }
    public Unidade buscarUnidade(UUID id) {
        return jdbc.queryForObject("SELECT id,name FROM organization WHERE id=?",
                (rs, linha) -> new Unidade(rs.getObject("id", UUID.class), rs.getString("name")), id);
    }
    public List<Paciente> listarPacientesAutorizados(Usuario ator) {
        return jdbc.query("""
                SELECT p.* FROM patient p WHERE p.organization_id=? AND
                (?='ADMIN' OR EXISTS(SELECT 1 FROM patient_professional_assignment a
                    WHERE a.patient_id=p.id AND a.professional_id=? AND a.organization_id=p.organization_id))
                ORDER BY p.display_name, p.id
                """, (rs, linha) -> paciente(rs), ator.idUnidade(), ator.papel().name(), ator.id());
    }
    public Optional<Paciente> buscarPacienteAutorizado(UUID idPaciente, Usuario ator) {
        return jdbc.query("""
                SELECT p.* FROM patient p WHERE p.id=? AND p.organization_id=? AND
                (?='ADMIN' OR (?='PATIENT' AND p.user_account_id=?) OR
                (?='PROFESSIONAL' AND EXISTS(SELECT 1 FROM patient_professional_assignment a
                    WHERE a.patient_id=p.id AND a.professional_id=? AND a.organization_id=p.organization_id)))
                """, (rs, linha) -> paciente(rs), idPaciente, ator.idUnidade(), ator.papel().name(),
                ator.papel().name(), ator.id(), ator.papel().name(), ator.id()).stream().findFirst();
    }
    public Optional<Paciente> ownPatient(Usuario ator) {
        return jdbc.query("SELECT * FROM patient WHERE user_account_id=? AND organization_id=?",
                (rs, linha) -> paciente(rs), ator.id(), ator.idUnidade()).stream().findFirst();
    }
}
