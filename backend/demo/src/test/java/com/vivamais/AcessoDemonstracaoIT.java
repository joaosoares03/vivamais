package com.vivamais;

import static org.assertj.core.api.Assertions.*;
import static org.springframework.test.web.servlet.request.MockMvcRequestBuilders.*;
import static org.springframework.test.web.servlet.result.MockMvcResultMatchers.*;
import com.vivamais.config.*;
import com.vivamais.repositories.InstituicaoRepository;
import com.vivamais.security.CodificadorToken;
import tools.jackson.databind.*;
import java.util.*;
import java.nio.file.*;
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
class AcessoDemonstracaoIT {
    static final byte[] CONTEUDO_APK_TESTE={80,75,3,4,1,2,3};
    static final Path APK_TESTE=criarArquivoInstalacao();
    static Path criarArquivoInstalacao() {
        try { return Files.write(Files.createTempFile("viva-instalacao-fixture-",".apk"),CONTEUDO_APK_TESTE); }
        catch(java.io.IOException falha) { throw new IllegalStateException(falha); }
    }
    static final String SENHA=new CodificadorToken().issue(),SCHEMA="demo_"+UUID.randomUUID().toString().replace("-","");
    static PostgreSQLContainer<?> container;
    @DynamicPropertySource static void configurar(DynamicPropertyRegistry registro) {
        if(System.getenv("TEST_DATABASE_URL")!=null) {
            registro.add("spring.datasource.url",()->System.getenv("TEST_DATABASE_URL"));
            registro.add("spring.datasource.username",()->System.getenv("TEST_DATABASE_USER"));
            registro.add("spring.datasource.password",()->System.getenv("TEST_DATABASE_PASSWORD"));
        } else { container=new PostgreSQLContainer<>("postgres:17.9-alpine");container.start();
            registro.add("spring.datasource.url",container::getJdbcUrl);registro.add("spring.datasource.username",container::getUsername);registro.add("spring.datasource.password",container::getPassword); }
        registro.add("patient-auth.demonstracao-sem-codigo",()->true);
        registro.add("patient-auth.unidade-demonstracao",()->DadosDemonstracao.id("organization-a").toString());
        registro.add("server.address",()->"127.0.0.1");
        registro.add("patient-auth.rede-demonstracao-computador",()->"192.168.0.8");
        registro.add("patient-auth.rede-demonstracao-celular",()->"192.168.0.5");
        registro.add("patient-auth.apk-demonstracao",()->APK_TESTE.toString());
        registro.add("app.bootstrap-password",()->SENHA);registro.add("spring.flyway.default-schema",()->SCHEMA);
        registro.add("spring.datasource.hikari.schema",()->SCHEMA);
        registro.add("files.directory",()->System.getProperty("java.io.tmpdir")+"/viva-"+SCHEMA);
    }
    @Autowired MockMvc mvc; @Autowired ObjectMapper json; @Autowired JdbcTemplate banco;
    @Autowired PropriedadesAplicacao propriedades;
    String cpf; UUID paciente;
    @BeforeEach void preparar() {
        banco.update("DELETE FROM limite_acesso_paciente");
        paciente=DadosDemonstracao.id("patient-app-a"); cpf=ApoioAcessoPaciente.gerarCpf();
        banco.update("UPDATE patient SET cpf=?,data_nascimento='1950-01-01' WHERE id=?",cpf,paciente);
    }
    @AfterAll void fechar() throws java.io.IOException { banco.execute("DROP SCHEMA "+SCHEMA+" CASCADE");if(container!=null)container.stop();Files.deleteIfExists(APK_TESTE); }
    JsonNode entrar(String documento,String nascimento,int esperado) throws Exception {
        var resposta=mvc.perform(post("/api/v1/auth/paciente/demonstracao").contentType(MediaType.APPLICATION_JSON)
            .content(json.writeValueAsString(Map.of("cpf",documento,"dataNascimento",nascimento,"tipo","NATIVO"))))
            .andExpect(status().is(esperado)).andReturn().getResponse();
        return json.readTree(resposta.getContentAsString());
    }
    @Test void celularLiberadoNaRedeEntraSemSmsComSessaoDemonstrativa() throws Exception {
        var resposta=mvc.perform(post("/api/v1/auth/paciente/demonstracao")
            .with(requisicao->{requisicao.setRemoteAddr("192.168.0.5");requisicao.setLocalAddr("192.168.0.8");requisicao.setServerName("192.168.0.8");requisicao.setLocalPort(8083);return requisicao;})
            .contentType(MediaType.APPLICATION_JSON)
            .content(json.writeValueAsString(Map.of("cpf",cpf,"dataNascimento","1950-01-01","tipo","NATIVO"))))
            .andExpect(status().isOk()).andReturn().getResponse();
        assertThat(json.readTree(resposta.getContentAsString()).get("estado").asText()).isEqualTo("AUTENTICADO");
        assertThat(banco.queryForObject("SELECT count(*) FROM sessao_demonstracao",Integer.class)).isGreaterThan(0);
    }
    @Test void cadastroNovoHabilitaDemonstracaoERecusaEmissaoSmsSemCriarCodigo() throws Exception {
        String documento=ApoioAcessoPaciente.gerarCpf(),profissional=tokenProfissional("a");
        int envios=banco.queryForObject("SELECT count(*) FROM envio_sms_ativacao",Integer.class);
        var cadastro=json.readTree(mvc.perform(post("/api/v1/patients").header("Authorization","Bearer "+profissional)
            .contentType(MediaType.APPLICATION_JSON).content(json.writeValueAsString(Map.of("displayName","Pessoa fictícia sem SMS","modality","APP","cpf",documento,"dataNascimento","1950-01-01","telefone","+5511990000001"))))
            .andExpect(status().isOk()).andExpect(jsonPath("$.acesso.estado").value("DEMONSTRACAO_HABILITADA"))
            .andReturn().getResponse().getContentAsString());
        String id=cadastro.get("patient").get("id").asText();
        mvc.perform(get("/api/v1/patients/"+id+"/access-status").header("Authorization","Bearer "+profissional))
            .andExpect(status().isOk()).andExpect(jsonPath("$.smsDisponivel").value(false));
        entrar(documento,"1950-01-01",200);
        mvc.perform(post("/api/v1/patients/"+id+"/access-reset").header("Authorization","Bearer "+profissional)
            .contentType(MediaType.APPLICATION_JSON).content(json.writeValueAsString(Map.of("senhaProfissional",SENHA,"identidadeConferida",true))))
            .andExpect(status().isConflict());
        assertThat(banco.queryForObject("SELECT count(*) FROM envio_sms_ativacao",Integer.class)).isEqualTo(envios);
        assertThat(banco.queryForObject("SELECT count(*) FROM codigo_ativacao_paciente WHERE id_paciente=?::uuid",Integer.class,id)).isZero();
    }
    @Test void telefoneAutorizadoBaixaSomenteInstalavelConfigurado() throws Exception {
        mvc.perform(get("/demonstracao/vivamais.apk").param("arquivo","../arquivo-privado")
            .header("Sec-Fetch-Site","none")
            .with(requisicao->{requisicao.setRemoteAddr("192.168.0.5");requisicao.setLocalAddr("192.168.0.8");requisicao.setServerName("192.168.0.8");requisicao.setLocalPort(8083);return requisicao;}))
            .andExpect(status().isOk()).andExpect(content().bytes(CONTEUDO_APK_TESTE))
            .andExpect(content().contentType("application/vnd.android.package-archive"))
            .andExpect(header().string("Cache-Control","no-store"))
            .andExpect(header().string("Content-Disposition","attachment; filename=VivaMais-DemoRede-arm64.apk"));
    }
    @Test void downloadRecusaLoopbackEOutroAparelho() throws Exception {
        mvc.perform(get("/demonstracao/vivamais.apk")).andExpect(status().isNotFound());
        mvc.perform(get("/demonstracao/vivamais.apk").with(requisicao->{requisicao.setRemoteAddr("192.168.0.6");requisicao.setLocalAddr("192.168.0.8");requisicao.setServerName("192.168.0.8");requisicao.setLocalPort(8083);return requisicao;}))
            .andExpect(status().isForbidden());
    }
    @Test void redeRecusaOutroCelularProxyENavegador() throws Exception {
        var corpo=json.writeValueAsString(Map.of("cpf",cpf,"dataNascimento","1950-01-01","tipo","NATIVO"));
        for(String endereco:List.of("192.168.0.6","127.0.0.1"))
            mvc.perform(post("/api/v1/auth/paciente/demonstracao").with(requisicao->{requisicao.setRemoteAddr(endereco);requisicao.setLocalAddr("192.168.0.8");requisicao.setServerName("192.168.0.8");requisicao.setLocalPort(8083);return requisicao;})
                .contentType(MediaType.APPLICATION_JSON).content(corpo)).andExpect(status().isForbidden());
        for(String cabecalho:List.of("Origin","X-Forwarded-For"))
            mvc.perform(post("/api/v1/auth/paciente/demonstracao").with(requisicao->{requisicao.setRemoteAddr("192.168.0.5");requisicao.setLocalAddr("192.168.0.8");requisicao.setServerName("192.168.0.8");requisicao.setLocalPort(8083);return requisicao;})
                .header(cabecalho,"http://192.168.0.8").contentType(MediaType.APPLICATION_JSON).content(corpo)).andExpect(status().isForbidden());
    }
    @Test void entraSemSmsSemAutorizarDispositivoENaoAlteraAtivacao() throws Exception {
        UUID conta=DadosDemonstracao.id("paciente-a");
        banco.update("UPDATE user_account SET enabled=false WHERE id=?",conta);
        var resposta=entrar(cpf,"1950-01-01",200);
        assertThat(resposta.get("estado").asText()).isEqualTo("AUTENTICADO");
        assertThat(resposta.has("credencialDispositivo")).isFalse();
        String token=resposta.get("sessao").get("accessToken").asText();
        mvc.perform(get("/api/v1/patients/me").header("Authorization","Bearer "+token)).andExpect(status().isOk()).andExpect(jsonPath("$.id").value(paciente.toString()));
        assertThat(banco.queryForObject("SELECT enabled FROM user_account WHERE id=?",Boolean.class,conta)).isFalse();
        assertThat(banco.queryForObject("SELECT count(*) FROM envio_sms_ativacao",Integer.class)).isZero();
        assertThat(banco.queryForObject("SELECT count(*) FROM dispositivo_acesso_paciente",Integer.class)).isZero();
        assertThat(banco.queryForObject("SELECT count(*) FROM audit_event WHERE action='ACESSO_DEMONSTRACAO_SINTETICA'",Integer.class)).isPositive();
        banco.update("UPDATE user_account SET enabled=true WHERE id=?",conta);
    }
    @Test void sessaoDemoPerdeAcessoAoDesabilitarModoESuportaRevogacao() throws Exception {
        var resposta=entrar(cpf,"1950-01-01",200);String token=resposta.get("sessao").get("accessToken").asText();
        var desligado=new ConfiguracaoAcessoDemonstracao(false,"","development","",propriedades,new org.springframework.mock.env.MockEnvironment());
        var repositorio=new InstituicaoRepository(banco,desligado);
        assertThat(repositorio.principalAutenticado(new CodificadorToken().hash(token))).isEmpty();
        mvc.perform(post("/api/v1/auth/logout").header("Authorization","Bearer "+token)).andExpect(status().isNoContent());
        mvc.perform(get("/api/v1/patients/me").header("Authorization","Bearer "+token)).andExpect(status().isUnauthorized());
    }
    @Test void mantemIsolamentoErrosGenericosEAcessoSeguroComCodigo() throws Exception {
        entrar(cpf,"1950-02-01",401);entrar(ApoioAcessoPaciente.gerarCpf(),"1950-01-01",401);
        var resposta=entrar(cpf,"1950-01-01",200);String token=resposta.get("sessao").get("accessToken").asText();
        mvc.perform(get("/api/v1/patients/"+DadosDemonstracao.id("patient-app-b")).header("Authorization","Bearer "+token)).andExpect(status().isForbidden());
        mvc.perform(post("/api/v1/auth/paciente/iniciar").contentType(MediaType.APPLICATION_JSON)
            .content(json.writeValueAsString(Map.of("cpf",cpf,"dataNascimento","1950-01-01","tipo","NATIVO"))))
            .andExpect(status().isOk()).andExpect(jsonPath("$.estado").value("VERIFICACAO_NECESSARIA"));
        String outro=ApoioAcessoPaciente.gerarCpf();
        banco.update("UPDATE patient SET cpf=?,data_nascimento='1950-01-01' WHERE id=?",outro,DadosDemonstracao.id("patient-app-b"));
        entrar(outro,"1950-01-01",401);
    }
    @Test void limitaTentativasERejeitaCanalWebSemOrigem() throws Exception {
        for (int indice=0;indice<15;indice++) entrar(cpf,"1950-02-01",401);
        entrar(cpf,"1950-01-01",429);
        mvc.perform(post("/api/v1/auth/paciente/demonstracao").contentType(MediaType.APPLICATION_JSON)
            .content(json.writeValueAsString(Map.of("cpf",cpf,"dataNascimento","1950-01-01","tipo","WEB"))))
            .andExpect(status().isForbidden());
    }
    @Test void consultasDoPacienteSaoPaginadasSemAnotacoesInternasEDaOutraUnidade() throws Exception {
        UUID profissional=DadosDemonstracao.id("profissional-a");
        banco.update("INSERT INTO consultation(id,patient_id,author_id,occurred_at,notes,goals,care_plan) VALUES(?,?,?,now(),?,?,?)",
            UUID.randomUUID(),paciente,profissional,"Anotação interna sintética","Objetivo combinado","Orientação compartilhada");
        banco.update("INSERT INTO consultation(id,patient_id,author_id,occurred_at,notes,goals,care_plan) VALUES(?,?,?,now(),?,?,?)",
            UUID.randomUUID(),DadosDemonstracao.id("patient-app-b"),DadosDemonstracao.id("profissional-b"),"Outra unidade","Não expor","Não expor");
        String token=entrar(cpf,"1950-01-01",200).get("sessao").get("accessToken").asText();
        var retorno=mvc.perform(get("/api/v1/pacientes/me/consultas?page=0&size=1").header("Authorization","Bearer "+token))
            .andExpect(status().isOk()).andExpect(jsonPath("$.items[0].objetivos").value("Objetivo combinado"))
            .andExpect(jsonPath("$.items[0].planoCuidado").value("Orientação compartilhada"))
            .andExpect(jsonPath("$.items[0].notes").doesNotExist()).andReturn().getResponse().getContentAsString();
        assertThat(retorno).doesNotContain("Anotação interna sintética","Não expor");
        mvc.perform(get("/api/v1/pacientes/me/consultas?size=101").header("Authorization","Bearer "+token)).andExpect(status().isBadRequest());
    }
    @Test void demonstracaoNaoAceitaProxyOuOrigemExterna() throws Exception {
        String corpo=json.writeValueAsString(Map.of("cpf",cpf,"dataNascimento","1950-01-01","tipo","NATIVO"));
        mvc.perform(post("/api/v1/auth/paciente/demonstracao").header("X-Forwarded-For","198.51.100.1").contentType(MediaType.APPLICATION_JSON).content(corpo))
            .andExpect(status().isForbidden());
        mvc.perform(post("/api/v1/auth/paciente/demonstracao").with(requisicao->{requisicao.setRemoteAddr("198.51.100.1");return requisicao;})
            .contentType(MediaType.APPLICATION_JSON).content(corpo)).andExpect(status().isForbidden());
    }
    String tokenProfissional(String unidade) throws Exception {
        var retorno=mvc.perform(post("/api/v1/auth/login").contentType(MediaType.APPLICATION_JSON)
            .content(json.writeValueAsString(Map.of("email","profissional."+unidade+"@demo.vivamais.invalid","password",SENHA))))
            .andExpect(status().isOk()).andReturn().getResponse().getContentAsString();
        return json.readTree(retorno).get("accessToken").asText();
    }
    @Test void exportaTodasAsPaginasComAutoriaEPeriodoCivilBrasileiro() throws Exception {
        for (int indice=0;indice<23;indice++) banco.update("INSERT INTO blood_pressure_reading(id,patient_id,author_id,systolic,diastolic,measured_at,source) VALUES(?,?,?,118,76,?,'PROFESSIONAL')",
            UUID.randomUUID(),paciente,DadosDemonstracao.id("profissional-a"),java.sql.Timestamp.from(java.time.Instant.parse(indice==0?"2026-02-28T02:30:00Z":"2026-02-28T03:30:00Z")));
        String token=tokenProfissional("a"),base="/api/v1/pacientes/"+paciente+"/exportacao/PRESSAO";
        var primeira=mvc.perform(get(base+"?pagina=0&tamanho=20&inicio=2026-02-28&fim=2026-02-28").header("Authorization","Bearer "+token))
            .andExpect(status().isOk()).andExpect(jsonPath("$.total").value(22)).andExpect(jsonPath("$.itens.length()").value(20))
            .andExpect(jsonPath("$.itens[0].authorName").value("Profissional A — DEMO")).andReturn().getResponse().getContentAsString();
        String corte=json.readTree(primeira).get("corteCriacao").asText();
        mvc.perform(get(base).param("pagina","1").param("tamanho","20").param("inicio","2026-02-28").param("fim","2026-02-28").param("corteCriacao",corte)
            .header("Authorization","Bearer "+token)).andExpect(status().isOk()).andExpect(jsonPath("$.total").value(22)).andExpect(jsonPath("$.itens.length()").value(2));
        assertThat(banco.queryForObject("SELECT count(*) FROM audit_event WHERE action='EXPORTACAO_PAGINA_CONSULTADA'",Integer.class)).isGreaterThanOrEqualTo(2);
    }
    @Test void exportacaoExigeProfissionalVinculadoEValidaLimites() throws Exception {
        String base="/api/v1/pacientes/"+paciente+"/exportacao/CONSULTAS";
        String pacienteToken=entrar(cpf,"1950-01-01",200).get("sessao").get("accessToken").asText();
        mvc.perform(get(base).header("Authorization","Bearer "+pacienteToken)).andExpect(status().isForbidden());
        mvc.perform(get(base).header("Authorization","Bearer "+tokenProfissional("b"))).andExpect(status().isForbidden());
        String profissional=tokenProfissional("a");
        for (String filtro:List.of("?tamanho=101","?pagina=-1","?inicio=2026-04-31","?inicio=2026-03-01&fim=2026-02-01"))
            mvc.perform(get(base+filtro).header("Authorization","Bearer "+profissional)).andExpect(status().isBadRequest());
    }
    @Test void retificaConsultaSemApagarOriginalComAutoriaConflitoEProtecaoDoHistorico() throws Exception {
        UUID registro=UUID.randomUUID();
        banco.update("INSERT INTO consultation(id,patient_id,author_id,occurred_at,notes,goals,care_plan) VALUES(?,?,?,now(),?,?,?)",
            registro,paciente,DadosDemonstracao.id("profissional-a"),"Nota original","Objetivo original","Plano original");
        String token=tokenProfissional("a"),rota="/api/v1/pacientes/"+paciente+"/registros/CONSULTAS/"+registro+"/retificacoes";
        var corpo=Map.of("versaoAtual",0,"motivo","Correção de digitação durante o teste","conteudo",Map.of("notes","Nota retificada","carePlan","Plano retificado"));
        mvc.perform(post(rota).header("Authorization","Bearer "+token).contentType(MediaType.APPLICATION_JSON).content(json.writeValueAsString(corpo)))
            .andExpect(status().isOk()).andExpect(jsonPath("$.versao").value(1)).andExpect(jsonPath("$.autor").value("Profissional A — DEMO"));
        mvc.perform(post(rota).header("Authorization","Bearer "+token).contentType(MediaType.APPLICATION_JSON).content(json.writeValueAsString(corpo))).andExpect(status().isConflict());
        assertThat(banco.queryForObject("SELECT notes FROM consultation WHERE id=?",String.class,registro)).isEqualTo("Nota original");
        var lista=json.readTree(mvc.perform(get("/api/v1/patients/"+paciente+"/consultations?size=100").header("Authorization","Bearer "+token))
            .andExpect(status().isOk()).andReturn().getResponse().getContentAsString());
        boolean encontrada=false;
        for (var item:lista.get("items")) if (registro.toString().equals(item.get("id").asText())) {
            encontrada=true;assertThat(item.get("notes").asText()).isEqualTo("Nota retificada");
            assertThat(item.get("registroOriginal").get("notes").asText()).isEqualTo("Nota original");
        }
        assertThat(encontrada).isTrue();
        String pacienteToken=entrar(cpf,"1950-01-01",200).get("sessao").get("accessToken").asText();
        var orientacoes=mvc.perform(get("/api/v1/pacientes/me/consultas").header("Authorization","Bearer "+pacienteToken))
            .andExpect(status().isOk()).andReturn().getResponse().getContentAsString();
        assertThat(orientacoes).contains("Plano retificado").doesNotContain("Nota retificada","Nota original");
        mvc.perform(get(rota).header("Authorization","Bearer "+pacienteToken)).andExpect(status().isForbidden());
        mvc.perform(get(rota).header("Authorization","Bearer "+tokenProfissional("b"))).andExpect(status().isForbidden());
        assertThatThrownBy(()->banco.update("UPDATE retificacao_registro SET motivo='alteração indevida' WHERE id_consulta=?",registro)).isInstanceOf(org.springframework.dao.DataAccessException.class);
        assertThatThrownBy(()->banco.update("DELETE FROM retificacao_registro WHERE id_consulta=?",registro)).isInstanceOf(org.springframework.dao.DataAccessException.class);
    }
    @Test void diarioRetificaSomenteTextoEPreservaPressaoTranscrita() throws Exception {
        String token=tokenProfissional("a");
        var resposta=mvc.perform(post("/api/v1/patients").header("Authorization","Bearer "+token).contentType(MediaType.APPLICATION_JSON)
            .content(json.writeValueAsString(Map.of("displayName","Pessoa sintética — retificação diário","modality","BRACELET_DIARY","telefone",ApoioAcessoPaciente.gerarTelefone()))))
            .andExpect(status().isOk()).andReturn().getResponse().getContentAsString();
        UUID idPaciente=UUID.fromString(json.readTree(resposta).get("patient").get("id").asText()),id=UUID.randomUUID();
        mvc.perform(post("/api/v1/patients/"+idPaciente+"/diary").header("Authorization","Bearer "+token).contentType(MediaType.APPLICATION_JSON)
            .content(json.writeValueAsString(Map.of("id",id,"occurredAt",java.time.Instant.now().toString(),"systolic",118,"diastolic",76,"notes","Texto original"))))
            .andExpect(status().isOk());
        String rota="/api/v1/pacientes/"+idPaciente+"/registros/DIARIO/"+id+"/retificacoes";
        mvc.perform(post(rota).header("Authorization","Bearer "+token).contentType(MediaType.APPLICATION_JSON)
            .content(json.writeValueAsString(Map.of("versaoAtual",0,"motivo","Correção textual de transcrição","conteudo",Map.of("notes","Observação corrigida")))))
            .andExpect(status().isOk());
        mvc.perform(post(rota).header("Authorization","Bearer "+token).contentType(MediaType.APPLICATION_JSON)
            .content(json.writeValueAsString(Map.of("versaoAtual",1,"motivo","Tentativa de alterar a medição","conteudo",Map.of("systolic","120")))))
            .andExpect(status().isBadRequest());
        assertThat(banco.queryForObject("SELECT systolic FROM printed_diary_entry WHERE id=?",Integer.class,id)).isEqualTo(118);
        assertThat(banco.queryForObject("SELECT notes FROM printed_diary_entry WHERE id=?",String.class,id)).isEqualTo("Texto original");
        assertThat(banco.queryForObject("SELECT systolic FROM blood_pressure_reading WHERE patient_id=?",Integer.class,idPaciente)).isEqualTo(118);
        assertThat(banco.queryForObject("SELECT relrowsecurity FROM pg_class WHERE oid='retificacao_registro'::regclass",Boolean.class)).isTrue();
    }
}
