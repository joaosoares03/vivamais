## Fotos e grupo disponíveis na homologação — 05/11/2026

Fonte implantada `6a80797` na branch `codex/homologacao-nuvem-20261104`. Fotos originais até 10 MiB recebem preparo automático, prévia e confirmação; persistência privada e leitura autorizada foram verificadas em nuvem. O administrador cria convites individuais de paciente ou profissional em **Grupo de testes**, com validade, reemissão e revogação; SMS não participa desse acesso. A agenda anterior foi preservada ao editar medicamentos com vigência futura.

[Paciente](https://viva-api-paciente-homologacao.up.railway.app/convite) · [Profissional](https://vivamais-portal-viva-mais3.vercel.app). IA alimentar continua **desabilitada**, com zero tentativas no banco. Testes: 79 app, 58 portal, 10 integrações PostgreSQL na rodada final, 17 verificações de fotos/grupo e 23 de regressão API, além do ensaio das duas interfaces e demais módulos. Não houve ensaio físico de Safari/HEIC nem novo APK/IPA.

[Guia de acesso e testes](GUIA_TESTES_GRUPO_VIVAMAIS.md) · [Relatório e evidências](evidencias/VALIDACAO_FOTOS_IA_E_TESTES_GRUPO.md).

As seções datadas abaixo preservam o histórico anterior. Para o estado atual, use os links acima.

# Entrada para a distribuição do grupo

**Homologação04/11:** portal e paciente HTTPS implantados; consultar [guia de acesso vigente](GUIA_TESTES_NUVEM.md). As instruções locais anteriores abaixo permanecem históricas. Fotos com upload/download e autorização aprovados remotamente; não compartilhar APK LAN como versão da nuvem.

Revisão04/11/2026. O APK Android local já foi testado pelo proprietário. A versão remota do grupo e o iPhone ainda dependem de infraestrutura/contas, conforme os guias abaixo. Nenhum integrante precisa configurar Java, Node, banco ou Codex para utilizar um instalador autônomo liberado.

- **Integrantes:** [instalar, entrar, testar medicamentos/offline e relatar erros](GUIA_TESTES_GRUPO_ANDROID_IOS.md).
- **Responsável técnico:** [ambientes, API HTTPS econômica, contas isoladas e convites](PLANO_DISTRIBUICAO_INTERNA_VIVAMAIS.md).
- **Builds e atualizações:** [Android privado, Development Build, TestFlight e EAS Update](GUIA_CONFIGURACAO_EXPO_EAS_TESTFLIGHT.md).
- **Proprietário fora de casa:** [o que é possível no iPhone, QR/Metro e bloqueios atuais](GUIA_EXPO_ACESSO_REMOTO_CELULAR.md).

Não compartilhar APK local como se tivesse backend público. Não enviar senhas ou convites ativos no Git/chat. Um convite do Viva+ autoriza o acesso individual ao ambiente sintético; ele não substitui o mecanismo de instalação/assinatura do Android ou da Apple. A liberação remota só estará concluída após instalador verificado, backend disponível e teste real por plataforma.
