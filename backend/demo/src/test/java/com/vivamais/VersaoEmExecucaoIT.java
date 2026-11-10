package com.vivamais;

import static org.assertj.core.api.Assertions.assertThat;
import static org.springframework.test.web.servlet.request.MockMvcRequestBuilders.get;
import static org.springframework.test.web.servlet.request.MockMvcRequestBuilders.post;
import static org.springframework.test.web.servlet.result.MockMvcResultMatchers.jsonPath;
import static org.springframework.test.web.servlet.result.MockMvcResultMatchers.status;

import com.vivamais.dto.ModelosApi;
import com.vivamais.security.CodificadorToken;
import java.util.Properties;
import java.util.UUID;
import org.junit.jupiter.api.Test;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.beans.factory.config.YamlPropertiesFactoryBean;
import org.springframework.boot.test.context.SpringBootTest;
import org.springframework.boot.webmvc.test.autoconfigure.AutoConfigureMockMvc;
import org.springframework.boot.webmvc.test.autoconfigure.MockMvcPrint;
import org.springframework.core.io.ClassPathResource;
import org.springframework.http.MediaType;
import org.springframework.test.context.ActiveProfiles;
import org.springframework.test.context.DynamicPropertyRegistry;
import org.springframework.test.context.DynamicPropertySource;
import org.springframework.test.web.servlet.MockMvc;
import org.testcontainers.containers.PostgreSQLContainer;
import tools.jackson.databind.ObjectMapper;

/** A administração confere qual commit está em execução; demais papéis e anônimos não leem. */
@SpringBootTest(properties = "info.aplicacao.commit=0123456789abcdef0123456789abcdef01234567")
@AutoConfigureMockMvc(print = MockMvcPrint.NONE)
@ActiveProfiles("bootstrap")
class VersaoEmExecucaoIT {
  private static final String SENHA = new CodificadorToken().issue();
  private static final String SCHEMA = "test_" + UUID.randomUUID().toString().replace("-", "");
  private static PostgreSQLContainer<?> container;

  @DynamicPropertySource
  static void banco(DynamicPropertyRegistry registro) {
    String externo = System.getenv("TEST_DATABASE_URL");
    if (externo != null && !externo.isBlank()) {
      registro.add("spring.datasource.url", () -> externo);
      registro.add("spring.datasource.username", () -> System.getenv().getOrDefault("TEST_DATABASE_USER", "postgres"));
      registro.add("spring.datasource.password", () -> System.getenv().getOrDefault("TEST_DATABASE_PASSWORD", "postgres"));
    } else {
      container = new PostgreSQLContainer<>("postgres:17.9-alpine");
      container.start();
      registro.add("spring.datasource.url", container::getJdbcUrl);
      registro.add("spring.datasource.username", container::getUsername);
      registro.add("spring.datasource.password", container::getPassword);
    }
    registro.add("app.bootstrap-password", () -> SENHA);
    registro.add("spring.flyway.default-schema", () -> SCHEMA);
    registro.add("spring.datasource.hikari.schema", () -> SCHEMA);
  }

  @Autowired MockMvc mvc;
  @Autowired ObjectMapper mapper;

  private String entrar(String email) throws Exception {
    var resposta = mvc.perform(post("/api/v1/auth/login").contentType(MediaType.APPLICATION_JSON)
            .content(mapper.writeValueAsString(new ModelosApi.SolicitacaoAcesso(email, SENHA, null))))
        .andExpect(status().isOk()).andReturn();
    return mapper.readTree(resposta.getResponse().getContentAsString()).get("accessToken").asText();
  }

  @Test
  void commitVemDaRailwayComAlternativaExplicita() {
    var yaml = new YamlPropertiesFactoryBean();
    yaml.setResources(new ClassPathResource("application.yml"));
    Properties propriedades = yaml.getObject();
    assertThat(propriedades.getProperty("info.aplicacao.commit"))
        .isEqualTo("${RAILWAY_GIT_COMMIT_SHA:${APP_COMMIT_SHA:desconhecido}}");
  }

  @Test
  void somenteAdministracaoLeAVersao() throws Exception {
    mvc.perform(get("/actuator/info")).andExpect(status().isUnauthorized());
    String profissional = entrar("profissional.a@demo.vivamais.invalid");
    mvc.perform(get("/actuator/info").header("Authorization", "Bearer " + profissional)).andExpect(status().isForbidden());
    String admin = entrar("admin.a@demo.vivamais.invalid");
    mvc.perform(get("/actuator/info").header("Authorization", "Bearer " + admin))
        .andExpect(status().isOk())
        .andExpect(jsonPath("$.aplicacao.commit").value("0123456789abcdef0123456789abcdef01234567"));
  }
}
