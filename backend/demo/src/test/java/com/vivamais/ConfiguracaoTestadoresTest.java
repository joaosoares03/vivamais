package com.vivamais;
import static org.assertj.core.api.Assertions.*;
import com.vivamais.config.*;
import java.time.Duration;
import java.util.*;
import org.junit.jupiter.api.Test;
import org.springframework.mock.env.MockEnvironment;
class ConfiguracaoTestadoresTest {
 ConfiguracaoTestadores criar(boolean ligado,String ambiente,boolean sintetico,String unidade,List<String> origens,String...perfis){var env=new MockEnvironment();env.setActiveProfiles(perfis);return new ConfiguracaoTestadores(ligado,unidade,ambiente,new PropriedadesAplicacao(sintetico,origens,Duration.ofMinutes(30),""),env);}
 @Test void exigeOptInUnidadeEDadosSinteticos(){
  assertThatCode(()->criar(false,"production",false,"",List.of()).afterPropertiesSet()).doesNotThrowAnyException();
  assertThatCode(()->criar(true,"preview",true,UUID.randomUUID().toString(),List.of("https://portal.example.org")).afterPropertiesSet()).doesNotThrowAnyException();
  assertThatThrownBy(()->criar(true,"development",false,UUID.randomUUID().toString(),List.of()).afterPropertiesSet()).isInstanceOf(IllegalStateException.class);
  assertThatThrownBy(()->criar(true,"test",true,"",List.of()).afterPropertiesSet()).isInstanceOf(IllegalStateException.class);
 }
 @Test void bloqueiaProducaoEOrigensAbertas(){
  for(String perfil:List.of("prod","production"))assertThatThrownBy(()->criar(true,"development",true,UUID.randomUUID().toString(),List.of(),perfil).afterPropertiesSet()).isInstanceOf(IllegalStateException.class);
  assertThatThrownBy(()->criar(true,"production",true,UUID.randomUUID().toString(),List.of("https://portal.example.org")).afterPropertiesSet()).isInstanceOf(IllegalStateException.class);
  for(String origem:List.of("*","https://*.example.org","http://portal.example.org"))assertThatThrownBy(()->criar(true,"preview",true,UUID.randomUUID().toString(),List.of(origem)).afterPropertiesSet()).isInstanceOf(IllegalStateException.class);
 }
}
