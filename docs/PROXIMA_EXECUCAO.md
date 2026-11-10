## Próxima execução — revisão local Lucas (10/11/2026)

Branch `lucas/revisao-g16-g17-20261110`, base `1afe882`, main preservada. Telas corrigidas de pressão e vídeo conferidas no navegador com paciente sintético local. CORS de `/api/v1/auth/testadores/**` corrigido para cookies apenas nas origens configuradas. OCR real de visor sintético reconheceu 118/76/pulso 71 e exigiu confirmação explícita para persistir. Relatório e limites em [revisão local](evidencias/REVISAO_LUCAS_G16_G17_2026-11-10.md).

Próximo passo: revisar a entrega pronta e obter autorização para enviar a branch e abrir PR contra `codex/homologacao-nuvem-20261104`. Nenhum deploy ou uso real autorizado. Estado e acessos da revisão estão em `.local/revisao-lucas`, ignorados pelo Git; não expor tokens, senhas ou arquivos privados. As seções seguintes são checkpoints anteriores e não instruem repetir merges já feitos.

## Próxima execução — portal reformulado (histórico)

1. Revisar e mesclar o PR de `claude/reformulacao-portal` na branch de homologação.
2. Publicar o novo SHA na Vercel e na Railway da homologação. A API recebeu filtros opcionais na busca, sem migration.
3. Validar o portal publicado com o grupo e registrar o SHA.
4. Produção: mesmo SHA, com os critérios de `docs/operations/PROMOCAO_PORTAL_PRODUCAO.md` e autorização expressa.

## Fotos e grupo disponíveis na homologação — 05/11/2026

Fonte implantada `6a80797` na branch `codex/homologacao-nuvem-20261104`. Fotos originais até 10 MiB recebem preparo automático, prévia e confirmação; persistência privada e leitura autorizada foram verificadas em nuvem. O administrador cria convites individuais de paciente ou profissional em **Grupo de testes**, com validade, reemissão e revogação; SMS não participa desse acesso. A agenda anterior foi preservada ao editar medicamentos com vigência futura.

[Paciente](https://viva-api-paciente-homologacao.up.railway.app/convite) · [Profissional](https://vivamais-portal-viva-mais3.vercel.app). IA alimentar continua **desabilitada**, com zero tentativas no banco. Testes: 79 app, 58 portal, 10 integrações PostgreSQL na rodada final, 17 verificações de fotos/grupo e 23 de regressão API, além do ensaio das duas interfaces e demais módulos. Não houve ensaio físico de Safari/HEIC nem novo APK/IPA.

[Guia de acesso e testes](GUIA_TESTES_GRUPO_VIVAMAIS.md) · [Relatório e evidências](evidencias/VALIDACAO_FOTOS_IA_E_TESTES_GRUPO.md).

Próximos passos externos: ensaiar câmera/HEIC no Safari físico quando o proprietário puder; eventual novo build nativo; IA real depende de fornecedor, credenciais, privacidade e aprovação institucional. Não recriar recursos nem repetir módulos concluídos. O conteúdo abaixo registra a entrega anterior de 04/11.

# Próxima execução — homologação em nuvem

Homologação concluída no escopo acadêmico remoto em cd1c24d. Railway deployment0e29a8fb-9cdd-4cac-a2f4-1065c6b2f466 SUCCESS, entrada normal/sem patch pendente; Vercel dpl_4oHeis5hQN4qRiSchhdeZrefpk2P READY/staging. URLs no guia; não recriar recursos nem pedir chave novamente. Storage finalmente funciona com sb_secret completo; nenhum valor foi lido/exibido.13unitários+5PG reais e23APIHTTPS, UI/convite/medicamentos/offline/calendário/consulta/exportação/revogação e demais módulos passaram.14Flyway/37tabelas/36RLS, bootstrap retirado. Migração operacional endurecer_search_path_gatilhos_viva aplicada, SQL em infra/supabase; corpos mantidos e advisors semWARN/ERROR. Backup privado em work/backup-nuvem-20261104 restaurado em schema isolado (37tabelas/241linhas) e removido; foto cifrada do snapshot recuperada pelo Java. Não restaurar sobre viva nem publicar backups/chaves. Dono respondeu que testará iPhone físico depois; NÃO perguntar novamente nesta execução. Acesso e QR do dono em .local/nuvem/ACESSO_PRIVADO.txt e CONVITE_IPHONE.svg, não exibir/capturar conteúdo. EAS/Apple ausentes já conhecidos; APK antigo éLAN, não cloud. Fonte de revisão em work/viva-mais-nuvem-publicacao, originais/stage preservados. GitHub MCPescrita403 e credenciais Git sandbox impedem push: titular enviou os3commits via script de hash fixo; não repetir envio antigo. Documentação/testes novos devem ser sincronizados à mesma branch autorizada após scan. Não main/merge/force push/produção/pagamentos.

## Contexto anterior (histórico)

Complemento final de 04/11: mais 1 teste de componente de CadastroPaciente aprovado (sem solicitação de SMS e com as três ações de confirmação). Seletores dos E2E anteriores de medicamentos atualizados para os novos rótulos; 17 casos continuam descobertos, mas não foram reexecutados sem API. Tentativa de prebuild iOS isolado recusada pela CLI no Windows (exige macOS/Linux), sem alterar o guard da ferramenta; perfis e bundles preservados. Não há projeto Xcode/IPA local gerado. Preparador de entradas nativas teve imports compatibilizados com lint e verificação direta aprovada.


## Checkpoint prioritário — 04/11/2026, retomada remota

Ler [relatório atual](evidencias/MEDICAMENTOS_CONVITES_EXPO_2026-11-04.md) e [novo pedido](product/PEDIDO_RETOMADA_REMOTA_EXPO_2026-11-04.md). Não recomeçar nem descartar alterações. O proprietário está só com iPhone; não pedir comandos PowerShell/reinícios manuais/logs. Android0.1.0 já testado por ele; não voltar ao ADB. Novo APK0.2.0/build2 assinado/verificado, não fisicamente ensaiado. Contas Expo/Apple ausentes já conhecidas.

Hermes resolvido: TEMP/TMP em pasta gravável, exportações finais dos modos demo/convite passaram para Android/iOS/web. Reprodutor infra/exportar-expo.mjs preserva Hermes/cache e registra hashes. Não refazer116Java aprovados: backend/SQL não mudou após o aceite. Preservar45portal/72app históricos e19seletivos/4BFF/2infra/3E2E novos. Git permanece codex/corrigir-pr-1, base0c564c5, sem novos commits/publicação.

Primeiro pendente: disponibilizar o cluster PostgreSQL17/API pelo mecanismo autorizado quando houver mudança do bloqueio. pg_ctl constatou banco parado; postgres foi recusado ao criar sockets em127.0.0.1/::1, mesmo com permissão de rede. Não apagar PID/dados, trocar HBA, criar banco paralelo ou usar outra superfície para contornar a sandbox. Portal está ativo na sessão42165/3000, prévia demo sessão35348/8082 e convites sessão89851/8084; conferir antes de agir, pois sessões podem terminar. A rejeição histórica de início do Next foi superada pelo mesmo inicializador padrão, autorizado nesta retomada.

Depois da API: backup e migrações aditivas V13/V14 no banco principal (até aqui só ensaiadas no banco de testes), executar tests/grupo/medicamentos-demonstracao.spec.ts com playwright.grupo.config.ts; esse config não inicia servidores. Preparado helper privado work/Iniciar-API-Medicamentos.ps1 com JAR validado de work/grupo-api-build e APK0.2.0; não executar sem banco disponível. Ensaiar persistência/doses/calendário/offline/autoria e capturar os cards reais; não marcar esse E2E aprovado antecipadamente.

Distribuição: seguir [entrada do grupo](GUIA_DISTRIBUICAO_TESTES_GRUPO.md), perfis EAS e modelo infra/grupo.env.example. Não existe link remoto/QR/IPA. API HTTPS sintética por convite e assinatura/contas continuam externas; não expor CPF/nascimento, não remover SQLCipher para Expo Go, não publicar/pagar sem autorização. Guias prontos não significam serviço implantado.


## Prioridade vigente — retomada de 03/11/2026

**Checkpoint mais recente:** APK USB original preservado e DemoRede real adicionado: `.local/instalaveis/VivaMais-DemoRede-arm64.apk`,101.700.985bytes, SHA256E248B0B2C76C8419274DEAF16363F006F51FECAB106286E4385DD54A068AD7CE. Não recompilar sem mudança no endereço/código. Conector8083privado+IP de um celular e download único implementados; produção/preview recusados,8080loopback preservado. Últimos13Java seletivos aprovados,41distintos nesta continuação.3E2E passaram em conjunto; repetição posterior2aprovados/1conexão recusada no portal.

Resultado confirmado pelo proprietário: API `../../work/Iniciar-API-Finalizacao.ps1` em PowerShell normal, download/instalação/teste geral no Samsung funcionaram. Não reiniciar sua API nem pedir nova instalação sem necessidade. Primeiro concluir ensaios específicos de câmera/notificações/cache protegido após reabertura/sincronização nativa. Regra Windows restrita já foi executada pelo proprietário viaUAC; não repetir liberação/instalar drivers nem ampliar rede automaticamente. PCcabeado192.168.0.8 e celularWi-Fi192.168.0.5. Guia possui instalação por download/MTP e remoção da regra. Conectividade/instalação geral confirmadas; não extrapolar para os ensaios específicos pendentes. PostgreSQL/prévias mantidos; portal3000voltou a encerrar. Verificar portas antes de pedir reinício. Checkpoints seguintes descrevem etapas anteriores da mesma execução.

Continuar **outputs/viva-mais-pr-1**, branch `codex/corrigir-pr-1`, base0c564c5; main intocada. Ler AGENTS, PROGRESSO e [relatório](RELATORIO_FINALIZACAO_GERAL_VIVAMAIS.md). Preservar todas as modificações não commitadas e V1–V12. Não refazer94Java/101frontend/17E2E/OWASP aprovados sem mudança pertinente.

Fechados na retomada: login sem SMS+offline/reconexão; retificação e exportação103registros/período com API real; regressão da fila/OCR/foto;25capturas responsivas do portal; restauração V12; correções e25recapturas320 com fonte ampliada; TypeScript/lint finais. Reprodutor concluiu APK arm64 assinado/verificado; `.local/instalaveis/VivaMais-DemoLocal-arm64.apk`,101.700.565bytes, SHA256BB5716F989804737778822A3CD3077F548248719801401059AB6FFF066702520.

Primeira pendência: verificar portal3000 e, se ativo, repetir somente o caso de exportação/retificação da configuração `playwright.demonstracao.config.ts` para fechar a última rodada interrompida por conexão recusada. Esse caso passou separadamente antes da interrupção; os outros dois passaram na rodada mais recente. API8080, demo8082 e previewseguro8081 permanecem separados durante esse teste. Para reproduzir o teste8082, incluir essa origem exata em CORS no ambiente privado da API.

Android físico: usuário conectou/aceitou USB e executou o helper fora do Codex, mas encontrou0autorizados/0pendentes. Aguardar modelo/Android para orientação específica, sem instalar drivers globais. Emulador AOSP36 sem aceleração permaneceu offline e foi encerrado; x86_64APK existe separadamente, sem teste nativo aprovado. Contas Expo/Apple ausentes; não perguntar de novo. Validar SecureStore/SQLCipher após fechamento/reabertura, câmera, vídeo e notificações quando houver aparelho efetivamente detectado.

Caches de build locais: SDK `../../work/android-sdk`, Gradle `C:\Users\joaos\Documents\Codex\g`, CMake `C:\Users\joaos\Documents\Codex\c`; chaves em work privado. Scripts/logs privados emwork e `.local/execucao`. Prova final em `evidencias/finalizacao-2026-11-03/apk-verificacao.json`. Não enviar chaves, dados privados, banco ou cache ao Git.

API/app são sessões controladas pelo Codex, portal foi iniciado pelo proprietário fora da sandbox: verificar portas antes de pedir reinício; EACCES de rede não prova processo encerrado. Não contornar rejeição automática de inicialização Next. Não fazer merge/push ou produção. Atualizar este checkpoint com o fechamento antes de continuar outra frente.

Publicação confirmada em 2026-10-21T00:25:40.4871877-03:00, main, conteúdo 54c92a34bf0c5054a428e6d56277d2257124e30d. Componentes/manuais/privados conferidos no remoto; detalhes em RELATORIO_TRANSFERENCIA_E_PUBLICACAO. Git fonte publicado; implantação/lojas/produção e CI verde não presumidos.

## Histórico anterior à confirmação da publicação


## Consolidação e transferência técnica — 20/10/2026

Pedido atual autoriza commit/push de fonte em origin/main após segurança/integridade, sem deployment,visibilidade,force push ou reescrita. Criados manual técnico,inventário32grupos,rastreio,ambiente do zero,testes,banco/API,padrões/índice e plano canônico;40pendências ampliadas. Testes novos:74Java,69frontend,17E2E,tipagem/lint,Next/Expoall e contratos aprovados;2altos mantidos. Gitleaks/segredos e privilégios JDBC auditados; role local superusuária/BYPASSRLS registrada em P01/G01,sem alterar banco. Estado de commit/push/CI e provas em [RELATORIO_TRANSFERENCIA_E_PUBLICACAO](RELATORIO_TRANSFERENCIA_E_PUBLICACAO.md). Exercícios/IA continuam com outro dev.

## Histórico anterior à consolidação

Ler [relatório final](evidencias/CORRECOES_CADASTRO_SMS_INTERFACE_2026-10-20.md), [guia SMS](CADASTRO_E_ATIVACAO_SMS.md), [40 pendências](LEVANTAMENTO_COMPLETO_PENDENCIAS.md) e [plano técnico](PLANO_IMPLEMENTACAO_PENDENCIAS.md). V9 aplicada, V1–V9 imutáveis; código não retorna na API profissional. Não refazer autenticação/layout, não voltar ao código manual exposto e não alterar funções delegadas de exercícios/IA.

74 Java/69 frontend/17 E2E, tipagem/lint, Next/Expo e preservação local aprovados. Iniciar com Iniciar-VivaMais.cmd -Producao -SmsLocal para o ensaio sem operadora; configuração normal sem flag mantém SMS desabilitado por padrão. Credenciais/caixa privadas nunca no chat/Git. Não limpar limites, dados, stage ou arquivos existentes para facilitar teste.

Próximas frentes gerais: P02/P21 (altos/CI/scanners), decisões institucionais P01/P06/P23–P25, aparelhos P07–P16 e hospedagem autorizada P17–P20. SMS real P03 e CPF oficial P04 dependem de habilitação/contrato/credenciais e autorização; não enviar mensagens reais implicitamente. Outro desenvolvedor recebe P27–P30 e contratos/matriz atualizados. Ver critérios concretos por ID antes de iniciar uma tarefa diferente. Sem commit/push/publicação sem autorização.

## Histórico de continuidade anterior à V9

# Prioridade vigente — acesso sem senha validado — 20/10/2026

Ler [o guia de acesso](ACESSO_PACIENTE_SEM_SENHA.md) e [evidências](evidencias/ACESSO_PACIENTE_2026-10-20.md). Não reimplementar login por senha de paciente nem /auth/activate. V1–V8 aplicadas são imutáveis. Contas/dados preservados; complementar CPF/nascimento pelo profissional, código de quatro números com conferência de identidade e reautenticação, sem fallback por dados pessoais.

48 Java, 58 frontend e 14 E2E finais passaram; Next/Expo e backup/restore V8 também. Próximas pendências gerais: ensaios físicos de SecureStore/câmera/leitores, política institucional de identidade/retenção, dois altos/CI e implantação HTTPS/proxy quando autorizada. CPF/nascimento ambíguos entre unidades permanecem sem seleção automática. Credencial HMAC precisa ser estável/privada; não reiniciar chaves ou limites para facilitar testes.

Exercícios e IA continuam com o outro desenvolvedor, coordenando contratos e a próxima numeração Flyway. Conferir saúde dos serviços e git status; não descartar arquivos/stage, criar repositório, publicar ou executar commit/push sem autorização. O histórico abaixo descreve etapas anteriores e não substitui esta prioridade.

## Histórico de continuidade

# Prioridade vigente — transferência de 20/10/2026

O usuário reservou desenvolvimento específico de exercícios e IA ao outro desenvolvedor. Não avançar novos exercícios, prescrição, vídeos, modelos, prompts clínicos ou fornecedores nesta frente Codex. Preservar código/testes/contratos e usar os quatro manuais de transferência. A etapa de capturas/documentação está fechada: ver evidencias/RETOMADA_E_TRANSFERENCIA_2026-10-20.md. Próximos ajustes Codex são gerais, respeitando a matriz; outro dev começa pelo MANUAL_CONTINUIDADE_DESENVOLVIMENTO.md.

# Continuidade — profissionalização (20/10/2026)

Leia AGENTS, README, PROGRESSO, STATUS e [relatório atual](evidencias/PROFISSIONALIZACAO_VIVAMAIS_2026-10-20.md). Não reimplementar fundação, cadastro, Home, semana, períodos, execução local, autoria/totais ou preferências já entregues. Não descartar alterações, fazer stage/commit/push ou publicar sem autorização.

## Estado preservado

- Expo na raiz; web/ Next independente; backend/demo Java 21/Spring Boot/JDBC/PostgreSQL. Nenhuma estrutura apps/mobile/apps/web/services/api recriada. Git base b460643, stage vazio, alterações anteriores preservadas.
- Cluster17.9/55432/viva/vivamais, SCRAM. Senhas privadas distintas em ../../work/postgres-local-credentials.json e demo-credentials.json, nunca imprimir. JDK 21 local é selecionado pelos scripts porque PATH encontra Java 8. pnpm 10.28.2 fixado; não usar pnpm 11 ou npm install no monorepo.
- V7 aditiva aplicada para preferências por conta, RLS e versão concorrente. V1–V6 intactas nesta etapa; agora preservar V1–V7. GET/PUT /conta/preferencias não aceitam outra identidade. App e portal persistem texto ampliado; portal 10/20/50 nas tabelas da ficha. Nenhum token/dado clínico em localStorage.
- Autoria nominativa, ordenação por ocorrência e totais completos de refeições/atividades implementados. Resumo detalhado continua seleção recente; gráfico/tabelas declaram paginação, sem inferir diagnóstico/ingestão.
- Linguagem revista e aviso sintético concentrado no ambiente local. Contas/dados de testes continuam identificados, não reais. Suporte/privacidade/exclusão honestos sobre revisões/canais ausentes. CSP estrita preservada: usar classes CSS, não atributos style no portal.
- APP_ENV=production e perfis Spring production/prod recusam modelo sintético/bootstrap antes do seed. Não contornar esse bloqueio: CHECK(demo_only) e definições institucionais exigem revisão/migração própria. -Producao nos scripts é build otimizado local com APP_ENV=development.
- Dois moderados JS corrigidos: override xcode>uuid11.1.1 e query-string>decode-uri-component0.5.0, patch CJS/ESM versionado. Frozen/offline passou; não apagar patches. Auditoria ainda2 altos (forge/braces), exit1, sem suppression. Ver DEPENDENCIAS_SEGURANCA.md.
- Backup/restoreV1–V7 aprovado em banco exclusivo,28 tabelas/27 RLS,52 objetos/chave recuperados, login/403/foto/cifra/autenticidade e principal/arquivos/chave preservados. Ver operations/BACKUP_RESTORE.md. Banco restaurado e backups/chaves somente em work privado; não sobrescrever/drop/reutilizar main.
- Java 31 (8+23), frontend40 (15+25), TS/lint, Next e Expo all passaram. Export nativo não equivale a dispositivo/APK/IPA. Conferir o fechamento E2E/capturas no relatório atual antes de reutilizar contagens históricas.

## Ambiente local

Iniciar-VivaMais.cmd mantém controlador vivo; Enter no modo normal ou infra/encerrar-local.ps1 de outro terminal solicita encerramento seguro. Na sandbox não depender de WMI/taskkill. Verificar saúde das portas8080/3000/8081/55432 antes de iniciar outro processo. FILES_DIRECTORY deve ser absoluto e preservar .encryption-key. GET de perfil/pulseira ausentes continua204. Sessão/fila do app web são somente em memória; preferências confirmadas ficam no banco. E2E/capturas pelo helper validar-interface-local.ps1 com filtro/sanitização/TEMP gravável.

## Pendências que permanecem

Acompanhar correções upstream dos dois altos; ensaiar CI/OWASP/secret scanner e provedores externos; refinar diferenças por tela da matriz FIDELIDADE_VISUAL sem afirmar36 telas idênticas. Notificação nativa não tem captura de navegador equivalente. Validar câmera, SQLCipher/SecureStore, notificações e leitores em Android/iOS físicos.

Conteúdo/critérios clínicos e vídeo, fornecedor alimentar, protocolo/aparelho real, revisão jurídica/institucional, canais de suporte/direitos/retenção, modelo produtivo e credenciais/lojas são dependências reais. Hospedagem econômica Vercel/Railway/Supabase/EAS mantida, sem deploy/custo. Não inventar aprovação ou substituir por mocks.
