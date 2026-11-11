package com.vivamais;

import static org.assertj.core.api.Assertions.*;
import static org.springframework.test.web.servlet.request.MockMvcRequestBuilders.*;
import static org.springframework.test.web.servlet.result.MockMvcResultMatchers.*;
import com.vivamais.security.CodificadorToken;
import com.vivamais.service.sms.ServicoEnvioSms;
import tools.jackson.databind.*;
import java.util.*;
import org.junit.jupiter.api.*;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.boot.webmvc.test.autoconfigure.*;
import org.springframework.boot.test.context.*;
import org.springframework.context.annotation.*;
import org.springframework.http.MediaType;
import org.springframework.jdbc.core.JdbcTemplate;
import org.springframework.test.context.*;
import org.springframework.test.web.servlet.*;
import org.testcontainers.containers.PostgreSQLContainer;

@SpringBootTest @AutoConfigureMockMvc(print=MockMvcPrint.NONE) @ActiveProfiles("bootstrap")
@TestInstance(TestInstance.Lifecycle.PER_CLASS)
class CadastroSmsIT {
    static final String SENHA=new CodificadorToken().issue(),SCHEMA="sms_"+UUID.randomUUID().toString().replace("-","");
    static PostgreSQLContainer<?> container;
    @DynamicPropertySource static void configurar(DynamicPropertyRegistry r) {
        if(System.getenv("TEST_DATABASE_URL")!=null){r.add("spring.datasource.url",()->System.getenv("TEST_DATABASE_URL"));r.add("spring.datasource.username",()->System.getenv("TEST_DATABASE_USER"));r.add("spring.datasource.password",()->System.getenv("TEST_DATABASE_PASSWORD"));}
        else{container=new PostgreSQLContainer<>("postgres:17.9-alpine");container.start();r.add("spring.datasource.url",container::getJdbcUrl);r.add("spring.datasource.username",container::getUsername);r.add("spring.datasource.password",container::getPassword);}
        r.add("app.bootstrap-password",()->SENHA);r.add("spring.flyway.default-schema",()->SCHEMA);r.add("spring.datasource.hikari.schema",()->SCHEMA);r.add("files.directory",()->System.getProperty("java.io.tmpdir")+"/viva-"+SCHEMA);
    }
    static class SmsControlado implements ServicoEnvioSms {
        String estado="TESTE_LOCAL",codigo;boolean habilitado=true;
        public String provedor(){return "LOCAL";}
        public boolean disponivel(){return habilitado;}
        public Resultado enviar(Mensagem mensagem){codigo=mensagem.codigo();if(!estado.equals("TESTE_LOCAL"))throw new Falha(estado);return new Resultado(estado,mensagem.idEnvio().toString());}
    }
    @TestConfiguration static class ConfiguracaoTeste {@Bean @Primary SmsControlado smsControlado(){return new SmsControlado();}}
    @Autowired MockMvc mvc;@Autowired ObjectMapper json;@Autowired JdbcTemplate banco;@Autowired SmsControlado sms;
    String profissional,cpf,telefone,id;
    @BeforeAll void autenticar() throws Exception {profissional=postar("/auth/login",Map.of("email","profissional.a@demo.vivamais.invalid","password",SENHA),null,200).get("accessToken").asText();}
    @BeforeEach void preparar() throws Exception {banco.update("DELETE FROM limite_acesso_paciente");sms.habilitado=true;sms.estado="TESTE_LOCAL";cpf=ApoioAcessoPaciente.gerarCpf();telefone=ApoioAcessoPaciente.gerarTelefone();id=cadastrar(cpf,telefone);}
    @AfterAll void fechar(){banco.execute("DROP SCHEMA "+SCHEMA+" CASCADE");if(container!=null)container.stop();}
    JsonNode postar(String rota,Object corpo,String token,int status) throws Exception {var req=post("/api/v1"+rota).contentType(MediaType.APPLICATION_JSON).content(json.writeValueAsString(corpo));if(token!=null)req.header("Authorization","Bearer "+token);String texto=mvc.perform(req).andExpect(status().is(status)).andReturn().getResponse().getContentAsString();return texto.isBlank()?json.nullNode():json.readTree(texto);}
    String cadastrar(String cpf,String celular) throws Exception {return postar("/patients",Map.of("displayName","Pessoa sintética SMS","modality","APP","cpf",cpf,"dataNascimento","1950-01-01","telefone",celular),profissional,200).get("patient").get("id").asText();}
    JsonNode emitir(String paciente,int status) throws Exception {return postar("/patients/"+paciente+"/access-reset",Map.of("senhaProfissional",SENHA,"identidadeConferida",true),profissional,status);}
    JsonNode ativar() throws Exception {emitir(id,200);String desafio=postar("/auth/paciente/iniciar",Map.of("cpf",cpf,"dataNascimento","1950-01-01","tipo","NATIVO"),null,200).get("desafio").asText();return postar("/auth/paciente/verificar",Map.of("desafio",desafio,"codigo",sms.codigo,"tipo","NATIVO"),null,200);}
    void esperarReenvioNoSchemaTeste(){banco.update("UPDATE limite_acesso_paciente SET inicio_janela=now()-interval '16 minutes'");}
    @Test void celularObrigatorioEDddValido() throws Exception {
        var dados=new LinkedHashMap<String,Object>(Map.of("displayName","Pessoa sintética Validação","modality","APP","cpf",ApoioAcessoPaciente.gerarCpf(),"dataNascimento","1950-01-01"));
        postar("/patients",dados,profissional,400);
        for(String numero:List.of("(23) 9"+"1".repeat(8),"(11) 3"+"1".repeat(7))){dados.put("telefone",numero);postar("/patients",dados,profissional,400);}
        assertThat(banco.queryForObject("SELECT telefone FROM patient WHERE id=?",String.class,UUID.fromString(id))).isEqualTo(telefone);
    }
    @Test void cpfDuplicadoEDataImpossivelNaoCriamPaciente() throws Exception {
        var dados=new LinkedHashMap<String,Object>(Map.of("displayName","Pessoa sintética Validação","modality","APP","cpf",cpf,"dataNascimento","1950-01-01","telefone",telefone));
        postar("/patients",dados,profissional,409);dados.put("cpf",ApoioAcessoPaciente.gerarCpf());dados.put("dataNascimento","1950-02-30");postar("/patients",dados,profissional,400);
    }
    @Test void respostaEEstadoNaoExibemCodigo() throws Exception {
        var resposta=emitir(id,200);assertThat(resposta.has("codigo")).isFalse();assertThat(resposta.has("activationToken")).isFalse();assertThat(resposta.get("estadoEnvio").asText()).isEqualTo("TESTE_LOCAL");
        var estado=mvc.perform(get("/api/v1/patients/"+id+"/access-status").header("Authorization","Bearer "+profissional)).andExpect(status().isOk()).andExpect(jsonPath("$.envioSms.estado").value("TESTE_LOCAL")).andReturn();
        assertThat(json.readTree(estado.getResponse().getContentAsString()).has("codigo")).isFalse();
        assertThat(banco.queryForObject("SELECT hash_codigo FROM codigo_ativacao_paciente WHERE id_paciente=? AND utilizado_em IS NULL",String.class,UUID.fromString(id))).hasSize(64);
        assertThat(banco.queryForObject("SELECT relrowsecurity FROM pg_class WHERE oid='envio_sms_ativacao'::regclass",Boolean.class)).isTrue();
    }
    @Test void falhaOuRespostaIndeterminadaNaoAutorizaCodigoNemApagaCadastro() throws Exception {
        for(String falha:List.of("FALHA","INDETERMINADO")){
            sms.estado=falha;emitir(id,503);
            assertThat(banco.queryForObject("SELECT count(*) FROM codigo_ativacao_paciente WHERE id_paciente=? AND utilizado_em IS NULL",Integer.class,UUID.fromString(id))).isZero();
            assertThat(banco.queryForObject("SELECT count(*) FROM envio_sms_ativacao WHERE id_paciente=? AND estado=?",Integer.class,UUID.fromString(id),falha)).isEqualTo(1);
            esperarReenvioNoSchemaTeste();
        }
        assertThat(banco.queryForObject("SELECT count(*) FROM patient WHERE id=?",Integer.class,UUID.fromString(id))).isEqualTo(1);
    }
    @Test void indisponivelNaoGeraCodigoEReenvioRespeitaLimite() throws Exception {
        sms.habilitado=false;emitir(id,503);emitir(id,429);
        assertThat(banco.queryForObject("SELECT count(*) FROM codigo_ativacao_paciente WHERE id_paciente=?",Integer.class,UUID.fromString(id))).isZero();
        mvc.perform(get("/api/v1/patients/"+id+"/access-status").header("Authorization","Bearer "+profissional)).andExpect(jsonPath("$.smsDisponivel").value(false)).andExpect(jsonPath("$.envioSms.estado").value("NAO_CONFIGURADO"));
    }
    @Test void falhaNaRecuperacaoPreservaAparelhoAnterior() throws Exception {
        var ativacao=ativar();String token=ativacao.get("sessao").get("accessToken").asText();esperarReenvioNoSchemaTeste();sms.estado="FALHA";emitir(id,503);
        mvc.perform(get("/api/v1/auth/me").header("Authorization","Bearer "+token)).andExpect(status().isOk());
    }
    @Test void legadoSemTelefonePreservaDadosEAparelhoMasNaoEmiteSms() throws Exception {
        var ativacao=ativar();banco.update("UPDATE patient SET telefone=NULL WHERE id=?",UUID.fromString(id));
        emitir(id,409);mvc.perform(get("/api/v1/auth/me").header("Authorization","Bearer "+ativacao.get("sessao").get("accessToken").asText())).andExpect(status().isOk());
    }
    @Test void mesmoCelularEmCadastrosDiferentesNaoContornaLimite() throws Exception {
        emitir(id,200);for(int i=0;i<2;i++)emitir(cadastrar(ApoioAcessoPaciente.gerarCpf(),telefone),200);
        emitir(cadastrar(ApoioAcessoPaciente.gerarCpf(),telefone),429);
    }
    @Test void trocaCelularExigeConfirmacaoERevogaAparelho() throws Exception {
        var ativacao=ativar();String token=ativacao.get("sessao").get("accessToken").asText(),novo=ApoioAcessoPaciente.gerarTelefone();String caminho="/api/v1/pacientes/"+id+"/dados-pessoais";
        var dados=new LinkedHashMap<String,Object>(Map.of("nomeCompleto","Pessoa sintética SMS","cpf",cpf,"dataNascimento","1950-01-01","telefone",novo,"versao",0));
        mvc.perform(put(caminho).header("Authorization","Bearer "+profissional).contentType(MediaType.APPLICATION_JSON).content(json.writeValueAsString(dados))).andExpect(status().isUnauthorized());
        dados.put("senhaProfissional",SENHA);dados.put("identidadeConferida",true);
        mvc.perform(put(caminho).header("Authorization","Bearer "+profissional).contentType(MediaType.APPLICATION_JSON).content(json.writeValueAsString(dados))).andExpect(status().isOk());
        mvc.perform(get("/api/v1/auth/me").header("Authorization","Bearer "+token)).andExpect(status().isUnauthorized());
        assertThat(banco.queryForObject("SELECT telefone FROM patient WHERE id=?",String.class,UUID.fromString(id))).isEqualTo(novo);
        assertThat(banco.queryForObject("SELECT telefone_confirmado_em FROM patient WHERE id=?",java.sql.Timestamp.class,UUID.fromString(id))).isNull();
    }
    @Test void pacienteNaoTrocaSozinhoNumeroDeAutenticacao() throws Exception {
        var ativacao=ativar();String token=ativacao.get("sessao").get("accessToken").asText();
        assertThat(banco.queryForObject("SELECT telefone_confirmado_em FROM patient WHERE id=?",java.sql.Timestamp.class,UUID.fromString(id))).isNull();
        mvc.perform(put("/api/v1/pacientes/"+id+"/contato").header("Authorization","Bearer "+token).contentType(MediaType.APPLICATION_JSON).content(json.writeValueAsString(Map.of("telefone",ApoioAcessoPaciente.gerarTelefone(),"versao",0)))).andExpect(status().isForbidden());
        assertThat(banco.queryForObject("SELECT telefone FROM patient WHERE id=?",String.class,UUID.fromString(id))).isEqualTo(telefone);
    }
    @Test void senhaIncorretaNaTrocaTemLimitePersistidoSemAlterarCadastro() throws Exception {
        var dados=Map.of("nomeCompleto","Pessoa sintética SMS","cpf",cpf,"dataNascimento","1950-01-01","telefone",ApoioAcessoPaciente.gerarTelefone(),"versao",0,"senhaProfissional","incorreta","identidadeConferida",true);
        for(int i=0;i<11;i++) mvc.perform(put("/api/v1/pacientes/"+id+"/dados-pessoais").header("Authorization","Bearer "+profissional).contentType(MediaType.APPLICATION_JSON).content(json.writeValueAsString(dados))).andExpect(status().is(i<10?401:429));
        assertThat(banco.queryForObject("SELECT telefone FROM patient WHERE id=?",String.class,UUID.fromString(id))).isEqualTo(telefone);
    }
    @Test void migracaoV8PreservaLegadoSemTelefoneEAparelhoEInvalidaCodigoManual() throws Exception {
        String anterior="legado_sms_"+UUID.randomUUID().toString().replace("-","");
        var fonte=Objects.requireNonNull(banco.getDataSource());UUID dispositivo=UUID.randomUUID(),codigo=UUID.randomUUID();
        try {
            org.flywaydb.core.Flyway.configure().dataSource(fonte).schemas(anterior).defaultSchema(anterior).target("8").load().migrate();
            for(String tabela:List.of("organization","user_account","professional","patient","patient_professional_assignment")) {
                var colunas=banco.queryForList("SELECT column_name FROM information_schema.columns WHERE table_schema=? AND table_name=? ORDER BY ordinal_position",String.class,anterior,tabela);
                String selecao=colunas.stream().map(c->c.equals("telefone")?"NULL":c).collect(java.util.stream.Collectors.joining(","));
                banco.execute("INSERT INTO "+anterior+"."+tabela+"("+String.join(",",colunas)+") SELECT "+selecao+" FROM "+SCHEMA+"."+tabela);
            }
            UUID paciente=UUID.fromString(id),usuario=banco.queryForObject("SELECT user_account_id FROM patient WHERE id=?",UUID.class,paciente),emissor=banco.queryForObject("SELECT id FROM user_account WHERE email='profissional.a@demo.vivamais.invalid'",UUID.class);
            banco.update("INSERT INTO "+anterior+".dispositivo_acesso_paciente(id,id_usuario,hash_credencial,expira_em,tipo) VALUES(?,?,?,now()+interval '1 day','NATIVO')",dispositivo,usuario,"a".repeat(64));
            banco.update("INSERT INTO "+anterior+".codigo_ativacao_paciente(id,id_paciente,hash_codigo,expira_em,id_emissor) VALUES(?,?,?,now()+interval '10 minutes',?)",codigo,paciente,"b".repeat(64),emissor);
            int contagem=banco.queryForObject("SELECT count(*) FROM "+anterior+".patient",Integer.class);
            org.flywaydb.core.Flyway.configure().dataSource(fonte).schemas(anterior).defaultSchema(anterior).load().migrate();
            assertThat(banco.queryForObject("SELECT count(*) FROM "+anterior+".patient",Integer.class)).isEqualTo(contagem);
            assertThat(banco.queryForObject("SELECT telefone FROM "+anterior+".patient WHERE id=?",String.class,paciente)).isNull();
            assertThat(banco.queryForObject("SELECT revogado_em FROM "+anterior+".dispositivo_acesso_paciente WHERE id=?",java.sql.Timestamp.class,dispositivo)).isNull();
            assertThat(banco.queryForObject("SELECT utilizado_em FROM "+anterior+".codigo_ativacao_paciente WHERE id=?",java.sql.Timestamp.class,codigo)).isNotNull();
        } finally {banco.execute("DROP SCHEMA IF EXISTS "+anterior+" CASCADE");}
    }
}
