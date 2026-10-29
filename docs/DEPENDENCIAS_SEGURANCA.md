# Auditoria de dependências

## Correção das dependências e prévia do PR #1 — 29/10/2026 — auditorias e testes aprovados; envio pendente

Relatório remoto `auditoria-java-40934407518-2` recebido e SHA-256 conferido. A NVD/cache funcionaram no run de `ea12f70`; TypeScript falhou exclusivamente no novo CVE-2026-118664, e Java nos alertas de dependências. Corrigido decode-uri-component 0.5.1, preservado patch CJS/ESM e acrescentada regressão com 32 mil sequências distintas, limitada por processo. Spring 6.2/6.5 só oferece os patches necessários em suporte pago: atualizado para Boot 4.1.2 / Framework 7.0.10 / Security 7.1.2, Java 21 mantido. Adaptados Jackson 3, pacotes de testes e módulos; OpenAPI autenticado preservado, dependência Swagger UI já desativada removida. Sem supressões ou mudança do limiar.

Aprovados: 81 Java (28 unitários + 53 integrações com PostgreSQL real e OCR, zero falhas/erros/ignorados); 88 frontend; TypeScript/lint; exports Expo web/Android/iOS Hermes; pacote executável; 17 E2E em 1,6 minuto com portal otimizado e API nova. 45 rotas e 37 esquemas OpenAPI preservados; única diferença é ordem dos campos de `required`, sem alteração semântica. Banco original continua V1–V9; V1–V10 do PR intactas. Corrigida seleção do JDK no Windows PowerShell 5.1 e validada em 5.1/7.6.5. Prévia nas portas 3000/8081, API 8080, usando banco sintético do PR. Auditoria Java integral aprovada no Windows normal: 42 dependências, nenhum alerta, índice CPE/NVD/RetireJS concluídos, limiar CVSS 7 e falha em erro mantidos. Auditoria pnpm: 923 dependências, um baixo deepmerge, zero críticos/altos/moderados. Scanner de segredos aprovado. Correção revisada para commit/envio no mesmo PR autorizado; novo CI remoto ainda pendente, sem merge/deploy. [Relatório](evidencias/CORRECAO_DEPENDENCIAS_PR1_2026-10-29.md).


## Continuidade da auditoria Java — PR #1 — 29/10/2026

O commit `1174688` passou no GitHub em TypeScript/auditoria pnpm, browser e scanner de segredos; `mvnw verify` também passou, mas a atualização NVD pela API expirou aos 35 minutos. A correção subsequente usa Dependency-Check 12.2.2, arquivos oficiais NVD sem chave e cache salvo após atualização completa e antes de analisar dependências. CVSS >= 7 e falha em erro continuam obrigatórios; nenhum analyzer ou alerta foi suprimido.

A carga completa local pelos feeds terminou em cerca de 5 minutos. A análise posterior encontrou restrição de renomeação do índice CPE no sandbox Windows; não foi declarada aprovada. O alerta DOMPurify/CVE-2026-116803 apareceu sem CVSS no RetireJS (fallback alto), enquanto a NVD pública informa 6.1/CVSS3.1 e 5.1/CVSS4, e o fornecedor classifica o GHSA como baixo. A diferença foi registrada, sem converter um ensaio incompleto em aprovação. POM e dependências da aplicação continuam intactos; nova execução remota deve comprovar o resultado completo. [Relatório e fontes](evidencias/CORRECAO_NVD_PR1_2026-10-29.md).
**Estado desta revisão do PR #1, em 29/10/2026:** pnpm 10.28.2 auditou 923 dependências: 0 críticos, 0 altos, 0 moderados e 1 baixo (deepmerge). O gate `--audit-level high` passou, sem supressões. Overrides localizados do Expo CLI (node-forge 1.4.2 e Zod 4.6.6) e Vitest 4.1.12 foram verificados com testes e builds. OWASP Java permanece sem conclusão por falha de gravação do cache local; no run remoto anterior houve HTTP 521 da NVD. Alterações ainda locais, sem novo CI remoto ou merge. Ver [evidências e limites](evidencias/CORRECAO_PR1_CI_2026-10-29.md). Os registros abaixo são históricos e não substituem esse resultado.

Auditoria pnpm executada localmente em 16/10/2026. A primeira execução encontrou alertas críticos em Vitest/Tinypool. A atualização para Vitest 4.1.11 e override Tinypool 2.1.2 removeu todos os alertas críticos; testes foram reexecutados nas versões finais. Dependências Expo foram alinhadas ao SDK 57, incluindo React Native 0.86.3, Metro 0.86.3, Reanimated 4.5.1 e Worklets 0.10.1.

Resultado final do registro consultado: **0 críticos, 2 altos e 2 moderados**; `pnpm audit --audit-level high` retorna exit1. Não foram usados ignores/suppressions para simular sucesso. A CI de auditoria deve permanecer bloqueada até correção upstream, substituição validada ou decisão formal de risco; esta fundação não está liberada para produção.

| Dependência/caminho                                    | Severidade | Contexto da fundação                                                                             | Acompanhamento                                                                                                           |
| ------------------------------------------------------ | ---------- | ------------------------------------------------------------------------------------------------ | ------------------------------------------------------------------------------------------------------------------------ |
| node-forge1.4.0 via Expo CLI                           | Alta       | Ferramenta de desenvolvimento/build; não é o servidor Java nem segredo embutido no app           | [Advisory](https://github.com/advisories/GHSA-86w9-cpqp-85rv); registro não indicava versão corrigida                    |
| braces3.0.3 via typescript-eslint/fast-glob/micromatch | Alta       | Lint com padrões locais; não processa requisições públicas da API                                | [Advisory](https://github.com/advisories/GHSA-vfj7-8cjw-p6xm); registro não indicava versão corrigida                    |
| uuid7.0.3 via Expo config-plugins/xcode                | Moderada   | Geração de projeto/build                                                                         | [Advisory](https://github.com/advisories/GHSA-w5hq-g745-h8pq); avaliar atualização do plugin, sem forçar major sem teste |
| decode-uri-component0.2.2 via Expo Router/query-string | Moderada   | Dependência potencialmente incluída no cliente; avaliar entradas de URL e atualização compatível | [Advisory](https://github.com/advisories/GHSA-vcc3-ghjq-m6fr); liberação exige avaliação                                 |

Não expor servidores de teste/CLI à internet. Versões corrigidas em outra major não autorizam substituir dependências Expo sem validar compatibilidade nativa. Esta classificação descreve o caminho observado, não prova ausência de exploração.

Scan Java OWASP e secret scan estão configurados no workflow; ainda não executados remotamente. OWASP pode precisar NVD_API_KEY em secret do repositório para evitar limitações de acesso; chave não deve ir para a linha de comando ou logs. Maven Wrapper tem checksum da distribuição. Pacotes JS têm integridade no lockfile. As imagens Docker não foram construídas nesta máquina, onde Docker não está disponível.

## Repetição em 17/10/2026

Auditoria do grafo atual repetida via CLI pnpm do runtime (somente leitura, verificações automáticas de instalação desativadas nesse comando). Resultado inalterado: 0 críticos, 2 altos e 2 moderados; exit 1. node-forge/braces continuam sem versão corrigida indicada pelo registro consultado; uuid/decode-uri-component exigem atualização compatível e validação do conjunto Expo. Nenhuma dependência, versão ou suppression foi alterada nesta retomada. OWASP/gitleaks/CI remota não foram declarados como executados.

## Revalidação de 19–20/10/2026

Executado pnpm 10.28.2 audit --json com o lock preservado:0 críticos,2 altos,2 moderados, exit1,922 dependências no relatório. Não houve ignore/suppression nem upgrade de dependências nesta entrega. Resultado privado em work/pnpm-audit-local-20261019.json; bloqueio da auditoria/CI permanece explícito. Testes locais e builds aprovados não significam que esses alertas foram resolvidos.

## Correções verificadas — 20/10/2026

Auditoria inicial repetida: 0 críticos, 2 altos, 2 moderados. Após correções: **0 críticos, 2 altos, 0 moderados**, exit 1 preservado. Relatórios privados em work/pnpm-audit-profissionalizacao-{antes,depois}.json. Nenhuma suppression.

- uuid: override restrito xcode@3.0.1>uuid=11.1.1. O consumidor usa apenas v4; CJS continua exportado nessa versão. infra/verificar-dependencias.mjs validou 100 identificadores únicos no formato Xcode. [Aviso e correção](https://github.com/advisories/GHSA-w5hq-g745-h8pq).
- decode-uri-component: override restrito query-string@7.1.3>decode-uri-component=0.5.0. Patch versionado em patches/query-string@7.1.3.patch adapta apenas a importação CJS ao default ESM; mantém o algoritmo corrigido upstream. Node >=22.16 já era obrigatório. Consultas acentuadas/repetidas, ida/volta, entrada malformada e exports Expo web/iOS/Android passaram. [Aviso oficial](https://github.com/advisories/GHSA-vcc3-ghjq-m6fr).
- node-forge1.4.0: alto, caminho expo>@expo/cli>node-forge. [Advisory consultado em 20/10](https://github.com/advisories/GHSA-86w9-cpqp-85rv) ainda não indica versão corrigida. Não implementar correção criptográfica própria para esconder o alerta.
- braces3.0.3: alto, caminho atual @react-native/metro-config>metro-config>metro>metro-file-map>micromatch>braces. [Advisory consultado em 20/10](https://github.com/advisories/GHSA-vfj7-8cjw-p6xm) ainda não indica versão corrigida. O contexto inclui Metro, além dos usos anteriores em ferramentas; não afirmar que está restrito ao lint.

APP_ENV=production bloqueia bootstrap/modelo sintético na API. O modelo vigente possui CHECK(demo_only); mudar somente um rótulo não o torna produtivo. Portal valida URLs HTTPS explícitas e rejeita bootstrap; Expo mantém validação de API pública HTTPS. O modo -Producao dos scripts locais usa builds otimizados com APP_ENV=development, sem autorizar uso real/publicação. A configuração de hospedagem econômica foi preservada.

Nova tabela preferencia_conta (V7) tem RLS/revogação direta, endpoint sem id de usuário no corpo/rota e versão concorrente. Sessões e dados clínicos não são armazenados em localStorage. Backup/restore real V1–V7 em banco exclusivo: ver operations/BACKUP_RESTORE.md. Pendem os dois altos, auditoria OWASP/secret scanner em CI, ensaios físicos e revisão institucional; testes locais aprovados não liberam produção.

Correção adicional de CSP em 20/10: estilos inline de indicadores, gráfico e foto eram recusados no build otimizado. Foram substituídos por classes no CSS, preservando nonce e a política sem unsafe-inline. O ensaio de preferências verifica ausência dessas recusas no portal. Instalação pnpm 10.28.2 com --frozen-lockfile --offline aprovada, reproduzindo patch e overrides.

## Reavaliação para transferência — 20/10/2026

Nova auditoria com pnpm 10.28.2 e lockfile preservado confirmou **0 críticos, 2 altos e 0 moderados**, em 922 dependências, exit 1. Resultado privado: `../../work/pnpm-audit-transferencia-20261020.json`, relativo à raiz do projeto. Nenhum ignore, suppression ou versão incompatível foi usado.

| Alerta mantido   | Risco descrito pela fonte e caminho observado                                                                                                                                                                                                                                                                              |
| ---------------- | -------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------- |
| node-forge 1.4.0 | Validação insuficiente de estruturas ASN.1 na verificação RSA PKCS#1 v1.5 pode aceitar assinaturas forjadas em determinadas condições. Caminho `expo > @expo/cli > node-forge`. O [aviso oficial](https://github.com/advisories/GHSA-86w9-cpqp-85rv), consultado novamente em 20/10, não lista versão corrigida.           |
| braces 3.0.3     | Padrões profundamente aninhados podem esgotar a pilha e interromper o processo. Caminho atual `@react-native/metro-config > metro-config > metro > metro-file-map > micromatch > braces`. O [aviso oficial](https://github.com/advisories/GHSA-vfj7-8cjw-p6xm), consultado novamente em 20/10, não lista versão corrigida. |

Alternativas de continuidade:

1. Reavaliar atualização compatível de Expo/CLI/Metro quando o fornecedor incorporar uma correção ou remover o consumidor vulnerável. Aceite: grafo auditado, regressão dos consumidores e exports web/Android/iOS aprovados; ensaios nativos conforme o alcance da mudança.
2. Avaliar substituição do consumidor ou patch revisado pelo mantenedor, com testes de segurança e compatibilidade. Não criar criptografia própria nem forçar uma versão major para apenas silenciar a auditoria. Ainda não há substituição ou patch desses dois alertas validado neste projeto.
3. Durante a demonstração local, manter CLI/Metro/ferramentas acessíveis apenas localmente e evitar certificados/padrões glob de origem não confiável. Antes de eventual publicação, conferir a composição dos artefatos para excluir ferramentas de build desnecessárias. Essas medidas reduzem exposição; não corrigem as bibliotecas nem removem os alertas do grafo completo.

Responsável geral acompanha os alertas em coordenação com os responsáveis dos módulos afetados. Correção/mitigação precisa de evidência técnica; uma decisão documental isolada não libera produção. Permanecem pendentes CI remota, OWASP, scanner de segredos completo, ensaios físicos e revisão institucional. A busca local por senhas conhecidas não equivale a um scanner completo.

## Acesso do paciente — 20/10/2026

Novo fluxo, migração V8, código/HMAC/limites persistidos e autorização/revogação de aparelhos documentados em [acesso sem senha](ACESSO_PACIENTE_SEM_SENHA.md). Validação local em [relatório](evidencias/ACESSO_PACIENTE_2026-10-20.md). Nenhuma dependência/lock foi alterada por este módulo; os dois altos anteriores continuam pendentes. Novas tabelas têm RLS/revogação, e backup cifrado inclui a chave HMAC. Testes locais não liberam produção nem comprovam proteção física nativa.

## Auditoria de cadastro/SMS/interface — 20/10/2026

Nova execução com pnpm 10.28.2 confirmou 922 dependências: 0 críticos, 2 altos, 0 moderados/baixos, exit 1. Mesmos node-forge/GHSA-86w9-cpqp-85rv e braces/GHSA-vfj7-8cjw-p6xm; sem supressões ou alterações de dependências/lock nesta entrega. Relatório bruto/JSON normalizado privados em ../../work/sms-pnpm-audit-20261020.json e sms-pnpm-audit-limpo.json. Npm acrescentou avisos ao JSON bruto; a extração do objeto não altera os achados. O adaptador SMS usa HttpClient Java21, sem nova biblioteca. Scanner Java/NVD e CI remota seguem pendentes; esta auditoria pnpm não os substitui.


## Consolidação para publicação do fonte — 20/10/2026

Auditoria repetida com pnpm10.28.2 confirmou922dependências,0críticos/2altos/0moderados,exit1. Advisories oficiais reabertos e ainda sem patched version. Gitleaks8.30.1 examinou histórico e candidato com relatórios redigidos; busca em memória por5segredos conhecidos sem ocorrência. Isso não é certificação universal nem elimina scannerJava/NVD/CI. PrivilegioJDBCsuperuser/BYPASSRLS local identificado e incluído em P01/G01. CI gera senha PG e de contas efêmeras e as mascara; sem senha fixa de teste no workflow atual. [Relatório](RELATORIO_TRANSFERENCIA_E_PUBLICACAO.md).
