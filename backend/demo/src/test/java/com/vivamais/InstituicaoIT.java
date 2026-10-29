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
import java.util.UUID;
import tools.jackson.databind.JsonNode;
import tools.jackson.databind.ObjectMapper;
import org.junit.jupiter.api.AfterAll;
import org.junit.jupiter.api.BeforeAll;
import org.junit.jupiter.api.Test;
import org.junit.jupiter.api.TestInstance;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.boot.webmvc.test.autoconfigure.AutoConfigureMockMvc;
import org.springframework.boot.test.context.SpringBootTest;
import org.springframework.dao.DataAccessException;
import org.springframework.http.MediaType;
import org.springframework.jdbc.core.JdbcTemplate;
import org.springframework.security.crypto.password.PasswordEncoder;
import org.springframework.test.context.ActiveProfiles;
import org.springframework.test.context.DynamicPropertyRegistry;
import org.springframework.test.context.DynamicPropertySource;
import org.springframework.test.web.servlet.MockMvc;
import org.testcontainers.containers.PostgreSQLContainer;

@SpringBootTest
@AutoConfigureMockMvc(print=org.springframework.boot.webmvc.test.autoconfigure.MockMvcPrint.NONE)
@ActiveProfiles("bootstrap")
@TestInstance(TestInstance.Lifecycle.PER_CLASS)
class InstituicaoIT {
    private static final String PASSWORD=new CodificadorToken().issue();
    private static final String SCHEMA="test_"+UUID.randomUUID().toString().replace("-","");
    private static PostgreSQLContainer<?> container;
    @DynamicPropertySource
    static void database(DynamicPropertyRegistry registry) {
        String external=System.getenv("TEST_DATABASE_URL");
        if(external!=null && !external.isBlank()) {
            registry.add("spring.datasource.url",()->external);
            registry.add("spring.datasource.username",()->env("TEST_DATABASE_USER","postgres"));
            registry.add("spring.datasource.password",()->env("TEST_DATABASE_PASSWORD","postgres"));
        } else {
            container=new PostgreSQLContainer<>("postgres:17.9-alpine"); container.start();
            registry.add("spring.datasource.url",container::getJdbcUrl);
            registry.add("spring.datasource.username",container::getUsername);
            registry.add("spring.datasource.password",container::getPassword);
        }
        registry.add("app.bootstrap-password",()->PASSWORD);
        registry.add("spring.flyway.default-schema",()->SCHEMA);
        registry.add("spring.datasource.hikari.schema",()->SCHEMA);
    }
    private static String env(String key,String fallback) { return System.getenv().getOrDefault(key,fallback); }
    @Autowired MockMvc mvc;
    @Autowired ObjectMapper mapper;
    @Autowired JdbcTemplate jdbc;
    @Autowired PasswordEncoder codificadorSenhas;
    String professionalA,professionalB,patientA,patientB,adminA,unassignedProfessional;
    UUID appA=DadosDemonstracao.id("patient-app-a"),appB=DadosDemonstracao.id("patient-app-b");
    UUID organizationA=DadosDemonstracao.id("organization-a");
    UUID unassignedPatient=UUID.randomUUID();

    @BeforeAll void authenticateFixtures() throws Exception {
        professionalA=entrar("profissional.a"); professionalB=entrar("profissional.b");
        patientA=entrar("paciente.a"); patientB=entrar("paciente.b"); adminA=entrar("admin.a");
        UUID id=UUID.randomUUID(); String email="unassigned-"+id+"@demo.vivamais.invalid";
        jdbc.update("INSERT INTO user_account(id,organization_id,email,display_name,password_hash,role) VALUES(?,?,?,'Profissional sem vínculo DEMO',?,'PROFESSIONAL')",id,organizationA,email,codificadorSenhas.encode(PASSWORD));
        jdbc.update("INSERT INTO professional(id,organization_id) VALUES(?,?)",id,organizationA);
        unassignedProfessional=loginEmail(email);
        jdbc.update("INSERT INTO patient(id,organization_id,display_name,modality) VALUES(?,?,'Paciente sem vínculo DEMO','APP')",unassignedPatient,organizationA);
    }
    @AfterAll void closeDatabase() {
        jdbc.execute("DROP SCHEMA "+SCHEMA+" CASCADE");
        if(container!=null) container.stop();
    }
    private String entrar(String name) throws Exception { return loginEmail(name+"@demo.vivamais.invalid"); }
    private String loginEmail(String email) throws Exception {
        if(jdbc.queryForObject("SELECT count(*) FROM user_account WHERE email=? AND role='PATIENT'",Integer.class,email)>0) return ApoioAcessoPaciente.sessaoAutorizada(mvc,mapper,jdbc,email);
        var resposta=mvc.perform(post("/api/v1/auth/login").contentType(MediaType.APPLICATION_JSON)
                .content(mapper.writeValueAsString(new ModelosApi.SolicitacaoAcesso(email,PASSWORD))))
                .andExpect(status().isOk()).andExpect(jsonPath("$.user.organizationId").exists()).andReturn();
        return mapper.readTree(resposta.getResponse().getContentAsString()).get("accessToken").asText();
    }
    @Test void unauthorizedRoutesReturnReal401AndHealthIsMinimal() throws Exception {
        mvc.perform(get("/api/v1/organization")).andExpect(status().isUnauthorized()).andExpect(jsonPath("$.status").value(401));
        mvc.perform(get("/actuator/health")).andExpect(status().isOk()).andExpect(jsonPath("$.status").value("UP"))
                .andExpect(jsonPath("$.components").doesNotExist());
        mvc.perform(get("/v3/api-docs")).andExpect(status().isUnauthorized());
    }
    @Test void credentialsHaveGenericFailuresAndInputsAreValidated() throws Exception {
        for(String email:new String[]{"unknown@demo.vivamais.invalid","paciente.a@demo.vivamais.invalid"}) {
            mvc.perform(post("/api/v1/auth/login").contentType(MediaType.APPLICATION_JSON)
                    .content(mapper.writeValueAsString(new ModelosApi.SolicitacaoAcesso(email,"incorrect-password"))))
                    .andExpect(status().isUnauthorized()).andExpect(jsonPath("$.detail").value("Credenciais inválidas."));
        }
        mvc.perform(post("/api/v1/auth/login").contentType(MediaType.APPLICATION_JSON).content("{\"email\":\"bad\",\"password\":\"\"}"))
                .andExpect(status().isBadRequest()).andExpect(jsonPath("$.status").value(400));
    }
    @Test void resourceAuthorizationEnforcesOrganizationAndExplicitAssignments() throws Exception {
        mvc.perform(get("/api/v1/patients/"+appA).header("Authorization","Bearer "+professionalA)).andExpect(status().isOk());
        mvc.perform(get("/api/v1/patients/"+appA).header("Authorization","Bearer "+professionalB)).andExpect(status().isForbidden());
        mvc.perform(get("/api/v1/patients/"+appB).header("Authorization","Bearer "+professionalA)).andExpect(status().isForbidden());
        mvc.perform(get("/api/v1/patients/"+unassignedPatient).header("Authorization","Bearer "+professionalA)).andExpect(status().isForbidden());
        mvc.perform(get("/api/v1/patients/"+appA).header("Authorization","Bearer "+unassignedProfessional)).andExpect(status().isForbidden());
        mvc.perform(get("/api/v1/patients").header("Authorization","Bearer "+unassignedProfessional)).andExpect(status().isOk()).andExpect(jsonPath("$.length()").value(0));
        mvc.perform(get("/api/v1/patients/"+unassignedPatient).header("Authorization","Bearer "+adminA)).andExpect(status().isOk());
        mvc.perform(get("/api/v1/patients/"+appB).header("Authorization","Bearer "+adminA)).andExpect(status().isForbidden());
    }
    @Test void patientOnlySeesOwnProfileAndCannotUseProfessionalEndpoints() throws Exception {
        mvc.perform(get("/api/v1/patients/me").header("Authorization","Bearer "+patientA))
                .andExpect(status().isOk()).andExpect(jsonPath("$.id").value(appA.toString()));
        mvc.perform(get("/api/v1/patients/"+appA).header("Authorization","Bearer "+patientA)).andExpect(status().isOk());
        mvc.perform(get("/api/v1/patients/"+appB).header("Authorization","Bearer "+patientA)).andExpect(status().isForbidden());
        mvc.perform(get("/api/v1/patients/"+appA).header("Authorization","Bearer "+patientB)).andExpect(status().isForbidden());
        mvc.perform(get("/api/v1/patients").header("Authorization","Bearer "+patientA)).andExpect(status().isForbidden());
        mvc.perform(get("/api/v1/dashboard").header("Authorization","Bearer "+patientA)).andExpect(status().isForbidden());
    }
    @Test void dashboardUsesAuthorizedPersistedRowsAndModulesExplainTheirState() throws Exception {
        mvc.perform(get("/api/v1/dashboard").header("Authorization","Bearer "+professionalA))
                .andExpect(status().isOk()).andExpect(jsonPath("$.patientCount").value(2))
                .andExpect(jsonPath("$.appCount").value(1)).andExpect(jsonPath("$.diaryCount").value(1));
        mvc.perform(get("/api/v1/organization").header("Authorization","Bearer "+professionalA))
                .andExpect(status().isOk()).andExpect(jsonPath("$.id").value(organizationA.toString()));
        mvc.perform(get("/api/v1/system/modules").header("Authorization","Bearer "+patientA))
                .andExpect(status().isOk()).andExpect(jsonPath("$.length()").value(7))
                .andExpect(jsonPath("$[6].status").value("BLOCKED_PENDING_HARDWARE_SPEC"));
        var openapi=mvc.perform(get("/v3/api-docs").header("Authorization","Bearer "+adminA))
                .andExpect(status().isOk()).andExpect(jsonPath("$.paths['/api/v1/auth/login'].post.security.length()").value(0))
                .andExpect(jsonPath("$.paths['/api/v1/auth/logout'].post.responses['204']").exists())
                .andExpect(jsonPath("$.components.schemas.Usuario.required.length()").value(5)).andReturn();
        java.nio.file.Files.writeString(java.nio.file.Path.of("target/openapi.json"),openapi.getResponse().getContentAsString());
    }
    @Test void sessionIsHashedRevokedImmediatelyAndExpires() throws Exception {
        String token=entrar("paciente.a");
        assertThat(jdbc.queryForObject("SELECT count(*) FROM auth_session WHERE token_hash=?",Integer.class,token)).isZero();
        String hash=new CodificadorToken().hash(token);
        assertThat(jdbc.queryForObject("SELECT count(*) FROM auth_session WHERE token_hash=?",Integer.class,hash)).isEqualTo(1);
        mvc.perform(post("/api/v1/auth/logout").header("Authorization","Bearer "+token)).andExpect(status().isNoContent());
        mvc.perform(get("/api/v1/auth/me").header("Authorization","Bearer "+token)).andExpect(status().isUnauthorized());
        String expiring=entrar("paciente.b");
        jdbc.update("UPDATE auth_session SET created_at=now()-interval '2 hours',expires_at=now()-interval '1 hour' WHERE token_hash=?",new CodificadorToken().hash(expiring));
        mvc.perform(get("/api/v1/auth/me").header("Authorization","Bearer "+expiring)).andExpect(status().isUnauthorized());
    }
    @Test void schemaRejectsCrossOrganizationAssignmentAndAuditMutation() {
        assertThatThrownBy(()->jdbc.update("INSERT INTO patient_professional_assignment(patient_id,professional_id,organization_id) VALUES(?,?,?)",
                appA,DadosDemonstracao.id("profissional-b"),organizationA)).isInstanceOf(DataAccessException.class);
        assertThatThrownBy(()->jdbc.update("UPDATE audit_event SET action='TAMPERED' WHERE id=?",DadosDemonstracao.id("bootstrap-audit-a"))).isInstanceOf(DataAccessException.class);
        assertThatThrownBy(()->jdbc.update("DELETE FROM audit_event WHERE id=?",DadosDemonstracao.id("bootstrap-audit-a"))).isInstanceOf(DataAccessException.class);
        assertThatThrownBy(()->jdbc.execute("TRUNCATE audit_event")).isInstanceOf(DataAccessException.class);
    }
    @Test void corsRejectsUnlistedOriginsAndAllowsExactLocalOrigin() throws Exception {
        mvc.perform(options("/api/v1/auth/login").header("Origin","https://untrusted.example")
                .header("Access-Control-Request-Method","POST")).andExpect(status().isForbidden());
        mvc.perform(options("/api/v1/auth/login").header("Origin","http://localhost:3000")
                .header("Access-Control-Request-Method","POST")).andExpect(status().isOk())
                .andExpect(header().string("Access-Control-Allow-Origin","http://localhost:3000"));
    }
    @Test void excessiveLoginAttemptsReturn429WithRetryAfter() throws Exception {
        String body=mapper.writeValueAsString(new ModelosApi.SolicitacaoAcesso("limited-"+UUID.randomUUID()+"@demo.vivamais.invalid","invalid-password"));
        for(int i=0;i<10;i++) mvc.perform(post("/api/v1/auth/login").contentType(MediaType.APPLICATION_JSON).content(body)).andExpect(status().isUnauthorized());
        mvc.perform(post("/api/v1/auth/login").contentType(MediaType.APPLICATION_JSON).content(body))
                .andExpect(status().isTooManyRequests()).andExpect(header().string("Retry-After","900"))
                .andExpect(jsonPath("$.status").value(429));
    }
    @Test void rejectsOversizedBodiesBeforeJsonDeserializationIncludingChunkedRequests() throws Exception {
        byte[] oversized=new byte[FiltroLimiteRequisicao.MAX_BYTES+1];
        mvc.perform(post("/api/v1/auth/login").contentType(MediaType.APPLICATION_JSON).content(oversized))
                .andExpect(status().isPayloadTooLarge()).andExpect(jsonPath("$.status").value(413));
        mvc.perform(servletContext -> {
            var requisicao=new org.springframework.mock.web.MockHttpServletRequest(servletContext) {
                @Override public int getContentLength() { return -1; }
                @Override public long getContentLengthLong() { return -1; }
            };
            requisicao.setMethod("POST"); requisicao.setRequestURI("/api/v1/auth/login");
            requisicao.setContentType(MediaType.APPLICATION_JSON_VALUE); requisicao.setContent(oversized);
            requisicao.addHeader("Transfer-Encoding","chunked"); return requisicao;
        }).andExpect(status().isPayloadTooLarge()).andExpect(jsonPath("$.status").value(413));
    }
}
