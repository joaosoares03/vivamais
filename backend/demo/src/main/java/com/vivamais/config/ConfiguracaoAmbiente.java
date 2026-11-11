package com.vivamais.config;

import java.util.List;
import org.springframework.beans.factory.InitializingBean;
import org.springframework.beans.factory.annotation.Value;
import org.springframework.core.env.Environment;
import org.springframework.stereotype.Component;

/** Interrompe a inicialização antes de qualquer bootstrap em configuração produtiva. */
@Component
public class ConfiguracaoAmbiente implements InitializingBean {
    private final String ambiente;
    private final PropriedadesAplicacao propriedades;
    private final Environment configuracao;
    public ConfiguracaoAmbiente(@Value("${app.ambiente:development}") String ambiente, PropriedadesAplicacao propriedades, Environment configuracao) {
        this.ambiente = ambiente; this.propriedades = propriedades; this.configuracao = configuracao;
    }
    public static void validar(String ambiente, boolean bootstrap, boolean demonstracao) {
        if (!List.of("development","test","preview","production").contains(ambiente)) throw new IllegalStateException("APP_ENV inválido.");
        if (ambiente.equals("preview") && !demonstracao)
            throw new IllegalStateException("Homologação permite somente dados sintéticos.");
        if (ambiente.equals("production") && (bootstrap || demonstracao))
            throw new IllegalStateException("Produção não permite bootstrap ou modo de dados sintéticos.");
        // Sem o validador completo, produção nunca inicia. Ver afterPropertiesSet.
        if (ambiente.equals("production")) throw new IllegalStateException("Produção exige o validador de início.");
    }
    @Override public void afterPropertiesSet() {
        var perfis = List.of(configuracao.getActiveProfiles());
        var ambienteEfetivo = perfis.contains("production") || perfis.contains("prod") ? "production" : ambiente;
        boolean bootstrap = perfis.contains("bootstrap"), demonstracao = propriedades.demoOnly();
        if (ambienteEfetivo.equals("production") && !bootstrap && !demonstracao) { ValidadorProducao.exigir(configuracao); return; }
        validar(ambienteEfetivo, bootstrap, demonstracao);
    }
}
