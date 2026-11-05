# VIVA+ — RETOMAR EXATAMENTE A EXECUÇÃO INTERROMPIDA E CONCLUIR AS ENTREGAS

Quero que você retome imediatamente o desenvolvimento do Viva+ a partir do ponto exato em que a última execução foi interrompida pelo limite de utilização do Codex.

**NÃO REINICIE O PROJETO. NÃO REFAÇA DESNECESSARIAMENTE OS TESTES JÁ CONCLUÍDOS. NÃO DESCARTE NENHUMA ALTERAÇÃO.**

Quero que você continue o trabalho pendente, finalize as correções, conclua os testes e priorize a geração do APK Android instalável.

## 1. DIRETÓRIO CORRETO

A última execução ocorreu em:

`C:\Users\joaos\Documents\Codex\2026-10-16\p\outputs\viva-mais-pr-1`

Utilize esse diretório como ponto de partida.

Não confunda esse diretório com a pasta principal anterior `viva-mais`.

Antes de alterar arquivos:

1. Confira a branch atual.
2. Execute `git status`.
3. Verifique modificações não commitadas.
4. Inspecione os arquivos alterados na última execução.
5. Consulte os logs e relatórios existentes.
6. Leia as instruções de `AGENTS.md` e a documentação de continuidade.
7. Identifique exatamente quais processos e testes foram interrompidos.

Preserve integralmente o trabalho já realizado.

## 2. ÚLTIMO PONTO DA EXECUÇÃO

A execução anterior terminou quando você precisava reiniciar o portal profissional para concluir:

- Teste da exportação de registros.
- Validação da retificação auditada.
- Capturas atualizadas.
- Regressão visual do portal.
- Testes finais de navegação.

Você solicitou que eu executasse:

`& "C:\Users\joaos\Documents\Codex\2026-10-16\p\outputs\viva-mais-pr-1\infra\executar-local.ps1" -Servico Portal -Producao -NaoInterativo`

**EU JÁ EXECUTEI ESSE COMANDO.**

O PowerShell confirmou:

- Next.js 16.4.2.
- Endereço `http://127.0.0.1:3000`.
- `Ready in 7.0s`.
- Inicialização concluída sem erro.

Portanto, primeiro verifique se o portal continua respondendo na porta 3000.

Se estiver disponível, continue imediatamente os testes.

Não peça novamente que eu inicie o portal sem antes verificar seu estado.

Se o processo tiver encerrado, explique o motivo e utilize o procedimento já validado.

## 3. TRABALHO JÁ REALIZADO

Durante a última execução, você implementou ou corrigiu:

### Login demonstrativo

- Acesso com CPF e data de nascimento.
- Sem SMS na demonstração.
- Ambiente isolado com dados fictícios.
- Bloqueio de ativação acidental em produção.
- Preservação do fluxo seguro para versões reais.

### Datas

- Remoção dos campos confusos de ISO com fuso.
- Padronização da entrada de data.
- Correções de conversão e apresentação.
- Testes dos componentes.

### Consultas

- Visualização das orientações pelo paciente.
- Consulta recente disponível no cache offline protegido.
- Correção de redirecionamento indevido ao restaurar a sessão.

### Histórico e registros

- Exportação paginada.
- Filtros por período.
- Autoria.
- Retificação auditada de anotações do diário e consultas.
- Controle de versões.
- Preservação dos registros originais.
- Proteção contra acesso de outras contas.

### Offline

- Correção da leitura do cache protegido.
- Ajustes na recuperação de conexão.
- Separação do cache Expo entre modo seguro e demonstrativo.

### Android

- Projeto Android nativo gerado.
- SQLCipher integrado.
- Android SDK instalado localmente na pasta de trabalho.
- Compilação Gradle iniciada.
- Correções para problemas de Ninja, CMake e caminhos longos no Windows.
- Utilização de assinatura exclusiva de testes.

Não repita essas implementações sem necessidade.

Verifique se as correções estão preservadas e continue do estado atual.

## 4. TESTES JÁ EXECUTADOS

Os resultados informados na execução anterior foram:

- **94 testes Java aprovados.**
- **101 testes frontend aprovados.**
- **17 testes E2E aprovados.**
- TypeScript aprovado.
- Lint aprovado.
- Build Next.js aprovado.
- Auditoria Java OWASP concluída externamente.

### Auditoria Java

Eu executei manualmente:

`& "C:\Users\joaos\Documents\Codex\2026-10-16\p\work\Validar-Seguranca-Finalizacao.ps1"`

O resultado foi:

- BUILD SUCCESS.
- 42 dependências Java analisadas.
- Nenhum alerta reportado.
- Bloqueio por CVSS igual ou superior a 7 preservado.
- Relatórios JSON e HTML gerados.
- Nenhum commit, push, merge ou deploy realizado.

Não solicite que eu execute novamente essa auditoria sem identificar uma mudança relevante nas dependências ou outra necessidade concreta.

Registre também a limitação do analisador Sonatype OSS Index, que estava desabilitado por falta de credenciais.

### Auditoria JavaScript

A última auditoria informou:

- Nenhuma vulnerabilidade alta.
- Nenhuma vulnerabilidade crítica.
- Cinco vulnerabilidades moderadas.
- Uma vulnerabilidade baixa.

Avalie as pendências restantes sem desabilitar verificações de segurança.

**Atenção:** esses resultados pertencem às execuções anteriores. Depois das últimas alterações, execute os testes adicionais necessários para confirmar que não houve regressão.

## 5. PRIORIDADE 1 — FINALIZAR OS TESTES DO PORTAL

Agora que o portal foi reiniciado, conclua a validação que ficou pendente.

Verifique:

1. Login profissional.
2. Dashboard.
3. Cadastro de pacientes.
4. Pesquisa e filtros.
5. Histórico do paciente.
6. Exportação paginada.
7. Exportação com filtros de período.
8. Autoria dos registros.
9. Retificação auditada.
10. Preservação de versões anteriores.
11. Consultas.
12. Diário.
13. Configurações.
14. Preferências.
15. Responsividade.

Teste principalmente as funcionalidades implementadas durante a última execução.

Se encontrar erros, corrija-os e repita os testes correspondentes.

Gere as capturas de tela que ficaram pendentes.

## 6. PRIORIDADE 2 — CONCLUIR O APK ANDROID

A compilação Android já havia avançado bastante.

Você instalou o Android SDK localmente, com minha autorização expressa, e corrigiu problemas relacionados a caminhos longos do Windows.

**QUERO QUE VOCÊ RETOME A COMPILAÇÃO DO PONTO EM QUE PAROU.**

Antes de reiniciar todo o processo:

1. Verifique o estado do Gradle.
2. Consulte os logs anteriores.
3. Identifique os caches preservados.
4. Verifique as alterações no Ninja e CMake.
5. Verifique os caminhos reduzidos.
6. Confirme a configuração de assinatura de testes.
7. Continue a compilação.

Se encontrar outra falha, identifique a causa real e implemente uma correção compatível com a arquitetura do projeto.

Não utilize assinatura de produção sem autorização.

Não altere configurações globais do Windows desnecessariamente.

### Resultado esperado

Quero um APK Android realmente instalável.

Ao concluir:

- Informe o caminho exato do APK.
- Confirme o tamanho do arquivo.
- Confirme o identificador do aplicativo.
- Confirme a assinatura de testes.
- Informe o tipo de build.
- Verifique se o APK é válido.
- Explique como instalar no meu celular.

Não considere um export JavaScript do Expo equivalente a um APK.

Se a compilação permanecer bloqueada, documente a causa exata, os logs relevantes, as tentativas realizadas e o próximo comando necessário.

## 7. PRIORIDADE 3 — TESTAR O LOGIN DEMONSTRATIVO

O login simplificado foi implementado exclusivamente para demonstrações com dados fictícios.

Quero que você valide:

- CPF.
- Data de nascimento.
- Botão Entrar.
- Acesso à Home.
- Persistência da sessão.
- Encerramento da sessão.
- Acesso aos módulos.
- Proteção contra acesso a dados de outros usuários.

Confirme que o código SMS não é solicitado no ambiente demonstrativo.

Entretanto, não permita que esse fluxo inseguro seja utilizado para acessar dados reais de saúde.

Mantenha bloqueios de produção e preserve o fluxo seguro de autenticação.

## 8. PRIORIDADE 4 — VALIDAR O FUNCIONAMENTO OFFLINE

Na última execução, você identificou que o aplicativo pausava a consulta antes de ler o cache protegido.

A correção já foi implementada.

Agora quero que você teste:

1. Consulta dos dados com internet.
2. Armazenamento no cache.
3. Desativação da internet.
4. Leitura offline.
5. Fechamento do aplicativo.
6. Reabertura.
7. Persistência do cache.
8. Reconexão.
9. Sincronização.
10. Tratamento de erros e conflitos.

Verifique que os dados permaneçam protegidos.

Se houver alguma limitação que somente possa ser validada em aparelho físico, documente claramente.

Não declare testes nativos aprovados utilizando apenas o navegador.

## 9. PRIORIDADE 5 — TERMINAR A REVISÃO VISUAL

Continue a revisão completa das telas.

Na última execução, você já percorreu 25 rotas do aplicativo em uma tela de 390 px e corrigiu problemas identificados.

Quero que você conclua:

- Capturas.
- Comparação visual.
- Ajustes de espaçamento.
- Navegação inferior.
- Botões.
- Campos.
- Responsividade.
- Datas.
- Mensagens.
- Estados vazios.
- Acessibilidade.
- Layout do portal.

Priorize uma experiência simples e clara para pacientes idosos.

Não reformule telas que já estejam corretas apenas por preferência estética.

Corrija problemas reais de usabilidade, consistência e acessibilidade.

## 10. PRIORIDADE 6 — PREPARAR ANDROID, IOS E LOJAS

Eu já informei anteriormente que ainda não possuo contas Expo/EAS nem Apple Developer.

**NÃO ME PERGUNTE NOVAMENTE SE POSSUO ESSAS CONTAS.**

Continue com tudo que puder ser preparado sem elas.

### Android

Priorize a geração local do APK de testes.

Prepare também a configuração necessária para um futuro AAB de distribuição.

### iOS

O ambiente principal é Windows.

Você já identificou que a geração nativa iOS local não está disponível nesse ambiente.

Portanto:

- Preserve as configurações iOS.
- Prepare as informações de bundle identifier.
- Revise permissões.
- Prepare ícones e splash screen.
- Documente a futura configuração EAS.
- Prepare os passos para Apple Developer.
- Prepare a distribuição TestFlight.

Não declare IPA gerado sem build real.

### Materiais das lojas

Finalize os materiais que não dependem de contas:

- Nome.
- Descrições.
- Capturas.
- Ícones.
- Identidade visual.
- Informações de versão.
- Instruções de teste.
- Política de privacidade em revisão.
- Orientações para publicação.

Não publique uma versão insegura para pacientes reais.

## 11. CONCLUIR AS PENDÊNCIAS RESTANTES

Depois de terminar as prioridades anteriores, consulte o levantamento geral de pendências.

Resolva as tarefas técnicas restantes que forem viáveis com os recursos disponíveis.

Não quero que você encerre a execução apenas porque:

- Falta uma conta Expo.
- Falta uma conta Apple.
- Não existe provedor de SMS.
- A pulseira física ainda não está pronta.
- A IA depende de fornecedor.
- Uma aprovação clínica depende de terceiros.

Essas pendências devem ser documentadas, mas não devem impedir a conclusão das outras funcionalidades independentes.

Priorize correções técnicas, estabilidade, testes, segurança e usabilidade.

Não invente integrações ou aprovações para classificar uma funcionalidade como concluída.

## 12. DOCUMENTAÇÃO

Atualize os documentos existentes conforme as alterações realmente concluídas.

Registre:

- Arquivos modificados.
- Correções.
- Testes.
- Resultados de auditoria.
- Estado da compilação Android.
- Estado da preparação iOS.
- Estado das telas.
- Funcionamento offline.
- Login demonstrativo.
- Exportações.
- Retificações.
- Pendências de infraestrutura.
- Dependências externas.

Atualize:

- `README.md`
- `PROGRESSO.md`
- `STATUS.md`
- `PROXIMA_EXECUCAO.md`
- Inventário de funcionalidades.
- Levantamento de pendências.
- Manuais de desenvolvimento.
- Guia de testes.
- Guia de publicação.

Crie um relatório consolidado da retomada, reutilizando documentos existentes quando possível.

Não gere dezenas de documentos duplicados.

## 13. GIT E PRESERVAÇÃO

Verifique o estado real da branch relacionada ao PR #1.

Não faça merge automático.

Não use force push.

Não descarte alterações locais.

Não execute `git reset --hard` nem `git clean`.

Não apague dados.

Não modifique migrações Flyway já aplicadas.

Não exponha credenciais.

Não publique serviços de produção sem autorização.

Não crie commits ou faça push apenas para atualizar relatórios de progresso; primeiro conclua o trabalho funcional e revise o conjunto de alterações.

Se houver necessidade de publicação, prepare a branch e o commit para revisão, respeitando o histórico do PR.

## 14. RESULTADO FINAL

Quero receber:

1. Resumo do que foi concluído nesta retomada.
2. Problemas encontrados e corrigidos.
3. Resultado final dos testes.
4. Resultado dos testes do portal.
5. Resultado da exportação e retificação.
6. Resultado do funcionamento offline.
7. Situação do login demonstrativo.
8. Situação da revisão visual.
9. Resultado da compilação Android.
10. Caminho do APK, caso gerado.
11. Instruções para instalar o aplicativo no Android.
12. Situação da preparação iOS.
13. Situação dos materiais das lojas.
14. Pendências externas que realmente permanecem.
15. Arquivos modificados.
16. Estado do Git e do PR #1.

## INSTRUÇÃO FINAL

**RETOME EXATAMENTE DE ONDE PAROU.**

O último ponto foi o reinício do portal profissional, que já confirmei com a mensagem `Ready`.

A auditoria Java também já foi concluída com sucesso fora da sandbox.

Portanto, não repita perguntas ou procedimentos já respondidos.

Continue imediatamente:

**1. Testes finais do portal → 2. APK Android → 3. Login demonstrativo → 4. Offline → 5. Revisão visual → 6. Preparação das lojas → 7. Documentação.**

Meu objetivo é finalizar o máximo possível do Viva+ nesta execução, principalmente receber um APK instalável e deixar todas as funcionalidades existentes corretamente testadas.

**NÃO FIQUE APENAS ANALISANDO OU DOCUMENTANDO. CONTINUE IMPLEMENTANDO, CORRIGINDO E VALIDANDO O PROJETO.**