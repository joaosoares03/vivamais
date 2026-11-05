package com.vivamais;

import static org.assertj.core.api.Assertions.*;
import static org.springframework.test.web.servlet.request.MockMvcRequestBuilders.*;
import static org.springframework.test.web.servlet.result.MockMvcResultMatchers.*;
import com.vivamais.security.CodificadorToken;
import com.vivamais.security.CodigoTotp;
import com.vivamais.service.ContasInstitucionaisService;
import java.time.Instant;
import java.util.*;
import org.junit.jupiter.api.*;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.boot.test.context.*;
import org.springframework.boot.webmvc.test.autoconfigure.*;
import org.springframework.http.MediaType;
import org.springframework.jdbc.core.JdbcTemplate;
import org.springframework.test.context.*;
import org.springframework.test.web.servlet.*;
import org.testcontainers.containers.PostgreSQLContainer;
import tools.jackson.databind.*;

/** Fluxo real de equipe e paciente: provisão, convite, MFA, recuperação e ativação presencial. */
@SpringBootTest @AutoConfigureMockMvc(print=MockMvcPrint.NONE)
@TestInstance(TestInstance.Lifecycle.PER_CLASS)
@TestMethodOrder(MethodOrderer.OrderAnnotation.class)
class ContasInstitucionaisIT {
    static final String SCHEMA="contas_"+UUID.randomUUID().toString().replace("-",""),SENHA_ADMIN="senha-admin-"+new CodificadorToken().issue().substring(0,12),SENHA_PROF="senha-prof-"+new CodificadorToken().issue().substring(0,12);
    static final String ADMIN="admin@real.vivamais.invalid",PROF="prof@real.vivamais.invalid";
    static PostgreSQLContainer<?> container;
    @DynamicPropertySource static void configurar(DynamicPropertyRegistry r) {
        if(System.getenv("TEST_DATABASE_URL")!=null){r.add("spring.datasource.url",()->System.getenv("TEST_DATABASE_URL"));r.add("spring.datasource.username",()->System.getenv("TEST_DATABASE_USER"));r.add("spring.datasource.password",()->System.getenv("TEST_DATABASE_PASSWORD"));}
        else{container=new PostgreSQLContainer<>("postgres:17.9-alpine");container.start();r.add("spring.datasource.url",container::getJdbcUrl);r.add("spring.datasource.username",container::getUsername);r.add("spring.datasource.password",container::getPassword);}
        r.add("spring.flyway.default-schema",()->SCHEMA);r.add("spring.datasource.hikari.schema",()->SCHEMA);r.add("files.directory",()->System.getProperty("java.io.tmpdir")+"/viva-"+SCHEMA);
        r.add("app.mfa-obrigatorio",()->"true");r.add("app.limite-login-persistido",()->"true");r.add("sms.provedor",()->"PRESENCIAL");
    }
    @Autowired MockMvc mvc;@Autowired ObjectMapper json;@Autowired JdbcTemplate banco;@Autowired ContasInstitucionaisService contas;
    String segredoAdmin,segredoProf,idProf,recuperacaoAdmin,tokenAdmin,tokenProf;
    long ultimoPasso=-1;

    @AfterAll void fechar(){banco.execute("DROP SCHEMA "+SCHEMA+" CASCADE");if(container!=null)container.stop();}
    @BeforeEach void liberarLimites(){banco.update("DELETE FROM limite_acesso_paciente");}
    JsonNode postar(String rota,Object corpo,String token,int status) throws Exception {
        var req=post("/api/v1"+rota).contentType(MediaType.APPLICATION_JSON).content(json.writeValueAsString(corpo));
        if(token!=null)req=req.header("Authorization","Bearer "+token);
        String texto=mvc.perform(req).andExpect(status().is(status)).andReturn().getResponse().getContentAsString();
        return texto.isBlank()?null:json.readTree(texto);
    }
    /** Cada login consome um passo do TOTP; o teste avança o passo em vez de esperar 30 segundos. */
    String codigo(String segredo){
        long passo=CodigoTotp.passo(Instant.now())+1;
        banco.update("UPDATE mfa_conta SET ultimo_passo=? WHERE confirmado_em IS NOT NULL",passo-1);
        return CodigoTotp.gerar(segredo,passo);
    }
    String ativar(String convite,String senha) throws Exception {
        String segredo=postar("/auth/conta/convite",Map.of("convite",convite),null,200).get("segredo").asText();
        recuperacaoAdmin=postar("/auth/conta/ativar",Map.of("convite",convite,"senha",senha,"codigoMfa",CodigoTotp.gerar(segredo,CodigoTotp.passo(Instant.now()))),null,200).get("codigosRecuperacao").get(0).asText();
        return segredo;
    }
    String entrar(String email,String senha,String codigoMfa) throws Exception {
        return postar("/auth/login",Map.of("email",email,"password",senha,"codigoMfa",codigoMfa),null,200).get("accessToken").asText();
    }

    @Test @Order(1) void provisaoCriaAdministradorQuePrecisaAtivar() throws Exception {
        var convite=contas.provisionarInicial("Unidade real de teste",ADMIN,"Administração real");
        assertThatThrownBy(()->contas.provisionarInicial("Outra",ADMIN+"x","Outra")).isInstanceOf(Exception.class);
        postar("/auth/login",Map.of("email",ADMIN,"password",SENHA_ADMIN),null,401);
        postar("/auth/conta/ativar",Map.of("convite",convite.convite(),"senha",SENHA_ADMIN,"codigoMfa","000000"),null,409);
        segredoAdmin=ativar(convite.convite(),SENHA_ADMIN);
        postar("/auth/conta/convite",Map.of("convite",convite.convite()),null,401);
        assertThat(banco.queryForObject("SELECT segredo_cifrado FROM mfa_conta LIMIT 1",String.class)).doesNotContain(segredoAdmin);
    }
    @Test @Order(2) void loginExigeSegundoFatorENaoAceitaReuso() throws Exception {
        postar("/auth/login",Map.of("email",ADMIN,"password",SENHA_ADMIN),null,401);
        postar("/auth/login",Map.of("email",ADMIN,"password",SENHA_ADMIN,"codigoMfa","000000"),null,401);
        postar("/auth/login",Map.of("email",ADMIN,"password","senha-errada-123","codigoMfa",codigo(segredoAdmin)),null,401);
        String mesmo=codigo(segredoAdmin);
        tokenAdmin=entrar(ADMIN,SENHA_ADMIN,mesmo);
        postar("/auth/login",Map.of("email",ADMIN,"password",SENHA_ADMIN,"codigoMfa",mesmo),null,401);
        assertThat(banco.queryForObject("SELECT count(*) FROM audit_event WHERE action='LOGIN_RECUSADO'",Integer.class)).isGreaterThanOrEqualTo(4);
        assertThat(banco.queryForObject("SELECT count(*) FROM limite_acesso_paciente",Integer.class)).isGreaterThanOrEqualTo(2);
    }
    @Test @Order(3) void codigoDeRecuperacaoFuncionaUmaVez() throws Exception {
        entrar(ADMIN,SENHA_ADMIN,recuperacaoAdmin);
        postar("/auth/login",Map.of("email",ADMIN,"password",SENHA_ADMIN,"codigoMfa",recuperacaoAdmin),null,401);
    }
    @Test @Order(4) void administradorConvidaProfissionalComReautenticacao() throws Exception {
        var pedido=new HashMap<String,Object>(Map.of("nome","Profissional real","email",PROF,"papel","PROFESSIONAL","senhaAdministrador","senha-errada-123","codigoMfa",codigo(segredoAdmin)));
        postar("/contas-institucionais",pedido,tokenAdmin,401);
        pedido.put("senhaAdministrador",SENHA_ADMIN);pedido.put("codigoMfa",codigo(segredoAdmin));
        postar("/contas-institucionais",Map.of("nome","Sem token","email","sem@real.vivamais.invalid","papel","PROFESSIONAL","senhaAdministrador",SENHA_ADMIN),null,401);
        var convite=postar("/contas-institucionais",pedido,tokenAdmin,200);
        idProf=convite.get("id").asText();
        pedido.put("codigoMfa",codigo(segredoAdmin));
        postar("/contas-institucionais",pedido,tokenAdmin,409);
        segredoProf=ativar(convite.get("convite").asText(),SENHA_PROF);
        tokenProf=entrar(PROF,SENHA_PROF,codigo(segredoProf));
        mvc.perform(get("/api/v1/contas-institucionais").header("Authorization","Bearer "+tokenProf)).andExpect(status().isForbidden());
        postar("/contas-institucionais",pedido,tokenProf,403);
        mvc.perform(get("/api/v1/contas-institucionais").header("Authorization","Bearer "+tokenAdmin)).andExpect(status().isOk()).andExpect(jsonPath("$.length()").value(2));
    }
    @Test @Order(5) void ativacaoPresencialEntregaCodigoUmaVezESoAoProfissional() throws Exception {
        String cpf=ApoioAcessoPaciente.gerarCpf();
        String id=postar("/patients",Map.of("displayName","Paciente real de teste","modality","APP","cpf",cpf,"dataNascimento","1950-01-01","telefone","(11) 9"+"2".repeat(8)),tokenProf,200).get("patient").get("id").asText();
        var emissao=postar("/patients/"+id+"/access-reset",Map.of("senhaProfissional",SENHA_PROF,"identidadeConferida",true),tokenProf,200);
        String codigo=emissao.get("codigoPresencial").asText();
        assertThat(codigo).matches("[0-9]{6}");
        assertThat(emissao.get("estadoEnvio").asText()).isEqualTo("PRESENCIAL");
        var estado=mvc.perform(get("/api/v1/patients/"+id+"/access-status").header("Authorization","Bearer "+tokenProf)).andExpect(status().isOk()).andReturn().getResponse().getContentAsString();
        assertThat(estado).doesNotContain(codigo);
        var inicio=Map.of("cpf",cpf,"dataNascimento","1950-01-01","tipo","NATIVO");
        String desafio=postar("/auth/paciente/iniciar",inicio,null,200).get("desafio").asText();
        postar("/auth/paciente/verificar",Map.of("desafio",desafio,"codigo",codigo.equals("000000")?"000001":"000000","tipo","NATIVO"),null,401);
        var sessao=postar("/auth/paciente/verificar",Map.of("desafio",desafio,"codigo",codigo,"tipo","NATIVO"),null,200);
        assertThat(sessao.get("estado").asText()).isEqualTo("AUTENTICADO");
        String outro=postar("/auth/paciente/iniciar",inicio,null,200).get("desafio").asText();
        postar("/auth/paciente/verificar",Map.of("desafio",outro,"codigo",codigo,"tipo","NATIVO"),null,401);
        assertThat(banco.queryForObject("SELECT telefone_confirmado_em IS NULL FROM patient WHERE id=?",Boolean.class,UUID.fromString(id))).isTrue();
    }
    @Test @Order(6) void novoConviteRevogaSessaoEMfaAnteriores() throws Exception {
        var convite=postar("/contas-institucionais/"+idProf+"/convite",Map.of("senhaAdministrador",SENHA_ADMIN,"codigoMfa",codigo(segredoAdmin)),tokenAdmin,200);
        mvc.perform(get("/api/v1/auth/me").header("Authorization","Bearer "+tokenProf)).andExpect(status().isUnauthorized());
        postar("/auth/login",Map.of("email",PROF,"password",SENHA_PROF,"codigoMfa",codigo(segredoProf)),null,401);
        assertThat(banco.queryForObject("SELECT count(*) FROM mfa_conta WHERE id_usuario=?",Integer.class,UUID.fromString(idProf))).isZero();
        segredoProf=ativar(convite.get("convite").asText(),SENHA_PROF);
        tokenProf=entrar(PROF,SENHA_PROF,codigo(segredoProf));
    }
    @Test @Order(7) void administradorNaoAlteraAPropriaContaEDesativaOutra() throws Exception {
        String proprio=banco.queryForObject("SELECT id::text FROM user_account WHERE email=?",String.class,ADMIN);
        postar("/contas-institucionais/"+proprio+"/desativar",Map.of("senhaAdministrador",SENHA_ADMIN,"codigoMfa",codigo(segredoAdmin)),tokenAdmin,409);
        postar("/contas-institucionais/"+idProf+"/desativar",Map.of("senhaAdministrador",SENHA_ADMIN,"codigoMfa",codigo(segredoAdmin)),tokenAdmin,204);
        mvc.perform(get("/api/v1/auth/me").header("Authorization","Bearer "+tokenProf)).andExpect(status().isUnauthorized());
    }
    @Test @Order(8) void convitesExpiradosEDeOutraUnidadeNaoValem() throws Exception {
        var convite=postar("/contas-institucionais",Map.of("nome","Expira","email","expira@real.vivamais.invalid","papel","PROFESSIONAL","senhaAdministrador",SENHA_ADMIN,"codigoMfa",codigo(segredoAdmin)),tokenAdmin,200);
        banco.update("ALTER TABLE account_activation DISABLE TRIGGER USER");
        banco.update("UPDATE account_activation SET created_at=now()-interval '3 days',expires_at=now()-interval '1 hour' WHERE user_account_id=?",UUID.fromString(convite.get("id").asText()));
        banco.update("ALTER TABLE account_activation ENABLE TRIGGER USER");
        postar("/auth/conta/convite",Map.of("convite",convite.get("convite").asText()),null,401);
        postar("/contas-institucionais/"+UUID.randomUUID()+"/convite",Map.of("senhaAdministrador",SENHA_ADMIN,"codigoMfa",codigo(segredoAdmin)),tokenAdmin,404);
    }
}
