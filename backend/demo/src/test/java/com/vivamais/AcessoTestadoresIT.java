package com.vivamais;
import static org.assertj.core.api.Assertions.*;
import static org.springframework.test.web.servlet.request.MockMvcRequestBuilders.*;
import static org.springframework.test.web.servlet.result.MockMvcResultMatchers.*;
import com.vivamais.config.DadosDemonstracao;
import com.vivamais.repositories.InstituicaoRepository;
import com.vivamais.security.CodificadorToken;
import java.util.*;
import org.junit.jupiter.api.*;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.boot.test.context.SpringBootTest;
import org.springframework.boot.webmvc.test.autoconfigure.*;
import org.springframework.http.MediaType;
import org.springframework.jdbc.core.JdbcTemplate;
import org.springframework.test.context.*;
import org.springframework.test.web.servlet.*;
import org.springframework.test.web.servlet.request.MockHttpServletRequestBuilder;
import org.testcontainers.containers.PostgreSQLContainer;
import tools.jackson.databind.*;

@SpringBootTest @AutoConfigureMockMvc(print=MockMvcPrint.NONE) @ActiveProfiles("bootstrap") @TestInstance(TestInstance.Lifecycle.PER_CLASS)
class AcessoTestadoresIT {
 static final String SENHA=new CodificadorToken().issue(),SCHEMA=System.getenv().getOrDefault("TEST_DATABASE_SCHEMA","grupo_"+UUID.randomUUID().toString().replace("-",""));static PostgreSQLContainer<?> container;
 @DynamicPropertySource static void configurar(DynamicPropertyRegistry r){
  if(!SCHEMA.matches("grupo_[a-f0-9]{32}"))throw new IllegalArgumentException("Schema de teste deve ser isolado e começar com grupo_.");
  if(System.getenv("TEST_DATABASE_URL")!=null){r.add("spring.datasource.url",()->System.getenv("TEST_DATABASE_URL"));r.add("spring.datasource.username",()->System.getenv("TEST_DATABASE_USER"));r.add("spring.datasource.password",()->System.getenv("TEST_DATABASE_PASSWORD"));}
  else{container=new PostgreSQLContainer<>("postgres:17.9-alpine");container.start();r.add("spring.datasource.url",container::getJdbcUrl);r.add("spring.datasource.username",container::getUsername);r.add("spring.datasource.password",container::getPassword);}
  r.add("app.bootstrap-password",()->SENHA);r.add("spring.flyway.default-schema",()->SCHEMA);r.add("spring.datasource.hikari.schema",()->SCHEMA);
  r.add("testadores.habilitado",()->true);r.add("testadores.unidade",()->DadosDemonstracao.id("organization-a").toString());r.add("files.directory",()->System.getProperty("java.io.tmpdir")+"/viva-"+SCHEMA);
 }
 @Autowired MockMvc mvc;@Autowired ObjectMapper json;@Autowired JdbcTemplate banco;@Autowired InstituicaoRepository instituicoes;
 String profissional,paciente;
 JsonNode enviar(MockHttpServletRequestBuilder pedido,Object corpo,int esperado)throws Exception{if(corpo!=null)pedido.contentType(MediaType.APPLICATION_JSON).content(json.writeValueAsString(corpo));String retorno=mvc.perform(pedido).andExpect(status().is(esperado)).andReturn().getResponse().getContentAsString();return retorno.isBlank()||!retorno.stripLeading().startsWith("{")&&!retorno.stripLeading().startsWith("[")?null:json.readTree(retorno);}
 String profissional(String unidade)throws Exception{return enviar(post("/api/v1/auth/login"),Map.of("email","profissional."+unidade+"@demo.vivamais.invalid","password",SENHA),200).get("accessToken").asText();}
 String rota(){return "/api/v1/patients/"+paciente+"/test-invites";}
 JsonNode convite()throws Exception{return enviar(post(rota()).header("Authorization","Bearer "+profissional),Map.of("senhaProfissional",SENHA,"validadeDias",7),200);}
 JsonNode entrar(String segredo,int esperado)throws Exception{return enviar(post("/api/v1/auth/testadores/convite"),Map.of("convite",segredo,"tipo","NATIVO"),esperado);}
 JsonNode renovar(String segredo,int esperado)throws Exception{return enviar(post("/api/v1/auth/testadores/renovar"),Map.of("credencialRenovacao",segredo,"tipo","NATIVO"),esperado);}
 void usar(String token,int esperado)throws Exception{mvc.perform(get("/api/v1/patients/me").header("Authorization","Bearer "+token)).andExpect(status().is(esperado));}
 @BeforeEach void preparar()throws Exception{
  banco.update("DELETE FROM limite_acesso_paciente");profissional=profissional("a");
  paciente=enviar(post("/api/v1/patients").header("Authorization","Bearer "+profissional),Map.of("displayName","Participante fictício individual","modality","APP","cpf",ApoioAcessoPaciente.gerarCpf(),"dataNascimento","1950-01-01","telefone",ApoioAcessoPaciente.gerarTelefone()),200).get("patient").get("id").asText();
 }
 @Test void conviteUsoUnicoRenovacaoRotativaESaidaRevogamAcesso()throws Exception{
  var convite=convite();String segredo=convite.get("convite").asText();assertThat(segredo).hasSize(43);
  var acesso=entrar(segredo,200);String token=acesso.get("sessao").get("accessToken").asText(),renovacao=acesso.get("credencialRenovacao").asText();usar(token,200);entrar(segredo,401);
  var novo=renovar(renovacao,200);usar(token,401);renovar(renovacao,401);token=novo.get("sessao").get("accessToken").asText();usar(token,200);
  mvc.perform(post("/api/v1/auth/logout").header("Authorization","Bearer "+token)).andExpect(status().isNoContent());usar(token,401);renovar(novo.get("credencialRenovacao").asText(),401);
  assertThat(banco.queryForObject("SELECT enabled FROM user_account u JOIN patient p ON p.user_account_id=u.id WHERE p.id=?::uuid",Boolean.class,paciente)).isFalse();
  assertThat(banco.queryForObject("SELECT count(*) FROM dispositivo_acesso_paciente d JOIN patient p ON p.user_account_id=d.id_usuario WHERE p.id=?::uuid",Integer.class,paciente)).isZero();
  String listado=enviar(get(rota()).header("Authorization","Bearer "+profissional),null,200).toString();assertThat(listado).doesNotContain(segredo,renovacao,"hash_convite","hash_renovacao");
 }
 @Test void revogacaoExpiracaoEDadosNaoSinteticosInvalidamSessoes()throws Exception{
  var convite=convite();var acesso=entrar(convite.get("convite").asText(),200);
  enviar(post(rota()+"/"+convite.get("id").asText()+"/revoke").header("Authorization","Bearer "+profissional),Map.of(),204);
  usar(acesso.get("sessao").get("accessToken").asText(),401);renovar(acesso.get("credencialRenovacao").asText(),401);
  convite=convite();acesso=entrar(convite.get("convite").asText(),200);
  banco.update("UPDATE convite_testador SET criado_em=now()-interval '2 days',expira_em=now()-interval '1 day' WHERE id=?::uuid",convite.get("id").asText());usar(acesso.get("sessao").get("accessToken").asText(),401);
  convite=convite();acesso=entrar(convite.get("convite").asText(),200);assertThatThrownBy(()->banco.update("UPDATE patient SET demo_only=false WHERE id=?::uuid",paciente)).isInstanceOf(org.springframework.dao.DataIntegrityViolationException.class);
  var modoDesligado=new InstituicaoRepository(banco,new com.vivamais.config.ConfiguracaoAcessoDemonstracao(false,"","development","127.0.0.1",new com.vivamais.config.PropriedadesAplicacao(true,List.of(),java.time.Duration.ofMinutes(30),""),new org.springframework.mock.env.MockEnvironment()));
  assertThat(modoDesligado.principalAutenticado(new CodificadorToken().hash(acesso.get("sessao").get("accessToken").asText()))).isEmpty();
 }
 @Test void exigeReautenticacaoPermissaoEVinculoESemSmsNoGrupo()throws Exception{
  enviar(post(rota()).header("Authorization","Bearer "+profissional),Map.of("senhaProfissional","senha incorreta","validadeDias",7),401);
  enviar(post(rota()).header("Authorization","Bearer "+profissional),Map.of("senhaProfissional",SENHA,"validadeDias",8),400);
  enviar(get(rota()).header("Authorization","Bearer "+profissional("b")),null,403);
  var acesso=entrar(convite().get("convite").asText(),200);String token=acesso.get("sessao").get("accessToken").asText();
  enviar(get(rota()).header("Authorization","Bearer "+token),null,403);
  mvc.perform(get("/api/v1/patients/"+DadosDemonstracao.id("patient-app-b")+"/medication-agenda?from=2026-11-03&to=2026-11-03").header("Authorization","Bearer "+token)).andExpect(status().isForbidden());
  mvc.perform(get("/api/v1/patients/"+paciente+"/access-status").header("Authorization","Bearer "+profissional)).andExpect(status().isOk()).andExpect(jsonPath("$.estado").value("TESTE_POR_CONVITE"));
  enviar(post("/api/v1/patients/"+paciente+"/access-reset").header("Authorization","Bearer "+profissional),Map.of("senhaProfissional",SENHA,"identidadeConferida",true),409);
  assertThat(banco.queryForObject("SELECT count(*) FROM codigo_ativacao_paciente",Integer.class)).isZero();
  assertThat(banco.queryForObject("SELECT relrowsecurity FROM pg_class WHERE oid='convite_testador'::regclass",Boolean.class)).isTrue();
 }
 @Test void rejeitaHttpRemotoOrigemForjadaECanaisMisturados()throws Exception{
  String segredo=convite().get("convite").asText();var corpo=Map.of("convite",segredo,"tipo","NATIVO");
  enviar(post("/api/v1/auth/testadores/convite").with(r->{r.setRemoteAddr("198.51.100.1");return r;}),corpo,403);
  enviar(post("/api/v1/auth/testadores/convite").header("Origin","http://localhost:8081"),corpo,403);
  enviar(post("/api/v1/auth/testadores/convite").header("X-Forwarded-Proto","https"),corpo,403);
  enviar(post("/api/v1/auth/testadores/convite"),Map.of("convite",segredo,"tipo","WEB"),403);
  enviar(post("/api/v1/auth/testadores/convite").header("Origin","https://externo.example.org"),Map.of("convite",segredo,"tipo","WEB"),403);
  var retorno=mvc.perform(post("/api/v1/auth/testadores/convite").header("Origin","http://localhost:8081").contentType(MediaType.APPLICATION_JSON).content(json.writeValueAsString(Map.of("convite",segredo,"tipo","WEB")))).andExpect(status().isOk()).andReturn().getResponse();
  assertThat(retorno.getContentAsString()).doesNotContain("credencialRenovacao");assertThat(retorno.getHeader("Set-Cookie")).contains("HttpOnly","Secure","SameSite=Strict");
 }
 @Test void fotoDoTestadorUsaSessaoCentralENegaAcessoAposRevogacaoOuExpiracao()throws Exception{
  var convite=convite();var acesso=entrar(convite.get("convite").asText(),200);String token=acesso.get("sessao").get("accessToken").asText();
  var imagem=new java.awt.image.BufferedImage(24,24,java.awt.image.BufferedImage.TYPE_INT_RGB);
  var bytes=new java.io.ByteArrayOutputStream();javax.imageio.ImageIO.write(imagem,"png",bytes);
  var retorno=mvc.perform(multipart("/api/v1/patients/"+paciente+"/files")
    .file(new org.springframework.mock.web.MockMultipartFile("file","refeicao-sintetica.png","image/png",bytes.toByteArray()))
    .param("purpose","MEAL").header("Authorization","Bearer "+token)).andExpect(status().isOk()).andReturn().getResponse();
  String arquivo=json.readTree(retorno.getContentAsString()).get("id").asText();
  var link=enviar(post("/api/v1/files/"+arquivo+"/link").header("Authorization","Bearer "+token),null,200);
  mvc.perform(get(link.get("path").asText())).andExpect(status().isOk()).andExpect(content().contentType("image/png"));
  enviar(post("/api/v1/files/"+arquivo+"/link").header("Authorization","Bearer "+profissional("b")),null,403);
  var linkProfissional=enviar(post("/api/v1/files/"+arquivo+"/link").header("Authorization","Bearer "+profissional),null,200);
  enviar(post(rota()+"/"+convite.get("id").asText()+"/revoke").header("Authorization","Bearer "+profissional),Map.of(),204);
  mvc.perform(get(link.get("path").asText())).andExpect(status().isForbidden());
  mvc.perform(get(linkProfissional.get("path").asText())).andExpect(status().isOk());
  banco.update("UPDATE file_download_grant SET expires_at=now()-interval '1 second' WHERE file_id=?::uuid",arquivo);
  mvc.perform(get(linkProfissional.get("path").asText())).andExpect(status().isForbidden());
 }
 String administrador()throws Exception{return enviar(post("/api/v1/auth/login"),Map.of("email","admin.a@demo.vivamais.invalid","password",SENHA),200).get("accessToken").asText();}
 JsonNode integrante(String papel,String admin)throws Exception{return enviar(post("/api/v1/grupo-testes").header("Authorization","Bearer "+admin),Map.of("nome","Integrante fictício","papel",papel,"validadeDias",7,"senhaProfissional",SENHA),200);}
 JsonNode listaGrupo(String admin)throws Exception{return enviar(get("/api/v1/grupo-testes").header("Authorization","Bearer "+admin),null,200);}
 JsonNode ativarProfissional(JsonNode convite,int esperado)throws Exception{return enviar(post("/api/v1/auth/grupo/ativar-profissional"),Map.of("convite",convite.get("convite").asText(),"senha",SENHA),esperado);}
 @Test void grupoProfissionalUsoUnicoSemAdminIsolamentoERevogacao()throws Exception{
  String admin=administrador();enviar(get("/api/v1/grupo-testes").header("Authorization","Bearer "+profissional),null,403);
  var convite=integrante("PROFESSIONAL",admin);String email=ativarProfissional(convite,200).get("email").asText();ativarProfissional(convite,401);
  String token=enviar(post("/api/v1/auth/login"),Map.of("email",email,"password",SENHA),200).get("accessToken").asText();
  var pacientes=enviar(get("/api/v1/patients").header("Authorization","Bearer "+token),null,200);assertThat(pacientes.size()).isEqualTo(1);
  String id=pacientes.get(0).get("id").asText();enviar(get("/api/v1/patients/"+paciente+"/meals").header("Authorization","Bearer "+token),null,403);
  enviar(get("/api/v1/grupo-testes").header("Authorization","Bearer "+token),null,403);
  assertThat(enviar(get("/api/v1/patients/"+id+"/meals").header("Authorization","Bearer "+token),null,200).get("total").asInt()).isEqualTo(1);
  assertThat(enviar(get("/api/v1/food/status").header("Authorization","Bearer "+token),null,200).get("enabled").asBoolean()).isFalse();
  var plano=enviar(get("/api/v1/patients/"+id+"/medications").header("Authorization","Bearer "+token),null,200).get(0);
  var amanha=java.time.LocalDate.now(java.time.ZoneId.of("America/Sao_Paulo")).plusDays(1);var depois=amanha.plusDays(1);
  var atualizado=enviar(put("/api/v1/medications/"+plano.get("id").asText()).header("Authorization","Bearer "+token),Map.of("name","Medicamento fictício","instruction","Somente teste, não utilizar medicamento.","startsOn",depois.toString(),"timeZone","America/Sao_Paulo","schedules",List.of("09:00"),"version",plano.get("version").asInt()),200);
  var agenda=enviar(get("/api/v1/patients/"+id+"/medication-agenda?from="+amanha+"&to="+amanha).header("Authorization","Bearer "+token),null,200);
  assertThat(agenda.get("dias").get(0).get("resumo").get("previstas").asInt()).isEqualTo(2);
  enviar(put("/api/v1/medications/"+plano.get("id").asText()).header("Authorization","Bearer "+token),Map.of("name","Medicamento fictício","instruction","Somente teste, sem conduta clínica.","startsOn",amanha.toString(),"timeZone","America/Sao_Paulo","schedules",List.of("11:00"),"version",atualizado.get("version").asInt()),200);
  agenda=enviar(get("/api/v1/patients/"+id+"/medication-agenda?from="+amanha+"&to="+depois).header("Authorization","Bearer "+token),null,200);
  for(var dia:agenda.get("dias")){assertThat(dia.get("eventos").size()).isEqualTo(1);assertThat(dia.get("eventos").get(0).get("horarioLocal").asText()).isEqualTo("11:00");}
  assertThat(listaGrupo(admin).toString()).doesNotContain(convite.get("convite").asText(),"hash_convite");
  enviar(post("/api/v1/grupo-testes/"+convite.get("id").asText()+"/desativar").header("Authorization","Bearer "+admin),Map.of(),204);
  enviar(get("/api/v1/auth/me").header("Authorization","Bearer "+token),null,401);enviar(post("/api/v1/auth/login"),Map.of("email",email,"password",SENHA),401);
 }
 @Test void grupoPacienteReemissaoEDesativacaoInvalidamRenovacao()throws Exception{
  String admin=administrador();var convite=integrante("PATIENT",admin);var acesso=entrar(convite.get("convite").asText(),200);String token=acesso.get("sessao").get("accessToken").asText();usar(token,200);
  var novo=enviar(post("/api/v1/grupo-testes/"+convite.get("id").asText()+"/convite").header("Authorization","Bearer "+admin),Map.of("senhaProfissional",SENHA,"validadeDias",3),200);
  usar(token,401);renovar(acesso.get("credencialRenovacao").asText(),401);entrar(convite.get("convite").asText(),401);acesso=entrar(novo.get("convite").asText(),200);
  enviar(post("/api/v1/grupo-testes/"+convite.get("id").asText()+"/desativar").header("Authorization","Bearer "+admin),Map.of(),204);usar(acesso.get("sessao").get("accessToken").asText(),401);renovar(acesso.get("credencialRenovacao").asText(),401);
  String pacienteGrupo=banco.queryForObject("SELECT id_paciente::text FROM integrante_grupo_teste WHERE id=?::uuid",String.class,convite.get("id").asText());
  assertThat(enviar(get("/api/v1/patients/"+pacienteGrupo+"/access-status").header("Authorization","Bearer "+admin),null,200).get("estado").asText()).isEqualTo("TESTE_DESATIVADO");
  enviar(post("/api/v1/patients/"+pacienteGrupo+"/access-reset").header("Authorization","Bearer "+admin),Map.of("senhaProfissional",SENHA,"identidadeConferida",true),409);
 }
 @Test void grupoExigeSenhaNaoPermiteAdminEExpiraProfissional()throws Exception{
  String admin=administrador();int antes=banco.queryForObject("SELECT count(*) FROM user_account",Integer.class);
  enviar(post("/api/v1/grupo-testes").header("Authorization","Bearer "+admin),Map.of("nome","Teste","papel","ADMIN","validadeDias",7,"senhaProfissional",SENHA),400);
  enviar(post("/api/v1/grupo-testes").header("Authorization","Bearer "+admin),Map.of("nome","Teste","papel","PATIENT","validadeDias",7,"senhaProfissional","incorreta"),401);
  enviar(post("/api/v1/grupo-testes").header("Authorization","Bearer "+admin),Map.of("nome","Teste","papel","PATIENT","validadeDias",7,"senhaProfissional",SENHA,"idProfissional",UUID.randomUUID()),400);
  assertThat(banco.queryForObject("SELECT count(*) FROM user_account",Integer.class)).isEqualTo(antes);
  var convite=integrante("PROFESSIONAL",admin);String email=ativarProfissional(convite,200).get("email").asText();String token=enviar(post("/api/v1/auth/login"),Map.of("email",email,"password",SENHA),200).get("accessToken").asText();
  banco.update("UPDATE integrante_grupo_teste SET criado_em=now()-interval '2 days',expira_em=now()-interval '1 day' WHERE id=?::uuid",convite.get("id").asText());
  enviar(get("/api/v1/auth/me").header("Authorization","Bearer "+token),null,401);enviar(post("/api/v1/auth/login"),Map.of("email",email,"password",SENHA),401);
  assertThat(banco.queryForObject("SELECT relrowsecurity FROM pg_class WHERE oid='integrante_grupo_teste'::regclass",Boolean.class)).isTrue();
 }
 @Test void imagemGrandePassaPelaApiEOHistoricoSemConfiarNoMime()throws Exception{
  var convite=convite();String token=entrar(convite.get("convite").asText(),200).get("sessao").get("accessToken").asText();
  var imagem=new java.awt.image.BufferedImage(1200,900,java.awt.image.BufferedImage.TYPE_INT_RGB);var sorteio=new Random(52);for(int y=0;y<900;y++)for(int x=0;x<1200;x++)imagem.setRGB(x,y,sorteio.nextInt());var bytes=new java.io.ByteArrayOutputStream();javax.imageio.ImageIO.write(imagem,"png",bytes);assertThat(bytes.size()).isGreaterThan(2097152);
  var retorno=mvc.perform(multipart("/api/v1/patients/"+paciente+"/files").file(new org.springframework.mock.web.MockMultipartFile("file","nome.txt","application/octet-stream",bytes.toByteArray())).param("purpose","MEAL").header("Authorization","Bearer "+token)).andExpect(status().isOk()).andReturn().getResponse();String id=json.readTree(retorno.getContentAsString()).get("id").asText();
  var refeicao=enviar(post("/api/v1/patients/"+paciente+"/meals").header("Authorization","Bearer "+token),Map.of("fileId",id,"occurredAt",java.time.Instant.now().toString(),"notes","Imagem sintética maior que 2 MB"),200);
  var link=enviar(post("/api/v1/files/"+id+"/link").header("Authorization","Bearer "+profissional),null,200);byte[] recuperada=mvc.perform(get(link.get("path").asText())).andExpect(status().isOk()).andReturn().getResponse().getContentAsByteArray();assertThat(recuperada.length).isLessThanOrEqualTo(2097152);assertThat(javax.imageio.ImageIO.read(new java.io.ByteArrayInputStream(recuperada))).isNotNull();
  var repetida=enviar(post("/api/v1/patients/"+paciente+"/meals").header("Authorization","Bearer "+token),Map.of("fileId",id,"occurredAt",java.time.Instant.now().toString(),"notes","Tentativa após falha de conexão"),200);assertThat(repetida.get("id")).isEqualTo(refeicao.get("id"));
 }
 @Test void contratoIncluiGrupoEEstadoDaAnaliseSemExporAutenticacao()throws Exception{
  String contrato=mvc.perform(get("/v3/api-docs").header("Authorization","Bearer "+administrador())).andExpect(status().isOk()).andReturn().getResponse().getContentAsString();var documento=json.readTree(contrato);assertThat(documento.path("paths").has("/api/v1/grupo-testes")).isTrue();assertThat(documento.path("paths").has("/api/v1/food/status")).isTrue();
  if(System.getenv("VIVA_EXPORTAR_CONTRATO")!=null)java.nio.file.Files.writeString(java.nio.file.Path.of(System.getenv("VIVA_EXPORTAR_CONTRATO")),contrato);
 }
 @AfterAll void fechar(){banco.execute("DROP SCHEMA "+SCHEMA+" CASCADE");if(container!=null)container.stop();}
}
