# Estado atual — revisão do PR #1 — 29/10/2026

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
