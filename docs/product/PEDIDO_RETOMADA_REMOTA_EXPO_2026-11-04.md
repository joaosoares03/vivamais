# VIVA+ — RETOMAR EXECUÇÃO INTERROMPIDA, CONTINUAR SEM POWERSHELL MANUAL E PREPARAR ACESSO PELO EXPO

Quero que você retome IMEDIATAMENTE a última execução do projeto Viva+, que foi interrompida porque atingi o limite de utilização do Codex.

**ATENÇÃO: HOJE ESTAREI TRABALHANDO PRESENCIALMENTE E TEREI ACESSO SOMENTE AO MEU IPHONE.**

Não conseguirei abrir o PowerShell, executar comandos manualmente ou interagir diretamente com o Windows.

Preciso que você continue o desenvolvimento da forma mais autônoma possível, utilizando o ambiente remoto do Codex, sem interromper a execução para solicitar comandos manuais que eu não consigo realizar pelo celular.

Também quero que você priorize o acesso ao Viva+ pelo Expo e prepare uma forma de testar o aplicativo no meu iPhone e nos celulares dos integrantes do grupo.

## 1. DIRETÓRIO E ESTADO ATUAL

Projeto:

`C:\Users\joaos\Documents\Codex\2026-10-16\p\outputs\viva-mais-pr-1`

Repositório:

`https://github.com/joaosoares03/vivamais`

A última execução modificou aproximadamente:

- 66 arquivos.
- 1.267 linhas adicionadas.
- 76 linhas removidas.

Essas alterações ainda precisam ser preservadas e verificadas.

Antes de começar:

1. Confirme que consegue acessar o diretório local por meio do ambiente remoto.
2. Execute `git status`.
3. Identifique a branch atual.
4. Verifique as alterações não commitadas.
5. Consulte os logs anteriores.
6. Confira os testes já concluídos.
7. Identifique os processos que continuam ativos.
8. Continue exatamente de onde parou.

**NÃO DESCARTE AS 66 ALTERAÇÕES E NÃO REINICIE O PROJETO.**

Se o computador remoto estiver indisponível, informe o bloqueio. Não crie uma cópia independente na nuvem presumindo que ela contém essas alterações locais.

## 2. ÚLTIMO PONTO DA EXECUÇÃO

Na última execução, você estava finalizando:

- Correção do login demonstrativo.
- Remoção da ativação por SMS para pacientes fictícios.
- Reformulação do módulo de medicamentos.
- Agenda diária e por período.
- Histórico de doses.
- Controle de dosagem e horários.
- Preservação do histórico quando o profissional altera um plano.
- Integração com a fila offline.
- Convites privados para integrantes do grupo.
- Testes Java.
- Build Next.js.
- Exportação Expo.
- Preparação da distribuição Android e iOS.

A execução foi interrompida durante a resolução de uma falha da exportação Expo.

**O erro mais recente envolvia a gravação de um arquivo temporário pelo compilador Hermes.**

Você informou que utilizaria uma pasta de trabalho gravável, já conhecida pelo projeto, para corrigir esse problema.

É exatamente desse ponto que quero que continue.

## 3. RESULTADOS QUE JÁ FORAM CONFIRMADOS

### Backend Java

Eu executei anteriormente:

`& "C:\Users\joaos\Documents\Codex\2026-10-16\p\work\Validar-Grupo-Java.ps1" -Completo`

O resultado final foi:

**VALIDAÇÃO JAVA APROVADA.**

Você confirmou:

- 116 testes Java aprovados.
- Testes com PostgreSQL.
- Autenticação.
- Concorrência de doses.
- Convites privados.
- Correções de autorização.
- Isolamento de dados.

O relatório privado foi armazenado em:

`work/grupo-api-build`

Não houve commit, push ou deploy.

**NÃO PEÇA PARA EU EXECUTAR NOVAMENTE ESSE COMANDO.**

Esses testes já foram aprovados após as correções.

### Frontend

Você também informou:

- 45 testes aprovados no portal.
- 72 testes aprovados no aplicativo.
- Build Next.js aprovado.
- API compilada com sucesso.

Não repita essas suítes desnecessariamente.

Execute novos testes somente quando forem necessários para validar alterações adicionais.

## 4. PRIORIDADE MÁXIMA — CORRIGIR A EXPORTAÇÃO EXPO

A última falha ocorreu ao gravar um arquivo temporário do Hermes.

Quero que você:

1. Localize o erro completo nos logs.
2. Identifique qual diretório estava bloqueado.
3. Verifique as permissões do ambiente.
4. Utilize uma pasta temporária gravável dentro da área autorizada.
5. Ajuste as variáveis de ambiente temporárias necessárias, sem modificar configurações globais do Windows.
6. Preserve o cache e os arquivos existentes.
7. Repita a exportação Expo.
8. Verifique Android e iOS quando aplicável.
9. Confirme que os bundles foram gerados corretamente.

Não desabilite o Hermes ou remova recursos nativos apenas para esconder o problema.

Se a falha estiver relacionada à sandbox, utilize alternativas autorizadas e seguras.

Se não houver solução possível sem uma aprovação externa, registre o bloqueio e continue as demais tarefas.

## 5. NÃO TEREI ACESSO AO POWERSHELL

Esta é uma condição importante para toda a execução.

**ESTOU UTILIZANDO SOMENTE O IPHONE.**

Portanto:

- Não peça para eu abrir um terminal.
- Não peça para eu executar scripts PowerShell.
- Não peça para eu reiniciar serviços manualmente.
- Não peça para eu copiar logs do Windows.
- Não peça para eu configurar variáveis de ambiente manualmente.
- Não interrompa o desenvolvimento apenas porque um comando necessita ser executado fora da sandbox.

Primeiro tente executar as operações diretamente pelo ambiente remoto do Codex, dentro das permissões disponíveis.

Se a execução direta não for permitida, verifique alternativas seguras e autorizadas.

Não tente contornar mecanismos de segurança ou aprovação do ambiente.

Se uma ação realmente depender de mim, registre:

1. Qual comando ou ação está pendente.
2. Por que ela não pode ser realizada pelo Codex.
3. Qual será o resultado esperado.
4. Se a ação poderá ser executada posteriormente.
5. Quais outras tarefas podem continuar enquanto isso.

**NÃO QUERO QUE TODA A EXECUÇÃO SEJA INTERROMPIDA POR UMA ÚNICA DEPENDÊNCIA DO POWERSHELL.**

Continue desenvolvendo tudo que não depender dessa ação.

## 6. VERIFICAR O LOGIN DEMONSTRATIVO

Na última execução, você corrigiu o problema de ativação por SMS.

Quero que confirme que o fluxo funciona integralmente.

### Portal profissional

O profissional cadastra um paciente fictício e o sistema confirma o cadastro.

No modo demonstrativo, não devem aparecer:

- Solicitar código SMS.
- Ativar ou recuperar acesso.
- Senha profissional para emissão de código.
- Código de quatro dígitos.
- Mensagens de ativação pendente.

### Aplicativo do paciente

O paciente demonstrativo informa:

- CPF.
- Data de nascimento.

E acessa diretamente a Home, sem SMS.

Verifique o fluxo completo e preserve a separação entre demonstração local e autenticação segura para dados reais.

O login somente por CPF e nascimento não pode ser disponibilizado como autenticação pública para informações reais de saúde.

## 7. CONCLUIR O MÓDULO DE MEDICAMENTOS

Você já implementou:

- Agenda de medicamentos por período.
- Resumo diário.
- Histórico.
- Dosagem cadastrada.
- Horário efetivo dos registros.
- Prevenção de doses duplicadas.
- Preservação dos planos anteriores.
- Integração com a fila offline.

Agora quero que finalize a experiência do usuário.

Verifique:

1. Tela Meus medicamentos.
2. Resumo das doses do dia.
3. Barra de progresso.
4. Próximo horário.
5. Cards interativos.
6. Botão "Tomei este medicamento".
7. Registro de dose não tomada.
8. Calendário.
9. Histórico por período.
10. Feedback visual.
11. Persistência no PostgreSQL.
12. Sincronização offline.
13. Acessibilidade.
14. Telas pequenas.
15. Fontes ampliadas.

Garanta que os dados exibidos correspondam aos registros persistidos.

Não utilize informações fixas ou simuladas como se fossem dados reais.

Não invente prescrições ou recomendações clínicas.

## 8. FINALIZAR OS CONVITES PRIVADOS DO GRUPO

Na última execução, você implementou:

- Convites individuais.
- Prazo de validade.
- Revogação.
- Controle de autorização.

Quero que conclua a integração dessas funcionalidades.

O objetivo é permitir que meus colegas da faculdade testem o Viva+ de maneira controlada.

Verifique:

- Criação de convites.
- Validade.
- Revogação.
- Uso individual.
- Proteção contra acesso indevido.
- Isolamento entre participantes.
- Tratamento de convites inválidos.
- Interface de gerenciamento.
- Testes.

Os convites devem controlar o acesso ao ambiente de testes, sem eliminar a autenticação segura necessária para acessar informações protegidas.

Não publique tokens ou convites ativos em logs e documentos públicos.

## 9. PRIORIDADE ALTA — QUERO ACESSO AO EXPO PELO CELULAR

Preciso conseguir acompanhar o aplicativo Viva+ pelo meu iPhone enquanto estiver trabalhando presencialmente.

Quero utilizar o Expo sempre que tecnicamente possível.

### 9.1. Verificar Expo Go

Analise se o Viva+ consegue executar no Expo Go.

Verifique a compatibilidade das bibliotecas nativas, principalmente:

- SQLCipher.
- Armazenamento protegido.
- Câmera.
- Notificações.
- Outros módulos nativos.

Se o Expo Go não for compatível, não remova funcionalidades importantes para forçar a execução.

### 9.2. Expo Development Build

Prepare o projeto para utilizar Expo Development Builds.

Verifique:

- `expo-dev-client`.
- Configuração Metro.
- Perfis de desenvolvimento.
- Identificadores.
- Dependências nativas.
- Variáveis de ambiente.
- API.
- Configurações Android e iOS.

O Android já funcionou anteriormente no meu celular.

**NÃO RECOMECE A INVESTIGAÇÃO DO ADB.**

Quero aproveitar o que já foi validado.

### 9.3. QR Code

Quero uma forma simples de acessar o projeto:

1. Você inicia o servidor de desenvolvimento, quando o ambiente permitir.
2. O Expo gera um QR Code ou endereço de desenvolvimento.
3. Eu abro o aplicativo correspondente no iPhone.
4. Consigo testar as alterações disponíveis.

Mas observe:

**ESTAREI FORA DE CASA, EM OUTRA REDE.**

Portanto, uma conexão que funciona somente na rede Wi-Fi doméstica não será suficiente.

Analise o uso de Expo Tunnel ou outra solução apropriada para o transporte do bundle de desenvolvimento.

Não exponha credenciais, informações clínicas ou endpoints inseguros na internet.

O túnel do Expo não resolve automaticamente a conectividade do backend. Verifique separadamente como o aplicativo acessará a API.

### 9.4. iPhone

Quero que você prepare tudo que for possível para testar em iPhone.

Ainda não possuo Apple Developer configurado.

Portanto:

- Verifique alternativas tecnicamente viáveis sem essa conta.
- Prepare as configurações iOS.
- Documente as dependências de assinatura.
- Prepare o processo futuro de EAS Build e TestFlight.
- Não afirme que um IPA está disponível sem build assinado.
- Não me peça senhas ou certificados pelo chat.

Se a instalação nativa ainda estiver bloqueada, apresente uma alternativa honesta para testar as telas no iPhone, como uma prévia web móvel, identificando claramente as limitações nativas.

## 10. TESTES DO GRUPO EM ANDROID E IPHONE

Além do meu acesso pessoal, quero preparar a distribuição do Viva+ para os integrantes do grupo.

Os colegas não devem precisar instalar:

- Java.
- Node.js.
- PostgreSQL.
- Android Studio.
- Codex.

Prepare a estrutura necessária para uma futura distribuição simples:

**Android:** APK privado ou distribuição interna.

**iPhone:** TestFlight ou outro mecanismo de distribuição autorizado pela Apple, quando houver conta e assinatura.

**Atualizações:** EAS Update quando compatível com o runtime nativo.

**Backend:** ambiente de homologação compartilhado e seguro.

Não apresente um link do Metro local como se fosse uma versão autônoma para todos os integrantes.

Não declare distribuição concluída sem um build instalável e um backend acessível.

Se faltarem contas ou hospedagem, documente a dependência e continue preparando os demais recursos.

## 11. VERIFICAR O FUNCIONAMENTO DO BACKEND

Quero que você analise se os serviços locais estão disponíveis.

Verifique:

- PostgreSQL.
- API Spring Boot.
- Portal Next.js.
- Expo/Metro.
- Portas utilizadas.
- Conectividade.

Se puder iniciar os serviços diretamente pelo ambiente autorizado, faça isso.

Se algum serviço estiver bloqueado pelas permissões, não tente burlar a restrição.

Continue os testes que não dependam dele e documente as validações pendentes.

Não modifique o banco principal de forma destrutiva.

## 12. TESTES FINAIS

Execute os testes necessários para confirmar as últimas alterações:

- Java.
- PostgreSQL.
- Frontend.
- E2E.
- TypeScript.
- Lint.
- Build Next.js.
- Export Expo.
- Medicamentos.
- Offline.
- Convites.
- Login demonstrativo.
- Isolamento de dados.

Preserve os resultados anteriores como evidência histórica, mas não considere automaticamente aprovadas as alterações realizadas depois desses testes.

Diferencie testes executados localmente, testes em navegador e testes em aparelhos físicos.

## 13. DOCUMENTAÇÃO

Atualize:

- `README.md`
- `PROGRESSO.md`
- `STATUS.md`
- `PROXIMA_EXECUCAO.md`
- Guias de testes.
- Documentação de autenticação.
- Documentação de medicamentos.
- Documentação de convites.
- Guia Expo.
- Guia Android/iOS.
- Levantamento de pendências.

Crie ou atualize:

`docs/GUIA_EXPO_ACESSO_REMOTO_CELULAR.md`

`docs/GUIA_DISTRIBUICAO_TESTES_GRUPO.md`

Esses documentos devem explicar:

- Como iniciar o Expo.
- Como utilizar o QR Code.
- Como testar em outra rede.
- Como configurar a API.
- Como preparar a Development Build.
- Como distribuir versões.
- Como instalar no Android.
- O que falta para instalar no iPhone.
- Como receber atualizações.
- Como testar medicamentos.
- Como informar erros.

Não inclua credenciais nem informações privadas.

## 14. PRESERVAÇÃO DO PROJETO

- Não reinicie o Viva+ do zero.
- Não descarte alterações.
- Não apague as modificações dos 66 arquivos.
- Não execute `git reset --hard`.
- Não execute `git clean`.
- Não modifique migrações aplicadas.
- Não apague dados.
- Não faça merge automático.
- Não execute push sem revisão e autorização.
- Não exponha segredos.
- Não publique uma demonstração insegura para pacientes reais.
- Não desabilite controles de segurança apenas para conseguir um build aprovado.

## 15. RESULTADO QUE QUERO RECEBER PELO CELULAR

Ao finalizar, apresente um resumo organizado que eu consiga consultar no iPhone.

Informe:

### Desenvolvimento
- O que foi retomado.
- Quais erros foram corrigidos.
- Quais funcionalidades foram concluídas.
- Quais arquivos foram modificados.

### Medicamentos
- Funcionalidades concluídas.
- Testes.
- Capturas das telas.
- Pendências.

### Login
- Confirmação do acesso demonstrativo sem SMS.
- Testes realizados.
- Segurança preservada.

### Expo
- Resultado da correção do Hermes.
- Resultado da exportação.
- Se o Metro está disponível.
- Se existe QR Code funcional.
- Se existe acesso remoto pelo iPhone.
- Qual aplicativo preciso instalar.
- Qual link ou instrução devo utilizar.

### Android
- Estado do APK.
- Caminho do arquivo.
- Disponibilidade para testes do grupo.

### iPhone
- Estado da preparação iOS.
- Possibilidade de Expo Go.
- Necessidade de Development Build.
- Dependências de Apple Developer.
- O que já pode ser testado.

### Grupo
- Convites.
- Controle de acesso.
- Distribuição.
- Dependências de hospedagem.

### Testes
- Resultados das suítes.
- Falhas.
- Bloqueios.

### Git
- Branch atual.
- Alterações não commitadas.
- Estado da publicação.

---

# INSTRUÇÃO FINAL — MUITO IMPORTANTE

**ESTOU FORA DE CASA E SÓ TENHO ACESSO AO IPHONE.**

Quero que você continue trabalhando no Viva+ pelo ambiente remoto, sem exigir minha presença no computador.

Retome exatamente da falha da exportação Expo relacionada ao Hermes.

Os 116 testes Java já passaram.

Os 45 testes do portal e os 72 testes do aplicativo já passaram.

O build Next.js já passou.

O login demonstrativo e a agenda de medicamentos já foram implementados e precisam de validação final.

Os convites privados para o grupo também foram implementados e precisam de conclusão.

**PRIORIZE NESTA ORDEM:**

1. Corrigir a exportação Expo.
2. Verificar o ambiente remoto e os serviços disponíveis.
3. Finalizar medicamentos.
4. Validar o login demonstrativo.
5. Concluir os convites do grupo.
6. Preparar o acesso Expo por QR Code no iPhone.
7. Preparar a distribuição Android/iOS.
8. Executar os testes necessários.
9. Atualizar a documentação.
10. Apresentar os resultados e eventuais bloqueios.

Se surgir uma tarefa que dependa exclusivamente de uma ação manual no Windows, registre-a, mas continue as demais atividades.

**NÃO ENCERRE TODA A EXECUÇÃO APENAS PORQUE EU NÃO POSSO ABRIR O POWERSHELL.**

Quero aproveitar o período em que estarei trabalhando presencialmente para continuar avançando no Viva+ e, se tecnicamente possível, conseguir acompanhar as novas telas pelo Expo no meu iPhone.

COMECE AGORA, PRESERVANDO TODAS AS ALTERAÇÕES EXISTENTES.