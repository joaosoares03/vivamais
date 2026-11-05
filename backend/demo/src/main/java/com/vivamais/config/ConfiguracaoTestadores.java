package com.vivamais.config;
import java.util.*;
import org.springframework.beans.factory.InitializingBean;
import org.springframework.beans.factory.annotation.Value;
import org.springframework.core.env.Environment;
import org.springframework.stereotype.Component;
@Component
public class ConfiguracaoTestadores implements InitializingBean {
 private final boolean habilitado;private final String unidade;private final String ambiente;private final PropriedadesAplicacao propriedades;private final Environment configuracao;
 public ConfiguracaoTestadores(@Value("${testadores.habilitado:false}") boolean habilitado,@Value("${testadores.unidade:}") String unidade,@Value("${app.ambiente:development}") String ambiente,PropriedadesAplicacao propriedades,Environment configuracao){this.habilitado=habilitado;this.unidade=unidade;this.ambiente=ambiente;this.propriedades=propriedades;this.configuracao=configuracao;}
 public boolean habilitado(){return habilitado;}
 public UUID unidade(){return habilitado?UUID.fromString(unidade):null;}
 public boolean transporteLocalDeTeste(){return List.of("development","test").contains(ambiente);}
 @Override public void afterPropertiesSet(){
  if(!habilitado)return;
  if(!propriedades.demoOnly()||!List.of("development","test","preview").contains(ambiente)||Arrays.stream(configuracao.getActiveProfiles()).anyMatch(p->Set.of("prod","production").contains(p)))throw new IllegalStateException("Convites de testadores exigem dados sintéticos e nunca podem ser ativados em produção.");
  try{UUID.fromString(unidade);}catch(IllegalArgumentException falha){throw new IllegalStateException("Defina TESTER_ORGANIZATION_ID para a unidade fictícia autorizada.");}
  if(ambiente.equals("preview")&&propriedades.corsOrigins().stream().anyMatch(origem->!origem.startsWith("https://")||origem.contains("*")))throw new IllegalStateException("Homologação exige origens HTTPS explícitas.");
 }
}
