# Alterações

## Correção das dependências e prévia do PR #1 — 29/10/2026 — auditorias e testes aprovados; envio pendente

Relatório remoto `auditoria-java-40934407518-2` recebido e SHA-256 conferido. A NVD/cache funcionaram no run de `ea12f70`; TypeScript falhou exclusivamente no novo CVE-2026-118664, e Java nos alertas de dependências. Corrigido decode-uri-component 0.5.1, preservado patch CJS/ESM e acrescentada regressão com 32 mil sequências distintas, limitada por processo. Spring 6.2/6.5 só oferece os patches necessários em suporte pago: atualizado para Boot 4.1.2 / Framework 7.0.10 / Security 7.1.2, Java 21 mantido. Adaptados Jackson 3, pacotes de testes e módulos; OpenAPI autenticado preservado, dependência Swagger UI já desativada removida. Sem supressões ou mudança do limiar.

Aprovados: 81 Java (28 unitários + 53 integrações com PostgreSQL real e OCR, zero falhas/erros/ignorados); 88 frontend; TypeScript/lint; exports Expo web/Android/iOS Hermes; pacote executável; 17 E2E em 1,6 minuto com portal otimizado e API nova. 45 rotas e 37 esquemas OpenAPI preservados; única diferença é ordem dos campos de `required`, sem alteração semântica. Banco original continua V1–V9; V1–V10 do PR intactas. Corrigida seleção do JDK no Windows PowerShell 5.1 e validada em 5.1/7.6.5. Prévia nas portas 3000/8081, API 8080, usando banco sintético do PR. Auditoria Java integral aprovada no Windows normal: 42 dependências, nenhum alerta, índice CPE/NVD/RetireJS concluídos, limiar CVSS 7 e falha em erro mantidos. Auditoria pnpm: 923 dependências, um baixo deepmerge, zero críticos/altos/moderados. Scanner de segredos aprovado. Correção revisada para commit/envio no mesmo PR autorizado; novo CI remoto ainda pendente, sem merge/deploy. [Relatório](docs/evidencias/CORRECAO_DEPENDENCIAS_PR1_2026-10-29.md).


## Auditoria NVD do PR #1 — 29/10/2026

Dependency-Check 12.2.2 e feeds oficiais compactados substituem a carga paginada da API sem chave. Validação de atualidade, atualização obrigatória separada, cache salvo antes da análise e relatórios preservados; gate CVSS >= 7/falha em erro mantido. 12 testes novos, Actionlint e carga completa NVD em cerca de 5 minutos aprovados; análise integral pendente de CI Linux por restrição do índice CPE no sandbox local. Nenhuma mudança de código ou dependências da aplicação.
## Correção de CI do PR #1 — 29/10/2026

Resolução do Next compatível com instalação hoisted nos E2E e scripts locais; node-forge 1.4.2/Zod 4.6.6 restritos ao Expo CLI, Vitest 4.1.12 e testes dos consumidores reais; auditoria pnpm no limite high aprovada sem suprimir alertas. Cache, retries, conexão/tempo limitados e diagnóstico para NVD, mantendo falha em erro/CVSS >= 7; browser em Ubuntu 24.04 com build otimizado do Next. E2E ajustados aos rótulos/catálogo recebidos, mantendo validação do banco, das travas, do salvamento assíncrono e da CSP. Validação local: 81 Java, 88 frontend e 17 E2E aprovados; OWASP/novo CI remoto pendentes. Evidências e pendências em docs/evidencias/CORRECAO_PR1_CI_2026-10-29.md; sem merge ou nova publicação nesta etapa.
## G16 — vínculo profissional de grupo de atividades — 22/10/2026

O Perfil Funcional passa a aceitar o campo opcional approvedCatalogGroup: NAO_DEFINIDO, COM_RISCO_QUEDA_SENTADO ou SEM_RISCO_QUEDA_EM_PE. Sem migration, o serviço codifica o estado validado em marcador canônico no campo existente physical_activity_profile.professional_guidance, remove-o da resposta e mantém o texto clínico público intacto. Portal, app e testes usam o mesmo contrato: apenas grupo definido pelo profissional, sem alerta, restrição impeditiva ou falha da verificação do dia mostra os cinco materiais educativos correspondentes; autorrelato continua um POST separado.

## G16 — catálogo local de mídias aprovadas — 21/10/2026

Catálogo estático versionado com dez exercícios e suas capas, quadros, GIFs e MP4 locais, separados nos dois grupos fornecidos pela gestão. Player `expo-video` incluído. Não há prescrição, classificação automática de risco ou POST acionado pela visualização: ausência de dados, alerta/restrição e protocolo clínico pendente mantêm a sugestão individual indisponível.

## Transferência técnica e publicação de fonte — 20/10/2026

Consolidação do código existente e manuais específicos,catálogo58operações/dicionário33tabelas/inventário32grupos;pendências40IDs e plano21pacotes. Gitignore reforçado e CI com credenciais efêmeras mascaradas. Novos testes74Java/69frontend/17E2E e builds aprovados;2altos e privilégio local excessivo documentados. Publicação só do fonte/documentação,sem deploy/lojas ou mudança de visibilidade. Relatório em docs/RELATORIO_TRANSFERENCIA_E_PUBLICACAO.md.

## 0.1.0 — 2026-10-16

- DONE: leitura integral do kit e visualização dos anexos A/B/C, mapa rastreável, MVP, ADR, riscos, custos e backlog por fases.
- DONE: monorepo Next/Expo/Java 21, contratos TypeScript derivados de OpenAPI, tokens visuais, PostgreSQL/Flyway, autenticação opaca, clínicas, vínculos, auditoria, autorização, perfis e contagens persistidas.
- DONE: testes de isolamento, expiração/revogação, CORS, limites de corpo/login e fluxos web; builds Next/Webpack e Expo web verificados conforme STATUS.
- IN_PROGRESS: finalização operacional da Fase 1 (CI remota e revisão dos alertas transitivos), preparação para distribuição.
- BLOCKED: dados reais, recomendações clínicas, hardware real e publicação dependem das aprovações/credenciais descritas.
- NOT_STARTED: Fases2–7 completas permanecem no backlog, sem perda de funcionalidades.

## Retomada — 2026-10-17

- Preservada a organização Expo raiz, Next web e Java backend/demo e o contrato JSON/SQL existente.
- Corrigido bloqueio da V5 contra o histórico do Flyway; RLS nas tabelas do sistema verificada em PostgreSQL real.
- Corrigidos redirecionamento de rotas internas, seleção obrigatória nas etapas de atividade e interação web antes da hidratação; formulários próprios usam POST.
- Acrescentada visão geral do paciente com resumo real e aba de alimentação; ajustes de boas-vindas, fotos, filtros e cores do gráfico, sem substituir persistência por dados fixos.
- Restore isolado validou login, isolamento por clínica e foto cifrada antiga com a chave preservada. Evidências e pendências atuais substituem o estado inicial da fundação em docs/STATUS.md.

## Prioridade de telas — 2026-10-17

- Cadastro completo e edição profissional, V6 aditiva, validações e escopo; contato próprio versionado.
- Cadastro/ativação destacado, mostrar senha, Home com resumo real e navegação fixa, perfil, configurações/acessibilidade e orientações.
- Atividade com escolha ilustrativa para registrar o que já foi realizado, conclusão/fila/reenvio e semana real com filtros/paginação.
- 52 novos PNG organizados e componentes reais preservados; 42 capturas e 35 comparações.
- 5 unitários Java + 20 integrações; 32 unitários frontend; 11 E2E em produção; build Next e bundles Expo/Hermes para Android/iOS/web. Sem publicação nem teste físico nativo.


## Execução local e acompanhamento — 19–20/10/2026

Atalho Windows/PowerShell 7 e guias completos de início, testes manuais, checklist/inventário; banco17.9 preservado com autenticação SCRAM, Java 21 explícito, controle de serviços/logs e privacidade dos diagnósticos. Corrigidos GETs opcionais com JSON vazio (agora204), acesso às orientações, resultado de pressão sem ids e nome acessível do campo alimentar. Idade derivada do cadastro, períodos de pressão e autorrelatos completos em sete datas no portal, sem simular ingestão ou total parcial.26 testes Java,38 frontend e 12 E2E aprovados;7 E2E após reinício; builds/export e 52 capturas reais com 35 pares/3 painéis. Pendências clínicas/nativas/fornecedores e auditoria0 críticos/2 altos/2 moderados permanecem explícitas. Sem publicação ou commit/push.

## 20/10/2026 — profissionalização e transferência

Preferências persistentes V7/versão, autoria e totais completos; linguagem/CSP/ambiente revisados; dois moderados corrigidos, dois altos pendentes; backup/restoreV1–V7. Finalizadas 52 capturas/35 pares/3 painéis+2cenas390 px, alinhamento do formulário/paginação e compatibilidade Expo preview. Quatro manuais técnicos/matriz entregues; evolução específica de exercícios/IA reservada ao outro dev. Resultados anteriores 31 Java/40 frontend/13 E2E preservados; regressão dirigida nesta retomada passou. Ver relatórios atuais; nenhuma publicação ou commit.

## 20/10/2026 — acesso do paciente sem senha

CPF/nascimento e aparelho autorizado; código de quatro números/10 minutos emitido com conferência presencial e reautenticação profissional; HMAC/limites no PostgreSQL, rotação, renovação e revogação. V8 aplicada preservando dados e V1–V7; senha profissional mantida, senha legada de paciente recusada. Contato opcional compartilhável. 48 Java/58 frontend/14 E2E aprovados, builds/export e sete capturas; restore V8 com chave HMAC/credenciais revogadas no clone passou. Sem publicação/commit/push e sem novas funções específicas de exercícios/IA.

## 20/10/2026 — Cadastro, SMS e interface

Barra compartilhada fora da rolagem, indicador de demonstração separado, logo original nítida e configurações responsivas. Telefone obrigatório/E.164 e troca profissional com revogação; CPF estrutural/duplicado. V9 aditiva/RLS, porta SMS/Twilio e caixa LOCAL cifrada; código removido da resposta profissional. 74 Java/69 frontend/17 E2E, builds e preservação aprovados localmente. Auditoria mantém dois altos. Levantamento de 40 pendências/14 escopos verificados e plano de 21 pacotes, com manuais delegados atualizados. Sem envio real, consulta oficial, ensaio físico ou publicação.
