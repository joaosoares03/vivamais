# Publicação Android e iOS — Viva+

## APK0.2.0 e preparação do grupo — 04/11/2026

Novo arquivo local: .local/instalaveis/VivaMais-DemoRede-0.2.0-build2-arm64.apk,105.459.842bytes; assinatura igual à anterior, build2, zipalign e26 ELF16KB aprovados. Não instalado fisicamente nesta retomada; os APKs0.1.0 abaixo permanecem preservados/históricos. A API LAN é local e está indisponível enquanto a sandbox não permite iniciar o cluster PostgreSQL. Não compartilhar esse APK como versão autônoma remota.

Para o grupo/iPhone, seguir os guias [EAS/TestFlight](GUIA_CONFIGURACAO_EXPO_EAS_TESTFLIGHT.md), [backend e privacidade](PLANO_DISTRIBUICAO_INTERNA_VIVAMAIS.md) e [instalação/testes](GUIA_TESTES_GRUPO_ANDROID_IOS.md). Não existe IPA/QR/link remoto pronto. Expo Go não substitui o build com SQLCipher. Nenhuma publicação/pagamento/commit/push nesta execução. [Hashes e validações](evidencias/MEDICAMENTOS_CONVITES_EXPO_2026-11-04.md).


Revisado em 03/11/2026. Configuração, build, instalação, upload e aprovação são etapas distintas. Nenhum envio às lojas foi feito. O proprietário informou que ainda não possui contas Expo/EAS e Apple Developer. O resultado efetivo dos artefatos está no [relatório da execução](RELATORIO_FINALIZACAO_GERAL_VIVAMAIS.md).

**Resultado Samsung,03/11/2026:** proprietário confirmou que baixou, instalou e testou o APK de rede após iniciar a API em PowerShell normal e autorizar a regra restrita. Esse é um aceite manual geral; câmera, notificações e offline após reabertura ainda têm ensaios próprios pendentes.

## Teste local e distribuição

### Instalar manualmente no Samsung, sem ADB

Use **VivaMais-DemoRede-arm64.apk**, em `C:\Users\joaos\Documents\Codex\2026-10-16\p\outputs\viva-mais-pr-1\.local\instalaveis\VivaMais-DemoRede-arm64.apk`. O APK USB anterior foi preservado separadamente. Ambos usam a mesma assinatura de testes/pacote e podem atualizar a mesma instalação sem apagar seus dados.

1. Deixe o computador ligado com PostgreSQL e API. Nesta máquina, computador cabeado `192.168.0.8` e Samsung no Wi-Fi `192.168.0.5` pertencem à mesma rede do roteador. Não usar Wi-Fi de convidados, VPN ou dados móveis durante o ensaio. Se DHCP mudar esses IPs, a liberação precisa ser revisada; não abrir para qualquer endereço.
2. No navegador do Samsung, confira `http://192.168.0.8:8083/actuator/health`. O resultado esperado é `{"status":"UP"}`. Se ficar carregando, verificar comunicação/firewall antes de tentar o login.403 indica endereço/canal não autorizado; não equivale a paciente inexistente.
3. Para transferência sem cabo, abra **http://192.168.0.8:8083/demonstracao/vivamais.apk** no Samsung. A rota entrega somente o APK explicitamente configurado e somente ao IP liberado; não lista diretórios nem permite escolher arquivos. Alternativa: no Explorador do Windows, copie o APK para **Download** do telefone usando USB em modo **Transferência de arquivos**; isso não precisa de ADB. Também é possível transferir esse mesmo arquivo por Bluetooth/armazenamento pessoal, sem publicar credenciais ou banco. [Arquivos e USB Samsung](https://www.samsung.com/br/support/mobile-devices/how-to-find-and-manage-files-on-your-samsung-galaxy-device/).
4. No Samsung, abra **Meus Arquivos → Downloads**, toque no APK e em **Instalar**. Se solicitado, autorize **Permitir desta fonte** apenas para o aplicativo que abriu o arquivo. Depois da instalação, essa autorização pode ser desativada. Nomes variam conforme o One UI. Se o Bloqueador automático ou uma política institucional impedir, registre o aviso para orientação específica; não desative proteções sem avaliar a mensagem. [Orientação Samsung](https://www.samsung.com/us/support/troubleshoot/TSG10001913/).
5. Toque **Abrir**. O nome instalado é **Viva+ Demo local**, pacote `org.vivamais.academicdemo.local`. Confira a faixa de demonstração. Esse APK aponta para `http://192.168.0.8:8083`, não para o localhost do celular. Não depende de Expo Go nem de conta Expo.
6. Para consultar uma conta fictícia já criada nesta máquina, abra no computador: `notepad.exe "C:\Users\joaos\Documents\Codex\2026-10-16\p\work\finalizacao-paciente-sintetico.json"`. Use o CPF e nascimento desse arquivo **somente no aplicativo**; não publique esses dados. Digite nascimento como DD/MM/AAAA (o arquivo privado guarda ISO). O acesso demonstrativo não solicita SMS. Alternativa: cadastrar uma pessoa APP fictícia na unidade de demonstração pelo portal profissional.
7. Teste Home, pressão manual/foto, medicamentos/autorrelatos, alimentação, atividade realizada, histórico, consultas, preferências e saída/reentrada. Registre uma ocorrência fictícia e confira sua persistência no portal. Análise alimentar/seleção clínica e hardware bloqueados continuam identificados.
8. Leia dados conectado; depois desligue o Wi-Fi e consulte o histórico já carregado. No nativo, experimente fechar/reabrir com sessão ainda válida, reconectar e sincronizar. Cache/fila usam SQLCipher e sessão usa SecureStore, mas **esse ensaio nativo só será aprovado depois de realizado**. No navegador, cache/token são de memória e não sobrevivem à reabertura.

O servidor8080 permanece em127.0.0.1 para portal/prévias. O conector opcional8083 liga somente o IPv4 privado escolhido e filtra IP do aparelho, Host, porta e cabeçalhos de proxy. Apenas saúde/download aceitam navegação do navegador; login nativo continua recusando Origin/Sec-Fetch e a API conserva autorização por paciente/unidade. A regra de firewall é restrita ao Java/interface/perfil/IP/porta, com consentimento UAC do proprietário. Não há túnel, encaminhamento no roteador ou liberação produtiva. HTTP é exceção exclusiva do ensaio sintético; o APK de rede limita tráfego sem TLS ao host configurado em sua política Android.

**Firewall, apenas quando necessário e autorizado:** `infra/firewall-android-rede.ps1 -Acao Verificar -Computador 192.168.0.8 -Celular 192.168.0.5` não altera regras. `-Acao Liberar` pede UAC e cria uma regra específica; `-Acao Remover` desfaz somente essa regra. Não desligar o firewall. A consulta e criação devem ser feitas no Windows normal; não foram executadas pelo Codex.

**ADB Samsung, se quiser retomar o teste USB:** conferir cabo de dados/outra porta direta, telefone desbloqueado e notificação USB em Transferência de arquivos; depuração USB habilitada nas opções de desenvolvedor e autorização deste computador. No Gerenciador de Dispositivos, verificar se aparece a interface Android/ADB ou aviso de driver. Somente se necessário e autorizado, usar o [driver oficial Samsung para Windows](https://developer.samsung.com/android-usb-driver), não pacotes genéricos de terceiros. Menus/bloqueios variam por modelo/One UI. Zero aparelhos no ADB não identifica sozinho defeito de driver ou cabo; a instalação manual evita depender dessa investigação. [Guia Android](https://developer.android.com/studio/run/device).

**Reinício nesta máquina:** o helper privado `C:\Users\joaos\Documents\Codex\2026-10-16\p\work\Iniciar-API-Finalizacao.ps1` reutiliza credenciais/banco/unidade sintéticos e `.local/rede-android-teste.json`; execute apenas se a API estiver encerrada. Em outro checkout, configurar suas próprias credenciais, `SERVER_ADDRESS=127.0.0.1`, `PATIENT_DEMO_LOGIN_ENABLED=true`, unidade fictícia explícita, `PATIENT_DEMO_LAN_ADDRESS`, `PATIENT_DEMO_LAN_CLIENT` e `PATIENT_DEMO_APK_PATH` absoluto. Sem o opt-in, não há conector nem download. Nunca copiar segredos do autor.

### Instalar o APK USB anterior

Arquivo: `C:\Users\joaos\Documents\Codex\2026-10-16\p\outputs\viva-mais-pr-1\.local\instalaveis\VivaMais-DemoLocal-arm64.apk`. Compatível com Android7/API24 ou superior e processador arm64. Pacote `org.vivamais.academicdemo.local`; build release de demonstração assinado com chave privada exclusiva de testes, separada das futuras chaves de loja. Consulte tamanho/hash definitivos no relatório; nunca compartilhar o `.jks` ou seu arquivo de credencial.

1. Mantenha PostgreSQL/API local iniciados na configuração sintética revisada. A API deve responder `http://127.0.0.1:8080/actuator/health`. A instalação não inclui o servidor/banco dentro do celular.
2. Conecte Android desbloqueado por cabo de dados, ative a depuração USB e aceite a autorização deste computador. Não desative o Play Protect nem instale drivers globais sem verificar a necessidade e a origem.
3. No PowerShell, confira o dispositivo e instale:

```powershell
$adb='C:\Users\joaos\Documents\Codex\2026-10-16\p\work\android-sdk\platform-tools\adb.exe'
$apk='C:\Users\joaos\Documents\Codex\2026-10-16\p\outputs\viva-mais-pr-1\.local\instalaveis\VivaMais-DemoLocal-arm64.apk'
& $adb devices
& $adb install -r $apk
& $adb reverse tcp:8080 tcp:8080
& $adb shell am start -n org.vivamais.academicdemo.local/.MainActivity
```

Esses comandos pressupõem **um único dispositivo autorizado**. Se houver mais de um, selecionar explicitamente o aparelho desejado. `-r` atualiza a mesma instalação/assinatura e preserva seus dados; não desinstalar nem limpar dados automaticamente para resolver conflito de assinatura. Como alternativa, copiar o APK para o celular e abrir o instalador; o encaminhamento USB ainda é necessário para acessar esta API loopback.

4. Use uma conta APP **fictícia da unidade de demonstração configurada**, cadastrada pelo profissional no portal. Digite seu CPF sintético e nascimento DD/MM/AAAA; o modo local não pede código. Não utilizar dados reais nem enviar CPF/senha/código ao chat. Se precisar consultar a identidade criada pelos testes, abra somente o arquivo privado `work/finalizacao-paciente-sintetico.json` no próprio computador; ele não é distribuído pelo Git e pode corresponder à última conta sintética capturada. Não usar o texto literal “REFERENCIA_COPIADA”.
5. Teste módulos, consulta, saída/reentrada, câmera com imagem fictícia, preferência de fonte e offline/reconexão. O encaminhamento precisa permanecer ativo e o computador ligado. Para encerrar, `& $adb reverse --remove tcp:8080`; desative a depuração USB quando não precisar dela. Falha de rede não significa ausência de cadastro.

**Limites:** não houve aparelho autorizado detectado nas verificações registradas até o checkpoint do relatório. A instalação manual do APK de rede foi confirmada pelo proprietário; os testes nativos específicos continuam separados. Navegador e APK não têm a mesma persistência: token/cache no navegador ficam em memória; no nativo, sessão usa SecureStore e cache/fila usam SQLCipher. Fechar/reabrir sem rede exige teste físico e sessão ainda válida.

### Reproduzir a compilação local

Use PowerShell7, Java21, dependências pnpm10.28.2 instaladas e SDK já instalado com termos aceitos. Componentes desta execução: plataforma36, build-tools36.0.0, NDK27.1.12297006, CMake3.22.1 e Ninja1.13.2. O SDK fornecia Ninja1.10.2, que falhou com caminhos longos; a substituição local foi baixada do [projeto oficial](https://github.com/ninja-build/ninja/releases/tag/v1.13.2) e teve SHA256 conferido. Não alterar registro/variáveis globais do Windows.

```powershell
.\infra\Gerar-APK-Demonstracao.ps1 `
  -AndroidSdk 'C:\Users\joaos\Documents\Codex\2026-10-16\p\work\android-sdk' `
  -CacheGradle 'C:\Users\joaos\Documents\Codex\g' `
  -DiretorioCmake 'C:\Users\joaos\Documents\Codex\c'
```

Na primeira preparação ou após alterações da configuração nativa, acrescentar `-PrepararProjeto`. Isso atualiza apenas entradas/projeto gerados em `.local/apk`, sem recriar o produto ou copiar credenciais. Cache e raiz CMake precisam ser curtos por causa dos headers/objetos nativos no Windows. A chave de testes permanece privada fora do fonte e é reutilizada; não trocar a chave se quiser atualizar o mesmo APK instalado. Logs privados em `.local/execucao/android-build.log`. O script verifica assinatura e zipalign antes de copiar o artefato; alinhamento ELF e ensaio físico são verificações adicionais, registradas separadamente.

Para o APK de rede desta máquina, acrescentar `-EnderecoApi 'http://192.168.0.8:8083'`. Isso gera **VivaMais-DemoRede-arm64.apk**, preserva o arquivo USB e restringe a exceção HTTP Android ao host informado. Só aceita IPv4 RFC1918 literal e porta8083; não aceita URL pública, hostname, credenciais ou caminho. Recompilar apenas se esse endereço/configuração ou o código mudar; os dois APKs já existem e foram verificados.

### Preparação para distribuição pública

O modo demonstrativo usa identificador `org.vivamais.academicdemo.local`, nome **Viva+ Demo local**, dados fictícios, servidor restrito a loopback e CPF/nascimento sem SMS. Não enviar esse modo às lojas ou expor a API por túnel. Não serve para pacientes reais. Para Android conectado por USB, a comunicação local pode ser encaminhada por `adb reverse tcp:8080 tcp:8080`; a API permanece em 127.0.0.1. Autorizar a depuração somente no computador de teste. Os testes físicos ainda precisam ser executados em um aparelho autorizado.

Os perfis EAS `preview`/`production` mantêm o login demonstrativo desligado. `app.config.ts` recusa esse login em builds públicos, API HTTP/local em distribuição e reutilização do identificador público pela demonstração. A configuração nativa inclui SQLCipher, SecureStore, câmera/fotos, notificações, ícone de alta resolução, splash e número de build. O pré-build não comprova funcionamento em aparelho.

## Antes de qualquer envio

1. Escolher instituição responsável, identificadores definitivos Android/iOS e titularidade das chaves. Os valores `org.vivamais.academicdemo` são provisórios e não reservam nomes nas lojas.
2. Aprovar governança e modelo para o ambiente pretendido. O backend atual bloqueia `APP_ENV=production`; não retirar essa proteção apenas para conseguir publicar. O modelo sintético e a credencial local superusuária não atendem produção.
3. Preparar homologação sintética separada na [infraestrutura econômica](operations/HOSPEDAGEM_DEMO.md), com API HTTPS real, banco próprio, bucket privado, chaves estáveis, CORS exato e login seguro por aparelho. `PATIENT_DEMO_LOGIN_ENABLED=false`. Nunca publicar banco/arquivos da máquina de desenvolvimento.
4. Homologar autenticação segura, provedor SMS ou processo institucional de acesso de revisores, backup/restauração e isolamento. Não fornecer CPF/nascimento como credencial única para um ambiente público. Nenhuma senha de revisor está incluída neste repositório.
5. Aprovar contatos e textos de privacidade, exclusão, termos e finalidade clínica. Ver [rascunhos de materiais](lojas/MATERIAIS_PUBLICACAO.md). Rotas atuais `/privacidade`, `/suporte`, `/exclusao` são informativas sobre as pendências; não equivalem a processo operacional de atendimento.
6. Executar regressão, auditorias e os testes físicos de câmera, mídia, SecureStore/SQLCipher, encerramento/reabertura, sessão, acessibilidade, notificações e offline/reconexão. Ver o [manual de testes](MANUAL_COMPLETO_TESTES_DESENVOLVEDOR.md).

## Conta Expo e EAS

Crie sua conta em [Expo](https://expo.dev/signup) e autentique **no terminal**, sem enviar credenciais ao chat. Na raiz, com pnpm 10.28.2:

```powershell
pnpm dlx eas-cli login
pnpm dlx eas-cli init
```

O `init` cria/vincula um projeto na conta do proprietário; registrar o UUID verdadeiro em `EXPO_EAS_PROJECT_ID` no ambiente de build. Conferir e revisar qualquer mudança de configuração. Não copiar o projectId de outro projeto.

```powershell
$env:APP_ENV='preview'
$env:VIVA_LOGIN_DEMONSTRACAO='false'
$env:EXPO_PUBLIC_API_BASE_URL='https://SEU_HOST_HTTPS_AUTORIZADO'
$env:EXPO_EAS_PROJECT_ID='UUID_REAL_DO_PROJETO'
$env:VIVA_ANDROID_APPLICATION_ID='IDENTIFICADOR_DEFINITIVO_ANDROID'
$env:VIVA_IOS_BUNDLE_IDENTIFIER='IDENTIFICADOR_DEFINITIVO_IOS'
node infra/verificar-distribuicao.mjs --perfil preview
```

Substituir os marcadores: não são valores prontos para copiar. A verificação inspeciona a configuração e o vínculo; não autentica a conta, não testa disponibilidade da API, não verifica assinatura nem envia builds. Depois:

```powershell
pnpm dlx eas-cli build --platform android --profile preview
pnpm dlx eas-cli build --platform android --profile production
pnpm dlx eas-cli build --platform ios --profile production
```

`preview` gera APK interno Android; `production` gera AAB Android e build iOS de distribuição. Configurar variáveis no ambiente EAS correspondente, não apenas no PowerShell local. A chave Android real deve ser criada/guardada na conta autorizada, com backup privado. Certificados/provisioning iOS dependem da equipe Apple. A chave exclusiva do APK **local de demonstração** não substitui a identidade de assinatura institucional.

Referências: [EAS Build](https://docs.expo.dev/build/setup/), [credenciais](https://docs.expo.dev/app-signing/app-credentials/), [segurança das chaves](https://docs.expo.dev/app-signing/security/). A nuvem permite compilar iOS usando Windows, mas exige a configuração de assinatura apropriada; localmente o pré-build iOS foi recusado por não ser macOS/Linux.

## Google Play

1. Criar conta do titular no [Play Console](https://play.google.com/console/signup), cumprir identidade e pagamento. Referência atual: US$25 uma vez; confirmar câmbio/impostos no painel. [Instruções oficiais](https://support.google.com/googleplay/android-developer/answer/6112435?hl=pt-BR).
2. Criar o app, definir idioma pt-BR, nome, categoria e app gratuito/pago conforme decisão do proprietário. Não inventar instituição ou certificação.
3. Preencher ficha, suporte, privacidade pública HTTPS, exclusão de conta, classificação etária, acesso restrito, declaração de saúde e Segurança dos dados a partir da implantação real. Ver matriz técnica dos materiais; a instituição deve aprovar as respostas.
4. Enviar **AAB seguro**, habilitar Play App Signing e começar pela faixa interna. Fazer o primeiro envio manual se o EAS Submit ainda não tiver o app configurado. Depois é possível usar `eas submit --platform android --profile production --id ID_REAL_DO_BUILD`, com conta de serviço de escopo mínimo configurada em ambiente privado.
5. Confirmar pré-lançamento, compatibilidade de bibliotecas nativas com páginas de 16KB, target API e permissões no Console. Em 03/11/2026, novas submissões/atualizações comuns exigem **Android16/API36** desde 31/08/2026; o projeto gerado compila/target36. Isso não substitui a análise do binário nem a aceitação do Console. [Regra oficial](https://support.google.com/googleplay/android-developer/answer/11926878?hl=pt-BR).
6. Contas pessoais novas podem exigir **12 testadores por 14 dias contínuos** no teste fechado antes de solicitar produção. [Requisitos](https://support.google.com/googleplay/android-developer/answer/14151465?hl=pt-BR). Não existe promessa de aprovação no mesmo dia.

O perfil de submissão Android já aponta para faixa interna e status draft. Build local, upload aceito e publicação pública não devem ser confundidos.

## Apple e TestFlight

1. Inscrever o titular/equipe no [Apple Developer Program](https://developer.apple.com/programs/enroll/) e concluir identificação e contratos. Referência US$99/ano, sujeita ao país. Instituição elegível pode solicitar isenção; estudante individual não recebe isenção automaticamente.
2. Registrar o Bundle ID definitivo na equipe correta e criar o app em [App Store Connect](https://appstoreconnect.apple.com/). Configurar certificados e provisioning no EAS com autenticação autorizada. Não colocar `.p12`, `.mobileprovision`, `.p8` ou senha no Git/chat.
3. Selecionar imagem de build EAS compatível com **Xcode26 ou posterior e SDK iOS26**, regra em vigor desde 28/04/2026, e conferir os requisitos atuais antes do envio. [Apple](https://developer.apple.com/news/upcoming-requirements/). O export Hermes feito no Windows não prova compilação Xcode.
4. Gerar o build production e enviar com `eas submit --platform ios --profile production --id ID_REAL_DO_BUILD`. Informar o app/equipe reais durante a configuração. Não há `ascAppId` fictício versionado.
5. Aguardar processamento, responder sobre criptografia conforme uso real, validar privacy manifests/SDKs/permissões e convidar testadores internos no TestFlight. Teste externo pode exigir Beta App Review. [EAS Submit iOS](https://docs.expo.dev/submit/ios/).
6. Capturar telas **do binário iOS real**, preencher privacidade e revisão, cadastrar acesso seguro de revisor e solicitar análise de produção somente após fechar bloqueios. As capturas web existentes não são apresentadas como capturas iPhone/iPad.

## Registro de entrega

Guardar versão/build, Git SHA efetivamente usado, perfil, identificador, SHA256, certificado público da assinatura, URL/ID EAS, faixa e estado do upload/revisão. Guardar chaves/credenciais separadamente. Atualizar o relatório somente com estados observados. Nesta execução não há IDs EAS, submissões, links TestFlight ou aprovação de loja.
