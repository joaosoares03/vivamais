package com.vivamais.config;

import java.util.List;
import java.util.Set;
import org.springframework.beans.factory.InitializingBean;
import org.springframework.beans.factory.annotation.Value;
import org.springframework.boot.autoconfigure.condition.ConditionalOnProperty;
import org.springframework.context.annotation.Bean;
import org.springframework.context.annotation.Configuration;
import org.springframework.core.annotation.Order;
import org.springframework.core.io.ClassPathResource;
import org.springframework.core.io.Resource;
import org.springframework.http.CacheControl;
import org.springframework.security.config.annotation.web.builders.HttpSecurity;
import org.springframework.security.config.http.SessionCreationPolicy;
import org.springframework.security.web.SecurityFilterChain;
import org.springframework.web.servlet.config.annotation.ResourceHandlerRegistry;
import org.springframework.web.servlet.config.annotation.WebMvcConfigurer;
import org.springframework.web.servlet.resource.PathResourceResolver;
import org.springframework.web.util.UrlPathHelper;
import jakarta.servlet.http.HttpServletRequest;

/** Exportação Expo pública, sem dados de paciente, servida na mesma origem dos cookies da API. */
@Configuration
@ConditionalOnProperty(name="app.web-paciente", havingValue="true")
public class ConfiguracaoAplicativoWeb implements WebMvcConfigurer, InitializingBean {
    static final String[] PAGINAS = {"/", "/index.html", "/acesso", "/convite", "/inicio", "/home",
        "/login", "/cadastro", "/ativar-conta", "/activate", "/perfil", "/profile", "/configuracoes",
        "/lembretes", "/mensagens", "/consultas", "/history", "/historico", "/medicamentos",
        "/pressao", "/pressao/resultado", "/pressao/historico", "/pressao/foto", "/pressao/digitar",
        "/alimentacao", "/alimentacao/resultado", "/atividade-fisica", "/atividade-fisica/atividade-hoje",
        "/atividade-fisica/alternativa", "/atividade-fisica/como-esta-hoje", "/atividade-fisica/video",
        "/atividade-fisica/verificacao-pressao", "/atividade-fisica/suas-informacoes", "/atividade-fisica/registro",
        "/atividade-fisica/passo-a-passo", "/atividade-fisica/orientacoes", "/atividade-fisica/ilustracoes",
        "/atividade-fisica/historico"};
    private static final Set<String> CAMINHOS = Set.copyOf(List.of(PAGINAS));
    private final String ambiente;
    private final ConfiguracaoTestadores testadores;
    public ConfiguracaoAplicativoWeb(@Value("${app.ambiente:development}") String ambiente, ConfiguracaoTestadores testadores) {
        this.ambiente=ambiente; this.testadores=testadores;
    }
    @Override public void afterPropertiesSet() {
        if (!ambiente.equals("preview") || !testadores.habilitado())
            throw new IllegalStateException("Aplicativo web hospedado exige homologação sintética por convite.");
        if (!new ClassPathResource("paciente-web/index.html").exists())
            throw new IllegalStateException("A exportação Expo web não está incluída nesta imagem.");
    }
    static boolean pagina(String caminho) {
        String semBarra = caminho.length()>1 && caminho.endsWith("/") ? caminho.substring(0,caminho.length()-1) : caminho;
        return CAMINHOS.contains(semBarra) || semBarra.matches("/module/[a-zA-Z0-9_-]+");
    }
    static boolean recursoPublico(HttpServletRequest requisicao) {
        if (!Set.of("GET","HEAD").contains(requisicao.getMethod())) return false;
        String caminho=UrlPathHelper.defaultInstance.getPathWithinApplication(requisicao);
        return pagina(caminho) || caminho.startsWith("/assets/") || caminho.startsWith("/_expo/") || caminho.equals("/favicon.ico");
    }
    @Bean @Order(1)
    SecurityFilterChain segurancaAplicativoWeb(HttpSecurity http) throws Exception {
        return http.securityMatcher(ConfiguracaoAplicativoWeb::recursoPublico)
            .authorizeHttpRequests(config->config.anyRequest().permitAll())
            .csrf(config->config.disable()).requestCache(config->config.disable())
            .sessionManagement(config->config.sessionCreationPolicy(SessionCreationPolicy.STATELESS))
            .httpBasic(config->config.disable()).formLogin(config->config.disable()).logout(config->config.disable())
            // React Native Web gera estilos durante a execução. A exceção vale somente para o aplicativo estático.
            .headers(config->config
                .contentSecurityPolicy(csp->csp.policyDirectives("default-src 'self'; script-src 'self'; style-src 'self' 'unsafe-inline'; img-src 'self' data: blob:; font-src 'self' data:; media-src 'self' blob:; connect-src 'self'; object-src 'none'; base-uri 'none'; form-action 'self'; frame-ancestors 'none'"))
                .referrerPolicy(ref->ref.policy(org.springframework.security.web.header.writers.ReferrerPolicyHeaderWriter.ReferrerPolicy.NO_REFERRER)))
            .build();
    }
    @Override public void addResourceHandlers(ResourceHandlerRegistry registro) {
        var paginas = new java.util.ArrayList<>(List.of(PAGINAS));
        for(String caminho:PAGINAS) if(!caminho.endsWith("/")) paginas.add(caminho+"/");
        paginas.add("/module/*"); paginas.add("/module/*/");
        registro.addResourceHandler(paginas.toArray(String[]::new)).addResourceLocations("classpath:/paciente-web/")
            .setCacheControl(CacheControl.noStore()).resourceChain(false).addResolver(new PathResourceResolver() {
                @Override protected Resource getResource(String caminho,Resource local) {
                    return new ClassPathResource("paciente-web/index.html");
                }
            });
        for(String pasta:List.of("assets","_expo"))
            registro.addResourceHandler("/"+pasta+"/**").addResourceLocations("classpath:/paciente-web/"+pasta+"/").setCacheControl(CacheControl.noStore());
        registro.addResourceHandler("/favicon.ico").addResourceLocations("classpath:/paciente-web/").setCacheControl(CacheControl.noStore());
    }
}
