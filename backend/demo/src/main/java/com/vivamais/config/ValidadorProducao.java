package com.vivamais.config;

import java.util.ArrayList;
import java.util.Arrays;
import java.util.List;
import org.springframework.core.env.Environment;

/** Lista o que impede a API de iniciar em produção. As mensagens citam nomes, nunca valores. */
public final class ValidadorProducao {
    private ValidadorProducao() { }

    public static List<String> problemas(Environment configuracao) {
        var problemas = new ArrayList<String>();
        boolean migracao = Arrays.asList(configuracao.getActiveProfiles()).contains("migracao");
        exigirPreenchido(configuracao, "app.autorizacao-producao", "PRODUCAO_AUTORIZACAO", problemas);
        if (!"production".equals(configuracao.getProperty("app.ambiente"))) problemas.add("APP_ENV precisa ser production");
        exigirVazio(configuracao, "app.bootstrap-password", "DEMO_BOOTSTRAP_PASSWORD", problemas);
        exigirDesligado(configuracao, "testadores.habilitado", "TESTER_ACCESS_ENABLED", problemas);
        exigirVazio(configuracao, "testadores.unidade", "TESTER_ORGANIZATION_ID", problemas);
        exigirDesligado(configuracao, "patient-auth.demonstracao-sem-codigo", "PATIENT_DEMO_LOGIN_ENABLED", problemas);
        exigirVazio(configuracao, "patient-auth.unidade-demonstracao", "PATIENT_DEMO_ORGANIZATION_ID", problemas);
        exigirVazio(configuracao, "patient-auth.rede-demonstracao-computador", "PATIENT_DEMO_LAN_ADDRESS", problemas);
        exigirVazio(configuracao, "patient-auth.rede-demonstracao-celular", "PATIENT_DEMO_LAN_CLIENT", problemas);
        exigirVazio(configuracao, "patient-auth.apk-demonstracao", "PATIENT_DEMO_APK_PATH", problemas);
        exigirDesligado(configuracao, "sms.teste-local-habilitado", "SMS_LOCAL_TEST_ENABLED", problemas);
        if ("LOCAL".equalsIgnoreCase(configuracao.getProperty("sms.provedor", ""))) problemas.add("SMS_PROVIDER não pode ser LOCAL");
        exigirDesligado(configuracao, "food.analysis-enabled", "FOOD_ANALYSIS_ENABLED", problemas);
        if (!"supabase".equalsIgnoreCase(configuracao.getProperty("files.backend", ""))) problemas.add("STORAGE_BACKEND precisa ser supabase");
        exigirPreenchido(configuracao, "files.encryption-key", "FILES_ENCRYPTION_KEY", problemas);
        exigirPreenchido(configuracao, "patient-auth.hmac-key", "PATIENT_AUTH_HMAC_KEY", problemas);
        if (!configuracao.getProperty("spring.datasource.url", "").contains("sslmode=verify-full"))
            problemas.add("DATABASE_URL precisa de sslmode=verify-full");
        validarOrigens(configuracao.getProperty("app.cors-origins", ""), problemas);
        boolean flywayLigado = configuracao.getProperty("spring.flyway.enabled", Boolean.class, true);
        if (flywayLigado && !migracao) problemas.add("FLYWAY_ENABLED precisa ser false; migrações rodam no perfil migracao");
        return problemas;
    }

    public static void exigir(Environment configuracao) {
        var problemas = problemas(configuracao);
        if (!problemas.isEmpty()) throw new IllegalStateException("Produção recusada: " + String.join("; ", problemas) + ".");
    }

    private static void validarOrigens(String origens, List<String> problemas) {
        var lista = Arrays.stream(origens.split(",")).map(String::trim).filter(origem -> !origem.isEmpty()).toList();
        if (lista.isEmpty() || lista.stream().anyMatch(origem -> !origem.startsWith("https://") || origem.contains("*")))
            problemas.add("CORS_ALLOWED_ORIGINS precisa de origens HTTPS explícitas");
    }

    private static void exigirPreenchido(Environment configuracao, String chave, String nome, List<String> problemas) {
        if (configuracao.getProperty(chave, "").isBlank()) problemas.add(nome + " é obrigatória");
    }

    private static void exigirVazio(Environment configuracao, String chave, String nome, List<String> problemas) {
        if (!configuracao.getProperty(chave, "").isBlank()) problemas.add(nome + " não pode estar definida");
    }

    private static void exigirDesligado(Environment configuracao, String chave, String nome, List<String> problemas) {
        if (configuracao.getProperty(chave, Boolean.class, false)) problemas.add(nome + " precisa ser false");
    }
}
