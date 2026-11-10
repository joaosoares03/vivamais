package com.vivamais.service;

import static com.vivamais.service.CuidadoService.error;
import com.vivamais.dto.ModelosApi.Papel;
import com.vivamais.dto.ModelosApi.Usuario;
import com.vivamais.repositories.InstituicaoRepository;
import com.vivamais.security.CifraMfa;
import com.vivamais.security.CodificadorToken;
import com.vivamais.security.CodigoTotp;
import jakarta.validation.constraints.*;
import java.net.URLEncoder;
import java.nio.charset.StandardCharsets;
import java.sql.Timestamp;
import java.time.Duration;
import java.time.Instant;
import java.util.*;
import org.springframework.jdbc.core.JdbcTemplate;
import org.springframework.security.crypto.password.PasswordEncoder;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

/** Contas de equipe em unidades reais: convite individual, senha própria e MFA, sem bootstrap. */
@Service
@Transactional
public class ContasInstitucionaisService {
    public record NovaConta(@NotBlank @Size(max=160) String nome, @NotBlank @Email @Size(max=254) String email,
        @NotBlank @Pattern(regexp="PROFESSIONAL|ADMIN") String papel, @NotBlank @Size(max=72) String senhaAdministrador, @Size(max=32) String codigoMfa) { }
    public record Reautenticacao(@NotBlank @Size(max=72) String senhaAdministrador, @Size(max=32) String codigoMfa) { }
    public record ConsultaConvite(@NotBlank @Pattern(regexp="[A-Za-z0-9_-]{43}") String convite) { }
    public record AtivacaoConta(@NotBlank @Pattern(regexp="[A-Za-z0-9_-]{43}") String convite, @NotBlank @Size(min=12,max=72) String senha,
        @NotBlank @Pattern(regexp="[0-9]{6}") String codigoMfa) { }
    public record ConviteEmitido(UUID id, String convite, Instant expiraEm) { }
    public record DadosMfa(String email, String segredo, String uri) { }
    public record ContaAtivada(String email, List<String> codigosRecuperacao) { }

    private static final Duration VALIDADE_CONVITE = Duration.ofHours(48);
    private static final int CODIGOS_RECUPERACAO = 8;
    private final JdbcTemplate banco;
    private final InstituicaoRepository instituicoes;
    private final PasswordEncoder senhas;
    private final CodificadorToken tokens;
    private final CifraMfa cifra;
    private final VerificadorMfa mfa;

    public ContasInstitucionaisService(JdbcTemplate banco, InstituicaoRepository instituicoes, PasswordEncoder senhas, CodificadorToken tokens, CifraMfa cifra, VerificadorMfa mfa) {
        this.banco = banco; this.instituicoes = instituicoes; this.senhas = senhas; this.tokens = tokens; this.cifra = cifra; this.mfa = mfa;
    }

    private void exigirAdministrador(Usuario ator) {
        Boolean demonstracao = banco.queryForObject("SELECT demo_only FROM organization WHERE id=?", Boolean.class, ator.idUnidade());
        if (Boolean.TRUE.equals(demonstracao)) throw error(404, "Recurso indisponível.");
        if (ator.papel() != Papel.ADMIN) throw error(403, "Somente administradores gerenciam contas.");
    }
    private void reautenticar(String senha, String codigo, Usuario ator) {
        exigirAdministrador(ator);
        var conta = instituicoes.buscarCredenciais(ator.email()).orElseThrow(() -> error(401, "Entre novamente."));
        if (senha.getBytes(StandardCharsets.UTF_8).length > 72 || !conta.usuario().id().equals(ator.id()) || !senhas.matches(senha, conta.hashSenha()) || !mfa.aprova(ator.id(), codigo))
            throw error(422, "Confira sua senha e o código do autenticador.");
    }
    private Map<String,Object> contaDaUnidade(UUID id, Usuario ator) {
        var contas = banco.queryForList("SELECT id,email,role FROM user_account WHERE id=? AND organization_id=? AND role<>'PATIENT' FOR UPDATE", id, ator.idUnidade());
        if (contas.isEmpty()) throw error(404, "Conta não encontrada.");
        if (id.equals(ator.id())) throw error(409, "Use outra conta de administrador para alterar a sua.");
        return contas.getFirst();
    }
    private ConviteEmitido novoConvite(UUID usuario) {
        banco.update("UPDATE account_activation SET used_at=now() WHERE user_account_id=? AND used_at IS NULL", usuario);
        String convite = tokens.issue();
        Instant expira = Instant.now().plus(VALIDADE_CONVITE);
        banco.update("INSERT INTO account_activation(id,user_account_id,token_hash,expires_at) VALUES(?,?,?,?)", UUID.randomUUID(), usuario, tokens.hash(convite), Timestamp.from(expira));
        return new ConviteEmitido(usuario, convite, expira);
    }
    private void bloquearAcesso(UUID usuario) {
        banco.update("UPDATE user_account SET enabled=false WHERE id=?", usuario);
        banco.update("UPDATE auth_session SET revoked_at=now() WHERE user_account_id=? AND revoked_at IS NULL", usuario);
        banco.update("DELETE FROM codigo_recuperacao_mfa WHERE id_usuario=?", usuario);
        banco.update("DELETE FROM mfa_conta WHERE id_usuario=?", usuario);
    }
    private void inserirConta(UUID id, UUID unidade, String email, String nome, String papel) {
        banco.update("INSERT INTO user_account(id,organization_id,email,display_name,password_hash,role,enabled,demo_only) VALUES(?,?,?,?,?,?,false,false)",
            id, unidade, email, nome, senhas.encode(tokens.issue()), papel);
        if (papel.equals("PROFESSIONAL")) banco.update("INSERT INTO professional(id,organization_id) VALUES(?,?)", id, unidade);
    }

    public List<Map<String,Object>> listar(Usuario ator) {
        exigirAdministrador(ator);
        return banco.queryForList("""
            SELECT u.id,u.email,u.display_name AS "nome",u.role AS "papel",u.enabled AS "ativa",
              EXISTS(SELECT 1 FROM mfa_conta m WHERE m.id_usuario=u.id AND m.confirmado_em IS NOT NULL) AS "mfaConfirmado"
            FROM user_account u WHERE u.organization_id=? AND u.role<>'PATIENT' ORDER BY u.display_name
            """, ator.idUnidade());
    }
    public ConviteEmitido criar(NovaConta entrada, Usuario ator) {
        reautenticar(entrada.senhaAdministrador(), entrada.codigoMfa(), ator);
        String email = entrada.email().trim().toLowerCase(Locale.ROOT);
        if (banco.queryForObject("SELECT count(*) FROM user_account WHERE email=?", Integer.class, email) > 0) throw error(409, "Este e-mail já está em uso.");
        UUID id = UUID.randomUUID();
        inserirConta(id, ator.idUnidade(), email, entrada.nome().trim(), entrada.papel());
        var convite = novoConvite(id);
        instituicoes.auditar(ator, "CONTA_INSTITUCIONAL_CRIADA", "user_account", id);
        return convite;
    }
    /** Serve também à recuperação: nova senha e novo MFA, sem expor credenciais antigas. */
    public ConviteEmitido reemitir(UUID id, Reautenticacao entrada, Usuario ator) {
        reautenticar(entrada.senhaAdministrador(), entrada.codigoMfa(), ator);
        contaDaUnidade(id, ator);
        bloquearAcesso(id);
        var convite = novoConvite(id);
        instituicoes.auditar(ator, "CONVITE_CONTA_EMITIDO", "user_account", id);
        return convite;
    }
    public void desativar(UUID id, Reautenticacao entrada, Usuario ator) {
        reautenticar(entrada.senhaAdministrador(), entrada.codigoMfa(), ator);
        contaDaUnidade(id, ator);
        bloquearAcesso(id);
        banco.update("UPDATE account_activation SET used_at=now() WHERE user_account_id=? AND used_at IS NULL", id);
        instituicoes.auditar(ator, "CONTA_INSTITUCIONAL_DESATIVADA", "user_account", id);
    }

    private Map<String,Object> conviteValido(String convite) {
        var encontrados = banco.queryForList("""
            SELECT a.id AS id_convite,u.id,u.email,u.display_name,u.organization_id,u.role FROM account_activation a JOIN user_account u ON u.id=a.user_account_id
            WHERE a.token_hash=? AND a.used_at IS NULL AND a.expires_at>now() AND u.role<>'PATIENT' AND NOT u.demo_only FOR UPDATE OF a
            """, tokens.hash(convite));
        if (encontrados.size() != 1) throw error(401, "Convite inválido, utilizado ou expirado. Solicite outro ao administrador.");
        return encontrados.getFirst();
    }
    public DadosMfa iniciarAtivacao(ConsultaConvite entrada) {
        var conta = conviteValido(entrada.convite());
        String segredo = CodigoTotp.novoSegredo(), email = (String) conta.get("email");
        banco.update("""
            INSERT INTO mfa_conta(id_usuario,segredo_cifrado) VALUES(?,?)
            ON CONFLICT(id_usuario) DO UPDATE SET segredo_cifrado=excluded.segredo_cifrado,confirmado_em=NULL,ultimo_passo=0
            """, conta.get("id"), cifra.cifrar(segredo));
        String rotulo = URLEncoder.encode("Viva+:" + email, StandardCharsets.UTF_8).replace("+", "%20");
        return new DadosMfa(email, segredo, "otpauth://totp/" + rotulo + "?secret=" + segredo + "&issuer=Viva%2B&digits=6&period=30");
    }
    public ContaAtivada ativar(AtivacaoConta entrada) {
        if (entrada.senha().getBytes(StandardCharsets.UTF_8).length > 72) throw error(400, "Use uma senha de 12 a 72 caracteres e no máximo 72 bytes.");
        var conta = conviteValido(entrada.convite());
        UUID id = (UUID) conta.get("id");
        var pendentes = banco.queryForList("SELECT segredo_cifrado FROM mfa_conta WHERE id_usuario=? AND confirmado_em IS NULL", id);
        if (pendentes.isEmpty()) throw error(409, "Abra o convite novamente para configurar o autenticador.");
        long passo = CodigoTotp.verificar(cifra.decifrar((String) pendentes.getFirst().get("segredo_cifrado")), entrada.codigoMfa(), Instant.now());
        if (passo < 0) throw error(400, "Código do autenticador incorreto. Confira o horário do celular.");
        banco.update("UPDATE mfa_conta SET confirmado_em=now(),ultimo_passo=? WHERE id_usuario=?", passo, id);
        banco.update("UPDATE user_account SET password_hash=?,enabled=true WHERE id=?", senhas.encode(entrada.senha()), id);
        banco.update("UPDATE account_activation SET used_at=now() WHERE id=?", conta.get("id_convite"));
        var codigos = new ArrayList<String>();
        for (int i = 0; i < CODIGOS_RECUPERACAO; i++) {
            String codigo = tokens.issue().substring(0, 16);
            banco.update("INSERT INTO codigo_recuperacao_mfa(id,id_usuario,hash_codigo) VALUES(?,?,?)", UUID.randomUUID(), id, tokens.hash(codigo));
            codigos.add(codigo);
        }
        var usuario = new Usuario(id, (String) conta.get("email"), (String) conta.get("display_name"), Papel.valueOf((String) conta.get("role")), (UUID) conta.get("organization_id"));
        instituicoes.auditar(usuario, "CONTA_INSTITUCIONAL_ATIVADA", "user_account", id);
        return new ContaAtivada(usuario.email(), codigos);
    }

    /** Primeira unidade e primeiro administrador, por comando operacional. Só funciona uma vez. */
    public ConviteEmitido provisionarInicial(String nomeUnidade, String email, String nomeAdministrador) {
        if (banco.queryForObject("SELECT count(*) FROM user_account WHERE role='ADMIN' AND NOT demo_only", Integer.class) > 0)
            throw new IllegalStateException("Já existe administrador real. Use o portal para novas contas.");
        UUID unidade = UUID.randomUUID(), id = UUID.randomUUID();
        banco.update("INSERT INTO organization(id,name,demo_only) VALUES(?,?,false)", unidade, nomeUnidade.trim());
        inserirConta(id, unidade, email.trim().toLowerCase(Locale.ROOT), nomeAdministrador.trim(), "ADMIN");
        var convite = novoConvite(id);
        instituicoes.auditar(new Usuario(id, email, nomeAdministrador, Papel.ADMIN, unidade), "UNIDADE_PROVISIONADA", "organization", unidade);
        return convite;
    }
}
