package com.vivamais.config;

import java.io.IOException;
import org.springframework.boot.ApplicationArguments;
import org.springframework.boot.ApplicationRunner;
import org.springframework.boot.autoconfigure.condition.ConditionalOnExpression;
import org.springframework.context.annotation.Profile;
import org.springframework.core.io.support.PathMatchingResourcePatternResolver;
import org.springframework.jdbc.core.JdbcTemplate;
import org.springframework.stereotype.Component;

/** Recusa servir em produção com dados de demonstração, papel dono das tabelas ou schema defasado. */
@Component
@Profile("!migracao")
@ConditionalOnExpression("'${app.ambiente:development}' == 'production'")
public class VerificacaoBancoProducao implements ApplicationRunner {
    private final JdbcTemplate banco;
    public VerificacaoBancoProducao(JdbcTemplate banco) { this.banco = banco; }

    @Override public void run(ApplicationArguments argumentos) throws IOException {
        Integer demonstrativas = banco.queryForObject("""
            SELECT (SELECT count(*) FROM organization WHERE demo_only)
                 + (SELECT count(*) FROM user_account WHERE demo_only)
                 + (SELECT count(*) FROM patient WHERE demo_only)
            """, Integer.class);
        if (demonstrativas == null || demonstrativas != 0) throw new IllegalStateException("Produção recusada: há registros de demonstração no banco.");
        Boolean dono = banco.queryForObject("SELECT pg_get_userbyid(relowner)=current_user FROM pg_class WHERE oid='patient'::regclass", Boolean.class);
        if (!Boolean.FALSE.equals(dono)) throw new IllegalStateException("Produção recusada: a API não pode usar o papel dono das tabelas.");
        int esperadas = new PathMatchingResourcePatternResolver().getResources("classpath:db/migration/V*__*.sql").length;
        Integer aplicadas = banco.queryForObject("SELECT count(*) FROM flyway_schema_history WHERE version IS NOT NULL AND success", Integer.class);
        if (aplicadas == null || aplicadas != esperadas) throw new IllegalStateException("Produção recusada: migrações do banco diferem desta versão.");
    }
}
