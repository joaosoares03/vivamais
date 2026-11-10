# Viva+ — manual de continuidade para desenvolvedores

**Consolidação GitHub e transferência:** entrada técnica principal em [MANUAL_TECNICO_COMPLETO_VIVAMAIS](MANUAL_TECNICO_COMPLETO_VIVAMAIS.md), com [inventário](INVENTARIO_COMPLETO_FUNCIONALIDADES.md), [rastreio de implementação](COMO_FORAM_IMPLEMENTADAS_AS_FUNCIONALIDADES.md), [ambiente novo](GUIA_COMPLETO_AMBIENTE_DESENVOLVIMENTO.md), [testes](MANUAL_COMPLETO_TESTES_DESENVOLVEDOR.md), [banco](ARQUITETURA_BANCO_DADOS.md), [plano](PLANO_TECNICO_CONTINUIDADE_DESENVOLVIMENTO.md) e [índice](INDICE_DOCUMENTACAO.md). V9/SMS permanece vigente; histórias anteriores não autorizam login de senha do paciente.

**Entrega V9/SMS:** [guia de cadastro/ativação](CADASTRO_E_ATIVACAO_SMS.md), [inventário completo de pendências](LEVANTAMENTO_COMPLETO_PENDENCIAS.md) e [plano técnico por pacote](PLANO_IMPLEMENTACAO_PENDENCIAS.md). Código saiu da resposta profissional; celular obrigatório em novos cadastros, troca assistida e LOCAL cifrado explícito. Outro desenvolvedor mantém exercícios/IA.

Atualizado em 20/10/2026. Entrada principal para assumir o projeto sem reconstruí-lo. Ler também AGENTS.md, README.md, PROGRESSO.md e [estado atual](STATUS.md). [Pedido desta transferência](product/PEDIDO_TRANSFERENCIA_DEV_2026-10-20.md).

Atualização do acesso em 20/10: [paciente sem senha, V8 e aparelhos autorizados](ACESSO_PACIENTE_SEM_SENHA.md). O login por senha permanece somente profissional/admin. O relatório mais recente está em [evidências do novo acesso](evidencias/ACESSO_PACIENTE_2026-10-20.md).

## 1. Produto e divisão de responsabilidades

Viva+ / Pulso em Dia organiza o acompanhamento de pacientes por uma equipe de saúde: pressão, planos/autorrelatos de medicamentos, fotos de refeições, atividades voluntárias, diário transcrito e consultas. Paciente utiliza Expo; profissional/admin utiliza portal Next.js. Uma API Java e PostgreSQL compartilham os registros, sem tabelas expostas diretamente aos clientes.

A execução local permanece restrita a pessoas/imagens/registros fictícios. Não é diagnóstico, atendimento de urgência ou monitoramento em tempo real. Exercícios específicos e IA agora pertencem a outro desenvolvedor; o responsável geral mantém cadastro, autenticação, navegação, preferências, portal e segurança transversal.

- [Transferência de exercícios](TRANSFERENCIA_DEV_EXERCICIOS.md)
- [Transferência de IA/OCR](TRANSFERENCIA_DEV_INTELIGENCIA_ARTIFICIAL.md)
- [Matriz e coordenação](MATRIZ_RESPONSABILIDADES_DESENVOLVIMENTO.md)
- [Relatório da profissionalização](evidencias/PROFISSIONALIZACAO_VIVAMAIS_2026-10-20.md)
- [Fechamento da retomada, capturas e validações novas](evidencias/RETOMADA_E_TRANSFERENCIA_2026-10-20.md)

## 2. Tecnologias verificadas

| Parte          | Versão/decisão atual                                                                           |
| -------------- | ---------------------------------------------------------------------------------------------- |
| App            | React Native 0.86.3, Expo 57.0.21, Expo Router 57.0.28, React 19.2.3                           |
| Portal         | Next 16.4.2, React 19.2.3, TypeScript 5.9.3, Tailwind 4.1.14 e CSS existente                   |
| API            | Java 21, Spring Boot 3.5.16, Maven Wrapper 3.9.11, JDBC/JdbcTemplate                           |
| Banco          | PostgreSQL 17.9 local, Flyway gerenciado pelo Spring, migrações V1–V9                          |
| Ferramentas JS | Node 24.15.0 local; engines >=22.16 e <25; pnpm 10.28.2 fixado                                 |
| Testes         | JUnit/MockMvc/Testcontainers ou PostgreSQL externo isolado; Vitest 4.1.11; Playwright 1.56.1   |
| Fotos/OCR      | ImageIO/AES-GCM, Tesseract nativo ou tesseract.js 7.0.0                                        |
| Nativo         | SecureStore, expo-sqlite/SQLCipher, notificações; export verificado, aparelhos ainda pendentes |

Não instalar pnpm 11 global para regravar o lock nem trocar Java/PostgreSQL por outra tecnologia. Arquivos package.json, pnpm-lock.yaml e backend/demo/pom.xml são a fonte das versões. Foram aplicados overrides restritos e um patch de interoperabilidade: preservar pnpm-workspace.yaml e patches/query-string@7.1.3.patch.

## 3. Estrutura real

| Caminho                                       | Finalidade                                                                           |
| --------------------------------------------- | ------------------------------------------------------------------------------------ |
| app/                                          | Rotas Expo, incluindo acesso/cadastro/ativação/início/perfil/configurações e módulos |
| components/, hooks/, contexts/                | UI real, consultas, autenticação, preferências e contexto transitório de atividade   |
| services/                                     | Transporte API, domínio TypeScript, fila, lembretes e armazenamento nativo           |
| assets/images/                                | Imagens do aplicativo; individuais contém 52 recursos preservados                    |
| web/app/                                      | App Router Next, páginas profissionais/institucionais, BFF API e proxy.ts em web/    |
| web/components/, hooks/, services/            | Componentes profissionais, domínio e serviços do portal                              |
| backend/demo/src/main/java/com/vivamais/      | controller, dto, service, repositories, security, config e model                     |
| backend/demo/src/main/resources/db/migration/ | SQL Flyway aplicado; imutável após aplicação                                         |
| packages/contracts/                           | Snapshot OpenAPI gerado, tipos/validação compartilhados                              |
| packages/design-tokens/                       | Tokens de identidade visual compartilhados                                           |
| infra/                                        | Execução local, builds/capturas/testes, OCR worker, backup/restauração               |
| tests/e2e/, tests/mobile/                     | Suítes do navegador/app; web possui seus próprios testes                             |
| docs/, referencias_codex/                     | Especificação, decisões, guias, evidências e protótipos                              |
| .local/, ../../work/                          | Artefatos/cache/objetos e apoio privados desta máquina; não entregar no Git          |

Não recriar apps/mobile, apps/web ou services/api. Não criar .git em subpastas. A camada de persistência é JDBC; não presumir entidades JPA/repositories por módulo que não existem. Paths JSON/SQL em inglês são contratos de compatibilidade; novos nomes próprios de código em português brasileiro, sem acentos nos identificadores.

## 4. Preparar e iniciar

Na máquina atual a raiz é C:\Users\joaos\Documents\Codex\2026-10-16\p\outputs\viva-mais. Em outra máquina, usar a própria pasta do checkout e configurar caminhos conforme o [guia Windows](GUIA_COMPLETO_EXECUCAO_LOCAL_WINDOWS.md).

Instalar JDK 21, Node compatível, pnpm 10.28.2 e PostgreSQL 17 ou Docker. O atalho seleciona PowerShell 7. Nesta máquina há JDK 21 instalado, mas java no PATH pode ser Java 8; os scripts selecionam o 21 sem alterar o Windows global.

```powershell
Set-Location 'C:\Users\joaos\Documents\Codex\2026-10-16\p\outputs\viva-mais'
npm.cmd exec --yes --package=pnpm@10.28.2 -- pnpm install --frozen-lockfile
.\Iniciar-VivaMais.cmd
```

O atalho usa o cluster existente, API 8080, portal 3000 e app 8081. Nesta máquina o banco é vivamais, usuário viva, porta 55432; instalação padrão/Compose usa 5432 e usuário vivamais. Não misturar parâmetros. O script não cria/reinicializa um cluster portátil. A senha PostgreSQL e a senha das contas Viva+ são diferentes, privadas e nunca devem ser impressas.

Prévia otimizada local: Iniciar-VivaMais.cmd -Producao. Para recompilar artefatos: -Producao -Recompilar. O modo -Producao significa build otimizado local, com APP_ENV=development, e não liberação institucional para produção. Em automação, -AguardarSinal mantém controlador vivo.

Percurso manual, em terminais separados, usando os helpers existentes:

```powershell
.\infra\executar-local.ps1 -Servico Banco
.\infra\executar-local.ps1 -Servico Backend
.\infra\executar-local.ps1 -Servico Portal
.\infra\executar-local.ps1 -Servico Aplicativo
# Cada servidor mantém seu terminal aberto.
.\infra\executar-local.ps1 -Servico Verificar
```

Os três servidores são comandos para terminais distintos. PostgreSQL precisa estar ativo antes da API. URLs: http://127.0.0.1:3000 e http://127.0.0.1:8081; saúde mínima http://127.0.0.1:8080/actuator/health. A API valida migrations no início. O health não comprova login ou autorização.

Encerrar o conjunto pelo Enter no controlador ou infra/encerrar-local.ps1. O script sinaliza o controlador e encerra somente processos registrados/conferidos; o banco só é parado por ele se foi iniciado nesse conjunto. Não matar processo desconhecido, apagar postmaster.pid ou remover diretório de dados. Os logs privados ficam em .local/execucao. Após interrupção, conferir portas/PIDs antes de reutilizar registro de processos. Não publicar logs sem sanitização.

Expo web mantém o token curto e a fila em memória; cookie HttpOnly do aparelho permite renovar após recarregar. Envios não confirmados podem ser perdidos ao fechar a aba. Sair desliga a renovação automática; CPF/nascimento no mesmo aparelho reabrem o acesso. Aparelho desconhecido exige código. Preferências confirmadas permanecem no PostgreSQL. Nativo requer build compatível com SQLCipher/SecureStore; Expo Go não comprova essas capacidades. Android emulador usa 10.0.2.2; aparelho exige rede/configuração deliberada. Preview EAS usa APP_ENV=preview e API pública HTTPS; production também exige HTTPS. Não colocar chaves privadas em variáveis públicas.

## 5. Banco: modelo e migrações

Organization → UserAccount; Professional possui conta profissional da unidade; Patient pode possuir conta e vínculo PatientProfessionalAssignment. O administrador vê sua unidade; o profissional precisa vínculo; o paciente só vê seu cadastro. Os módulos clínicos referenciam paciente e autor. Sessão guarda hash do token, não o token original.

| Migração aplicada                        | Conteúdo                                                                                                                                       |
| ---------------------------------------- | ---------------------------------------------------------------------------------------------------------------------------------------------- |
| V1\_\_foundation.sql                     | organization,user_account,professional,patient,patient_professional_assignment,auth_session,consent_or_legal_basis_record,audit_event          |
| V2\_\_care.sql                           | account_activation,sync_operation,pressão,medicamentos/versões/autorrelatos,perfil/atividade,diário,consulta e pulseira/configuração           |
| V3\_\_private_files.sql                  | file_object,file_download_grant,pressure_ocr_document,meal_photo e vínculo OCR da leitura                                                      |
| V4\_\_analysis_budget.sql                | food_analysis_attempt e índice do orçamento diário                                                                                             |
| V5\_\_bloquear_acesso_direto_cliente.sql | RLS e revogações em 26 tabelas; tabela técnica Flyway fica fora                                                                                |
| V6\_\_dados_pessoais_paciente.sql        | Dados opcionais/versão do cadastro e CPF único por unidade; não autentica por CPF                                                              |
| V7\_\_preferencias_conta.sql             | Preferências por usuário, versão, tamanho de página permitido, RLS/revogações                                                                  |
| V8\_\_acesso_paciente_sem_senha.sql      | Aparelhos/códigos/desafios/limites persistidos, RLS; revoga acesso antigo dos pacientes sem apagar dados; não altera senha/sessão profissional |
| V9\_\_envio_sms_ativacao.sql | Telefone E.164/versão/confirmação, envio SMS/status/RLS; códigos manuais pendentes invalidados, aparelhos existentes preservados |

São 32 tabelas de aplicação protegidas por RLS e 33 contando flyway_schema_history após V9. JDBC proprietário aplica o escopo por recurso; clientes anon/authenticated/PUBLIC não ganham SELECT direto. Não adicionar políticas permissivas para contornar a API.

Criar apenas novas migrações, verificando numeração livre e coordenando as frentes de desenvolvimento. Nunca repair/clean para esconder checksum divergente. Validar em schema/banco exclusivo de testes e em atualização do estado existente. Não executar DROP/DELETE do banco principal para facilitar ensaios.

[Backup e restauração](operations/BACKUP_RESTORE.md): ensaio atualizado V1–V8, banco exclusivo, objetos e chaves de cifra/HMAC, contagens/checksums/RLS, login/403/foto e adulteração de AES-GCM; credenciais restauradas de pacientes revogadas no clone. Chave do envelope separada do backup, diretórios com ACL privada. Arquivos cifrados e chave precisam acompanhar o dump. O procedimento não comprova Supabase/Docker ou retenção institucional.

## 6. Autenticação, cadastro e proteção

Cadastro de paciente é profissional; APP exige CPF e nascimento; todo novo paciente exige celular brasileiro válido. A solicitação de SMS com quatro números exige conferência presencial de identidade/celular e senha do profissional, com uso único/dez minutos e limites persistidos. O paciente não cria senha: CPF/nascimento identificam, aparelho autorizado ou verificação são obrigatórios. Contas anteriores permanecem, com complementação autorizada dos dados ausentes. Solicitação de SMS aceita na recuperação revoga aparelhos/sessões/código anterior; falha de envio preserva aparelhos anteriores. A troca de celular exige reautenticação/conferência profissional e revoga acesso. Código nunca retorna no portal/API; usar caixa LOCAL somente em desenvolvimento/teste explícito. Não há autoinscrição de profissional.

API usa token opaco aleatório e sessão de 30 minutos/revogável. Profissional usa BCrypt 12 e limitação em memória por e-mail/IP 15 minutos, incluindo acessos bem-sucedidos. Paciente usa token de aparelho de 256 bits/30 dias absolutos, com rotação e limites no banco; detalhes no manual específico. Não desativar limite para fazer testes passarem. Escala horizontal exigirá mecanismo compartilhado aprovado.

Portal guarda sessão em cookie HttpOnly/Secure/SameSite Strict e valida Origin nas mutações do BFF. Browser do app mantém token curto em memória e autorização por cookie HttpOnly/Secure/SameSite com Origin obrigatório; nativo usa SecureStore. Nunca salvar token em localStorage/AsyncStorage ou imprimir resposta de login. Arquivos privados usam concessão temporária e revalidação do acesso.

PreferenciasController usa a identidade da sessão; PUT exige versao e responde 409 se desatualizada. A preferência não altera o papel/permissão do usuário. Cadastro demográfico também tem versão; nem todo formulário clínico existente possui esse recurso, conforme manuais específicos.

Erros não devem expor SQL, stack trace, payload ou segredo. Portal mantém CSP com nonce; usar classes CSS em vez de style inline bloqueado. Novas tabelas precisam de RLS/revogação e autorização por recurso. Auditoria conserva ator/organização/ação sem corpo clínico nos logs.

APP_ENV=production ou perfis Spring production/prod recusam bootstrap/modelo sintético. O schema possui CHECK(demo_only); mudar somente uma flag não habilita dados reais. Liberação exige decisões e migração institucional próprias, credenciais, TLS, segurança e ensaios; não contornar o bloqueio.

## 7. APIs: encontrar o contrato, não duplicá-lo

Snapshot: backend/demo/openapi.json. API autenticada /v3/api-docs só em desenvolvimento e teste (desligada nos perfis nuvem e producao); Swagger UI está desativada. Tipos: packages/contracts/src/generated.ts; aliases em packages/contracts/src/index.ts e cadastro.ts. Após mudança de contrato, atualizar snapshot autenticado sem registrar token, gerar tipos com pnpm contracts:generate e sincronizar pacotes pelo script existente.

| Área                 | Rotas relevantes (prefixo /api/v1)                                                                                         |
| -------------------- | -------------------------------------------------------------------------------------------------------------------------- |
| Acesso               | POST /auth/login profissional e /auth/logout; paciente: /auth/paciente/iniciar,/verificar,/renovar,/esquecer; GET /auth/me |
| Unidade/painel       | GET /organization,/dashboard,/system/modules                                                                               |
| Cadastro             | POST /patients; GET /patients,/patients/me,/patients/search,/patients/{id}; dados pessoais/contato em /pacientes/{id}/...  |
| Vínculos/recuperação | /patients/{id}/assignments e /revoke; /access-reset; GET /professionals para administração                                 |
| Pressão              | /patients/{id}/readings; GET /pacientes/{id}/registros-pressao/{idRegistro}                                                |
| Medicamentos         | /patients/{id}/medications,/medication-events,/medication-reports; /medications/{plan}/history                             |
| Clínico              | /patients/{id}/diary,/consultations,/summary,/export                                                                       |
| Preferências         | GET/PUT /conta/preferencias                                                                                                |
| Atividade/imagens    | Contratos detalhados nos dois manuais especializados                                                                       |
| Pulseira             | /patients/{id}/device e /device/configurations; simulador explícito, sem hardware ensaiado                                 |

Consultar OpenAPI para métodos/payloads/status exatos. O BFF não é proxy arbitrário: novas rotas exigem allowlist e teste de CSRF/autorização. Manter uma única API de negócio; não duplicar persistência no Next ou app.

## 8. Estado verificável e limites

Funcionam com API/banco: autenticação/ativação, cadastro/edição/telefone, pressão manual e OCR confirmado, medicamentos/versionamento/autorrelatos, diário, fotos privadas/histórico, autorregistro/semana de atividade, consultas/resumo/exportação recente, preferências e navegação. Exportação do resumo não é prontuário integral: seleção de até 20 registros por categoria é declarada; totais globais são separados.

Parciais: fidelidade visual dos 36 protótipos, fluxo institucional de suporte/exclusão, notificações e proteção nativa ainda sem aparelho, perfil funcional sem prescrição/catálogo, IA alimentar apenas porta opcional. A matriz visual registra diferenças reais; 52 assets não equivalem a 52 rotas.

Pendentes externos: critérios/conteúdo clínico/vídeo, hardware/protocolo, fornecedor alimentar, revisão institucional/jurídica/canais/retenção, modelo produtivo, credenciais/ensaios externos e lojas. Hosting econômico Vercel Hobby/Railway Hobby/Supabase Free/EAS mantido; não há publicação autorizada.

Segurança JS: 0 críticos/2 altos/0 moderados na revisão. Os altos em node-forge/Expo CLI e braces/Metro continuam sem correção indicada nas fontes consultadas; ver [análise e alternativas](DEPENDENCIAS_SEGURANCA.md). Não ocultar, forçar major incompatível ou declarar produção liberada. CI remota/OWASP/gitleaks não foram executados nesta retomada.

## 9. Testar mudanças com comandos reais

Na raiz e usando o Node instalado:

```powershell
node node_modules/typescript/bin/tsc --noEmit -p tsconfig.json
node node_modules/typescript/bin/tsc --noEmit -p packages/contracts/tsconfig.json
node node_modules/typescript/bin/tsc --noEmit -p packages/design-tokens/tsconfig.json
node node_modules/eslint/bin/eslint.js app components contexts hooks services web packages tests/mobile
node node_modules/vitest/vitest.mjs run --config vitest.mobile.config.ts
Push-Location web
node node_modules/typescript/bin/tsc --noEmit
node node_modules/vitest/vitest.mjs run
node node_modules/next/dist/bin/next build --webpack
Pop-Location
.\infra\validar-interface-local.ps1 -Producao
```

Use o CLI Vitest de web dentro de web; usar o da raiz ali já causou instâncias duplicadas de React. E2E exige serviços ativos, Chromium e credencial sintética privada; o helper filtra saída/sanitiza snapshots e não trata ausência de senha como sucesso.

Para Java, usar Java 21/Maven Wrapper e **banco exclusivo viva_test**, nunca vivamais. O JAR em execução pode bloquear o repackage no Windows: encerrar primeiro os serviços registrados pelo helper. Se o controlador também parar o PostgreSQL que havia iniciado, iniciar apenas o banco novamente. Nesta máquina, com API/portal/app encerrados:

```powershell
.\infra\executar-local.ps1 -Servico Banco
. .\infra\ambiente-local.ps1
$configuracao = Obter-ConfiguracaoViva
Selecionar-JavaViva $configuracao
$credencial = Get-Content (Join-Path $apoioViva 'postgres-local-credentials.json') -Raw | ConvertFrom-Json
$env:TEST_DATABASE_URL = 'jdbc:postgresql://127.0.0.1:55432/viva_test'
$env:TEST_DATABASE_USER = $credencial.user
$env:TEST_DATABASE_PASSWORD = $credencial.password
$env:TEST_OCR_NODE_SCRIPT = Join-Path $raizViva 'infra/ocr-worker.mjs'
$env:OCR_DATA_DIRECTORY = Join-Path $apoioViva 'ocr-data'
try { .\backend\demo\mvnw.cmd -f backend/demo/pom.xml "-Dmaven.repo.local=$apoioViva\m2" verify }
finally { $env:TEST_DATABASE_PASSWORD = $null; $credencial = $null }
```

Em outra máquina, configurar TEST_DATABASE_URL/USER/PASSWORD do próprio banco de testes, ou usar Testcontainers com Docker. As integrações criam schemas aleatórios e removem somente seus schemas de teste. MockMvc usa impressão desativada. Não imprimir falhas com senhas/CPF; preservar filtros dos helpers. Após o verify, reiniciar os serviços pelo atalho, preservando banco/objetos.

Para build nesta sandbox, usar infra/preparar-build-web.mjs e VIVA_BUILD_DIRETORIOS_PREPARADOS=1 quando houver EPERM em .next. Para Expo, Configurar-FrontendViva configura TEMP/TMP graváveis antes de expo export --platform all; não desabilitar Hermes para contornar erro. Os guias Windows detalham essa exceção local.

A rodada de profissionalização anterior à transferência passou 31 Java, 40 frontend e 13 E2E, com Next/Expo all e restore. Nesta retomada foram executadas apenas validações pertinentes e capturas; consultar o relatório de fechamento para distinguir resultados herdados de novas execuções. Não repetir toda a suíte apenas para ler documentos; alterações de funcionalidade/contrato exigem regressão apropriada.

## 10. Como contribuir e coordenar

1. Ler o estado atual e executar git status/diff antes de editar. Preservar stage e código anterior. Sem reset --hard, clean, commit, push ou deploy sem autorização.
2. Definir a área responsável na matriz. Exercícios e IA não devem editar simultaneamente os compartilhados CuidadoService, ArquivoPrivadoService, ModelosCuidado, TelaCuidado, BFF, contratos ou migrações sem coordenar.
3. Manter pt-BR na UI e em novos identificadores próprios. Respeitar convenções do framework e contratos antigos. Separar rota, componente, hook/context e serviço; não colocar SQL ou credencial no cliente.
4. Ao criar persistência, usar migração nova, constraints/índices, RLS/revogação, autorização, autoria/idempotência/versão quando necessário. Coordenar numeração Flyway antes do trabalho de ambos.
5. Tratar carregamento, erro, vazio, sessão expirada, falha de rede e concorrência sem números inventados. Datas UTC e apresentação America/Sao_Paulo. Nunca inferir ingestão/diagnóstico por falta de resposta.
6. Atualizar OpenAPI/tipos e executar testes proporcionais: banco real para SQL, isolamento/CSRF para acesso, TS/UI/E2E para fluxos e ensaio físico quando a capacidade for nativa.
7. Comparar capturas com referências reais, registrar diferenças e atualizar PROGRESSO/STATUS/PROXIMA_EXECUCAO/manual pertinente. Não declarar módulos inteiros concluídos pela existência de telas.

## 11. Continuidade por prioridade

P0: coordenar responsáveis/arquivos compartilhados e aprovações; manter recursos clínicos não aprovados indisponíveis. Acompanhar dois altos upstream e planejar ensaios de segurança/CI. Critério: decisões documentadas e nenhum bloqueio mascarado.

P1 exercícios: catálogo/conteúdo versionado aprovado, passos/vídeo e avaliação/plano profissional, conforme seu manual. P1 IA: fornecedor/contrato aprovados, validação estrita, qualidade OCR/tempos e versão/cache de análise. Cada trilha tem aceite próprio, banco/contrato/UI/testes integrados.

P2 geral: refino visual por tela, ensaios Android/iOS, limites/confiabilidade operacional, revisão institucional/direitos e modelo produtivo. Credenciais, serviços pagos, publicação e decisões clínicas/jurídicas indispensáveis continuam exigindo intervenção do responsável humano. Não há estimativa de prazo comprometida.

## 12. Checklist de entrega do próximo desenvolvedor

- [ ] Código/fluxo real implementado na área acordada, sem remover funções existentes.
- [ ] API e UI conectadas; contratos/tipos regenerados e compatibilidade verificada.
- [ ] Migração aditiva testada no PostgreSQL, com RLS/constraints/índices pertinentes.
- [ ] Organização/vínculo/ator, CSRF, sessão, idempotência e concorrência testados.
- [ ] Dados e segredos protegidos; sem payloads/imagens/credenciais em logs/Git.
- [ ] Carregamento/erro/vazio/rede/fuso e limites clínicos claros.
- [ ] Conteúdo e fornecedor aprovados antes de ativar recomendações/inferência externa.
- [ ] Testes automatizados pertinentes e integração com demais módulos aprovados.
- [ ] Capturas/acessibilidade verificadas; limites de aparelhos explicitados.
- [ ] Backup/restore atualizado quando persistência/arquivos mudarem.
- [ ] Documentação, evidências, matriz e próximo passo atualizados.
- [ ] Pendências restantes registradas sem afirmar prontidão produtiva indevida.
