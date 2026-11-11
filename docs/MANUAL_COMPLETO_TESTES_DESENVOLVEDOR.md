# Manual completo de testes para desenvolvedores

**Homologação04/11:** paciente remoto usa convite privado individual, não CPF/nascimento nem SMS. Fluxo seguro local anterior preservado. [Guia/testes de nuvem](GUIA_TESTES_NUVEM.md) · [Resultados reais](evidencias/nuvem-2026-11-04/README.md).

## Ensaios específicos da versão0.2.0 — 04/11/2026

Preservar116Java/45portal/72app aprovados. Últimos ajustes têm19testes seletivos app,4BFF,2infra e3E2E de acesso/interface aprovados, além de TypeScript/lint e exports Hermes. Novo ensaio completo está em tests/grupo/medicamentos-demonstracao.spec.ts, configuração playwright.grupo.config.ts, contra servidores já iniciados; não foi executado com PostgreSQL/API indisponíveis nesta retomada. O config não inicia Next/API e não injeta respostas simuladas para provar doses. Capturas de acesso/convite são testes Chromium, não iPhone físico. [Relatório](evidencias/MEDICAMENTOS_CONVITES_EXPO_2026-11-04.md) e [roteiro dos integrantes](GUIA_TESTES_GRUPO_ANDROID_IOS.md).


## Regressão de 03/11/2026

Resultados efetivos no [relatório vigente](RELATORIO_FINALIZACAO_GERAL_VIVAMAIS.md). Não somar contagens históricas às atuais. Preservar banco principal, limites, chaves e sessões; não apagar dados/limites para obter aprovação.

Usar Node compatível e **pnpm10.28.2**: `pnpm install --frozen-lockfile`, `pnpm typecheck`, `pnpm lint`, `pnpm test`, `pnpm build:web`. Backend: `mvnw verify` com PostgreSQL **exclusivo** de testes e OCR real configurado. Não executar integração contra banco principal/pacientes. Credenciais somente via ambiente/arquivos privados, sem logar corpos de autenticação.

`AcessoDemonstracaoIT`/`ConfiguracaoAcessoDemonstracaoTest` cobrem flag/ambiente/proxy/host/unidade, sessão separada e fluxo seguro. Exportação/consultas/retificação usam PostgreSQL: período brasileiro, >20 itens, escopo/vínculo, original imutável, versão concorrente e ausência de notas internas no paciente. Frontend cobre datas inválidas/bissextos/fuso, cache por titular/TTL,143 itens e truncamento, formulários e retificação. `node --test tests/infra/preview-video.test.mjs` compara bytes de um MP4 real, MIME/ranges/416/segurança de caminho.

E2E padrão: portal3000/API8080/app seguro8081 já iniciados, `E2E_PASSWORD` privado, `FILES_DIRECTORY` de teste e `pnpm test:e2e`.17 cenários exercitados nesta revisão. Configuração reutiliza serviços fora da CI; origem/cookie continuam obrigatórios.

Aceitação específica: `pnpm exec playwright test --config playwright.demonstracao.config.ts`, com API local habilitada para unidade fictícia e bundle demonstrativo8082. Exige `E2E_PASSWORD`, sem ignorar autenticação silenciosamente. Exercita login sem SMS, leitura offline/reconexão, retificação na interface, download completo e limite do compartilhamento com paciente. Respeitar janela15min do limite profissional entre lotes; não reiniciar API para limpar contador.

Na API de teste, incluir `http://127.0.0.1:8082` nas origens CORS exatas; não adicionar wildcard. Diretório de downloads do Chromium fica em `.local/transferencias-demonstracao`, evitando cancelamento por diretório temporário indisponível. Última rodada verde:3cenários. Repetição posterior:2passaram,1não executou o fluxo do portal por conexão recusada em3000; não remover asserções para transformar indisponibilidade em aprovação.

Regressão da instalação manual: `ConfiguracaoRedeDemonstracaoTest` e métodos específicos de `AcessoDemonstracaoIT`/`AcessoPacienteIT` verificam IPv4/opt-in/ambiente, filtro, aparelho/host/porta/proxy, login nativo, download de bytes de uma **fixture de teste**, headers e indisponibilidade sem opt-in. A fixture não é apresentada como APK instalável; os dois APKs reais foram produzidos pelo Gradle e verificados separadamente. Nesta continuação:41Java distintos em seleções; última seleção13aprovados. Não somar as repetições à rodada integral anterior de94.

Ensaio físico manual: seguir [guia Samsung/rede](GUIA_PUBLICACAO_PLAY_STORE_APP_STORE.md#instalar-manualmente-no-samsung-sem-adb). Confirmar saúde, download do APK real, instalação, login com conta fictícia e APIs reais antes de marcar aceite. Download/instalação/teste geral no Samsung confirmados pelo proprietário; os ensaios nativos específicos ainda dependem de confirmação; conexão no PC não comprova que o Wi-Fi alcança o serviço. Não alterar firewall/roteador globalmente sem autorização.

`pnpm audit --audit-level high` é o gate; registrar o relatório JSON separadamente. OWASP12.2.2 mantém `failOnError=true` e CVSS7. Restrição H2/CPE da sandbox exige execução normal autorizada, sem suppressions. Relatório aprovado03/11:42 dependências sem alertas; OSS Index sem credenciais não analisado.

Ensaios físicos restantes: instalação/início, câmera/fotos autorizadas, vídeo, fontes, SecureStore/SQLCipher, reabertura/expiração/saída, processo morto com fila pendente, notificações, modo avião/reconexão. Export Hermes/screenshot web/assinatura não comprovam esses ensaios. IPA/TestFlight dependem de contas/assinatura Apple.

## Procedimentos históricos

Este manual usa os scripts presentes no checkout. Resultados da consolidação estão no [relatório](RELATORIO_TRANSFERENCIA_E_PUBLICACAO.md); resultados anteriores ficam identificados nos respectivos relatórios. Um comando documentado não significa que todos os cenários manuais ou serviços externos foram executados.

## 1. Preparação, isolamento e segredos

Seguir o [ambiente do zero](GUIA_COMPLETO_AMBIENTE_DESENVOLVIMENTO.md), instalar com pnpm10.28.2/frozen lockfile e selecionar Java21. Usar somente dados/imagens fictícios. Testes Java suportam PostgreSQL externo ou Testcontainers com Docker; não usam H2 e não testar migrations no banco principal. E2E grava registros sintéticos e auditoria: prefira uma instância de demonstração dedicada, com bootstrap próprio e SMS LOCAL. Não apontar a uma clínica real.

Na máquina original, credenciais ficam fora do repositório; em clone novo, criar suas próprias. Não publicar E2E_PASSWORD, DATABASE_PASSWORD, headers/cookies, códigos, dumps, XML/logs brutos ou screenshots de campos sensíveis. Não ativar traces/vídeos automáticos sem revisar coleta: Playwright os mantém desligados nesta configuração.

Com pnpm instalado na versão correta, os comandos `pnpm ...` abaixo são diretos. Sem pnpm global, substituir por `npm.cmd exec --yes --package=pnpm@10.28.2 -- pnpm ...`; esse comando também fornece pnpm correto aos scripts filhos.

## 2. Java: unidades e integração PostgreSQL

Localização `backend/demo/src/test/java/com/vivamais/`; unidades terminam Test, integrações IT. Maven Surefire roda unidades; Failsafe roda IT em verify. `package -DskipTests` só compila/empacota, não valida comportamento.

| Suíte | Escopo |
| --- | --- |
| CodificadorToken/limitador/configuração | Tokens, limites profissionais, ambiente sintético |
| ValidacaoCadastroTest | CPF, DDD/celular e normalização |
| ConfiguracaoSmsTest | Provedor desabilitado/local/real e falha fechada |
| EnvioSmsTwilioTest | HTTP stub local, autenticação/referência/estados/erros; nenhum SMS real |
| InstituicaoIT | Login, sessão, organização, vínculo, acesso negativo |
| CuidadoIT | Pressão, medicamento/autorrelato, diário, atividade/semana, consultas, preferências, arquivos/OCR |
| AcessoPacienteIT | Código quatro dígitos, zero à esquerda, expiração/uso único, aparelho/rotação/revogação, limites e isolamento |
| CadastroSmsIT | Celular/CPF, troca assistida, contadores, falha/reenvio SMS, migração V8→V9 preservando legado |

Criar banco vazio exclusivo `vivamais_testes` com owner viva conforme guia; nunca reaproveitar vivamais só por ter schemas UUID. No terminal:

```powershell
$env:TEST_DATABASE_URL='jdbc:postgresql://127.0.0.1:55432/vivamais_testes'
$env:TEST_DATABASE_USER='viva'
$env:TEST_DATABASE_PASSWORD=[Net.NetworkCredential]::new('',(Read-Host 'Senha da role do banco de testes' -AsSecureString)).Password
# Tesseract nativo instalado, idioma eng disponível:
$env:TEST_NATIVE_OCR='true'
.\backend\demo\mvnw.cmd -B -ntp -f backend/demo/pom.xml verify
```

Alternativa OCR já exercitada nesta máquina: remover TEST_NATIVE_OCR e configurar `TEST_OCR_NODE_SCRIPT` para caminho absoluto `infra/ocr-worker.mjs`, `OCR_NODE_EXECUTABLE` para node e `OCR_DATA_DIRECTORY` para pasta privada com eng.traineddata.gz; `OCR_CACHE_DIRECTORY` privado. Não declarar OCR real aprovado se o teste foi ignorado.

Sem TEST_DATABASE_URL, as integrações iniciam postgres17.9-alpine via Testcontainers: requer Docker operacional. Não passar senha da instância principal por conveniência. As classes geram schemas UUID e removem seus próprios schemas ao terminar; se um processo cair, inspecionar antes de remover órfãos. Não executar DROP SCHEMA public ou Flyway clean.

Comandos focados, na raiz:

```powershell
.\backend\demo\mvnw.cmd -f backend/demo/pom.xml test
.\backend\demo\mvnw.cmd -f backend/demo/pom.xml '-Dit.test=CadastroSmsIT,AcessoPacienteIT' verify
.\backend\demo\mvnw.cmd -f backend/demo/pom.xml dependency:tree
```

`test` não executa as IT; o filtro Dit.test restringe integração, mas unidades podem continuar rodando. Relatórios Surefire/Failsafe ficam em backend/demo/target, ignorado no Git. Conferir tests/failures/errors/skipped, primeira falha e BUILD SUCCESS. Erro de conexão/Java8/Docker ausente é bloqueio do ambiente, não aprovação. Não anexar XML bruto: pode conter variáveis e saídas com dados; extrair contagem/status sem corpos. O verify novo desta consolidação usa outro banco exclusivo e mantém o principal preservado.

## 3. Frontend: unidades, componentes e contratos

```powershell
pnpm test:mobile
pnpm --filter @viva/web test
pnpm test
pnpm typecheck
pnpm lint
```

`test:mobile` usa vitest.mobile.config.ts e tests/mobile, sem aparelho/DOM nativo. `web test` usa a configuração Vitest do portal, Testing Library/jsdom. `pnpm test` executa workspace e app; não somar novamente os mesmos resultados. Typecheck inclui workspace/web e app; lint cobre app/components/contexts/hooks/services/web/packages/tests/mobile. Nenhum comando equivale a TalkBack/VoiceOver ou câmera física.

Cobertura relevante: transporte rejeita destinos inseguros/timeout/redirect; sessão expira; fila mantém UUID/dono e política de retry; lembretes calculam horários; idade/semana respeitam datas; CPF/celular validam; preferências persistidas pela UI simulada; ativação profissional não contém código e mostra serviço desabilitado honestamente. Doubles de requisição são permitidos nestes testes, e não são prova de PostgreSQL/Twilio.

Teste focado de um arquivo: `pnpm exec vitest run --config vitest.mobile.config.ts tests/mobile/cadastro.test.ts`. No portal, executar `pnpm --filter @viva/web exec vitest run components/AtivacaoPaciente.test.tsx`.

Após alterar DTO/OpenAPI, `pnpm contracts:generate`, revisar diff do snapshot e `packages/contracts/src/generated.ts`, executar tipagem dos dois clientes. `postinstall` e `pnpm shared:sync` mantêm pacotes file: sincronizados. CI compara o gerado com o versionado, mas isso sozinho não consulta o servidor: conferir também o OpenAPI real de uma API autorizada.

## 4. Builds e exports

Encerrar controladores/servidores que usam os artefatos antes de reconstruir Next ou Expo. Preservar PostgreSQL/chaves/dados:

```powershell
.\infra\encerrar-local.ps1
pnpm build:web
$env:APP_ENV='development'
$env:EXPO_PUBLIC_API_BASE_URL='http://127.0.0.1:8080'
pnpm export:mobile
pnpm exec expo export --platform all --output-dir .local/export-transferencia
```

Build Next valida páginas/rotas e compilação do portal; Expo all gera bundle web e Hermes Android/iOS. Não gera APK/AAB/IPA nem assina ou publica. Next16 deste repo usa --webpack; não aplicar instrução antiga de next lint. Na sandbox, EPERM de diretórios `.next` exige `infra/preparar-build-web.mjs` e VIVA_BUILD_DIRETORIOS_PREPARADOS=1; TEMP/TMP devem apontar a pasta gravável. Essa exceção está no guia Windows, não desabilita verificação de tipos.

## 5. E2E com Java/PostgreSQL reais

Preparar API com bootstrap sintético e SMS LOCAL explícito, provisionar a mesma senha para contas A/B; build/exportar a versão do app atual e iniciar serviços conforme guia. E2E_PASSWORD é a senha de login das contas sintéticas, **não a senha PG**. Bootstrap não redefine contas existentes.

```powershell
$env:E2E_PASSWORD=[Net.NetworkCredential]::new('',(Read-Host 'Senha das contas sintéticas desta API' -AsSecureString)).Password
$env:API_BASE_URL='http://127.0.0.1:8080'
$env:E2E_BASE_URL='http://127.0.0.1:3000'
pnpm exec playwright install chromium
pnpm test:e2e
```

Playwright usa11 arquivos de cenário,1worker,sem paralelismo completo,timeout45s,1retry somente CI. `webServer` inicia Next dev e preview Expo se ainda não estiverem disponíveis; API/PG precisam estar ativos. Em CI reuseExistingServer=false; em uso local, um servidor pronto é reutilizado, então conferir se o build corresponde ao código. Helpers recusam solicitação SMS se provedor não for LOCAL, evitando custos/envio real.

| Arquivo tests/e2e | O que valida |
| --- | --- |
| foundation.spec.ts | Login profissional, painel e isolamento |
| mobile-web.spec.ts | Percurso básico do app web |
| care.spec.ts | Cadastro/ativação/cuidado/planos/consultas e escopo |
| mobile-care.spec.ts | Registros no app, falha/reenvio, OCR/foto e leitura no portal |
| portugues-pressao.spec.ts | Etapas/resultados de pressão e linguagem |
| acesso-navegacao.spec.ts | Cadastro, Home e acesso às rotas/módulos |
| execucao-local.spec.ts | Cadastro/dados pessoais, semana, consultas, pulseira e interfaces |
| preferencias.spec.ts | Preferência por conta, persistência e CSP |
| acesso-paciente.spec.ts | CPF+nascimento, código/aparelho, logout e revogação |
| cadastro-sms.spec.ts | Obrigatoriedade/erros de cadastro, troca de telefone e ativação LOCAL pela UI |
| interface-responsiva.spec.ts | Portal5larguras e barra fora da rolagem nas12 rotas reais |

Focado: `pnpm exec playwright test tests/e2e/cadastro-sms.spec.ts --workers=1`. UI/headed/debug são opcionais para diagnóstico local, evitando capturar segredo. Rerodar somente após corrigir causa ou respeitar janela de rate limit; não apagar contadores, trocar relógio, reiniciar API para contornar limite ou enfraquecer cookies. Pacote completo já distribui logins entre contas; repetições imediatas podem atingir janela15min profissional.

Falha: registrar teste, SHA/build, passo, estado HTTP e erro sanitizado. Conferir API/PG ativos, export atual, senha e providerLOCAL, seletor/nome acessível e resposta verdadeira. Se uma asserção deixa de representar requisito, justificar correção; não removê-la para obter verde. Playwright de desktop prova browser, não Android/iOS reais.

## 6. Matriz de autenticação/segurança

| Cenário | Procedimento/aceite | Evidência |
| --- | --- | --- |
| CPF inválido/repetido/mascarado | Rejeitar erro estrutural; normalizar válido; não chamar Receita | cadastro.test,ValidacaoCadastroTest,CadastroSmsIT |
| Nascimento inválido/futuro/divergente | Calendário recusado no cadastro; identificação pública não enumera conta | AcessoPacienteIT,CadastroSmsIT |
| Quatro números e zero inicial | String,4posições; não converter para inteiro | AcessoPacienteIT,acesso-paciente.test |
| Expirado/usado/incorreto | Nunca concede sessão; uso único e10min | AcessoPacienteIT |
| Muitas tentativas/reenvio | Contadores persistidos; código anterior inválido; janelas não zeram com reenvio | AcessoPacienteIT,CadastroSmsIT |
| SMS LOCAL | Ler envelope privado em memória, não endpoint; telefone não confirmado | CadastroSmsIT,cadastro-sms E2E |
| Twilio HTTP | Stub local: aceito,entregue,falhou,timeout/inválido | EnvioSmsTwilioTest |
| Twilio externo | Depende contrato/credenciais/destinatários autorizados; observar entrega/custo | Não executado |
| Aparelho conhecido/desconhecido | Renovação/rotação versus exigência de código; outro contexto não herda acesso | AcessoPacienteIT,acesso-paciente E2E |
| Troca telefônica | Senha profissional+conferência+versão; revoga dispositivos/códigos/sessões | CadastroSmsIT,cadastro-sms E2E |
| Falha de envio | Código inválido e estado verdadeiro; aparelho anterior continua funcional | CadastroSmsIT |
| Profissional inválido/outra unidade |401/403 e nenhum dado vazado; vínculo necessário | InstituicaoIT,CuidadoIT,E2E |
| Foto cruzada/grant expirado |403/negação mesmo conhecendo UUID; logout invalida concessão | CuidadoIT e restore anterior |

Valores de tempo/contador em testes são ajustados **somente no schema UUID do teste**, sem esperar longas janelas. Isso não autoriza editar o banco de demonstração para burlar limite. Os limites completos e contratos ficam no [guia SMS](CADASTRO_E_ATIVACAO_SMS.md).

## 7. Roteiros manuais por módulo

Pré-requisito comum: ambiente sintético pronto, profissional A e B criados com senha privada, paciente APP fictício vinculado a A e ativado no navegador; usar rótulos da UI atual. Persistência se verifica após recarregar/reabrir e consultar a mesma ficha por API/portal autorizado. Para toda falha registrar passos/dado sintético/status/resultado esperado, sem valor de segredo. O [guia por telas](GUIA_TESTES_TODAS_AS_TELAS.md) e [checklist](CHECKLIST_TESTES_MANUAIS.md) detalham navegação; os itens abaixo não estão automaticamente marcados como executados.

| Teste | Acesso/dados/ação | Esperado e persistência | Falha a registrar |
| --- | --- | --- | --- |
| Cadastro | Portal,Cadastrar paciente;nome fictício,APP,CPF gerado,nascimento,celular;Cadastrar | Ficha aparece e GET autorizado mostra máscara/dados; outro profissional B não vê | Validação ausente,duplicidade,sucesso sem linha |
| Ativação | Ficha,Ativar ou recuperar;conferir,senha;Solicitar código por SMS | Só referência/estado; caixa LOCAL; paciente ativa e Home abre | Código exposto,erro tratado como entrega |
| Início/perfil | App,/inicio e Perfil após ativação | Nome/modalidade do titular; recarregar mantém vínculo correto | Dado de outra conta,carregamento infinito |
| Configurações | App/portal;alterar texto ampliado e tamanho da página;salvar | Reabrir nova sessão e verificar preferências da mesma conta; outra conta inalterada | Falha silenciosa/estado compartilhado |
| Telefone | Portal,dados pessoais;novo celular;confirmar/senha;salvar | Versão nova;aparelho antigo revogado;nova ativação exigida | Alteração sem reautenticação/código velho válido |
| Pressão manual | App,Pressão,digitar valores sintéticos permitidos;conferir/salvar | Medição persistida uma vez e aparece histórico/portal com origem correta | Grava sem confirmação ou duplica retry |
| Pressão foto | PNG/JPEG fixture de visor;enviar;conferir OCR;confirmar | Resultado sem medição antes de confirmar; depois histórico | Diagnóstico automático/valor ilegível salvo |
| Medicamentos | Profissional cria plano com dose/horários;paciente abre e registra autorrelato | Plano e evento aparecem no portal;autorrelato não vira ingestão comprovada | Plano cruzado,eventos não persistidos |
| Alimentação | App,fotografar/selecionar refeição fictícia;enviar e abrir resultado | Foto privada/histórico;análise indisponível quando não habilitada | Cor/classificação inventada,foto pública |
| Atividade | App,Registrar atividade;tipo,duração,estado;salvar;Ver minha semana | Registro aparece no dia correto em America/Sao_Paulo;perfil da equipe lido | Prescrição falsa,semana UTC incorreta |
| Mensagens | App,Mensagens;abrir orientações do perfil | Texto real da equipe/vazio explícito,sem alegar envio de chat | Botão que promete mensagem inexistente |
| Histórico | App,Histórico/pressão;filtrar período e recarregar | Resultados do titular;filtros e ordem corretos;sem carregar outro paciente | Resultado antigo substitui aba atual |
| Diário | Portal,ficha,diário;ocorrência/valores/notas;registrar transcrição | Autoria e origem profissional preservadas;reabrir confirma | Transcrição exibida como leitura do app |
| Consulta | Portal,ficha,consultas;data/notas/objetivos/plano;registrar | Histórico e resumo refletem consulta mais recente por ocorrência | Inserção trocada por ordem/autor ausente |
| Relatório | Portal,Relatórios;selecionar paciente,resumo/export | JSON de resumo autorizado,totais completos,limite20 itens indicado | Chamar resumo truncado de prontuário completo |
| Vínculo | Admin A,ficha;vincular/desvincular profissional A | Acesso concedido/revogado no backend;B continua negado | Somente ocultação visual |
| Navegação |12 rotas com barra;rolar até último botão;voltar | Rodapé fora ScrollView,último botão acessível,sem sobreposição | Barra no meio do conteúdo/ação escondida |
| Responsividade | Portal1366/1440/1920/768/390;app320/375/430 | Logo nítido,proporção,sem overflowhorizontal/cortes | Campo/checkbox fora da tela |
| Acessibilidade | Teclado,zoom,fonte ampliada e leitor;percorrer cadastro/ativação | Nome/foco/erro compreensíveis e alvos utilizáveis | Perda de foco,erro só cor,leitor sem rótulo |
| Offline/sync | Desligar rede após login;registrar;reconectar | Pendente explícito,um UUID/um registro;web avisa memória | Sucesso falso/duplicação/titular errado |
| Lembrete nativo | Build real,permissão;plano;bloquear tela/esperar;logout | Notificação observada e cancelamento do titular | Não executado no browser;registrar aparelho/SO |

## 8. Evidências, auditoria e CI

Capturas: `node infra/capturar-telas.mjs`, API/portal/app ativos,E2E_PASSWORD privada,SMS LOCAL. `infra/comparar-telas.py` compara referências com capturas; exige runtime/bibliotecas Python descritos pelo script. `infra/inventariar-telas.mjs` ajuda a listar recursos. Não substituir captura de implementação por protótipo. Inspecionar cada saída e mascarar campos sensíveis antes de versionar; não incluir código ativo/telefone/CPF. O screenshot de ativação deve mostrar campos vazios ou completamente ocultos.

Sanitizar diagnóstico com `infra/sanitizar-diagnosticos.mjs`/`infra/validar-interface-local.ps1` conforme seus parâmetros. Logs brutos ficam privados; publicar só resumo (data,build,teste,quantidade,status,limite). Backup não é evidência pública: seguir [backup/restore](operations/BACKUP_RESTORE.md).

```powershell
pnpm audit --audit-level high
git diff --check
git diff --cached --check
```

Auditoria atual tem2 altos,sem crítico/moderado; exit1 é falha do gate, não falha dos69 testes. Não usar ignore/suppression para declarar verde. Reavaliar advisory e consumidor, testar atualização/patch se aprovado. Gitleaks deve examinar histórico e candidato, incluindo arquivos compactados; redigir relatório sem segredos. OWASP Java/NVD precisa base atualizada/chave quando exigida; não dizer que pnpm audit cobre Maven.

`.github/workflows/ci.yml` contém JS,Java,secret-scan,browser. Push pode disparar esses jobs; configurar NVD_API_KEY quando necessário e observar execução remota separadamente dos testes locais. CI que falha pela auditoria continua falhando honestamente. O relatório final distingue status observado e o que não pôde ser executado. Nenhum teste local autoriza produção, serviços pagos ou dados reais.
