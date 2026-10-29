package com.vivamais.service;
import static org.assertj.core.api.Assertions.*;
import java.io.InputStream;
import tools.jackson.databind.*;
import org.junit.jupiter.api.Test;

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
}
