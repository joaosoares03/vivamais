package com.vivamais;
import com.vivamais.config.*;
import com.vivamais.controller.*;
import com.vivamais.dto.*;
import com.vivamais.repositories.*;
import com.vivamais.security.*;
import com.vivamais.service.*;
import com.vivamais.model.*;
import static org.assertj.core.api.Assertions.*;
import static org.springframework.test.web.servlet.request.MockMvcRequestBuilders.*;
import static org.springframework.test.web.servlet.result.MockMvcResultMatchers.*;
import java.util.*;
import java.time.*;
import tools.jackson.databind.*;
import org.junit.jupiter.api.*;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.boot.webmvc.test.autoconfigure.AutoConfigureMockMvc;
import org.springframework.boot.test.context.SpringBootTest;
import org.springframework.test.context.*;
import org.springframework.test.web.servlet.MockMvc;
import org.springframework.http.MediaType;
import org.springframework.jdbc.core.JdbcTemplate;
import org.testcontainers.containers.PostgreSQLContainer;

@SpringBootTest @AutoConfigureMockMvc(print=org.springframework.boot.webmvc.test.autoconfigure.MockMvcPrint.NONE) @ActiveProfiles("bootstrap") @TestInstance(TestInstance.Lifecycle.PER_CLASS)
class ExerciciosIT {
 static final String PASSWORD=new CodificadorToken().issue(),SCHEMA="exerc_"+UUID.randomUUID().toString().replace("-","");
 static PostgreSQLContainer<?> container;
 @DynamicPropertySource static void db(DynamicPropertyRegistry r){
  if(System.getenv("TEST_DATABASE_URL")!=null){r.add("spring.datasource.url",()->System.getenv("TEST_DATABASE_URL"));r.add("spring.datasource.username",()->System.getenv().getOrDefault("TEST_DATABASE_USER","postgres"));r.add("spring.datasource.password",()->System.getenv().getOrDefault("TEST_DATABASE_PASSWORD","postgres"));}
  else{container=new PostgreSQLContainer<>("postgres:17.9-alpine");container.start();r.add("spring.datasource.url",container::getJdbcUrl);r.add("spring.datasource.username",container::getUsername);r.add("spring.datasource.password",container::getPassword);}
  r.add("sms.provedor",()->"LOCAL");r.add("sms.teste-local-habilitado",()->true);
  r.add("app.bootstrap-password",()->PASSWORD);r.add("spring.flyway.default-schema",()->SCHEMA);r.add("spring.datasource.hikari.schema",()->SCHEMA);
  r.add("files.directory",()->System.getProperty("java.io.tmpdir")+"/viva-files-"+SCHEMA);
  r.add("ocr.node-script",()->System.getenv().getOrDefault("TEST_OCR_NODE_SCRIPT",""));
 }
 @Autowired MockMvc mvc; @Autowired ObjectMapper json; @Autowired JdbcTemplate jdbc;
 String exigirProfissional,other,patientToken,admin;UUID paciente=DadosDemonstracao.id("patient-app-a");
 @BeforeAll void setup()throws Exception{exigirProfissional=entrar("profissional.a@demo.vivamais.invalid",PASSWORD);other=entrar("profissional.b@demo.vivamais.invalid",PASSWORD);patientToken=entrar("paciente.a@demo.vivamais.invalid",PASSWORD);admin=entrar("admin.a@demo.vivamais.invalid",PASSWORD);}
 @AfterAll void cleanup(){jdbc.execute("SET search_path TO public");jdbc.execute("DROP SCHEMA "+SCHEMA+" CASCADE");if(container!=null)container.stop();}
 String entrar(String email,String senha)throws Exception{if(jdbc.queryForObject("SELECT count(*) FROM user_account WHERE email=? AND role='PATIENT'",Integer.class,email)>0)return ApoioAcessoPaciente.sessaoAutorizada(mvc,json,jdbc,email);return json.readTree(mvc.perform(post("/api/v1/auth/login").contentType(MediaType.APPLICATION_JSON).content(json.writeValueAsString(Map.of("email",email,"password",senha)))).andExpect(status().isOk()).andReturn().getResponse().getContentAsString()).get("accessToken").asText();}
 JsonNode write(String path,Object body,String token)throws Exception{if(path.equals("/patients")){var dados=json.valueToTree(body);if(!dados.has("telefone"))((tools.jackson.databind.node.ObjectNode)dados).put("telefone",ApoioAcessoPaciente.gerarTelefone());body=dados;}return json.readTree(mvc.perform(post("/api/v1"+path).header("Authorization","Bearer "+token).contentType(MediaType.APPLICATION_JSON).content(json.writeValueAsString(body))).andExpect(status().isOk()).andReturn().getResponse().getContentAsString());}
 org.springframework.test.web.servlet.ResultActions enviar(String metodo,String caminho,Object corpo,String token)throws Exception{
  var req=switch(metodo){case "PUT"->put("/api/v1"+caminho);case "POST"->post("/api/v1"+caminho);default->get("/api/v1"+caminho);};
  if(token!=null)req=req.header("Authorization","Bearer "+token);
  if(corpo!=null)req=req.contentType(MediaType.APPLICATION_JSON).content(json.writeValueAsString(corpo));
  return mvc.perform(req);
 }
 Map<String,Object> perfil(String grupo){Map<String,Object> p=new LinkedHashMap<>();p.put("mobility","Informação sintética");p.put("balance","Informação sintética");p.put("restrictions","");p.put("professionalGuidance","Orientação sintética");p.put("approvedCatalogGroup",grupo);return p;}
 Map<String,Object> plano(String idAtual,List<Map<String,Object>> itens){Map<String,Object> p=new LinkedHashMap<>();p.put("idPlanoAtual",idAtual);p.put("orientacao","Plano sintético");p.put("itens",itens);return p;}
 Map<String,Object> item(String id,List<Integer> dias,int minutos){return Map.of("idExercicio",id,"diasSemana",dias,"duracaoMinutos",minutos,"observacao","");}
 Map<String,Object> atividade(String exercicio){Map<String,Object> a=new LinkedHashMap<>(Map.of("id",UUID.randomUUID(),"type","Exercício do plano","durationMinutes",10,"occurredAt",Instant.now().minusSeconds(60).toString(),"feeling","WELL"));if(exercicio!=null)a.put("exerciseId",exercicio);return a;}
 String idDe(org.springframework.test.web.servlet.ResultActions r)throws Exception{return json.readTree(r.andReturn().getResponse().getContentAsString()).get("id").asText();}
 Map<String,Object> aprovacao(boolean confirmo){return new LinkedHashMap<>(Map.of("nomeResponsavel","Responsável Sintética","conselho","COREN-SP","registroConselho","000000","observacao","Revisão sintética","confirmacao",confirmo));}
 void garantirAprovacao()throws Exception{
  var catalogo=json.readTree(enviar("GET","/exercicios/catalogo",null,admin).andReturn().getResponse().getContentAsString());
  if(!"APROVADO".equals(catalogo.get("situacao").asText()))enviar("POST","/exercicios/catalogo/aprovacao",aprovacao(true),admin).andExpect(status().isOk());
 }

 @Test void planoSoFicaAtivoComAprovacaoClinicaRegistradaEPertenceAoGrupoDoPerfil()throws Exception{
  String id=write("/patients",Map.of("displayName","Pessoa Sintética Plano","modality","BRACELET_DIARY"),exigirProfissional).get("patient").get("id").asText();
  String caminhoPlano="/pacientes/"+id+"/plano-exercicios";
  jdbc.update("UPDATE aprovacao_catalogo_exercicio SET revogado_em=now(),revogado_por=registrado_por WHERE revogado_em IS NULL");
  enviar("GET","/exercicios/catalogo",null,null).andExpect(status().isUnauthorized());
  enviar("GET","/exercicios/catalogo",null,patientToken).andExpect(status().isForbidden());
  enviar("GET","/exercicios/catalogo",null,exigirProfissional).andExpect(status().isOk()).andExpect(jsonPath("$.situacao").value("BLOCKED_PENDING_CLINICAL_APPROVAL")).andExpect(jsonPath("$.itens.length()").value(10)).andExpect(jsonPath("$.aprovacao").isEmpty());
  enviar("GET",caminhoPlano,null,exigirProfissional).andExpect(status().isNoContent());
  enviar("PUT","/patients/"+id+"/activity-profile",perfil("COM_RISCO_QUEDA_SENTADO"),exigirProfissional).andExpect(status().isOk());
  enviar("PUT",caminhoPlano,plano(null,List.of(item("ex02-marcha-sentada",List.of(1,3,5),10))),exigirProfissional).andExpect(status().isConflict());

  enviar("POST","/exercicios/catalogo/aprovacao",aprovacao(true),exigirProfissional).andExpect(status().isForbidden());
  enviar("POST","/exercicios/catalogo/aprovacao",aprovacao(false),admin).andExpect(status().isBadRequest());
  enviar("POST","/exercicios/catalogo/aprovacao",aprovacao(true),admin).andExpect(status().isOk()).andExpect(jsonPath("$.situacao").value("APROVADO")).andExpect(jsonPath("$.aprovacao.conselho").value("COREN-SP"));
  enviar("POST","/exercicios/catalogo/aprovacao",aprovacao(true),admin).andExpect(status().isConflict());

  enviar("PUT",caminhoPlano,plano(null,List.of(item("ex01-caminhada-plano",List.of(1),10))),exigirProfissional).andExpect(status().isBadRequest());
  enviar("PUT",caminhoPlano,plano(null,List.of(item("ex02-marcha-sentada",List.of(1),10),item("ex02-marcha-sentada",List.of(2),10))),exigirProfissional).andExpect(status().isBadRequest());
  enviar("PUT",caminhoPlano,plano(null,List.of(item("ex02-marcha-sentada",List.of(8),10))),exigirProfissional).andExpect(status().isBadRequest());
  enviar("PUT",caminhoPlano,plano(null,List.of(item("ex02-marcha-sentada",List.of(1),10))),patientToken).andExpect(status().isForbidden());
  String primeiro=idDe(enviar("PUT",caminhoPlano,plano(null,List.of(item("ex02-marcha-sentada",List.of(1,3,5),10),item("ex04-extensao-joelho",List.of(2,4),5))),exigirProfissional)
   .andExpect(status().isOk()).andExpect(jsonPath("$.situacao").value("ATIVO")).andExpect(jsonPath("$.itens[0].nome").value("Marcha sentada")).andExpect(jsonPath("$.itens[0].diasSemana[2]").value(5)).andExpect(jsonPath("$.aprovacao.registroConselho").value("000000")));
  enviar("PUT",caminhoPlano,plano(null,List.of(item("ex02-marcha-sentada",List.of(1),10))),exigirProfissional).andExpect(status().isConflict());
  String segundo=idDe(enviar("PUT",caminhoPlano,plano(primeiro,List.of(item("ex02-marcha-sentada",List.of(1,2,3,4,5,6,7),10))),exigirProfissional).andExpect(status().isOk()));
  assertThat(segundo).isNotEqualTo(primeiro);
  assertThat(jdbc.queryForObject("SELECT count(*) FROM plano_exercicio WHERE id_paciente=?::uuid AND encerrado_em IS NOT NULL",Integer.class,id)).isEqualTo(1);
  enviar("GET",caminhoPlano,null,other).andExpect(status().isForbidden());
  enviar("GET",caminhoPlano,null,null).andExpect(status().isUnauthorized());

  enviar("POST","/patients/"+id+"/activities",atividade("ex02-marcha-sentada"),exigirProfissional).andExpect(status().isOk());
  enviar("POST","/patients/"+id+"/activities",atividade("ex04-extensao-joelho"),exigirProfissional).andExpect(status().isBadRequest());
  enviar("POST","/patients/"+id+"/activities",atividade(null),exigirProfissional).andExpect(status().isOk());
  enviar("GET",caminhoPlano,null,exigirProfissional).andExpect(jsonPath("$.semana.registros.length()").value(1)).andExpect(jsonPath("$.semana.registros[0].idExercicio").value("ex02-marcha-sentada"));

  enviar("POST","/exercicios/catalogo/aprovacao/revogar",null,exigirProfissional).andExpect(status().isForbidden());
  enviar("POST","/exercicios/catalogo/aprovacao/revogar",null,admin).andExpect(status().isOk()).andExpect(jsonPath("$.situacao").value("BLOCKED_PENDING_CLINICAL_APPROVAL"));
  enviar("GET",caminhoPlano,null,exigirProfissional).andExpect(jsonPath("$.situacao").value("BLOCKED_PENDING_CLINICAL_APPROVAL")).andExpect(jsonPath("$.itens.length()").value(1));
  enviar("POST","/patients/"+id+"/activities",atividade("ex02-marcha-sentada"),exigirProfissional).andExpect(status().isConflict());
  enviar("PUT",caminhoPlano,plano(segundo,List.of(item("ex02-marcha-sentada",List.of(1),10))),exigirProfissional).andExpect(status().isConflict());

  enviar("POST","/exercicios/catalogo/aprovacao",aprovacao(true),admin).andExpect(status().isOk());
  enviar("GET",caminhoPlano,null,exigirProfissional).andExpect(jsonPath("$.situacao").value("BLOCKED_PENDING_CLINICAL_APPROVAL"));
  String terceiro=idDe(enviar("PUT",caminhoPlano,plano(segundo,List.of(item("ex03-bomba-panturrilha",List.of(1),10))),exigirProfissional).andExpect(jsonPath("$.situacao").value("ATIVO")));

  enviar("PUT","/patients/"+id+"/activity-profile",perfil("SEM_RISCO_QUEDA_EM_PE"),exigirProfissional).andExpect(status().isOk());
  enviar("GET",caminhoPlano,null,exigirProfissional).andExpect(status().isNoContent());
  String quarto=idDe(enviar("PUT",caminhoPlano,plano(null,List.of(item("ex01-caminhada-plano",List.of(6),20))),exigirProfissional).andExpect(status().isOk()));
  enviar("POST",caminhoPlano+"/encerrar",Map.of("idPlanoAtual",terceiro),exigirProfissional).andExpect(status().isConflict());
  enviar("POST",caminhoPlano+"/encerrar",Map.of("idPlanoAtual",quarto),exigirProfissional).andExpect(status().isNoContent());
  enviar("GET",caminhoPlano,null,exigirProfissional).andExpect(status().isNoContent());
  for(String tabela:List.of("aprovacao_catalogo_exercicio","plano_exercicio","plano_exercicio_item"))
   assertThat(jdbc.queryForObject("SELECT relrowsecurity FROM pg_class WHERE oid=?::regclass",Boolean.class,tabela)).isTrue();
 }

 @Test void pacienteVeOProprioPlanoENaoVeItensSemAprovacaoVigente()throws Exception{
  String caminhoPlano="/pacientes/"+paciente+"/plano-exercicios";
  enviar("PUT","/patients/"+paciente+"/activity-profile",perfil("SEM_RISCO_QUEDA_EM_PE"),exigirProfissional).andExpect(status().isOk());
  garantirAprovacao();
  var atual=enviar("GET",caminhoPlano,null,exigirProfissional).andReturn().getResponse();
  String idAtual=atual.getStatus()==204?null:json.readTree(atual.getContentAsString()).get("id").asText();
  enviar("PUT",caminhoPlano,plano(idAtual,List.of(item("ex05-giro-ombros",List.of(1,2,3,4,5,6,7),5))),exigirProfissional).andExpect(status().isOk());
  enviar("GET",caminhoPlano,null,patientToken).andExpect(status().isOk()).andExpect(jsonPath("$.situacao").value("ATIVO")).andExpect(jsonPath("$.itens[0].idExercicio").value("ex05-giro-ombros"));
  enviar("PUT",caminhoPlano,plano(null,List.of(item("ex05-giro-ombros",List.of(1),5))),patientToken).andExpect(status().isForbidden());
  enviar("POST","/patients/"+paciente+"/activities",atividade("ex05-giro-ombros"),patientToken).andExpect(status().isOk());
  enviar("POST","/exercicios/catalogo/aprovacao/revogar",null,admin).andExpect(status().isOk());
  enviar("GET",caminhoPlano,null,patientToken).andExpect(jsonPath("$.situacao").value("BLOCKED_PENDING_CLINICAL_APPROVAL")).andExpect(jsonPath("$.itens.length()").value(0)).andExpect(jsonPath("$.semana.registros.length()").value(0));
  garantirAprovacao();
 }

 @Test void perfilFuncionalRecusaVersaoDesatualizadaESegueAceitandoClienteAntigo()throws Exception{
  String id=write("/patients",Map.of("displayName","Pessoa Sintética Versão","modality","BRACELET_DIARY"),exigirProfissional).get("patient").get("id").asText();
  String caminho="/patients/"+id+"/activity-profile";
  var p=perfil("NAO_DEFINIDO");p.put("version",0);
  enviar("PUT",caminho,p,exigirProfissional).andExpect(status().isOk()).andExpect(jsonPath("$.version").value(1));
  enviar("PUT",caminho,p,exigirProfissional).andExpect(status().isConflict());
  p.put("version",1);
  enviar("PUT",caminho,p,exigirProfissional).andExpect(status().isOk()).andExpect(jsonPath("$.version").value(2));
  p.remove("version");
  enviar("PUT",caminho,p,exigirProfissional).andExpect(status().isOk()).andExpect(jsonPath("$.version").value(3)).andExpect(jsonPath("$.professionalGuidance").value("Orientação sintética"));
 }

 @Test void migracaoV18TiraOMarcadorAntigoDasOrientacoes()throws Exception{
  String id=write("/patients",Map.of("displayName","Pessoa Sintética Marcador","modality","BRACELET_DIARY"),exigirProfissional).get("patient").get("id").asText();
  jdbc.update("INSERT INTO physical_activity_profile(patient_id,mobility,balance,restrictions,professional_guidance,author_id) VALUES(?::uuid,'m','b','',?,?)",id,"[[VIVAMAIS_G16=SEM_RISCO_QUEDA_EM_PE]]\nOrientação anterior",DadosDemonstracao.id("profissional-a"));
  String sql=new String(getClass().getResourceAsStream("/db/migration/V18__plano_exercicios.sql").readAllBytes(),java.nio.charset.StandardCharsets.UTF_8);
  var m=java.util.regex.Pattern.compile("UPDATE physical_activity_profile[\\s\\S]*?;").matcher(sql);assertThat(m.find()).isTrue();
  jdbc.update(m.group());
  enviar("GET","/patients/"+id+"/activity-profile",null,exigirProfissional).andExpect(jsonPath("$.approvedCatalogGroup").value("SEM_RISCO_QUEDA_EM_PE")).andExpect(jsonPath("$.professionalGuidance").value("Orientação anterior"));
 }
}
