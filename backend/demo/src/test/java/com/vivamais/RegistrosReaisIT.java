package com.vivamais;

import static org.assertj.core.api.Assertions.*;
import static org.springframework.test.web.servlet.request.MockMvcRequestBuilders.*;
import static org.springframework.test.web.servlet.result.MockMvcResultMatchers.*;
import com.vivamais.security.CodificadorToken;
import java.util.*;
import org.junit.jupiter.api.*;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.boot.test.context.*;
import org.springframework.boot.webmvc.test.autoconfigure.*;
import org.springframework.dao.DataAccessException;
import org.springframework.http.MediaType;
import org.springframework.jdbc.core.JdbcTemplate;
import org.springframework.security.crypto.password.PasswordEncoder;
import org.springframework.test.context.*;
import org.springframework.test.web.servlet.*;
import org.testcontainers.containers.PostgreSQLContainer;
import tools.jackson.databind.ObjectMapper;

/** Unidades reais convivem no mesmo schema sem herdar marcação de demonstração. */
@SpringBootTest @AutoConfigureMockMvc(print=MockMvcPrint.NONE) @ActiveProfiles("bootstrap")
@TestInstance(TestInstance.Lifecycle.PER_CLASS)
class RegistrosReaisIT {
    static final String SENHA=new CodificadorToken().issue(),SCHEMA="reais_"+UUID.randomUUID().toString().replace("-","");
    static PostgreSQLContainer<?> container;
    @DynamicPropertySource static void configurar(DynamicPropertyRegistry r) {
        if(System.getenv("TEST_DATABASE_URL")!=null){r.add("spring.datasource.url",()->System.getenv("TEST_DATABASE_URL"));r.add("spring.datasource.username",()->System.getenv("TEST_DATABASE_USER"));r.add("spring.datasource.password",()->System.getenv("TEST_DATABASE_PASSWORD"));}
        else{container=new PostgreSQLContainer<>("postgres:17.9-alpine");container.start();r.add("spring.datasource.url",container::getJdbcUrl);r.add("spring.datasource.username",container::getUsername);r.add("spring.datasource.password",container::getPassword);}
        r.add("app.bootstrap-password",()->SENHA);r.add("spring.flyway.default-schema",()->SCHEMA);r.add("spring.datasource.hikari.schema",()->SCHEMA);r.add("files.directory",()->System.getProperty("java.io.tmpdir")+"/viva-"+SCHEMA);
    }
    @Autowired MockMvc mvc;@Autowired ObjectMapper json;@Autowired JdbcTemplate banco;@Autowired PasswordEncoder senhas;
    final UUID unidade=UUID.randomUUID(),profissional=UUID.randomUUID();
    String token;
    @BeforeAll void preparar() throws Exception {
        banco.update("INSERT INTO organization(id,name,demo_only) VALUES(?,?,false)",unidade,"Unidade real de teste");
        banco.update("INSERT INTO user_account(id,organization_id,email,display_name,password_hash,role,demo_only) VALUES(?,?,?,?,?,'PROFESSIONAL',false)",profissional,unidade,"profissional@real.vivamais.invalid","Profissional real",senhas.encode(SENHA));
        banco.update("INSERT INTO professional(id,organization_id) VALUES(?,?)",profissional,unidade);
        var resposta=mvc.perform(post("/api/v1/auth/login").contentType(MediaType.APPLICATION_JSON).content(json.writeValueAsString(Map.of("email","profissional@real.vivamais.invalid","password",SENHA)))).andExpect(status().isOk()).andReturn();
        token=json.readTree(resposta.getResponse().getContentAsString()).get("accessToken").asText();
    }
    @AfterAll void fechar(){banco.execute("DROP SCHEMA "+SCHEMA+" CASCADE");if(container!=null)container.stop();}
    @Test void cadastroHerdaModoDaUnidade() throws Exception {
        var resposta=mvc.perform(post("/api/v1/patients").header("Authorization","Bearer "+token).contentType(MediaType.APPLICATION_JSON).content(json.writeValueAsString(Map.of("displayName","Pessoa de teste","modality","APP","cpf",ApoioAcessoPaciente.gerarCpf(),"dataNascimento","1950-01-01","telefone","(11) 9"+"1".repeat(8))))).andExpect(status().isOk()).andReturn();
        UUID id=UUID.fromString(json.readTree(resposta.getResponse().getContentAsString()).get("patient").get("id").asText());
        assertThat(banco.queryForObject("SELECT p.demo_only OR u.demo_only FROM patient p JOIN user_account u ON u.id=p.user_account_id WHERE p.id=?",Boolean.class,id)).isFalse();
    }
    @Test void contasInstitucionaisNaoExistemEmUnidadeDeDemonstracao() throws Exception {
        var resposta=mvc.perform(post("/api/v1/auth/login").contentType(MediaType.APPLICATION_JSON).content(json.writeValueAsString(Map.of("email","admin.a@demo.vivamais.invalid","password",SENHA)))).andExpect(status().isOk()).andReturn();
        String admin=json.readTree(resposta.getResponse().getContentAsString()).get("accessToken").asText();
        mvc.perform(get("/api/v1/contas-institucionais").header("Authorization","Bearer "+admin)).andExpect(status().isNotFound());
    }
    @Test void buscaFiltraModalidadeEOrdenaSemMudarOPadrao() throws Exception {
        for(String[] p:new String[][]{{"Ana Filtro","APP"},{"Bruno Filtro","BRACELET_DIARY"}}){
            var corpo=new HashMap<String,Object>(Map.of("displayName",p[0],"modality",p[1],"telefone","(11) 9"+"3".repeat(8)));
            if(p[1].equals("APP")){corpo.put("cpf",ApoioAcessoPaciente.gerarCpf());corpo.put("dataNascimento","1950-01-01");}
            mvc.perform(post("/api/v1/patients").header("Authorization","Bearer "+token).contentType(MediaType.APPLICATION_JSON).content(json.writeValueAsString(corpo))).andExpect(status().isOk());
        }
        mvc.perform(get("/api/v1/patients/search?q=Filtro").header("Authorization","Bearer "+token)).andExpect(status().isOk()).andExpect(jsonPath("$.total").value(2)).andExpect(jsonPath("$.items[0].displayName").value("Ana Filtro"));
        mvc.perform(get("/api/v1/patients/search?q=Filtro&modalidade=BRACELET_DIARY").header("Authorization","Bearer "+token)).andExpect(status().isOk()).andExpect(jsonPath("$.total").value(1)).andExpect(jsonPath("$.items[0].modality").value("BRACELET_DIARY"));
        mvc.perform(get("/api/v1/patients/search?q=Filtro&ordem=recentes").header("Authorization","Bearer "+token)).andExpect(status().isOk()).andExpect(jsonPath("$.items[0].displayName").value("Bruno Filtro"));
        mvc.perform(get("/api/v1/patients/search?modalidade=OUTRA").header("Authorization","Bearer "+token)).andExpect(status().isBadRequest());
        mvc.perform(get("/api/v1/patients/search?ordem=idade").header("Authorization","Bearer "+token)).andExpect(status().isBadRequest());
    }
    @Test void bancoRecusaMisturarModos() {
        UUID demonstracao=UUID.randomUUID();
        banco.update("INSERT INTO organization(id,name) VALUES(?,?)",demonstracao,"Unidade demo de teste");
        assertThatThrownBy(() -> banco.update("INSERT INTO patient(id,organization_id,display_name,modality,demo_only) VALUES(?,?,?,'BRACELET_DIARY',false)",UUID.randomUUID(),demonstracao,"Mistura")).isInstanceOf(DataAccessException.class);
        assertThatThrownBy(() -> banco.update("INSERT INTO patient(id,organization_id,display_name,modality) VALUES(?,?,?,'BRACELET_DIARY')",UUID.randomUUID(),unidade,"Sem coluna")).isInstanceOf(DataAccessException.class);
        assertThatThrownBy(() -> banco.update("UPDATE organization SET demo_only=true WHERE id=?",unidade)).isInstanceOf(DataAccessException.class);
    }
}
