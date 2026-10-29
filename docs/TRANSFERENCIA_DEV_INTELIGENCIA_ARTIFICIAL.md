# Transferência técnica — IA, imagens e OCR

**Consolidação GitHub e transferência:** entrada técnica principal em [MANUAL_TECNICO_COMPLETO_VIVAMAIS](MANUAL_TECNICO_COMPLETO_VIVAMAIS.md), com [inventário](INVENTARIO_COMPLETO_FUNCIONALIDADES.md), [rastreio de implementação](COMO_FORAM_IMPLEMENTADAS_AS_FUNCIONALIDADES.md), [ambiente novo](GUIA_COMPLETO_AMBIENTE_DESENVOLVIMENTO.md), [testes](MANUAL_COMPLETO_TESTES_DESENVOLVEDOR.md), [banco](ARQUITETURA_BANCO_DADOS.md), [plano](PLANO_TECNICO_CONTINUIDADE_DESENVOLVIMENTO.md) e [índice](INDICE_DOCUMENTACAO.md). V9/SMS permanece vigente; histórias anteriores não autorizam login de senha do paciente.

**Integração V9 atual:** ler [cadastro/SMS](CADASTRO_E_ATIVACAO_SMS.md), [pendências por ID](LEVANTAMENTO_COMPLETO_PENDENCIAS.md) e [plano técnico](PLANO_IMPLEMENTACAO_PENDENCIAS.md). V1–V9 aplicadas são imutáveis. Código não aparece na API profissional: emissão retorna metadados de SMS. Novos pacientes exigem celular, trocas são assistidas e revogam credenciais. Para testes, somente LOCAL cifrado explicitamente habilitado; nunca SMS real implícito. Autenticação/contratos gerais continuam com dev geral; exercícios/IA continuam com o responsável delegado.

Atualização transversal de 20/10: [acesso sem senha do paciente e V8](ACESSO_PACIENTE_SEM_SENHA.md). Paciente usa CPF/nascimento e credencial de aparelho ou código de quatro números. /auth/login permanece profissional; /auth/activate foi retirado. Manter os contratos clínicos e preservar V1–V8 aplicadas. Nenhuma funcionalidade específica delegada foi alterada.

Atualizado em 22/10/2026. A base técnica G17 registra versões, critérios, confiança técnica e histórico de tentativas sem habilitar fornecedor externo. O corpus sintético de decisão OCR está em [CORPUS_OCR_SINTETICO_G17](CORPUS_OCR_SINTETICO_G17.md). Nenhum fornecedor alimentar, modelo clínico, prompt ou credencial foi aprovado/configurado: o estado padrão continua `UNAVAILABLE`.

## 1. O que existe e o que não existe

| Área                                  | Estado comprovável                          | Limite                                                                                                                            |
| ------------------------------------- | ------------------------------------------- | --------------------------------------------------------------------------------------------------------------------------------- |
| Captura/upload privado                | Implementado                                | Galeria/câmera via Expo ImagePicker; câmera física ainda sem ensaio                                                               |
| Normalização/armazenamento            | Implementado localmente                     | ImageIO reencoda PNG; objetos AES-GCM; adaptador Supabase existe, sem ensaio no fornecedor                                        |
| OCR do visor                          | Implementado e testado com Tesseract real   | Não é IA generativa, não mede pressão e não faz diagnóstico                                                                       |
| Extração de valores                   | Implementado por padrões de texto           | SYS/SIS/DIA/PULSE e alternativa numérica; exige conferência humana, sem confiança calibrada                                       |
| Leitura confirmada                    | Implementado                                | OCR sozinho não cria registro de pressão; documento e confirmação explícita são exigidos                                          |
| Registro de refeições                 | Implementado                                | Foto, observação, data, histórico e resultado privado persistem                                                                   |
| Identificação/classificação alimentar | Parcial: porta/adaptador HTTP               | Sem fornecedor/credencial/critérios/aprovação ativos; indisponibilidade real, sem resposta simulada                               |
| Histórico de análises                 | Parcial                                     | Documento OCR por execução; uma avaliação alimentar JSON em cache e tentativas de serviço; não há histórico versionado de modelos |
| Prescrição/IA de exercícios           | Dependente de aprovação e outro responsável | Nenhum motor de recomendação ou modelo de exercícios existente                                                                    |
| LLM/prompt clínico                    | Não implementado                            | Nenhum OpenAI/Gemini/outro modelo generativo configurado no código                                                                |

Tesseract reconhece texto com seu modelo OCR; “reconhecido” significa que o parser conseguiu extrair números dentro das faixas técnicas. Não valida exatidão, qualidade clínica ou segurança de uma medição.

## 2. Arquitetura e arquivos reais

| Etapa                      | Código                                                                                                                                 |
| -------------------------- | -------------------------------------------------------------------------------------------------------------------------------------- |
| Fotografia Expo            | components/FluxoFotografia.tsx; app/pressao/foto.tsx; app/alimentacao/index.tsx; expo-image-picker 57.0.16                             |
| Revisão/pressão            | app/pressao/digitar.tsx; hooks/useSalvarPressao.ts; services/pressao/registrosPressao.ts; app/pressao/resultado.tsx                    |
| Alimentação no app         | app/alimentacao/resultado.tsx; services/alimentacao/refeicoes.ts; hooks/useResultadoRefeicao.ts; components/ImagemPrivada.tsx          |
| Portal                     | web/components/RefeicoesPaciente.tsx; web/app/api/photos/[id]/route.ts; web/app/api/domain/[...path]/route.ts; web/services/dominio.ts |
| API de imagem              | backend/demo/src/main/java/com/vivamais/controller/ArquivoPrivadoController.java                                                       |
| Serviço de arquivo/análise | backend/demo/src/main/java/com/vivamais/service/ArquivoPrivadoService.java                                                             |
| Armazenamento              | backend/demo/src/main/java/com/vivamais/service/ArmazenamentoArquivos.java                                                             |
| OCR                        | service/ProvedorOcr.java; service/ReconhecedorTesseract.java; infra/ocr-worker.mjs; tesseract.js 7.0.0                                 |
| Porta alimentar            | service/ProvedorAnaliseAlimentacao.java; service/ProvedorAnaliseAlimentacaoHttp.java                                                   |
| Pressão confirmada         | service/CuidadoService.java; dto/ModelosCuidado.java; controller/CuidadoController.java                                                |
| Autorização/auditoria      | repositories/InstituicaoRepository.java; security/FiltroTokenAcesso.java; config/TratadorExcecoesApi.java                              |
| Configuração               | backend/demo/src/main/resources/application.yml; backend/demo/Dockerfile; infra/ambiente-local.ps1; app.config.ts                      |
| Contrato                   | backend/demo/openapi.json; packages/contracts/src/generated.ts                                                                         |

Os caminhos service/controller/dto/repositories abreviados na tabela têm prefixo backend/demo/src/main/java/com/vivamais/. Não há entidade JPA de análise: os serviços usam JdbcTemplate e SQL parametrizado.

## 3. Fluxo da fotografia

1. Paciente autenticado é identificado pela API. FluxoFotografia escolhe finalidade MEAL ou PRESSURE_DISPLAY; não confundir finalidade da imagem com um diagnóstico.
2. POST multipart /patients/{id}/files envia purpose e file. O servidor autoriza o paciente antes de persistir. Cliente não escolhe autor/object_key.
3. Arquivo deve ser PNG/JPEG, entre 1 byte e 2 MiB. Dimensões 20–4096 por eixo e até 12 milhões de pixels. ImageIO lê e reencoda PNG, removendo metadados do arquivo de origem; isso não remove informação pessoal visível nos pixels. PNG normalizado também deve caber em 2 MiB.
4. Armazenamento cifra com AES-256-GCM, IV aleatório de 12 bytes, chave de 32 bytes. O objeto local tem nome UUID.bin; só a API o lê. file_object guarda metadados/hash e finalidade, sem tornar a imagem pública.
5. A transação grava autor/paciente e auditoria; falha de metadados tenta remover o objeto criado. Não tratar banco isoladamente como backup das imagens.
6. A visualização exige POST /files/{id}/link. Retorna caminho com concessão de 60 segundos vinculada à sessão. GET do conteúdo revalida sessão, unidade e vínculo. Não é link permanente nem concessão de uso único; expira/revoga com a sessão. Nunca registrar a URL completa.

No portal, /api/photos/{id} usa o cookie HttpOnly e obtém os bytes no servidor, sem entregar a credencial do backend ao navegador. No app, ImagemPrivada solicita o link autorizado. Não trocar esse fluxo por bucket público ou URL sem autorização.

## 4. OCR e confirmação: contratos

Todos os caminhos abaixo têm prefixo /api/v1. /files/{id}/content usa concessão temporária em vez do Bearer no GET; as demais operações exigem sessão.

| Operação                                                   | Entrada                                                                                                | Resposta/comportamento                                                                            |
| ---------------------------------------------------------- | ------------------------------------------------------------------------------------------------------ | ------------------------------------------------------------------------------------------------- |
| POST /patients/{id}/files                                  | multipart: purpose=PRESSURE_DISPLAY, file                                                              | id,patientId,mimeType,byteSize,purpose,createdAt                                                  |
| POST /files/{id}/ocr                                       | Corpo vazio/{} e arquivo do visor autorizado                                                           | id (documento),fileId,status,systolic,diastolic,pulse,createdAt,confirmationRequired=true,message |
| POST /patients/{id}/readings                               | UUID da operação, valores conferidos, measuredAt, source=OCR_CONFIRMED,ocrDocumentId,ocrConfirmed=true | Registro de pressão persistido/idempotente                                                        |
| GET /pacientes/{idPaciente}/registros-pressao/{idRegistro} | IDs autorizados                                                                                        | Resultado persistido, não uma resposta inventada no cliente                                       |

Estados OCR: RECOGNIZED, UNREADABLE, UNAVAILABLE. Uma requisição em curso por instância usa Semaphore; outra recebe 429. Processo tem limite de 30 segundos e saída de 16 KiB; erro/indisponibilidade deve levar a digitação ou nova foto. Arquivos temporários de imagem/saída são apagados em finally. O texto bruto não é gravado em pressure_ocr_document nem em logs da API.

ReconhecedorTesseract executa Tesseract nativo com eng/PSM 6, ou Node apontado por OCR_NODE_SCRIPT. No Windows atual o worker tesseract.js usa createWorker('eng', 1), SINGLE_BLOCK, cache local e logger vazio. O Dockerfile instala o executável/modelo eng, mas Docker não foi ensaiado nesta máquina.

ArquivoPrivadoService procura rótulos de sistólica/diastólica/pulso e uma alternativa numérica. Faixas técnicas: sistólica/diastólica de 1–400, pulso de 1–300; não é protocolo clínico. Campo confidence existe na tabela, mas não é preenchido nem exposto como confiança validada. O app encaminha documento/valores para a tela de revisão; somente a confirmação salva a medição. CuidadoService exige documento RECOGNIZED pertencente ao paciente. Não aceitar um resultado de outro paciente ou um OCR não confirmado.

## 5. Alimentação: contratos e adaptador atual

| Operação                                | Entrada/saída                                                               |
| --------------------------------------- | --------------------------------------------------------------------------- |
| POST /patients/{id}/files               | purpose=MEAL e foto privada                                                 |
| POST /patients/{id}/meals               | fileId,occurredAt,notes (até 2.000); mesma foto não cria outra refeição     |
| GET /patients/{id}/meals?page=0&size=20 | items,total,page,size; ordem occurredAt DESC,id DESC                        |
| GET /refeicoes/{idRefeicao}             | Foto/data/observação/analysisStatus/assessment, com autorização por recurso |
| POST /meals/{id}/analyze                | Avaliação em cache, indisponibilidade ou chamada ao adaptador habilitado    |

Enquanto a configuração estiver ausente, retorna status=UNAVAILABLE,providerCalled=false,message e educationalAlternative; nenhuma avaliação de “boa escolha” é produzida. A foto continua utilizável no acompanhamento. O app pode solicitar análise pela tela de resultado. O portal exibe a avaliação que existir, mas não possui hoje um botão próprio de análise.

A interface ProvedorAnaliseAlimentacao declara enabled() e assess(byte[]). O adaptador HTTP só se habilita quando flag=true, endpoint HTTPS, chave, critérios e referência de aprovação não vazios. Não há provedor comercial específico selecionado.

Payload atual enviado ao serviço configurado:

```json
{
  "imageBase64": "PNG_PRIVADO_EM_BASE64",
  "mimeType": "image/png",
  "criteria": "CRITERIOS_APROVADOS_PELA_INSTITUICAO",
  "approvalReference": "REFERENCIA_DA_APROVACAO",
  "restrictions": [
    "educational-only",
    "no-diagnosis",
    "no-nutrient-quantity",
    "reject-inadequate-image",
    "explain-uncertainty"
  ]
}
```

Não inclui nome/CPF no JSON, mas a própria imagem pode conter informação pessoal. A transferência externa requer revisão institucional/contratual; preencher uma variável de ambiente não constitui aprovação.

Resposta esperada pelo adaptador: status ASSESSED/UNCERTAIN/REJECTED; trafficLight GREEN/YELLOW/RED somente em ASSESSED; explanation textual até 2.000; limitations textual; identifiedFoods array com até 30 itens. Timeout de conexão de 5 segundos/requisição de 15 segundos, sem seguir redirecionamento, resposta máxima de 16 KiB e status HTTP 200. Uma expressão rejeita termos quantitativos de nutrientes; ela é um bloqueio técnico básico, não validação clínica nem filtro completo.

Persistência usa meal_photo.analysis_status e assessment JSONB; food_analysis_attempt mantém STARTED/SUCCEEDED/FAILED. A avaliação existente é devolvida em cache. Limites atuais: 5 tentativas diárias no conjunto da aplicação e 2 por foto, protegidos por lock PostgreSQL; falhas consomem tentativa. Não alterar para números ilimitados para facilitar desenvolvimento.

## 6. Variáveis e segredos

| Variável                                         | Uso/configuração segura                                                                    |
| ------------------------------------------------ | ------------------------------------------------------------------------------------------ |
| FILES_DIRECTORY                                  | Caminho absoluto de objetos locais; preservar .encryption-key                              |
| FILES_ENCRYPTION_KEY                             | Chave Base64 de 32 bytes, alternativa externa ao arquivo local; segredo somente no backend |
| STORAGE_BACKEND                                  | local por padrão; supabase é adaptador disponível, ainda sem ensaio externo                |
| SUPABASE_URL / SUPABASE_STORAGE_BUCKET           | Endpoint/bucket privado aprovados; não usar URL pública de objetos                         |
| SUPABASE_SERVICE_ROLE_KEY                        | Segredo apenas no backend, nunca EXPO_PUBLIC/NEXT_PUBLIC                                   |
| TESSERACT_COMMAND                                | Executável nativo, padrão tesseract                                                        |
| OCR_NODE_SCRIPT / OCR_NODE_EXECUTABLE            | Worker local e Node; scripts selecionam infra/ocr-worker.mjs quando o modelo existe        |
| OCR_DATA_DIRECTORY / OCR_CACHE_DIRECTORY         | Consumidas pelo worker Node, modelo eng/cache privados e graváveis                         |
| FOOD_ANALYSIS_ENABLED                            | false na execução local e padrão; não ativar sem dependências abaixo                       |
| FOOD_ANALYSIS_ENDPOINT / FOOD_ANALYSIS_API_KEY   | HTTPS e credencial privada do serviço aprovado                                             |
| FOOD_APPROVED_CRITERIA / FOOD_APPROVAL_REFERENCE | Conteúdo/referência aprovados; nunca inventar esses valores                                |
| DATABASE_URL/USER/PASSWORD                       | Conexão privada do backend; não entregar ao app/portal cliente                             |

Não copiar as credenciais desta máquina. Para conhecer locais e prompts seguros, seguir [guia Windows](GUIA_COMPLETO_EXECUCAO_LOCAL_WINDOWS.md). Não registrar texto OCR, Base64, arquivo, corpo clínico, token, chave, URL de concessão ou resposta sensível em console/telemetria.

## 7. Banco e migrações

V3**private_files.sql cria file_object, file_download_grant, pressure_ocr_document e meal_photo; acrescenta a FK ocr_document_id à medição. V4**analysis_budget.sql cria food_analysis_attempt. V5 aplica RLS/revogações. V1 define organização/usuário/paciente/sessão/auditoria; V2 define leituras/idempotência; V6 dados demográficos; V7 preferências.

Não há acesso direto do cliente às tabelas. A API JDBC aplica organização e vínculo em cada recurso. V1–V7 aplicadas são imutáveis; evolução de modelo/histórico exige migração aditiva coordenada com exercícios/geral. Dump, objetos e chave devem ser recuperados juntos: [backup/restore verificado](operations/BACKUP_RESTORE.md).

Não há política institucional de retenção/exclusão de imagens aprovada ou apagamento clínico automático. DELETE técnico no armazenamento é usado no tratamento de falha de upload; não equivale a fluxo de direito de exclusão de conta. Limpeza de concessões expiradas também não remove imagens.

## 8. Pendências para o responsável de IA

| Prioridade | Trabalho e local                                      | Entrada/saída e persistência previstas                                                                     | Validação, testes e aceite                                                                                                                                                          |
| ---------- | ----------------------------------------------------- | ---------------------------------------------------------------------------------------------------------- | ----------------------------------------------------------------------------------------------------------------------------------------------------------------------------------- |
| P0         | Definir serviço/escopo clínico e bases de uso externo | Imagem mínima e resposta educativa acordada; nenhum fornecedor já está ativo                               | Aprovação, contrato, região/retenção/custo documentados; sem configuração deve permanecer UNAVAILABLE sem chamada                                                                   |
| P0         | Endurecer contrato do adaptador HTTP                  | ProvedorAnaliseAlimentacaoHttp: validar tipos/tamanhos de cada alimento/limitação e esquema completo       | Hoje há limites de array, mas não validação de cada elemento nem limite próprio de limitations além dos 16 KiB; testar objetos/HTML/JSON inválido e falhar sem renderizar avaliação |
| P1         | Versionar avaliações/cache                            | meal_photo/food_analysis_attempt + migração aditiva; registrar provedor/modelo/critério/aprovação/instante | Cache atual é por refeição e não versiona critérios; testar atualização de versão, rastreabilidade e histórico sem sobrescrever resultado clínico silenciosamente                   |
| P1         | Robustez OCR e UX de erro                             | ProvedorOcr, ReconhecedorTesseract, FluxoFotografia e transporte                                           | Corpus sintético autorizado com baixa luz, inclinação, rótulos variados e valores incompletos; aceite: revisão obrigatória e nenhuma medição criada apenas por OCR                  |
| P1         | Alinhar timeout/reenvio                               | Transporte app padrão15 s versus processo OCR30 s; BFF/fornecedor têm seus próprios limites                | Avaliar fila assíncrona/consulta de estado ou tempos compatíveis; testar resposta perdida, repetição e cancelamento sem duplicar leitura confirmada                                 |
| P1         | Ensaio real de fornecedor                             | Adaptador HTTP/Supabase e gerenciamento de segredos                                                        | Só após credencial/aprovação; testar autorização, 429/503, timeout, payload excessivo, custo e falha de storage; não substituir por fixture em produção                             |
| P2         | Portal/histórico de análises                          | RefeicoesPaciente, resultado do app e endpoints atuais/novos coordenados                                   | Mostrar origem, versão, incerteza e revisão humana; teste integração sem quebrar upload/visualização/consultas                                                                      |
| P2         | Qualidade clínica da resposta                         | Revisão profissional das explicações e apresentação de semáforo                                            | O semáforo previsto no contrato não está clinicamente validado; não ativar por aparência do protótipo                                                                               |

Propostas não são funcionalidades já existentes. Não acrescentar prompts prescritivos, diagnósticos, estimativas de sódio/calorias ou recomendações de compensação. IA não substitui avaliação profissional. Não integrar IA de exercícios sem coordenação com seu responsável e aprovador clínico.

## 9. Como desenvolver e testar com segurança

Iniciar o sistema pelos scripts existentes; verificar /actuator/health. O ambiente local mantém FOOD_ANALYSIS_ENABLED=false. Para OCR local, o inicializador detecta work/ocr-data/eng.traineddata.gz e configura o worker/cache. Modelo ausente é indisponibilidade a diagnosticar, não motivo para responder valores fictícios.

No app, Minha Pressão → Tirar foto do aparelho → escolher foto sintética do visor → conferir todos os números → salvar. Depois reler pela API/portal e verificar que fonte=OCR_CONFIRMED/documento estão persistidos. Sem confirmar, não deve haver medição nova. Tentar foto inadequada e documento de outra pessoa deve falhar de modo seguro.

Em Minha Alimentação, registrar foto sintética com observação, consultar resultado/histórico e tentar análise. Sem fornecedor ativo, deve continuar UNAVAILABLE, com foto preservada e sem semáforo fabricado. Use recursos sintéticos de docs/evidencias/testes-manuais/recursos/visor-sintetico.png e imagens fornecidas, nunca fotos reais de pacientes.

Exemplo de contrato de upload, usando sessão segura já obtida no aplicativo ou cliente de testes:

```http
POST /api/v1/patients/{idPacienteAutorizado}/files
Authorization: Bearer <sessao-em-memoria>
Content-Type: multipart/form-data; boundary=<gerado-pelo-cliente>

purpose=PRESSURE_DISPLAY
file=<bytes-da-imagem-sintetica>
```

Deixe FormData gerar boundary; não montar multipart manualmente no app. Para uso executável, reutilizar FluxoFotografia e o fluxo tests/e2e/mobile-care.spec.ts, que já fornece upload de fixture, OCR real, confirmação, acesso cruzado e revogação. Não imprimir a resposta de login para obter o token.

Testes Java existentes: CuidadoIT.realOcrRequiresExplicitConfirmationBeforeAnyReadingIsInserted; photosAreEncryptedPrivateScopedAndLinksExpireWithSession; configuração TEST_OCR_NODE_SCRIPT ou TEST_NATIVE_OCR=true. E2E: mobile-care.spec.ts e portugues-pressao.spec.ts. Testes simulados futuros do contrato do fornecedor são testes de falha/validação, nunca evidência de integração externa concluída. Manter a trilha atual de OCR real.

Ao receber resultado incorreto, manter revisão/digitação disponível e registrar defeito usando imagem sintética autorizada, versão/configuração e status técnico, sem corpo sensível. Corrigir/medir qualidade do parser/modelo antes de liberar novo comportamento. Após mudança: contrato, tipos, Java/PostgreSQL, frontend e E2E pertinentes, mais nova captura e atualização destes limites. [Manual geral](MANUAL_CONTINUIDADE_DESENVOLVIMENTO.md) contém os comandos reais.
