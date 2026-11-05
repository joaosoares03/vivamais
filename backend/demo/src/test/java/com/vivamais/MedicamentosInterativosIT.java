package com.vivamais;
import static org.assertj.core.api.Assertions.*;
import static org.springframework.test.web.servlet.request.MockMvcRequestBuilders.*;
import static org.springframework.test.web.servlet.result.MockMvcResultMatchers.*;
import com.vivamais.config.DadosDemonstracao;
import com.vivamais.security.CodificadorToken;
import java.time.*;
import java.util.*;
import java.util.concurrent.*;
import org.junit.jupiter.api.*;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.boot.test.context.SpringBootTest;
import org.springframework.boot.webmvc.test.autoconfigure.*;
import org.springframework.http.MediaType;
import org.springframework.jdbc.core.JdbcTemplate;
import org.springframework.test.context.*;
import org.springframework.test.web.servlet.*;
import org.testcontainers.containers.PostgreSQLContainer;
import tools.jackson.databind.*;

@SpringBootTest @AutoConfigureMockMvc(print=MockMvcPrint.NONE) @ActiveProfiles("bootstrap")
@TestInstance(TestInstance.Lifecycle.PER_CLASS)
class MedicamentosInterativosIT {
 static final String SENHA=new CodificadorToken().issue(),SCHEMA="med_"+UUID.randomUUID().toString().replace("-","");
 static PostgreSQLContainer<?> container;
 @DynamicPropertySource static void configurar(DynamicPropertyRegistry r){
  if(System.getenv("TEST_DATABASE_URL")!=null){r.add("spring.datasource.url",()->System.getenv("TEST_DATABASE_URL"));r.add("spring.datasource.username",()->System.getenv("TEST_DATABASE_USER"));r.add("spring.datasource.password",()->System.getenv("TEST_DATABASE_PASSWORD"));}
  else{container=new PostgreSQLContainer<>("postgres:17.9-alpine");container.start();r.add("spring.datasource.url",container::getJdbcUrl);r.add("spring.datasource.username",container::getUsername);r.add("spring.datasource.password",container::getPassword);}
  r.add("app.bootstrap-password",()->SENHA);r.add("spring.flyway.default-schema",()->SCHEMA);r.add("spring.datasource.hikari.schema",()->SCHEMA);
  r.add("patient-auth.demonstracao-sem-codigo",()->true);r.add("patient-auth.unidade-demonstracao",()->DadosDemonstracao.id("organization-a").toString());r.add("server.address",()->"127.0.0.1");
  r.add("files.directory",()->System.getProperty("java.io.tmpdir")+"/viva-"+SCHEMA);
 }
 @Autowired MockMvc mvc;@Autowired ObjectMapper json;@Autowired JdbcTemplate banco;
 String profissional,paciente,acessoPaciente;LocalDate hoje;
 JsonNode postar(String caminho,Object corpo,String token,int esperado)throws Exception{
  var resposta=mvc.perform(post("/api/v1"+caminho).header("Authorization","Bearer "+token).contentType(MediaType.APPLICATION_JSON).content(json.writeValueAsString(corpo))).andExpect(status().is(esperado)).andReturn().getResponse();
  return resposta.getContentAsString().isBlank()?null:json.readTree(resposta.getContentAsString());
 }
 JsonNode agenda(LocalDate inicio,LocalDate fim,String token,int esperado)throws Exception{
  return json.readTree(mvc.perform(get("/api/v1/patients/"+paciente+"/medication-agenda").param("from",inicio.toString()).param("to",fim.toString()).header("Authorization","Bearer "+token)).andExpect(status().is(esperado)).andReturn().getResponse().getContentAsString());
 }
 @BeforeEach void preparar()throws Exception{
  hoje=LocalDate.now(ZoneId.of("America/Sao_Paulo"));
  profissional=postar("/auth/login",Map.of("email","profissional.a@demo.vivamais.invalid","password",SENHA),"",200).get("accessToken").asText();
  String cpf=ApoioAcessoPaciente.gerarCpf();paciente=postar("/patients",Map.of("displayName","Paciente sintético de medicamentos","modality","APP","cpf",cpf,"dataNascimento","1950-01-01","telefone","+5511990000002"),profissional,200).get("patient").get("id").asText();
  acessoPaciente=postar("/auth/paciente/demonstracao",Map.of("cpf",cpf,"dataNascimento","1950-01-01","tipo","NATIVO"),"",200).get("sessao").get("accessToken").asText();
 }
 Map<String,Object> plano(){return new LinkedHashMap<>(Map.of("name","Medicamento sintético","dosagem","10 mg","instruction","Orientação fictícia cadastrada para teste","startsOn",hoje.minusDays(7).toString(),"timeZone","America/Sao_Paulo","schedules",List.of("08:00","20:00")));}
 Map<String,Object> relato(String plano,String instante,String situacao){return Map.of("id",UUID.randomUUID(),"planId",plano,"scheduledAt",instante,"reportedAt",Instant.now().toString(),"status",situacao);}
 @Test void programaCalendarioRegistraDuasSituacoesEPreservaPersistencia()throws Exception{
  String plano=postar("/patients/"+paciente+"/medications",plano(),profissional,200).get("id").asText();
  var inicial=agenda(hoje,hoje,acessoPaciente,200).get("dias").get(0);
  assertThat(inicial.get("resumo").get("previstas").asInt()).isEqualTo(2);
  var primeiro=inicial.get("eventos").get(0);assertThat(primeiro.get("dosagem").asText()).isEqualTo("10 mg");
  var corpo=relato(plano,primeiro.get("scheduledAt").asText(),"TAKEN");
  var salvo=postar("/patients/"+paciente+"/medication-reports",corpo,acessoPaciente,200);
  assertThat(postar("/patients/"+paciente+"/medication-reports",corpo,acessoPaciente,200).get("id")).isEqualTo(salvo.get("id"));
  assertThat(postar("/patients/"+paciente+"/medication-reports",relato(plano,primeiro.get("scheduledAt").asText(),"TAKEN"),acessoPaciente,200).get("id")).isEqualTo(salvo.get("id"));
  postar("/patients/"+paciente+"/medication-reports",relato(plano,inicial.get("eventos").get(1).get("scheduledAt").asText(),"NOT_TAKEN"),acessoPaciente,200);
  var atualizado=agenda(hoje,hoje,profissional,200).get("dias").get(0);
  assertThat(atualizado.get("resumo").get("tomadas").asInt()).isEqualTo(1);assertThat(atualizado.get("resumo").get("naoTomadas").asInt()).isEqualTo(1);assertThat(atualizado.get("resumo").get("pendentes").asInt()).isZero();
  assertThat(atualizado.get("eventos").get(0).get("source").asText()).isEqualTo("SELF_REPORT");assertThat(atualizado.get("eventos").get(0).has("authorName")).isTrue();
  assertThat(banco.queryForObject("SELECT count(*) FROM medication_self_report WHERE patient_id=?::uuid",Integer.class,paciente)).isEqualTo(2);
  assertThat(agenda(hoje.minusDays(6),hoje,acessoPaciente,200).get("dias").size()).isEqualTo(7);
 }
 @Test void conflitoNaoSobrescreveEAutorrelatoAposEdicaoUsaPlanoHistorico()throws Exception{
  var entrada=plano();String plano=postar("/patients/"+paciente+"/medications",entrada,profissional,200).get("id").asText();
  String horario=agenda(hoje.minusDays(1),hoje.minusDays(1),acessoPaciente,200).get("dias").get(0).get("eventos").get(0).get("scheduledAt").asText();
  entrada.put("version",1);entrada.put("dosagem","20 mg");entrada.put("schedules",List.of("19:00"));
  mvc.perform(put("/api/v1/medications/"+plano).header("Authorization","Bearer "+profissional).contentType(MediaType.APPLICATION_JSON).content(json.writeValueAsString(entrada))).andExpect(status().isOk());
  postar("/patients/"+paciente+"/medication-reports",relato(plano,horario,"TAKEN"),acessoPaciente,200);
  postar("/patients/"+paciente+"/medication-reports",relato(plano,horario,"NOT_TAKEN"),acessoPaciente,409);
  var antigo=agenda(hoje.minusDays(1),hoje.minusDays(1),acessoPaciente,200).get("dias").get(0).get("eventos").get(0);
  assertThat(antigo.get("dosagem").asText()).isEqualTo("10 mg");assertThat(antigo.get("status").asText()).isEqualTo("TAKEN");
  var futuro=agenda(hoje.plusDays(1),hoje.plusDays(1),acessoPaciente,200).get("dias").get(0).get("eventos");assertThat(futuro.size()).isEqualTo(1);assertThat(futuro.get(0).get("dosagem").asText()).isEqualTo("20 mg");
 }
 @Test void confirmaConcorrenciaSemCriarDuasDoses()throws Exception{
  String plano=postar("/patients/"+paciente+"/medications",plano(),profissional,200).get("id").asText();
  String horario=agenda(hoje,hoje,acessoPaciente,200).get("dias").get(0).get("eventos").get(0).get("scheduledAt").asText();
  var executor=Executors.newFixedThreadPool(2);var iniciar=new CountDownLatch(1);
  try{var primeiro=executor.submit(()->{iniciar.await();return postar("/patients/"+paciente+"/medication-reports",relato(plano,horario,"TAKEN"),acessoPaciente,200);});var segundo=executor.submit(()->{iniciar.await();return postar("/patients/"+paciente+"/medication-reports",relato(plano,horario,"TAKEN"),acessoPaciente,200);});iniciar.countDown();assertThat(primeiro.get(20,TimeUnit.SECONDS).get("id")).isEqualTo(segundo.get(20,TimeUnit.SECONDS).get("id"));}
  finally{executor.shutdownNow();}
  assertThat(banco.queryForObject("SELECT count(*) FROM medication_self_report WHERE patient_id=?::uuid",Integer.class,paciente)).isEqualTo(1);
 }
 @Test void protegeEscopoPeriodoEPermissaoProfissional()throws Exception{
  String outro=postar("/auth/login",Map.of("email","profissional.b@demo.vivamais.invalid","password",SENHA),"",200).get("accessToken").asText();
  agenda(hoje,hoje,outro,403);agenda(hoje,hoje.plusDays(31),acessoPaciente,400);agenda(hoje,hoje.minusDays(1),profissional,400);
  postar("/patients/"+paciente+"/medications",plano(),acessoPaciente,403);
 }
 @AfterAll void fechar(){banco.execute("DROP SCHEMA "+SCHEMA+" CASCADE");if(container!=null)container.stop();}
}
