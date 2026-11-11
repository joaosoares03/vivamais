# Auditoria NVD do PR #1 — 29/10/2026

## Falha remota confirmada

O commit `11746883945ac3ddbd71de224736e78d1dbc77f8` foi publicado no fork e recebido pelo [PR #1](https://github.com/joaosoares03/vivamais/pull/1). No run [40920267489](https://github.com/joaosoares03/vivamais/actions/runs/40920267489), `typescript`, `browser` e `secret-scan` passaram. O job Java passou no `mvnw verify` e falhou somente na etapa de auditoria, após 35 minutos. O log fornecido mostra download de 190.000/416.709 registros NVD; a base não havia terminado de atualizar. O passo de salvamento do cache foi ignorado porque o job falhou.

O primeiro ajuste resolveu os testes do navegador e a auditoria JS, mas cache/retries da API não resolveram o primeiro carregamento da NVD sem chave. A nova correção atua nessa causa, sem ampliar o limite para mascarar a indisponibilidade.

## Alterações

- Dependency-Check 12.2.2 como ferramenta de auditoria do CI. POM, Java 21, Spring Boot, PostgreSQL e dependências da aplicação permanecem iguais. Essa versão corrige leitura de metadados dos feeds em viradas de ano, parsing de timestamps NVD e tamanho de referências no schema do próprio scanner.
- Fonte oficial compactada: `https://nvd.nist.gov/feeds/json/cve/2.0/nvdcve-2.0-{0}.json.gz`. A ferramenta continua importando a base completa necessária; não usa apenas os registros recentes. O fluxo não depende de NVD_API_KEY nem de secrets enviados a forks.
- Validação prévia dos metadados `modified.meta`: HTTP bem-sucedido, data válida com até 24 horas, tolerância de 15 minutos para relógio futuro, tamanhos positivos e formato SHA-256. A checagem de formato do hash não equivale a verificar o hash de cada arquivo de dados. HTTP/HTML/dados inválidos ou antigos impedem a auditoria.
- Atualização obrigatória com `update-only`, limite de 35 minutos, seguida de cache salvo antes de `check`. Apenas atualização concluída pode chegar ao salvamento. O cache tem namespace novo por versão/formato/SO e chave por dia UTC, evitando restaurar o H2 incompatível da versão anterior.
- `check` continua obrigatório, com `failBuildOnCVSS=7`, `failOnError=true`, atualizações habilitadas e limite separado de 15 minutos. Uma CVE ou falha da análise não apaga o cache já atualizado. Não há suppression adicionada, `skip`, `continue-on-error` ou liberação de `pull_request_target`.
- Relatórios JSON/HTML preservados por sete dias quando gerados, inclusive se o scanner apontar vulnerabilidades. Nenhum deploy, merge ou mudança da hospedagem foi feito.

## Validação

- 12 testes Node passaram: metadados com fuso, chave UTC, base antiga/futura, dados malformados, hash/tamanho inválidos, duplicação, limite de corpo, HTTP 503 e erro de rede.
- Consulta real aos metadados `modified` e `2026`: HTTP 200, atualizações de 29/10/2026. Saída `dia=2026-10-29` para a chave do GitHub testada.
- Actionlint 1.7.12: zero erros. Binário oficial verificado por SHA-256 do release. YAML e ordem atualização/cache/análise também verificados; CVSS/falha em erro mantidos.
- Plugin Maven 12.2.2 e seus parâmetros carregados com Java 21.
- A atualização integral local terminou em 303.248 ms (cerca de 5 minutos), com feeds oficiais de 2002–2026 e `modified`; o segundo goal reutilizou a base sem repetir o download. A análise não foi aprovada: o índice CPE encontrou `AccessDeniedException` ao renomear um arquivo Lucene no sandbox Windows. O relatório também encontrou DOMPurify 3.3.2 embutido no Swagger UI; CVE-2026-116803 apareceu sem métricas CVSS e com severidade RetireJS alta (fallback de pontuação 10). A API oficial NVD informa CVSS 3.1 6.1 e CVSS 4.0 5.1; o fornecedor classifica o GHSA como baixo. Não foi criada suppression ou alterado limiar. Falta validação integral em ambiente sem essa restrição.
- Aplicação, contratos e migrações V1–V10 sem alterações. As regressões da aplicação são as verificadas no commit remoto `1174688`; os checks remotos da nova alteração precisam de nova execução.

## Ambiente local

O H2 do scanner reaberto na pasta do projeto detecta o arquivo como somente leitura neste sandbox, apesar de a criação inicial funcionar. Um teste pequeno reproduziu o erro sem envolver dados da aplicação. No diretório temporário nativo, criação, gravação e reabertura passaram. O ensaio integral usa esse diretório com a configuração normal do scanner e dados oficiais; não substitui o PostgreSQL da aplicação, não usa CVEs fictícias e não altera o banco original. Uma tentativa em H2 em memória não tinha o schema externo inicializado e foi descartada como evidência de aprovação.

Logs e resultados detalhados ficam em `work/pr1-nvd*.log`, fora do Git. A atualização futura do PR deve preservar o histórico e usar push normal para `LucasBS-Dev/vivamais:main`.

## Fontes primárias

- [Fonte oficial NVD](https://nvd.nist.gov/vuln/data-feeds) e [metadados atuais](https://nvd.nist.gov/feeds/json/cve/2.0/nvdcve-2.0-modified.meta).
- [Mantenedores: uso dos feeds oficiais em lugar da API](https://github.com/dependency-check/DependencyCheck/discussions/8633).
- [Release 12.2.2](https://github.com/dependency-check/DependencyCheck/releases/tag/v12.2.2) e [changelog](https://github.com/dependency-check/DependencyCheck/blob/main/CHANGELOG.md).
- [Parâmetros do plugin](https://dependency-check.github.io/DependencyCheck/dependency-check-maven/check-mojo.html) e [fonte do processamento de feeds em 12.2.2](https://github.com/dependency-check/DependencyCheck/blob/v12.2.2/core/src/main/java/org/owasp/dependencycheck/data/update/NvdApiDataSource.java).

Sobre o alerta: [advisory do fornecedor](https://github.com/cure53/DOMPurify/security/advisories/GHSA-mrv2-3pqr-j5jr) e [registro NVD](https://nvd.nist.gov/vuln/detail/CVE-2026-116803). Foi inspecionado o WebJar Swagger UI 5.34.0 mais recente: ainda contém DOMPurify 3.4.16. Nenhuma atualização de dependência foi aplicada sem comprovação de correção; POM e configuração da aplicação continuam preservados.

As consultas de versão e a classificação do alerta não alteraram dependências. Não há correção criptográfica ou de sanitização própria nesta entrega. Os alertas remanescentes continuam visíveis ao scanner; sua classificação completa será conferida na nova execução Linux.
