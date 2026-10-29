package com.vivamais.service.sms;

import static org.assertj.core.api.Assertions.*;
import tools.jackson.databind.ObjectMapper;
import com.sun.net.httpserver.HttpServer;
import java.net.*;
import java.nio.charset.StandardCharsets;
import java.time.Instant;
import java.util.*;
import org.junit.jupiter.api.*;

class EnvioSmsTwilioTest {
    HttpServer servidor;
    String conta="AC"+"a".repeat(32),referencia="SM"+"b".repeat(32),destino="+55119"+"1".repeat(8);
    volatile String estado="queued",contaResposta=conta,destinoResposta=destino;
    volatile int http=201;
    volatile boolean requisicaoValida;
    EnvioSmsTwilio provedor;
    @BeforeEach void iniciar() throws Exception {
        servidor=HttpServer.create(new InetSocketAddress("127.0.0.1",0),0);
        servidor.createContext("/",requisicao->{
            String corpo=new String(requisicao.getRequestBody().readAllBytes(),StandardCharsets.UTF_8);
            requisicaoValida="POST".equals(requisicao.getRequestMethod()) && corpo.contains("Body=") && corpo.contains("0007") && requisicao.getRequestHeaders().getFirst("Authorization").startsWith("Basic ");
            if(http==0){requisicao.close();return;}
            byte[] resposta=new ObjectMapper().writeValueAsBytes(Map.of("sid",referencia,"account_sid",contaResposta,"to",destinoResposta,"status",estado));
            requisicao.sendResponseHeaders(http,resposta.length);requisicao.getResponseBody().write(resposta);requisicao.close();
        });servidor.start();
        provedor=new EnvioSmsTwilio(conta,"segredo-exclusivo-do-teste",destino,"",new ObjectMapper(),URI.create("http://127.0.0.1:"+servidor.getAddress().getPort()));
    }
    @AfterEach void fechar(){servidor.stop(0);}
    ServicoEnvioSms.Resultado enviar(){return provedor.enviar(new ServicoEnvioSms.Mensagem(UUID.randomUUID(),destino,"0007",Instant.now().plusSeconds(600)));}
    @Test void aceitaPedidoSemAfirmarEntrega(){assertThat(enviar().estado()).isEqualTo("ACEITO_PROVEDOR");assertThat(requisicaoValida).isTrue();}
    @Test void confirmaEntregaApenasPeloEstadoDoProvedor(){estado="delivered";http=200;assertThat(provedor.consultar(referencia).estado()).isEqualTo("ENTREGUE");}
    @Test void informaNaoEntrega(){estado="undelivered";assertThat(enviar().estado()).isEqualTo("NAO_ENTREGUE");}
    @Test void rejeitaContaOuDestinoDivergente(){contaResposta="AC"+"c".repeat(32);assertThatThrownBy(this::enviar).isInstanceOf(ServicoEnvioSms.Falha.class);contaResposta=conta;destinoResposta="+55119"+"2".repeat(8);assertThatThrownBy(this::enviar).isInstanceOf(ServicoEnvioSms.Falha.class);}
    @Test void falhaHttpNaoRetornaSucesso(){http=400;assertThatThrownBy(this::enviar).isInstanceOf(ServicoEnvioSms.Falha.class);}
    @Test void respostaPerdidaFicaIndeterminadaSemReenvioAutomatico(){http=0;try{enviar();fail("Deveria falhar");}catch(ServicoEnvioSms.Falha falha){assertThat(falha.estado()).isEqualTo("INDETERMINADO");}}
}
