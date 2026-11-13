# Homologação e correções de fotografia/acessibilidade — 13/11/2026

Continuação da rodada iniciada em 12/11. O PR [#13](https://github.com/joaosoares03/vivamais/pull/13) foi integrado por João; a base desta entrega é `7a0e5b4d002db7322a76aa6b84e5f52071b4d750`, branch `lucas/homologacao-vinculo-20261112`. A consulta ao GitHub em 13/11 não encontrou mudança posterior nessa main.

**Ambientes efetivamente usados:** aplicativo web na Railway e portal na Vercel, com conta individual aberta por Lucas na interface. Somente dados e mídias sintéticos. A conta do portal tem papel **ADMIN**, na unidade de ensaio; isso não equivale a testar um PROFESSIONAL com vínculo limitado. Nenhuma senha, código, cookie ou chave faz parte das evidências.

## Resultado remoto

| Verificação | Resultado observado |
| --- | --- |
| Cadastro APP e ativação presencial | Paciente Sintética Aurora 1211 criada em 12/11; Lucas confirmou o formulário e emitiu código de seis números. Ativação e acesso por CPF/nascimento funcionaram. |
| Identificação e reabertura | Perfil do app corresponde à ficha criada. Recarregar preservou o acesso; após expiração, informar novamente CPF/nascimento recuperou a mesma conta sem novo código. |
| Validação de atividade | Formulário sem sentimento, duração zero e duração 1.441 recusados. Um autorrelato fictício de cinco minutos foi salvo. |
| Paciente → portal | Texto, duração, observação e horário `13/11/2026 01:24:38` apareceram no histórico do app e na ficha da Aurora no portal; ambos persistiram após recarga. |
| Cadastro pulseira/diário | Paciente Sintético Diário 1311 criado sem CPF/nascimento, com celular fictício. Nenhuma conta de app ou ativação foi oferecida para essa modalidade. |
| Perfil e aprovação clínica | Roteiro individual bloqueado, grupo não liberado e catálogo aguardando aprovação clínica da unidade. A aprovação não foi alterada. |
| Catálogo | Dez capas e trinta imagens de quadros/GIFs carregadas; dez vídeos com duração de 30 segundos, quadros disponíveis e sem erro informado pelo elemento de vídeo. Marcha sentada reproduzida integralmente; os demais não foram assistidos integralmente. |
| Registro após vídeo | Depois de consultar os dez materiais, o histórico continuou com um registro e cinco minutos. Assistir não registrou atividade. |
| Foto após pausa longa | Duas tentativas exibiram “Não foi possível enviar a foto privada”. Atualizar dados protegidos levou ao acesso; depois de reentrar, a mesma imagem foi salva. A prévia foi mantida durante as duas falhas de envio. |
| Refeição persistida e privada | Uma refeição sintética foi salva, permaneceu após recarga e foi visualizada pela administração no portal, com o mesmo horário e observação. |
| IA alimentar | Desabilitada nas duas interfaces; botão de análise indisponível, sem semáforo nem quantificação de sódio/calorias. |
| OCR legível | Visor sintético transcrito como 118/76, pulso 71; abriu revisão obrigatória. O agente saiu sem salvar pressão. |
| OCR sem números | Exibiu “OCR indisponível neste ambiente. Digite os valores ou tente novamente depois.” Não sugeriu números nem abriu confirmação. A razão técnica desse estado não foi confirmada por logs do servidor. |
| Persistência de pressão | Históricos do app e portal permaneceram vazios após os dois ensaios de OCR. |
| Acessibilidade das escolhas | Seleção visual mudou, mas `aria-checked` estava ausente nas etapas de sentimento e conferência de pressão. Falha reproduzida no DOM e em teste com Pressable real do React Native Web. |
| Outros módulos | Medicamentos sem plano em sete dias, consultas sem registros e orientações sem conteúdo ficticiamente inferido. Lembretes explicam a dependência de app nativo; pulseira explica simulação e indisponibilidade do hardware real. Sem prescrição, agendamento ou envio de mensagens. |
| Fechamento da conta | Início exibiu uma refeição, uma atividade e nenhuma leitura de pressão. Configurações identificaram acesso por CPF, sem instruções de convite. |

Identificadores sintéticos: ficha APP `a560fbfe-4c06-4da6-8ef0-1415552f04bd`, ficha diário `7973276a-77ff-4b51-8585-16bfe4295202` e refeição `4a2cbac5-acf1-4ab5-8927-e81710b8207c`. A prova remota é de interface e navegação pela mesma ficha; não se declara captura de IDs do POST ou inspeção de banco remoto.

[Observações sanitizadas](homologacao-lucas-20261113/observacoes-remotas.json) · [Conferência dos dez materiais](homologacao-lucas-20261113/catalogo-midias.json).

## Correção 1 — fotografia no contexto da sessão

`FluxoFotografia` enviava multipart diretamente com `sessao.tokenAcesso`, fora de `requisicao`. Esse caminho não verificava validade, não renovava a sessão e convertia uma recusa de autenticação em mensagem genérica de foto. A pausa no seletor de arquivo não foi usada como medida de latência da API.

O envio agora usa o contexto de autenticação existente. O transporte aceita `FormData` sem serializar o arquivo ou fixar boundary; preserva o prazo de 60 segundos, a recusa de redirecionamento e a restrição de origem. JSON continua no formato anterior. Requisições ambíguas com JSON e formulário juntos são recusadas antes de transmitir dados.

Os erros de tamanho/formato permanecem específicos; falhas de rede mantêm a seleção. Um arquivo já enviado é reutilizado ao repetir somente a etapa de registro da refeição. O upload não passa a repetir POST automaticamente. OCR continua separado do salvamento de pressão e exige revisão humana.

**Limite do diagnóstico remoto:** não foi capturado o código HTTP da falha nem consultado log privado da Railway. A associação com expiração decorre do comportamento observado e do caminho de código, e foi reproduzida de forma controlada nos testes. Não se atribui toda falha de arquivo da nuvem a essa única causa.

## Correção 2 — estado marcado no navegador

`RoteiroAtividade` já usava `accessibilityState.checked` para o nativo. A versão instalada do adaptador web não transforma esse objeto em `aria-checked`; o DOM remoto mostrou o atributo ausente mesmo com a marca visual. Foi acrescentado `aria-checked` explícito, preservando o estado nativo e os bloqueios clínicos.

O teste usa o Pressable real de `react-native-web`, o contexto de atividade e os componentes do roteiro. Verifica mudança e exclusividade da opção marcada. O E2E de navegação existente também passou a conferir as duas etapas no build exportado, sem criar contas extras ou alterar limites de login.

## Validação local e CI

Na reprodução anterior às correções, a bateria nova teve **nove falhas e dois controles aprovados**: não são nove defeitos distintos. Após a correção, as regressões de fotografia, transporte, sessão e acessibilidade passaram. A primeira tentativa nem chegou a executar testes por recusa de leitura do compilador; a execução com o acesso autorizado resolveu essa limitação, sem mudança no produto.

O cadastro de diário sem CPF não era defeito: a hipótese foi descartada após sucesso na homologação e conferência do validador, que aceita vazio. Foram adicionadas regressões para essa modalidade, incluindo a recusa de CPF inválido quando preenchido.

**232 testes locais distintos aprovados:** 71 portal + 139 app + quatro da matriz de acesso + 18 E2E gerais. Os 17 novos já estão incluídos em portal/app; reexecuções não são somadas. Baterias de navegador sem retries, falhas, testes ignorados ou resultado instável. O E2E geral incluiu OCR real, upload/leitura de foto e as novas asserções de estado acessível no build exportado.

TypeScript, lint (incluindo o E2E alterado), build Next e exports Expo web seguro/convites aprovados. Os testes TSX agora fazem parte do typecheck. Auditoria JS de 13/11: zero críticos/altos, seis moderados e dois baixos; gate `high` aprovado, sem supressões. Nenhuma dependência foi atualizada nesta frente. APIs e servidores das baterias locais foram encerrados, e os schemas sintéticos foram preservados.

Gitleaks v8.30.1: zero achados no snapshot de 708 arquivos UTF-8 versionados/novos não ignorados; 822 binários fora desse escopo. Arquivos privados ignorados não foram incluídos. O scan inicial classificou um checksum da validação como chave genérica; o hash foi conferido contra a fonte e o JSON passou a separar `arquivo` e `sha256`, sem exceção ou supressão. O job de segredos da CI continua examinando o histórico.

[Resultados locais sanitizados](homologacao-lucas-20261113/validacao.json) · [IDs do compartilhamento na matriz local](homologacao-lucas-20261113/compartilhamento-local.json). Os checks do novo PR devem ser conferidos pelo SHA após a publicação; CI de outra entrega não é atribuída a esta correção.

API Java, POM, contratos, stack e migrations V1–V18 preservados. A API usada nos E2E é local, em schemas sintéticos separados, sem alterar o banco existente. O Java não foi reexecutado como bateria unitária local nesta frente; a CI existente continua responsável por verify/auditoria Java. Sem merge nem deploy pelo agente.

## Evidências visuais

- [Registro salvo no paciente](homologacao-lucas-20261113/atividade-paciente-salva.jpg).
- [Mesma atividade no portal após recarga](homologacao-lucas-20261113/atividade-portal-persistida.jpg).
- [Foto sintética consultada no portal](homologacao-lucas-20261113/refeicao-portal-autorizada.jpg).
- [Revisão obrigatória do OCR](homologacao-lucas-20261113/ocr-revisao-obrigatoria.jpg).
- [Roteiro bloqueado](homologacao-lucas-20261113/roteiro-bloqueado.jpg).
- [Histórico de pressão sem gravação automática](homologacao-lucas-20261113/pressao-sem-registro-automatico.jpg).

## Limites e continuidade

- O SHA efetivamente implantado de API/app e portal não foi confirmado. O app mostrou versão 0.2.0, build “—”. Base Git, merge e CI não são comprovante de deploy.
- A correção proposta foi validada localmente; estas capturas remotas mostram a versão que já estava implantada, incluindo as falhas. Não houve instalação da correção na Railway/Vercel pelo agente.
- Nenhum ensaio remoto com outro papel PROFESSIONAL limitado, outra unidade ou acesso anônimo à foto. Não foram concedidos vínculos à conta de outro participante. A cobertura de isolamento local/CI é evidência separada.
- Sem aparelho Android/iPhone, câmera, HEIC físico, leitor de tela real, notificações nativas, pulseira física ou novo APK/IPA. A verificação de acessibilidade nesta entrega cobre o DOM e a regressão automatizada.
- Não houve aprovação clínica, prescrição, análise alimentar externa ou uso de pessoas/dados reais. Os registros de teste permanecem na unidade para inspeção de João.

Após revisão e implantação pelo responsável, repetir na homologação a seleção de opções com leitor de tela e o envio após expiração/novo acesso. Registrar os SHAs implantados. O estado observado nesta rodada não deve ser apresentado como liberação clínica ou validação integral do sistema.
