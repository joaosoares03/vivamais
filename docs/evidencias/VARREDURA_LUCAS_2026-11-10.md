# Varredura local do Viva+ — Lucas — 10/11/2026

## Resultado e alcance

**419 testes distintos aprovados:** 110 unitários Java, 114 integrações Java/OCR, 66 do portal, 95 do app, 16 de infraestrutura e 18 de ponta a ponta. Nenhuma falha, erro ou teste ignorado no conjunto final. Os 114 de integração são os 111 da execução integral, mais os 3 testes da atualização posterior do João. Reexecuções seletivas não foram somadas novamente.

Foram reproduzidas falhas de validação de OCR, resposta e cache alimentar, além de uma mensagem enganosa na ativação do paciente. As correções estão na branch local `lucas/varredura-20261110`. A revisão anterior já está no [PR #6](https://github.com/joaosoares03/vivamais/pull/6); esta varredura ainda não foi enviada.

**Pendências abertas:** quatro ocorrências de alertas de dependências JavaScript (três moderadas e uma baixa), 18 divergências das versões recomendadas pelo Expo, ensaios físicos/nativos e confirmação do vínculo das contas na homologação. Não há autorização de uso clínico ou evidência de correção do incidente remoto de 06/11.

Esta é uma revisão automatizada ampla do código local, com banco real isolado e navegador Chromium. Não equivale a auditoria clínica, teste de invasão completo, ensaio em aparelho ou validação da implantação remota.

## Fonte, histórico e preservação

| Referência | Situação verificada nesta execução |
| --- | --- |
| `3cc7e95` / G16 e G17 | Trabalho original de Lucas preservado no histórico. |
| [PR #1](https://github.com/joaosoares03/vivamais/pull/1) | Aberto; head `0c564c5`, destino `main`. O fato de estar aberto não impede que seus commits já estejam na branch de homologação. |
| PRs [#3](https://github.com/joaosoares03/vivamais/pull/3), [#4](https://github.com/joaosoares03/vivamais/pull/4) e [#5](https://github.com/joaosoares03/vivamais/pull/5) | Código de modo produtivo, portal e plano da equipe herdado da base `1afe882`. Não foi reimplementado. |
| [PR #6](https://github.com/joaosoares03/vivamais/pull/6) / `202942d` | Revisão anterior de Lucas: seleção de pressão, acesso ao registro após vídeo e CORS de testadores. Aberto, sem merge. |
| [CI do PR #6](https://github.com/joaosoares03/vivamais/actions/runs/42830962813) | Jobs Java, TypeScript, navegador, segredos e imagem de produção aprovados. É evidência de `202942d`, não destas alterações novas. |
| [PR #7](https://github.com/joaosoares03/vivamais/pull/7) / `b6abac8` | Mesclado por João em `f4b5dfc` durante a varredura. Desliga OpenAPI nos perfis de nuvem e produção. |
| `3d922a9` | Conciliação **local** de `f4b5dfc` com `202942d`. Único conflito: inserções no `CHANGELOG.md`; ambas preservadas. O conflito do PR #6 remoto permanece até o envio de uma atualização. |

Nenhuma migration V1–V18, contrato OpenAPI gerado, manifesto de dependências ou lockfile foi alterado por esta varredura. Nenhuma V19 foi criada. `main` e o fork publicado foram preservados. Não houve merge remoto, deploy, contratação ou mudança de configuração da nuvem.

## Ambiente e método

- Windows, PowerShell, Node 24.20.0, pnpm 10.28.2, Java 21.0.12.1 e PostgreSQL 17.11.
- API Java em loopback, portal Next otimizado e prévia Expo web. Execução em `APP_ENV=development`; `CI=true` seleciona o servidor otimizado do teste e não promove o ambiente para produção.
- Schemas locais exclusivos para os testes, migrações Flyway reais, contas e registros fictícios. O schema da aplicação existente não foi restaurado, apagado ou usado como massa de teste.
- Convites e SMS simulados localmente; nenhum convite privado recebido por WhatsApp foi consumido nesta varredura. Sem SMS real, fornecedor alimentar externo ou envio de fotos a terceiros.
- Logs brutos, dados de execução e credenciais ficam em `.local/varredura-20261110`, ignorado pelo Git. Os XML Maven contêm propriedades do processo e não devem ser publicados integralmente.
- Evidência pública sanitizada: [resumo JSON](varredura-lucas-20261110/validacao.json), [corpus de imagens](varredura-lucas-20261110/corpus-ocr/README.md) e resultados descritos abaixo.

## Verificações finais

| Verificação | Resultado | Evidência local privada |
| --- | --- | --- |
| TypeScript de contratos, portal e app | Aprovado | `typecheck-final.log` |
| ESLint | Aprovado | `lint-final.log` |
| Vitest portal | 66 aprovados | `frontend-final.log` |
| Vitest app | 95 aprovados | `frontend-final.log` |
| Maven integral com OCR real | 110 unitários + 111 integrações; zero falhas/erros/ignorados | `backend-final.log` |
| Atualização OpenAPI do João | 3 integrações adicionais aprovadas; unitários repetidos sem falha | `openapi-atualizacao-corrigida.log` |
| Infraestrutura Node | 16 aprovados | `infra-final.log` |
| Playwright Chromium, sem retries | 18 aprovados; zero instáveis/ignorados | `e2e-final.json`, `e2e-final.log` |
| Build do portal | Aprovado | `build-portal.log` |
| Export Expo web seguro | Aprovado após as alterações do app | `expo-final.log` |
| Regeneração de contratos | Aprovada, sem mudança de conteúdo gerado | `contratos.log` |
| Compatibilidade dos patches de dependências | Aprovada, incluindo 32 mil sequências e importação CJS/ESM | `compatibilidade-dependencias.log` |
| Auditoria pnpm completa | Exit 1: 3 moderados, 1 baixo; zero altos/críticos | `auditoria-js.json` |
| Gate pnpm `--audit-level high` | Exit 0; não elimina os quatro alertas | `auditoria-js-gate-final.log` |
| `expo install --check` | Exit 1: 18 versões fora da recomendação consultada | `expo-compatibilidade.log` |
| Gitleaks final, textos versionados e novos não ignorados | Zero achados; escopo no JSON público | `gitleaks-final.log` |

O pacote de contratos não contém testes próprios; seu `--passWithNoTests` não acrescenta testes ao total. Seus consumidores foram exercitados pelo app, portal, Java e geração de tipos.

### Comandos de reprodução no PowerShell

Os comandos abaixo pressupõem as dependências instaladas e a API/PostgreSQL **de teste isolado** preparados. Não executar E2E contra a nuvem ou apontar a massa de integração para o schema da aplicação. Senhas e bootstrap ficam apenas no ambiente do processo.

```powershell
pnpm.cmd typecheck
pnpm.cmd lint
pnpm.cmd test
node --test tests/infra/*.test.mjs
node infra/verificar-dependencias.mjs
pnpm.cmd contracts:generate
pnpm.cmd build:web
node infra/exportar-expo.mjs --modo seguro --plataforma web

# Com TEST_DATABASE_* e o runtime OCR previamente configurados:
.\backend\demo\mvnw.cmd -f .\backend\demo\pom.xml verify

# Com API local de testes, E2E_PASSWORD e demais opções do Playwright configurados:
$env:CI = 'true'
pnpm.cmd exec playwright test --retries=0 --reporter=list,json

pnpm.cmd audit --json
pnpm.cmd audit --audit-level high
pnpm.cmd exec expo install --check
```

Para o corpus OCR com motor real, usar as [instruções específicas](varredura-lucas-20261110/corpus-ocr/README.md). O E2E precisa de Chromium instalado e do modo de acesso compatível com a suíte (SMS LOCAL, sem modo de testadores). Não mudar limites ou desativar CSP para fazer a bateria passar. Ver também `playwright.config.ts` e `.github/workflows/ci.yml`.

## Falhas reproduzidas e correções

### OCR: valores ambíguos e confiança inválida

**Antes:** testes novos demonstraram aceitação de prefixos de números de quatro dígitos, números negativos/decimais, rótulos duplicados ou leituras misturadas. Confianças inválidas podiam seguir para o resultado. Na primeira rodada adversarial, 12 dos 14 testes falharam contra o código anterior.

**Agora:** cada rótulo deve ter um número completo de dois ou três dígitos; sinais, decimais e rótulos repetidos são recusados. A alternativa sem rótulos exige uma única leitura completa e não completa um rótulo ilegível com números de outra linha. Confiança não finita ou fora de 0–1 é recusada sem propagação do valor. Configuração de mínimo fora de `(0,1]` impede a inicialização.

Critérios padrão atualizados para `ocr-safety-v2`, sem alterar faixas técnicas, medições antigas ou migrations. A suíte unitária de OCR passou de 2 para 25 testes. O corpus textual v1 continua como regressão histórica.

**Arquivos:** `ArquivoPrivadoService.java`, `ProvedorOcr.java`, `ReconhecedorTesseract.java`, `application.yml`, `ArquivoPrivadoServiceOcrTest.java` e expectativa em `CuidadoIT.java`.

### Alimentação: quantificação indevida e conteúdo de controle

**Antes:** a resposta podia passar com quantidades expressas por extenso na unidade, como “2 gramas de sódio” ou “200 quilocalorias”. Um caractere de controle dentro de um alimento identificado também passava. Os cinco novos cenários falharam contra a implementação anterior.

**Agora:** a validação inclui unidades por extenso em português e inglês, além das abreviações já protegidas. Caracteres de controle em `identifiedFoods` são recusados. São verificações do contrato educativo; não estimam nutrientes nem demonstram compreensão irrestrita de linguagem natural.

**Arquivos:** `ProvedorAnaliseAlimentacaoHttp.java` e seu teste. Respostas são inteiramente sintéticas; nenhum provedor foi habilitado ou chamado.

### Alimentação: reutilização de cache anterior à política atual

**Antes:** um resultado legado podia ser reutilizado apenas por coincidência de fornecedor/modelo/critérios/contrato, sem conferir a referência atual de aprovação ou a versão da validação local. O teste com PostgreSQL reproduziu esse reaproveitamento indevido.

**Agora:** a busca exige também `approval_reference` atual e `assessment.validationVersion=food-response-safety-v2`. A versão local é marcada pelo servidor depois da validação. O teste confirma descarte do cache antigo, nova validação e reutilização correta na solicitação seguinte. Limites de tentativas e custo foram mantidos.

Não há reescrita retroativa de snapshots históricos; esta correção impede seu reaproveitamento como resultado atual. **Arquivos:** `ArquivoPrivadoService.java` e `CuidadoIT.java`.

### Ativação: erro de limite apresentado como cookies

**Antes:** qualquer falha da renovação após a ativação web era convertida em uma mensagem sobre permitir cookies, com status 401. A repetição dos testes encontrou um 429 legítimo do limitador que acabava descrito como problema de cookies.

**Agora:** erros conhecidos preservam mensagem sanitizada e status, incluindo 429, indisponibilidade e rede. Um 401 recebe orientação específica; exceções desconhecidas geram mensagem genérica, sem texto interno. Limites e limpeza da sessão não foram enfraquecidos. Seis testes novos aprovados.

**Arquivos:** `contexts/ContextoAutenticacao.tsx`, `services/autenticacao/erroAtivacao.ts` e `tests/mobile/erro-ativacao.test.ts`.

### Atualização do João: OpenAPI

A alteração recebida pelo PR #7 foi preservada. Os perfis `nuvem` e `producao` desligam a rota do contrato; uma sessão válida não deve obter esse documento nesses perfis. As três verificações de `DocumentacaoApiDesligadaIT` passaram localmente, usando configuração de teste e banco isolado. Isso não é um ensaio de implantação produtiva.

## OCR real: oito imagens sintéticas

`OcrImagensSinteticasIT` gera PNGs por código, prepara as imagens pelo fluxo do servidor e usa Tesseract real. Nenhuma foto ou medição de pessoa. As oito imagens e o resultado sanitizado estão no [corpus público](varredura-lucas-20261110/corpus-ocr/README.md).

| Caso | Resultado | Confiança observada | Motivo |
| --- | --- | --- | --- |
| Legível, SYS 118 / DIA 76 / pulso 71 | `RECOGNIZED` | 0,94 | `HUMAN_CONFIRMATION_REQUIRED` |
| Valores invertidos | `UNREADABLE` | 0,93 | `INVERTED_VALUES` |
| Fora da faixa técnica | `UNREADABLE` | 0,94 | `OUT_OF_PLAUSIBLE_RANGE` |
| Texto sem números | `UNREADABLE` | 0,91 | `INCOMPLETE_VALUES` |
| Imagem branca | `UNAVAILABLE` | — | `UNAVAILABLE` |
| Desfoque forte | `UNREADABLE` | 0,12 | `LOW_CONFIDENCE` |
| Rotação de 180° | `UNREADABLE` | 0,52 | `LOW_CONFIDENCE` |
| Rótulos repetidos | `UNREADABLE` | 0,88 | `AMBIGUOUS_OR_MALFORMED_VALUES` |

Neste conjunto pequeno: **3/3 campos corretos no único caso legível; 7/7 recusas seguras nos casos inválidos; zero inversões aceitas**. São contagens da amostra, sem inferência estatística sobre fotos reais. Confiança não é probabilidade clínica. Nos sete recusados, SYS/DIA/pulso permaneceram nulos. O reconhecimento legível continua exigindo confirmação explícita antes de criar uma leitura; integração e E2E cobriram essa separação com dados sintéticos.

Sem runtime OCR, esse IT informa teste ignorado. Na execução registrada o runtime estava disponível e houve **zero ignorados**. Fonte de teste e imagens são publicadas para reprodução; o motor/fontes do sistema podem modificar a confiança em outros ambientes.

## Cobertura dos módulos

| Área | Evidência exercitada | Limite prático |
| --- | --- | --- |
| Autenticação, cadastro e aparelhos | CPF/nascimento sintéticos, ativação, SMS LOCAL, troca assistida, sessão persistida, saída e revogação | Não valida SMS comercial nem iPhone físico. |
| Contas por convite e isolamento | Integrações de instituição, testadores, contas e negações de acesso por papel/vínculo/unidade; CORS e origem do BFF | Não identifica a ficha associada aos convites remotos usados em 06/11. |
| G16 e plano da equipe | Aprovação/revogação, grupo funcional, conflito de versão, plano, registro ligado ao exercício e consulta compartilhada | Aprovação usada nos testes é fictícia; não aprova clinicamente o catálogo. |
| Pressão e G17 OCR | Registro manual, validação/recusa OCR, confirmação explícita, persistência e histórico compartilhado | Não mede pressão nem interpreta diagnóstico. |
| Alimentação e arquivos | Foto privada, limites/preparo, controle de acesso, histórico e validação/cache sintéticos da análise | Fornecedor externo continua desabilitado; resultado educativo real não foi validado. |
| Medicamentos | Agenda, vigência, autorrelatos, isolamento e regressões de edição | Autorrelato não comprova ingestão; nenhum medicamento foi prescrito. |
| Consultas, diário, relatórios e preferências | Suítes de cuidado, navegação, filtros, consultas, exportação e persistência de preferências | Não garante toda combinação de formulário ou volume de produção. |
| Offline e sincronização | Fila, retomada e ausência de duplicação no Expo web com API real | Não valida persistência SQLCipher após fechar o app nativo. |
| Interface e arquivos estáticos | Responsividade, navegação, páginas protegidas, MP4/ranges/HEAD e bloqueio de caminho privado | Sem leitor de tela, Safari/HEIC físico ou revisão visual completa de todas as telas. |

Vercel e Railway hospedarem interfaces separadas não impede a integração: ela depende de API, banco, organização e **ID do paciente** coerentes. Nos testes locais com o mesmo paciente, leitura e autorrelatos atravessaram os fluxos cobertos. Isso não prova que as duas contas remotas de mesmo apelido representam a mesma ficha.

## Histórico das tentativas que falharam

| Tentativa | Observação | Tratamento e estado final |
| --- | --- | --- |
| OCR adversarial inicial | 12 falhas/14 testes | Defeitos reproduzidos; suíte ampliada para 25 e aprovada. |
| Alimentação adversarial inicial | 5 falhas/9 testes | Validação corrigida; 9 aprovados. |
| Cache alimentar inicial | 1 falha/1 teste | Chave de cache endurecida; regressão com PostgreSQL aprovada. |
| Playwright 1 | 2 passaram/16 falharam; Chromium não instalado | Pré-requisito instalado na pasta privada; não era defeito de produto. |
| Playwright 2 | 10 passaram/8 falharam | Corrigidos modo de acesso local/SMS e uso do build otimizado. Desenvolvimento Next causava lentidão e violações da CSP pelo carregamento de estilos; CSP não foi relaxada. |
| Playwright 3 | 16 passaram/2 falharam | Repetição no mesmo schema atingiu o limite legítimo de renovação (máximo observado 123; limite 120/900 s). Corrigida mensagem enganosa; nova rodada com massa isolada, sem zerar contadores ou reduzir limites. |
| Playwright final | 18 aprovados | Sem retries, instabilidade ou exclusão de cenários. |
| Primeiro ensaio OpenAPI | 3 erros de inicialização | Configuração do executor apontava para papel PostgreSQL inexistente. Corrigido usuário local; os 3 testes passaram sem mudança no produto. |
| Compilação intermediária do teste OCR | Declaração `var` composta inválida | Erro do teste novo corrigido antes da execução final; não classificado como defeito preexistente. |

## Dependências e outras pendências

| Item | Situação | Próxima ação |
| --- | --- | --- |
| `glob` 13.0.6 | Moderado, [GHSA-3g3m-2fjr-6pw4](https://github.com/advisories/GHSA-3g3m-2fjr-6pw4); correção indicada a partir de 14.0.2 | Atualizar consumidores Expo de forma conjunta e validar. |
| `minimatch` 9.0.9 e 10.2.6 | Duas ocorrências moderadas, [GHSA-g3hv-75wg-m249](https://github.com/advisories/GHSA-g3hv-75wg-m249); correção indicada a partir de 11.0.1 | Evitar impor major global aos consumidores antigos; planejar atualização compatível e regressão. |
| `deepmerge` 4.3.1 | Baixo, [GHSA-gcqx-w48m-w2h4](https://github.com/advisories/GHSA-gcqx-w48m-w2h4); sem versão corrigida indicada na consulta | Acompanhar consumidor/upstream e documentar tratamento. |
| Expo | 18 recomendações, inclusive TypeScript `~6.0.3` versus `5.9.3` atual | Migração planejada do conjunto, com novo build e ensaio nativo. Não foi aplicado `--fix`. |
| Auditoria Java OWASP/NVD | Aprovada na CI do PR #6; POM não mudou nesta varredura | CI nova deve validar o commit a publicar. Não se declarou nova execução local OWASP. |
| Produção | O PR #3 alterou a premissa antiga de bloqueio absoluto: o código agora permite produção sob validações e referência de autorização | Registrar decisão de governança. A varredura local não autoriza esse uso nem restaura silenciosamente a regra anterior. |
| Homologação | Sem consulta ao banco remoto ou teste autenticado dos convites de Lucas nesta rodada | Após publicação autorizada, conferir SHA de API/portal e ID/vínculo das fichas, então repetir o fluxo do incidente. |
| Nativo, acessibilidade e clínica | Sem APK/IPA novo, aparelho físico, leitor de tela ou revisão clínica dos dez exercícios | Exigem ensaios e responsáveis próprios. |

Os alertas JavaScript estão nos caminhos de ferramentas Expo/ESLint identificados no grafo. Isso não demonstra ausência de exploração. Não houve ignore/suppression, troca de major ou alteração do limiar para apresentar aprovação artificial.

## Próxima entrega

1. Revisar o pacote local e autorizar seu envio. O conflito documental com o PR #7 já foi resolvido em `3d922a9`; não está resolvido no PR #6 remoto até publicar a conciliação.
2. Publicar a branch e atualizar o PR #6 ou abrir PR adicional contra a homologação, deixando explícita a relação entre as entregas. Registrar o novo link e a CI, sem presumir merge.
3. João/responsável revisa e decide o merge. Deploy e teste autenticado na homologação dependem de autorização e do SHA efetivamente implantado.
4. Tratar dependências/Expo numa mudança própria, sem misturar migrações, atualização nativa e aprovação clínica com este endurecimento de validação.

Resumo pronto para o fechamento do dia: [resumo de Lucas](../RESUMO_DIA_LUCAS_2026-11-10.md). Nenhuma mensagem foi enviada automaticamente.
