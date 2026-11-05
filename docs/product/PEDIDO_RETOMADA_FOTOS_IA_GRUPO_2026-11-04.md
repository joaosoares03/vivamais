# VIVA+ — RETOMAR EXECUÇÃO INTERROMPIDA: FOTOGRAFIAS, IA ALIMENTAR E TESTES DO GRUPO

Quero que você retome imediatamente a última execução do Viva+, interrompida pelo limite de utilização do Codex.

**OS LIMITES DE USO JÁ FORAM REDEFINIDOS. PODE CONTINUAR O DESENVOLVIMENTO.**

Não reinicie o projeto, não descarte alterações e não refaça desnecessariamente atividades que já foram concluídas.

Quero que você continue exatamente do ponto em que parou, finalizando a implementação, os testes e a atualização do ambiente de homologação.

## 1. CONTEXTO DO PROJETO

Diretório local:

`C:\Users\joaos\Documents\Codex\2026-10-16\p\outputs\viva-mais-pr-1`

Repositório:

`https://github.com/joaosoares03/vivamais`

Infraestrutura:

- Railway: API e aplicativo web do paciente.
- Supabase: PostgreSQL e armazenamento privado.
- Vercel: portal profissional.
- GitHub: repositório.

Antes de começar:

1. Leia o histórico da última execução.
2. Consulte o estado atual do Git.
3. Identifique todos os arquivos modificados.
4. Verifique quais alterações já foram implementadas.
5. Confira os testes executados.
6. Consulte os logs.
7. Identifique o que ficou incompleto.
8. Preserve integralmente o trabalho anterior.

Não sobrescreva configurações da nuvem que já estejam funcionando.

## 2. PONTO EXATO DA INTERRUPÇÃO

A última execução identificou que o aplicativo rejeitava imagens antes do envio e que o backend também utilizava um limite de 2 MB.

Você iniciou a correção para:

- Aceitar fotografias originais maiores.
- Otimizar imagens automaticamente.
- Corrigir orientação.
- Preparar a fotografia antes do envio.
- Exibir uma prévia para o usuário.
- Enviar somente após clicar em "Salvar refeição".
- Permitir nova tentativa após falha.
- Reaproveitar um upload já realizado quando ocorrer falha apenas no registro da refeição.
- Preservar validações de segurança no backend.

**CONTINUE ESSA IMPLEMENTAÇÃO DO PONTO ATUAL.**

Os primeiros 11 testes Java relacionados às imagens passaram, incluindo redução de PNG acima de 2 MB, correção de orientação e rejeição de arquivos inválidos.

Esses resultados foram parciais. Ainda é necessário validar o fluxo completo.

## 3. PRIORIDADE MÁXIMA — FINALIZAR O ENVIO DE FOTOGRAFIAS

Quero que você conclua a correção de forma que fotografias comuns de iPhone e Android possam ser utilizadas sem compressão manual.

Verifique:

1. Seleção pela galeria.
2. Captura pela câmera.
3. JPEG.
4. PNG.
5. HEIC/HEIF, conforme suporte disponível.
6. Imagens originais acima de 2 MB.
7. Compressão automática.
8. Redimensionamento.
9. Orientação.
10. Pré-visualização.
11. Confirmação antes de salvar.
12. Indicador de envio.
13. Tratamento de falhas.
14. Tentativa de reenvio.
15. Persistência no PostgreSQL.
16. Upload para Supabase Storage.
17. Recuperação da imagem no histórico.
18. Consulta pelo profissional autorizado.
19. Isolamento entre pacientes.
20. Segurança do arquivo enviado.

Não aumente simplesmente o limite para um tamanho ilimitado.

Garanta que a imagem seja otimizada preservando qualidade suficiente para visualização e eventual processamento futuro.

Valide o conteúdo no servidor, independentemente da extensão ou do MIME informado pelo cliente.

Evite armazenar metadados de localização desnecessários.

### Resultado esperado

O paciente deverá:

1. Abrir Alimentação.
2. Tocar em Tirar foto ou Escolher da galeria.
3. Selecionar a imagem.
4. Visualizar uma prévia.
5. Informar uma observação, se desejar.
6. Tocar em Salvar refeição.
7. Receber confirmação.
8. Encontrar a fotografia em Minhas refeições.

A imagem deverá continuar disponível após atualizar a página ou entrar novamente.

Quero que você valide isso no ambiente real de homologação, não apenas por testes unitários.

## 4. MELHORAR A INTERFACE DE ALIMENTAÇÃO

A tela anterior apresentava textos extensos e mensagens técnicas relacionadas ao limite de 2 MB.

Simplifique a experiência.

Quero:

- Botões claros.
- Prévia da imagem.
- Opção de substituir.
- Opção de remover.
- Campo de observação.
- Botão Salvar refeição.
- Feedback de carregamento.
- Confirmação de sucesso.
- Mensagens de erro compreensíveis.

A interface deve ser adequada a pacientes idosos.

Evite que o usuário precise compreender formatos de arquivo ou limites técnicos.

Não remova informações de segurança ou alertas relevantes; apresente-os de maneira simples e proporcional.

## 5. INTELIGÊNCIA ARTIFICIAL — ESTADO JÁ IDENTIFICADO

Na última execução, você confirmou no Supabase que:

**NENHUMA CHAMADA À IA ALIMENTAR HAVIA SIDO REALIZADA.**

A IA alimentar está desabilitada na homologação.

Você também informou que a integração existente é opcional e depende de:

- Provedor.
- Credenciais.
- Critérios aprovados.

Portanto, não repita uma investigação extensa sem necessidade.

Continue a implementação que estava realizando para apresentar corretamente o estado:

**"Análise não habilitada".**

Não mostre resultados simulados como análises reais.

Não sugira que a fotografia foi avaliada por inteligência artificial quando apenas foi armazenada.

### Documentação da IA

Registre:

- O que já existe no código.
- Endpoints.
- Serviços.
- Contratos.
- Processamento previsto.
- Provedores compatíveis, se identificados.
- Configurações necessárias.
- Limitações.
- Custos ainda não autorizados.
- Critérios de validação pendentes.
- O que falta para habilitar a integração.

Não contrate um provedor ou ative serviços pagos sem minha autorização.

Não invente resultados nutricionais ou orientações clínicas a partir da imagem.

## 6. PRIORIDADE ALTA — FINALIZAR OS CONVITES DO GRUPO

Na última execução, você iniciou a implementação de convites para os profissionais de saúde fictícios do grupo.

Foram previstos:

- Convites individuais.
- Senha individual.
- Prazo de validade.
- Revogação.
- Ausência de permissões administrativas.
- Gestão restrita ao responsável pela homologação.

Quero que você finalize essa implementação.

### Convites profissionais

Verifique:

1. Criação do convite.
2. Associação ao perfil profissional de teste.
3. Prazo de validade.
4. Uso único quando aplicável.
5. Definição segura de credenciais.
6. Login individual.
7. Revogação.
8. Bloqueio de convites expirados.
9. Permissões restritas.
10. Isolamento dos registros.
11. Auditoria de acesso.

### Convites para pacientes

Revise e conclua o fluxo existente de convite de pacientes para homologação.

O paciente deverá conseguir testar o aplicativo utilizando dados fictícios, sem acessar informações de outros participantes.

Não exponha publicamente o modo local de login baseado somente em CPF e nascimento.

Preserve os controles de segurança definidos para o ambiente compartilhado.

## 7. DISPONIBILIZAR AS DUAS VERSÕES PARA O GRUPO

Quero que os integrantes consigam testar:

**VIVA+ PACIENTE**

E

**VIVA+ PROFISSIONAL**

### Paciente

Verifique o aplicativo web hospedado na Railway.

Teste:

- Login.
- Home.
- Medicamentos.
- Pressão.
- Alimentação.
- Fotografias.
- Exercícios.
- Histórico.
- Diário.
- Consultas.
- Perfil.

### Profissional

Verifique o portal hospedado na Vercel.

Teste:

- Login.
- Dashboard.
- Cadastro de pacientes fictícios.
- Busca.
- Ficha.
- Medicamentos.
- Consultas.
- Histórico.
- Relatórios.
- Configurações.
- Gestão de convites.

Ambas as versões devem utilizar o ambiente de homologação correto e possuir controle de acesso.

Não publique dados reais.

### Links

Ao concluir, apresente os endereços HTTPS reais e confirme que estão respondendo.

Não invente links nem declare deploy concluído sem verificação.

## 8. GESTÃO DOS TESTADORES

Quero uma maneira simples de convidar os integrantes.

Se ainda não estiver concluída, implemente uma interface administrativa restrita para:

- Adicionar testador.
- Selecionar perfil.
- Gerar convite.
- Consultar status.
- Revogar.
- Identificar expirados.
- Desativar participante.

Preserve a segurança.

Não permita que qualquer usuário crie contas profissionais privilegiadas.

Não exponha senhas ou tokens em logs.

## 9. VALIDAÇÃO TÉCNICA

Após concluir as alterações, execute as verificações necessárias.

### Backend

- Testes Java.
- PostgreSQL.
- Migrações Flyway.
- Upload.
- Processamento de imagens.
- Convites.
- Autenticação.
- Autorização.
- Isolamento de dados.

### Frontend

- Testes do aplicativo.
- Testes do portal.
- TypeScript.
- Lint.
- Build Next.
- Expo.
- Testes E2E.

### Homologação

- API Railway.
- PostgreSQL Supabase.
- Storage privado.
- Portal Vercel.
- Aplicativo web.
- Links.
- Autenticação.
- Upload.
- Histórico.
- Convites.

Valide de preferência o fluxo real com imagens de teste maiores que 2 MB.

Não declare testes em iPhone ou Android físico aprovados sem evidência.

Se uma verificação depender de interação manual no meu computador, informe o comando exato e continue as demais tarefas independentes.

## 10. PUBLICAÇÃO DAS CORREÇÕES

Quando os testes estiverem aprovados:

1. Verifique a branch atual.
2. Confira o PR #1.
3. Revise as alterações locais.
4. Verifique segredos.
5. Prepare commits coerentes, se necessário.
6. Atualize os ambientes de homologação autorizados.
7. Verifique os deploys.
8. Confirme a versão publicada.
9. Execute testes de fumaça após a implantação.

Não faça force push.

Não faça merge automático do PR #1.

Não implante em produção.

Não publique credenciais.

Antes de utilizar qualquer serviço pago, informe o custo e solicite autorização.

## 11. DOCUMENTAÇÃO

Atualize:

- `README.md`
- `PROGRESSO.md`
- `STATUS.md`
- `PROXIMA_EXECUCAO.md`
- Documentação de armazenamento.
- Documentação de IA alimentar.
- Documentação de autenticação.
- Guias de testes.
- Guias de homologação.
- Guias de distribuição do grupo.

Crie ou atualize:

`docs/evidencias/VALIDACAO_FOTOS_IA_E_TESTES_GRUPO.md`

Documente:

- Causa original do erro de 2 MB.
- Alterações realizadas.
- Formatos suportados.
- Compressão e conversão.
- Resultados dos testes.
- Integração com Storage.
- Estado real da IA.
- Convites profissionais.
- Convites de pacientes.
- Links de homologação.
- Pendências externas.

Não inclua credenciais ou dados pessoais.

## 12. PRESERVAÇÃO

- Não reinicie o Viva+.
- Não descarte alterações locais.
- Não apague dados.
- Não modifique migrações já aplicadas.
- Não exponha o PostgreSQL.
- Não torne o Storage público.
- Não enfraqueça a autenticação.
- Não publique a demonstração insegura.
- Não invente IA ativa.
- Não gere resultados clínicos sem validação.
- Não faça merge automático.
- Não utilize force push.
- Não contrate serviços pagos sem autorização.

## 13. RESULTADO FINAL ESPERADO

Ao concluir, quero receber:

### Fotografias

- Correção finalizada.
- Formatos aceitos.
- Tamanho máximo original.
- Compressão automática.
- Resultado do upload real.
- Resultado da recuperação no histórico.
- Testes.

### IA alimentar

- Confirmação do estado atual.
- Mensagem exibida no aplicativo.
- O que existe na arquitetura.
- O que falta para ativar.
- Dependências externas.

### Testadores

- Como criar convites para pacientes.
- Como criar convites para profissionais.
- Como revogar.
- Como controlar o acesso.

### Versões disponíveis

- Link HTTPS do paciente.
- Link HTTPS do profissional.
- Resultado dos testes.
- Como compartilhar com os integrantes.

### Qualidade

- Testes executados.
- Problemas corrigidos.
- Arquivos alterados.
- Migrações.
- Estado do Git.
- Estado dos deploys.

## INSTRUÇÃO FINAL

**RETOME EXATAMENTE DO PONTO EM QUE PAROU.**

A última execução já identificou a causa do erro das fotos e iniciou a correção.

Os primeiros 11 testes Java passaram.

A IA alimentar foi confirmada como desabilitada, sem chamadas registradas.

A implementação de convites profissionais já foi iniciada.

Não repita esse trabalho desnecessariamente.

**PRIORIZE:**

1. Finalizar compressão, prévia e upload de fotografias.
2. Validar o funcionamento real com Supabase Storage.
3. Concluir a mensagem correta sobre IA alimentar.
4. Finalizar convites de profissionais e pacientes.
5. Disponibilizar as duas versões para os integrantes do grupo.
6. Executar testes.
7. Atualizar a homologação.
8. Documentar os resultados.

Quero poder enviar uma fotografia comum do iPhone, salvá-la e consultá-la posteriormente.

Também quero conseguir compartilhar o Viva+ com meus colegas para que cada um teste as versões profissional e paciente com segurança.

Estou disponível para executar comandos no PowerShell ou realizar configurações manuais, caso necessário.

**NÃO ENCERRE APENAS COM DOCUMENTAÇÃO. CONTINUE IMPLEMENTANDO E VALIDANDO AS FUNCIONALIDADES.**

COMECE AGORA.