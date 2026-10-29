package com.vivamais;

import static org.assertj.core.api.Assertions.*;
import static org.springframework.test.web.servlet.request.MockMvcRequestBuilders.*;
import static org.springframework.test.web.servlet.result.MockMvcResultMatchers.*;
import com.vivamais.config.DadosDemonstracao;
import com.vivamais.security.*;
import tools.jackson.databind.*;
import java.util.*;
import org.junit.jupiter.api.*;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.boot.webmvc.test.autoconfigure.*;
import org.springframework.boot.test.context.SpringBootTest;
import org.springframework.http.MediaType;
import org.springframework.jdbc.core.JdbcTemplate;
import org.springframework.test.context.*;
import org.springframework.test.web.servlet.*;
import org.testcontainers.containers.PostgreSQLContainer;

@SpringBootTest @AutoConfigureMockMvc(print=MockMvcPrint.NONE) @ActiveProfiles("bootstrap")
@TestInstance(TestInstance.Lifecycle.PER_CLASS)
class AcessoPacienteIT {
    static final String SENHA=new CodificadorToken().issue(),SCHEMA="acesso_"+UUID.randomUUID().toString().replace("-","");
    static PostgreSQLContainer<?> container;
    @DynamicPropertySource static void configurar(DynamicPropertyRegistry registro) {
        if(System.getenv("TEST_DATABASE_URL")!=null) {
            registro.add("spring.datasource.url",()->System.getenv("TEST_DATABASE_URL"));
            registro.add("spring.datasource.username",()->System.getenv("TEST_DATABASE_USER"));
            registro.add("spring.datasource.password",()->System.getenv("TEST_DATABASE_PASSWORD"));
        } else { container=new PostgreSQLContainer<>("postgres:17.9-alpine");container.start();
            registro.add("spring.datasource.url",container::getJdbcUrl);registro.add("spring.datasource.username",container::getUsername);registro.add("spring.datasource.password",container::getPassword); }
        registro.add("sms.provedor",()->"LOCAL");registro.add("sms.teste-local-habilitado",()->true);
        registro.add("app.bootstrap-password",()->SENHA);registro.add("spring.flyway.default-schema",()->SCHEMA);
        registro.add("spring.datasource.hikari.schema",()->SCHEMA);
        registro.add("files.directory",()->System.getProperty("java.io.tmpdir")+"/viva-"+SCHEMA);
    }
    @Autowired MockMvc mvc; @Autowired ObjectMapper json; @Autowired JdbcTemplate banco; @Autowired ProtecaoAcessoPaciente protecao;
    String profissional,outraUnidade,id,cpf,codigo;
    @BeforeAll void autenticarProfissionais() throws Exception {
        profissional=autenticar("profissional.a");outraUnidade=autenticar("profissional.b");
    }
    @AfterAll void fechar() { banco.execute("DROP SCHEMA "+SCHEMA+" CASCADE");if(container!=null)container.stop(); }
    @BeforeEach void preparar() throws Exception {
        // Limpeza apenas do schema exclusivo deste teste; não desliga o limitador da aplicação.
        banco.update("DELETE FROM limite_acesso_paciente");
        cpf=ApoioAcessoPaciente.gerarCpf();
        id=enviar("/patients",Map.of("displayName","Pessoa sintética Acesso","modality","APP","cpf",cpf,"dataNascimento","1950-01-01","telefone",ApoioAcessoPaciente.gerarTelefone()),profissional,200).get("patient").get("id").asText();
        codigo=emitir();
    }
    String autenticar(String nome) throws Exception { return enviar("/auth/login",Map.of("email",nome+"@demo.vivamais.invalid","password",SENHA),null,200).get("accessToken").asText(); }
    JsonNode enviar(String rota,Object corpo,String token,int estado) throws Exception {
        var requisicao=post("/api/v1"+rota).contentType(MediaType.APPLICATION_JSON).content(json.writeValueAsString(corpo));
        if(token!=null)requisicao.header("Authorization","Bearer "+token);
        var resposta=mvc.perform(requisicao).andExpect(status().is(estado)).andReturn().getResponse().getContentAsString();
        return resposta.isBlank()?json.nullNode():json.readTree(resposta);
    }
    String emitir() throws Exception { var resposta=enviar("/patients/"+id+"/access-reset",Map.of("senhaProfissional",SENHA,"identidadeConferida",true),profissional,200);assertThat(resposta.has("activationToken")).isFalse();assertThat(resposta.get("estadoEnvio").asText()).isEqualTo("TESTE_LOCAL");return ApoioAcessoPaciente.lerCodigoSms(System.getProperty("java.io.tmpdir")+"/viva-"+SCHEMA,resposta.get("idEnvio").asText(),json); }
    JsonNode iniciar(String documento,String nascimento,String credencial) throws Exception {
        var corpo=new LinkedHashMap<String,Object>(Map.of("cpf",documento,"dataNascimento",nascimento,"tipo","NATIVO"));
        if(credencial!=null)corpo.put("credencialDispositivo",credencial);
        return enviar("/auth/paciente/iniciar",corpo,null,200);
    }
    JsonNode verificar(String desafio,String valor,int estado) throws Exception { return enviar("/auth/paciente/verificar",Map.of("desafio",desafio,"codigo",valor,"tipo","NATIVO"),null,estado); }
    JsonNode ativar() throws Exception { return verificar(iniciar(cpf,"1950-01-01",null).get("desafio").asText(),codigo,200); }
    @Test void cadastroEAtivacaoSemSenhaPreservamProfissionalEDados() throws Exception {
        assertThat(codigo.matches("[0-9]{4}")).isTrue();
        assertThat(banco.queryForObject("SELECT hash_codigo FROM codigo_ativacao_paciente WHERE id_paciente=? AND utilizado_em IS NULL",String.class,UUID.fromString(id)).length()).isEqualTo(64);
        var resposta=ativar();String token=resposta.get("sessao").get("accessToken").asText();
        mvc.perform(get("/api/v1/patients/me").header("Authorization","Bearer "+token)).andExpect(jsonPath("$.id").value(id));
        mvc.perform(get("/api/v1/patients/"+DadosDemonstracao.id("patient-app-b")).header("Authorization","Bearer "+token)).andExpect(status().isForbidden());
        mvc.perform(get("/api/v1/patients/"+DadosDemonstracao.id("patient-app-a")).header("Authorization","Bearer "+token)).andExpect(status().isForbidden());
        mvc.perform(get("/api/v1/dashboard").header("Authorization","Bearer "+profissional)).andExpect(status().isOk());
        assertThat(banco.queryForObject("SELECT count(*) FROM patient WHERE id=?",Integer.class,DadosDemonstracao.id("patient-app-a"))).isEqualTo(1);
        assertThat(banco.queryForObject("SELECT count(*) FROM pg_class WHERE relnamespace=current_schema()::regnamespace AND relname IN('dispositivo_acesso_paciente','codigo_ativacao_paciente','desafio_acesso_paciente','limite_acesso_paciente') AND relrowsecurity",Integer.class)).isEqualTo(4);
    }
    @Test void cpfInvalidoEDataInvalidaSaoRejeitados() throws Exception {
        enviar("/auth/paciente/iniciar",Map.of("cpf","00000000000","dataNascimento","1950-01-01","tipo","NATIVO"),null,400);
        enviar("/auth/paciente/iniciar",Map.of("cpf",cpf,"dataNascimento","1950-02-30","tipo","NATIVO"),null,400);
    }
    @Test void nascimentoIncorretoEContaInexistenteNaoSaoRevelados() throws Exception {
        for(String documento:List.of(cpf,ApoioAcessoPaciente.gerarCpf())) {
            var resposta=iniciar(documento,"1950-02-01",null);
            assertThat(resposta.get("estado").asText()).isEqualTo("VERIFICACAO_NECESSARIA");assertThat(resposta.has("sessao")).isFalse();
            verificar(resposta.get("desafio").asText(),codigo,401);
        }
    }
    @Test void aparelhoDesconhecidoNaoRecebeSessaoSomenteComDadosPessoais() throws Exception {
        var resposta=iniciar(cpf,"1950-01-01",new CodificadorToken().issue());
        assertThat(resposta.has("sessao")).isFalse();
        assertThat(banco.queryForObject("SELECT count(*) FROM dispositivo_acesso_paciente WHERE id_usuario=(SELECT user_account_id FROM patient WHERE id=?)",Integer.class,UUID.fromString(id))).isZero();
    }
    @Test void codigoIniciadoEmZeroEhVerificadoSemConversaoNumerica() throws Exception {
        UUID codigoId=banco.queryForObject("SELECT id FROM codigo_ativacao_paciente WHERE id_paciente=? AND utilizado_em IS NULL",UUID.class,UUID.fromString(id));
        // Fixture determinística apenas neste schema, para cobrir zeros sem depender da sorte.
        banco.update("UPDATE codigo_ativacao_paciente SET hash_codigo=? WHERE id=?",protecao.resumo("codigo:"+codigoId,"0007"),codigoId);
        verificar(iniciar(cpf,"1950-01-01",null).get("desafio").asText(),"0007",200);
    }
    @Test void codigoExpiradoUtilizadoIncorretoEFormatoSaoRejeitados() throws Exception {
        String desafio=iniciar(cpf,"1950-01-01",null).get("desafio").asText();
        verificar(desafio,"123",400);
        verificar(desafio,codigo.equals("9999")?"9998":"9999",401);
        banco.update("UPDATE codigo_ativacao_paciente SET expira_em=now()-interval '1 second' WHERE id_paciente=?",UUID.fromString(id));
        verificar(desafio,codigo,401);
        banco.update("UPDATE codigo_ativacao_paciente SET expira_em=now()+interval '5 minutes' WHERE id_paciente=?",UUID.fromString(id));
        verificar(desafio,codigo,200);verificar(desafio,codigo,401);
        verificar(iniciar(cpf,"1950-01-01",null).get("desafio").asText(),codigo,401);
    }
    @Test void cincoTentativasBloqueiamMesmoCriandoOutroDesafioEAJanelaSeRecupera() throws Exception {
        String errado=codigo.equals("9999")?"9998":"9999";
        for(int i=0;i<5;i++)verificar(iniciar(cpf,"1950-01-01",null).get("desafio").asText(),errado,401);
        String desafio=iniciar(cpf,"1950-01-01",null).get("desafio").asText();verificar(desafio,codigo,429);
        banco.update("UPDATE limite_acesso_paciente SET inicio_janela=now()-interval '16 minutes'");
        banco.update("UPDATE codigo_ativacao_paciente SET expira_em=now()-interval '1 second' WHERE id_paciente=?",UUID.fromString(id));
        verificar(desafio,codigo,401);
        codigo=emitir();
        verificar(desafio,codigo,200);
    }
    @Test void novoCodigoInvalidaAnteriorSemApagarCadastro() throws Exception {
        String anterior=codigo;
        enviar("/patients/"+id+"/access-reset",Map.of("senhaProfissional",SENHA,"identidadeConferida",true),profissional,429);
        banco.update("UPDATE limite_acesso_paciente SET inicio_janela=now()-interval '61 seconds'");
        codigo=emitir();assertThat(codigo.equals(anterior)).isFalse();
        String desafio=iniciar(cpf,"1950-01-01",null).get("desafio").asText();verificar(desafio,anterior,401);verificar(desafio,codigo,200);
    }
    @Test void autorizacaoRotacionaRenovaESairNaoApagaAutorizacao() throws Exception {
        var ativacao=ativar();String credencial=ativacao.get("credencialDispositivo").asText(),token=ativacao.get("sessao").get("accessToken").asText();
        var renovada=enviar("/auth/paciente/renovar",Map.of("tipo","NATIVO","credencialDispositivo",credencial),null,200);
        mvc.perform(get("/api/v1/auth/me").header("Authorization","Bearer "+token)).andExpect(status().isUnauthorized());
        enviar("/auth/paciente/renovar",Map.of("tipo","NATIVO","credencialDispositivo",credencial),null,401);
        String novaCredencial=renovada.get("credencialDispositivo").asText();token=renovada.get("sessao").get("accessToken").asText();
        enviar("/auth/logout",Map.of(),token,204);
        enviar("/auth/paciente/renovar",Map.of("tipo","NATIVO","credencialDispositivo",novaCredencial),null,401);
        assertThat(iniciar(cpf,"1950-01-01",novaCredencial).get("estado").asText()).isEqualTo("AUTENTICADO");
    }
    @Test void esquecerRevogaAparelhoESessoesEOutroPacienteNaoOReutiliza() throws Exception {
        var ativacao=ativar();String token=ativacao.get("sessao").get("accessToken").asText(),credencial=ativacao.get("credencialDispositivo").asText();
        assertThat(iniciar(ApoioAcessoPaciente.gerarCpf(),"1950-01-01",credencial).has("sessao")).isFalse();
        enviar("/auth/paciente/esquecer",Map.of("tipo","NATIVO"),token,204);
        mvc.perform(get("/api/v1/auth/me").header("Authorization","Bearer "+token)).andExpect(status().isUnauthorized());
        assertThat(iniciar(cpf,"1950-01-01",credencial).has("sessao")).isFalse();
    }
    @Test void emissaoExigeVinculoSenhaEConferenciaDeIdentidade() throws Exception {
        var corpo=Map.of("senhaProfissional",SENHA,"identidadeConferida",true);
        enviar("/patients/"+id+"/access-reset",corpo,outraUnidade,403);
        enviar("/patients/"+id+"/access-reset",Map.of("senhaProfissional",SENHA,"identidadeConferida",false),profissional,400);
        enviar("/patients/"+id+"/access-reset",Map.of("senhaProfissional","incorreta","identidadeConferida",true),profissional,401);
        var ativacao=ativar();enviar("/patients/"+id+"/access-reset",corpo,ativacao.get("sessao").get("accessToken").asText(),403);
    }
    @Test void navegadorRecebeSomenteCookieHttpOnlyEExigeOrigin() throws Exception {
        mvc.perform(post("/api/v1/auth/paciente/iniciar").contentType(MediaType.APPLICATION_JSON).content(json.writeValueAsString(Map.of("cpf",cpf,"dataNascimento","1950-01-01","tipo","WEB")))).andExpect(status().isForbidden());
        var inicio=mvc.perform(post("/api/v1/auth/paciente/iniciar").header("Origin","http://127.0.0.1:8081").contentType(MediaType.APPLICATION_JSON).content(json.writeValueAsString(Map.of("cpf",cpf,"dataNascimento","1950-01-01","tipo","WEB")))).andExpect(status().isOk()).andReturn();
        String desafio=json.readTree(inicio.getResponse().getContentAsString()).get("desafio").asText();
        var resposta=mvc.perform(post("/api/v1/auth/paciente/verificar").header("Origin","http://127.0.0.1:8081").contentType(MediaType.APPLICATION_JSON).content(json.writeValueAsString(Map.of("desafio",desafio,"codigo",codigo,"tipo","WEB"))))
            .andExpect(status().isOk()).andExpect(jsonPath("$.credencialDispositivo").doesNotExist()).andReturn();
        String cookie=resposta.getResponse().getHeader("Set-Cookie");assertThat(cookie!=null&&cookie.contains("HttpOnly")&&cookie.contains("Secure")&&cookie.contains("SameSite=Strict")).isTrue();
        mvc.perform(post("/api/v1/auth/paciente/renovar").header("Origin","https://indevido.example").contentType(MediaType.APPLICATION_JSON).content("{\"tipo\":\"WEB\"}")).andExpect(status().isForbidden());
        mvc.perform(post("/api/v1/auth/paciente/renovar").header("Origin","http://127.0.0.1:8081").contentType(MediaType.APPLICATION_JSON).content("{\"tipo\":\"NATIVO\"}")).andExpect(status().isForbidden());
    }
    @Test void senhaAntigaDePacienteNaoAutenticaEProfissionalContinuaAutenticando() throws Exception {
        enviar("/auth/login",Map.of("email","paciente.a@demo.vivamais.invalid","password",SENHA),null,401);
        assertThat(autenticar("profissional.a").length()).isEqualTo(43);
    }
    @Test void emailEhSomenteContatoOpcionalEPodeSerCompartilhado() throws Exception {
        String contato="contato-"+UUID.randomUUID()+"@demo.invalid";
        for(int i=0;i<2;i++) enviar("/patients",Map.of("displayName","Pessoa Sintética Contato","modality","APP","cpf",ApoioAcessoPaciente.gerarCpf(),"dataNascimento","1950-01-01","email",contato,"telefone",ApoioAcessoPaciente.gerarTelefone()),profissional,200);
        assertThat(banco.queryForObject("SELECT count(*) FROM patient WHERE email_contato=?",Integer.class,contato)).isEqualTo(2);
        assertThat(banco.queryForObject("SELECT count(*) FROM user_account WHERE email=?",Integer.class,contato)).isZero();
    }
    @Test void sessaoExpiradaPodeRenovarMasAparelhoExpiradoNao() throws Exception {
        var ativacao=ativar();String token=ativacao.get("sessao").get("accessToken").asText(),credencial=ativacao.get("credencialDispositivo").asText();
        banco.update("UPDATE auth_session SET created_at=now()-interval '2 hours',expires_at=now()-interval '1 hour' WHERE token_hash=?",new CodificadorToken().hash(token));
        mvc.perform(get("/api/v1/auth/me").header("Authorization","Bearer "+token)).andExpect(status().isUnauthorized());
        var renovada=enviar("/auth/paciente/renovar",Map.of("tipo","NATIVO","credencialDispositivo",credencial),null,200);
        String nova=renovada.get("credencialDispositivo").asText();
        banco.update("UPDATE dispositivo_acesso_paciente SET expira_em=now()-interval '1 second' WHERE hash_credencial=?",new CodificadorToken().hash(nova));
        enviar("/auth/paciente/renovar",Map.of("tipo","NATIVO","credencialDispositivo",nova),null,401);
        assertThat(iniciar(cpf,"1950-01-01",nova).has("sessao")).isFalse();
    }
    @Test void alterarIdentidadeRevogaAparelhoECodigosSemApagarRegistros() throws Exception {
        var ativacao=ativar();String token=ativacao.get("sessao").get("accessToken").asText();
        var corpo=new LinkedHashMap<String,Object>();corpo.put("nomeCompleto","Pessoa sintética corrigida");corpo.put("cpf",cpf);corpo.put("dataNascimento","1950-02-01");corpo.put("versao",0);corpo.put("telefone",banco.queryForObject("SELECT telefone FROM patient WHERE id=?",String.class,UUID.fromString(id)));
        mvc.perform(put("/api/v1/pacientes/"+id+"/dados-pessoais").header("Authorization","Bearer "+profissional).contentType(MediaType.APPLICATION_JSON).content(json.writeValueAsString(corpo))).andExpect(status().isOk());
        mvc.perform(get("/api/v1/auth/me").header("Authorization","Bearer "+token)).andExpect(status().isUnauthorized());
        assertThat(banco.queryForObject("SELECT count(*) FROM patient WHERE id=?",Integer.class,UUID.fromString(id))).isEqualTo(1);
    }
    @Test void migracaoDeV7PreservaCadastroPressaoESenhaProfissional() throws Exception {
        String anterior="transicao_"+UUID.randomUUID().toString().replace("-","");
        var fonte=Objects.requireNonNull(banco.getDataSource());
        try {
            org.flywaydb.core.Flyway.configure().dataSource(fonte).schemas(anterior).defaultSchema(anterior).target("7").load().migrate();
            for(String tabela:List.of("organization","user_account","professional","patient","patient_professional_assignment")) {
                String colunas=String.join(",",banco.queryForList("SELECT column_name FROM information_schema.columns WHERE table_schema=? AND table_name=? ORDER BY ordinal_position",String.class,anterior,tabela));
                String selecao=java.util.Arrays.stream(colunas.split(",")).map(c->c.equals("telefone")?"CASE WHEN telefone LIKE '+55%' THEN substring(telefone from 4) ELSE telefone END":c).collect(java.util.stream.Collectors.joining(","));
                banco.execute("INSERT INTO "+anterior+"."+tabela+"("+colunas+") SELECT "+selecao+" FROM "+SCHEMA+"."+tabela);
            }
            UUID conta=DadosDemonstracao.id("paciente-a"),paciente=DadosDemonstracao.id("patient-app-a"),emissor=DadosDemonstracao.id("profissional-a");
            // Usa a conta vinculada no próprio schema: os IDs de bootstrap não são inferidos pelo cliente.
            conta=banco.queryForObject("SELECT user_account_id FROM "+anterior+".patient WHERE id=?",UUID.class,paciente);
            for(UUID usuario:List.of(conta,emissor)) banco.update("INSERT INTO "+anterior+".auth_session(id,user_account_id,token_hash,created_at,expires_at) VALUES(?,?,?,now(),now()+interval '30 minutes')",UUID.randomUUID(),usuario,new CodificadorToken().hash(UUID.randomUUID().toString()));
            UUID registro=UUID.randomUUID();banco.update("INSERT INTO "+anterior+".blood_pressure_reading(id,patient_id,author_id,systolic,diastolic,measured_at,source) VALUES(?,?,?,118,76,now(),'MANUAL')",registro,paciente,conta);
            String hashProfissional=banco.queryForObject("SELECT password_hash FROM "+anterior+".user_account WHERE id=?",String.class,emissor);
            org.flywaydb.core.Flyway.configure().dataSource(fonte).schemas(anterior).defaultSchema(anterior).load().migrate();
            assertThat(banco.queryForObject("SELECT count(*) FROM "+anterior+".blood_pressure_reading WHERE id=?",Integer.class,registro)).isEqualTo(1);
            assertThat(banco.queryForObject("SELECT count(*) FROM "+anterior+".auth_session WHERE user_account_id=? AND revoked_at IS NULL",Integer.class,conta)).isZero();
            assertThat(banco.queryForObject("SELECT count(*) FROM "+anterior+".auth_session WHERE user_account_id=? AND revoked_at IS NULL",Integer.class,emissor)).isEqualTo(1);
            assertThat(Objects.equals(hashProfissional,banco.queryForObject("SELECT password_hash FROM "+anterior+".user_account WHERE id=?",String.class,emissor))).isTrue();
        } finally { banco.execute("DROP SCHEMA IF EXISTS "+anterior+" CASCADE"); }
    }
}
