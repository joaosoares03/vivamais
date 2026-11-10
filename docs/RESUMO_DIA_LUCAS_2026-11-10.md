# Resumo de Lucas — 10/11/2026

Realizei uma varredura local da base de homologação, preservando G16/G17 e as migrações V1–V18. Incorporei também a atualização do PR #7 sobre OpenAPI, recebida durante os testes, e resolvi localmente o conflito documental com a revisão anterior.

**Resultado:** 419 testes distintos aprovados: 110 unitários Java, 114 integrações Java/OCR, 66 do portal, 95 do app, 16 de infraestrutura e 18 de ponta a ponta em Chromium, sem retries. TypeScript, lint, build do portal e export Expo web também passaram. O total inclui os três testes novos do PR #7, executados depois da bateria integral.

**Correções novas, ainda locais:**

- OCR recusa números truncados, negativos, decimais, rótulos duplicados e mistura de leituras; confiança e configuração inválidas são bloqueadas. Critérios `ocr-safety-v2`.
- Contrato alimentar recusa os casos testados de quantidades com unidades por extenso e caracteres de controle. Cache agora confere referência de aprovação e versão da validação local.
- Ativação do paciente preserva erros de limite/rede; um 429 não aparece mais como se fosse necessariamente bloqueio de cookies.
- Corpus de oito imagens sintéticas com Tesseract real: leitura legível conferida e sete recusas seguras. Reconhecer não salva pressão automaticamente; a confirmação explícita continua obrigatória.

**PRs e publicação:**

- [PR #6 — revisão e varredura](https://github.com/joaosoares03/vivamais/pull/6): atualizado com código `b828340`, mais documentação de fechamento. Aberto, sem merge e sem conflito confirmado pelo GitHub após o envio. Preserva seleção de pressão, acesso ao registro após vídeo e CORS de testadores da revisão original `202942d`.
- [CI anterior aprovada](https://github.com/joaosoares03/vivamais/actions/runs/42830962813): cobre `202942d`. Resultado da atualização deve ser conferido nos [checks do PR #6](https://github.com/joaosoares03/vivamais/pull/6/checks), comparando o SHA.
- [PR #7 — OpenAPI, João](https://github.com/joaosoares03/vivamais/pull/7): mesclado. Conciliação `3d922a9`, já enviada ao fork, preserva as duas alterações no histórico.
- [PR #1 — G16/G17 original](https://github.com/joaosoares03/vivamais/pull/1): continua aberto para `main`; os commits já fazem parte da linha de homologação.
- Branch desta varredura: `lucas/varredura-20261110`, enviada ao fork. A branch de origem do PR #6 recebeu os mesmos commits, sem force push. Usada a autorização anterior de Lucas para commit/envio/PR; não foi aberto um segundo PR duplicado. Merge/deploy não foram realizados.

**Pendências registradas:** quatro alertas JavaScript (três moderados/um baixo), 18 versões fora da recomendação atual do Expo, teste físico/nativo, acessibilidade e revisão clínica. Sem fornecedor alimentar externo habilitado e sem uso de dados reais. O código produtivo introduzido no PR #3 requer decisão explícita de governança; esta revisão não autoriza produção clínica.

No fluxo local, os registros compartilhados dos cenários cobertos funcionaram. O incidente de 06/11 na homologação permanece sem diagnóstico comprovado: precisamos conferir o SHA implantado e se os convites profissional/paciente realmente apontam para a mesma ficha e unidade. Hospedar portal na Vercel e paciente na Railway, por si só, não impede a integração.

Detalhes, tentativas que falharam, correções, matriz de módulos e evidências: [relatório da varredura](evidencias/VARREDURA_LUCAS_2026-11-10.md). Este documento é um resumo para revisão e eventual envio manual; nenhuma mensagem foi enviada por automação.
