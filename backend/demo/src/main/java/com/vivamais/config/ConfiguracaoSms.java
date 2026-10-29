package com.vivamais.config;

import tools.jackson.databind.ObjectMapper;
import com.vivamais.service.sms.*;
import java.nio.file.Path;
import org.springframework.context.annotation.*;
import org.springframework.core.env.Environment;

@Configuration
public class ConfiguracaoSms {
    @Bean public ServicoEnvioSms servicoEnvioSms(Environment ambiente,ObjectMapper json) {
        String provedor=ambiente.getProperty("sms.provedor","DESABILITADO").toUpperCase(java.util.Locale.ROOT);
        return switch(provedor) {
            case "DESABILITADO" -> new ServicoEnvioSms() {
                public String provedor(){return "DESABILITADO";}
                public boolean disponivel(){return false;}
                public Resultado enviar(Mensagem mensagem){throw new Falha("NAO_CONFIGURADO");}
            };
            case "LOCAL" -> {
                String modo=ambiente.getProperty("app.ambiente","development");
                if(!java.util.Set.of("development","test").contains(modo) || !ambiente.getProperty("sms.teste-local-habilitado",Boolean.class,false) || java.util.Arrays.stream(ambiente.getActiveProfiles()).anyMatch(p->p.equals("production")||p.equals("prod"))) throw new IllegalStateException("SMS local exige ambiente de desenvolvimento/teste e habilitação explícita.");
                yield new SmsLocalDesenvolvimento(Path.of(ambiente.getRequiredProperty("files.directory")),json);
            }
            case "TWILIO" -> {
                if(!ambiente.getProperty("sms.envio-real-autorizado",Boolean.class,false)) throw new IllegalStateException("SMS real exige autorização explícita e provedor contratado.");
                yield new EnvioSmsTwilio(ambiente.getProperty("sms.twilio.conta",""),ambiente.getProperty("sms.twilio.segredo",""),ambiente.getProperty("sms.twilio.origem",""),ambiente.getProperty("sms.twilio.servico",""),json);
            }
            default -> throw new IllegalStateException("Provedor SMS desconhecido.");
        };
    }
}
