package com.vivamais;

import static org.assertj.core.api.Assertions.*;
import com.vivamais.config.ValidadorProducao;
import java.util.Map;
import org.junit.jupiter.api.Test;
import org.junit.jupiter.params.ParameterizedTest;
import org.junit.jupiter.params.provider.CsvSource;
import org.springframework.mock.env.MockEnvironment;

class ValidadorProducaoTest {
    static MockEnvironment valida() {
        var ambiente = new MockEnvironment();
        Map.of("app.ambiente", "production", "app.autorizacao-producao", "ATA-TESTE", "files.backend", "supabase",
                "files.encryption-key", "chave", "patient-auth.hmac-key", "chave", "spring.flyway.enabled", "false",
                "spring.datasource.url", "jdbc:postgresql://banco/viva?sslmode=verify-full&sslrootcert=/ca.crt",
                "app.cors-origins", "https://portal.exemplo.org,https://app.exemplo.org")
            .forEach(ambiente::setProperty);
        return ambiente;
    }
    @Test void aceitaConfiguracaoCompleta() { assertThat(ValidadorProducao.problemas(valida())).isEmpty(); }
    @ParameterizedTest @CsvSource({
        "app.ambiente,preview,APP_ENV", "app.autorizacao-producao,'',PRODUCAO_AUTORIZACAO",
        "app.bootstrap-password,x,DEMO_BOOTSTRAP_PASSWORD", "testadores.habilitado,true,TESTER_ACCESS_ENABLED",
        "testadores.unidade,x,TESTER_ORGANIZATION_ID", "patient-auth.demonstracao-sem-codigo,true,PATIENT_DEMO_LOGIN_ENABLED",
        "patient-auth.unidade-demonstracao,x,PATIENT_DEMO_ORGANIZATION_ID", "patient-auth.rede-demonstracao-computador,x,PATIENT_DEMO_LAN_ADDRESS",
        "patient-auth.rede-demonstracao-celular,x,PATIENT_DEMO_LAN_CLIENT", "patient-auth.apk-demonstracao,x,PATIENT_DEMO_APK_PATH",
        "sms.teste-local-habilitado,true,SMS_LOCAL_TEST_ENABLED", "sms.provedor,local,SMS_PROVIDER",
        "food.analysis-enabled,true,FOOD_ANALYSIS_ENABLED", "files.backend,local,STORAGE_BACKEND",
        "files.encryption-key,'',FILES_ENCRYPTION_KEY", "patient-auth.hmac-key,'',PATIENT_AUTH_HMAC_KEY",
        "spring.datasource.url,jdbc:postgresql://banco/viva,DATABASE_URL", "app.cors-origins,http://portal.exemplo.org,CORS_ALLOWED_ORIGINS",
        "app.cors-origins,https://*.exemplo.org,CORS_ALLOWED_ORIGINS", "app.cors-origins,'',CORS_ALLOWED_ORIGINS",
        "spring.flyway.enabled,true,FLYWAY_ENABLED"})
    void recusaCadaItemProibido(String chave, String valor, String nome) {
        var ambiente = valida(); ambiente.setProperty(chave, valor);
        assertThat(ValidadorProducao.problemas(ambiente)).anyMatch(problema -> problema.contains(nome));
        assertThatThrownBy(() -> ValidadorProducao.exigir(ambiente)).isInstanceOf(IllegalStateException.class).hasMessageNotContaining("ATA-TESTE");
    }
    @Test void perfilDeMigracaoPodeUsarFlyway() {
        var ambiente = valida(); ambiente.setProperty("spring.flyway.enabled", "true"); ambiente.setActiveProfiles("migracao");
        assertThat(ValidadorProducao.problemas(ambiente)).isEmpty();
    }
}
