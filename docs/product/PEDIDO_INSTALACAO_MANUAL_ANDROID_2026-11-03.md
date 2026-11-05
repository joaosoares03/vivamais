# VIVA+ — RETOMADA DA EXECUÇÃO INTERROMPIDA E FINALIZAÇÃO DO APLICATIVO

Quero que você retome imediatamente a última execução do Viva+, interrompida pelo limite de uso do Codex em 03/11/2026.

**CONTINUE EXATAMENTE DE ONDE PAROU. NÃO RECOMECE O PROJETO E NÃO REPITA DESNECESSARIAMENTE AS ETAPAS CONCLUÍDAS.**

Minha prioridade é concluir o desenvolvimento que ficou pendente, preservar todas as alterações e deixar o APK Android pronto para instalação e testes.

## 1. DIRETÓRIO DO PROJETO

Continue no diretório:

`C:\Users\joaos\Documents\Codex\2026-10-16\p\outputs\viva-mais-pr-1`

Antes de qualquer alteração:

1. Leia o histórico da última execução.
2. Execute `git status`.
3. Identifique a branch atual.
4. Confira as modificações não commitadas.
5. Inspecione os relatórios e logs existentes.
6. Identifique os processos locais que continuam funcionando.
7. Preserve todas as correções implementadas anteriormente.

**ATENÇÃO: NA ÚLTIMA EXECUÇÃO HAVIA 17 ARQUIVOS ALTERADOS, COM APROXIMADAMENTE 435 LINHAS ADICIONADAS E 41 REMOVIDAS.**

Não descarte essas alterações.

Entre os arquivos modificados estavam:

- `playwright.demonstracao.config.ts`
- `tests/e2e-demonstracao/finalizacao.spec.ts`
- `infra/Gerar-APK-Demonstracao.ps1`

Verifique também os outros arquivos modificados.

Não execute `git reset --hard`, `git clean` ou operações destrutivas.

## 2. O QUE JÁ FOI CONCLUÍDO

Na execução anterior, você informou que:

### Android

- O APK foi compilado com sucesso.
- O APK foi atualizado com as últimas correções de interface.
- A assinatura foi validada.
- O manifesto foi verificado.
- O alinhamento de memória foi validado.
- O build utiliza assinatura exclusiva de testes.
- O aplicativo foi preparado para Android arm64.
- O identificador utilizado foi `org.vivamais.academicdemo.local`.
- O arquivo tinha aproximadamente 97 MiB antes das últimas recompilações.

**O APK JÁ EXISTE. NÃO RECOMPILE DESNECESSARIAMENTE.**

Primeiro encontre o arquivo final, confirme sua integridade e verifique se ele inclui as últimas correções.

### Interface e acessibilidade

Foram corrigidos:

- Cartões que ultrapassavam a largura da tela em 320 px.
- Botões do histórico de atividades.
- Sobreposição de textos na navegação inferior.
- Problemas encontrados com fontes ampliadas.
- Inconsistências de datas.
- Problemas na navegação demonstrativa.

As correções foram verificadas visualmente.

### Portal profissional

Foram concluídos testes de:

- Exportação com 103 consultas.
- Paginação.
- Filtros por período.
- Retificação auditada.
- Preservação dos registros originais.
- Compartilhamento de orientações com o paciente.

Também foram geradas 25 capturas do portal em três larguras, sem problemas de excesso horizontal ou imagens quebradas nas verificações realizadas.

### Banco de dados

A restauração do banco foi validada até a migração V12.

Foram conferidos:

- Migrações.
- Contagens.
- RLS.
- Login.
- Isolamento dos pacientes.
- Recuperação de fotos.
- Integridade dos dados restaurados.

O banco original foi preservado.

### Testes

Passaram também os testes específicos relacionados a:

- Login demonstrativo.
- Saída da conta demonstrativa.
- Isolamento entre pacientes.
- Fila offline.
- OCR.
- Fotografias.
- Reconexão.
- Retificação do diário.
- Preservação dos valores originais.

Não repita essas verificações sem necessidade, mas execute testes de regressão pertinentes às alterações finais.

## 3. PRIMEIRA TAREFA — VERIFICAR O APK FINAL

Comece verificando o APK já gerado.

Quero que você:

1. Localize o APK final.
2. Confirme que o arquivo existe.
3. Verifique sua integridade.
4. Confira a assinatura.
5. Confira o identificador do aplicativo.
6. Confira a arquitetura suportada.
7. Confirme o tamanho.
8. Verifique a data de geração.
9. Confirme que contém as últimas correções.
10. Registre o caminho exato para que eu consiga instalar.

Se o APK estiver correto e atualizado, não gere outro desnecessariamente.

Caso precise recompilar, utilize o script já preparado:

`infra/Gerar-APK-Demonstracao.ps1`

Verifique seu funcionamento e preserve os ajustes já realizados no Android SDK, Gradle, Ninja e CMake.

## 4. SEGUNDA TAREFA — INSTALAÇÃO NO ANDROID

Na última execução, tentei conectar meu celular por USB.

Já informei que:

- Conectei o celular.
- Habilitei a depuração USB.
- Aceitei a autorização do computador.

Entretanto, o ADB retornou:

`ANDROID: autorizados=0; aguardando autorizacao=0`

O emulador também permaneceu offline.

**NÃO FIQUE PRESO INDEFINIDAMENTE À CONEXÃO ADB.**

Primeiro faça uma nova verificação não destrutiva.

Se o aparelho continuar sem ser detectado:

1. Registre o problema.
2. Oriente os testes necessários de driver, cabo, modo de transferência e depuração USB.
3. Não altere configurações globais do Windows sem autorização.
4. Prepare uma alternativa de instalação manual.

### Instalação manual

Quero um guia passo a passo para:

- Localizar o APK.
- Transferir o arquivo ao celular Android.
- Abrir o arquivo no aparelho.
- Autorizar a instalação, quando necessário.
- Instalar o aplicativo.
- Abrir o Viva+.
- Testar o login demonstrativo.
- Navegar pelas funcionalidades.

Verifique se o build contém todas as configurações necessárias para acessar a API fora do computador.

Lembre-se de que `127.0.0.1` no celular se refere ao próprio celular, e não ao computador.

Não deixe o APK depender de uma API inacessível sem documentar ou corrigir essa configuração.

Se for necessário utilizar um endereço local de rede, configure adequadamente o ambiente de testes e preserve as proteções de segurança.

Não exponha o backend publicamente ou habilite tráfego inseguro para produção.

## 5. TERCEIRA TAREFA — CONCLUIR TESTES VISUAIS

Retome a revisão visual exatamente do ponto anterior.

Você estava verificando arquivos em:

`docs/evidencias/finalizacao-2026-11-03/fonte-ampliada-320-final`

Conclua:

- Revisão com largura de 320 px.
- Revisão com fonte ampliada.
- Navegação inferior.
- Histórico de atividades.
- Formulários.
- Campos de data.
- Rolagem.
- Estados vazios.
- Mensagens de erro.
- Contraste.
- Botões.
- Alinhamento.
- Responsividade.

Verifique também as principais telas do portal profissional.

Não altere componentes visualmente corretos sem necessidade.

Corrija os problemas efetivamente identificados.

## 6. QUARTA TAREFA — REVISAR SERVIÇOS LOCAIS

Na última execução:

- A API estava funcionando.
- O aplicativo estava funcionando.
- O portal profissional deixou de responder em alguns momentos.

Para iniciar o portal, foi utilizado:

`& "C:\Users\joaos\Documents\Codex\2026-10-16\p\outputs\viva-mais-pr-1\infra\executar-local.ps1" -Servico Portal -Producao -NaoInterativo`

Antes de pedir que eu execute novamente esse comando, confira se a porta 3000 está respondendo.

Se o portal estiver disponível, continue os testes.

Se estiver indisponível e sua execução for bloqueada pelas permissões da sandbox, apresente somente o comando necessário e prossiga com as tarefas independentes.

Não reinicie PostgreSQL ou API desnecessariamente.

## 7. QUINTA TAREFA — FECHAR A REGRESSÃO

Confira os testes que já passaram e identifique quais precisam ser repetidos depois das últimas alterações.

Priorize:

- Login demonstrativo sem SMS.
- Bloqueio do login simplificado em produção.
- Datas.
- Navegação.
- Histórico.
- Diário.
- Exportação.
- Retificação.
- OCR.
- Fotografias.
- Offline.
- Reconexão.
- Isolamento entre pacientes.
- Persistência.
- Acessibilidade.
- Android.

Execute os testes necessários e registre os resultados.

Não afirme que câmera, notificações e persistência nativa foram aprovadas se não houve teste em dispositivo ou emulador funcional.

A auditoria Java já havia passado anteriormente, com 42 dependências analisadas e nenhum alerta reportado. Reexecute-a apenas se alterações posteriores justificarem uma nova verificação.

## 8. SEXTA TAREFA — FINALIZAR A DOCUMENTAÇÃO

Na última execução, você estava revisando:

- `docs/STATUS.md`
- `docs/PROXIMA_EXECUCAO.md`
- `docs/INVENTARIO_TELAS.md`
- `docs/ARQUITETURA_BANCO_DADOS.md`
- `docs/CATALOGO_API_E_ROTAS.md`

Continue essa atualização.

Documente:

1. Correções realizadas.
2. APK gerado.
3. Localização do APK.
4. Instruções de instalação.
5. Testes executados.
6. Resultado dos testes.
7. Validação da restauração V12.
8. Estado do funcionamento offline.
9. Correções de acessibilidade.
10. Situação do ADB.
11. Limitações dos testes nativos.
12. Pendências externas.
13. Próximas tarefas.

Atualize o guia de publicação Android e iOS.

Lembre-se de que ainda não possuo contas Expo/EAS nem Apple Developer.

Não repita perguntas sobre essas contas.

Prepare tudo o que puder sem depender delas.

## 9. SÉTIMA TAREFA — PENDÊNCIAS RESTANTES

Depois de concluir o APK e os testes finais, consulte o inventário completo de pendências.

Continue corrigindo problemas técnicos viáveis.

Priorize:

- Erros de navegação.
- Campos de data.
- Acessibilidade.
- Persistência.
- Offline.
- Exportações.
- Integridade dos dados.
- Segurança.
- Responsividade.
- Preparação para builds e distribuição.

Não invente integrações externas.

SMS real, IA homologada e pulseira física continuam dependendo dos respectivos fornecedores, dados técnicos ou aprovações.

Mantenha o modo demonstrativo separado do uso com pacientes reais.

## 10. PRESERVAÇÃO DO GIT

Antes de finalizar, confira o status do Git.

Não faça merge automático do PR #1.

Não utilize force push.

Não descarte alterações.

Não apague dados.

Não modifique migrações aplicadas.

Não publique credenciais.

Não publique o aplicativo em produção automaticamente.

O objetivo desta execução é concluir e validar o trabalho existente.

Se houver alterações prontas para versionamento, apresente o conjunto de arquivos, o estado dos testes e a branch de destino antes de realizar um push.

## 11. ENTREGA FINAL

Quero receber um relatório contendo:

**APK Android**
- Caminho completo.
- Tamanho.
- Identificador.
- Arquitetura.
- Assinatura.
- Resultado de validação.
- Passo a passo de instalação manual.

**Interface**
- Telas revisadas.
- Correções concluídas.
- Capturas finais.
- Resultado dos testes de acessibilidade.

**Funcionalidades**
- Login demonstrativo.
- Exportação.
- Retificação.
- Histórico.
- Diário.
- OCR.
- Offline.
- Persistência.

**Banco de dados**
- Estado das migrações.
- Resultado da restauração V12.
- Integridade dos dados.

**Testes**
- Quantidade de testes executados nesta retomada.
- Resultados.
- Falhas.
- Testes pendentes.
- Limitações de hardware.

**Publicação**
- Estado da preparação Android.
- Estado da preparação iOS.
- Pendências de contas.
- Pendências para Play Store e App Store.

**Git**
- Branch.
- Arquivos modificados.
- Commits existentes.
- Estado do PR.
- Alterações ainda não publicadas.

## INSTRUÇÃO FINAL

**RETOME A PARTIR DA ÚLTIMA EXECUÇÃO, SEM COMEÇAR DE NOVO.**

O APK já foi gerado, assinado e validado.

A restauração V12 foi aprovada.

As correções de acessibilidade foram aplicadas.

Os testes principais de exportação, retificação, offline e login demonstrativo passaram.

O último bloqueio identificado foi a ausência de detecção do celular pelo ADB e o emulador offline.

Quero que você:

**1. Confirme o APK final.**

**2. Prepare uma instalação manual no Android, sem depender do ADB.**

**3. Conclua a revisão visual e os testes finais.**

**4. Finalize a documentação técnica.**

**5. Resolva as pendências técnicas restantes que forem viáveis.**

**6. Apresente uma entrega utilizável, com instruções claras para eu testar o aplicativo no celular.**

Não encerre entregando apenas uma lista de pendências.

Continue efetivamente o desenvolvimento, preserve todo o trabalho realizado e finalize o máximo possível.

**COMECE AGORA PELA VERIFICAÇÃO DO APK EXISTENTE E PELO ESTADO DOS 17 ARQUIVOS ALTERADOS.**