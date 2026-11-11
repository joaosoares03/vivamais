package com.vivamais;
import static org.assertj.core.api.Assertions.*;
import com.vivamais.config.*;
import java.time.Duration;
import java.util.*;
import org.junit.jupiter.api.Test;
import org.springframework.mock.env.MockEnvironment;

class ConfiguracaoAcessoDemonstracaoTest {
    ConfiguracaoAcessoDemonstracao criar(boolean habilitado,String ambiente,String endereco,boolean sintetico,String unidade,String...perfis) {
        var configuracao=new MockEnvironment(); configuracao.setActiveProfiles(perfis);
        return new ConfiguracaoAcessoDemonstracao(habilitado,unidade,ambiente,endereco,
            new PropriedadesAplicacao(sintetico,List.of(),Duration.ofMinutes(30),""),configuracao);
    }
    @Test void exigeOptInUnidadeEInterfaceLocal() {
        String unidade=UUID.randomUUID().toString();
        for (String ambiente:List.of("development","test"))
            assertThatCode(()->criar(true,ambiente,"127.0.0.1",true,unidade).afterPropertiesSet()).doesNotThrowAnyException();
        for (String endereco:List.of("","0.0.0.0","::","192.168.1.5"))
            assertThatThrownBy(()->criar(true,"development",endereco,true,unidade).afterPropertiesSet()).isInstanceOf(IllegalStateException.class);
        assertThatThrownBy(()->criar(true,"development","127.0.0.1",true,"").afterPropertiesSet()).isInstanceOf(IllegalStateException.class);
        assertThatThrownBy(()->criar(true,"development","127.0.0.1",false,unidade).afterPropertiesSet()).isInstanceOf(IllegalStateException.class);
    }
    @Test void bloqueiaProducaoPreviewEPerfisMesmoComAmbienteLocal() {
        for (String ambiente:List.of("production","preview"))
            assertThatThrownBy(()->criar(true,ambiente,"127.0.0.1",true,UUID.randomUUID().toString()).afterPropertiesSet()).isInstanceOf(IllegalStateException.class);
        for (String perfil:List.of("production","prod","preview"))
            assertThatThrownBy(()->criar(true,"development","127.0.0.1",true,UUID.randomUUID().toString(),perfil).afterPropertiesSet()).isInstanceOf(IllegalStateException.class);
        assertThatCode(()->criar(false,"development","",true,"").afterPropertiesSet()).doesNotThrowAnyException();
    }
}
