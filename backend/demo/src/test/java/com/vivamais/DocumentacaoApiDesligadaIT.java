package com.vivamais;

import static org.assertj.core.api.Assertions.assertThat;
import static org.springframework.test.web.servlet.request.MockMvcRequestBuilders.get;
import static org.springframework.test.web.servlet.request.MockMvcRequestBuilders.post;
import static org.springframework.test.web.servlet.result.MockMvcResultMatchers.status;

import com.vivamais.dto.ModelosApi;
import com.vivamais.security.CodificadorToken;
import java.util.Properties;
import java.util.UUID;
import org.junit.jupiter.api.Test;
import org.junit.jupiter.params.ParameterizedTest;
import org.junit.jupiter.params.provider.ValueSource;
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

/** Fora de desenvolvimento e teste, o contrato OpenAPI não fica disponível nem para sessões válidas. */
@SpringBootTest(properties = "springdoc.api-docs.enabled=false")
@AutoConfigureMockMvc(print = MockMvcPrint.NONE)
@ActiveProfiles("bootstrap")
class DocumentacaoApiDesligadaIT {
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

  @ParameterizedTest
  @ValueSource(strings = {"application-nuvem.yml", "application-producao.yml"})
  void perfisPublicadosDesligamOContrato(String arquivo) {
    var yaml = new YamlPropertiesFactoryBean();
    yaml.setResources(new ClassPathResource(arquivo));
    Properties propriedades = yaml.getObject();
    assertThat(propriedades).containsEntry("springdoc.api-docs.enabled", false);
  }

  @Test
  void contratoNaoExisteNemComSessaoDeAdministracao() throws Exception {
    var resposta = mvc.perform(post("/api/v1/auth/login").contentType(MediaType.APPLICATION_JSON)
            .content(mapper.writeValueAsString(new ModelosApi.SolicitacaoAcesso("admin.a@demo.vivamais.invalid", SENHA, null))))
        .andExpect(status().isOk()).andReturn();
    String token = mapper.readTree(resposta.getResponse().getContentAsString()).get("accessToken").asText();
    mvc.perform(get("/v3/api-docs")).andExpect(status().isUnauthorized());
    mvc.perform(get("/v3/api-docs").header("Authorization", "Bearer " + token)).andExpect(status().isNotFound());
    mvc.perform(get("/v3/api-docs.yaml").header("Authorization", "Bearer " + token)).andExpect(status().isNotFound());
  }
}
