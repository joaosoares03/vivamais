package com.vivamais.service.sms;

import tools.jackson.databind.*;
import java.net.*;
import java.net.http.*;
import java.nio.charset.StandardCharsets;
import java.time.Duration;
import java.util.*;

public final class EnvioSmsTwilio implements ServicoEnvioSms {
    private final HttpClient cliente=HttpClient.newBuilder().connectTimeout(Duration.ofSeconds(3)).followRedirects(HttpClient.Redirect.NEVER).build();
    private final URI base;
    private final String conta,autorizacao,origem,servico;
    private final ObjectMapper json;
    public EnvioSmsTwilio(String conta,String segredo,String origem,String servico,ObjectMapper json) {
        this(conta,segredo,origem,servico,json,URI.create("https://api.twilio.com"));
    }
    // Endpoint alternativo só é acessível aos testes do mesmo pacote, sem variável de ambiente.
    EnvioSmsTwilio(String conta,String segredo,String origem,String servico,ObjectMapper json,URI base) {
        if(!conta.matches("AC[0-9a-fA-F]{32}") || segredo.isBlank() ||
            (!servico.matches("MG[0-9a-fA-F]{32}") && !origem.matches("\\+[1-9][0-9]{7,14}"))) throw new IllegalStateException("Configuração Twilio incompleta.");
        this.conta=conta;this.origem=origem;this.servico=servico;this.json=json;this.base=base;
        autorizacao="Basic "+Base64.getEncoder().encodeToString((conta+":"+segredo).getBytes(StandardCharsets.UTF_8));
    }
    @Override public String provedor() { return "TWILIO"; }
    private URI endereco(String sufixo) { return base.resolve("/2010-04-01/Accounts/"+conta+"/Messages"+sufixo+".json"); }
    private JsonNode executar(HttpRequest requisicao,int esperado) {
        try {
            var resposta=cliente.send(requisicao,HttpResponse.BodyHandlers.ofInputStream());
            try(var corpo=resposta.body()) {
                if(resposta.statusCode()!=esperado) throw new Falha(resposta.statusCode()>=500?"INDETERMINADO":"FALHA");
                byte[] bytes=corpo.readNBytes(16385);if(bytes.length>16384) throw new Falha("INDETERMINADO");
                return json.readTree(bytes);
            }
        } catch(Falha conhecida) { throw conhecida; }
        catch(InterruptedException interrupcao) { Thread.currentThread().interrupt();throw new Falha("INDETERMINADO"); }
        catch(Exception erro) { throw new Falha("INDETERMINADO"); }
    }
    private Resultado resultado(JsonNode dados) {
        String referencia=dados.path("sid").asText();
        if(!referencia.matches("SM[0-9a-fA-F]{32}") || !conta.equals(dados.path("account_sid").asText())) throw new Falha("INDETERMINADO");
        String estado=switch(dados.path("status").asText()) {
            case "accepted","queued","sending","sent" -> "ACEITO_PROVEDOR";
            case "delivered" -> "ENTREGUE";
            case "failed","undelivered","canceled" -> "NAO_ENTREGUE";
            default -> "INDETERMINADO";
        };
        return new Resultado(estado,referencia);
    }
    @Override public Resultado enviar(Mensagem mensagem) {
        Map<String,String> campos=new LinkedHashMap<>();campos.put("To",mensagem.destino());
        campos.put("Body","Viva+: seu codigo de ativacao e "+mensagem.codigo()+". Valido por 10 minutos. Nao compartilhe. Se nao solicitou, procure sua equipe.");
        if(!servico.isBlank())campos.put("MessagingServiceSid",servico);else campos.put("From",origem);
        String formulario=campos.entrySet().stream().map(e->URLEncoder.encode(e.getKey(),StandardCharsets.UTF_8)+"="+URLEncoder.encode(e.getValue(),StandardCharsets.UTF_8)).collect(java.util.stream.Collectors.joining("&"));
        var requisicao=HttpRequest.newBuilder(endereco("")).timeout(Duration.ofSeconds(5)).header("Authorization",autorizacao).header("Content-Type","application/x-www-form-urlencoded").POST(HttpRequest.BodyPublishers.ofString(formulario)).build();
        var dados=executar(requisicao,201);
        if(!mensagem.destino().equals(dados.path("to").asText())) throw new Falha("INDETERMINADO");
        return resultado(dados);
    }
    @Override public Resultado consultar(String referencia) {
        if(referencia==null || !referencia.matches("SM[0-9a-fA-F]{32}")) throw new Falha("INDETERMINADO");
        var dados=executar(HttpRequest.newBuilder(endereco("/"+referencia)).timeout(Duration.ofSeconds(5)).header("Authorization",autorizacao).GET().build(),200);
        if(!referencia.equals(dados.path("sid").asText())) throw new Falha("INDETERMINADO");
        return resultado(dados);
    }
}
