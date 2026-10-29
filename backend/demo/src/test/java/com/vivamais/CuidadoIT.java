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
class CuidadoIT {
 static final String PASSWORD=new CodificadorToken().issue(),SCHEMA="care_"+UUID.randomUUID().toString().replace("-","");
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
 @Test void preferenciasPersistemEntreSessoesComIsolamentoEConflito()throws Exception{
  String caminho="/api/v1/conta/preferencias";
  mvc.perform(get(caminho)).andExpect(status().isUnauthorized());
  mvc.perform(get(caminho).header("Authorization","Bearer "+exigirProfissional)).andExpect(jsonPath("$.versao").value(0));
  String corpo="{\"textoAmpliado\":true,\"tamanhoPagina\":10,\"versao\":0}";
  mvc.perform(put(caminho).header("Authorization","Bearer "+exigirProfissional).contentType(MediaType.APPLICATION_JSON).content(corpo)).andExpect(status().isOk()).andExpect(jsonPath("$.versao").value(1));
  mvc.perform(put(caminho).header("Authorization","Bearer "+exigirProfissional).contentType(MediaType.APPLICATION_JSON).content(corpo)).andExpect(status().isConflict());
  String novaSessao=entrar("profissional.a@demo.vivamais.invalid",PASSWORD);
  mvc.perform(get(caminho).header("Authorization","Bearer "+novaSessao)).andExpect(status().isOk()).andExpect(jsonPath("$.textoAmpliado").value(true)).andExpect(jsonPath("$.tamanhoPagina").value(10));
  for(String token:List.of(other,patientToken))mvc.perform(get(caminho).header("Authorization","Bearer "+token)).andExpect(jsonPath("$.textoAmpliado").value(false)).andExpect(jsonPath("$.versao").value(0));
  mvc.perform(put(caminho).header("Authorization","Bearer "+patientToken).contentType(MediaType.APPLICATION_JSON).content("{\"textoAmpliado\":false,\"tamanhoPagina\":11,\"versao\":0}")).andExpect(status().isBadRequest());
  mvc.perform(put(caminho).header("Authorization","Bearer "+patientToken).contentType(MediaType.APPLICATION_JSON).content("{\"tamanhoPagina\":20,\"versao\":0}")).andExpect(status().isBadRequest());
  assertThat(jdbc.queryForObject("SELECT relrowsecurity FROM pg_class WHERE oid='preferencia_conta'::regclass",Boolean.class)).isTrue();
 }
 @Test void resumoTemTotaisCompletosAutoriaEOrdemDaOcorrencia()throws Exception{
  var criado=write("/patients",Map.of("displayName","Pessoa Sintética Resumo","modality","BRACELET_DIARY"),exigirProfissional);String id=criado.get("patient").get("id").asText();
  for(int i=0;i<23;i++)write("/patients/"+id+"/activities",Map.of("id",UUID.randomUUID(),"type","Registro sintético","durationMinutes",1,"occurredAt",Instant.now().minusSeconds(300+i*60).toString(),"feeling","WELL"),exigirProfissional);
  write("/patients/"+id+"/consultations",Map.of("id",UUID.randomUUID(),"occurredAt",Instant.now().minusSeconds(120).toString(),"notes","Mais recente","goals","Teste","carePlan","Teste"),exigirProfissional);
  write("/patients/"+id+"/consultations",Map.of("id",UUID.randomUUID(),"occurredAt",Instant.now().minusSeconds(3600).toString(),"notes","Mais antiga inserida depois","goals","Teste","carePlan","Teste"),exigirProfissional);
  mvc.perform(get("/api/v1/patients/"+id+"/summary").header("Authorization","Bearer "+exigirProfissional)).andExpect(status().isOk()).andExpect(jsonPath("$.totais.atividades").value(23)).andExpect(jsonPath("$.activities.length()").value(20)).andExpect(jsonPath("$.consultations[0].notes").value("Mais recente")).andExpect(jsonPath("$.consultations[0].authorName").value("Profissional A — DEMO"));
  mvc.perform(get("/api/v1/patients/"+id+"/summary").header("Authorization","Bearer "+other)).andExpect(status().isForbidden());
 }
 @Test void recursosOpcionaisAusentesRetornamSemConteudoEContinuamAutorizados()throws Exception{
  var criado=write("/patients",Map.of("displayName","Pessoa Sintética Sem Perfil","modality","BRACELET_DIARY"),exigirProfissional);
  String id=criado.get("patient").get("id").asText();
  for(String recurso:List.of("activity-profile","device")){
   String caminho="/api/v1/patients/"+id+"/"+recurso;
   mvc.perform(get(caminho).header("Authorization","Bearer "+exigirProfissional)).andExpect(status().isNoContent()).andExpect(content().string(""));
   mvc.perform(get(caminho).header("Authorization","Bearer "+other)).andExpect(status().isForbidden());
   mvc.perform(get(caminho)).andExpect(status().isUnauthorized());
  }
  mvc.perform(put("/api/v1/patients/"+id+"/activity-profile").header("Authorization","Bearer "+exigirProfissional).contentType(MediaType.APPLICATION_JSON).content(json.writeValueAsString(Map.of("mobility","Informação sintética","balance","Informação sintética","restrictions","","professionalGuidance","Orientação sintética")))).andExpect(status().isOk());
  mvc.perform(get("/api/v1/patients/"+id+"/activity-profile").header("Authorization","Bearer "+exigirProfissional)).andExpect(status().isOk()).andExpect(jsonPath("$.professionalGuidance").value("Orientação sintética")).andExpect(jsonPath("$.approvedCatalogGroup").value("NAO_DEFINIDO"));
 }
 @Test void perfilAtividadeVinculaSomenteOsGruposG16Aprovados()throws Exception{
  var criado=write("/patients",Map.of("displayName","Pessoa Sintética Grupo G16","modality","BRACELET_DIARY"),exigirProfissional);String id=criado.get("patient").get("id").asText();
  Map<String,Object> perfil=new LinkedHashMap<>();perfil.put("mobility","Informação sintética");perfil.put("balance","Informação sintética");perfil.put("restrictions","");perfil.put("professionalGuidance","Orientação sintética");
  mvc.perform(put("/api/v1/patients/"+id+"/activity-profile").header("Authorization","Bearer "+exigirProfissional).contentType(MediaType.APPLICATION_JSON).content(json.writeValueAsString(perfil))).andExpect(status().isOk()).andExpect(jsonPath("$.approvedCatalogGroup").value("NAO_DEFINIDO")).andExpect(jsonPath("$.personalizationStatus").value("BLOCKED_PENDING_CLINICAL_APPROVAL"));
  for(String grupo:List.of("COM_RISCO_QUEDA_SENTADO","SEM_RISCO_QUEDA_EM_PE")){
   perfil.put("approvedCatalogGroup",grupo);
   mvc.perform(put("/api/v1/patients/"+id+"/activity-profile").header("Authorization","Bearer "+exigirProfissional).contentType(MediaType.APPLICATION_JSON).content(json.writeValueAsString(perfil))).andExpect(status().isOk()).andExpect(jsonPath("$.approvedCatalogGroup").value(grupo)).andExpect(jsonPath("$.professionalGuidance").value("Orientação sintética")).andExpect(jsonPath("$.personalizationStatus").value("PROFESSIONAL_GROUP_APPROVED"));
  }
  perfil.put("approvedCatalogGroup","GRUPO_INVALIDO");
  mvc.perform(put("/api/v1/patients/"+id+"/activity-profile").header("Authorization","Bearer "+exigirProfissional).contentType(MediaType.APPLICATION_JSON).content(json.writeValueAsString(perfil))).andExpect(status().isBadRequest());
 }
 @Test void administratorManagesAssignmentAndExportRemainsScoped()throws Exception{
  var created=write("/patients",Map.of("displayName","Pessoa vínculo sintético","modality","BRACELET_DIARY"),admin);String id=created.get("patient").get("id").asText();UUID idProfissional=DadosDemonstracao.id("profissional-a");
  mvc.perform(get("/api/v1/patients/"+id).header("Authorization","Bearer "+exigirProfissional)).andExpect(status().isForbidden());
  mvc.perform(post("/api/v1/patients/"+id+"/assignments").header("Authorization","Bearer "+admin).contentType(MediaType.APPLICATION_JSON).content(json.writeValueAsString(Map.of("professionalId",idProfissional)))).andExpect(status().isNoContent());
  mvc.perform(get("/api/v1/patients/"+id+"/export").header("Authorization","Bearer "+exigirProfissional)).andExpect(status().isOk()).andExpect(jsonPath("$.patient.id").value(id)).andExpect(jsonPath("$.meals").isArray()).andExpect(jsonPath("$.medicationEvents").isArray());
  mvc.perform(get("/api/v1/patients/"+id+"/assignments").header("Authorization","Bearer "+exigirProfissional)).andExpect(status().isForbidden());
  mvc.perform(post("/api/v1/patients/"+id+"/assignments/revoke").header("Authorization","Bearer "+admin).contentType(MediaType.APPLICATION_JSON).content(json.writeValueAsString(Map.of("professionalId",idProfissional)))).andExpect(status().isNoContent());
  mvc.perform(get("/api/v1/patients/"+id+"/export").header("Authorization","Bearer "+exigirProfissional)).andExpect(status().isForbidden());
  mvc.perform(get("/api/v1/patients/"+id+"/export").header("Authorization","Bearer "+other)).andExpect(status().isForbidden());
 }
 @Test void createsPatientActivatesOnceAndProtectsAccess()throws Exception{
  String cpf=ApoioAcessoPaciente.gerarCpf();
  var criado=write("/patients",Map.of("displayName","Pessoa de Teste","modality","APP","cpf",cpf,"dataNascimento","1950-01-01"),exigirProfissional);
  String id=criado.get("patient").get("id").asText();
  mvc.perform(get("/api/v1/patients/"+id).header("Authorization","Bearer "+other)).andExpect(status().isForbidden());
  String proprio=ativarPaciente(id,cpf,"1950-01-01");
  mvc.perform(get("/api/v1/patients/me").header("Authorization","Bearer "+proprio)).andExpect(jsonPath("$.id").value(id));
  bancoDeTesteAguardarReemissao();
  var novo=write("/patients/"+id+"/access-reset",Map.of("senhaProfissional",PASSWORD,"identidadeConferida",true),exigirProfissional);
  assertThat(novo.has("activationToken")).isFalse();assertThat(novo.get("estadoEnvio").asText()).isEqualTo("TESTE_LOCAL");
  mvc.perform(get("/api/v1/auth/me").header("Authorization","Bearer "+proprio)).andExpect(status().isUnauthorized());
  mvc.perform(post("/api/v1/patients").header("Authorization","Bearer "+patientToken).contentType(MediaType.APPLICATION_JSON).content("{\"displayName\":\"Denied\",\"modality\":\"BRACELET_DIARY\"}")).andExpect(status().isForbidden());
 }
 void bancoDeTesteAguardarReemissao(){jdbc.update("UPDATE limite_acesso_paciente SET inicio_janela=now()-interval '61 seconds'");}
 String ativarPaciente(String id,String cpf,String nascimento)throws Exception{
  var envio=write("/patients/"+id+"/access-reset",Map.of("senhaProfissional",PASSWORD,"identidadeConferida",true),exigirProfissional);String codigo=ApoioAcessoPaciente.lerCodigoSms(System.getProperty("java.io.tmpdir")+"/viva-files-"+SCHEMA,envio.get("idEnvio").asText(),json);
  String desafio=write("/auth/paciente/iniciar",Map.of("cpf",cpf,"dataNascimento",nascimento,"tipo","NATIVO"),exigirProfissional).get("desafio").asText();
  return write("/auth/paciente/verificar",Map.of("desafio",desafio,"codigo",codigo,"tipo","NATIVO"),exigirProfissional).get("sessao").get("accessToken").asText();
 }
 @Test void cadastroDemograficoEdicaoContatoEIsolamento()throws Exception{
  StringBuilder documento=new StringBuilder();for(int indice=0;indice<9;indice++)documento.append(new java.security.SecureRandom().nextInt(10));
  for(int posicao=9;posicao<11;posicao++){int soma=0;for(int indice=0;indice<posicao;indice++)soma+=(documento.charAt(indice)-'0')*(posicao+1-indice);documento.append(((soma*10)%11)%10);}
  String email="cadastro-"+UUID.randomUUID()+"@demo.invalid";
  var criado=write("/patients",Map.of("displayName","Pessoa Sintética Cadastro Completo","modality","APP","email",email,"cpf",documento.toString(),"dataNascimento","1950-01-01","telefone","(11) 99999-0000","sexo","NAO_INFORMADO","endereco","Endereço sintético"),exigirProfissional);
  String id=criado.get("patient").get("id").asText(),caminho="/api/v1/pacientes/"+id+"/dados-pessoais";
  mvc.perform(get(caminho).header("Authorization","Bearer "+exigirProfissional)).andExpect(status().isOk()).andExpect(jsonPath("$.dataNascimento").value("1950-01-01")).andExpect(jsonPath("$.telefone").value("+5511999990000"));
  mvc.perform(get(caminho).header("Authorization","Bearer "+other)).andExpect(status().isForbidden());
  mvc.perform(get(caminho).header("Authorization","Bearer "+patientToken)).andExpect(status().isForbidden());
  mvc.perform(get(caminho)).andExpect(status().isUnauthorized());
  var atualizacao=new LinkedHashMap<String,Object>(Map.of("nomeCompleto","Pessoa Sintética Atualizada","cpf",documento.toString(),"dataNascimento","1950-02-01","emailContato","contato@demo.invalid","telefone","(11) 99999-0001","sexo","FEMININO","endereco","Endereço corrigido","versao",0));
  atualizacao.put("senhaProfissional",PASSWORD);atualizacao.put("identidadeConferida",true);
  mvc.perform(put(caminho).header("Authorization","Bearer "+exigirProfissional).contentType(MediaType.APPLICATION_JSON).content(json.writeValueAsString(atualizacao))).andExpect(status().isOk()).andExpect(jsonPath("$.versao").value(1));
  mvc.perform(put(caminho).header("Authorization","Bearer "+exigirProfissional).contentType(MediaType.APPLICATION_JSON).content(json.writeValueAsString(atualizacao))).andExpect(status().isConflict());
  String proprio=ativarPaciente(id,documento.toString(),"1950-02-01");

  mvc.perform(put(caminho).header("Authorization","Bearer "+proprio).contentType(MediaType.APPLICATION_JSON).content(json.writeValueAsString(atualizacao))).andExpect(status().isForbidden());
  String contato="/api/v1/pacientes/"+id+"/contato";
  mvc.perform(put(contato).header("Authorization","Bearer "+proprio).contentType(MediaType.APPLICATION_JSON).content("{\"telefone\":\"(11) 99999-0002\",\"versao\":1}")).andExpect(status().isForbidden());
  mvc.perform(put(contato).header("Authorization","Bearer "+patientToken).contentType(MediaType.APPLICATION_JSON).content("{\"telefone\":\"\",\"versao\":2}")).andExpect(status().isForbidden());
  mvc.perform(post("/api/v1/patients").header("Authorization","Bearer "+exigirProfissional).contentType(MediaType.APPLICATION_JSON).content(json.writeValueAsString(Map.of("displayName","Duplicado","modality","BRACELET_DIARY","cpf",documento.toString(),"telefone",ApoioAcessoPaciente.gerarTelefone())))).andExpect(status().isConflict());
  atualizacao.put("cpf","000.000.000-00");atualizacao.put("versao",2);
  mvc.perform(put(caminho).header("Authorization","Bearer "+exigirProfissional).contentType(MediaType.APPLICATION_JSON).content(json.writeValueAsString(atualizacao))).andExpect(status().isBadRequest());
  atualizacao.put("cpf",documento.toString());atualizacao.put("dataNascimento",LocalDate.now().plusDays(1).toString());
  mvc.perform(put(caminho).header("Authorization","Bearer "+exigirProfissional).contentType(MediaType.APPLICATION_JSON).content(json.writeValueAsString(atualizacao))).andExpect(status().isBadRequest());
 }
 @Test void semanaAtividadesUsaHorarioLocalEPeriodoCompleto()throws Exception{
  var criado=write("/patients",Map.of("displayName","Pessoa Sintética Semana","modality","BRACELET_DIARY"),exigirProfissional);String id=criado.get("patient").get("id").asText();
  String caminho="/patients/"+id+"/activities";
  for(var evento:List.of(Map.entry("2026-01-04T23:59:00-03:00",11),Map.entry("2026-01-05T00:00:00-03:00",7),Map.entry("2026-01-11T23:59:00-03:00",13),Map.entry("2026-01-12T00:00:00-03:00",17)))write(caminho,Map.of("id",UUID.randomUUID(),"type","Atividade voluntária sintética","durationMinutes",evento.getValue(),"occurredAt",OffsetDateTime.parse(evento.getKey()).toInstant().toString(),"feeling","WELL"),exigirProfissional);
  String semana="/api/v1/pacientes/"+id+"/atividades/semana?inicio=2026-01-05";
  mvc.perform(get(semana).header("Authorization","Bearer "+exigirProfissional)).andExpect(status().isOk()).andExpect(jsonPath("$.totalRegistros").value(2)).andExpect(jsonPath("$.totalMinutos").value(20)).andExpect(jsonPath("$.dias.length()").value(2));
  mvc.perform(get(semana).header("Authorization","Bearer "+other)).andExpect(status().isForbidden());
  mvc.perform(get("/api/v1"+caminho+"?from=2026-01-05T03:00:00Z&to=2026-01-12T03:00:00Z").header("Authorization","Bearer "+exigirProfissional)).andExpect(status().isOk()).andExpect(jsonPath("$.total").value(2));
  mvc.perform(get("/api/v1/pacientes/"+id+"/atividades/semana?inicio=2026-01-06").header("Authorization","Bearer "+exigirProfissional)).andExpect(status().isBadRequest());
 }
 @Test void bloquearAcessoDiretoAoBancoParaPapelCliente()throws Exception{
  jdbc.execute((org.springframework.jdbc.core.ConnectionCallback<Void>) conexao->{boolean estadoAnterior=conexao.getAutoCommit();conexao.setAutoCommit(false);String papel="cliente_teste_"+UUID.randomUUID().toString().replace("-","");
   try(var instrucao=conexao.createStatement()){
    instrucao.execute("CREATE ROLE "+papel+" NOLOGIN");instrucao.execute("GRANT USAGE ON SCHEMA "+SCHEMA+" TO "+papel);instrucao.execute("GRANT SELECT ON "+SCHEMA+".patient TO "+papel);instrucao.execute("SET LOCAL ROLE "+papel);
    try(var resultado=instrucao.executeQuery("SELECT count(*) FROM "+SCHEMA+".patient")){resultado.next();assertThat(resultado.getLong(1)).isZero();}
    assertThatThrownBy(()->instrucao.executeQuery("SELECT * FROM "+SCHEMA+".user_account")).isInstanceOf(java.sql.SQLException.class);
   }finally{conexao.rollback();conexao.setAutoCommit(estadoAnterior);}return null;
  });
 }
 @Test void readingsArePersistentIdempotentAndIsolated()throws Exception{
  UUID id=UUID.randomUUID();String path="/patients/"+paciente+"/readings";Map<String,Object> body=new LinkedHashMap<>(Map.of("id",id,"systolic",119,"diastolic",77,"pulse",70,"measuredAt",Instant.now().minusSeconds(120).toString(),"source","MANUAL"));
  var first=write(path,body,patientToken);var retry=write(path,body,patientToken);assertThat(first.get("id")).isEqualTo(retry.get("id"));assertThat(first.get("createdAt").asText()).isNotEqualTo(body.get("measuredAt"));
  String rotaResultado="/api/v1/pacientes/"+paciente+"/registros-pressao/"+id;
  mvc.perform(get(rotaResultado).header("Authorization","Bearer "+patientToken)).andExpect(status().isOk()).andExpect(jsonPath("$.systolic").value(119));
  mvc.perform(get(rotaResultado).header("Authorization","Bearer "+other)).andExpect(status().isForbidden());
  mvc.perform(get("/api/v1/pacientes/"+DadosDemonstracao.id("patient-app-b")+"/registros-pressao/"+id).header("Authorization","Bearer "+patientToken)).andExpect(status().isForbidden());
  mvc.perform(get("/api/v1"+path).header("Authorization","Bearer "+exigirProfissional)).andExpect(jsonPath("$.items[*].id").value(org.hamcrest.Matchers.hasItem(id.toString())));
  mvc.perform(get("/api/v1"+path).header("Authorization","Bearer "+other)).andExpect(status().isForbidden());
  body.put("systolic",120);mvc.perform(post("/api/v1"+path).header("Authorization","Bearer "+patientToken).contentType(MediaType.APPLICATION_JSON).content(json.writeValueAsString(body))).andExpect(status().isConflict());
  body.put("id",UUID.randomUUID());body.put("source","PROFESSIONAL");mvc.perform(post("/api/v1"+path).header("Authorization","Bearer "+patientToken).contentType(MediaType.APPLICATION_JSON).content(json.writeValueAsString(body))).andExpect(status().isForbidden());
 }
 @Test void medicationsVersionsReportsAndDiaryAreReal()throws Exception{
  String path="/patients/"+paciente;String day=LocalDate.now(ZoneId.of("America/Sao_Paulo")).toString();Map<String,Object> plan=new LinkedHashMap<>(Map.of("name","Medicamento de teste","instruction","Instrução sintética cadastrada pelo profissional","startsOn",day,"timeZone","America/Sao_Paulo","schedules",List.of("08:00","20:00")));
  var salvarMedicamento=write(path+"/medications",plan,exigirProfissional);String id=salvarMedicamento.get("id").asText();
  var events=json.readTree(mvc.perform(get("/api/v1"+path+"/medication-events?date="+day).header("Authorization","Bearer "+patientToken)).andExpect(status().isOk()).andReturn().getResponse().getContentAsString());assertThat(events.get(0).get("status").asText()).isEqualTo("NO_CONFIRMATION");
  Map<String,Object> registrarAutorrelato=Map.of("id",UUID.randomUUID(),"planId",id,"scheduledAt",events.get(0).get("scheduledAt").asText(),"status","TAKEN","reportedAt",Instant.now().toString());assertThat(write(path+"/medication-reports",registrarAutorrelato,patientToken).get("source").asText()).isEqualTo("SELF_REPORT");write(path+"/medication-reports",registrarAutorrelato,patientToken);
  plan.put("version",1);plan.put("instruction","Instrução sintética revisada");mvc.perform(put("/api/v1/medications/"+id).header("Authorization","Bearer "+exigirProfissional).contentType(MediaType.APPLICATION_JSON).content(json.writeValueAsString(plan))).andExpect(status().isOk()).andExpect(jsonPath("$.version").value(2));
  mvc.perform(put("/api/v1/medications/"+id).header("Authorization","Bearer "+exigirProfissional).contentType(MediaType.APPLICATION_JSON).content(json.writeValueAsString(plan))).andExpect(status().isConflict());
  var diario=write(path+"/diary",Map.of("id",UUID.randomUUID(),"occurredAt",Instant.now().minusSeconds(3600).toString(),"systolic",122,"diastolic",78,"medicationReport","Sem confirmação no diário","notes","Transcrição sintética"),exigirProfissional);assertThat(diario.get("source").asText()).isEqualTo("PRINTED_DIARY");
 }
 @Test void consultationActivityAndBraceletSimulationDoNotPretendHardware()throws Exception{
  String path="/patients/"+paciente;write(path+"/activities",Map.of("id",UUID.randomUUID(),"type","Atividade informada pela pessoa","durationMinutes",5,"occurredAt",Instant.now().toString(),"feeling","WELL","notes","Sem recomendação gerada"),patientToken);
  write(path+"/consultations",Map.of("id",UUID.randomUUID(),"occurredAt",Instant.now().toString(),"notes","Consulta sintética","goals","Objetivo informado","carePlan","Plano do profissional"),exigirProfissional);
  mvc.perform(get("/api/v1"+path+"/summary").header("Authorization","Bearer "+exigirProfissional)).andExpect(status().isOk()).andExpect(jsonPath("$.consultations.length()").value(1));
  String diario="/patients/"+DadosDemonstracao.id("patient-diary-a");write(diario+"/device",Map.of("label","Pulseira de teste"),exigirProfissional);var config=write(diario+"/device/configurations",Map.of("schedules",List.of("08:00"),"adapter","SIMULATED"),exigirProfissional);assertThat(config.get("simulated").asBoolean()).isTrue();assertThat(config.get("message").asText()).contains("SIMULADO");var real=write(diario+"/device/configurations",Map.of("schedules",List.of("08:00"),"adapter","HARDWARE"),exigirProfissional);assertThat(real.get("status").asText()).isEqualTo("UNSUPPORTED");
 }
 byte[] photo()throws Exception{var image=new java.awt.image.BufferedImage(760,440,java.awt.image.BufferedImage.TYPE_INT_RGB);var g=image.createGraphics();g.setColor(java.awt.Color.WHITE);g.fillRect(0,0,760,440);g.setColor(java.awt.Color.BLACK);g.setFont(new java.awt.Font("SansSerif",java.awt.Font.PLAIN,70));g.drawString("SYS 118",40,100);g.drawString("DIA 76",40,230);g.drawString("PULSE 71",40,360);g.dispose();var out=new java.io.ByteArrayOutputStream();javax.imageio.ImageIO.write(image,"png",out);return out.toByteArray();}
 JsonNode upload(String finalidade,String token,byte[] data)throws Exception{return json.readTree(mvc.perform(multipart("/api/v1/patients/"+paciente+"/files").file(new org.springframework.mock.web.MockMultipartFile("file","synthetic.png","image/png",data)).param("purpose",finalidade).header("Authorization","Bearer "+token)).andExpect(status().isOk()).andReturn().getResponse().getContentAsString());}
 @Test void photosAreEncryptedPrivateScopedAndLinksExpireWithSession()throws Exception{
  String token=entrar("paciente.a@demo.vivamais.invalid",PASSWORD);var arquivo=upload("MEAL",token,photo());String id=arquivo.get("id").asText();
  var armazenado=java.nio.file.Files.readAllBytes(java.nio.file.Path.of(System.getProperty("java.io.tmpdir"),"viva-files-"+SCHEMA,id+".bin"));assertThat(armazenado[0]).isNotEqualTo((byte)0x89);
  mvc.perform(post("/api/v1/files/"+id+"/link").header("Authorization","Bearer "+other)).andExpect(status().isForbidden());
  var link=write("/files/"+id+"/link",Map.of(),token);String path=link.get("path").asText();
  mvc.perform(get(path)).andExpect(status().isOk()).andExpect(content().contentType("image/png")).andExpect(header().string("Cache-Control","private, no-store"));
  write("/patients/"+paciente+"/meals",Map.of("fileId",id,"occurredAt",Instant.now().toString(),"notes","Foto sintética"),token);
  var listarRefeicoes=json.readTree(mvc.perform(get("/api/v1/patients/"+paciente+"/meals").header("Authorization","Bearer "+exigirProfissional)).andExpect(status().isOk()).andReturn().getResponse().getContentAsString());
  String idRefeicao=listarRefeicoes.get("items").get(0).get("id").asText();
  mvc.perform(get("/api/v1/refeicoes/"+idRefeicao).header("Authorization","Bearer "+token)).andExpect(status().isOk()).andExpect(jsonPath("$.fileId").value(id));
  mvc.perform(get("/api/v1/refeicoes/"+idRefeicao).header("Authorization","Bearer "+exigirProfissional)).andExpect(status().isOk());
  mvc.perform(get("/api/v1/refeicoes/"+idRefeicao).header("Authorization","Bearer "+other)).andExpect(status().isForbidden());
  mvc.perform(get("/api/v1/refeicoes/"+UUID.randomUUID()).header("Authorization","Bearer "+token)).andExpect(status().isForbidden());
  var unavailable=write("/meals/"+idRefeicao+"/analyze",Map.of(),token);assertThat(unavailable.get("providerCalled").asBoolean()).isFalse();assertThat(unavailable.get("status").asText()).isEqualTo("UNAVAILABLE");assertThat(unavailable.has("trafficLight")).isFalse();assertThat(unavailable.has("assessment")).isFalse();
  mvc.perform(get("/api/v1/refeicoes/"+idRefeicao).header("Authorization","Bearer "+token)).andExpect(status().isOk()).andExpect(jsonPath("$.analysisStatus").value("UNAVAILABLE")).andExpect(jsonPath("$.assessment").doesNotExist());
  mvc.perform(post("/api/v1/auth/logout").header("Authorization","Bearer "+token)).andExpect(status().isNoContent());mvc.perform(get(path)).andExpect(status().isForbidden());
  mvc.perform(multipart("/api/v1/patients/"+paciente+"/files").file(new org.springframework.mock.web.MockMultipartFile("file","malicious.svg","image/svg+xml","<svg><script>bad</script></svg>".getBytes())).param("purpose","MEAL").header("Authorization","Bearer "+patientToken)).andExpect(status().isUnsupportedMediaType());
 }
 @Test void realOcrRequiresExplicitConfirmationBeforeAnyReadingIsInserted()throws Exception{
  Assumptions.assumeTrue(System.getenv("TEST_OCR_NODE_SCRIPT")!=null||"true".equals(System.getenv("TEST_NATIVE_OCR")),"Real Tesseract runtime required");
  var arquivo=upload("PRESSURE_DISPLAY",patientToken,photo());var resultado=write("/files/"+arquivo.get("id").asText()+"/ocr",Map.of(),patientToken);assertThat(resultado.get("status").asText()).isEqualTo("RECOGNIZED");assertThat(resultado.get("systolic").asInt()).isEqualTo(118);assertThat(resultado.get("diastolic").asInt()).isEqualTo(76);assertThat(resultado.get("pulse").asInt()).isEqualTo(71);assertThat(resultado.get("confirmationRequired").asBoolean()).isTrue();assertThat(resultado.get("reviewRequired").asBoolean()).isTrue();assertThat(resultado.get("criteriaVersion").asText()).isEqualTo("ocr-safety-v1");assertThat(resultado.get("modelVersion").asText()).isEqualTo("tesseract-eng-psm6");
  String document=resultado.get("id").asText();assertThat(jdbc.queryForObject("SELECT count(*) FROM blood_pressure_reading WHERE ocr_document_id=?",Integer.class,UUID.fromString(document))).isZero();
  Map<String,Object> entrada=new LinkedHashMap<>(Map.of("id",UUID.randomUUID(),"systolic",118,"diastolic",76,"pulse",71,"measuredAt",Instant.now().toString(),"source","OCR_CONFIRMED","ocrDocumentId",document,"ocrConfirmed",false));
  mvc.perform(post("/api/v1/patients/"+paciente+"/readings").header("Authorization","Bearer "+patientToken).contentType(MediaType.APPLICATION_JSON).content(json.writeValueAsString(entrada))).andExpect(status().isBadRequest());entrada.put("ocrConfirmed",true);write("/patients/"+paciente+"/readings",entrada,patientToken);assertThat(jdbc.queryForObject("SELECT count(*) FROM blood_pressure_reading WHERE ocr_document_id=?",Integer.class,UUID.fromString(document))).isEqualTo(1);
 }
}
