# VIVA+ — CORRIGIR LOGIN DEMONSTRATIVO, REFORMULAR MEDICAMENTOS E DISTRIBUIR O APLICATIVO PARA ANDROID E IPHONE

Quero que você continue o desenvolvimento do Viva+ a partir do estado atual, preservando todas as alterações, correções, testes e builds existentes.

Nesta execução, tenho TRÊS PRIORIDADES PRINCIPAIS:

1. **Remover completamente a ativação por SMS do fluxo demonstrativo**, incluindo a tela de cadastro do portal profissional.
2. **Reformular o módulo de medicamentos**, deixando-o muito mais interativo, intuitivo, completo e acessível para pacientes idosos.
3. **Preparar o Viva+ para ser instalado e testado por todos os integrantes do meu grupo da faculdade, tanto em Android quanto em iPhone**, com distribuição simplificada e atualizações durante o desenvolvimento.

ATENÇÃO: CORREÇÃO DE INFORMAÇÃO ANTERIOR.

**EU JÁ CONSEGUI TESTAR O APLICATIVO NO MEU ANDROID.**

Portanto, não quero que você continue investigando o problema antigo do ADB ou tratando a execução no Android como algo que nunca funcionou.

Minha necessidade agora é conseguir testar também no iPhone e compartilhar o aplicativo com outras pessoas do grupo, sem que cada integrante precise configurar um ambiente de desenvolvimento.

Não quero apenas recomendações ou relatórios. Quero implementação, testes e entregas verificáveis.

---

# 1. CONTEXTO DO PROJETO

Diretório:

`C:\Users\joaos\Documents\Codex\2026-10-16\p\outputs\viva-mais-pr-1`

Repositório:

`https://github.com/joaosoares03/vivamais`

O projeto utiliza:

- React Native e Expo.
- TypeScript.
- Next.js.
- Java 21 e Spring Boot.
- PostgreSQL.
- Flyway.
- SQLCipher e armazenamento protegido.
- Testes Java, frontend e E2E.
- Scripts de compilação e execução local.

O APK Android já foi gerado e testado anteriormente.

Foram realizadas correções de layout, acessibilidade, navegação, datas, offline, exportação, retificação e segurança.

Preserve tudo isso.

Antes de começar:

1. Verifique o Git e a branch atual.
2. Identifique alterações não commitadas.
3. Consulte os relatórios anteriores.
4. Confirme quais builds já foram gerados.
5. Identifique quais componentes podem ser reutilizados.
6. Não descarte trabalho existente.

---

# PRIORIDADE 1 — REMOVER O SMS DA DEMONSTRAÇÃO

## 2. CORRIGIR A TELA APÓS O CADASTRO

Estou enviando uma captura do portal profissional.

Após cadastrar um paciente, continuam aparecendo:

- Ativar ou recuperar acesso.
- Acesso ainda não ativado.
- Informações sobre o código de quatro dígitos.
- Confirmação de identidade para solicitar código.
- Senha profissional para emissão.
- Solicitar código por SMS.
- Atualizar estado do acesso.

**EU JÁ SOLICITEI QUE ESSAS ETAPAS FOSSEM DESABILITADAS NA DEMONSTRAÇÃO.**

Quero que você corrija definitivamente esse comportamento.

Não basta esconder botões no frontend.

O backend também precisa reconhecer que o paciente fictício recém-cadastrado está habilitado para o acesso demonstrativo.

## 3. FLUXO DE CADASTRO DESEJADO

No ambiente de demonstração acadêmica, isolado e com dados fictícios:

1. O profissional acessa o portal.
2. Cadastra um paciente fictício.
3. Informa nome, CPF fictício matematicamente válido, nascimento e demais informações necessárias.
4. Salva o cadastro.
5. O sistema confirma o sucesso.
6. O paciente fica disponível imediatamente para login demonstrativo.
7. Nenhum código SMS é necessário.

A tela de confirmação deverá ser simples e organizada.

Exemplo:

**Paciente cadastrado com sucesso!**

"O paciente já pode acessar o Viva+ utilizando o CPF e a data de nascimento cadastrados."

Botões:

- Abrir ficha do paciente.
- Cadastrar outro paciente.
- Voltar para pacientes.

Remova as explicações extensas sobre SMS dessa tela no modo demonstrativo.

## 4. LOGIN DO PACIENTE

No ambiente de demonstração isolado, a tela deverá apresentar somente:

- CPF.
- Data de nascimento.
- Botão ENTRAR.

O paciente fictício deverá acessar diretamente a Home.

Não exigir:

- Código SMS.
- Senha.
- E-mail.
- Ativação por quatro dígitos.

### Segurança

Essa simplificação deverá funcionar exclusivamente com dados fictícios em um ambiente demonstrativo protegido.

Como CPF e nascimento não comprovam identidade, não permita que esse fluxo ofereça acesso a informações reais de saúde.

Preserve o fluxo de autenticação seguro existente para versões reais do Viva+.

O sistema deve impedir a ativação acidental do login demonstrativo em produção.

**IMPORTANTE PARA OS TESTES DO GRUPO:** não exponha esse login simplificado publicamente na internet. Prepare um mecanismo separado de acesso controlado para os testadores, mantendo a demonstração com dados sintéticos.

## 5. TESTES

Valide:

- Cadastro de paciente demonstrativo.
- Habilitação imediata.
- Login com CPF e nascimento.
- CPF incorreto.
- Nascimento incorreto.
- Paciente inexistente.
- Encerramento de sessão.
- Isolamento de dados.
- Bloqueio do modo demonstrativo em ambientes reais.
- Autenticação profissional preservada.

---

# PRIORIDADE 2 — REFORMULAR O MÓDULO DE MEDICAMENTOS

## 6. OBJETIVO

Quero que o módulo de medicamentos se torne uma das funcionalidades mais completas e interativas do Viva+.

Atualmente, considero que ele ainda pode melhorar bastante em organização, interatividade e facilidade de utilização.

O público principal será composto por pacientes idosos.

Por isso, quero:

- Interface simples.
- Botões grandes.
- Fontes legíveis.
- Horários destacados.
- Ícones claros.
- Poucas ações por tela.
- Feedback imediato.
- Informações organizadas.

Não quero apenas uma listagem estática de medicamentos.

## 7. NOVA TELA MEUS MEDICAMENTOS

Crie uma experiência visual com:

### Resumo do dia

Apresente:

- Quantidade de doses previstas.
- Quantidade registrada como tomada.
- Quantidade pendente.
- Próximo horário.
- Barra de progresso.

Exemplo:

**Seus medicamentos de hoje**

"2 de 4 doses registradas como tomadas."

O progresso deve utilizar dados persistidos no backend.

### Cards de medicamentos

Cada medicamento deverá apresentar:

- Nome.
- Dosagem cadastrada.
- Horário.
- Frequência.
- Instruções cadastradas.
- Situação atual.
- Botão de ação.

Exemplo:

**Medicamento A**

08h00 — Pendente

Botão: **Tomei este medicamento**

Ao tocar:

1. Registrar a confirmação.
2. Salvar o horário efetivo.
3. Atualizar o card.
4. Atualizar a barra de progresso.
5. Atualizar o histórico.
6. Exibir confirmação visual.

## 8. INTERATIVIDADE

Implemente ou aperfeiçoe:

### Confirmar dose

Botão para registrar medicamento tomado.

Evite duplicidades.

### Registrar dose não tomada

Permita registrar quando o medicamento não foi tomado, sem inventar justificativas.

### Histórico

Visualização por:

- Hoje.
- Ontem.
- Últimos sete dias.
- Período escolhido.

### Calendário

Permita selecionar um dia e consultar a programação e os registros daquele período.

### Próximo medicamento

Na Home, apresente um resumo do próximo medicamento programado.

### Lembretes

Integre notificações locais, conforme viabilidade técnica, para lembrar horários cadastrados.

Permita configurar as preferências de lembretes.

Evite notificações duplicadas.

Não declare notificações funcionais em Android ou iPhone sem testes nativos.

### Experiência visual

Utilize:

- Transições suaves.
- Indicadores de progresso.
- Ícones.
- Feedback após ações.
- Mensagens de erro claras.
- Estados vazios.
- Estados de carregamento.
- Confirmações acessíveis.

Não exagere nas animações.

## 9. INTEGRAÇÃO COM O PORTAL

O profissional autorizado deverá conseguir:

- Consultar os medicamentos do paciente.
- Visualizar horários.
- Consultar registros de tomada.
- Visualizar doses pendentes.
- Consultar histórico.
- Identificar autoria e origem dos registros.

Respeite as permissões existentes e não crie funcionalidades de prescrição clínica sem requisitos aprovados.

## 10. BACKEND E BANCO

Toda interação deverá funcionar de verdade.

Reutilize os serviços existentes.

Quando necessário:

- Atualize APIs.
- Atualize DTOs.
- Atualize tipagens.
- Crie novas migrações Flyway.
- Preserve dados antigos.
- Registre autoria.
- Preserve o histórico.
- Evite duplicidades.
- Trate concorrência.
- Garanta isolamento entre pacientes.
- Integre a fila offline quando aplicável.

Não utilize dados fictícios fixos para simular progresso em telas que deveriam apresentar informações reais do banco.

## 11. TESTES DE MEDICAMENTOS

Valide:

1. Listagem.
2. Programação diária.
3. Confirmação de dose.
4. Registro de dose não tomada.
5. Prevenção de duplicidade.
6. Histórico.
7. Calendário.
8. Filtros.
9. Persistência.
10. Reabertura do aplicativo.
11. Sincronização offline.
12. Isolamento entre pacientes.
13. Autorização profissional.
14. Responsividade.
15. Fontes ampliadas.
16. Notificações nativas, quando disponíveis.

---

# PRIORIDADE 3 — DISTRIBUIR O VIVA+ PARA TODO O GRUPO

## 12. OBJETIVO

**O APLICATIVO JÁ FUNCIONOU NO MEU ANDROID.**

Agora quero que os demais integrantes do grupo consigam testá-lo em seus celulares.

Preciso atender:

- Android.
- iPhone.
- Pessoas que não possuem conhecimento de programação.
- Integrantes em locais diferentes.
- Testes sem conexão USB.
- Instalação simples.
- Atualização de versões durante o desenvolvimento.

Quero que a experiência para o integrante seja:

1. Receber um link ou convite.
2. Instalar o aplicativo.
3. Abrir o Viva+.
4. Acessar um ambiente de testes.
5. Navegar pelas funcionalidades.
6. Registrar possíveis problemas.
7. Receber uma atualização quando disponibilizarmos uma nova versão.

**NÃO QUERO QUE CADA INTEGRANTE PRECISE INSTALAR NODE.JS, JAVA, POSTGRESQL OU EXECUTAR O BACKEND.**

## 13. ANDROID — DISTRIBUIÇÃO PARA O GRUPO

Aproveite o APK já existente.

Verifique:

- Integridade.
- Versão.
- Assinatura.
- Compatibilidade.
- Identificador.
- Configuração da API.
- Atualização de versões.

Prepare uma distribuição privada do APK para os integrantes Android.

O link de instalação deverá ser compartilhável somente com os testadores autorizados, conforme o mecanismo escolhido.

Documente:

- Como baixar.
- Como instalar.
- Como atualizar.
- Como desinstalar.
- Como relatar erros.

Não utilize credenciais de produção ou dados reais.

## 14. IPHONE — NOVA PRIORIDADE

Quero conseguir instalar e testar o Viva+ em iPhones reais.

Investigue a viabilidade técnica de:

### Expo Go

Verifique se as bibliotecas nativas existentes permitem executar o Viva+ no Expo Go.

Se não permitirem, não remova SQLCipher nem proteções importantes apenas para forçar compatibilidade.

### Expo Development Build

Prepare uma Development Build iOS compatível com os módulos nativos existentes.

Configure:

- Expo.
- EAS.
- Bundle identifier.
- Permissões.
- Câmera.
- Notificações.
- Armazenamento protegido.
- Ícone.
- Splash screen.
- Versão.
- Configuração da API.

O desenvolvimento acontece no Windows.

Utilize os mecanismos de build em nuvem compatíveis quando necessário.

### TestFlight

Prepare a distribuição para iPhone via TestFlight, quando houver conta Apple Developer e permissões adequadas.

**Ainda não possuo uma conta Apple Developer configurada.**

Não me pergunte novamente se já tenho essa conta.

Quero que você prepare tudo o que puder sem ela e documente exatamente quais etapas dependerão do meu cadastro.

Não declare que um IPA foi gerado ou instalado em iPhone sem evidências.

## 15. EXPO E ATUALIZAÇÕES

Quero aproveitar o Expo para acompanhar o desenvolvimento e distribuir atualizações para o grupo.

Avalie:

- Expo Development Build.
- EAS Internal Distribution.
- EAS Update.
- TestFlight.
- Distribuição privada Android.

Escolha a melhor arquitetura para o projeto real.

Diferencie:

**Desenvolvimento:** QR Code e Metro, quando adequados.

**Testes compartilhados:** versões instaláveis com acesso a um backend de homologação.

**Distribuição futura:** Play Store e App Store.

Não exija que todos os integrantes mantenham conexão com meu computador para usar uma versão distribuída.

Explique quais atualizações podem ser recebidas sem reinstalação e quais exigem um novo build nativo.

## 16. BACKEND COMPARTILHADO PARA TESTES

O Viva+ atualmente possui serviços locais.

Para que outras pessoas testem em locais diferentes, precisamos de uma API acessível aos dispositivos autorizados.

Quero que você prepare um ambiente de homologação ou demonstração compartilhável.

Analise:

- Hospedagem econômica.
- Backend Spring Boot.
- PostgreSQL.
- Armazenamento privado.
- HTTPS.
- Controle de acesso.
- URLs dos aplicativos.
- Logs sanitizados.
- Backups.
- Limites de uso.
- Custos.

Não utilize `127.0.0.1` como endereço do backend em builds distribuídos.

Não exponha diretamente o PostgreSQL.

Não disponibilize o login inseguro por CPF e nascimento em uma API pública.

Crie uma estratégia segura de contas de testes, com participantes autorizados e dados exclusivamente sintéticos.

Se não houver credenciais ou autorização para hospedar o backend, prepare a infraestrutura, os scripts e o guia de implantação, sem afirmar que o serviço está publicado.

## 17. CONTAS DE TESTES PARA O GRUPO

Quero que cada integrante consiga utilizar o aplicativo sem modificar ou prejudicar os testes dos outros.

Prepare uma estratégia para:

- Pacientes fictícios.
- Profissionais fictícios.
- Registros sintéticos.
- Medicamentos de exemplo.
- Refeições.
- Pressão.
- Consultas.
- Histórico.
- Exercícios.

Utilize isolamento por usuário ou outra abordagem segura.

Não inclua senhas ou tokens em documentos públicos.

## 18. ROTEIRO DE TESTES DO GRUPO

Crie:

`docs/GUIA_TESTES_GRUPO_ANDROID_IOS.md`

Esse documento deve ser simples, inclusive para pessoas que não programam.

Inclua:

### Android

- Como receber o link.
- Como instalar.
- Como atualizar.
- Como entrar.
- O que testar.

### iPhone

- Como participar do TestFlight, quando disponível.
- Como instalar.
- Como atualizar.
- Como entrar.
- O que testar.

### Funcionalidades

- Login.
- Home.
- Medicamentos.
- Pressão.
- Alimentação.
- Fotos.
- Atividades físicas.
- Histórico.
- Diário.
- Consultas.
- Perfil.
- Lembretes.
- Offline.

### Relatório de problemas

Prepare um modelo simples para registrar:

- Nome ou identificação do testador.
- Android ou iPhone.
- Modelo do aparelho.
- Versão do sistema.
- Versão do Viva+.
- Tela em que ocorreu o erro.
- O que o usuário fez.
- O que aconteceu.
- Resultado esperado.
- Captura de tela, quando apropriado.

Não solicite que os integrantes compartilhem dados clínicos reais nas evidências.

## 19. ATUALIZAÇÕES DO APLICATIVO

Quero uma forma organizada de distribuir novas versões.

Implemente ou prepare:

- Numeração de versões.
- Histórico de alterações.
- Identificação do build.
- Canal de testes.
- Compatibilidade das atualizações.
- Orientações para atualização.
- Separação de ambiente demonstrativo, homologação e produção.

Evite que uma atualização de testes modifique ou comprometa os dados existentes.

---

# PRIORIDADE 4 — REVISÃO GERAL DE USABILIDADE

## 20. MELHORAR AS TELAS RELACIONADAS

Revise especialmente:

- Cadastro de pacientes.
- Confirmação do cadastro.
- Login demonstrativo.
- Home.
- Medicamentos.
- Histórico de medicamentos.
- Lembretes.
- Calendário.
- Perfil.
- Navegação inferior.

Corrija:

- Textos desalinhados.
- Botões pequenos.
- Espaçamentos inconsistentes.
- Sobreposição.
- Rolagem.
- Campos confusos.
- Falhas em telas pequenas.
- Problemas com fontes ampliadas.
- Mensagens técnicas desnecessárias.

Mantenha a identidade visual do Viva+.

Priorize usabilidade para idosos.

---

# PRIORIDADE 5 — VALIDAÇÃO

## 21. EXECUTAR TESTES

Depois das alterações, execute:

- Java.
- Frontend.
- E2E.
- TypeScript.
- Lint.
- Build Next.
- Export Expo.
- Testes PostgreSQL.
- Testes de autenticação.
- Testes de medicamentos.
- Testes de acessibilidade.
- Testes de distribuição.

### Testes específicos

Valide:

1. Cadastro demonstrativo sem SMS.
2. Login direto em ambiente isolado.
3. Acesso profissional preservado.
4. Medicamentos interativos.
5. Persistência dos registros.
6. Histórico.
7. Calendário.
8. Offline.
9. Notificações.
10. Instalação Android.
11. Preparação iOS.
12. Conexão com backend de testes.
13. Isolamento entre testadores.
14. Atualizações do aplicativo.

Não declare testes físicos em iPhone aprovados sem executá-los.

---

# PRIORIDADE 6 — DOCUMENTAÇÃO

## 22. ATUALIZAR OS DOCUMENTOS

Atualize:

- `README.md`
- `PROGRESSO.md`
- `STATUS.md`
- `PROXIMA_EXECUCAO.md`
- Inventário de funcionalidades.
- Documentação de autenticação.
- Documentação de medicamentos.
- Guia de testes.
- Guia de builds.
- Guia de publicação.
- Guia de integração Expo.

Crie ou atualize:

`docs/GUIA_TESTES_GRUPO_ANDROID_IOS.md`

`docs/PLANO_DISTRIBUICAO_INTERNA_VIVAMAIS.md`

`docs/GUIA_CONFIGURACAO_EXPO_EAS_TESTFLIGHT.md`

Não duplique documentos existentes desnecessariamente.

## 23. ENTREGA FINAL

Quero receber uma resposta com:

### Login

- Confirmação de que o SMS foi removido do fluxo demonstrativo.
- Novo comportamento do cadastro.
- Resultado dos testes.
- Capturas atualizadas.

### Medicamentos

- Melhorias implementadas.
- Novas interações.
- Histórico.
- Calendário.
- Lembretes.
- Persistência.
- Testes.
- Capturas.

### Android

- Versão disponível.
- Arquivo ou link de instalação.
- Como compartilhar com o grupo.
- Como atualizar.

### iPhone

- Estado da configuração iOS.
- Compatibilidade Expo Go.
- Estado da Development Build.
- Estado da preparação TestFlight.
- O que falta para instalar no iPhone.
- Dependências de Apple Developer.

### Grupo

- Como cada integrante receberá o aplicativo.
- Como acessar o ambiente de testes.
- Como utilizar contas fictícias.
- Como relatar erros.
- Como receber atualizações.

### Infraestrutura

- Estado do backend compartilhado.
- Banco.
- HTTPS.
- Segurança.
- Custos estimados.
- Dependências externas.

### Qualidade

- Testes executados.
- Arquivos alterados.
- Migrações novas.
- Problemas encontrados.
- Correções.
- Pendências.
- Estado do Git.

---

# INSTRUÇÃO FINAL

**NÃO VOLTE A INVESTIGAR O PROBLEMA ANTIGO DO ADB COMO SE O ANDROID AINDA NÃO FUNCIONASSE.**

O Viva+ já foi testado no Android.

Agora minhas prioridades são:

**1. Corrigir a tela de cadastro e remover definitivamente o SMS da demonstração.**

**2. Melhorar completamente o módulo de medicamentos, trazendo mais interatividade, acompanhamento, histórico e lembretes.**

**3. Preparar o aplicativo para iPhone.**

**4. Permitir que todos os integrantes do grupo instalem e testem o Viva+ em Android e iOS.**

**5. Criar uma distribuição simples, com links ou convites, sem exigir que os integrantes programem ou executem serviços locais.**

**6. Preparar um ambiente de testes compartilhado e seguro.**

**7. Documentar tudo e apresentar instruções exatas para instalação e utilização.**

Quero que você implemente tudo que estiver tecnicamente ao seu alcance agora.

O que depender de Apple Developer, hospedagem, credenciais ou aprovação externa deverá ser preparado e documentado claramente, sem impedir a conclusão das demais atividades.

Não reinicie o projeto.

Não descarte alterações.

Não faça merge automático de PRs.

Não exponha dados pessoais ou credenciais.

**COMECE PELA CORREÇÃO DA TELA DE CADASTRO QUE ENVIEI NO PRINT, CONTINUE COM MEDICAMENTOS E DEPOIS PRIORIZE A DISTRIBUIÇÃO ANDROID/IPHONE PARA O GRUPO.**