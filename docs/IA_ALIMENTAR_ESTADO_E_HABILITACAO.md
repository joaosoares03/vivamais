# IA alimentar: integração inativa

Na homologação, `FOOD_ANALYSIS_ENABLED=false`, e a consulta realizada em 04/11 confirmou zero tentativas persistidas. Fotos são armazenadas e consultadas pela equipe autorizada. **Não há identificação real de alimentos ativa nem análise nutricional simulada apresentada como real.** OCR Tesseract de visor é um serviço diferente.

O código possui porta/adaptador HTTP, validação estrita do contrato educativo, autorização por refeição, orçamento persistido, rastreamento de modelo/critérios e armazenamento de sucesso/falha. `GET /api/v1/food/status` expõe a disponibilidade sem segredos; `POST /api/v1/meals/{id}/analyze` é síncrono e só chama o fornecedor quando a configuração completa está habilitada.

Configuração necessária **somente no backend**:

- `FOOD_ANALYSIS_ENABLED`, `FOOD_ANALYSIS_ENDPOINT`, `FOOD_ANALYSIS_API_KEY`.
- `FOOD_PROVIDER_NAME`, `FOOD_MODEL_VERSION`, `FOOD_CRITERIA_VERSION`.
- `FOOD_APPROVED_CRITERIA`, `FOOD_APPROVAL_REFERENCE`, `FOOD_MINIMUM_CONFIDENCE`.

Não basta definir uma chave comercial: o serviço escolhido precisa implementar `FOOD_EDUCATIONAL_CONTRACT_V1`, HTTPS sem redirecionamento, resposta limitada, campos/versões válidos e política `X-Viva-Data-Policy: no-training`. Nenhum fornecedor comercial foi aprovado ou ensaiado com esse contrato. O inicializador da homologação atual impede ativação inadvertida; uma futura ativação exige sua alteração consciente e revisão.

O modelo de resposta inclui estado, alimentos possíveis, confiança técnica, explicação, limitações e rastreabilidade; um semáforo educativo só pode ser mostrado após resposta validada. Não mede sódio, gordura, porções, calorias ou pressão por fotografia. Nenhuma medicação, prescrição ou diagnóstico deve ser decidido por esse resultado. Critérios clínicos, política de dados, custos e revisão profissional permanecem pendentes de aprovação.

Para ativar: selecionar fornecedor e orçamento com o proprietário; aprovar critérios/privacidade; configurar o adaptador/segredos; testar imagens sintéticas, incerteza, falha/timeout, campos proibidos, quotas e persistência; obter revisão institucional. Os testes unitários usam respostas fictícias de contrato e não comprovam um fornecedor externo. Detalhes: [relatório de validação](evidencias/VALIDACAO_FOTOS_IA_E_TESTES_GRUPO.md).
