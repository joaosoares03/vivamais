package com.vivamais;

import static org.assertj.core.api.Assertions.*;
import com.vivamais.config.ConfiguracaoSms;
import tools.jackson.databind.ObjectMapper;
import org.junit.jupiter.api.Test;
import org.springframework.mock.env.MockEnvironment;

class ConfiguracaoSmsTest {
    @Test void desabilitadoPorPadrao(){assertThat(new ConfiguracaoSms().servicoEnvioSms(new MockEnvironment(),new ObjectMapper()).disponivel()).isFalse();}
    @Test void localExigeHabilitacaoExplicita(){assertThatThrownBy(()->new ConfiguracaoSms().servicoEnvioSms(new MockEnvironment().withProperty("sms.provedor","LOCAL"),new ObjectMapper())).isInstanceOf(IllegalStateException.class);}
    @Test void localNuncaFuncionaEmProducao(){assertThatThrownBy(()->new ConfiguracaoSms().servicoEnvioSms(new MockEnvironment().withProperty("sms.provedor","LOCAL").withProperty("sms.teste-local-habilitado","true").withProperty("app.ambiente","production"),new ObjectMapper())).isInstanceOf(IllegalStateException.class);}
    @Test void realExigeAutorizacao(){assertThatThrownBy(()->new ConfiguracaoSms().servicoEnvioSms(new MockEnvironment().withProperty("sms.provedor","TWILIO"),new ObjectMapper())).isInstanceOf(IllegalStateException.class);}
}
