# Corpus sintético e critérios técnicos — G17 OCR

## Atualização técnica de 10/11/2026

Critérios padrão atuais: `ocr-safety-v2`. O corpus textual `ocr-synthetic-v1` permanece como regressão histórica. Foram acrescentados testes de números truncados/negativos/decimais, rótulos duplicados, leituras misturadas, confiança inválida e configuração inválida. A suíte unitária de OCR tem 25 testes aprovados.

O novo `OcrImagensSinteticasIT` usa oito PNGs gerados por código e Tesseract real: um caso legível (118/76/pulso 71) e sete negativos (inversão, faixa técnica, ausência de números, branco, desfoque, rotação e rótulos repetidos). Na execução local, 3/3 campos do caso legível corretos e 7/7 recusas seguras; zero testes ignorados. Não são métricas de desempenho em fotos de pacientes.

[Imagens e resultados sanitizados](evidencias/varredura-lucas-20261110/corpus-ocr/README.md) · [relatório, falhas reproduzidas e limites](evidencias/VARREDURA_LUCAS_2026-11-10.md).

Confiança mínima deve estar em `(0,1]`. Número malformado, rótulo repetido e tentativa de completar leitura rotulada com outra linha não são aceitos. Nenhum valor recusado é exposto para confirmação. Reconhecimento continua separado da gravação da pressão, que exige confirmação explícita.

Na alimentação, respostas quantificadas com unidades por extenso e caracteres de controle nos alimentos são recusadas nos casos testados. O cache exige a referência atual de aprovação e `food-response-safety-v2`, marcado pelo servidor. Snapshots antigos não são reescritos; não podem ser reutilizados como resultado atual. Fornecedor externo continua desabilitado nesta execução.

## Corpus textual original

Versão do corpus: `ocr-synthetic-v1` · critérios na entrega original: `ocr-safety-v1` · modelo padrão: `tesseract-eng-psm6`.

O corpus executável fica em `backend/demo/src/test/resources/ocr/corpus-sintetico-v1.json`. Ele contém somente texto sintético de visor e casos de decisão técnica; não contém fotos, leituras ou dados de pacientes. Os seis cenários mínimos são: leitura rotulada, rótulo incompleto, baixa confiança, inversão sistólica/diastólica, faixa técnica implausível e timeout.

O teste `ArquivoPrivadoServiceOcrTest` mede a classificação por cenário e impede que qualquer caso não reconhecido exponha valores a serem confirmados. Para uma avaliação futura com imagens sintéticas autorizadas, registrar por versão do corpus: taxa de aceitação correta por campo (SYS, DIA e pulso), taxa de recusa segura, inversão aceita indevidamente e timeout/indisponibilidade. Esses indicadores são técnicos; não representam validação clínica nem desempenho em fotos de pacientes.

Uma leitura só fica `RECOGNIZED` se tiver confiança técnica mínima configurada, SYS/DIA completos, ordem consistente e faixa técnica plausível. Mesmo nesse estado, `reviewRequired=true`: o resultado não cria `readings`; a pessoa precisa conferir e enviar `ocrConfirmed=true` separadamente. `UNREADABLE` e `UNAVAILABLE` não carregam valores.

Para alimentação, o contrato `FOOD_EDUCATIONAL_CONTRACT_V1` só é habilitável com fornecedor, versão esperada de modelo e critérios, referência de aprovação e credencial configurados no backend. A resposta precisa coincidir com essas versões; o snapshot validado é gravado no histórico de tentativas. Sem isso, o estado é `UNAVAILABLE`, sem semáforo.
