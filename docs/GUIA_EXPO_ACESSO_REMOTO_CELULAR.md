# Acompanhar o Viva+ pelo celular, inclusive fora de casa

**Homologação04/11:** portal e paciente HTTPS implantados; consultar [guia de acesso vigente](GUIA_TESTES_NUVEM.md). As instruções locais anteriores abaixo permanecem históricas. Fotos com upload/download e autorização aprovados remotamente; não compartilhar APK LAN como versão da nuvem.

Estado de 04/11/2026: exportação Expo Android/iOS/web concluída com Hermes e pasta temporária gravável. Não existe QR funcional ou endereço público do Viva+ nesta entrega. O banco local foi encontrado parado; a sandbox recusou abrir sockets ao tentar iniciá-lo. Não foi solicitado que o proprietário, hoje apenas com o iPhone, execute comandos no Windows. A ação futura do operador é uma dependência registrada, não uma etapa exigida agora.

## O que instalar no iPhone

Para a futura versão de testes, **TestFlight** será o caminho mais simples. Ainda faltam conta Apple Developer, assinatura, build e convite liberado. Para acompanhar Metro, precisa estar instalada uma **Development Build do Viva+**, feita com os módulos nativos deste projeto. Instalar somente Expo Go não habilita SQLCipher. Não existe IPA pronto para instalar agora.

A alternativa sem assinatura Apple é testar a versão web no Safari quando houver hospedagem HTTPS e backend de homologação por convite. Ela usa os mesmos serviços de domínio, mas não comprova notificações locais, SQLCipher, câmera/armazenamento nativos ou comportamento após encerramento do aplicativo. Não foi criado um endereço fictício nem uma prévia com progresso simulado para apresentar isso como concluído.

## QR e outra rede

O endereço `127.0.0.1` no iPhone aponta para o próprio celular. O endereço doméstico192.168.0.8 funciona apenas na rede local autorizada. Nenhum deles fornece acesso enquanto o proprietário está fora de casa.

Um túnel Expo pode transportar o bundle Metro até uma Development Build instalada, mas a API é uma conexão separada. Antes de iniciar o túnel, implantar a [homologação sintética por convite](PLANO_DISTRIBUICAO_INTERNA_VIVAMAIS.md), com HTTPS e login simples por CPF desligado. Nunca encaminhar o PostgreSQL, a API demonstrativa local ou arquivos privados pelo túnel.

O responsável técnico tem um inicializador preparado:

```text
node infra/iniciar-expo-remoto.mjs --api ORIGEM_HTTPS_REAL --confirmar-api-por-convite
```

Ele recusa endereços locais/de exemplo, exige confirmação da configuração sintética, verifica a saúde da API e só então chama `expo start --dev-client --tunnel`. TEMP/TMP ficam na pasta de trabalho, sem alterar o Windows globalmente. Não cria contas nem backend. A validação de saúde não comprova todos os controles de acesso; fazer o ensaio de convites antes de compartilhar o QR. Não foi iniciado porque ainda não existe API HTTPS autorizada nem Development Build iOS assinada.

Quando disponível, abrir a câmera do iPhone e ler o QR destinado à Development Build instalada. Se o iPhone abrir Expo Go, esse não é o cliente correto para este projeto. Para colegas sem necessidade de acompanhar Metro, enviar um instalador autônomo pelo canal privado, conforme o [guia EAS](GUIA_CONFIGURACAO_EXPO_EAS_TESTFLIGHT.md).

## Exportação e correção Hermes

O problema anterior foi `permission denied` ao gravar `index.hbc` no TEMP da sandbox. A repetição com TEMP/TMP em `work/tmp` concluiu os três bundles. O reprodutor versionado agora usa `.local/execucao/temporarios`, mantém Hermes/cache e aceita:

```text
node infra/exportar-expo.mjs --modo convites --plataforma all
node infra/exportar-expo.mjs --modo demonstracao --plataforma all
```

Essas saídas são validações locais, com API loopback, e **não devem ser distribuídas como versão remota pronta**. O helper registra hashes e tamanhos dos bundles em `.local/execucao/export-<modo>.json`. Para a distribuição real, usar os perfis EAS e a API HTTPS configurada. Mudanças nativas exigem novo build; alterações compatíveis podem usar EAS Update após teste de runtime.

## Bloqueios e continuidade sem terminal do proprietário

| Dependência | Motivo e próxima ação futura | Trabalho que continua agora |
| --- | --- | --- |
| PostgreSQL/API local | Banco parado; criação de sockets recusada pela sandbox. Inicializar em ambiente autorizado quando disponível, preservando cluster/credenciais. | Código, testes independentes, exports, revisão de segurança e documentação. |
| Portal local | O inicializador padrão foi permitido nesta retomada e o portal está ativo em 3000. A recusa automática anterior foi superada pela execução autorizada do mesmo inicializador, sem outro mecanismo. Sem API/banco, login integrado permanece indisponível. | Build aprovado e capturas reais da entrada profissional. |
| API remota | Contas/credenciais e implantação HTTPS ainda não disponíveis. | Dockerfile, modelo de ambiente, validação e preparação de contas/convites. |
| iPhone nativo | Conta/assinatura Apple e EAS não configuradas. | Perfis, módulos, bundles iOS e roteiro TestFlight. |

Os testes anteriores116Java/45 portal/72 app são evidência da versão validada, preservada nos relatórios. Alterações posteriores de tela recebem verificações próprias; não declarar novo E2E ou ensaio físico sem execução. Para medicamentos e relato de problemas, usar o [roteiro simples](GUIA_TESTES_GRUPO_ANDROID_IOS.md).
