package com.vivamais.config;

import static org.assertj.core.api.Assertions.*;
import static org.springframework.security.test.web.servlet.setup.SecurityMockMvcConfigurers.springSecurity;
import static org.springframework.test.web.servlet.request.MockMvcRequestBuilders.*;
import static org.springframework.test.web.servlet.result.MockMvcResultMatchers.*;
import com.vivamais.repositories.InstituicaoRepository;
import com.vivamais.controller.InicioAplicativoWebController;
import com.vivamais.security.CodificadorToken;
import java.time.Duration;
import java.util.List;
import org.junit.jupiter.api.BeforeEach;
import org.junit.jupiter.api.Test;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.context.annotation.*;
import org.springframework.jdbc.core.JdbcTemplate;
import org.springframework.mock.env.MockEnvironment;
import org.springframework.security.config.annotation.web.configuration.EnableWebSecurity;
import org.springframework.test.context.TestPropertySource;
import org.springframework.test.context.junit.jupiter.SpringJUnitConfig;
import org.springframework.test.context.web.WebAppConfiguration;
import org.springframework.test.web.servlet.MockMvc;
import org.springframework.test.web.servlet.setup.MockMvcBuilders;
import org.springframework.web.context.WebApplicationContext;
import org.springframework.web.servlet.config.annotation.EnableWebMvc;
import org.springframework.web.servlet.config.annotation.ResourceHandlerRegistry;
import org.springframework.web.servlet.config.annotation.WebMvcConfigurer;
import tools.jackson.databind.ObjectMapper;
import tools.jackson.databind.json.JsonMapper;

@WebAppConfiguration
@SpringJUnitConfig(AplicativoWebTest.Dependencias.class)
@TestPropertySource(properties={"app.ambiente=preview","app.web-paciente=true"})
class AplicativoWebTest {
    @Configuration @EnableWebMvc @EnableWebSecurity
    @Import({ConfiguracaoAplicativoWeb.class,ConfiguracaoSeguranca.class,InicioAplicativoWebController.class})
    static class Dependencias implements WebMvcConfigurer {
        @Override public void addResourceHandlers(ResourceHandlerRegistry registro) {
            // Reproduz a concorrência do handler estático padrão presente no Boot real.
            registro.addResourceHandler("/**").addResourceLocations("classpath:/static/");
        }
        @Bean PropriedadesAplicacao propriedades(){return new PropriedadesAplicacao(true,List.of("https://paciente.example.org"),Duration.ofMinutes(30),"");}
        @Bean ConfiguracaoTestadores testadores(PropriedadesAplicacao propriedades){return new ConfiguracaoTestadores(true,"d787cba5-9ded-4692-acb8-a15f006ddfa5","preview",propriedades,new MockEnvironment());}
        // Sem DataSource: estes ensaios atravessam as cadeias HTTP reais, sem autenticação ou consulta clínica.
        @Bean InstituicaoRepository repositorio(ConfiguracaoTestadores testadores){return new InstituicaoRepository(new JdbcTemplate(),null,testadores);}
        @Bean CodificadorToken codificador(){return new CodificadorToken();}
        @Bean ObjectMapper mapper(){return JsonMapper.builder().build();}
    }
    @Autowired WebApplicationContext contexto;
    @Autowired ConfiguracaoTestadores testadores;
    MockMvc mvc;
    @BeforeEach void preparar(){mvc=MockMvcBuilders.webAppContextSetup(contexto).apply(springSecurity()).build();}
    @Test void rotasDoExpoEReaberturaUsamIndiceSemCache() throws Exception {
        for(String caminho:List.of("/","/convite","/convite/","/medicamentos","/pressao/historico","/module/pressao"))
            mvc.perform(get(caminho)).andExpect(status().isOk()).andExpect(content().contentTypeCompatibleWith("text/html"))
                .andExpect(content().string(org.hamcrest.Matchers.containsString("fixture-paciente-web")))
                .andExpect(header().string("Cache-Control",org.hamcrest.Matchers.containsString("no-store")))
                .andExpect(header().string("Content-Security-Policy",org.hamcrest.Matchers.containsString("connect-src 'self'")));
        mvc.perform(head("/convite")).andExpect(status().isOk());
    }
    @Test void recursoEstaticoNaoAbreApiNemArquivosPrivados() throws Exception {
        mvc.perform(get("/_expo/teste.js")).andExpect(status().isOk()).andExpect(content().contentTypeCompatibleWith("text/javascript"));
        for(String caminho:List.of("/api/v1/patients/me","/api/v1/patients","/application.yml","/.env","/paciente-web/index.html"))
            mvc.perform(get(caminho)).andExpect(status().isUnauthorized())
                .andExpect(header().string("Content-Security-Policy","default-src 'none'; frame-ancestors 'none'"));
        mvc.perform(post("/convite")).andExpect(status().isUnauthorized());
        mvc.perform(get("/assets/../application.yml")).andExpect(status().isBadRequest());
    }
    @Test void excecaoDeEstilosNaoAlcancaScriptsNemApi() throws Exception {
        var resposta=mvc.perform(get("/convite")).andReturn().getResponse();
        assertThat(resposta.getHeader("Content-Security-Policy")).contains("script-src 'self';").doesNotContain("unsafe-eval");
        assertThat(resposta.getHeader("Referrer-Policy")).isEqualTo("no-referrer");
        assertThatThrownBy(()->new ConfiguracaoAplicativoWeb("production",testadores).afterPropertiesSet()).isInstanceOf(IllegalStateException.class);
    }
}
