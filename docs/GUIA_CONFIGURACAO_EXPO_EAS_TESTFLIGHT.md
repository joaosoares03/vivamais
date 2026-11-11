# Expo, EAS e TestFlight do Viva+

Preparação de 04/11/2026. Não há conta Expo vinculada nem Apple Developer configurada. Não foi gerado IPA, enviado build à nuvem ou instalado aplicativo em iPhone. As instruções abaixo são para o responsável técnico quando as contas e a API de homologação estiverem disponíveis; os testadores não precisam instalar ferramentas de desenvolvimento.

## Configuração preparada

Expo 57 e React Native 0.86 foram preservados. `expo-dev-client` e `expo-updates` usam as faixas compatíveis informadas pelo SDK instalado, com versões resolvidas no lockfile. SQLCipher, SecureStore, câmera/fotos e notificações continuam no projeto. Ícone, splash, strings de permissão, identificadores e build estão em `app.config.ts`. Nenhuma proteção foi retirada para executar no Expo Go.

SQLCipher exige compilação nativa própria e [não está disponível no Expo Go](https://docs.expo.dev/versions/latest/sdk/sqlite/). Para desenvolvimento iOS, é necessária uma Development Build compatível já instalada; no Windows a compilação assinada pode ser feita pelo EAS, depois da configuração de conta/certificados. A compilação de bundles Hermes para iOS no Windows valida JavaScript, não gera um IPA.

A tentativa local de gerar a estrutura nativa com `prebuild --platform ios --no-install` foi recusada pela CLI no Windows, que exige macOS/Linux para essa geração. Entradas de preparação ficaram isoladas em `.local/ios-preparacao`; o aplicativo existente não foi recriado nem alterado para forçar a plataforma. EAS em macOS continua sendo o caminho de build assinado preparado para quando houver conta e autorização.

| Perfil em eas.json | Uso | Canal | Resultado previsto |
| --- | --- | --- | --- |
| development | Development Build em aparelho real | desenvolvimento | Android APK; iOS ad hoc assinado, não simulador |
| simulador | Desenvolvimento em simulador iOS | desenvolvimento | Não instala em iPhone; exige ambiente de simulador compatível |
| preview | Grupo sem Metro | grupo | APK interno; iOS ad hoc para aparelhos registrados |
| testflight | Grupo no iPhone | grupo | Build iOS para App Store Connect/TestFlight |
| production | Preparação futura | producao | Login demonstrativo/convites desligados; backend produtivo ainda bloqueado |

Versão de código:0.2.0, Android versionCode 2 e iOS buildNumber 2. O pacote do grupo termina em `.teste`; a demonstração local termina em `.local`. Não reutilizar uma assinatura/pacote por engano. O primeiro build EAS do grupo terá sua própria chave; preservar as chaves para atualizações posteriores.

## Vincular e conferir

Com credenciais inseridas apenas nas ferramentas oficiais, o responsável usará `pnpm dlx eas-cli@latest login` e `pnpm dlx eas-cli@latest init`. Registrar a versão da CLI utilizada e o UUID real do projeto em `EXPO_EAS_PROJECT_ID`. Conferir propriedade/organização do projeto; não usar um UUID de exemplo.

Configurar no ambiente EAS correspondente:

- `EXPO_PUBLIC_API_BASE_URL`: origem HTTPS real da API de homologação por convite, sem localhost ou credenciais.
- `EXPO_EAS_PROJECT_ID`: projeto verdadeiro vinculado ao proprietário.
- Flags de acesso/ambiente/canal já definidas por perfil. Preview/TestFlight usam convites e nunca login demonstrativo por CPF.

No ambiente EAS **preview**, registrar também `APP_ENV=preview`, `VIVA_LOGIN_DEMONSTRACAO=false`, `VIVA_ACESSO_TESTADORES=true` e `VIVA_ATUALIZACOES=true`. O comando EAS Update carrega esse ambiente, não as variáveis do perfil de build automaticamente. Manter os mesmos valores e projeto/API no build e na atualização; divergências alteram a configuração/fingerprint e podem impedir ou invalidar a atualização. Ambiente de desenvolvimento mantém atualizações desligadas e produção mantém convites desligados.

Segredos do backend, banco e convites individuais não pertencem ao ambiente público do app. Antes de enviar um build: `node infra/verificar-distribuicao.mjs --perfil preview` ou `--perfil testflight`. Sem projeto/API válidos, o verificador deve falhar; isso não é um build concluído.

`.easignore` preserva as exclusões do Git e exclui material de revisão/referências/ZIPs do arquivo enviado à nuvem. `.local`, bancos, logs, chaves, certificados e arquivos de ambiente preenchidos não entram no build. Inspecionar o arquivo de envio antes do primeiro build real, mantendo os manifests dos workspaces necessários. Essa inspeção na conta EAS ainda não foi realizada.

## Builds e privacidade

Após autorizar o uso das contas e recursos, os comandos são:

```text
pnpm dlx eas-cli@latest build --profile development --platform ios
pnpm dlx eas-cli@latest build --profile preview --platform android
pnpm dlx eas-cli@latest build --profile testflight --platform ios
```

Para iOS ad hoc, registrar os aparelhos com `eas device:create` antes do build. Para TestFlight, o proprietário precisa concluir Apple Developer, acordos, identificador e aplicativo no App Store Connect; configurar o App Store Connect ID verdadeiro no perfil de submissão e só então executar `eas submit --profile testflight --platform ios --id ID_DO_BUILD`. Não executar submissão automática nesta preparação.

Em [EAS Internal Distribution](https://docs.expo.dev/build/internal-distribution/), desativar **Unauthenticated access to internal builds** nas configurações do projeto e conceder acesso apenas às contas Expo dos testadores autorizados. O link interno padrão, sozinho, não exige login. Isso ainda não foi configurado por falta da conta. TestFlight utiliza convites privados; testadores externos podem depender de revisão beta da Apple. Não publicar convites ativos em documentação.

## Atualizações

`runtimeVersion` usa fingerprint e o canal do grupo é separado. Atualizações só são habilitadas com projeto EAS válido e flag explícita; a demonstração local não recebe OTA. A tela Configurações permite verificar/baixar e aplicar uma atualização manualmente; impede aplicar com registros pendentes no aparelho.

Mudanças compatíveis em JavaScript, textos, estilos e imagens podem ser distribuídas por EAS Update. Dependência nativa, permissão, plugin, SDK ou runtime diferente exigem novo binário. Esta versão adiciona módulos nativos e exige novo build; não enviar seus bundles ao APK 0.1.0. Essa separação segue o [modelo de runtime do Expo](https://docs.expo.dev/eas-update/runtime-versions/).

Depois de testar em build do mesmo runtime, o responsável pode publicar uma atualização com `eas update --channel grupo --environment preview --message "DESCRICAO_REVISADA"`. Conferir API, fingerprint e canal antes. Registrar o ID da atualização no histórico privado de release. Nenhuma atualização foi publicada nesta execução; entrega OTA e instalação iOS ainda precisam de ensaio nativo.

As etapas no celular estão no [guia do grupo](GUIA_TESTES_GRUPO_ANDROID_IOS.md); Metro/QR em outra rede estão no [guia de acesso remoto](GUIA_EXPO_ACESSO_REMOTO_CELULAR.md).
