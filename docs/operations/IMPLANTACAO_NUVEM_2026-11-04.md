# Implantação Viva+ na nuvem — 04/11/2026

## Situação real

**Estado posterior à conexão:** os três provedores foram acessados e os projetos foram criados. Railway: projeto `9f610473-260c-4e5b-b46c-0e7683b94949`, ambiente `6d52e211-43a8-4bf8-9e9b-fa725f05da35`, serviço `14495112-b312-4e59-a3b5-26d27f85631e`; domínio reservado `https://viva-api-paciente-homologacao.up.railway.app`, sem deploy. Supabase: `liyvgcjawrzyhugixlli`, FreeUS0/mês autorizado, SãoPaulo/PG17.11; role/schema privados e bucket criados, sem tabelas clínicas/Flyway. Vercel: `prj_YiaqaknMlBz2yQg0Z5QggfJE0yuK`, Node24/Hobby; domínio reservado `https://vivamais-portal.vercel.app`, sem deploy. Não tratar endereços reservados como aplicação funcional. SUPABASE_SECRET_KEY confirmada pela lista de nomes no serviço e ambiente correto, sem leitura do valor. Aguardando publicação autorizada da fonte atual e primeiro deploy.

Railway não aceita mais Config as Code em serviços novos: parâmetros do Docker foram aplicados diretamente pela integração, sem apontar `infra/railway-nuvem.toml`. A [documentação atual de IaC](https://docs.railway.com/infrastructure-as-code) confirma a descontinuação; TOMLs históricos preservados como referência. Serviço usa1réplica/1GB/1CPU, sleep e IPv6 de saída. `DATABASE_URL` aponta ao host direto, `currentSchema=viva` e verificação TLS completa; conta JDBC é `viva_api`, sem superuser/createdb/createrole/bypassrls. Esta conta é proprietária apenas do schema privado criado, separado de public/DataAPI. Nenhuma migration clínica foi alterada.

A API agora aceita `SUPABASE_SECRET_KEY` moderna (preferida), somente no cabeçalho apikey; mantém `SUPABASE_SERVICE_ROLE_KEY` legada como alternativa. A chave secreta não é disponibilizada pelo conector Supabase; titular copiou diretamente para a Railway; presença confirmada sem exibir valor. Uso efetivo será validado no deploy. Segredos de banco/cifra/bootstrap foram gerados e armazenados fora do Git. O certificado público foi obtido do endpoint de distribuição Supabase, validade2031 e SHA256 `807025AD50D4ED219D2C9C7D299C004F824EB00CF7F65AFEF607D07B72E6CAFA`; ainda falta verificar a cadeia do servidor na conexão JDBC real.12Java selecionados (incluindo2novos Storage) e3infra passaram nesta continuação.

O erro404 do consentimento Vercel não exigiu nova conexão: a integração padrão conseguiu criar/atualizar o projeto, enquanto teamId explícito falhou. Usar operações do projeto pela conexão padrão; não repetir links de consentimento expirados/inválidos. O primeiro pedido de Build Machines foi rejeitado por não pertencer ao Hobby; retirado, usando os recursos padrão do plano, sem upgrade.

Retomada: pedido integral em product/PEDIDO_RETOMADA_IMPLANTACAO_NUVEM_2026-11-04.md. Titular agora está em casa e permite comandos PowerShell se indispensáveis, mantendo preferência pelas integrações. Nenhuma aplicação está implantada; Flyway, autenticação e Storage remotos ainda pendentes.

Os parágrafos seguintes são históricos, anteriores à criação dos recursos.

**Atualização posterior à preparação:** o titular confirmou a criação das três contas usando GitHub. Não é necessário repetir os cadastros. A consulta atual às integrações ainda indica as três como não instaladas; foi solicitada instalação/conexão pelo diretório de integrações na mesma conta desta conversa. Aguardando a autenticação para acessar os provedores. O parágrafo seguinte registra o estado inicial desta execução, antes da confirmação de cadastro.

O proprietário solicitou começar a execução em nuvem hoje e informou que ainda não possui contas Railway, Supabase e Vercel. A implantação está autorizada no escopo acadêmico; pagamentos e publicação de código em Git continuam exigindo autorização específica. Não há conta conectada, recurso criado, banco remoto, domínio implantado ou login remoto validado nesta execução. As integrações foram localizadas e sugeridas; isso não equivale a acesso concedido.

O proprietário está apenas com iPhone: não solicitar PowerShell, reinício do Windows, logs ou variáveis locais. A intervenção necessária é criar as contas pelo navegador e autorizar as conexões. Cadastros/termos/OAuth devem ser feitos pelo titular. Nunca pedir senha/token no chat.

## Implementação entregue

- Railway: nova imagem `infra/Dockerfile.nuvem`, com exportação Expo Web real e a API Java21/Spring Boot no mesmo processo/origem. Mantidos o Dockerfile anterior e a arquitetura de diretórios.
- Supabase: PostgreSQL real por JDBC/TLS com validação de certificado e hostname; bucket privado para objetos cifrados. Nada de banco ou arquivos persistidos no disco efêmero da Railway.
- Vercel: portal Next.js independente, configuração em `web/vercel.json`, workspace pnpm10.28.2 preservado. O BFF continua consultando a API real.
- Safari: Expo usa a origem HTTPS efetiva para a API. O cookie de renovação permanece Secure/HttpOnly/SameSite=Strict, sem depender de cookies entre domínios diferentes. O portal passa a oferecer também o link `https://ORIGEM/convite#SEGREDO`, somente após emitir um convite individual. O fragmento é removido pela tela existente e não é enviado no endereço HTTP ao servidor.
- Static assets/páginas têm cadeia própria de segurança: scripts somente da própria origem, sem eval, sem referência externa e sem cache. Estilos inline são necessários ao React Native Web e ficam limitados às páginas/recursos Expo. A API mantém CSP `default-src 'none'`, autenticação e autorizações; o portal mantém CSP com nonce.
- Homologação `APP_ENV=preview` agora aceita exclusivamente dados sintéticos. Antes, a validação geral da API recusava esse ambiente apesar da configuração de convites já prevê-lo. Produção continua bloqueada.
- `application-nuvem.yml` aceita cabeçalhos de transporte somente de pares CGNAT100.64/10; X-Real-IP e X-Forwarded-Proto correspondem aos cabeçalhos documentados da Railway. Não usar confiança universal. Confirmar comportamento real da borda no primeiro ensaio; qualquer origem de proxy diferente deve ser comprovada antes de ajustar a restrição.
- `infra/entrada-nuvem.sh` recusa configuração insegura/incompleta, autenticação demonstrativa pública, SMS/IA ativados, LAN e armazenamento local. Materializa somente o CA do banco, vindo do cofre do provedor, antes de iniciar Java. As duas chaves criptográficas precisam ser permanentes e distintas, de32bytes/Base64; nunca gerar novamente a cada deploy.
- `.dockerignore` e `.railwayignore` permitem somente o contexto necessário. Não enviar `.local`, banco local, APK, senhas, chaves de assinatura, anexos ou referências ZIP.

## Configuração a executar pelo agente após conexão

1. Confirmar acesso real aos três provedores e planos disponíveis. Antes de ativar cobrança, apresentar custo/limite concreto e obter autorização. Manter uma réplica, pool JDBC4, sem banco adicional na Railway ou serviços duplicados.
2. Criar projeto Supabase NOVO exclusivo de homologação sintética, sem transferir o banco clínico/local. Configurar bucket `viva-grupo-privado` com `public=false`, MIME `application/octet-stream`, limite3MiB (a cifra acrescenta bytes). Não criar políticas de leitura/gravação direta para anon/authenticated. Verificar a privacidade com requisições anônimas reais.
3. Obter conexão Session pooler5432 (IPv4), senha privada e certificado CA do próprio projeto. Usar `sslmode=verify-full&sslrootcert=/app/.local/certificados/postgres.crt`, nunca transação6543 ou verificação de certificado desativada. CA em `DATABASE_CA_CERT_BASE64`; outras variáveis em `infra/nuvem.env.example`, salvas exclusivamente no cofre da API.
4. Railway: raiz `/`, arquivo de configuração `/infra/railway-nuvem.toml`, imagem `infra/Dockerfile.nuvem`, `PORT=8080`, HTTPS público gerado pelo provedor. Não configurar TCP proxy/banco público, domínio pago, perfil prod/production ou parâmetros amplos de proxy. A porta8083 pertence ao conector local antigo e não deve ser usada aqui. Readiness inclui o banco.
5. Primeiro bootstrap somente no banco novo, com senha aleatória privada e perfil `bootstrap` explícito. O runner existente não sobrescreve credenciais. Confirmar unidade/profissionais, preservar `TESTER_ORGANIZATION_ID`, retirar perfil/senha de bootstrap e reiniciar antes dos ensaios. V1–V14 são aplicadas pelo Flyway sem editar migrações existentes. Não copiar credenciais locais para a nuvem.
6. Vercel: Root Directory `web`, incluir arquivos de fora da raiz para os workspaces, Node24, `ENABLE_EXPERIMENTAL_COREPACK=1`. Configurar `APP_ENV=preview`, `API_BASE_URL` e `NEXT_PUBLIC_APLICATIVO_URL` com a origem real Railway; `APP_ORIGIN` com o endereço HTTPS estável do portal. Não definir credenciais de banco/Storage como NEXT_PUBLIC/EXPO_PUBLIC. Atualizar origens CORS exatas após conhecer os dois endereços.
7. Implantar a fonte ATUAL revisada: há alterações locais ainda não commitadas desde0c564c5. Não publicar silenciosamente a main antiga e afirmar que contém medicamentos/convites novos. Preparar snapshot permitido, revisar segredos e usar upload de fonte do provedor quando suportado; se exigir commit/push, solicitar autorização para o conjunto concreto. Não fazer merge do PR como atalho.
8. Executar `infra/verificar-implantacao-nuvem.mjs` com os dois endereços reais. O script faz apenas consultas anônimas, verifica readiness, rotas SPA, CSP e negação de API anônima; sua aprovação NÃO valida autenticação, persistência ou Storage.
9. Ensaio autenticado real: login profissional, cadastro fictício individual, convite, Safari390px, reabertura/renovação de cookie, pressão/medicamento/autorrelato, consulta do mesmo registro no portal, foto privada/cifra e autorização cruzada negada. Revogar convite e confirmar negação. Reiniciar/reimplantar e verificar persistência; backup/restauração remoto em ambiente isolado. Registrar evidências sanitizadas, sem link/segredo de convite em screenshot público.
10. Entregar endereços e convite privadamente ao proprietário. O Android0.2.0 existente continua apontando para LAN; precisa de outro build para a URL HTTPS real. Teste via Safari não é IPA/TestFlight. EAS/Apple continuam pendentes já conhecidos.

## Validações novas desta execução

| Verificação | Resultado |
|---|---|
| Compilação Java21 das fontes e testes;10 testes selecionados de ambiente, convites, páginas/CSP/recursos e proxy real Tomcat | Aprovados; zero falhas/erros/ignorados. Log privado `work/nuvem-java.log` |
|16 testes app/configuração/transporte/portal remoto | Aprovados |
|1 teste de componente do portal, incluindo link HTTPS e ausência de segredo na query | Aprovado |
|TypeScript app/web e lint dos arquivos TS modificados | Aprovados também na conferência final |
|Next build em preview com URLs reservadas de teste | Aprovado; não é deploy nem endereço funcional. Build local recompilado depois com os endereços locais para preservar o ambiente |
|Expo Web em modo preview/convites/mesma origem | Aprovado. Exportação real em `.local/export-nuvem`; inventário/SHA em `.local/execucao/export-nuvem.json` |
|Empacotamento Java com a exportação Expo real | Aprovado:95recursos do JAR conferidos um a um contra SHA-256 do export;84.164.398bytes, SHA256 `85E7F7F5371921D321B86804BB2E8D6CCC635FC96158FAF9B27DCDE7033A2DBA`. Artefato privado em `work/nuvem-api-build/viva-mais-api-0.1.0-SNAPSHOT.jar`, sem iniciar API ou publicar |
|Regra de upload de fonte Railway |1teste aprovado: fontes necessárias incluídas, arquivos privados/bancos/APKs/referências excluídos |
|Gitleaks |526fontes/configurações/documentos inspecionados; nenhum vazamento. Snapshot/relatório privado em `work/nuvem-segredos-20261104` e `work/nuvem-gitleaks.json` |
|Imagem Docker Linux completa / shell de entrada no contêiner | Pendente. Docker não está disponível; Git Bash não iniciou por restrição MSYS do Windows. Não solicitado comando manual |
|Migrations/banco/Storage/renovação Safari públicos | Pendentes de contas, conexão e implantação reais |

Os116Java/PostgreSQL anteriores continuam sendo evidência histórica; não foram reexecutados nesta etapa. O PostgreSQL local continua indisponível por restrição de socket, sem alteração do cluster/HBA. Nenhum mock substituiu persistência ou funcionalidade real. Nenhum commit, push, merge, publicação, pagamento ou alteração no banco local nesta etapa.

## Fontes oficiais consultadas

- [Expo: publicação em hospedagem de terceiros](https://docs.expo.dev/guides/publishing-websites/) — exportação `single` exige fallback das rotas para o índice.
- [Railway: monorepos](https://railway.com/guides/deploying-a-monorepo) e [rede pública/cabeçalhos TLS](https://docs.railway.com/networking/public-networking/specs-and-limits).
- [Supabase: conexão PostgreSQL](https://supabase.com/docs/guides/database/connecting-to-postgres) e [SSL e verificação do CA](https://supabase.com/docs/guides/platform/ssl-enforcement).
- [Vercel: configuração de build/Corepack](https://vercel.com/docs/builds/configure-a-build).

Próxima tarefa: receber as conexões das contas já criadas pelo titular, redescobrir as ferramentas disponíveis, confirmar os limites do plano e criar os recursos reais, sem pedir operação no Windows. Este documento não autoriza custos ou publicação de fonte adicional.
