package com.vivamais.config;

import java.util.List;
import java.util.UUID;
import org.springframework.beans.factory.InitializingBean;
import org.springframework.beans.factory.annotation.Value;
import org.springframework.core.env.Environment;
import org.springframework.stereotype.Component;

/** Acesso simplificado somente no servidor local e na unidade sintética explicitamente escolhida. */
@Component
public class ConfiguracaoAcessoDemonstracao implements InitializingBean {
    private final boolean habilitado;
    private final String unidade;
    private final String ambiente;
    private final String endereco;
    private final PropriedadesAplicacao propriedades;
    private final Environment configuracao;
    public ConfiguracaoAcessoDemonstracao(
            @Value("${patient-auth.demonstracao-sem-codigo:false}") boolean habilitado,
            @Value("${patient-auth.unidade-demonstracao:}") String unidade,
            @Value("${app.ambiente:development}") String ambiente,
            @Value("${server.address:}") String endereco,
            PropriedadesAplicacao propriedades, Environment configuracao) {
        this.habilitado=habilitado; this.unidade=unidade; this.ambiente=ambiente;
        this.endereco=endereco; this.propriedades=propriedades; this.configuracao=configuracao;
    }
    public boolean habilitado() { return habilitado; }
    public UUID unidade() { return habilitado ? UUID.fromString(unidade) : null; }
    @Override public void afterPropertiesSet() {
        if (!habilitado) return;
        var perfis=List.of(configuracao.getActiveProfiles());
        if (!List.of("development","test").contains(ambiente) || !propriedades.demoOnly() ||
                perfis.stream().anyMatch(p -> List.of("production","prod","preview").contains(p)) ||
                !List.of("127.0.0.1","::1").contains(endereco))
            throw new IllegalStateException("Login demonstrativo exige dados sintéticos, ambiente local e SERVER_ADDRESS de loopback.");
        try { UUID.fromString(unidade); }
        catch (IllegalArgumentException falha) { throw new IllegalStateException("Defina PATIENT_DEMO_ORGANIZATION_ID para a unidade sintética isolada."); }
    }
}
