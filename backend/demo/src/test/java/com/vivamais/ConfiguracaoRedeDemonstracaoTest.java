package com.vivamais;

import static org.assertj.core.api.Assertions.*;
import com.vivamais.config.*;
import java.time.Duration;
import java.util.List;
import java.util.UUID;
import java.util.concurrent.atomic.AtomicBoolean;
import org.junit.jupiter.api.Test;
import org.springframework.mock.env.MockEnvironment;
import org.springframework.mock.web.MockHttpServletRequest;
import org.springframework.mock.web.MockHttpServletResponse;

class ConfiguracaoRedeDemonstracaoTest {
    ConfiguracaoAcessoDemonstracao demonstracao(boolean habilitada,String ambiente) {
        return new ConfiguracaoAcessoDemonstracao(habilitada,UUID.randomUUID().toString(),ambiente,"127.0.0.1",
            new PropriedadesAplicacao(true,List.of(),Duration.ofMinutes(30),""),new MockEnvironment());
    }
    ConfiguracaoRedeDemonstracao rede() {
        return new ConfiguracaoRedeDemonstracao(demonstracao(true,"development"),"192.168.0.8","192.168.0.5");
    }
    MockHttpServletRequest requisicao() {
        var requisicao=new MockHttpServletRequest("GET","/api/v1/auth/me");
        requisicao.setLocalPort(8083); requisicao.setLocalAddr("192.168.0.8");
        requisicao.setServerName("192.168.0.8"); requisicao.setRemoteAddr("192.168.0.5");
        return requisicao;
    }
    @Test void aceitaSomenteIpv4PrivadoLiteral() {
        for(String valido:List.of("10.1.2.3","172.16.0.1","172.31.255.254","192.168.0.8"))
            assertThat(ConfiguracaoRedeDemonstracao.ipv4Privado(valido)).isTrue();
        for(String invalido:List.of("0.0.0.0","127.0.0.1","::1","localhost","8.8.8.8","169.254.1.1","172.32.1.1","192.168.256.1","192.168.00.5","192.168.1.5.evil.invalid"))
            assertThat(ConfiguracaoRedeDemonstracao.ipv4Privado(invalido)).isFalse();
    }
    @Test void exigeOptInCompletoSemAfetarModoLoopback() {
        assertThatCode(()->new ConfiguracaoRedeDemonstracao(demonstracao(false,"development"),"","").afterPropertiesSet()).doesNotThrowAnyException();
        assertThatCode(()->rede().afterPropertiesSet()).doesNotThrowAnyException();
        for(String celular:List.of("","8.8.8.8","192.168.0.8"))
            assertThatThrownBy(()->new ConfiguracaoRedeDemonstracao(demonstracao(true,"development"),"192.168.0.8",celular).afterPropertiesSet()).isInstanceOf(IllegalStateException.class);
        assertThatThrownBy(()->new ConfiguracaoRedeDemonstracao(demonstracao(false,"development"),"192.168.0.8","192.168.0.5").afterPropertiesSet()).isInstanceOf(IllegalStateException.class);
    }
    @Test void recusaDistribuicaoMesmoComEnderecosPrivados() {
        for(String ambiente:List.of("production","preview"))
            assertThatThrownBy(()->new ConfiguracaoRedeDemonstracao(demonstracao(true,ambiente),"192.168.0.8","192.168.0.5").afterPropertiesSet()).isInstanceOf(IllegalStateException.class);
    }
    @Test void validaAparelhoInterfaceHostPortaECanalNativo() {
        assertThat(rede().permite(requisicao())).isTrue();
        for(String cabecalho:List.of("Origin","Sec-Fetch-Site","Forwarded","X-Forwarded-For","x-forwarded-host","X-Forwarded-Proto")) {
            var requisicao=requisicao(); requisicao.addHeader(cabecalho,"teste");
            assertThat(rede().permite(requisicao)).isFalse();
        }
        var requisicao=requisicao(); requisicao.setRemoteAddr("192.168.0.6"); assertThat(rede().permite(requisicao)).isFalse();
        requisicao=requisicao(); requisicao.setServerName("evil.invalid"); assertThat(rede().permite(requisicao)).isFalse();
        requisicao=requisicao(); requisicao.setLocalAddr("127.0.0.1"); assertThat(rede().permite(requisicao)).isFalse();
        requisicao=requisicao(); requisicao.setLocalPort(8080); assertThat(rede().permite(requisicao)).isFalse();
    }
    @Test void filtroBloqueiaOutrosAparelhosELoginProfissionalSemAlterarLoopback() throws Exception {
        var filtro=rede().filtroRedeDemonstracao().getFilter();
        var passou=new AtomicBoolean(); var resposta=new MockHttpServletResponse();
        filtro.doFilter(requisicao(),resposta,(entrada,saida)->passou.set(true));
        assertThat(passou).isTrue();
        var estranha=requisicao(); estranha.setRemoteAddr("192.168.0.6"); passou.set(false); resposta=new MockHttpServletResponse();
        filtro.doFilter(estranha,resposta,(entrada,saida)->passou.set(true));
        assertThat(passou).isFalse(); assertThat(resposta.getStatus()).isEqualTo(403);
        var profissional=requisicao(); profissional.setRequestURI("/api/v1/auth/login"); resposta=new MockHttpServletResponse();
        filtro.doFilter(profissional,resposta,(entrada,saida)->passou.set(true));
        assertThat(resposta.getStatus()).isEqualTo(403);
        var local=requisicao(); local.setLocalPort(8080); local.setRemoteAddr("127.0.0.1");
        filtro.doFilter(local,new MockHttpServletResponse(),(entrada,saida)->passou.set(true));
        assertThat(passou).isTrue();
    }
    @Test void navegadorDoCelularPodeApenasConferirSaudeSemLiberarLoginNativo() {
        var requisicao=requisicao(); requisicao.setRequestURI("/actuator/health");
        requisicao.addHeader("Sec-Fetch-Site","none");
        assertThat(rede().permite(requisicao)).isTrue();
        requisicao.setRequestURI("/api/v1/auth/paciente/demonstracao");
        assertThat(rede().permite(requisicao)).isFalse();
    }
}
