package com.vivamais.service;
import static org.assertj.core.api.Assertions.*;
import java.io.InputStream;
import tools.jackson.databind.*;
import org.junit.jupiter.api.Test;
import org.junit.jupiter.params.ParameterizedTest;
import org.junit.jupiter.params.provider.ValueSource;

class ArquivoPrivadoServiceOcrTest {
 private final ObjectMapper json=new ObjectMapper();
 @Test void corpusSinteticoExigeRevisaoOuBloqueiaSemExporValores()throws Exception{
  try(InputStream arquivo=getClass().getResourceAsStream("/ocr/corpus-sintetico-v1.json")){
   assertThat(arquivo).isNotNull();JsonNode corpus=json.readTree(arquivo);assertThat(corpus.path("license").asText()).isEqualTo("synthetic-approved-no-patient-data");
   for(JsonNode caso:corpus.path("cases")){
    ArquivoPrivadoService.AvaliacaoOcr atual=caso.has("text")?ArquivoPrivadoService.avaliarOcr(new ProvedorOcr.Resultado(caso.path("text").asText(),caso.path("confidence").asDouble(),"tesseract-eng-psm6"),0.85):ArquivoPrivadoService.indisponivelOcr(caso.path("expectedReason").asText());
    assertThat(atual.status()).as(caso.path("id").asText()).isEqualTo(caso.path("expectedStatus").asText());assertThat(atual.motivo()).isEqualTo(caso.path("expectedReason").asText());
    if(!"RECOGNIZED".equals(atual.status()))assertThat(atual.sistolica()).isNull();
   }
  }
 }
 @Test void resultadoLegivelNuncaDispensaConfirmacaoHumana(){
  var resultado=ArquivoPrivadoService.avaliarOcr(new ProvedorOcr.Resultado("SYS 121 DIA 79 PULSE 70",0.98,"tesseract-eng-psm6"),0.85);
  assertThat(resultado.status()).isEqualTo("RECOGNIZED");assertThat(resultado.motivo()).isEqualTo("HUMAN_CONFIRMATION_REQUIRED");
 }
 @ParameterizedTest
 @ValueSource(strings={"SYS 1180 DIA 76", "SYS -118 DIA 76", "SYS 118.5 DIA 76", "SYS 118 DIA 76 PULSE -71", "SYS 118 DIA 76 SYS 188 DIA 106", "SYS 118 DIA 76 PULSE 71 PULSE 190", "118 76\n188 106", "SYS 118\n118/76", "SYS \u2212118 DIA 76", "SYS 118 PULSE\nDIA 76"})
 void textoMalformadoOuComMaisDeUmaLeituraNaoPodeVirarSugestao(String texto){
  var resultado=ArquivoPrivadoService.avaliarOcr(new ProvedorOcr.Resultado(texto,0.99,"sintetico"),0.85);
  assertThat(resultado.status()).isEqualTo("UNREADABLE");
  assertThat(resultado.sistolica()).isNull();assertThat(resultado.diastolica()).isNull();assertThat(resultado.pulso()).isNull();
 }
 @ParameterizedTest
 @ValueSource(doubles={Double.NaN,Double.POSITIVE_INFINITY,-0.1,1.1})
 void confiancaInvalidaNaoVaiParaPersistenciaOuResposta(double confianca){
  var resultado=ArquivoPrivadoService.avaliarOcr(new ProvedorOcr.Resultado("SYS 118 DIA 76",confianca,"sintetico"),0.85);
  assertThat(resultado.status()).isEqualTo("UNREADABLE");assertThat(resultado.confianca()).isNull();
 }
 @ParameterizedTest
 @ValueSource(doubles={0,-0.1,Double.NaN,Double.POSITIVE_INFINITY,1.1})
 void configuracaoNaoPodeDesativarFiltroDeConfianca(double minimo){
  assertThatThrownBy(()->new ArquivoPrivadoService(null,null,null,null,null,null,null,minimo)).isInstanceOf(IllegalArgumentException.class);
 }
 @ParameterizedTest
 @ValueSource(strings={"SYS 118 DIA 76 PULSE 71", "118/76 71", "118\n76\n71", "SYS mmHg 118 DIA mmHg 76 PULSE 71"})
 void formatoLegivelCompletoContinuaExigindoConfirmacao(String texto){
  var resultado=ArquivoPrivadoService.avaliarOcr(new ProvedorOcr.Resultado(texto,0.99,"sintetico"),0.85);
  assertThat(resultado.status()).isEqualTo("RECOGNIZED");assertThat(resultado.sistolica()).isEqualTo(118);assertThat(resultado.diastolica()).isEqualTo(76);assertThat(resultado.pulso()).isEqualTo(71);
  assertThat(resultado.motivo()).isEqualTo("HUMAN_CONFIRMATION_REQUIRED");
 }
}
