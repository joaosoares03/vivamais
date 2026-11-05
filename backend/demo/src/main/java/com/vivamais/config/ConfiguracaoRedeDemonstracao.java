package com.vivamais.config;

import jakarta.servlet.FilterChain;
import jakarta.servlet.ServletException;
import jakarta.servlet.http.HttpServletRequest;
import jakarta.servlet.http.HttpServletResponse;
import java.io.IOException;
import java.util.Collections;
import org.apache.catalina.connector.Connector;
import org.springframework.beans.factory.InitializingBean;
import org.springframework.beans.factory.annotation.Value;
import org.springframework.boot.tomcat.servlet.TomcatServletWebServerFactory;
import org.springframework.boot.web.server.WebServerFactoryCustomizer;
import org.springframework.boot.web.servlet.FilterRegistrationBean;
import org.springframework.context.annotation.Bean;
import org.springframework.context.annotation.Configuration;
import org.springframework.core.Ordered;
import org.springframework.web.filter.OncePerRequestFilter;

/** Conector opcional para um único celular na LAN sintética; o conector principal permanece loopback. */
@Configuration(proxyBeanMethods=false)
public class ConfiguracaoRedeDemonstracao implements InitializingBean {
    public static final int PORTA=8083;
    private final ConfiguracaoAcessoDemonstracao demonstracao;
    private final String computador;
    private final String celular;
    public ConfiguracaoRedeDemonstracao(ConfiguracaoAcessoDemonstracao demonstracao,
            @Value("${patient-auth.rede-demonstracao-computador:}") String computador,
            @Value("${patient-auth.rede-demonstracao-celular:}") String celular) {
        this.demonstracao=demonstracao; this.computador=computador; this.celular=celular;
    }
    public boolean habilitada() { return !computador.isBlank() || !celular.isBlank(); }
    public static boolean ipv4Privado(String endereco) {
        if(endereco==null || !endereco.matches("(?:0|[1-9][0-9]{0,2})(?:\\.(?:0|[1-9][0-9]{0,2})){3}")) return false;
        String[] partes=endereco.split("\\.");
        int[] numeros=java.util.Arrays.stream(partes).mapToInt(Integer::parseInt).toArray();
        for(int numero:numeros) if(numero>255) return false;
        return numeros[0]==10 || (numeros[0]==172 && numeros[1]>=16 && numeros[1]<=31) ||
            (numeros[0]==192 && numeros[1]==168);
    }
    @Override public void afterPropertiesSet() {
        if(!habilitada()) return;
        demonstracao.afterPropertiesSet();
        if(!demonstracao.habilitado() || !ipv4Privado(computador) || !ipv4Privado(celular) || computador.equals(celular))
            throw new IllegalStateException("Rede de testes exige demonstração sintética e IPv4 privados distintos do computador e do celular. Não usar wildcard, hostname, proxy ou endereço público.");
    }
    public boolean permite(HttpServletRequest requisicao) {
        boolean consultaSaude="GET".equals(requisicao.getMethod()) &&
            java.util.Set.of("/actuator/health",com.vivamais.controller.InstalacaoDemonstracaoController.ROTA).contains(requisicao.getRequestURI());
        return habilitada() && demonstracao.habilitado() && requisicao.getLocalPort()==PORTA &&
            computador.equals(requisicao.getLocalAddr()) && computador.equals(requisicao.getServerName()) &&
            celular.equals(requisicao.getRemoteAddr()) && requisicao.getHeader("Origin")==null &&
            (consultaSaude || requisicao.getHeader("Sec-Fetch-Site")==null) &&
            Collections.list(requisicao.getHeaderNames()).stream().noneMatch(nome ->
                nome.equalsIgnoreCase("Forwarded") || nome.regionMatches(true,0,"X-Forwarded-",0,12));
    }
    @Bean WebServerFactoryCustomizer<TomcatServletWebServerFactory> conectorRedeDemonstracao() {
        return fabrica -> {
            if(!habilitada()) return;
            afterPropertiesSet();
            var conector=new Connector(TomcatServletWebServerFactory.DEFAULT_PROTOCOL);
            conector.setPort(PORTA);
            conector.setProperty("address",computador);
            fabrica.addAdditionalConnectors(conector);
        };
    }
    @Bean public FilterRegistrationBean<OncePerRequestFilter> filtroRedeDemonstracao() {
        var filtro=new OncePerRequestFilter() {
            @Override protected void doFilterInternal(HttpServletRequest requisicao,HttpServletResponse resposta,FilterChain cadeia)
                    throws ServletException,IOException {
                if(requisicao.getLocalPort()==PORTA && (!permite(requisicao) ||
                        requisicao.getRequestURI().equals("/api/v1/auth/login"))) {
                    resposta.setHeader("Cache-Control","no-store");
                    resposta.setStatus(403);
                    resposta.setCharacterEncoding("UTF-8");
                    resposta.setContentType("application/json");
                    resposta.getWriter().write("{\"message\":\"Conexão de teste não autorizada.\"}");
                    return;
                }
                cadeia.doFilter(requisicao,resposta);
            }
        };
        var registro=new FilterRegistrationBean<OncePerRequestFilter>(filtro);
        registro.setOrder(Ordered.HIGHEST_PRECEDENCE);
        return registro;
    }
}
