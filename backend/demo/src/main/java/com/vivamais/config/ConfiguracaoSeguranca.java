package com.vivamais.config;
import com.vivamais.config.*;
import com.vivamais.controller.*;
import com.vivamais.dto.*;
import com.vivamais.repositories.*;
import com.vivamais.security.*;
import com.vivamais.service.*;
import com.vivamais.model.*;

import tools.jackson.databind.ObjectMapper;
import java.util.List;
import jakarta.servlet.http.HttpServletResponse;
import java.io.IOException;
import org.springframework.context.annotation.Bean;
import org.springframework.context.annotation.Configuration;
import org.springframework.http.HttpMethod;
import org.springframework.http.ProblemDetail;
import org.springframework.security.config.annotation.method.configuration.EnableMethodSecurity;
import org.springframework.security.config.annotation.web.builders.HttpSecurity;
import org.springframework.security.config.http.SessionCreationPolicy;
import org.springframework.security.crypto.bcrypt.BCryptPasswordEncoder;
import org.springframework.security.crypto.password.PasswordEncoder;
import org.springframework.security.web.SecurityFilterChain;
import org.springframework.security.web.authentication.UsernamePasswordAuthenticationFilter;
import org.springframework.web.cors.CorsConfiguration;
import org.springframework.web.cors.CorsConfigurationSource;
import org.springframework.web.cors.UrlBasedCorsConfigurationSource;

@Configuration
@EnableMethodSecurity
public class ConfiguracaoSeguranca {
    @Bean PasswordEncoder passwordEncoder() { return new BCryptPasswordEncoder(12); }
    @Bean
    SecurityFilterChain securityFilterChain(HttpSecurity http, InstituicaoRepository repositorio, CodificadorToken codificadorTokens,
                                            ObjectMapper mapper, @org.springframework.beans.factory.annotation.Qualifier("corsConfigurationSource") CorsConfigurationSource cors) throws Exception {
        return http.cors(config -> config.configurationSource(cors))
                // Recursos clínicos usam Bearer. Cookie de aparelho só é aceito no controller específico, com Origin obrigatório.
                .csrf(config -> config.disable())
                .sessionManagement(config -> config.sessionCreationPolicy(SessionCreationPolicy.STATELESS))
                .requestCache(config -> config.disable())
                .httpBasic(config -> config.disable()).formLogin(config -> config.disable()).logout(config -> config.disable())
                .authorizeHttpRequests(config -> config
                        .requestMatchers(HttpMethod.POST, "/api/v1/auth/login", "/api/v1/auth/paciente/iniciar", "/api/v1/auth/paciente/verificar", "/api/v1/auth/paciente/renovar").permitAll()
                        .requestMatchers(HttpMethod.GET, "/api/v1/files/*/content").permitAll()
                        .requestMatchers(HttpMethod.GET, "/actuator/health", "/actuator/health/liveness", "/actuator/health/readiness").permitAll()
                        .anyRequest().authenticated())
                .exceptionHandling(config -> config
                        .authenticationEntryPoint((requisicao, resposta, exception) -> writeProblem(resposta,mapper,401,"Não autenticado","Informe uma sessão válida."))
                        .accessDeniedHandler((requisicao, resposta, exception) -> writeProblem(resposta,mapper,403,"Acesso negado","Você não possui permissão para este recurso.")))
                .headers(config -> config.contentSecurityPolicy(policy -> policy.policyDirectives("default-src 'none'; frame-ancestors 'none'")))
                .addFilterBefore(new FiltroTokenAcesso(repositorio,codificadorTokens), UsernamePasswordAuthenticationFilter.class)
                .addFilterBefore(new FiltroLimiteRequisicao(mapper), FiltroTokenAcesso.class)
                .build();
    }
    @Bean
    CorsConfigurationSource corsConfigurationSource(PropriedadesAplicacao propriedades) {
        CorsConfiguration config=new CorsConfiguration();
        config.setAllowedOrigins(propriedades.corsOrigins());
        config.setAllowedMethods(List.of("GET","POST","PUT","OPTIONS"));
        config.setAllowedHeaders(List.of("Authorization","Content-Type"));
        config.setAllowCredentials(false); config.setMaxAge(600L);
        UrlBasedCorsConfigurationSource source=new UrlBasedCorsConfigurationSource();
        CorsConfiguration paciente=new CorsConfiguration(config);paciente.setAllowCredentials(true);
        source.registerCorsConfiguration("/api/v1/auth/paciente/**",paciente);
        source.registerCorsConfiguration("/**",config);
        return source;
    }
    private static void writeProblem(HttpServletResponse resposta, ObjectMapper mapper,int status,String title,String detail) throws IOException {
        ProblemDetail problem=ProblemDetail.forStatus(status); problem.setTitle(title); problem.setDetail(detail);
        resposta.setStatus(status); resposta.setContentType("application/problem+json"); mapper.writeValue(resposta.getOutputStream(),problem);
    }
}
