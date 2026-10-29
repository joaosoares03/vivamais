# API Viva+

Java 21, Spring Boot 4.1.2, Spring Security, JDBC parametrizado, PostgreSQL 17 e Flyway. Somente demonstração com dados sintéticos. Implementa identidade, cadastro/ativação/recuperação assistida, pressão idempotente/OCR confirmado, medicamentos/autorrelatos, diário, atividade, consultas, arquivos privados e porta de pulseira com simulador explícito. Estado e testes atuais em ../../docs/STATUS.md.

## Executar

Com Java 21, PostgreSQL criado e variáveis configuradas no ambiente:

```powershell
$env:DATABASE_URL='jdbc:postgresql://localhost:5432/vivamais'
$env:DATABASE_USER='vivamais'
# Defina DATABASE_PASSWORD pelo gerenciador de segredos/ambiente local.
.\mvnw.cmd spring-boot:run
```

Linux/macOS: `bash mvnw spring-boot:run` (ou conceda permissão de execução ao wrapper). Na raiz do monorepo, o Docker Compose fornece banco e API. A URL deve ser JDBC; use a conexão PostgreSQL direta ou pooler compatível com transações e Flyway. Em demo remota acrescente `?sslmode=verify-full` e instale a CA do fornecedor quando necessário. Não use banco com tabelas de outro produto.

Migrações executam antes de iniciar. Saúde pública mínima: `GET /actuator/health`; documento OpenAPI real: `GET /v3/api-docs`, autenticado. O Swagger UI está desativado; importe o JSON em cliente OpenAPI autorizado.

`openapi.json` é o snapshot obtido da API durante teste integrado. `verify` gera `target/openapi.json`; após alterar contratos, copie esse arquivo validado para `openapi.json` e regenere o cliente TypeScript na raiz.

## Provisionar contas de demonstração

Defina `DEMO_BOOTSTRAP_PASSWORD` localmente (mínimo 12 caracteres, máximo 72 bytes UTF-8) e execute **uma vez** com `SPRING_PROFILES_ACTIVE=bootstrap`. A API exige `app.demo-only=true` e todas as tabelas iniciais restringem a demo a dados sintéticos. Depois reinicie sem esse perfil e remova a senha de bootstrap do ambiente de execução.

As contas são `admin.a@demo.vivamais.invalid`, `profissional.a@demo.vivamais.invalid`, `paciente.a@demo.vivamais.invalid` e os equivalentes com `.b`. Cada clínica tem paciente com app e paciente de diário sem conta, ambos vinculados ao profissional da própria clínica. O perfil é idempotente e **não altera senhas existentes**. Não existe senha padrão nem autoinscrição. Contas novas são cadastradas pelo profissional e ativadas com código de uso único. Recuperação assistida exige reautenticação profissional, emite novo código e revoga sessões. Entrega automática por e-mail/SMS não foi integrada.

## Contrato implementado

| Método/rota | Permissão | Resposta |
| --- | --- | --- |
| POST `/api/v1/auth/login` | Pública; limite por IP e conta | `{accessToken,expiresAt,user}` |
| GET `/api/v1/auth/me` | Sessão | `{id,email,displayName,role,organizationId}` |
| POST `/api/v1/auth/logout` | Sessão | 204; revogação imediata |
| GET `/api/v1/organization` | Sessão | `{id,name}` da própria clínica |
| GET `/api/v1/dashboard` | ADMIN/PROFESSIONAL | Contagens persistidas do escopo autorizado |
| GET `/api/v1/patients` | ADMIN/PROFESSIONAL | Array de pacientes autorizados |
| GET `/api/v1/patients/{id}` | Organização + vínculo ou próprio paciente | `{id,displayName,modality,organizationId}` |
| GET `/api/v1/patients/me` | PATIENT | Próprio paciente |
| GET `/api/v1/system/modules` | Sessão | Fase, estado real e motivo de cada módulo |

Login recebe `{email,password}`. Todos os demais endpoints recebem `Authorization: Bearer <token>`. Sessões usam 256 bits aleatórios, somente SHA-256 persistido, validade de 30 minutos e revogação. Senhas usam BCrypt custo 12. Respostas de erro seguem ProblemDetail com `status`, `title`, `detail`. A API retorna 401 sem sessão e 403 sem autorização; acesso a paciente inexistente ou alheio tem a mesma resposta para limitar enumeração.

Admins acessam somente a própria clínica; profissionais precisam de vínculo explícito. Pacientes não recebem listagem de outros pacientes nem painel profissional. As constraints compostas impedem vínculos entre clínicas também no banco. Leitura de lista/perfil e criação/revogação de sessão geram auditoria sem conteúdo clínico. Triggers rejeitam UPDATE, DELETE e TRUNCATE da auditoria; ainda é necessário restringir a conta runtime no provedor (o proprietário/superusuário consegue mudar o schema).

CORS aceita apenas origens exatas em `CORS_ALLOWED_ORIGINS`, separadas por vírgula. CSRF da API é desabilitado porque a credencial é somente Bearer e não cookie; o BFF Next valida origem das ações e protege seu cookie. Não há logs de corpo, tokens ou senha. Limite em memória: 10 tentativas/conta e 40/IP em 15 minutos, até 8192 chaves; atrás de proxy verifique IP real com configuração confiável, sem aceitar X-Forwarded-For arbitrário. Antes de escalar horizontalmente, substituir por armazenamento atômico compartilhado.

Corpos de requisições mutáveis têm limite de 8 KiB no stream antes da desserialização, incluindo transferência chunked sem Content-Length; excedê-lo retorna 413. O limite do Tomcat para formulários é complementar. Uploads de fotos serão implementados em fluxo privado próprio na Fase 4.

## Testes

```powershell
.\mvnw.cmd --batch-mode --no-transfer-progress test
.\mvnw.cmd --batch-mode --no-transfer-progress verify
```

`test` roda testes unitários. `verify` também roda `FoundationIT` em PostgreSQL real via Testcontainers, exigindo Docker. Alternativamente, defina `TEST_DATABASE_URL` (JDBC), `TEST_DATABASE_USER` e `TEST_DATABASE_PASSWORD` para banco exclusivo de testes. Cada execução usa schema UUID isolado e remove esse schema ao terminar. Nunca aponte testes para banco com dados reais. Verificam migrações, isolamento entre duas clínicas, dois profissionais e dois pacientes, vínculo ausente na própria clínica, revogação/expiração, hash de sessão, erros, CORS, OpenAPI e imutabilidade da auditoria.

## Operação

Pool inicial máximo de quatro conexões; container sem root e JRE 21 com heap proporcional à memória. Medir startup/RSS/latência na instância Railway antes de escolher limite. Saúde não prova restauração; runbooks e checklist de publicação estão na documentação principal. Retenção, entrega automática de recuperação por e-mail/SMS, rotatividade de credenciais, sessão/inventário administrativo e purga programada de sessões expiradas ainda requerem a fase operacional. O schema usa somente dados sintéticos e evita coleta de CPF/endereço sem necessidade institucional definida.


## Estado após padronização e retomada

Fontes Java estão em com.vivamais/{config,controller,dto,model,repositories,security,service}. Nomes principais em português; aliases JsonProperty preservam os campos JSON consumidos por versões existentes. Tabelas/colunas e V1–V4 preservadas; V5 habilita RLS nas 26 tabelas do sistema e revoga acesso direto dos clientes. O histórico técnico do Flyway fica fora do ALTER para não bloquear o próprio migrador. A autorização da API proprietária continua obrigatória por recurso.

verify desta retomada: 5 unitários + 18 integrações PostgreSQL reais, sem falhas/erros/skips, incluindo Tesseract real, arquivos cifrados e acesso cruzado. SQLCipher/notificações/distribuição mobile e fornecedores remotos exigem ensaios próprios. FILES_DIRECTORY precisa apontar para objetos e chave preservados. Não substituir essa chave por outra vazia após a movimentação de pastas.

## Estado verificado em 19–20/10/2026

Guia de execução Windows e roteiros completos em ../../docs/GUIA_COMPLETO_EXECUCAO_LOCAL_WINDOWS.md. Java21.0.10/Maven3.9.11/PostgreSQL17.9:5unitários+21integrações passaram sem skips. GET de perfil funcional ou pulseira ainda não cadastrados retorna204 (em vez de200vazio); quando presente permanece200, com mesma autorização. V1–V6 preservadas. Dados demográficos opcionais da V6 são exclusivamente fictícios. OCR/fotos privadas já implementados; não interpretar as descrições históricas da fundação como estado atual.
