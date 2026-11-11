# Viva+ — homologação em nuvem validada em 04/11/2026

## Acesso disponível

| Interface | Endereço | Estado |
|---|---|---|
| Portal profissional Next.js | https://vivamais-portal-viva-mais3.vercel.app | Vercel staging READY |
| Paciente Expo Web, Safari/Android/navegador | https://viva-api-paciente-homologacao.up.railway.app/convite | Railway SUCCESS, acesso por convite |
| API e PostgreSQL | https://viva-api-paciente-homologacao.up.railway.app/actuator/health/readiness | HTTP200, UP |

O computador pode ser desligado após obter o acesso privado. O paciente exige convite individual; não usa CPF/nascimento como login público nem depende de SMS. A versão Safari é web, não aplicativo iOS nativo.

Acesso do titular: .local/nuvem/ACESSO_PRIVADO.txt e QR .local/nuvem/CONVITE_IPHONE.svg, ambos ignorados pelo Git e sem conteúdo incluído neste relatório. O agente não consumiu o convite do titular. O usuário informou que testará o iPhone físico depois. [Guia de acesso e distribuição](../../GUIA_TESTES_NUVEM.md).

## Versão, recursos e correções

Branch codex/homologacao-nuvem-20261104 publicada com autorização. Commits87d971d (419arquivos recentes preservados),22b5402 (raiz Expo e diagnóstico sem segredos),cd1c24d (download pela autorização central). API e portal estão fixados em cd1c24d8d590421a59edd37e47f154f30c106af3. A revisão de documentação/testes posterior não muda esse código em execução. Não houve merge, force push, alteração de main/PR#1 ou implantação clínica/produção.

- Railway VivaMais Demo, ambiente homologacao, serviço viva-api-paciente. Deploy final0e29a8fb-9cdd-4cac-a2f4-1065c6b2f466: SUCCESS. Java21.0.13, Spring Boot4.1.2, Maven e imagem Linux real com ExpoWeb/Tesseract; porta8080, uma réplica,1CPU/1GB, sleep, pool JDBC4. Origem única para paciente/API evita cookies entre domínios diferentes. Comando normal /app/entrada-nuvem.sh, sem diagnóstico temporário ou alterações pendentes.
- Supabase VivaMais Homologacao, liyvgcjawrzyhugixlli, sa-east-1, FreeUS0/mês aprovado, PostgreSQL17.11. Role viva_api sem superuser/createdb/createrole/bypassrls. Schema viva separado de public/DataAPI, sem USAGE anon/authenticated. Conexão JDBC direta IPv6 com CA e hostname verificados; nenhuma verificação TLS desativada.
- Vercel vivamais-portal, projeto prj_YiaqaknMlBz2yQg0Z5QggfJE0yuK, Node24, rootweb/workspaces, região gru1, Hobby. Deploy final dpl_4oHeis5hQN4qRiSchhdeZrefpk2P: READY, target staging. O primeiro pedido com target omitido foi classificado como production pelo provedor e cancelado durante preparação; os pedidos seguintes usaram staging explícito. Nenhuma promoção.
- A chave do Storage foi corrigida pelo titular diretamente no cofre. Foram diagnosticados chave Publishable e depois caracteres incompatíveis com o cabeçalho HTTP, sem ler/exibir o segredo. Upload/download reais confirmam a configuração final. Nenhuma chave foi enviada ao frontend ou versionada.
- A raiz / do Expo retornava404 somente no Boot real; controller específico corrigiu a precedência do handler padrão. O teste agora inclui o handler concorrente.
- O download antigo exigia conta enabled e recusava testadores. Passou a usar a política central de sessão e escopo do paciente; convite revogado/expirado continua bloqueado e o profissional vinculado permanece autorizado. Não habilita login por senha do paciente.

## Banco e segurança

FlywayV1–V14 aplicado e revalidado sem editar migrações existentes.37tabelas,36clínicas com RLS;76índices válidos e173restrições validadas. Sem dados reais. Após o bootstrap inicial, perfil e senha de bootstrap foram esvaziados; somente nuvem está ativo e as credenciais existentes permaneceram.

Aplicada a migração operacional Supabase endurecer_search_path_gatilhos_viva, reproduzida em infra/supabase/endurecer-gatilhos.sql: fixa pg_catalog nas duas funções de imutabilidade. Corpos/hashes, proprietário e SECURITY INVOKER preservados. Advisors finais sem WARN/ERROR;36INFO sobre RLS sem políticas são esperados para tabelas privadas sem acesso direto. Não foram criadas políticas públicas para silenciar o scanner.

Bucket viva-grupo-privado permanece privado,3MiB/octet-stream; backend aceita PNG/JPEG até2MB e dimensões limitadas, remove metadados e cifra com AES-256-GCM. Links do backend duram60segundos e dependem da sessão/escopo. Nenhuma foto existente foi excluída. Exclusão/retencão institucional e ensaios destrutivos no provedor permanecem fora deste aceite.

## Testes executados

| Verificação | Resultado e evidência |
|---|---|
| Compilação Java21 +13unitários selecionados | Zero falhas/erros/ignorados |
|5integrações de convites/arquivos com PostgreSQL17.11 real | Aprovadas em schema isolado; removido após teste, viva preservado |
|23checagens autenticadas na API HTTPS | Cadastro, convites/uso único/renovação/revogação, isolamento de clínica/paciente, pressão idempotente, agenda/doses sem duplicidade, upload/refeição/download e autorização negativa; [JSON](api.json) |
|Portal/paciente em Chromium real | Login profissional, cadastro por formulário, convite emitido na UI, paciente390px, dose e consulta no portal1440px, cookie seguro, fragmento removido e reabertura; [JSON](interface-autenticada.json) |
|Offline e calendário na nuvem | Fila, volta da rede/sincronização real, reabertura, calendário, consulta, exportação e revogação; [JSON](offline-e-revogacao.json) |
|Demais módulos API | Atividade/diário persistidos, perfil/atividade isolados, consulta do paciente sem notas internas, edição do plano preservando doses anteriores e nova agenda futura; [JSON](modulos-api.json) |
|OCR Linux | Tesseract executou; amostra retornou UNREADABLE com confirmação obrigatória, sem salvar medição automaticamente. IA alimentar externa corretamente UNAVAILABLE/providerCalledfalse |
|Segurança pública | HTTP redireciona301/308 paraHTTPS; CORS forjado403; login demonstrativo por CPF/nascimento403; configurações401;1.447.264bytes de JS inspecionados sem chave Storage ou segredos privados conhecidos; [JSON](seguranca-publica.json) |
|Páginas públicas |3paciente/3portal, CSP correta/nonce, API anônima401; sem erro JavaScript ou overflow390px no portal; [JSON](portal-publico.json) |
|Builds reais | Imagem Linux Maven/Expo, exportação Web e Next em nuvem aprovados. Exports Hermes Android/iOS/web anteriores conferidos nos manifests, sem desativar bibliotecas nativas |
|Segredos/Git | Gitleaks integral aprovado; diff --check; originais/stage preservados. A escrita GitHub MCP recusou403; envios exatos feitos pelo titular via script conferido |

Os116Java/45portal/72app/17E2E anteriores são históricos; não foram contados como nova execução remota nesta entrega. Nenhuma captura é protótipo ou mock de persistência. Os testes remotos estão reproduzidos em tests/nuvem e no guia de testes.

## Backup e recuperação

Backup remoto pg_dump17.11, snapshot de04/11 às21:58:35:126.801bytes, SHA2563BEB7C4200544BD302E5C2245150C9D706EE714C0352DC07721602F8A9106FED. Dump/SQL/chaves estão fora do Git. Arquivo extraído integralmente com pg_restore. Restaurado em transação num schema temporário privado:37tabelas,241registros comparados ao COPY do snapshot,36RLS, sem referências cruzadas com viva. Schema removido depois;14migrações do aplicativo preservadas. [Evidência](backup-restauracao.json).

O arquivo de foto incluído nesse snapshot foi exportado pelo download autenticado, conferido por tamanho/SHA, cifrado novamente no formato compatível e recuperado pelo próprio ArmazenamentoArquivos Java. Nenhuma chave acompanha os objetos. A URL pública do objeto conhecido foi recusada. A restauração de bytes foi local; não substituiu objetos no bucket. O snapshot é pontual e não inclui registros criados depois.

No Free, manter exportações próprias: [documentação oficial Supabase](https://supabase.com/docs/guides/platform/backups). Guardar dump, objetos cifrados e chaves separadamente, com acesso restrito. Para uma recuperação real, criar destino isolado autorizado, restaurar com pg_restore, aplicar as configurações operacionais após Flyway e conferir metadados/hashes antes de apontar a API. Não restaurar sobre a homologação ativa. Este ensaio não é cron/PITR/backup off-site automático.

## Custos e pendências

Supabase FreeUS0/mês aprovado e Vercel Hobby; Railway utiliza o plano/saldo da conta, sem upgrade contratado. Não foi informado saldo exato pelo conector; verificar consumo no painel. Recursos mantidos limitados e sem serviço duplicado. Free/sleep podem causar pausa/primeiro acesso mais lento. Nenhum pagamento ou plano novo foi autorizado/executado.

Pendências: confirmação física do Safari pelo titular (adiada por ele), câmera/HEIC/notificações/armazenamento nativo, APK com endereço HTTPS e builds/contas EAS/Apple/IPA/TestFlight/lojas. O APK LAN antigo foi preservado e não deve ser apresentado como versão da nuvem. Sem liberação clínica, SMS real, IA alimentar externa ou hardware real de pulseira.

Acesso e funcionalidades acadêmicas estão disponíveis; isso não é conclusão de produção nem aceite de todos os cenários em aparelho físico.
