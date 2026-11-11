# Correção das verificações do PR #1 — 29/10/2026

## Escopo e preservação

PR revisado: [joaosoares03/vivamais#1](https://github.com/joaosoares03/vivamais/pull/1), de `LucasBS-Dev:main` para `joaosoares03:main`. Commit recebido: `3cc7e95eaf7b66aa3c144273ce4161e2e1d034c6`; base: `c1b597a9b147c14a1de6983f88e5953a26bd7a71`.

Correções desenvolvidas na branch local `codex/corrigir-pr-1`, em um worktree separado. O catálogo, as mídias, os serviços de OCR/alimentação e a migração V10 do outro desenvolvedor foram preservados. Nenhum merge ou push foi realizado nesta etapa. As falhas dos checks não demonstram, por si só, defeito nos novos módulos: o caminho fixo do Next já existia na base e os alertas dependem das versões/data da auditoria.

A `main` original continua limpa. O PostgreSQL original mantém nove migrações, os mesmos checksums e 33 tabelas. API e testes desta revisão usam bancos novos exclusivos, com dados sintéticos. Nenhum arquivo de V1–V10 foi alterado em relação ao PR recebido.

## Causas confirmadas e correções

### Browser

O log do run `39966386280`, job `121601962116`, falhava antes de executar testes: não existia `web/node_modules/next/dist/bin/next`. A instalação usa `node-linker=hoisted`; o pacote está no workspace raiz.

`playwright.config.ts` agora resolve o executável a partir de `web/package.json`, pelo mecanismo de resolução do Node, e aceita caminhos com espaços no Windows. O inicializador PowerShell usa a mesma resolução para dev/build/start. O job de navegador foi fixado em Ubuntu 24.04, compatível com a versão instalada do Playwright, evitando depender da transição de `ubuntu-latest` e de instalações lentas de dependências do navegador.

O CI agora constrói o portal no próprio job browser e usa `next start` (build otimizado); fora de CI, o Playwright mantém `next dev --webpack`. Isso segue o guia Playwright instalado com Next e verifica a CSP sobre o artefato entregue. No ensaio com servidor dev, o teste de preferências detectou 132 recusas de estilos; a asserção de ausência de violações foi mantida, sem liberar `unsafe-inline`.

A execução efetiva também revelou seletores antigos em três E2E e uma asserção de checkbox assíncrono. Foram ajustados para o catálogo atual, o botão “Ver materiais da atividade”, o estado “Roteiro de atividade bloqueado” e o título alimentar com ícone. O seletor alimentar se limita ao título visível, pois o Expo mantém a tela anterior oculta no DOM. O teste de preferências passou a clicar no checkbox e aguardar o PUT real e o estado confirmado, em vez de exigir alteração imediata com `check()` antes da resposta. O componente continua aplicando apenas valores confirmados pela API. Asserções de persistência após novo login e de zero violações de CSP foram mantidas.

As verificações de persistência, duplicação, autorização e indisponibilidade do provedor continuam; o teste de bloqueio também verifica a ausência de roteiro aprovado e de materiais individuais.

### TypeScript / auditoria JavaScript

No job `121601962263`, lint, tipagem, testes e builds haviam passado; a falha era em `pnpm audit --audit-level high`.

- Overrides restritos ao consumidor `@expo/cli`: `node-forge` 1.4.2 e Zod 4.6.6.
- Vitest 4.1.12 na raiz, no portal e nos contratos, com lockfile regenerado por pnpm 10.28.2.
- `infra/verificar-dependencias.mjs` exercita os schemas reais de plugins/comandos do Expo CLI, casos inválidos, recusa de coleção acima do limite antes de processar elementos e assinatura/verificação RSA com a biblioteca corrigida. A CI passou a executar essa verificação.

Zod foi atualizado de major por override localizado porque a versão do Expo CLI recebida ainda declara Zod 3. A compatibilidade foi verificada nos consumidores reais e nos builds; não há alegação de ensaio em aparelho físico. Não foi criado patch criptográfico próprio nem ignorado advisory.

Fontes consultadas: [release node-forge 1.4.2](https://github.com/digitalbazaar/forge/releases/tag/v1.4.2), [changelog oficial](https://github.com/digitalbazaar/forge/blob/main/CHANGELOG.md), [Zod 4.6.6](https://github.com/colinhacks/zod/releases/tag/v4.6.6) e [advisory Zod](https://github.com/advisories/GHSA-mrhx-c7xc-m3w5). A correção de forge foi publicada após a auditoria histórica de 20/10.

Auditoria final de 923 dependências: **zero críticos, altos e moderados; um baixo**. `pnpm audit --audit-level high` terminou com código 0. A auditoria completa sem limite continua reportando o alerta baixo de [deepmerge](https://github.com/advisories/GHSA-gcqx-w48m-w2h4), via Expo/config, sem versão corrigida indicada no registro consultado. Esse alerta não foi suprimido. O advisory histórico de braces não aparece no resultado atual; isso não é atribuído a uma correção de código nesta revisão.

### Java / NVD

O job `121601961626` passou no Maven `verify`. A falha posterior era no download da NVD pelo OWASP Dependency-Check 12.1.8, com HTTP 521 e base incompleta, sem chave de API. Não era uma evidência de falha de compilação Java.

Mantidos `failBuildOnCVSS=7` e falha em erro de auditoria. Adicionados cache da base do scanner, limite de 35 minutos para a etapa, até três retries NVD, timeout de conexão e diagnóstico explícito. Sem `continue-on-error`, desativação do scanner ou `pull_request_target`. A chave existente continua sendo lida por variável de ambiente; PRs de forks normalmente não recebem os secrets do repositório base.

A execução local do scanner encontrou erro H2 `90097-232` (“database is read only”) tanto no cache do worktree quanto no diretório privado de apoio. **Auditoria OWASP ainda não validada.** Esse H2 pertence ao cache do scanner; o banco da aplicação continua PostgreSQL. Cache e retries melhoram a recuperação, mas não garantem disponibilidade externa da NVD nem ausência de CVEs Java.

Fontes: [parâmetros oficiais](https://dependency-check.github.io/DependencyCheck/dependency-check-maven/check-mojo.html) e [cache da base](https://dependency-check.github.io/DependencyCheck/data/cacheh2.html). A documentação atual pode exibir versão mais nova; o projeto manteve o plugin 12.1.8.

## Validação local desta revisão

| Verificação | Resultado |
| --- | --- |
| Instalação com pnpm 10.28.2 e lock congelado | Aprovada |
| Testes Java 21 / PostgreSQL real | 81 aprovados, zero falhas/erros/ignorados |
| Testes frontend | 88 aprovados: 37 web e 51 app |
| TypeScript / ESLint | Aprovados |
| Next.js produção | Aprovado, 16 rotas |
| Expo export web / Android / iOS | Aprovados; bundles, sem APK/IPA ou ensaio físico |
| Contratos OpenAPI | Regenerados sem diferença no snapshot versionado |
| Consumidores Expo / Zod / forge | Aprovados |
| Auditoria pnpm no limite high | Aprovada, resta um alerta baixo |
| Workflow YAML / parser PowerShell / git diff --check | Aprovados |
| Gitleaks 8.30.1 | Commit recebido e diff das correções sem achados; candidato final rechecado antes da entrega |
| Playwright, 17 cenários | 17 aprovados em 1,5 minuto, zero falhas/ignorados/retries; código de saída 0 |
| OWASP Dependency-Check | Não concluído; erro de gravação do cache H2 local |
| Novos checks no GitHub | Não executados; correções ainda locais |

O ensaio final usa um banco novo exclusivo, uma nova instância de fixture e os mesmos limites de autenticação da aplicação, reproduzindo a preparação de um job novo do CI. Os dois bancos anteriores, o banco original e seus dados foram preservados; nenhum contador ou política de segurança foi modificado.

No Windows, uma reinstalação incremental manteve atalhos gerados do Vitest apontando para a versão antiga removida de `packages/contracts/node_modules`. Foram removidos apenas esses três atalhos ignorados pelo Git; os scripts passaram a usar o executável correto do workspace. Nenhum código funcional foi removido.

O primeiro ensaio iniciou os servidores pela configuração corrigida, mas o encerramento dos servidores no Windows ficou preso após os cenários. A execução final aprovada reutiliza servidores reais iniciados separadamente, com a mesma configuração de testes (CI, um worker, retries e cenários) e altera somente a posse dos processos por configuração privada ignorada pelo Git. O CI Linux continua usando a configuração versionada e iniciando seus próprios servidores. Essa diferença do ambiente local deve ser considerada ao reproduzir os resultados.

Os logs completos ficam no diretório privado de apoio `work/pr1-*.log`, fora do Git. Não anexar credenciais, caixas SMS, dumps ou chaves. O resumo versionado registra resultados sem esses dados.

## Próximo passo e critério de aceite

E2E e rechecagem de integridade/segredos finalizados. Próximo passo: publicar uma correção revisada na branch que alimenta o PR, mediante autorização para commit/push. Não fazer merge enquanto os checks relevantes não estiverem aprovados. Reexecutar a auditoria OWASP em ambiente com cache gravável e acesso à NVD; se houver HTTP 429/5xx, aquecer cache pela branch confiável ou configurar NVD_API_KEY em ambiente autorizado, sem fornecer secrets a código de fork.

Resumo estruturado com resultados e hashes dos logs privados: [validacao.json](correcao-pr1/validacao.json).
