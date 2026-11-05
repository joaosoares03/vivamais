## Correção de fotos e grupo em validação

Preparação automática de fotos originais até 10 MiB, prévia/confirmar/remover/repetir, validação no servidor e novos convites profissionais implementados localmente. 76 testes app, 55 portal, 11 Java e 8 integrações PG passaram; regressão final/contratos e publicação em andamento. IA confirmada desabilitada, sem chamadas no banco. A versão implantada ainda é cd1c24d. Estado detalhado em [validação de fotos, IA e grupo](evidencias/VALIDACAO_FOTOS_IA_E_TESTES_GRUPO.md); guia em docs/GUIA_TESTES_GRUPO_VIVAMAIS.md. Não confundir os testes locais com implantação ou ensaio físico.

# Entrada para a distribuição do grupo

**Homologação04/11:** portal e paciente HTTPS implantados; consultar [guia de acesso vigente](GUIA_TESTES_NUVEM.md). As instruções locais anteriores abaixo permanecem históricas. Fotos com upload/download e autorização aprovados remotamente; não compartilhar APK LAN como versão da nuvem.

Revisão04/11/2026. O APK Android local já foi testado pelo proprietário. A versão remota do grupo e o iPhone ainda dependem de infraestrutura/contas, conforme os guias abaixo. Nenhum integrante precisa configurar Java, Node, banco ou Codex para utilizar um instalador autônomo liberado.

- **Integrantes:** [instalar, entrar, testar medicamentos/offline e relatar erros](GUIA_TESTES_GRUPO_ANDROID_IOS.md).
- **Responsável técnico:** [ambientes, API HTTPS econômica, contas isoladas e convites](PLANO_DISTRIBUICAO_INTERNA_VIVAMAIS.md).
- **Builds e atualizações:** [Android privado, Development Build, TestFlight e EAS Update](GUIA_CONFIGURACAO_EXPO_EAS_TESTFLIGHT.md).
- **Proprietário fora de casa:** [o que é possível no iPhone, QR/Metro e bloqueios atuais](GUIA_EXPO_ACESSO_REMOTO_CELULAR.md).

Não compartilhar APK local como se tivesse backend público. Não enviar senhas ou convites ativos no Git/chat. Um convite do Viva+ autoriza o acesso individual ao ambiente sintético; ele não substitui o mecanismo de instalação/assinatura do Android ou da Apple. A liberação remota só estará concluída após instalador verificado, backend disponível e teste real por plataforma.
