package com.vivamais.service;
import java.net.URI;
import java.net.http.*;
import java.time.Duration;
import java.util.*;
import java.util.regex.Pattern;
import tools.jackson.databind.*;
import org.springframework.beans.factory.annotation.Value;
import org.springframework.stereotype.Component;

/** Porta opcional: só encaminha a foto para um contrato institucionalmente aprovado. */
@Component
public class ProvedorAnaliseAlimentacaoHttp implements ProvedorAnaliseAlimentacao {
 static final String CONTRATO="FOOD_EDUCATIONAL_CONTRACT_V1";
 private static final Set<String> STATUS=Set.of("ASSESSED","UNCERTAIN","REJECTED"),SEMAFOROS=Set.of("GREEN","YELLOW","RED");
 private static final Set<String> CAMPOS=Set.of("status","trafficLight","explanation","limitations","identifiedFoods","confidence","modelVersion","criteriaVersion","contractVersion");
 private static final Pattern INFERENCIA_VEDADA=Pattern.compile("(?is).*(?:\\b\\d+(?:[,.]\\d+)?\\s*(?:mg|g|kcal|calorias?)\\b|\\b(?:s[oó]dio|gordura|calorias?)\\s*(?:[:=]|é|são|of)?\\s*\\d|\\b\\d+\\s*(?:/|por)\\s*\\d+\\s*(?:mmhg)?\\b|\\bpress[aã]o(?:\\s+arterial)?\\s*(?:[:=]|é|são)\\s*\\d).*" );
 private final String endpoint,key,criteria,approval,provider,modelVersion,criteriaVersion;private final boolean enabled;private final double minimumConfidence;private final ObjectMapper json;
 private final HttpClient client=HttpClient.newBuilder().connectTimeout(Duration.ofSeconds(5)).followRedirects(HttpClient.Redirect.NEVER).build();
 public ProvedorAnaliseAlimentacaoHttp(@Value("${food.analysis-enabled:false}")boolean enabled,@Value("${food.endpoint:}")String endpoint,@Value("${food.api-key:}")String key,@Value("${food.approved-criteria:}")String criteria,@Value("${food.approval-reference:}")String approval,@Value("${food.provider-name:}")String provider,@Value("${food.model-version:}")String modelVersion,@Value("${food.criteria-version:}")String criteriaVersion,@Value("${food.minimum-confidence:0.80}")double minimumConfidence,ObjectMapper json){this.enabled=enabled;this.endpoint=endpoint;this.key=key;this.criteria=criteria;this.approval=approval;this.provider=provider;this.modelVersion=modelVersion;this.criteriaVersion=criteriaVersion;this.minimumConfidence=minimumConfidence;this.json=json;}
 @Override public boolean enabled(){return enabled&&endpoint.startsWith("https://")&&!key.isBlank()&&!criteria.isBlank()&&!approval.isBlank()&&!provider.isBlank()&&!modelVersion.isBlank()&&!criteriaVersion.isBlank()&&minimumConfidence>0&&minimumConfidence<=1;}
 @Override public Contexto contexto(){return new Contexto(provider,modelVersion,criteriaVersion,approval,CONTRATO);}
 @Override public Map<String,Object> assess(byte[] image)throws Exception{
  if(!enabled())throw CuidadoService.error(503,"Análise automatizada indisponível.");
  String payload=json.writeValueAsString(Map.of("contractVersion",CONTRATO,"imageBase64",Base64.getEncoder().encodeToString(image),"mimeType","image/png","criteria",criteria,"modelVersion",modelVersion,"criteriaVersion",criteriaVersion,"approvalReference",approval,"restrictions",List.of("educational-only","no-diagnosis","no-nutrient-quantity","no-blood-pressure-inference","reject-inadequate-image","explain-uncertainty","no-training")));
  var requisicao=HttpRequest.newBuilder(URI.create(endpoint)).timeout(Duration.ofSeconds(15)).header("Authorization","Bearer "+key).header("Content-Type","application/json").header("Accept","application/json").header("Cache-Control","no-store").header("X-Viva-Data-Policy","no-training").header("X-Viva-Patient-Content","private").POST(HttpRequest.BodyPublishers.ofString(payload)).build();
  var resposta=client.send(requisicao,HttpResponse.BodyHandlers.ofInputStream());byte[] bytes;try(var body=resposta.body()){bytes=body.readNBytes(16385);}
  if(resposta.statusCode()!=200||bytes.length>16384||!"no-training".equals(resposta.headers().firstValue("X-Viva-Data-Policy").orElse("")))throw CuidadoService.error(503,"Análise automatizada indisponível.");
  return validarResposta(json,bytes,contexto(),minimumConfidence);
 }
 static Map<String,Object> validarResposta(ObjectMapper json,byte[] bytes,Contexto contexto,double minimumConfidence)throws Exception{
  JsonNode data=json.readTree(bytes);if(data==null||!data.isObject())throw CuidadoService.error(503,"Resposta educativa inválida.");
  var nomes=data.propertyNames().iterator();while(nomes.hasNext())if(!CAMPOS.contains(nomes.next()))throw CuidadoService.error(503,"Resposta educativa inválida.");
  String status=texto(data,"status",30),contrato=texto(data,"contractVersion",120),criterios=texto(data,"criteriaVersion",120),modelo=texto(data,"modelVersion",120),explicacao=texto(data,"explanation",2000),limitacoes=texto(data,"limitations",2000);
  if(!STATUS.contains(status)||!CONTRATO.equals(contrato)||!contexto.versaoModelo().equals(modelo)||!contexto.versaoCriterios().equals(criterios)||!data.path("confidence").isNumber())throw CuidadoService.error(503,"Resposta educativa inválida.");
  double confianca=data.path("confidence").asDouble();if(!Double.isFinite(confianca)||confianca<minimumConfidence||confianca>1||INFERENCIA_VEDADA.matcher(explicacao+" "+limitacoes).matches())throw CuidadoService.error(503,"Resposta requer revisão profissional.");
  JsonNode alimentos=data.path("identifiedFoods");if(!alimentos.isArray()||alimentos.size()>30)throw CuidadoService.error(503,"Resposta educativa inválida.");
  List<String> identificados=new ArrayList<>();for(JsonNode alimento:alimentos){if(!alimento.isTextual())throw CuidadoService.error(503,"Resposta educativa inválida.");String valor=alimento.asText().trim();if(valor.isEmpty()||valor.length()>160||INFERENCIA_VEDADA.matcher(valor).matches())throw CuidadoService.error(503,"Resposta requer revisão profissional.");identificados.add(valor);}
  String semaforo=null;if(status.equals("ASSESSED")){semaforo=texto(data,"trafficLight",10);if(!SEMAFOROS.contains(semaforo))throw CuidadoService.error(503,"Resposta educativa inválida.");}else if(!data.path("trafficLight").isMissingNode()&&!data.path("trafficLight").isNull())throw CuidadoService.error(503,"Resposta educativa inválida.");
  Map<String,Object> resultado=new LinkedHashMap<>();resultado.put("status",status);resultado.put("trafficLight",semaforo);resultado.put("explanation",explicacao);resultado.put("limitations",limitacoes);resultado.put("identifiedFoods",identificados);resultado.put("confidence",confianca);resultado.put("modelVersion",modelo);resultado.put("criteriaVersion",criterios);resultado.put("contractVersion",contrato);resultado.put("provider",contexto.provedor());resultado.put("approvalReference",contexto.referenciaAprovacao());resultado.put("providerCalled",true);resultado.put("educationalOnly",true);resultado.put("professionalReviewRecommended",true);return resultado;
 }
 private static String texto(JsonNode dados,String campo,int limite){JsonNode valor=dados.path(campo);if(!valor.isTextual())throw CuidadoService.error(503,"Resposta educativa inválida.");String texto=valor.asText().trim();if(texto.isEmpty()||texto.length()>limite||texto.chars().anyMatch(Character::isISOControl))throw CuidadoService.error(503,"Resposta educativa inválida.");return texto;}
}
