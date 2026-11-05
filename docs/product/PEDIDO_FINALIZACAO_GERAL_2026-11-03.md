# VIVA+ — FINALIZAÇÃO GERAL DO PROJETO, REFORMULAÇÃO COMPLETA DAS TELAS E PREPARAÇÃO PARA PLAY STORE E APP STORE

## MISSÃO PRINCIPAL

Quero que você retome imediatamente o desenvolvimento do projeto Viva+ e realize uma etapa intensiva de finalização geral.

**MINHA PRIORIDADE É TER O APLICATIVO FUNCIONAL, VISUALMENTE PROFISSIONAL, FÁCIL DE UTILIZAR E COM VERSÕES INSTALÁVEIS PARA ANDROID E IOS AINDA HOJE, NA MEDIDA EM QUE AS DEPENDÊNCIAS TÉCNICAS E EXTERNAS PERMITIREM.**

Não quero que você apenas analise o projeto e produza uma lista de recomendações.

Quero que você efetivamente:

1. Corrija os problemas existentes.
2. Melhore todas as telas do aplicativo.
3. Reorganize os fluxos de navegação.
4. Simplifique o acesso do paciente.
5. Corrija os campos de data.
6. Finalize as funcionalidades que possam ser concluídas com os recursos disponíveis.
7. Resolva pendências técnicas e de segurança.
8. Melhore o portal profissional.
9. Execute testes completos.
10. Gere versões instaláveis Android e iOS.
11. Prepare o aplicativo para distribuição pela Play Store e App Store.
12. Documente o que foi concluído e qualquer dependência externa que realmente impeça uma entrega.

**IMPORTANTE: NÃO QUERO QUE VOCÊ INTERROMPA O DESENVOLVIMENTO APÓS ENCONTRAR A PRIMEIRA PENDÊNCIA.**

Continue trabalhando nas outras funcionalidades independentes. Só considere uma tarefa bloqueada quando existir uma dependência real, comprovada e que não possa ser resolvida com os recursos disponíveis.

Não invente funcionalidades, integrações, aprovações clínicas, resultados de testes ou acessos externos.

---

# 1. CONTEXTO E ESTADO ATUAL

Projeto local:

`C:\Users\joaos\Documents\Codex\2026-10-16\p\outputs\viva-mais`

Repositório GitHub:

`https://github.com/joaosoares03/vivamais`

O Viva+ possui:

- Aplicativo mobile React Native/Expo.
- Portal profissional Next.js.
- Backend Java 21/Spring Boot.
- Banco PostgreSQL.
- Migrações Flyway.
- Autenticação de pacientes.
- Autenticação de profissionais.
- Cadastro e acompanhamento de pacientes.
- Pressão arterial.
- Medicamentos.
- Alimentação e fotos de refeições.
- Histórico.
- Diário.
- Consultas.
- Catálogo de dez exercícios com mídias.
- Estrutura inicial de IA e OCR.
- Estrutura inicial de integração com pulseira.
- Testes automatizados.
- Documentação técnica.

Na última execução informada, foram aprovados:

- 81 testes Java.
- 88 testes frontend.
- 17 testes E2E.
- Quatro checks do GitHub.

Esses resultados representam o histórico anterior. Confira novamente o estado real depois das mudanças.

O PR #1 possuía checks aprovados, mas ainda não estava incorporado à `main` no último relatório.

Verifique se essa situação mudou. Não sobrescreva alterações ou faça merge de trabalho de terceiros sem uma revisão segura e autorização adequada.

Consulte:

- `AGENTS.md`
- `README.md`
- `PROGRESSO.md`
- `STATUS.md`
- `PROXIMA_EXECUCAO.md`
- Documentação de requisitos.
- Protótipos e referências visuais.
- Inventário de telas.
- Manuais de testes.
- Levantamento de pendências.
- Plano técnico de continuidade.
- Relatórios de auditoria.
- Histórico recente do Git.

Não reinicie o projeto do zero.

---

# 2. PRIORIDADE MÁXIMA — REFORMULAR TODA A EXPERIÊNCIA DO USUÁRIO

A interface atual do Viva+ ainda está confusa em algumas telas.

Quero uma revisão visual e funcional COMPLETA de todo o aplicativo e do portal profissional.

Não quero apenas ajustes pontuais de margem.

**Quero melhorar a experiência real do usuário, principalmente de pacientes idosos.**

## 2.1. Revisar todas as telas

Inspecione todas as rotas, páginas, componentes e fluxos disponíveis.

Compare com os protótipos e referências visuais originais do Viva+.

Corrija:

- Elementos sobrepostos.
- Textos desalinhados.
- Botões fora de posição.
- Rodapés no meio das páginas.
- Barras inferiores incorretas.
- Componentes que ultrapassam a tela.
- Espaçamentos inconsistentes.
- Campos muito pequenos.
- Botões difíceis de selecionar.
- Menus confusos.
- Textos pouco claros.
- Páginas com excesso de informações.
- Cores e contrastes inconsistentes.
- Ícones sem significado claro.
- Logos com baixa resolução.
- Falhas de rolagem.
- Falhas de responsividade.
- Problemas de teclado sobrepondo campos.
- Erros no posicionamento de mensagens.
- Problemas na navegação entre telas.
- Inconsistências entre o aplicativo e o portal.

Quero um design moderno, organizado e profissional, mantendo a identidade visual do Viva+.

Não descaracterize as cores, o logotipo ou o objetivo do projeto.

## 2.2. Criar uma experiência adequada para idosos

Priorize:

- Fontes maiores e legíveis.
- Contraste adequado.
- Botões grandes.
- Áreas de toque confortáveis.
- Instruções simples.
- Poucas ações por tela.
- Hierarquia visual clara.
- Menor quantidade de informações simultâneas.
- Confirmação após salvar registros.
- Indicação clara de erros.
- Orientação sobre o próximo passo.
- Navegação previsível.
- Possibilidade de retornar sem perder os dados.
- Acessibilidade com leitores de tela.
- Compatibilidade com tamanho de fonte ampliado.

Evite linguagem técnica desnecessária.

Por exemplo, prefira "Registrar pressão" em vez de nomenclaturas internas de banco de dados ou termos usados apenas por desenvolvedores.

## 2.3. Melhorar os fluxos completos

Quero que você navegue pelo aplicativo como um usuário real.

Analise os caminhos:

- Acessar o aplicativo.
- Entrar como paciente.
- Ativar conta.
- Chegar à Home.
- Registrar pressão.
- Consultar histórico de pressão.
- Registrar medicamento.
- Consultar medicamentos.
- Registrar refeição.
- Fotografar uma refeição.
- Visualizar registros de alimentação.
- Consultar exercícios.
- Registrar atividade realizada.
- Consultar histórico.
- Consultar diário.
- Visualizar consultas.
- Editar perfil.
- Alterar preferências.
- Encerrar sessão.
- Retornar ao aplicativo.

Em cada fluxo, identifique etapas desnecessárias e corrija a navegação.

Garanta que todas as ações tenham um resultado perceptível e que os dados persistam quando deveriam.

Não mantenha botões sem função.

Se alguma funcionalidade depender de integração externa ainda não disponível, apresente um estado honesto de indisponibilidade, sem inventar resultados.

---

# 3. CORRIGIR DEFINITIVAMENTE O CAMPO DE DATA

Existe um problema de formatação em campos que apresentam data e fuso horário juntos.

**QUERO REMOVER ESSE COMPORTAMENTO DA INTERFACE.**

O paciente deve visualizar somente um campo de data quando o requisito solicitar uma data.

## 3.1. Comportamento esperado

Exemplo:

**Data de nascimento**

`DD/MM/AAAA`

Não quero:

- Campo separado de fuso horário.
- Seleção desnecessária de horário.
- Data acompanhada de UTC.
- Informações técnicas de timezone.
- Controles que aparecem duplicados.
- Seletores bugados.
- Data mudando ao salvar.
- Data aparecendo um dia antes ou depois.

## 3.2. Implementação

Revise todos os componentes de data existentes no aplicativo e no portal.

Crie ou padronize um componente reutilizável de seleção de data.

Para campos que representam somente datas, utilize tratamento adequado de data civil, sem conversões indevidas de fuso horário.

No backend Java, utilize uma representação apropriada, como `LocalDate`, quando o campo não possuir horário.

Nos contratos HTTP, utilize formato estável, como `YYYY-MM-DD`, quando apropriado.

Na interface brasileira, apresente `DD/MM/AAAA`.

Não converta datas civis automaticamente para UTC à meia-noite de forma que a data exibida possa mudar.

Datas que representam eventos com horário real, como medições realizadas em determinado instante, devem continuar armazenando corretamente instante e fuso quando necessário.

**Não elimine o tratamento técnico de timezone do sistema inteiro. Elimine a apresentação desnecessária desse campo para o usuário e corrija os bugs de conversão.**

## 3.3. Revisar todos os formulários

Verifique especialmente:

- Data de nascimento.
- Cadastro do paciente.
- Consultas.
- Registros de pressão.
- Medicamentos.
- Histórico.
- Diário.
- Atividades físicas.
- Filtros por período.
- Relatórios.
- Agendamentos.

Adicione testes para datas inválidas, fim de mês, ano bissexto, mudança de ano e diferenças de fuso.

---

# 4. SIMPLIFICAR TEMPORARIAMENTE O LOGIN DO PACIENTE

Quero alterar o comportamento de autenticação durante a fase de demonstração e desenvolvimento do Viva+.

**NESTA FASE, QUERO QUE A TELA DO PACIENTE TENHA APENAS:**

- CPF.
- Data de nascimento.
- Botão ENTRAR.

Não quero que o paciente precise digitar código de quatro dígitos durante a demonstração.

Não quero e-mail.

Não quero senha convencional.

## 4.1. Desabilitar temporariamente o código de verificação na demonstração

Implemente um modo explícito de demonstração, restrito a ambiente isolado com pacientes e dados inteiramente fictícios.

Nesse modo:

1. O paciente informa CPF.
2. Informa data de nascimento.
3. Clica em ENTRAR.
4. O sistema verifica o cadastro sintético.
5. O paciente acessa a Home.
6. Não é solicitado SMS ou código de ativação.

O modo de demonstração deve estar disponível somente em ambiente de desenvolvimento ou demonstração protegido e isolado.

Não permita que essa configuração seja ativada acidentalmente na versão distribuída publicamente.

Use uma configuração controlada no backend, com bloqueio de inicialização ou validação equivalente caso uma configuração insegura seja ativada em produção.

Não basta esconder o campo de código no frontend. O comportamento deve ser coerente no ambiente de demonstração.

## 4.2. Segurança para uso real

O Viva+ armazena informações sensíveis de saúde. CPF e data de nascimento não comprovam, isoladamente, a identidade do paciente.

Portanto:

- Não conceda acesso a dados reais de saúde somente com CPF e nascimento.
- Preserve os mecanismos seguros de autenticação existentes.
- Prepare uma experiência sem senha convencional, com sessão persistente em dispositivo previamente autorizado.
- Se for necessária verificação inicial de identidade ou de novo dispositivo, implemente um fluxo seguro adequado ao uso por idosos.
- Não ative o login simplificado de demonstração em builds públicos conectados a dados reais.
- Mantenha separação entre ambiente demonstrativo e ambiente real.

A interface pode continuar apresentando CPF e data de nascimento como dados familiares para o paciente, mas o backend de produção deve exigir uma prova segura de identidade ou autorização de dispositivo.

## 4.3. Preservar autenticação profissional

Não modifique indevidamente o login seguro do profissional.

Mantenha controle de perfis, permissões e isolamento dos registros.

---

# 5. MELHORAR TODAS AS FUNCIONALIDADES JÁ EXISTENTES

Não quero que o Viva+ apenas possua telas.

Quero que os módulos estejam integrados, funcionais, consistentes e completos dentro do escopo implementável.

## 5.1. Home

Aprimore:

- Saudação.
- Resumo de informações.
- Próximas atividades.
- Próximos medicamentos.
- Últimos registros.
- Atalhos.
- Avisos relevantes.
- Organização dos cards.
- Estados vazios.
- Mensagens de carregamento.

Evite excesso de informações.

A Home deve permitir que o paciente identifique rapidamente o que fazer.

## 5.2. Pressão arterial

Verifique:

- Registro manual.
- Data da medição.
- Valores sistólico e diastólico.
- Validação de valores.
- Histórico.
- Gráficos.
- Ordenação.
- Edição quando permitida.
- Autoria.
- Origem do registro.
- Persistência.
- Integração com OCR.

Não invente classificações clínicas sem critérios aprovados.

## 5.3. Medicamentos

Conclua e revise:

- Cadastro.
- Nome.
- Dosagem.
- Horários.
- Frequência.
- Histórico.
- Confirmação de administração.
- Lembretes.
- Estados de atraso e conclusão.
- Edição e encerramento de prescrições quando aplicável.

Não permita que dados sintéticos sejam confundidos com prescrições reais.

## 5.4. Alimentação

Revise:

- Registro de refeições.
- Upload de fotos.
- Câmera.
- Pré-visualização.
- Armazenamento.
- Histórico.
- Correção de registros.
- Tratamento de falhas.

Quanto à IA alimentar, implemente tudo que for possível sem depender de aprovação ou contratação externa.

Se houver provedor disponível e autorizado, integre e teste.

Se não houver, mantenha o registro manual plenamente funcional e documente a integração pendente.

Não apresente análises sintéticas como resultados reais de inteligência artificial.

## 5.5. Exercícios físicos

O catálogo com dez exercícios e mídias já foi integrado.

Verifique:

- Exibição correta.
- Reprodução dos vídeos.
- Instruções.
- Histórico.
- Registro de conclusão.
- Organização semanal.
- Navegação.
- Responsividade.
- Persistência.
- Mensagens.
- Acessibilidade.

Conclua os elementos técnicos de planejamento personalizado que não exijam decisões clínicas.

Regras de prescrição, contraindicações e personalização clínica devem depender dos responsáveis habilitados.

Não invente protocolos médicos para concluir uma pendência.

## 5.6. Histórico e diário

Melhore:

- Ordenação cronológica.
- Filtros.
- Datas.
- Paginação.
- Identificação dos registros.
- Origem.
- Autoria.
- Consulta detalhada.
- Estados vazios.
- Exportação, quando prevista.
- Retificação auditada, quando aplicável.

Não apague o histórico indevidamente.

## 5.7. Consultas

Revise:

- Listagem.
- Datas.
- Informações.
- Status.
- Orientações.
- Histórico.
- Navegação.
- Integração com o portal profissional.

## 5.8. Perfil e configurações

Simplifique e padronize:

- Dados pessoais.
- Informações do paciente.
- Preferências.
- Acessibilidade.
- Privacidade.
- Suporte.
- Sair da conta.

Remova campos técnicos desnecessários e organize corretamente os componentes.

---

# 6. MELHORAR TODO O PORTAL PROFISSIONAL

Quero que o portal também seja revisado completamente.

Analise:

- Tela de login.
- Dashboard.
- Cadastro de pacientes.
- Edição de pacientes.
- Busca e filtros.
- Ficha de acompanhamento.
- Histórico.
- Consultas.
- Relatórios.
- Configurações.
- Preferências.
- Gerenciamento de vínculos.
- Controle de permissões.
- Recuperação de contas profissionais.

Corrija problemas de alinhamento, paginação, menus, campos, botões, tabelas e responsividade.

Priorize um visual profissional e consistente.

## 6.1. Cadastro

Valide:

- Nome.
- CPF.
- Data de nascimento.
- Telefone celular obrigatório.
- DDD.
- Formato do telefone.
- Duplicidade.
- Integridade dos registros.

Diferencie validação matemática do CPF de verificação oficial de identidade.

Não afirme que um CPF existe na Receita Federal apenas porque seus dígitos verificadores são válidos.

## 6.2. Relatórios e gestão

Conclua os recursos técnicos previstos para:

- Filtros.
- Paginação.
- Exportação.
- Identificação de autoria.
- Retificação auditada.
- Visualização de registros.
- Permissões.
- Histórico de operações.

Preserve o isolamento entre pacientes e profissionais.

---

# 7. FINALIZAR AS PENDÊNCIAS TÉCNICAS

Quero que você utilize o levantamento atual como base e avance efetivamente sobre todas as pendências que puder resolver.

## 7.1. SMS

Revise a implementação atual.

Mantenha a infraestrutura de SMS preparada para utilização real.

No ambiente de demonstração, o login simplificado deverá dispensar o código.

Não remova a infraestrutura existente de ativação segura, pois ela poderá ser utilizada futuramente.

Se não houver fornecedor contratado ou credenciais autorizadas, não invente envio real.

Documente exatamente o que depende do provedor.

## 7.2. IA alimentar

Finalize a preparação técnica:

- Contratos.
- Serviços.
- Tratamento de erros.
- Estados de processamento.
- Validação dos resultados.
- Testes com dados sintéticos.
- Privacidade.
- Possibilidade de configuração de provedor.

Se não existir fornecedor disponível, mantenha a funcionalidade dependente desabilitada e documentada.

## 7.3. OCR

Melhore:

- Captura de imagem.
- Pré-processamento.
- Identificação de valores.
- Validação.
- Tratamento de confiança.
- Conferência humana.
- Tratamento de leituras incorretas.

Adicione testes com diferentes imagens sintéticas ou de teste autorizadas.

Não permita que resultados incertos sejam salvos automaticamente como medições confirmadas.

## 7.4. Offline

Quero avançar no funcionamento offline do aplicativo.

Implemente ou conclua, conforme viabilidade:

- Consulta local dos dados permitidos.
- Persistência após fechar o aplicativo.
- Fila de sincronização.
- Retentativas.
- Indicação de sincronização pendente.
- Tratamento de duplicidades.
- Recuperação após queda de conexão.
- Resolução segura de conflitos.
- Proteção dos dados armazenados localmente.

Teste cenários de internet desligada e reconexão.

Não exponha dados clínicos em armazenamento inseguro.

## 7.5. Pulseira

A pulseira Pulso em Dia está sendo construída manualmente por outra equipe.

Ainda não temos as especificações definitivas de:

- Microcontrolador.
- Sensores.
- Firmware.
- Bluetooth ou Wi-Fi.
- Protocolo.
- Formato das medições.

Portanto, conclua apenas a infraestrutura independente do hardware:

- Cadastro do dispositivo.
- Vinculação ao paciente.
- Desvinculação.
- Identificação.
- Histórico de medições.
- Status da sincronização.
- Adaptador de comunicação.
- Simulador de testes.
- APIs.
- Persistência.
- Controle de duplicidade.

Mantenha a integração real bloqueada até a equipe de hardware fornecer o protocolo.

Não invente medições ou declare uma conexão Bluetooth real que ainda não existe.

## 7.6. Segurança

Faça uma revisão abrangente:

- Vulnerabilidades de dependências.
- Autenticação.
- Autorização.
- Isolamento de usuários.
- Proteção de imagens.
- Sessões.
- Tokens.
- Armazenamento seguro.
- Logs.
- Validação de entrada.
- Proteção contra abuso.
- Backups.
- Gestão de credenciais.
- Configurações de produção.
- HTTPS.

Resolva problemas técnicos de segurança identificados sempre que possível.

Não desabilite verificações para obter resultados aprovados artificialmente.

---

# 8. PREPARAR INFRAESTRUTURA REAL

Quero deixar o Viva+ preparado para funcionar fora do computador local.

Revise e prepare:

- Backend.
- PostgreSQL.
- Armazenamento privado.
- Variáveis de ambiente.
- Configuração de domínios.
- HTTPS.
- Backup automático.
- Recuperação.
- Monitoramento.
- Logs sanitizados.
- CI/CD.
- Proteção de credenciais.
- Configuração de ambiente de homologação.
- Configuração de ambiente de produção.

Analise opções econômicas de hospedagem compatíveis com as tecnologias existentes.

Não migre dados reais ou publique serviços de produção sem configuração segura e autorização específica.

Não utilize banco de desenvolvimento como banco público.

Não publique o backend com credenciais de demonstração.

Registre os custos estimados e as dependências de contas ou serviços externos.

---

# 9. PRIORIDADE ALTA — CRIAR VERSÃO ANDROID INSTALÁVEL

Quero receber uma versão real do aplicativo para instalar em um celular Android.

Não quero apenas Expo Web.

## 9.1. Preparação

Verifique:

- Expo SDK.
- Configuração EAS.
- Identificador Android.
- Ícone.
- Nome Viva+.
- Splash screen.
- Permissões.
- Versão.
- Número de build.
- Configuração de ambiente.
- URLs da API.
- Assinatura do aplicativo.

Não reutilize credenciais públicas ou fictícias em builds distribuídos.

## 9.2. Build Android

Prepare:

- APK para testes internos, quando aplicável.
- AAB para envio ao Google Play.
- Configuração adequada de assinatura.
- Build compatível com os requisitos atuais da loja.

Execute o build real quando houver ambiente e credenciais disponíveis.

Verifique se o arquivo foi realmente gerado.

Não confunda exportação JavaScript do Expo com APK ou AAB instalável.

## 9.3. Testes

Teste em aparelho Android real, quando disponível:

- Instalação.
- Inicialização.
- Login.
- Navegação.
- Câmera.
- Fotos.
- Armazenamento protegido.
- Persistência de sessão.
- Notificações.
- Offline.
- Reconexão.
- Performance.
- Layout.
- Tamanho de fonte.

Se não existir dispositivo físico acessível, execute os testes possíveis no emulador e registre a pendência de validação física.

---

# 10. PRIORIDADE ALTA — CRIAR VERSÃO IOS

Quero preparar o Viva+ para instalação e distribuição em iPhones.

## 10.1. Configuração

Verifique:

- Bundle identifier.
- Configuração Expo.
- Versão iOS.
- Número de build.
- Ícones.
- Splash screen.
- Permissões de câmera.
- Privacidade.
- Notificações.
- Assinatura.
- Provisioning.
- Configuração do EAS.

## 10.2. Build iOS

Utilize o processo oficial de build compatível com Expo/EAS.

O ambiente local principal utiliza Windows, portanto considere o serviço de build na nuvem quando apropriado.

Gere um IPA real quando existir acesso e configuração de assinatura.

Não declare um build iOS concluído apenas porque um export do Expo passou.

## 10.3. TestFlight

Prepare a distribuição interna via TestFlight.

Se existir conta Apple Developer autorizada e credenciais configuradas, realize os passos tecnicamente possíveis de envio à App Store Connect/TestFlight.

Se faltar autenticação ou ação do proprietário, explique exatamente o procedimento.

Não solicite senhas ou chaves privadas pelo chat.

---

# 11. PREPARAÇÃO COMPLETA PARA PLAY STORE E APP STORE

Além dos builds, quero que você prepare os materiais necessários para a publicação.

## 11.1. Identidade do aplicativo

Padronize:

- Nome do aplicativo.
- Identificadores.
- Logotipo.
- Ícones.
- Splash screen.
- Versão.
- Descrição.
- Categoria.
- Textos institucionais.

Não utilize imagens de baixa resolução.

Não invente parcerias, certificações ou autorizações.

## 11.2. Materiais da loja

Prepare:

- Nome público.
- Descrição curta.
- Descrição completa.
- Ícone de alta resolução.
- Capturas Android.
- Capturas iOS.
- Imagens promocionais necessárias.
- Notas da versão.
- Instruções para revisores.
- Conta demonstrativa segura para revisão, quando aplicável.
- Declarações de funcionalidades.

As capturas devem refletir o aplicativo real e não podem apresentar dados pessoais verdadeiros.

## 11.3. Políticas e conformidade

Revise:

- Política de privacidade.
- Termos de uso.
- Tratamento de dados de saúde.
- Solicitação de exclusão de conta ou dados.
- Canal de suporte.
- Permissões solicitadas.
- Declarações de dados da Play Store.
- Declarações de saúde.
- Privacidade na App Store.
- Requisitos legais e institucionais.
- Necessidade de aprovação ou regularização clínica.

Prepare os rascunhos técnicos e as telas necessárias.

Não invente aprovação jurídica, clínica ou institucional.

Não declare o aplicativo como dispositivo médico validado sem evidências.

## 11.4. Envio

Se as contas, permissões, builds e requisitos estiverem prontos:

- Prepare ou realize o envio à faixa de testes apropriada do Google Play.
- Prepare ou realize o envio ao TestFlight.
- Registre os identificadores e links de builds.
- Documente os passos restantes para solicitar revisão de produção.

Não publique uma versão de demonstração com autenticação simplificada insegura em ambiente público conectado a dados reais.

Não realize lançamento público de uma aplicação com dados de saúde enquanto houver bloqueios críticos de segurança, privacidade ou validação.

A conclusão do build, o upload e a aprovação das lojas são estados diferentes e devem ser informados separadamente.

---

# 12. TESTES AUTOMATIZADOS E MANUAIS

Depois de cada conjunto importante de alterações, execute os testes correspondentes.

Ao final, realize uma regressão ampla.

Inclua:

- Testes Java.
- Testes frontend.
- Testes de integração.
- Testes PostgreSQL.
- Testes E2E.
- TypeScript.
- Lint.
- Build Next.js.
- Expo.
- Auditoria de dependências.
- Testes de acessibilidade.
- Testes responsivos.
- Testes Android.
- Testes iOS, quando possível.
- Testes de persistência.
- Testes de autenticação.
- Testes de autorização.

### Testes manuais obrigatórios

Navegue por todas as telas.

Teste:

1. Campos vazios.
2. Dados inválidos.
3. Dados válidos.
4. Botões.
5. Salvar registros.
6. Consultar registros.
7. Editar registros.
8. Navegação.
9. Voltar.
10. Abrir e fechar o aplicativo.
11. Perder conexão.
12. Restaurar conexão.
13. Exibir erros.
14. Permissões de câmera.
15. Telas pequenas.
16. Fontes ampliadas.
17. Orientação vertical.
18. Campos de data.
19. Login demonstrativo.
20. Isolamento de dados e proteção dos ambientes reais.

Gere capturas das principais telas antes e depois das correções.

Não marque testes como aprovados sem executá-los.

---

# 13. AUDITORIA VISUAL COMPLETA

Quero uma comparação organizada entre os protótipos e a implementação real.

Faça um inventário de todas as telas existentes e avalie:

- Clareza.
- Legibilidade.
- Hierarquia.
- Navegação.
- Botões.
- Campos.
- Margens.
- Cores.
- Responsividade.
- Acessibilidade.
- Persistência.
- Funcionamento.
- Erros.

Corrija todas as divergências que forem tecnicamente viáveis e não dependerem de decisões externas.

Gere um relatório visual com capturas atualizadas.

Quero uma interface consistente, como se todas as telas fossem parte de um único produto profissional.

---

# 14. DOCUMENTAÇÃO FINAL E TRANSFERÊNCIA

Atualize a documentação técnica com tudo o que for alterado.

Inclua:

- Arquitetura.
- Fluxos.
- Telas.
- Autenticação.
- Backend.
- Banco de dados.
- Migrações.
- Configuração.
- Testes.
- Builds.
- Integrações.
- Segurança.
- Publicação.
- Pendências externas.

Atualize especialmente:

- `README.md`
- `PROGRESSO.md`
- `STATUS.md`
- `PROXIMA_EXECUCAO.md`
- `docs/MANUAL_TECNICO_COMPLETO_VIVAMAIS.md`
- `docs/INVENTARIO_COMPLETO_FUNCIONALIDADES.md`
- `docs/LEVANTAMENTO_COMPLETO_PENDENCIAS.md`
- `docs/PLANO_TECNICO_CONTINUIDADE_DESENVOLVIMENTO.md`
- `docs/MANUAL_COMPLETO_TESTES_DESENVOLVEDOR.md`

Verifique os nomes reais dos arquivos e evite duplicações.

Crie:

`docs/RELATORIO_FINALIZACAO_GERAL_VIVAMAIS.md`

E:

`docs/GUIA_PUBLICACAO_PLAY_STORE_APP_STORE.md`

O guia de publicação deverá explicar os passos exatos para eu continuar manualmente quando forem necessárias contas, aprovações, pagamentos ou verificações de identidade.

---

# 15. ORDEM DE EXECUÇÃO — NÃO PERDER TEMPO COM O QUE NÃO É PRIORITÁRIO

Quero que você trabalhe na seguinte ordem:

**FASE 1 — EXPERIÊNCIA DO USUÁRIO**

- Simplificar o login demonstrativo.
- Corrigir o componente de data.
- Eliminar bugs de navegação.
- Melhorar as telas.
- Corrigir layouts e responsividade.
- Melhorar a acessibilidade para idosos.

**FASE 2 — FUNCIONALIDADES**

- Revisar todos os módulos.
- Corrigir bugs.
- Completar fluxos.
- Resolver pendências técnicas independentes.
- Aprimorar persistência.
- Melhorar offline.
- Revisar portal profissional.

**FASE 3 — QUALIDADE E SEGURANÇA**

- Testes.
- Correção de regressões.
- Auditoria de segurança.
- Verificação do banco.
- Revisão dos ambientes.
- Verificação de dados e permissões.

**FASE 4 — APLICATIVOS INSTALÁVEIS**

- Configuração EAS.
- APK de testes Android.
- AAB Android.
- IPA iOS.
- Testes nativos disponíveis.

**FASE 5 — LOJAS**

- Materiais.
- Capturas.
- Descrições.
- Política de privacidade.
- Requisitos de publicação.
- Play Console.
- App Store Connect.
- TestFlight.
- Orientações de envio.

**FASE 6 — DOCUMENTAÇÃO E ENTREGA**

- Atualizar manuais.
- Consolidar pendências externas.
- Documentar testes.
- Documentar builds.
- Apresentar resultados.

Não passe todo o tempo apenas escrevendo relatórios.

Priorize alterações funcionais e entregas utilizáveis.

---

# 16. REGRAS DE SEGURANÇA E PRESERVAÇÃO

- Não apague o projeto.
- Não reinicie a aplicação do zero.
- Não descarte alterações locais.
- Não execute comandos Git destrutivos.
- Não reescreva migrações Flyway aplicadas.
- Não apague dados existentes.
- Não exponha credenciais.
- Não publique dados reais de pacientes.
- Não desabilite verificações de segurança de produção.
- Não apresente funcionalidades simuladas como reais.
- Não declare integrações externas concluídas sem evidência.
- Não invente aprovações clínicas.
- Não oculte problemas para obter builds aprovados.
- Não faça merge de PRs sem a autorização necessária.
- Não publique automaticamente na `main` sem revisar o estado do repositório.
- Não coloque o sistema em produção com autenticação apenas por CPF e nascimento.

É permitido criar commits técnicos e branches de trabalho quando necessário, preservando o histórico. Antes de realizar push, confirme o destino e evite publicar qualquer conteúdo sensível.

---

# 17. COMO VOCÊ DEVE TRABALHAR NESTA EXECUÇÃO

Não quero uma resposta dizendo apenas "seria necessário implementar".

Quero execução real.

Para cada tarefa:

1. Inspecione o código existente.
2. Identifique o problema.
3. Implemente a correção.
4. Execute os testes pertinentes.
5. Verifique possíveis regressões.
6. Registre o resultado.
7. Continue para a próxima tarefa.

Se uma funcionalidade estiver bloqueada por credenciais, hardware, aprovação clínica ou fornecedor, documente a dependência e continue trabalhando nas demais tarefas.

Não faça perguntas desnecessárias sobre informações já presentes no repositório ou no histórico.

Utilize decisões técnicas fundamentadas na arquitetura atual.

Não tente concluir funcionalidades arriscadas por meio de simulações apresentadas como definitivas.

---

# 18. RESULTADO FINAL OBRIGATÓRIO

Ao concluir, quero um relatório com:

### A. Interface

- Quantas telas foram revisadas.
- Quais problemas foram corrigidos.
- Como a navegação foi melhorada.
- Como o campo de data foi corrigido.
- Como a experiência de idosos foi aprimorada.
- Onde estão as capturas.

### B. Funcionalidades

- O que estava pronto.
- O que foi concluído agora.
- O que foi corrigido.
- O que permanece parcial.
- O que depende de terceiros.

### C. Autenticação

- Como funciona o login de demonstração com CPF e nascimento.
- Como o modo de demonstração é isolado.
- Como o acesso real continua protegido.
- Como testar cada cenário.

### D. Android

- Resultado do build.
- APK gerado, se disponível.
- AAB gerado, se disponível.
- Localização dos arquivos.
- Testes executados.
- Pendências.

### E. iOS

- Resultado do build.
- IPA gerado, se disponível.
- Configuração TestFlight.
- Testes executados.
- Pendências.

### F. Lojas

- O que já está preparado.
- O que foi efetivamente enviado.
- O que ainda depende de mim.
- Links dos painéis, builds e submissões disponíveis.
- Pendências de revisão, conta ou pagamento.

### G. Segurança e testes

- Quantidade de testes aprovados.
- Testes com falha.
- Vulnerabilidades encontradas.
- Vulnerabilidades corrigidas.
- Bloqueios de produção.

### H. Documentação

- Arquivos atualizados.
- Manuais gerados.
- Procedimentos de instalação.
- Procedimentos de testes.
- Guia para publicação.

---

# INSTRUÇÃO FINAL — PRIORIDADE ABSOLUTA

**QUERO TRANSFORMAR O VIVA+ DE UMA DEMONSTRAÇÃO FUNCIONAL EM UM APLICATIVO COMPLETO, ORGANIZADO, TESTÁVEL E PREPARADO PARA DISTRIBUIÇÃO.**

As minhas prioridades são:

1. Melhorar todas as telas e a usabilidade.
2. Tornar o aplicativo simples para idosos.
3. Corrigir definitivamente os campos de data, sem seleção desnecessária de fuso horário.
4. Permitir login de demonstração com CPF e data de nascimento, sem código de verificação.
5. Preservar autenticação segura para qualquer ambiente com dados reais.
6. Concluir todas as pendências técnicas que estiverem ao seu alcance.
7. Preparar Android e iOS.
8. Gerar arquivos instaláveis reais.
9. Preparar o envio à Play Store e App Store.
10. Criar documentação final de entrega.

**NÃO ME ENTREGUE APENAS UMA LISTA DO QUE FALTA. IMPLEMENTE O QUE FOR POSSÍVEL AGORA.**

O prazo é hoje. Organize o trabalho para maximizar entregas funcionais e verificáveis nesta execução.

Se uma publicação pública depender de processo externo que não possa ser concluído hoje, não finja que ela foi realizada. Entregue os builds, os materiais, as configurações e as instruções necessárias para avançar imediatamente.

Quero terminar esta execução sabendo exatamente o que já está funcionando, com os aplicativos instaláveis disponíveis quando tecnicamente possível, e sem pendências de implementação que poderiam ter sido resolvidas com os recursos já existentes.

**COMECE PELA CORREÇÃO DO LOGIN DEMONSTRATIVO, DO CAMPO DE DATA E DA REVISÃO DAS TELAS. DEPOIS CONTINUE ATÉ CONCLUIR TODAS AS ETAPAS VIÁVEIS.**