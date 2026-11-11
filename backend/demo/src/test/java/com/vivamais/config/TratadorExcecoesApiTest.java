package com.vivamais.config;

import static org.assertj.core.api.Assertions.*;
import ch.qos.logback.classic.Logger;
import ch.qos.logback.classic.spi.ILoggingEvent;
import ch.qos.logback.core.read.ListAppender;
import org.junit.jupiter.api.Test;
import org.slf4j.LoggerFactory;

class TratadorExcecoesApiTest {
    @Test void diagnosticoIdentificaCodigoSemExporMensagemDaExcecao() {
        var registrador=(Logger)LoggerFactory.getLogger(TratadorExcecoesApi.class);
        var captura=new ListAppender<ILoggingEvent>();
        captura.start(); registrador.addAppender(captura);
        try {
            var falha=new IllegalArgumentException("senha=valor-privado token=outro-valor corpo=privado");
            falha.setStackTrace(new StackTraceElement[]{
                new StackTraceElement("java.net.http.Requisicao","cabecalho","Requisicao.java",12),
                new StackTraceElement("com.vivamais.service.ArmazenamentoArquivos","requisicao","ArmazenamentoArquivos.java",42)});
            var resposta=new TratadorExcecoesApi().unexpected(falha);
            assertThat(resposta.getStatus()).isEqualTo(500);
            assertThat(resposta.getDetail()).isEqualTo("Serviço temporariamente indisponível.");
            assertThat(captura.list).hasSize(1);
            assertThat(captura.list.getFirst().getFormattedMessage())
                .contains("IllegalArgumentException","ArmazenamentoArquivos.requisicao:42")
                .doesNotContain("valor-privado","outro-valor","corpo=", "senha=", "token=");
            assertThat(captura.list.getFirst().getThrowableProxy()).isNull();
        } finally { registrador.detachAppender(captura); captura.stop(); }
    }
}
