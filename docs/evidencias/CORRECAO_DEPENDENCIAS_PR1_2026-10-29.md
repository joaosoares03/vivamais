# PR #1 — dependências corrigidas e prévia local — 29/10/2026

Estado: código, testes funcionais e auditorias aprovados; novo CI remoto/publicação ainda pendentes. Nenhum merge ou deploy.

## Diagnóstico confirmado

A execução [40934407518, tentativa 2](https://github.com/joaosoares03/vivamais/actions/runs/40934407518) analisou `ea12f700b1b50fe12f78a0ec779f199f259ff180`. TypeScript, lint, testes, Next, Expo web e contratos passaram; o job TypeScript falhou exclusivamente no novo aviso GHSA-qr28-fpjm-wq7f/CVE-2026-118664. O job Java aprovou `verify`, os 12 testes da fonte NVD, a atualização integral e o salvamento do cache; falhou ao aplicar o limiar de vulnerabilidades. Browser e secret-scan passaram.

Recebido `auditoria-java-40934407518-2.zip`, SHA-256 `a698cba2e0375ae0644cf34f7d3570f279eb7da81bd3655fbe6ad52c7a20fe48`, igual ao digest público do GitHub. O relatório lista nove componentes, incluindo dois bundles DOMPurify. Uma biblioteca sinalizada não comprova que todos os cenários descritos nas CVEs são exploráveis neste aplicativo. A correção atual atualiza as bibliotecas, sem adicionar exceções.

## Alterações

| Componente | Antes | Agora |
| --- | --- | --- |
| decode-uri-component | 0.5.0 | 0.5.1; patch query-string CJS/ESM mantido |
| Spring Boot | 3.5.16 | 4.1.2, Java 21 mantido |
| Spring Framework | 6.2.19 | 7.0.10, gerenciado pelo Boot |
| Spring Security | 6.5.11 | 7.1.2, gerenciado pelo Boot |
| Tomcat | 10.1.55 | 11.0.27, gerenciado pelo Boot |
| PostgreSQL JDBC | 42.7.11 | 42.7.14, gerenciado pelo Boot |
| Log4j API/bridge | 2.24.3 | 2.25.5, gerenciado pelo Boot |
| Jackson | 2.21.4 | 3.1.7 na aplicação; 2.21.7 transitivo no springdoc |
| Commons Lang | 3.17.0 | 3.20.0 |
| Springdoc | 2.8.17 com UI desativada | 3.2.0, módulo API, sem o bundle Swagger UI/DOMPurify |

As correções Spring 6.2.20/6.5.12 necessárias são distribuídas somente por suporte empresarial. Para manter a infraestrutura econômica sem depender de licença paga, foi adotada a linha pública corrigida do Spring Boot. A arquitetura, o banco, Java 21, a API, o portal e o aplicativo permanecem.

Jackson 3 exigiu trocar imports `databind`/`TypeReference`, mantendo as anotações `com.fasterxml.jackson.annotation`. O acesso aos nomes de campos usa `propertyNames().iterator()`. `use-jackson2-defaults` preserva os padrões anteriores de JSON. Novos módulos WebMVC/Flyway/testes e pacote de auto-configuração de segurança seguem Boot 4. As regras de autenticação, limites, vínculos, clínica, OCR, SMS e análise alimentar não foram ampliadas.

A UI Swagger já estava desativada. O módulo API mantém `/v3/api-docs` autenticado e os contratos TypeScript existentes. Sem endpoint novo ou documentação exposta anonimamente. As 45 rotas e os 37 esquemas são semanticamente os mesmos; a única diferença no snapshot gerado foi ordenar `required` de `ApiProblem`. O snapshot versionado não precisou ser regravado.

A seleção do Java no inicializador passou a capturar stdout/stderr via `ProcessStartInfo`, com prazo de dez segundos e confirmação do exit code. Isso corrige o `NativeCommandError` do Windows PowerShell 5.1 ao receber `java -version` em stderr; não ignora um erro real do executável.

## Verificação desta alteração

| Verificação | Resultado |
| --- | --- |
| Compilação Java 21, código e testes | Aprovada |
| 28 unitários + 53 integrações Java | 81 aprovados, zero falhas/erros/ignorados, PostgreSQL 17.9 e OCR real |
| Pacote executável Boot 4.1.2 | Aprovado; `package -DskipTests` não foi contado como execução de testes |
| Contrato OpenAPI | 45 rotas / 37 esquemas preservados, sem diferença semântica |
| TypeScript | Aprovado nos workspaces e aplicativo |
| Testes frontend | 37 web + 51 app = 88 aprovados |
| Consumidores Expo CLI e query-string | Aprovados; regressão CVE com 32 mil sequências diferentes em processo com limite de seis segundos |
| pnpm audit --audit-level high | Exit 0; um baixo deepmerge permanece, sem crítico/alto/moderado |
| Expo web/Android/iOS atualizados | Exports aprovados, incluindo bundles Hermes; web servido em 8081 |
| Playwright com portal otimizado/API nova | 17 aprovados em 1,6 minuto; zero falhas/ignorados/retries |
| Seleção do JDK com ErrorActionPreference Stop | Aprovada no Windows PowerShell 5.1 e PowerShell 7.6.5 |
| Banco/migrações | Original continua V1–V9; V1–V10 do PR intactas; testes em banco/schemas sintéticos isolados |
| Auditoria Java completa | Aprovada no Windows normal às 17:29:52: 42 dependências, zero componentes com alertas, CPE/NVD/RetireJS concluídos |

O comando de testes Java foi `test failsafe:integration-test failsafe:verify`. O primeiro ensaio teve dois contextos impedidos pelo diretório temporário da sandbox; repetir com temporário gravável em `work/tmp` aprovou todos os 81 testes. O primeiro export Hermes foi impedido pelo temporário nativo da sandbox; repetir com TEMP/TMP graváveis aprovou web/Android/iOS, sem alterar o código para contornar validações. A configuração privada Playwright reutiliza os servidores controlados separadamente para contornar o encerramento bloqueado de árvores de processos Windows; os mesmos 17 cenários foram executados sem retries. As capturas atuais e logs estão em `work/pr1-seguranca-*`, fora do Git; as capturas históricas versionadas foram preservadas.

A auditoria externa atualizou a base NVD em 4 minutos e 33 segundos e concluiu a análise em cerca de 19 segundos, com exit 0. O relatório JSON foi conferido contra o POM revisado e os JARs resolvidos. Nenhuma suppression foi criada, nenhum analyzer foi desativado e os limiares permaneceram. OSS Index não foi consultado porque o serviço exige credencial; é a limitação padrão já presente na configuração anterior, registrada no log. O relatório confirma zero alertas nas fontes consultadas, sem significar garantia de ausência de vulnerabilidades desconhecidas.

## Prévia para o usuário

Portal: http://127.0.0.1:3000/ — Aplicativo: http://127.0.0.1:8081/acesso. API: http://127.0.0.1:8080/actuator/health.

A prévia usa o banco sintético do PR e o backend atualizado. Profissional: `profissional.a@demo.vivamais.invalid`, com a senha já configurada. Não existe senha padrão; nenhum segredo foi incorporado ao código/documento. No portal, consultar a ficha/aba de atividades; no aplicativo, abrir Atividade Física e materiais. OCR continua exigindo confirmação. Análise alimentar externa não foi ativada sem serviço/critérios aprovados. SMS LOCAL é uma caixa cifrada de teste, não envio por operadora.

Guia privado desta máquina: `outputs/VIVA_MAIS_ACESSO_PR1.txt`; inicializador privado `work/Iniciar-Previa-PR1.ps1`. Não são necessários para clonar em outra máquina: seguir o guia de ambiente e usar credenciais próprias.

## Pendências e próxima tarefa

Auditoria integral examinada e aprovada. Publicar a correção revisada no mesmo fork/PR autorizado e conferir os quatro checks remotos. Preservar CVSS >= 7, `failOnError=true`, NVD atual e todos os analyzers padrão. Não fazer merge, deploy ou contratar serviço. Ainda não há novo resultado remoto para estas alterações. Export de bundles não significa APK/IPA, ensaio físico ou publicação em loja.

## Fontes consultadas

- [Aviso decode-uri-component](https://github.com/advisories/GHSA-qr28-fpjm-wq7f).
- [Spring CVE-2026-47884 e disponibilidade das correções](https://spring.io/security/cve-2026-47884/), [CVE-2026-59313](https://spring.io/security/cve-2026-59313/) e [Spring Security CVE-2026-59270](https://spring.io/security/cve-2026-59270/).
- [Guia oficial de migração Boot 4](https://github.com/spring-projects/spring-boot/wiki/Spring-Boot-4.0-Migration-Guide).
- [Compatibilidade Springdoc 3.2/Boot 4.1](https://springdoc.org/).
- [Segurança PostgreSQL JDBC](https://jdbc.postgresql.org/security/), [Tomcat](https://tomcat.apache.org/security-10.html) e [Log4j](https://logging.apache.org/security.html).
- [BOM Boot 4.1.2 efetivamente resolvido](https://repo.maven.apache.org/maven2/org/springframework/boot/spring-boot-dependencies/4.1.2/spring-boot-dependencies-4.1.2.pom).