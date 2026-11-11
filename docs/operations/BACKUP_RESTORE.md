# Backup e restauração

## V13/V14 — 04/11/2026

Novas migrações de dosagem/convites foram ensaiadas apenas no banco de testes. Antes de aplicá-las ao banco principal ou liberar homologação, fazer backup e restauração isolada, preservando banco/objetos/chaves. O último ensaio de restauração V12 é histórico; não prova restauração V14. Nenhum dado do banco principal foi apagado/migrado nesta retomada. Ver [relatório atual](../evidencias/MEDICAMENTOS_CONVITES_EXPO_2026-11-04.md).


## Resultado vigente — V12, 03/11/2026

[Ensaio V12 aprovado](../evidencias/finalizacao-2026-11-03/backup-restauracao-v12.json) em banco exclusivo. Conferidos12migrações/checksums, contagens,34tabelas de aplicação com RLS, envelope AES-256-GCM/autenticidade, objetos/chaves, login profissional, isolamento e fotografia recuperada. Banco/arquivos/chaves originais preservados; credenciais de pacientes revogadas somente no clone. Não representa backup gerenciado Supabase nem ensaio produtivo. Artefatos privados continuam fora do Git.

`infra/ensaiar-backup-local.ps1 -ArquivoEvidencia docs/evidencias/finalizacao-2026-11-03/backup-restauracao-v12.json` foi o procedimento usado. Exige8080/8082 livres e PostgreSQL ativo; não interromper serviços ou repetir restauração sem necessidade. As seções abaixo são registros históricos.

**V9 aplicada:** novos metadados de SMS e telefone preservam cadastros e aparelhos; códigos manuais anteriores foram invalidados. Snapshot cifrado anterior à V9 e comparação de dados foram executados, conforme ../evidencias/cadastro-sms-interface/migracao-v9.json. O ensaio de restauração V8 abaixo continua histórico, não comprova por si só fornecedor ou restauração V9. Caixa sms-teste/chave/consulta privada não fazem parte do backup clínico. Em clone, manter SMS DESABILITADO e revogar credenciais/códigos antes de disponibilizar a API.

## Atualização de autenticação — V8

Ensaio real atualizado em 20/10/2026: [evidência V8](../evidencias/acesso-paciente/backup-restauracao-v8.json). O backup cifrado inclui também `.patient-auth-key` quando usada localmente; o segredo de ambiente precisa de guarda privada própria. Não publicar chaves/valores. `infra/ensaiar-backup-local.ps1 -ArquivoEvidencia docs/evidencias/acesso-paciente/backup-restauracao-v8.json` preserva o registro V7 anterior. API 8080 deve estar encerrada; PostgreSQL precisa permanecer em um processo ativo.

Antes de iniciar a API contra um clone, revogar sessões, aparelhos, códigos, desafios e concessões de arquivos. Isso ocorre somente no banco restaurado, nunca no original. O ensaio confirmou V1–V8, 32 tabelas/31 RLS, chaves/objetos, login profissional, isolamento e foto antiga; credenciais de pacientes no clone revogadas. Envelope AES-GCM e chave separada, conforme procedimento abaixo. Ver [regras de acesso e migração](../ACESSO_PACIENTE_SEM_SENHA.md).

## Procedimento e evidências anteriores

Supabase Free não inclui backup automático gerenciado. Antes de uma demo persistente, executar pg_dump criptografado para local privado fora do repositório; manter chave separada e retenção institucional definida. Somente dados sintéticos nesta etapa. Não copiar dump para outputs públicos ou Git.

Exemplo com cliente PostgreSQL 17, PGPASSFILE privado e variáveis de conexão no shell (sem senha na linha de comando):

```powershell
pg_dump --format=custom --no-owner --no-acl --file=<diretorio-privado>/viva.dump
# Criar banco isolado vazio previamente, com autorização local.
pg_restore --exit-on-error --no-owner --no-acl --dbname=viva_restore <diretorio-privado>/viva.dump
```

Para Compose local: `docker compose exec -T postgres pg_dump -U vivamais -d vivamais -Fc` pode ser transmitido como bytes por um script próprio, sem redirecionamento textual no Windows PowerShell 5 que pode corromper o arquivo binário. Preferir pg_dump no host ou `docker compose exec postgres pg_dump -U vivamais -d vivamais -Fc -f /tmp/viva.dump` seguido de `docker compose cp postgres:/tmp/viva.dump <diretorio-privado>/viva.dump`.

Verificação obrigatória antes de declarar restauração validada: Flyway history íntegro, contagem de organizações/pacientes/vínculos, login com nova sessão, permissões cruzadas negadas, auditoria presente. Invalidar sessões restauradas, pois backup inclui hashes de tokens antigos. Reiniciar API contra banco restaurado isolado; nunca apontar ensaio para produção. Registrar duração, tamanho, hash do dump e resultado, sem dados identificáveis. Teste real de backup/restore desta máquina só é declarado em STATUS quando executado.

## Ensaio real de restauração — 17/10/2026

O dump sintético feito na execução anterior foi restaurado em banco isolado viva_restore_20261017, sem sobrescrever vivamais. Cliente pg_dump/pg_restore 17.11 e servidor 17.9. Arquivo de 85755 bytes, SHA256 06cd694f666b432ecd99138b91fc63581797198a1879e18e018e5fef7445c7f2; dump, cópia AES-GCM e chave estão em work privado, fora deste repositório. A cópia cifrada foi decifrada e comparada byte a byte antes desta retomada.

Na cópia foram revogadas 13 sessões e excluídos 6 códigos de ativação/2 grants temporários. Contagem anterior à retomada: 4 migrations, 10 pacientes e 4 metadados de objetos. Nesta retomada a API isolada em 8082 validou V1–V4 e aplicou V5 sem erro; login novo e consultas autorizadas passaram. infra/verificar-restauracao.mjs confirmou que uma foto cifrada antiga foi decifrada (14826 bytes) com a chave preservada e que outra clínica recebeu 403. A API auxiliar foi encerrada após o teste.

Para repetir, restaure também os objetos cifrados e disponibilize a chave correspondente; o dump SQL sozinho não contém os bytes das fotos nem a chave local. Execute a API isolada com FILES_DIRECTORY correto, RESTORE_API_BASE_URL e E2E_PASSWORD no ambiente privado e rode o script. Ele encerra as sessões que cria e não imprime senhas/tokens. Não aponte o ensaio ao banco original ou de produção. Ensaio Supabase/Docker continua pendente.


## Ensaio completo V1–V7 — 20/10/2026

Executado infra/ensaiar-backup-local.ps1 com API/portal/app encerrados pelo controlador e PostgreSQL existente ativo. Resultado em [evidência](../evidencias/backup-restauracao-2026-10-20.json): sete migrações/checksums, contagens das 28 tabelas e 27 tabelas protegidas por RLS idênticas no banco isolado. Sessões/códigos/grants da cópia foram invalidados, login novo passou, outra clínica recebeu403 e foto antiga de14826bytes foi decifrada com a chave recuperada. API auxiliar loopback8082 encerrada ao final. O banco principal permaneceu com o mesmo snapshot de contagens/migrações/RLS.

Backup de4.044.028bytes/52objetos cifrados no horário do ensaio, incluindo o dump e a chave dos objetos dentro de envelope AES-256-GCM. Chave do envelope em diretório privado separado. Decifração/integridade de cada objeto e hash do dump conferidos; adulteração de um byte foi recusada. ACL Windows dos diretórios de backup/chave recriada somente para o usuário atual. Nada privado foi escrito no repositório. Dumps transitórios do ensaio bem-sucedido removidos por caminho literal; banco e arquivos restaurados mantidos privadamente para inspeção, sem sobrescrever o original. Esse ensaio não valida backup gerenciado/Supabase.

Reproduzir na raiz, com PowerShell7 e clientes17.11 existentes em work/pg-client:

```powershell
.\infra\encerrar-local.ps1
# Aguarde a confirmação do controlador. Mantenha PostgreSQL ativo.
.\infra\ensaiar-backup-local.ps1
.\Iniciar-VivaMais.cmd
```

O script exige8080/8082 livres, cria um nome exclusivo, não apaga banco existente, guarda segredos só no ambiente e limpa variáveis ao sair. Usa a credencial PostgreSQL privada da execução local; senha do aplicativo só no teste de login. A retenção/cópia externa segura das chaves ainda depende de definição institucional. Uma chave perdida impede recuperar os respectivos objetos. Não enviar work/backups nem work/chaves-backup a outputs/Git.
