package com.vivamais.service;

import com.vivamais.security.CifraMfa;
import com.vivamais.security.CodificadorToken;
import com.vivamais.security.CodigoTotp;
import java.time.Instant;
import java.util.UUID;
import org.springframework.beans.factory.annotation.Value;
import org.springframework.jdbc.core.JdbcTemplate;
import org.springframework.stereotype.Component;
import org.springframework.transaction.annotation.Transactional;

/** Decide o segundo fator. Conta com MFA confirmado sempre exige código; sem MFA, depende do ambiente. */
@Component
public class VerificadorMfa {
    private final JdbcTemplate banco;
    private final CifraMfa cifra;
    private final CodificadorToken tokens;
    private final boolean obrigatorio;

    public VerificadorMfa(JdbcTemplate banco, CifraMfa cifra, CodificadorToken tokens, @Value("${app.mfa-obrigatorio:false}") boolean obrigatorio) {
        this.banco = banco; this.cifra = cifra; this.tokens = tokens; this.obrigatorio = obrigatorio;
    }

    @Transactional
    public boolean aprova(UUID usuario, String codigo) {
        var registros = banco.queryForList("SELECT segredo_cifrado,ultimo_passo FROM mfa_conta WHERE id_usuario=? AND confirmado_em IS NOT NULL FOR UPDATE", usuario);
        if (registros.isEmpty()) return !obrigatorio;
        if (codigo == null || codigo.isBlank()) return false;
        String informado = codigo.trim();
        if (informado.matches("[0-9]{6}")) {
            long passo = CodigoTotp.verificar(cifra.decifrar((String) registros.getFirst().get("segredo_cifrado")), informado, Instant.now());
            // O mesmo código não pode entrar duas vezes, mesmo dentro da janela de validade.
            if (passo < 0 || passo <= ((Number) registros.getFirst().get("ultimo_passo")).longValue()) return false;
            banco.update("UPDATE mfa_conta SET ultimo_passo=? WHERE id_usuario=?", passo, usuario);
            return true;
        }
        return banco.update("UPDATE codigo_recuperacao_mfa SET usado_em=now() WHERE id_usuario=? AND hash_codigo=? AND usado_em IS NULL", usuario, tokens.hash(informado)) == 1;
    }
}
