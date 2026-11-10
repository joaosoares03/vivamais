# Corpus de imagens OCR — execução local de 10/11/2026

Oito PNGs inteiramente sintéticos, gerados por `OcrImagensSinteticasIT` com Java/AWT e sanitizados pelo mesmo preparador de imagens do servidor. Não contêm pessoas, fotos ou dados de pacientes.

Motor: Tesseract real, modelo `tesseract-eng-psm6`, critérios `ocr-safety-v2`, confiança mínima técnica 0,85. [Resultados observados](resultados.jsonl); contexto e limites no [relatório](../../VARREDURA_LUCAS_2026-11-10.md).

| Imagem | Caso | Resultado esperado/observado |
| --- | --- | --- |
| [legivel.png](legivel.png) | SYS 118 / DIA 76 / PULSE 71 | Reconhecimento dos três campos; confirmação humana obrigatória. |
| [valores-invertidos.png](valores-invertidos.png) | SYS menor que DIA | Recusa por inversão. |
| [fora-da-faixa.png](fora-da-faixa.png) | SYS 399 | Recusa por faixa técnica. |
| [sem-numeros.png](sem-numeros.png) | Texto sem leitura | Recusa por valores incompletos. |
| [branco.png](branco.png) | Imagem branca | Indisponível, sem valores. |
| [desfocado.png](desfocado.png) | Desfoque forte | Recusa por confiança baixa. |
| [rotacionado-180.png](rotacionado-180.png) | Imagem invertida | Recusa por confiança baixa. |
| [rotulos-repetidos.png](rotulos-repetidos.png) | Duas leituras rotuladas | Recusa por ambiguidade. |

Reprodução no Windows, após configurar o JDK, o PostgreSQL local e o runtime OCR conforme o repositório:

```powershell
pnpm.cmd install --frozen-lockfile
$env:TEST_OCR_NODE_SCRIPT = (Resolve-Path .\infra\ocr-worker.mjs).Path
.\backend\demo\mvnw.cmd -f .\backend\demo\pom.xml "-Dit.test=OcrImagensSinteticasIT" verify
```

Confirme o caminho do script OCR usado na sua instalação. Configure `TEST_DATABASE_URL`, `TEST_DATABASE_USER` e `TEST_DATABASE_PASSWORD` apenas no processo caso execute outras integrações; não publique esses valores. O IT pode ser executado com `TEST_NATIVE_OCR=true` e Tesseract nativo em vez do adaptador Node. Sem runtime, informa teste ignorado, não aprovação. Na execução registrada os oito rodaram sem ignorados. Para exportar novas evidências, use `-Dviva.ocr.corpus-dir` apontando para uma pasta nova em `.local`.

Este corpus tem um único caso legível e sete negativos; não mede desempenho em fotografias reais. Variações de fontes/motor podem alterar a confiança. Os PNGs e valores são massa de teste acadêmica, não exemplos de orientação clínica.
