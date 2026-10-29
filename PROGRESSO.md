# Progresso Viva+

## Correção das dependências e prévia do PR #1 — 29/10/2026 — auditorias e testes aprovados; envio pendente

Relatório remoto `auditoria-java-40934407518-2` recebido e SHA-256 conferido. A NVD/cache funcionaram no run de `ea12f70`; TypeScript falhou exclusivamente no novo CVE-2026-118664, e Java nos alertas de dependências. Corrigido decode-uri-component 0.5.1, preservado patch CJS/ESM e acrescentada regressão com 32 mil sequências distintas, limitada por processo. Spring 6.2/6.5 só oferece os patches necessários em suporte pago: atualizado para Boot 4.1.2 / Framework 7.0.10 / Security 7.1.2, Java 21 mantido. Adaptados Jackson 3, pacotes de testes e módulos; OpenAPI autenticado preservado, dependência Swagger UI já desativada removida. Sem supressões ou mudança do limiar.

Aprovados: 81 Java (28 unitários + 53 integrações com PostgreSQL real e OCR, zero falhas/erros/ignorados); 88 frontend; TypeScript/lint; exports Expo web/Android/iOS Hermes; pacote executável; 17 E2E em 1,6 minuto com portal otimizado e API nova. 45 rotas e 37 esquemas OpenAPI preservados; única diferença é ordem dos campos de `required`, sem alteração semântica. Banco original continua V1–V9; V1–V10 do PR intactas. Corrigida seleção do JDK no Windows PowerShell 5.1 e validada em 5.1/7.6.5. Prévia nas portas 3000/8081, API 8080, usando banco sintético do PR. Auditoria Java integral aprovada no Windows normal: 42 dependências, nenhum alerta, índice CPE/NVD/RetireJS concluídos, limiar CVSS 7 e falha em erro mantidos. Auditoria pnpm: 923 dependências, um baixo deepmerge, zero críticos/altos/moderados. Scanner de segredos aprovado. Correção revisada para commit/envio no mesmo PR autorizado; novo CI remoto ainda pendente, sem merge/deploy. [Relatório](docs/evidencias/CORRECAO_DEPENDENCIAS_PR1_2026-10-29.md).


## Auditoria NVD do PR #1 — 29/10/2026 — correção preparada; CI remoto pendente

Publicação de `1174688` confirmada no fork/PR. CI remoto: TypeScript, navegador e segredos aprovados; Maven verify aprovado, auditoria Java sem conclusão após 35 minutos de download da API NVD. Implementados feeds oficiais compactados sem chave, Dependency-Check 12.2.2, validação de atualidade, cache após atualização completa e antes da análise, mantendo CVSS >= 7 e falha em erro. 12 testes novos, Actionlint e consulta real dos metadados aprovados. Carga integral NVD concluída localmente em 303.248 ms; análise completa não aprovada por restrição de renomeação do índice CPE no sandbox Windows. Não houve suppression ou alteração de limiar. Aplicação/migrações preservadas. Próximo passo: publicar a correção revisada no mesmo PR e verificar a auditoria integral no runner Linux. [Evidências](docs/evidencias/CORRECAO_NVD_PR1_2026-10-29.md).

## Histórico da primeira correção, antes de sua publicação
<!-- INICIO_CORRECAO_PR1 -->
## Correção do PR #1 — 29/10/2026 — código validado localmente; publicação pendente

Revisão isolada em `codex/corrigir-pr-1`, a partir de `3cc7e95`. A `main` permanece limpa; banco original mantém V1–V9 e 33 tabelas. V1–V10 do PR intactas. Next localizado pela resolução do Node, inclusive no inicializador Windows; overrides restritos de node-forge 1.4.2/Zod 4.6.6, Vitest 4.1.12 em todos os workspaces; consumidores reais do Expo CLI testados. Workflow preserva os gates e acrescenta cache, retries/timeout NVD e Ubuntu 24.04 no browser.

Aprovados nesta execução: 81 testes Java com PostgreSQL real em bancos novos exclusivos; 88 frontend (37 web e 51 app); TypeScript/lint; Next produção; exports Expo web/Android/iOS; contratos reproduzidos; auditoria pnpm com zero críticos/altos/moderados e um baixo; parsers YAML/PowerShell e scanner de segredos do commit/diff. Playwright final: 17 cenários aprovados em 1,5 minuto, sem falhas/ignorados/retries. Seletores ajustados ao catálogo/ícone e ao checkbox confirmado pela API; persistência, isolamento e bloqueio mantidos. CI constrói e testa o portal otimizado, preservando a asserção de zero recusas CSP. A configuração privada local só altera a posse dos servidores para contornar o encerramento bloqueado no Windows. Próxima tarefa: autorizar/publicar as correções na branch do PR e reexecutar os checks remotos. OWASP local sem conclusão por cache H2 somente leitura; falha remota recebida era HTTP 521 da NVD. Nenhum commit/push/merge ou serviço real de SMS/IA. Detalhes em [relatório](docs/evidencias/CORRECAO_PR1_CI_2026-10-29.md).
<!-- FIM_CORRECAO_PR1 -->

## G16 — vínculo profissional de grupo — 22/10/2026

Implementado o estado explícito approvedCatalogGroup no Perfil Funcional, aceitando somente NAO_DEFINIDO, COM_RISCO_QUEDA_SENTADO e SEM_RISCO_QUEDA_EM_PE. Não houve migration nem alteração de V1–V9: o backend persiste um marcador canônico validado dentro de professional_guidance e o retira do GET. O portal permite escolher e mostra o grupo atual; o app filtra o roteiro ativo aos cinco materiais do grupo definido, mas mantém bloqueio por dados ausentes, mal-estar/alerta, pressão não confirmada, restrição e grupo não liberado. Autorrelato permanece independente. Testes novos cobrem os três estados e alertas/restrição; pnpm.cmd typecheck e pnpm.cmd lint passaram. A compilação/teste Java e a geração do snapshot OpenAPI aguardam execução fora da restrição desta sandbox ao cache Maven; não foram declarados aprovados.

## G16 — catálogo local de mídias aprovadas — 21/10/2026

Integrados `assets/images/exercicios/ex01-*` a `ex10-*` em catálogo estático versionado, com os grupos de gestão e capa/dois quadros/GIF/MP4 em telas Expo. A visualização é catálogo, não recomendação: sem dados, com alerta/restrição ou sem protocolo clínico não há seleção individual; o formulário de autorrelato permanece um POST separado e voluntário. `pnpm.cmd typecheck` e `pnpm.cmd lint` passaram. `pnpm.cmd test` não iniciou as suítes web/mobile nesta sandbox porque o esbuild recebeu `Access is denied` ao ler o diretório-pai durante o carregamento da configuração; não registrar como aprovação de testes até repetir em ambiente com essa permissão.

Publicação confirmada em 2026-10-21T00:25:40.4871877-03:00, main, conteúdo 54c92a34bf0c5054a428e6d56277d2257124e30d. Componentes/manuais/privados conferidos no remoto; detalhes em RELATORIO_TRANSFERENCIA_E_PUBLICACAO. Git fonte publicado; implantação/lojas/produção e CI verde não presumidos.

## Histórico anterior à confirmação da publicação


## Consolidação e transferência técnica — 20/10/2026

Pedido atual autoriza commit/push de fonte em origin/main após segurança/integridade, sem deployment,visibilidade,force push ou reescrita. Criados manual técnico,inventário32grupos,rastreio,ambiente do zero,testes,banco/API,padrões/índice e plano canônico;40pendências ampliadas. Testes novos:74Java,69frontend,17E2E,tipagem/lint,Next/Expoall e contratos aprovados;2altos mantidos. Gitleaks/segredos e privilégios JDBC auditados; role local superusuária/BYPASSRLS registrada em P01/G01,sem alterar banco. Estado de commit/push/CI e provas em [RELATORIO_TRANSFERENCIA_E_PUBLICACAO](docs/RELATORIO_TRANSFERENCIA_E_PUBLICACAO.md). Exercícios/IA continuam com outro dev.

## Histórico anterior à consolidação

## Cadastro, SMS e interface — 20/10/2026 — validado localmente

Corrigidos barra compartilhada/rolagem/safe area estrutural e indicador de demonstração separado (development/test/preview); logo original de alta resolução e Configurações responsivas com preferências preservadas. Celular obrigatório em novos cadastros, DDD/E.164, CPF estrutural/duplicado e troca assistida com reautenticação/revogação. SMS desacoplado, Twilio preparado e caixa LOCAL cifrada; nenhum SMS real ou consulta oficial de CPF executados. Portal/API não exibem código. V9 aplicada: 33 tabelas/32 RLS; fontes V1–V8, conteúdo de 30 tabelas e 66 arquivos anteriores conferidos sem perda antes dos novos E2E.

Validação desta entrega: 74 testes Java (22+52), 69 frontend (40 app+29 web), 17 E2E em 1,4 minuto, TypeScript/lint, Next e Expo web/Android/iOS aprovados. Portal em 1366/1440/1920/768/390 px e DPR2, app em 320/375/430 px; 12 rotas com barra fora da rolagem. Auditoria pnpm 10.28.2: 922 dependências, 0 críticos/2 altos/0 moderados, exit1; produção continua bloqueada. Não houve ensaio físico/APK/IPA/operadora/CI remota, stage/commit/push ou publicação.

[Relatório e capturas](docs/evidencias/CORRECOES_CADASTRO_SMS_INTERFACE_2026-10-20.md) · [Guia SMS](docs/CADASTRO_E_ATIVACAO_SMS.md) · [40 pendências/14 escopos verificados](docs/LEVANTAMENTO_COMPLETO_PENDENCIAS.md) · [21 pacotes técnicos](docs/PLANO_IMPLEMENTACAO_PENDENCIAS.md). Exercícios/IA permanecem com o outro desenvolvedor. Próximo: resolver bloqueios gerais por prioridade e homologar fornecedor/aparelhos somente quando autorizados; não reimplementar a base concluída.

## Acesso do paciente sem senha — 20/10/2026 — validado localmente

Pedido integral em docs/product/PEDIDO_ACESSO_PACIENTE_2026-10-20.md. Implementados CPF/nascimento + autorização criptográfica por aparelho, código de quatro números/uso único/dez minutos, limites persistidos/HMAC, renovação/rotação/revogação e telas acessíveis sem senha. Cadastro APP exige CPF/nascimento; e-mail é contato opcional compartilhável, com identificador interno separado. Profissional mantém login e confirma identidade/senha para emitir. V8 aditiva aplicada; fontes/checksums V1–V7, onze contagens clínicas e objetos/chave anteriores conferidos sem perda.

Validação final: 48 testes Java (8+40), 58 frontend (30+28), 14 E2E em 1,2 minuto, TypeScript/lint, Next e Expo all aprovados. Sete capturas sem códigos ativos, comparação visual e formulário profissional alinhado. Backup/restauração real V1–V8 com 32 tabelas/31 RLS e 62 objetos no snapshot; chave HMAC restaurada, credenciais revogadas no clone, foto antiga/login/isolamento/cifra e original preservados. Registro V7 anterior preservado.

Falhas intermediárias de rede/processo PostgreSQL e mock/inspeção de cookie foram corrigidas e repetidas. Produção continua bloqueada por dois altos/revisões institucionais e ensaios físicos; export não é APK/IPA nem execução em aparelho. Sem nova funcionalidade de exercícios/IA, descarte, stage, commit/push ou publicação. Guia: docs/ACESSO_PACIENTE_SEM_SENHA.md; relatório: docs/evidencias/ACESSO_PACIENTE_2026-10-20.md. Próximo: validações físicas/CI/decisões institucionais e continuidade delegada, preservando V1–V8.

Conferência de entrega em [validacao-final.json](docs/evidencias/acesso-paciente/validacao-final.json); exemplo fictício privado disponível para o cadastro de demonstração, fora do repositório.


## Retomada após limite de uso

Estado conferido em 16/10/2026: `git status --short` mostra os arquivos da fundação ainda não versionados; nenhum arquivo foi descartado. Fundação existente preservada. A tentativa interrompida deixou o contrato CARE_API.md e pequenos ajustes em api.ts, sem implementar os módulos clínicos. Não considerar esse contrato uma funcionalidade concluída.

Última entrega verificada: autenticação, clínicas, vínculos, auditoria, portal e Expo conectados à API. Evidências anteriores: 19 testes web, 9 mobile, 5 unitários Java, 10 de integração PostgreSQL e 6 E2E de navegador. No início da tentativa de continuação, os 19 testes web e 9 mobile foram repetidos com sucesso, e a suíte Java voltou a registrar 10 integrações aprovadas. A API 8080 precisa ser reiniciada; web 3000 e preview 8081 respondem.

Backend implementado e verificado em PostgreSQL real: cadastro com convite de ativação de uso único, recuperação assistida com reautenticação e revogação, pressão manual idempotente, planos/versionamento de medicamentos, autorrelatos, diário transcrito, perfil funcional, atividades, consultas, resumo e configurações de pulseira explicitamente simuladas/indisponíveis. Suíte executada: 5 unitários + 14 de integração passaram, incluindo os 10 existentes e 4 novos cenários amplos. V1 preservada e V2 aplicada do zero nos testes. As tabelas e APIs existem; interfaces e E2E dos módulos novos ainda em implementação/verificação, portanto não considerar entrega ponta a ponta concluída.

Portal: cadastro e ficha conectados às novas APIs. E2E real de cadastro → ativação → leitura pelo paciente → leitura no portal → plano de medicamentos → isolamento de outra clínica PASSOU (11,6 s). Reenvio da mesma medição resultou em uma única linha no histórico. TypeScript e ESLint passaram. A primeira tentativa foi interrompida por Fast Refresh durante uma alteração concorrente; a repetição com código estável passou.

Mobile: ativação, pressão manual com confirmação de abreviação, medicamentos/autorrelato, atividade e fila de sincronização implementados. 13 testes unitários passaram, incluindo fila/reenvio/isolamento e cálculo dos lembretes; TypeScript corrigido e export web passou (852 módulos). SQLCipher nativo e notificações locais têm implementação e plugins, mas precisam de build/dispositivo físico para validação. Web usa fila apenas em memória explicitamente identificada.

Arquivos privados, OCR e alimentação: V3/V4 e serviços verificados. `mvnw verify` concluído novamente às 23:22:54 de 16/10: 5 unitários + 16 integrações, zero falhas/erros/skips. Inclui sanitização de imagem, cifra AES-GCM local, autorização cruzada, revogação do link, análise indisponível sem provedor e Tesseract real (118/76, pulso 71) com ausência de leitura antes da confirmação. Adaptador Supabase implementado, sem credenciais e sem teste no fornecedor. Não alterar V1–V4 aplicadas.

Continuação às 23:25: portal com busca paginada na API; mobile com perfil, histórico, gráfico, filtro de período, visualização dos planos e autorrelatos por dia. Cadastro de atividade exige escolha explícita do estado informado. Falha de armazenamento mantém o formulário preenchido. Navegação de retorno usa dismissTo para evitar duplicação da rota anterior. Contrato OpenAPI regenerado da API atual e estados dos módulos atualizados. 19 testes web e 13 mobile repetidos com sucesso; typecheck será repetido após os ajustes de identidade protegida para retomada offline. Export Expo passou com 860 módulos; nenhum teste físico nativo realizado.

Em andamento: E2E completo no Expo web → fila com falha de rede → reenvio idempotente → OCR → foto de refeição → leitura no portal. A primeira execução atravessou todos os passos do aplicativo e falhou no segundo login profissional do teste; ajustado o ensaio para reutilizar sua sessão existente. Não registrar esse teste como aprovado até a execução completa. Operação/release, resumo de consulta ampliado, interface administrativa de vínculos e evidências finais ainda pendentes.

Runtime local desta continuação: PostgreSQL 55432 sessão 38505; API Maven 8080 sessão 64677 com OCR_NODE_SCRIPT e OCR_DATA_DIRECTORY; Next 3000 sessão 36696; preview Expo 8081 sessão 93768. Sessões podem expirar: confirmar health antes de reiniciar. Credenciais sintéticas ficam em work/demo-credentials.json, fora do repositório/pacote; não imprimi-las em logs/chat.

Bloqueios externos preservados: hardware/protocolo desconhecido, critérios clínicos personalizados não aprovados, contas/credenciais de hospedagem e lojas, testes físicos nativos e publicação. Continuar todo o trabalho local independente desses bloqueios.

## Correções obrigatórias de estrutura, português e protótipos (16–17/10)

Prompt de padronização integralmente lido, ZIP AgendAqui realmente inspecionado, 3 montagens e 36 recortes abertos. Checkpoint seguro local 99c7295 antes da refatoração. Expo foi movido para app/components/contexts/hooks/services/assets na raiz; Next para web/; Java para backend/demo em com.vivamais/{config,controller,dto,model,repositories,security,service}. Migrações V1–V4 preservadas. Fontes anteriores continuam no checkpoint; dependências/builds antigos ignorados não foram apagados.

Classes, DTOs e métodos principais Java em português, com JsonProperty e nomes explícitos HTTP preservando o contrato anterior. TypeScript refatorado por símbolos para nomes próprios em português; tipos compartilhados regenerados/renomeados. Restam identificadores auxiliares/comentários e propriedades de compatibilidade a revisar. Campos JSON/SQL já persistidos mantidos por compatibilidade, documentar exceções antes de considerar padronização completa.

Última suíte Java após tradução do domínio: verify PASSOU em 17/10 00:00:56, 5 unitários + 17 integrações, zero falhas/erros/skips. 13 testes mobile e 19 web repetidos com sucesso após organização/primeira tradução. Typechecks/lint passaram; repetir após alterações seguintes. Adicionado depois um GET autorizado em português para resultado de pressão e novo teste de isolamento: esta última alteração ainda aguarda verify.

Quatro screenshots reais iniciais capturadas e abertas: login, painel, cadastro e Expo web início. Comparação encontrou variante do logo, botão e inputs, já corrigidos no código, ainda sem recaptura. Painel permanece diferente: próxima prioridade. As outras capturas/fidelidade ainda pendentes em FIDELIDADE_VISUAL.md. Não declarar 36 telas fiéis/concluídas.

App tem rotas canônicas inicio/acesso/perfil/historico/pressao/medicamentos/alimentacao/atividade-fisica e redirecionamentos das rotas antigas. Pressão agora separa entrada, digitação com confirmação, foto e resultado real; novo fluxo e hooks precisam E2E após export. Atividade possui contexto transitório, serviços, hooks e etapas com perfil/última medição reais; conteúdos personalizados/vídeo corretamente bloqueados, sem regras inventadas.

Quatro objetos cifrados e a chave existentes em services/api/.local/private-files foram preservados em .local/private-files; chave vazia anterior arquivada em .local/estrutura-anterior. Reiniciar API com FILES_DIRECTORY absoluto dessa pasta, pois o processo anterior carregou a chave vazia e foi encerrado.

Backup/restore real: cliente PostgreSQL 17.11 obtido do fornecedor oficial, pg_dump do banco sintético vivamais restaurado em viva_restore_20261017: 4 migrations, 10 pacientes e 4 metadados de objetos. Sessões restauradas revogadas e códigos/grants removidos só no banco restaurado. Dump 85755 bytes, SHA256 06cd694f666b432ecd99138b91fc63581797198a1879e18e018e5fef7445c7f2. Cópia AES-GCM decifrada e comparada byte a byte; chave fora do repositório. Ainda testar login/permissões/fotos com API contra o banco restaurado.

Runtime: PostgreSQL sessão 38505; Next 3000 sessão 40330; preview Expo 8081 sessão 14579. API foi parada para preservar objetos/chave e empacotar domínio traduzido. O JAR atual precisa novo verify e reinício; não tratar health como disponível até verificar. Export Expo da raiz passou com 880 módulos antes das etapas/hook de pressão mais recentes; reexportar. Credenciais/ferramentas/dumps ficam em work fora de Git/outputs publicados.

## Retomada efetiva em 17/10/2026

Git inicial limpo em b460643 (first commit), incluindo o trabalho anterior; nenhum stage/commit/push nesta retomada. STATUS da fundação estava obsoleto e PROXIMA_EXECUCAO não existia: corrigidos com preservação do documento antigo. Confirmado o ponto interrompido: ajuste de estrutura/português/36 telas, com V5 e autenticação traduzida ainda sem validação final.

Corrigido bloqueio real da V5 contra a tabela do próprio Flyway antes de sua primeira aplicação bem-sucedida. Maven verify passou: 5 unitários + 18 integrações PostgreSQL, zero falhas/erros/skips. V1–V4 intactas. V5 aplicada no banco sintético existente e restaurado. API usa a chave preservada em .local/private-files.

Restore agora verificado por API em 8082: login novo, acesso cruzado de foto negado (403), objeto cifrado antigo decifrado e entregue (14826 bytes). API auxiliar encerrada após o ensaio; banco original preservado. Script infra/verificar-restauracao.mjs reproduz as asserções sem imprimir credenciais.

Correções: telas protegidas do componente Cuidado redirecionam ao acesso em vez de carregar indefinidamente; botões de etapas exigem resposta; nomes auxiliares da autenticação em português; ilustração de boas-vindas, foto selecionada antes do envio, filtros rápidos de pressão e legendas vermelho/azul. Ficha web ganhou visão geral baseada em summary real e aba de alimentação, preservando os formulários existentes.

13 testes mobile + 19 web passaram. Build Next passou usando o CLI do pacote web; export Expo passou. Verificação final após o último lote e E2E ainda em execução; não marcar toda a fidelidade como concluída. Próximas tarefas: fechar regressões E2E, recapturar/comparar telas e documentar diferenças restantes.

## Encerramento verificável do lote de retomada — 17/10

Resultado de alimentação com rota própria e GET autorizado implementado; testes de autorização acrescidos e Java verify novamente aprovado (5 unitários + 18 integrações, sem skips), log work/java-retomada-refeicao-verify.log. OpenAPI/tipos atualizados; regeneração determinística e sincronização segura de pacotes locais verificadas.

Corrigidas corrida de hidratação (cadastro/abas antes dos eventos ativos) e resposta atrasada que podia aparecer sob outra aba. Regressão E2E atrasa uma leitura, troca para medicamentos e confirma que a resposta antiga não substitui o plano. Tabelas e formulários profissionais separados; nova consulta criada pela UI e confirmada no BFF.

Validação final: TypeScript e lint passaram; 13 unitários app + 19 web passaram; build Next e export Expo passaram. 10 E2E em desenvolvimento e 10 em produção local passaram, sem skips; produção final 48,3 s. Cookie Secure não foi enfraquecido: leitura de consulta do teste usa o contexto autenticado do navegador. Restore com foto antiga já aprovado permanece registrado. Auditoria JS continua com 2 altos/2 moderados, zero críticos; não declarar CI integralmente verde.

35 capturas finais de navegador e três painéis de comparação gerados e abertos. Matriz de 36 referências atualizada com diferenças/pendências explícitas; notificação nativa sem captura. NÃO há entrega idêntica dos 36 protótipos nem liberação de lojas. Cadastro demográfico/edição/CPF, conclusão/visão semanal de atividade e ajustes de nomenclatura/visual são o próximo trabalho local. Aprovações clínicas, vídeo, hardware, contas e ensaios nativos continuam pendentes. Nenhum commit/push/stage ou descarte de alterações nesta retomada.

Serviços ao fim deste lote: portal de produção local 3000, Expo preview 8081, API 8080 e PostgreSQL 55432. Health/rotas públicas/preview retornaram 200. API reiniciada depois dos ensaios, mantendo banco e chave, para liberar a janela de tentativas consumida pelos testes. Git diff --check passou; stage continua vazio e V1–V4 intactas.

## Prioridade de telas e 52 imagens — 17/10/2026 (em validação de navegador)

Pedido integral do novo anexo lido; ZIP contém 52 PNG, manifesto e prévia. Originais organizados em referencias_codex/imagens_individuais e copiados sem reamostragem para assets/images/individuais e web/public/images/individuais. Logos, personagens, humor, ações e exercícios integrados progressivamente. Imagens de menu incluem texto rasterizado; controles continuam sendo componentes reais com rótulos acessíveis.

Cadastro demográfico e edição profissional implementados com V6 aditiva, preservando V1–V5, CPF opcional com dígitos verificadores e unicidade por unidade, nascimento/contato, dados pessoais somente por autorização e versão para conflitos de edição. Paciente pode alterar seu telefone; e-mail de contato não altera login. Testes Java reais: 5 unitários + 20 integrações, sem falhas/erros/skips. Primeira execução encontrou PostgreSQL inacessível após retomada do runtime; serviço existente foi reiniciado, recuperou WAL e a execução completa passou. V6 aplicada no banco sintético existente.

Home com resumo da API, atalhos de lembretes/configurações, ativação/cadastro orientado, senha visível/oculta, edição de contato, ampliação efetiva de textos, orientações da equipe e semana de atividades com totais reais. Portal identifica acesso do paciente e retoma painel quando cookie profissional ainda válido. Fluxo Playwright novo passou em produção local: cadastro completo → edição → ativação pela UI → login → módulos → registro e semana → histórico → edição do telefone refletida no portal → acessibilidade → lembretes → saída (6,8 s). Ainda repetir regressões completas e capturas após os últimos ajustes.

TypeScript, lint, 13 testes mobile e 19 web passaram. Export Expo e build Next passaram; sandbox Windows exige preservar/pré-criar diretórios gerados por meio de VIVA_BUILD_DIRETORIOS_PREPARADOS=1 (limpeza normal continua padrão nos demais ambientes). Sem commit/push/stage, descarte de fontes, dados reais ou publicação.


## Fechamento do conjunto de acesso/Home/módulos — 17/10

Fluxo completo aprovado na interface: cadastro profissional com CPF/nascimento/contato → edição versionada → ativação no app → login → Home/módulos → atividade e semana → escolha ilustrativa → falha de rede/reenvio sem duplicação → histórico → telefone persistido no portal → texto ampliado → lembretes → saída. Novo ensaio em tests/e2e/acesso-navegacao.spec.ts; 12 rotas internas anônimas verificadas. Cadastro/ativação agora aparecem no acesso, e a barra inferior da Home fica fora da rolagem. Dados pessoais da ficha foram compactados após comparação para liberar espaço aos módulos.

Validações finais: 5 unitários Java + 20 integrações PostgreSQL (sem falha/erro/skip), 13 unitários mobile + 19 web repetidos, TypeScript app/web/contratos/tokens e lint aprovados. 11 E2E passaram no Next de produção em 57,9 s; após último ajuste de ícones/export, 4 E2E de navegação/proteção passaram em 10,8 s. Next build e export Expo web/Android/iOS com bytecode Hermes passaram. TEMP/TMP gravável resolveu a permissão do compilador Hermes; não desabilitado. Export não equivale a APK/IPA ou execução física.

42 capturas reais: 35 referências comparadas em três painéis e sete telas adicionais (cadastro/ativação/perfil/configurações/lembretes/ilustrações/lista). Capturas principais e painéis abertos, diferenças restantes registradas em FIDELIDADE_VISUAL.md. Os 52 PNG tiveram dimensões/SHA-256 conferidos e cópias idênticas no app/portal, sem reamostragem. Logo em destaque usa o novo arquivo; cabeçalhos compactos mantêm composição horizontal, e ícones de navegação pouco nítidos receberam formas nativas/recurso do ZIP.

Uma asserção de teste exibiu senha sintética; o valor foi removido dos logs, as seis contas principais receberam nova credencial aleatória em transação com BCrypt e revogação de sessões, e login/logout das seis foi verificado. Credencial somente em ../../work/demo-credentials.json, fora do Git. Registros clínicos/configuração de conexão preservados. V6 aplicada; não alterar V1–V6. Nenhuma dependência/tecnologia, stage, commit, push ou publicação foi introduzida.

Guia: docs/COMO_NAVEGAR.md; relatório e arquivos: docs/evidencias/TELAS_NAVEGAVEIS_2026-10-17.md. Primeira tarefa local seguinte: diferenças visuais restantes, períodos/agregação de sete dias no portal, idade na etapa de atividade e autoria/nomenclatura auxiliares. Cadastro/edição/Home/semana/conclusão estão implementados: não recomeçar. Clínico/vídeo, análise externa, hardware, credenciais/lojas e ensaios físicos continuam pendentes; não declarar projeto inteiro ou todas as fases concluídos.


## Execução local e manual completo — 19/10/2026 (em validação)

Pedido integral lido do novo anexo. Serviços da execução anterior estavam parados; preservados Git/dados/52 recursos e V1–V6. Confirmados JDK 21.0.10, Maven3.9.11, Node 24.15.0, pnpm 10.28.2, Next 16.4.2, Expo57.0.21/RN0.86.3. PATH ainda encontra Java 8; scripts selecionam JDK 21 no processo. Cluster existente é PostgreSQL17.9, usuário viva, banco vivamais, porta 55432, não PostgreSQL18/usuário vivamais. HBA TCP trust substituído por SCRAM com credencial aleatória somente em work/postgres-local-credentials.json; conexão autenticada passou e sem senha foi negada. Detalhes de erro/SQL do PostgreSQL minimizados para não imprimir identificadores sintéticos.

Criados guia Windows e guia de todas as telas, scripts de diagnóstico/execução/controle/testes e gerador de inventário/checklist por fontes reais. Preparação de build Next e filtro de diagnósticos preservam saída gerada e segredos. Expo localhost atendia apenas IPv6: corrigido com --dns-result-order=ipv4first. Script automático mantém controlador ativo devido ao isolamento entre processos da sandbox; versões com WMI/taskkill não funcionaram aqui e foram substituídas por encerramento da árvore .NET no PowerShell 7, ainda em ensaio. Nenhum commit/push/stage/reset/clean.

Melhorias implementadas: link para orientações da atividade, resultado de pressão sem identificador deixa de carregar indefinidamente, rótulo de observação da refeição, idade derivada do nascimento, atalhos de pressão e agregação de sete datas de autorrelatos no portal (sem inferir ingestão e sem total parcial em erro). 15 testes app e 23 web passaram; typecheck/lint e Next build/export web passaram. Java inicial:5+20 passou; novo E2E revelou GET de perfil ausente com 200 vazio (quebrava JSON e ocultava idade). GET de perfil/pulseira ausentes corrigidos para204, mantendo autorização; integração nova e verify em curso. Primeiro conjunto E2E:11 passaram e novo teste de idade falhou por esse defeito, ainda não considerar fechado. Próximo: concluir verify/contratos, repetir E2E na API corrigida, capturar em testes-manuais, gerar inventário/checklist e ensaiar encerramento/reinício antes do relatório final.


## Fechamento verificável da execução local — 20/10/2026

GUIA_COMPLETO_EXECUCAO_LOCAL_WINDOWS.md, GUIA_TESTES_TODAS_AS_TELAS.md e CHECKLIST_TESTES_MANUAIS.md entregues; inventário gerado contra49arquivos com 60itens e 52 capturas reais. Incluídos comandos desde abrir VS Code, correção Java 8/21, distinção PostgreSQL17.9/usuário viva/55432 versus instalação padrão, inicialização de três terminais ou atalho CMD e consulta privada de senhas. Pedido integral preservado em docs/product/PEDIDO_EXECUCAO_LOCAL_2026-10-19.md.

Java verify final:5 unitários+21 integrações=26, zero falhas/erros/skips, com PostgreSQL e OCR reais; GETs opcionais ausentes204 corrigiram a etapa de idade em cadastro novo. Contrato/tipos regenerados. Frontend final:15 app+23 web=38; TS quatro pacotes e lint passaram. Next produção recompilado após alinhar campos do período; Expo export web e all Android/iOS/web com Hermes passaram.12 E2E completos em produção passaram;7 E2E após reinício passaram14,6 s;1 E2E final de período/idade/falha de leitura passou 11,2 s após ajuste visual.

Controlador automático testado: encerrou somente API/Next/preview registrados via .NET Kill(true), três portas ficaram livres, atalho CMD reiniciou os três. PostgreSQL existente foi reutilizado nesse ensaio (não alegar parada dele); contagens de oito tabelas clínicas e hash conjunto de objetos/chave iguais. Resultado em testes-manuais/reinicio.json. Problemas de WMI/taskkill/TTY da sandbox foram removidos do percurso final; PowerShell 7.6.5 selecionado pelo atalho, arquivos de script com BOM e sem senhas.

52 capturas finais e 35 pares/3 painéis refeitos. Comparações e telas extras inspecionadas; controles de período receberam layout do formulário existente, e máscaras de privacidade agora se aplicam apenas a elementos visíveis. Capturas17/10preservadas. Diferenças relevantes persistem na matriz, sem afirmar identidade dos 36protótipos. Auditoria repetida 0 críticos/2 altos/2 moderados/exit1; lock preservado.

Relatório completo: docs/evidencias/EXECUCAO_LOCAL_2026-10-19.md. Nenhum commit/push/stage/reset/clean, descarte de código/dados ou publicação. Próximo: autoria nominativa/nomenclatura, refinamento visual e backup/restore atualizado apósV6/alertas JS; conteúdo clínico/vídeo/hardware/fornecedores e ensaios físicos permanecem dependências reais. Serviços deixados ativos; confirmar saúde e usar os scripts ao reiniciar, sem recomeçar o projeto.


## Profissionalização — 20/10/2026 (em validação)

Contexto, Git e documentos anteriores recuperados; stage vazio preservado. Pedido integral em docs/product/PEDIDO_PROFISSIONALIZACAO_2026-10-20.md. Revisados textos de acesso/cadastro, registros, disponibilidade e páginas institucionais. Aviso sintético centralizado no ambiente local, sem alterar contas. Preferências por conta implementadas em V7 aditiva com RLS/revogação, versão concorrente e GET/PUT autenticados; app/portal conectados, sem armazenamento clínico no navegador. Nome da autoria e totais completos de refeições/atividades no resumo, ordenação de consultas pela ocorrência. Produção bloqueada explicitamente enquanto modelo sintético/instituição pendentes; bootstrap/simulador exclusivos de desenvolvimento. Testes novos preparados, ainda não alegar aprovação. Primeiro verify parou no JAR bloqueado pela API antiga; controlador encerrado pelos scripts, banco preservado, verificação repetida em andamento. Auditoria inicial repetida 2 altos/2 moderados; correções compatíveis em avaliação. Próximos: validação, export/build, restauração isolada atualizada e E2E/capturas.


Profissionalização: Java final7 unitários+23 integrações=30 passaram com PostgreSQL/OCR reais; app 15 e web25 passaram após corrigir o ensaio jsdom/limpeza e variável de confirmação; TS/lint e Next/Expo all passaram. Dois moderados JS corrigidos por dependências pontuais/patch de interoperabilidade, auditoria agora0 críticos/2 altos/0 moderados(exit1). Backup/restoreV1–V7 real passou com 28 tabelas/27 RLS,48 objetos, foto antiga, login/isolamento/cifra/autenticidade; principal preservado. Primeira rodada E2E8/13passou: quatro expectativas de texto antigo e teste de preferências sem aguardar PUT foram corrigidos; UI ganhou confirmação e exclusão de envios simultâneos. Rodada completa final em andamento, ainda não alegar conclusão E2E/visual.


Na revisão E2E final,12percursos passaram; novo ensaio de preferências aguardava alteração inexistente quando o valor já estava selecionado. Corrigido para escolher outro valor/esperar confirmação real. Detectados estilos inline antigos bloqueados pela CSP: migrados para classes CSS sem relaxar a política. Temporário do Chromium passou a diretório gravável local. Nova compilação/testes/capturas em andamento.


## Fechamento — profissionalização e transferência —20/10/2026

A execução interrompida parou nas capturas/inspeção/documentação. Recuperados logs:31 Java(8+23),40 frontend(15+25),13 E2E juntos, Next/Expo all e restoreV1–V7 aprovados, sem repetir essas suítes integralmente nesta retomada. Concluídos52screenshots/35 pares/3 painéis e 2 cenas de portal 390 px, inspeção visual, alinhamento de preferência/paginação e compatibilidade do perfil Expo preview. Quatro manuais específicos de exercícios/IA/continuidade/responsabilidades criados e links conferidos. Exercícios/IA preservados e delegados: nenhuma funcionalidade nova específica após o pedido.

Validações novas: 5 E2E após reinício + 1 após ajuste, 2 unitários de configuração Expo + 2 de preferências, novo build Next, capturas e heurística de acessibilidade/viewport sem ocorrências; auditoria repetida com 0 críticos/2 altos/0 moderados (exit 1). Banco existente foi reiniciado; controlador confirmou encerramento com checkpoint e início saudável. Testes/capturas acrescentaram registros sintéticos. Não houve descarte de dados existentes, alteração de migrações aplicadas, seed, senha, stage, commit, push ou publicação.

Conferência final da transferência: TypeScript app/web/contratos/tokens, lint dirigido e sintaxe do novo script aprovados; links e caminhos de fontes dos manuais conferidos. Busca de senhas conhecidas nos arquivos textuais entregáveis sem ocorrências (não equivale ao scanner completo de CI). PostgreSQL consultado somente para leitura: 7 migrações, 28 tabelas, 27 RLS. API/portal/app responderam HTTP 200; stage vazio e diff sem erros de whitespace. Evidência em docs/evidencias/profissionalizacao/validacao-final.json.

Relatório: docs/evidencias/RETOMADA_E_TRANSFERENCIA_2026-10-20.md; comparação atual: profissionalizacao/COMPARACAO_VISUAL.md. Pendências gerais, exercícios e IA separadas; produção bloqueada por segurança/instituição/integrações e ensaios. Próximo: entrega ao outro dev, coordenação de arquivos compartilhados/migrations e desenvolvimento delegado conforme os manuais, sem recomeçar o sistema.
