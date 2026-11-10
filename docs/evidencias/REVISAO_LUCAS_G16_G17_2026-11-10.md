# Revisão local de G16/G17 — Lucas — 10/11/2026

Base: `1afe882`, branch `lucas/revisao-g16-g17-20261110`. Dados exclusivamente sintéticos. Lucas autorizou commit, envio da branch ao seu fork e abertura de PR para homologação em 10/11/2026. A autorização não inclui merge, deploy, alteração de fornecedor ou liberação clínica.

## Fechamento da continuação local

- Convite de paciente criado na API de revisão, com credencial aleatória de um dia e dados sintéticos. API em loopback e schema `lucas_revisao_*`, separado do principal. Credenciais, convite e arquivos privados permanecem em `.local/revisao-lucas`, ignorados pelo Git. O schema de revisão visual foi mantido para continuidade; os schemas temporários de integração são removidos pelas suítes.
- A tentativa pelo navegador revelou falha de CORS real: `/auth/testadores/convite` e `/renovar` usam `credentials: include`, mas só `/auth/paciente/**` permitia credenciais na configuração CORS. Corrigida a configuração específica de `/api/v1/auth/testadores/**`, usando as mesmas origens explícitas. Não foram alteradas origens, cookies, autenticação ou permissões clínicas. Novo teste verifica origem permitida, origem externa recusada e ausência de credenciais na rota geral `/patients`.
- Após reiniciar a API corrigida, o convite funcionou no navegador em `127.0.0.1:8081` falando com `127.0.0.1:8080`. A seleção sem resposta mostra dois círculos; “Ainda não verifiquei” recebe ✓ ao selecionar; trocar para “Sim” move o ✓. A etapa não libera exercício automaticamente.
- Vídeo de Marcha sentada carregou o material de 30 segundos; o novo aviso e botão ficaram legíveis. O botão abriu o formulário com o nome preenchido, sentimento e duração ainda por informar, histórico só com o exemplo anterior. Nenhuma atividade nova foi enviada na conferência visual.
- Capturas sem segredos: [seleção da pressão](revisao-lucas-20261110/pressao-selecao.jpg) e [ação após vídeo](revisao-lucas-20261110/video-registro.jpg). Não houve teste em aparelho físico nem ensaio visual do portal nesta continuação.
- Exportação Expo web atualizada aprovada: bundle SHA256 `7236dcbc7331e31822ec79282b3b9f516bd9968f69bc5d62400703e422a9edd4`. Não representa APK/IPA.
- **OCR real aprovado:** `CuidadoIT#realOcrRequiresExplicitConfirmationBeforeAnyReadingIsInserted`, 1 teste, sem falhas ou ignorados. `infra/ocr-worker.mjs` executou Tesseract.js com modelo inglês obtido de `@tesseract.js-data/eng@1.0.0`, extraído somente em `.local`. Visor gerado sinteticamente no teste: 118/76, pulso 71; revisão/confirmacão obrigatórias, zero leituras antes da confirmação, envio com `ocrConfirmed=false` recusado e uma leitura após `true`. A confirmação neste teste é simulação explícita sobre dados sintéticos, não revisão clínica humana. Nenhuma imagem foi enviada a fornecedor externo.
- Regressões finais: 21 Vitest seletivos aprovados (interface, catálogo, plano e alimentação), `typecheck:mobile` e ESLint dos arquivos alterados aprovados. Java: 6 testes de OCR/adaptador alimentar aprovados e 12 de `AcessoTestadoresIT` aprovados após corrigir CORS. Somados aos 14 cenários de cuidados (incluindo OCR agora executado) e 4 de exercícios, a cobertura de integração exercitada nesta revisão é de 30 cenários distintos, sem somar repetições.
- `git diff --check` aprovado. V1–V10 continuam idênticas à entrega original e nenhuma migration foi modificada. Gitleaks não foi encontrado no PATH; não alegar scan automatizado de segredos. Diff e capturas revisados, arquivos privados confirmados ignorados.
- Novo `git fetch origin` confirmou `0 0` entre HEAD e a branch-base de homologação. Surgiu `claude/fecha-api-docs`, mas ela não foi integrada à base consultada. Não incorporar trabalho alheio automaticamente.

Próximo passo concreto: revisar o texto pronto em `.local/revisao-lucas/PR.md` e autorizar envio da branch e abertura do PR contra `codex/homologacao-nuvem-20261104`. Sem autorização de deploy ou uso real. O histórico das primeiras verificações abaixo conserva os resultados anteriores e suas limitações, superadas apenas onde documentado neste fechamento.

## Correções

- `components/RoteiroAtividade.tsx`: o indicador de pressão deixa de ser um ✓ fixo na resposta afirmativa e passa a acompanhar a seleção. Sem resposta, ambas as opções mostram círculo vazio; `accessibilityState.checked` continua coerente.
- A tela de vídeo oferece “Registrar somente se já realizei esta atividade”, que abre o formulário com o nome do material. Assistir não envia registro. O formulário existente exige sentimento, descrição, duração e data válidos e envio humano explícito.
- A frase de conclusão embutida no MP4 não foi editada. O texto da tela esclarece que assistir não comprova execução. A identidade de item de plano continua sendo enviada pelo fluxo próprio “Registrar que fiz”; a navegação genérica do catálogo permanece autorrelato livre.

## Investigação dos históricos diferentes

`GrupoTestesService.criar` cria um paciente novo para cada integrante. Um profissional recebe sua própria ficha fictícia; um integrante paciente recebe outra ficha. Nome igual não une identidades. Para a ficha do integrante paciente aparecer ao profissional, o administrador precisa informar `idProfissional` na criação, ou usar um convite emitido para a própria ficha já vinculada.

Essa regra é compatível com os horários distintos observados em 06/11 (17:47:30 no app e 17:48:01 no portal), mas não comprova a configuração das contas da nuvem: não houve consulta ao banco remoto nem consumo de convites pessoais. Hospedar clientes na Vercel e Railway não impede compartilhar registros via mesma API e vínculo autorizado.

Novo cenário em `AcessoTestadoresIT`: convites com apelidos iguais geram pacientes distintos; profissional sem vínculo recebe 403; registro de 5 minutos do paciente vinculado fica visível ao profissional autorizado, reenvio mantém registro único e o registro não aparece na ficha diferente do mesmo profissional. Profissional de outra unidade recebe 403.

## Validação

- Antes das alterações, resultados fornecidos por Lucas: tipos e lint aprovados; portal 66, app 85 e Java unitário 82 aprovados. Não representam nova execução integral nesta revisão.
- Após as correções: `typecheck:mobile`, ESLint dos dois arquivos TypeScript alterados e `git diff --check` aprovados.
- Vitest seletivo: 16 testes aprovados (catálogo, plano e 4 regressões novas de interface). Renderização React em teste com superfícies nativas substituídas; não substitui ensaio visual em navegador ou aparelho.
- Integração PostgreSQL inicial: `AcessoTestadoresIT`, `CuidadoIT`, `ExerciciosIT`: 28 cenários, 27 aprovados e 1 ignorado. OCR real foi ignorado por ausência de `TEST_OCR_NODE_SCRIPT`/`TEST_NATIVE_OCR`; não declarar OCR real validado nesta rodada.
- O novo cenário de vínculos passou na primeira execução ampliada, mas a suíte atingiu 429 no preparo de outro cenário devido a logins repetidos da conta de apoio. O preparo foi ajustado para reutilizar essa sessão, sem modificar limites da aplicação.
- Repetição final de `AcessoTestadoresIT`: 11 testes aprovados, zero falhas/erros/ignorados (`BUILD SUCCESS`). Considerando as três classes de integração, são 28 testes distintos aprovados e 1 ignorado; a repetição não é somada como cobertura nova.
- V1–V10 comparadas com `3cc7e95`: nenhuma diferença. Nenhuma migration foi editada. Flyway V1–V18 executado apenas nos schemas temporários próprios das suítes.
- Consulta final ao PostgreSQL confirmou zero schemas remanescentes entre os identificadores usados nesta revisão. Dados do schema principal preservados.

## Próximos passos

1. Conferir, com acesso autorizado, se os convites usados na nuvem apontam para a mesma ficha e qual SHA foi implantado. Não conceder acesso apenas pela igualdade de nomes.
2. Revalidar visualmente as duas correções e a apresentação recolhível do portal reformulado; nenhuma captura nova foi produzida nesta rodada.
3. Executar OCR real com runtime/dados locais configurados antes de declarar seu aceite. IA alimentar externa continua dependendo de fornecedor e autorizações.
4. Revisar e publicar a branch somente mediante autorização pertinente. Dados reais e modo de produção não são escopo desta revisão.
