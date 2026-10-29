package com.vivamais.service;
import static org.assertj.core.api.Assertions.*;
import java.util.*;
import tools.jackson.core.type.TypeReference;
import tools.jackson.databind.ObjectMapper;
import org.junit.jupiter.api.Test;

class ProvedorAnaliseAlimentacaoHttpTest {
 private final ObjectMapper json=new ObjectMapper();
 private final ProvedorAnaliseAlimentacao.Contexto contexto=new ProvedorAnaliseAlimentacao.Contexto("fornecedor-aprovado","modelo-sintetico-v1","has-educacional-v1","APROVACAO-SINTETICA","FOOD_EDUCATIONAL_CONTRACT_V1");
 private byte[] resposta(String status,String semaforo)throws Exception{
  Map<String,Object> corpo=new LinkedHashMap<>();corpo.put("status",status);if(semaforo!=null)corpo.put("trafficLight",semaforo);corpo.put("explanation","Orientação educativa para conversar com a equipe.");corpo.put("limitations","A foto não mede nutrientes e não substitui avaliação profissional.");corpo.put("identifiedFoods",List.of("alimento identificado"));corpo.put("confidence",0.91);corpo.put("modelVersion","modelo-sintetico-v1");corpo.put("criteriaVersion","has-educacional-v1");corpo.put("contractVersion","FOOD_EDUCATIONAL_CONTRACT_V1");return json.writeValueAsBytes(corpo);
 }
 @Test void aceitaOsTresNiveisDoSemaforoSomenteQuandoAvaliado()throws Exception{
  for(String semaforo:List.of("GREEN","YELLOW","RED")){var resultado=ProvedorAnaliseAlimentacaoHttp.validarResposta(json,resposta("ASSESSED",semaforo),contexto,0.80);assertThat(resultado.get("trafficLight")).isEqualTo(semaforo);assertThat(resultado.get("criteriaVersion")).isEqualTo("has-educacional-v1");}
 }
 @Test void aceitaIncertezaSemFabricarSemaforo()throws Exception{
  var resultado=ProvedorAnaliseAlimentacaoHttp.validarResposta(json,resposta("UNCERTAIN",null),contexto,0.80);assertThat(resultado.get("trafficLight")).isNull();
 }
 @Test void rejeitaBaixaConfiancaPayloadMalformadoEInferenciaDeSodio()throws Exception{
  Map<String,Object> baixo=json.readValue(resposta("ASSESSED","GREEN"),new TypeReference<>(){});baixo.put("confidence",0.2);assertThatThrownBy(()->ProvedorAnaliseAlimentacaoHttp.validarResposta(json,json.writeValueAsBytes(baixo),contexto,0.80)).isInstanceOf(org.springframework.web.server.ResponseStatusException.class);
  Map<String,Object> sodio=json.readValue(resposta("ASSESSED","GREEN"),new TypeReference<>(){});sodio.put("explanation","Esta foto contém 500 mg de sódio.");assertThatThrownBy(()->ProvedorAnaliseAlimentacaoHttp.validarResposta(json,json.writeValueAsBytes(sodio),contexto,0.80)).isInstanceOf(org.springframework.web.server.ResponseStatusException.class);
  assertThatThrownBy(()->ProvedorAnaliseAlimentacaoHttp.validarResposta(json,"[]".getBytes(),contexto,0.80)).isInstanceOf(org.springframework.web.server.ResponseStatusException.class);
 }
 @Test void configuracaoSemFornecedorOuAprovacaoPermaneceDesabilitada(){
  var provedor=new ProvedorAnaliseAlimentacaoHttp(true,"https://fornecedor.invalid/analyze","segredo","criterio","","","","",0.80,json);assertThat(provedor.enabled()).isFalse();
 }
}
