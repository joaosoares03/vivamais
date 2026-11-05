package com.vivamais;
import com.vivamais.config.ConfiguracaoAmbiente;
import org.junit.jupiter.api.Test;
import static org.assertj.core.api.Assertions.*;
class ConfiguracaoAmbienteTest {
    @Test void perfilProdutivoTambemImpedeBootstrapMesmoComVariavelDeDesenvolvimento() {
        var ambiente = new org.springframework.mock.env.MockEnvironment();
        ambiente.setActiveProfiles("production","bootstrap");
        var propriedades = new com.vivamais.config.PropriedadesAplicacao(true,java.util.List.of(),java.time.Duration.ofMinutes(30),"");
        assertThatThrownBy(() -> new ConfiguracaoAmbiente("development",propriedades,ambiente).afterPropertiesSet()).isInstanceOf(IllegalStateException.class);
    }
    @Test void permiteDesenvolvimentoETestesSemPublicar() {
        assertThatCode(() -> ConfiguracaoAmbiente.validar("development",true,true)).doesNotThrowAnyException();
        assertThatCode(() -> ConfiguracaoAmbiente.validar("test",true,true)).doesNotThrowAnyException();
    }
    @Test void permiteHomologacaoSinteticaComBootstrapExplicitoSemLiberarDadosReais() {
        assertThatCode(() -> ConfiguracaoAmbiente.validar("preview",false,true)).doesNotThrowAnyException();
        assertThatCode(() -> ConfiguracaoAmbiente.validar("preview",true,true)).doesNotThrowAnyException();
        for(boolean bootstrap:new boolean[]{false,true})
            assertThatThrownBy(() -> ConfiguracaoAmbiente.validar("preview",bootstrap,false)).isInstanceOf(IllegalStateException.class);
    }
    @Test void impedeBootstrapDadosSinteticosEModeloPendenteEmProducao() {
        for (boolean bootstrap : new boolean[]{false,true}) for (boolean demonstracao : new boolean[]{false,true})
            assertThatThrownBy(() -> ConfiguracaoAmbiente.validar("production",bootstrap,demonstracao)).isInstanceOf(IllegalStateException.class);
        assertThatThrownBy(() -> ConfiguracaoAmbiente.validar("producao",false,false)).isInstanceOf(IllegalStateException.class);
    }
}
