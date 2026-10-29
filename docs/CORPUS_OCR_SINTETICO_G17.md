# Corpus sintético e critérios técnicos — G17 OCR

Versão do corpus: `ocr-synthetic-v1` · critérios: `ocr-safety-v1` · modelo padrão: `tesseract-eng-psm6`.

O corpus executável fica em `backend/demo/src/test/resources/ocr/corpus-sintetico-v1.json`. Ele contém somente texto sintético de visor e casos de decisão técnica; não contém fotos, leituras ou dados de pacientes. Os seis cenários mínimos são: leitura rotulada, rótulo incompleto, baixa confiança, inversão sistólica/diastólica, faixa técnica implausível e timeout.

O teste `ArquivoPrivadoServiceOcrTest` mede a classificação por cenário e impede que qualquer caso não reconhecido exponha valores a serem confirmados. Para uma avaliação futura com imagens sintéticas autorizadas, registrar por versão do corpus: taxa de aceitação correta por campo (SYS, DIA e pulso), taxa de recusa segura, inversão aceita indevidamente e timeout/indisponibilidade. Esses indicadores são técnicos; não representam validação clínica nem desempenho em fotos de pacientes.

Uma leitura só fica `RECOGNIZED` se tiver confiança técnica mínima configurada, SYS/DIA completos, ordem consistente e faixa técnica plausível. Mesmo nesse estado, `reviewRequired=true`: o resultado não cria `readings`; a pessoa precisa conferir e enviar `ocrConfirmed=true` separadamente. `UNREADABLE` e `UNAVAILABLE` não carregam valores.

Para alimentação, o contrato `FOOD_EDUCATIONAL_CONTRACT_V1` só é habilitável com fornecedor, versão esperada de modelo e critérios, referência de aprovação e credencial configurados no backend. A resposta precisa coincidir com essas versões; o snapshot validado é gravado no histórico de tentativas. Sem isso, o estado é `UNAVAILABLE`, sem semáforo.
