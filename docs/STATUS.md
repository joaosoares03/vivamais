## Fotos e grupo disponíveis na homologação — 05/11/2026

Fonte implantada `6a80797` na branch `codex/homologacao-nuvem-20261104`. Fotos originais até 10 MiB recebem preparo automático, prévia e confirmação; persistência privada e leitura autorizada foram verificadas em nuvem. O administrador cria convites individuais de paciente ou profissional em **Grupo de testes**, com validade, reemissão e revogação; SMS não participa desse acesso. A agenda anterior foi preservada ao editar medicamentos com vigência futura.

[Paciente](https://viva-api-paciente-homologacao.up.railway.app/convite) · [Profissional](https://vivamais-portal-viva-mais3.vercel.app). IA alimentar continua **desabilitada**, com zero tentativas no banco. Testes: 79 app, 58 portal, 10 integrações PostgreSQL na rodada final, 17 verificações de fotos/grupo e 23 de regressão API, além do ensaio das duas interfaces e demais módulos. Não houve ensaio físico de Safari/HEIC nem novo APK/IPA.

[Guia de acesso e testes](GUIA_TESTES_GRUPO_VIVAMAIS.md) · [Relatório e evidências](evidencias/VALIDACAO_FOTOS_IA_E_TESTES_GRUPO.md).

As seções datadas abaixo preservam o histórico anterior. Para o estado atual, use os links acima.

# Estado atual — revisão local de 04/11/2026

## Homologação validada —04/11/2026

[Portal profissional](https://vivamais-portal-viva-mais3.vercel.app) staging READY e [paciente por convite](https://viva-api-paciente-homologacao.up.railway.app/convite) Railway SUCCESS; API/banco UP. Código implantado cd1c24d, branch codex/homologacao-nuvem-20261104.14Flyway/37tabelas/36RLS;76índices/173restrições válidos, bootstrap desativado. Chave Storage completa e privada funcionando; upload/download autorizados, isolamento e revogação confirmados.

Aprovados nesta entrega:13unitários+5integrações PostgreSQL reais,23checagens APIHTTPS, UI Chromium390/1440 conectada, offline/sincronização, calendário, consultas/diário/atividade/perfil, histórico e edição de medicamentos, exportação e controles de segurança. Backup restaurado em schema isolado:37tabelas/241registros, removido depois; foto do snapshot cifrada e recuperada pelo Java. Search_path das2funções de imutabilidade fixado operacionalmente, corpos intactos; advisors sem WARN/ERROR (36INFO esperados de RLS privado).

[Relatório/evidências completos](evidencias/nuvem-2026-11-04/README.md) · [Guia de acesso](GUIA_TESTES_NUVEM.md). Acesso/QR privados em .local/nuvem; nunca versionar/imprimir. Titular adiou o ensaio físico no iPhone. Nativo Android/iOS/lojas, critérios clínicos, retenção institucional, SMS/IA/hardware reais continuam pendentes. Sem main/PR#1/force push/produção ou pagamentos. Os registros seguintes são históricos.


## 04/11/2026 — homologação funcional; revisão do download de fotos em publicação

Portal https://vivamais-portal-viva-mais3.vercel.app em staging e paciente https://viva-api-paciente-homologacao.up.railway.app na Railway. Readiness UP com PostgreSQL/TLS verify-full;14migrações aplicadas e revalidadas,37tabelas,36clínicas com RLS. Bootstrap retirado e contas/credenciais preservadas após reinícios. Código remoto22b5402: raiz do paciente corrigida, sem abrir API ou arquivos de configuração.

Chromium real na nuvem: login profissional, cadastro por formulário, emissão/uso de convite, fragmento removido, cookie seguro, dose no app390px e consulta no portal1440px, reabertura, fila offline/sincronização, calendário, consulta, exportação e revogação aprovados. Sem erro JavaScript. Evidências em docs/evidencias/nuvem-2026-11-04. Não é ensaio em iPhone físico/WebKit.

Chave do Storage finalmente copiada completa pelo titular; upload real200 e refeição persistida. O teste de download encontrou regra antiga incompatível com contas de convite (403). Corrigida pela autorização central, sem habilitar login público, conta de paciente ou leitura anônima do bucket. Commit cd1c24d local na branch de homologação:2arquivos,13unitários+5integrações com PostgreSQL17.11 real aprovados, incluindo leitura, outro profissional negado, revogação/expiração. Schema de teste grupo_b3c8f9248ae04e018997d363f5453f46 removido e viva preservado. Scanner integral sem vazamentos. Aguardando titular enviar esse commit pelo script já preparado; GitHub MCP escrita403/Git Windows sandbox impedem envio automático. Só após o deploy repetir o fluxo completo de fotos.

Backup remoto real pg_dump:126801bytes, SHA2563BEB7C4200544BD302E5C2245150C9D706EE714C0352DC07721602F8A9106FED, privado em work/backup-nuvem-20261104; arquivo extraído integralmente com pg_restore,37tabelas. Isso NÃO é restauração em banco. Falta ensaio de restauração isolada e cópia dos objetos do Storage. Free não fornece os mesmos backups/PITR dos planos pagos. Advisors:36informações de RLS sem políticas são esperadas para o schema privado sem acesso direto;2avisos de search_path nas funções de trigger ainda registrados para endurecimento futuro.

Acesso do titular em .local/nuvem/ACESSO_PRIVADO.txt e QR .local/nuvem/CONVITE_IPHONE.svg, ignorados pelo Git. Não imprimir ou capturar o convite/chaves/senha. Link individual7dias ainda não consumido pelo agente. Nenhum pagamento, upgrade, main/PR#1/force push ou produção. Os registros abaixo são históricos.


## 04/11/2026 — fonte publicada e portal em homologação; API bloqueada pela credencial de Storage

Titular autorizou o commit/publicação da revisão. Worktree separada codex/homologacao-nuvem-20261104: commit 87d971d1b51af58e09108fa14c830c2118f4ca92, árvore 3da73f9cc65ca075064a854b0434ef18aa17ed8f, 419 arquivos revisados. Gitleaks integral: zero achados após corrigir redação de um falso positivo documental; git diff --check aprovado. Envio confirmado no GitHub pelo script executado pelo titular: a integração recusou escrita403 e o gerenciador de credenciais Git local não iniciou. Branch/stage originais, main, PR #1, APKs e banco local preservados.

Railway construiu de verdade a imagem Linux Java21/ExpoWeb do commit atual. Primeiro deploy 67a85bf9-6651-4ae8-aefd-3310ccccb7ec recusado antes de iniciar Java. Diagnóstico temporário 9aec97f2-2d64-41fd-903a-b7b16690f9e0 retornou somente CONFIG_CHAVE_PUBLICA: SUPABASE_SECRET_KEY existe no ambiente correto, mas contém uma chave Publishable. Nenhum valor foi exibido ou registrado. Solicitada substituição pelo prefixo sb_secret diretamente no cofre. Restauração do startCommand para /app/entrada-nuvem.sh já preparada no patch f34ae8f2-7b86-4e4d-b971-91e753e4bd46; aplicar após correção e retomar health/Flyway. Sem flexibilizar guard, TLS, autenticação ou privacidade do bucket.

Vercel staging READY: https://vivamais-portal-viva-mais3.vercel.app, deploy dpl_4NB7D6sEyVzab5Ci81roBjQh2JxG, mesmo commit. Primeiro pedido com alvo omitido retornou production e foi cancelado durante preparação; pedido corrigido para staging explícito, sem promoção. Login/privacidade/suporte públicos retornaram200 com CSP nonce. Playwright Chromium real: login renderizado1440/390px, sem overflow390 ou erros JavaScript, painel redireciona sem sessão e CSRF de origem forjada retorna403. Capturas/JSON em docs/evidencias/nuvem-2026-11-04. Isso não valida login autenticado ou persistência.

Supabase confirmado: role sem superuser/createdb/createrole/bypassrls; schema viva sem USAGE anon/authenticated; bucket privado3MiB/octet-stream; advisors de segurança sem achados. Ainda sem Flyway clínico. API, Safari por convite, foto privada, medicamentos, reinício e restauração remotos NÃO aprovados. Testador autenticado preparado em work/Validar-Nuvem-API.cjs, sintaxe verificada, ainda não executado.12Java/3infra anteriores desta adaptação preservados. Titular está em casa e permite PowerShell se necessário; priorizar integrações.


**Após conexão dos provedores04/11:** Railway VivaMais Demo/homologacao e Vercel vivamais-portal criados/configurados, com domínios reservados; SupabaseFreeUS0 autorizado/ativo, schema viva e bucket privados, sem Flyway clínico.12Java/3infra da adaptação Storage aprovados. SUPABASE_SECRET_KEY confirmada no serviço/ambiente Railway; falta autorização de publicação da fonte atual e primeiro deploy. Nenhum deploy/login remoto aprovado até aqui. [Estado detalhado](operations/IMPLANTACAO_NUVEM_2026-11-04.md). O texto abaixo registra estados anteriores.

**Prioridade nuvem04/11:** configuração e código implementados para Railway(API+ExpoWeb), Vercel(portal) e Supabase(PostgreSQL/Storage). Exportação real, builds e10Java/16app-config/1portal aprovados. Nenhum recurso remoto criado: contas ainda inexistentes, conforme informado pelo titular. Não há URL/convite remoto ou persistência pública validada. [Registro vigente](operations/IMPLANTACAO_NUVEM_2026-11-04.md). Os estados locais abaixo permanecem históricos.

Complemento final de 04/11: mais 1 teste de componente de CadastroPaciente aprovado (sem solicitação de SMS e com as três ações de confirmação). Seletores dos E2E anteriores de medicamentos atualizados para os novos rótulos; 17 casos continuam descobertos, mas não foram reexecutados sem API. Tentativa de prebuild iOS isolado recusada pela CLI no Windows (exige macOS/Linux), sem alterar o guard da ferramenta; perfis e bundles preservados. Não há projeto Xcode/IPA local gerado. Preparador de entradas nativas teve imports compatibilizados com lint e verificação direta aprovada.


## Situação vigente em 04/11/2026

Medicamentos interativos, cadastro demonstrativo sem SMS e convites privados implementados; V13/V14 testadas em PostgreSQL isolado. 116 Java,45 portal/72 app integrais aprovados; últimos ajustes com19 testes seletivos app,4 BFF,2 infra e3 E2E de acesso aprovados. TypeScript/lint, Next e exports Expo Android/iOS/web Hermes aprovados. Novo APK local0.2.0/build2 gerado e verificado; sem ensaio físico desta versão.

Portal3000 e prévias8082/8084 locais ativos. PostgreSQL/API indisponíveis: sandbox recusou criar sockets do cluster existente. Novo E2E completo e capturas de medicamentos/cadastro conectado pendentes; não houve simulação para ocultar isso. Proprietário somente com iPhone: nenhum comando manual solicitado. QR remoto/IPA/hospedagem não disponíveis; configuração EAS/TestFlight e acesso por convite preparados. [Relatório atual](evidencias/MEDICAMENTOS_CONVITES_EXPO_2026-11-04.md) e [guia remoto](GUIA_EXPO_ACESSO_REMOTO_CELULAR.md). Os registros seguintes são históricos.


O [relatório de finalização](RELATORIO_FINALIZACAO_GERAL_VIVAMAIS.md) e PROGRESSO descrevem o trabalho atual; os registros seguintes são históricos. Login demonstrativo isolado, datas, cache/consultas, exportação completa e retificação implementados.94 Java/101 frontend/17 E2E anteriores preservados; aceites novos de login/offline e retificação/exportação103+período passaram separadamente. TypeScript/lint finais, recaptura de25rotas320 com fonte ampliada e restauração V12 aprovados. A última rodada conjunta teve2aprovados e1interrompido por ECONNREFUSED no portal3000; não é uma rodada verde. Auditoria Java:42 dependências sem alertas; pnpm high aprovado com5 moderados/1 baixo restantes.

APK final arm64 release local:101.700.565bytes, SHA256BB5716F989804737778822A3CD3077F548248719801401059AB6FFF066702520. Chave exclusiva, alinhamento APK/25ELF16KB e reprodutor versionado aprovados. ADB normal do proprietário: zero aparelhos; emulador sem aceleração permaneceu offline e foi encerrado. O APK USB não foi ensaiado por ADB. Instalação/teste manual do APK de rede no Samsung foram confirmados pelo proprietário; sem IPA, upload ou liberação produtiva.25 capturas responsivas do portal verificadas anteriormente. [Guia das lojas](GUIA_PUBLICACAO_PLAY_STORE_APP_STORE.md). Main e head0c564c5 preservados; alterações atuais locais, sem novo CI remoto/commit/push/merge.

Continuação manual: DemoRede arm64 separado,101.700.985bytes/SHA256E248B0B2C76C8419274DEAF16363F006F51FECAB106286E4385DD54A068AD7CE. URL do PC192.168.0.8:8083, celular permitido192.168.0.5, HTTP limitado ao host no APK e produção recusada. Download de um único arquivo preparado, sem diretórios. Regressão seletiva:41Java distintos em rodadas, última13aprovados.3E2E passaram conjuntamente antes do download dedicado; repetição seguinte2passaram/1bloqueado pelo portal3000desligado. Regra de firewall executada pelo proprietário viaUAC; download/instalação/teste geral no Samsung confirmados após iniciar a API fora da sandbox. Consulta somente leitura contou4sessões demonstrativas e2pressões manuais novas nesse período. Ensaios específicos de câmera/notificações/cache após reabertura ainda pendentes. [Guia manual](GUIA_PUBLICACAO_PLAY_STORE_APP_STORE.md#instalar-manualmente-no-samsung-sem-adb).

## Histórico da revisão do PR #1 — 29/10/2026

## Confirmação remota do PR #1 — 29/10/2026, 17:40 (São Paulo)

Correção publicada no commit `0c564c54e6b43ddbd5499855925716d62ff2b5c4`. Os quatro checks do GitHub foram concluídos com sucesso: Java/verify/OWASP, TypeScript/testes/auditoria pnpm, navegador/E2E e segredos. Resultado confirmado na API para o head atual do PR, sem merge/deploy. [Execução 40950200333, tentativa 2](https://github.com/joaosoares03/vivamais/actions/runs/40950200333). O E2E remoto terminou em 96 segundos; a auditoria Java em 12 segundos, com cache NVD restaurado e atualização verificada. Prévia local continua nas portas 3000/8081, API 8080. As seções seguintes registram o estado anterior a essa confirmação.

Este registro posterior ao CI é local e ainda não foi publicado em outro commit, para preservar o head já validado; incluir na próxima alteração do projeto.

## Correção das dependências e prévia do PR #1 — 29/10/2026 — auditorias e testes aprovados; envio pendente

Relatório remoto `auditoria-java-40934407518-2` recebido e SHA-256 conferido. A NVD/cache funcionaram no run de `ea12f70`; TypeScript falhou exclusivamente no novo CVE-2026-118664, e Java nos alertas de dependências. Corrigido decode-uri-component 0.5.1, preservado patch CJS/ESM e acrescentada regressão com 32 mil sequências distintas, limitada por processo. Spring 6.2/6.5 só oferece os patches necessários em suporte pago: atualizado para Boot 4.1.2 / Framework 7.0.10 / Security 7.1.2, Java 21 mantido. Adaptados Jackson 3, pacotes de testes e módulos; OpenAPI autenticado preservado, dependência Swagger UI já desativada removida. Sem supressões ou mudança do limiar.

Aprovados: 81 Java (28 unitários + 53 integrações com PostgreSQL real e OCR, zero falhas/erros/ignorados); 88 frontend; TypeScript/lint; exports Expo web/Android/iOS Hermes; pacote executável; 17 E2E em 1,6 minuto com portal otimizado e API nova. 45 rotas e 37 esquemas OpenAPI preservados; única diferença é ordem dos campos de `required`, sem alteração semântica. Banco original continua V1–V9; V1–V10 do PR intactas. Corrigida seleção do JDK no Windows PowerShell 5.1 e validada em 5.1/7.6.5. Prévia nas portas 3000/8081, API 8080, usando banco sintético do PR. Auditoria Java integral aprovada no Windows normal: 42 dependências, nenhum alerta, índice CPE/NVD/RetireJS concluídos, limiar CVSS 7 e falha em erro mantidos. Auditoria pnpm: 923 dependências, um baixo deepmerge, zero críticos/altos/moderados. Scanner de segredos aprovado. Correção revisada para commit/envio no mesmo PR autorizado; novo CI remoto ainda pendente, sem merge/deploy. [Relatório](evidencias/CORRECAO_DEPENDENCIAS_PR1_2026-10-29.md).


## Auditoria NVD — correção subsequente do PR #1

O commit `1174688` já está no PR. TypeScript, browser e secret-scan passaram no GitHub; o job Java aprovou verify e parou na atualização da NVD. A alteração atual usa feeds oficiais e cache salvo antes da análise; atualização/checagem continuam obrigatórias. 12 testes e Actionlint aprovados; carga completa NVD concluída em cerca de 5 minutos. A análise local não foi aprovada por restrição de renomeação do índice CPE no sandbox Windows; a confirmação integral depende do novo CI Linux. [Relatório](evidencias/CORRECAO_NVD_PR1_2026-10-29.md). Registros abaixo são históricos.
## Correção das verificações do PR #1 — 29/10/2026

Na branch isolada `codex/corrigir-pr-1`: resolvido caminho do Next com workspace hoisted, atualizadas dependências vulneráveis do Expo CLI e Vitest e melhorada a recuperação da auditoria NVD sem desativar gates. Novos resultados locais: 81 Java/PostgreSQL real, 88 frontend, tipagem/lint, Next e Expo web/Android/iOS aprovados; pnpm audit no limite high aprovado (um alerta baixo permanece). Contratos/migrações preservados. E2E final: 17 aprovados em 1,5 minuto, sem falhas/ignorados/retries, com portal otimizado e APIs/banco reais; configuração local só reutiliza servidores controlados separadamente. OWASP sem conclusão por cache local somente leitura. Sem novo CI remoto, publicação desta correção ou merge. Ver [relatório atual](evidencias/CORRECAO_PR1_CI_2026-10-29.md); registros anteriores abaixo são históricos.
## G16 — vínculo profissional de grupo — 22/10/2026

GET/PUT /patients/{id}/activity-profile aceita e devolve approvedCatalogGroup de modo compatível, com padrão seguro NAO_DEFINIDO. Não houve alteração de schema ou migration: CuidadoService usa um marcador canônico validado no professional_guidance existente e o remove antes da resposta. A ficha web oferece seletor acessível e exibe o grupo atual; app só destaca os cinco materiais sentados ou em pé quando o profissional definiu o grupo e todas as travas permanecem satisfeitas. Sem liberação, alerta, restrição, pressão não confirmada ou dados insuficientes, não há roteiro ativo. TypeScript e lint passaram. O backend compila somente parcialmente nesta sandbox porque o compilador não consegue acessar um JAR no cache Maven; verify/snapshot OpenAPI continuam pendentes de ambiente com esse acesso.

## G16 — catálogo local de mídias aprovadas — 21/10/2026

Catálogo local `2026-10-21` recebeu as dez mídias aprovadas pela gestão, dividido nos grupos de risco fornecidos, com capa, dois quadros, GIF e MP4 por item. Não há protocolo clínico, seleção automática, mudança de API/banco ou prescrição: o roteiro bloqueia sugestão individual na ausência de dados, sinal/restrição ou protocolo pendente; o POST de autorrelato continua independente. TypeScript e lint passaram. A execução de `pnpm.cmd test` foi bloqueada antes de iniciar as suítes web/mobile por `Access is denied` do esbuild ao resolver o diretório-pai da configuração nesta sandbox; repetir fora desse bloqueio antes de declarar regressão aprovada.

Publicação confirmada em 2026-10-21T00:25:40.4871877-03:00, main, conteúdo 54c92a34bf0c5054a428e6d56277d2257124e30d. Componentes/manuais/privados conferidos no remoto; detalhes em RELATORIO_TRANSFERENCIA_E_PUBLICACAO. Git fonte publicado; implantação/lojas/produção e CI verde não presumidos.

## Histórico anterior à confirmação da publicação


## Consolidação e transferência técnica — 20/10/2026

Pedido atual autoriza commit/push de fonte em origin/main após segurança/integridade, sem deployment,visibilidade,force push ou reescrita. Criados manual técnico,inventário32grupos,rastreio,ambiente do zero,testes,banco/API,padrões/índice e plano canônico;40pendências ampliadas. Testes novos:74Java,69frontend,17E2E,tipagem/lint,Next/Expoall e contratos aprovados;2altos mantidos. Gitleaks/segredos e privilégios JDBC auditados; role local superusuária/BYPASSRLS registrada em P01/G01,sem alterar banco. Estado de commit/push/CI e provas em [RELATORIO_TRANSFERENCIA_E_PUBLICACAO](RELATORIO_TRANSFERENCIA_E_PUBLICACAO.md). Exercícios/IA continuam com outro dev.

## Histórico anterior à consolidação

Corrigidos barra compartilhada/rolagem/safe area estrutural e indicador de demonstração separado (development/test/preview); logo original de alta resolução e Configurações responsivas com preferências preservadas. Celular obrigatório em novos cadastros, DDD/E.164, CPF estrutural/duplicado e troca assistida com reautenticação/revogação. SMS desacoplado, Twilio preparado e caixa LOCAL cifrada; nenhum SMS real ou consulta oficial de CPF executados. Portal/API não exibem código. V9 aplicada: 33 tabelas/32 RLS; fontes V1–V8, conteúdo de 30 tabelas e 66 arquivos anteriores conferidos sem perda antes dos novos E2E.

Validação desta entrega: 74 testes Java (22+52), 69 frontend (40 app+29 web), 17 E2E em 1,4 minuto, TypeScript/lint, Next e Expo web/Android/iOS aprovados. Portal em 1366/1440/1920/768/390 px e DPR2, app em 320/375/430 px; 12 rotas com barra fora da rolagem. Auditoria pnpm 10.28.2: 922 dependências, 0 críticos/2 altos/0 moderados, exit1; produção continua bloqueada. Não houve ensaio físico/APK/IPA/operadora/CI remota, stage/commit/push ou publicação.

[Relatório final](evidencias/CORRECOES_CADASTRO_SMS_INTERFACE_2026-10-20.md) · [Guia local](CADASTRO_E_ATIVACAO_SMS.md) · [Levantamento completo](LEVANTAMENTO_COMPLETO_PENDENCIAS.md) · [Plano técnico](PLANO_IMPLEMENTACAO_PENDENCIAS.md). V1–V9 imutáveis.

## Histórico anterior à revisão de SMS

# Estado atual — acesso do paciente sem senha — 20/10/2026

Fluxo implementado e validado localmente: CPF/nascimento identificam; aparelho autorizado ou código de quatro números é obrigatório. Sem senha do paciente. V8 aplicada preservando V1–V7 e registros; profissionais mantêm o método anterior. [Guia de teste/migração](ACESSO_PACIENTE_SEM_SENHA.md) · [Relatório, arquivos e sete capturas](evidencias/ACESSO_PACIENTE_2026-10-20.md).

Validação desta alteração: 48 Java (8 unitários + 40 integrações), 58 frontend (30 app + 28 web), 14 E2E finais aprovados; TypeScript/lint, Next e exports Expo web/Android/iOS aprovados. V8: 32 tabelas/31 RLS. Snapshot antes da migração e restauração V8 cifrada em banco isolado passaram, incluindo nova chave HMAC, foto antiga e revogação de credenciais no clone.

Contas antigas sem CPF/nascimento precisam complementação autorizada antes de ativar. E-mail é só contato opcional, compartilhável. Sem ensaio físico/APK/IPA/publicação; dois altos de dependências e revisões institucionais permanecem. Exercícios e IA preservados, sem novas funcionalidades delegadas. Stage/código anterior preservados; sem commit/push.

## Histórico preservado

# Estado atual — profissionalização e transferência —20/10/2026

[Fechamento desta retomada](evidencias/RETOMADA_E_TRANSFERENCIA_2026-10-20.md) e [manual geral para o próximo desenvolvedor](MANUAL_CONTINUIDADE_DESENVOLVIMENTO.md). Quatro manuais obrigatórios entregues; exercícios e IA reservados ao outro desenvolvedor, sem novas funcionalidades específicas nesta retomada.

Rodada anterior conferida:31 Java,40 frontend,13 E2E; Next/Expo all e restoreV1–V7 aprovados. Nesta retomada:5 E2E dirigidos+1após CSS,2 testes de configuração+2de preferências e novo build Next aprovados.52 capturas/35 pares/3 painéis+2 cenas de portal 390 px; checagem estrutural sem ocorrências. APP_ENV preview preservado. Servidores/banco existentes reiniciados pelos scripts, com health e acesso validados.

Auditoria atual repetida:0 críticos/2 altos/0 moderados,exit1. Produção permanece bloqueada; sem publicação/commit/push/stage/descarte. V1–V7 preservadas, nenhuma nova migração. Pendências e responsabilidades separadas nos manuais/matriz. O histórico abaixo contém números de etapas anteriores e não deve ser tratado como estado atual.

## Histórico preservado

# Estado atual — 20/10/2026

Execução Windows preparada e validada: [guia completo](GUIA_COMPLETO_EXECUCAO_LOCAL_WINDOWS.md), [manual de telas](GUIA_TESTES_TODAS_AS_TELAS.md), [checklist](CHECKLIST_TESTES_MANUAIS.md), [inventário](INVENTARIO_TELAS.md) e [relatório/evidências](evidencias/EXECUCAO_LOCAL_2026-10-19.md). O atalho Iniciar-VivaMais.cmd permite iniciar os serviços locais sem depender dos processos anteriores.

Retomada19–20/10: banco existente17.9/55432/viva com SCRAM, Java 21 selecionado; iniciação/encerramento/reinício dos três serviços conferidos; contagens clínicas e objetos/chave preservados. API GET opcional agora204, idade real, orientações acessíveis, resultado sem ids e melhorias de períodos no portal implementados. V1–V6 não editadas nesta etapa.

Validação: Java 5+21=26; app 15+web23=38;12 E2E em produção e 7após reinício; TS/lint, Next e export Expo Android/iOS/web passaram. 52 capturas,35 pares/3 painéis,49fontes de tela e 60itens classificados. Notificação/aparelhos não ensaiados; funções clínicas/fornecedores/rótulos institucionais parciais estão explícitos. Auditoria permanece0 críticos/2 altos/2 moderados/exit1; não afirmar CI remota verde ou projeto inteiro concluído.

Próximas tarefas em PROXIMA_EXECUCAO.md. Nenhum commit/push/stage/descarte ou publicação. O histórico abaixo foi preservado e contém estados/pendências que já foram resolvidos nesta etapa.

## Histórico de 17/10

# Estado atual — Viva+ — 17/10/2026

O percurso de cadastro/ativação → Home → módulos → perfil/histórico está implementado e verificado no navegador com Java/PostgreSQL. Aplicativo: http://127.0.0.1:8081. Portal profissional: http://127.0.0.1:3000. São acessos distintos. [Como navegar](COMO_NAVEGAR.md) e [evidências completas](evidencias/TELAS_NAVEGAVEIS_2026-10-17.md).

| Área | Lote de telas verificado | Limites |
|---|---|---|
| Cadastro | CPF opcional/dígitos/unicidade por clínica, nascimento, telefone, contato, sexo/endereço, modalidade, vínculo/código; edição profissional versionada | Pessoas fictícias; contato não troca login; sem CPF isolado como credencial |
| Acesso e Home | Cadastro/ativação destacado, mostrar senha, retorno ao painel com cookie, quatro módulos/atalhos, resumo real e barra fora da rolagem | Preview Expo web mantém sessão em memória; recarregar exige novo acesso |
| Perfil e configurações | Consulta/edição do telefone, orientação da equipe, lembretes existentes, texto ampliado e saída | Preferência dura enquanto app aberto; notificações dependem de SO/build |
| Atividade | Ilustrações/seleção para registrar o que já foi realizado, conclusão ou fila/reenvio e semana com minutos completos; mês/todos e paginação | Sem prescrição/vídeo aprovado; idade ainda não exibida na etapa |
| Módulos preservados | Pressão/confirmação/OCR, medicamentos/autorrelatos, fotos privadas, diário, consultas/resumo/exportação e isolamento | Provedor alimentar, hardware e material clínico continuam indisponíveis |
| Recursos/visual | 52 PNG preservados e conferidos; 42 capturas reais, 35 pares e três painéis comparados | Matriz registra diferenças; notificação nativa sem captura; não são 36 telas idênticas |

V6 aditiva aplicada ao banco existente e schemas vazios. V1–V5 não receberam novas edições neste lote. Patient mantém RLS/revogações da V5 e escopo por organização/vínculo na API. Banco, conexão, chave e objetos privados preservados. Nenhum stage/commit/push/reset/clean ou repositório aninhado foi criado.

Validações: Java 5 unitários + 20 integrações sem falhas/erros/skips; frontend 13 mobile + 19 web; TypeScript/lint; 11 E2E em produção local (57,9 s) e 4 E2E finais após ajustes de ícones/export (10,8 s), sem skips. Next build e export Expo Android/iOS/web com bytecode Hermes passaram. Não houve APK/IPA ou ensaio físico. Restrição de escrita da sandbox resolvida com diretórios .next preparados/modo local e TEMP/TMP gravável, sem alteração de stack/dependências.

Seis contas principais receberam nova senha aleatória após diagnóstico indevido de teste; BCrypt, revogação e login/logout conferidos. Valor somente no arquivo privado local.

Pendências: diferenças de FIDELIDADE_VISUAL.md, agregação de sete dias/atalhos no portal, idade/autoria/nomenclatura auxiliares; conteúdo clínico/vídeo, hardware, credenciais de fornecedores/lojas e ensaios físicos. Auditoria anterior permanece em 2 altos/2 moderados; CI remota/OWASP/gitleaks não executados. Nenhum custo/deploy. Hospedagem Vercel/Railway/Supabase/EAS preservada. Projeto/fases inteiros não declarados concluídos.

## Histórico anterior preservado

O registro abaixo descreve a retomada anterior, antes das correções de cadastro/semana e do pedido das 52 imagens. Pendências resolvidas acima não devem ser reimplementadas.

### Estado registrado antes do novo lote de telas

Escopo atual: continuar Fases 1–7 e a correção interrompida de estrutura, nomenclatura e fidelidade aos 36 protótipos. O documento antigo da fundação foi preservado em historico/STATUS_FUNDACAO_2026-10-16.md. Ele não descreve o estado atual.

Estrutura existente preservada: Expo em app/components/contexts/hooks/services/assets; Next em web; API Java 21/Spring Boot/PostgreSQL em backend/demo. Não foram recriados apps/mobile, apps/web ou services/api. Diretórios antigos ignorados com dados privados não foram apagados. Git iniciou esta retomada limpo, em b460643; nenhum stage, commit ou operação remota nesta retomada. O hash 99c7295 mencionado nos registros anteriores é histórico da execução anterior e não está disponível no Git atual.

| Área | Estado demonstrável | Limite atual |
|---|---|---|
| Identidade, clínicas e vínculos | Sessões revogáveis, BCrypt, BFF HttpOnly/CSRF, autorização por recurso e auditoria | Somente contas sintéticas |
| Cadastro e pressão | Cadastro profissional, ativação e recuperação assistida, registro confirmado, UUID idempotente, histórico e resultado consultado na API | CPF inicial da referência não implementado; e-mail/senha preservados |
| Medicamentos e diário | Planos/versionamento, horários, autorrelatos e transcrição profissional persistidos | Entrega nativa dos lembretes ainda não ensaiada |
| Fila e fotos | Fila protegida nativa implementada; navegador em memória; arquivos cifrados/privados e OCR Tesseract real | SQLCipher/SecureStore exigem build e teste físico; Supabase externo sem credenciais |
| Alimentação | Upload, histórico e autorização reais | Sem análise inventada; provedor/critérios aprovados ausentes |
| Atividade física | Perfil, roteiro em etapas e registros voluntários conectados | Exercícios personalizados, vídeo e regras clínicas aguardam aprovação/material |
| Consultas e pulseira | APIs, formulários, resumo/exportação e simulador explícito | Protocolo/aparelho real ausentes |
| Estrutura e português | Reorganização existente preservada; principais classes/DTOs/hooks em português e compatibilidade JSON/SQL | Revisão de auxiliares/comentários ainda não integral; não afirmar 100% |
| Fidelidade visual | Login, painel, cadastro, início, pressão, fotos e ficha em ajustes com componentes reais | Matriz por tela em FIDELIDADE_VISUAL.md; não afirmar 36 telas idênticas |
| Operação | Backup restaurado em banco isolado; API confirmou login, isolamento e decifração de foto antiga | Docker, fornecedores, lojas e aparelhos não testados/publicados |

### Correção concreta da interrupção

V5 estava incompleta: tentava ALTER na tabela técnica flyway_schema_history, bloqueada pelo próprio migrador. A operação foi retirada antes de qualquer aplicação bem-sucedida. As 26 tabelas do sistema recebem RLS e revogação de privilégios diretos; V1–V4 não foram alteradas. A tabela técnica do Flyway não faz parte dessa alteração de RLS.

A V5 foi aplicada de fato no banco sintético existente, na cópia restaurada e em schemas de teste vazios. Teste SET ROLE demonstrou zero pacientes visíveis mesmo com SELECT concedido e negou acesso a user_account. A API proprietária continua aplicando autorização por clínica/vínculo.

### Validação desta retomada

- Java 21/Maven verify: **5 unitários + 18 integrações PostgreSQL, zero falhas/erros/skips**, incluindo OCR real e isolamento do resultado de pressão. Log local privado: work/java-retomada-verify.log.
- TypeScript app/web/contratos/tokens e ESLint passaram. Repetição final web e 19 unitários passou após o build de produção.
- Vitest: **13 mobile e 19 web passaram**, usando o CLI instalado em cada pacote. A tentativa com CLI Vitest da raiz no pacote web encontrou duas instâncias; a execução correta passou sem mudar testes para contornar a falha.
- Build final Next/Webpack passou com CLI de web (16 rotas). Export Expo web final passou. A sandbox exigiu pré-criar diretórios de saída; não houve mudança de stack nem alteração funcional para contornar o compilador.
- Restore: banco viva_restore_20261017, login novo, foto cifrada antiga decifrada (14826 bytes) e acesso cruzado 403. Script infra/verificar-restauracao.mjs. Dump e chave fora do Git/pacote. Este teste não valida um provedor externo.
- Playwright: 10 E2E passaram na versão final em desenvolvimento e 10 passaram no build de produção local (48,3 s), sem skips. Incluem cadastro/ativação, consulta persistida por UI/API, cookie Secure/HttpOnly, CSRF, isolamento, respostas atrasadas entre abas, fila/reenvio, OCR real, resultado de refeição e atividade voluntária.

Hospedagem econômica preservada: Vercel Hobby, Railway Hobby, Supabase Free e EAS. Nenhum custo, publicação ou alteração remota executado. Antes de qualquer publicação continuam necessárias credenciais, revisão dos bloqueios reais, ensaios nativos e as aprovações indicadas.

### Último lote concluído/verificado

Resultado de alimentação separado em app/alimentacao/resultado.tsx com GET autorizado /api/v1/refeicoes/{idRefeicao}; paciente/profissional autorizado passam e outra clínica/ID inexistente recebem 403. Contrato OpenAPI regenerado e geração repetida sem diferença de conteúdo. Script de sincronização de pacotes corrigido para cópias, links e arquivos ligados pelo pnpm, sem sobrescrever um arquivo com ele mesmo.

Tabelas de medicamentos, diário, atividades e consultas reais; formulários abrem pelas respectivas ações. Consulta criada pela UI foi relida no BFF dentro do navegador. Resposta atrasada de pressão não substitui dados de medicamentos. Gráficos vermelho/azul com eixos/datas, medicamentos compactos e histórico de pressão com detalhes expansíveis.

35 capturas finais foram feitas no portal de produção local e Expo web, comparadas nos três painéis; diferenças de cada uma das 36 referências em FIDELIDADE_VISUAL.md. Permanecem incompletos o cadastro demográfico/edição, etapa CPF, composição de conclusão e visão semanal de atividade, identificadores auxiliares e ajustes visuais. Não declarar todas as fases/protótipos concluídos. Notificação/SQLCipher/câmera física, critérios/vídeo, hardware e fornecedores exigem os ensaios/definições já descritos.

Auditoria JS repetida: 0 críticos, 2 altos e 2 moderados; exit 1 mantido. CI remota, OWASP e gitleaks não executados nesta retomada. Nenhum ignore de vulnerabilidade, commit, push ou publicação foi realizado.
