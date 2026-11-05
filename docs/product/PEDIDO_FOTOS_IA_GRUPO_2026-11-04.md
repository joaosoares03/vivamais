# VIVA+ — CORRIGIR ENVIO DE FOTOS, VERIFICAR IA ALIMENTAR E LIBERAR TESTES PARA TODO O GRUPO

Quero que você continue o desenvolvimento do Viva+ a partir do estado atual e realize três entregas prioritárias:

**1. CORRIGIR DEFINITIVAMENTE O ENVIO DE FOTOGRAFIAS NO APLICATIVO.**

**2. VERIFICAR SE A INTELIGÊNCIA ARTIFICIAL ESTÁ REALMENTE ANALISANDO AS FOTOS DAS REFEIÇÕES E IMPLEMENTAR AS CORREÇÕES POSSÍVEIS.**

**3. PREPARAR E DISPONIBILIZAR O ACESSO ÀS VERSÕES PROFISSIONAL E PACIENTE PARA OS INTEGRANTES DO MEU GRUPO TESTAREM O VIVA+ EM SEUS PRÓPRIOS DISPOSITIVOS.**

Quero execução real, testes e resultados verificáveis. Não apenas um relatório.

## 1. CONTEXTO DO PROJETO

Repositório:

`https://github.com/joaosoares03/vivamais`

Diretório local:

`C:\Users\joaos\Documents\Codex\2026-10-16\p\outputs\viva-mais-pr-1`

O Viva+ já possui infraestrutura de homologação parcialmente ou totalmente configurada nos seguintes serviços:

- Railway: API Spring Boot e aplicativo web do paciente.
- Supabase: PostgreSQL e armazenamento privado de arquivos.
- Vercel: portal profissional.
- GitHub: repositório e controle de versão.

Os serviços já foram configurados anteriormente. Verifique o estado atual antes de criar qualquer recurso novo.

O objetivo é utilizar exclusivamente dados sintéticos, com acesso restrito aos participantes autorizados.

Não modifique a produção nem utilize informações reais de pacientes.

---

# PRIORIDADE 1 — CORRIGIR O ERRO DE ENVIO DE FOTOGRAFIAS

## 2. PROBLEMA IDENTIFICADO NO IPHONE

Estou anexando uma captura de tela de um teste realizado no Safari do iPhone.

Na tela de alimentação, tentei enviar fotografias, mas nenhuma foi aceita.

O aplicativo apresentou a mensagem:

**"Use uma imagem com até 2 MB."**

A interface também informa que aceita apenas PNG e JPEG.

Isso torna a funcionalidade pouco prática, pois fotografias realizadas por celulares modernos frequentemente ultrapassam esse limite.

Quero uma solução adequada ao uso real do aplicativo.

## 3. IDENTIFICAR A CAUSA REAL

Antes de modificar os limites, investigue o fluxo completo de imagens.

Verifique:

1. Seleção pela galeria.
2. Captura pela câmera.
3. Formato original do arquivo.
4. Compatibilidade com HEIC/HEIF do iPhone.
5. Compatibilidade com JPEG.
6. Compatibilidade com PNG.
7. Tamanho original da imagem.
8. Validação no frontend.
9. Transformação ou compressão.
10. Envio HTTP.
11. Limites do Spring Boot.
12. Configuração multipart.
13. Limites do serviço Railway.
14. Processamento no backend.
15. Upload para Supabase Storage.
16. Registro no PostgreSQL.
17. Recuperação da imagem.
18. Tratamento de erros.

Não presuma que o tamanho do arquivo é a única causa.

Verifique eventuais erros de MIME, conversão, timeout, orientação, autenticação e acesso ao Storage.

## 4. MELHORAR O PROCESSAMENTO DAS FOTOGRAFIAS

Quero que o paciente consiga tirar uma fotografia de uma refeição com o celular e enviá-la sem precisar utilizar aplicativos externos de compressão.

### Comportamento esperado

1. Paciente abre Alimentação.
2. Seleciona "Tirar foto" ou "Escolher foto da galeria".
3. O aplicativo recebe a imagem.
4. Quando necessário, realiza uma conversão ou otimização automática.
5. Exibe uma prévia.
6. Permite confirmar ou escolher outra foto.
7. Realiza o envio.
8. Exibe indicador de progresso.
9. Confirma que a imagem foi salva.
10. Atualiza o histórico de refeições.

### Implementação

Implemente:

- Compressão automática quando necessária.
- Redimensionamento preservando a proporção.
- Correção de orientação.
- Conversão segura de formatos compatíveis do iPhone.
- Preservação de qualidade visual suficiente para consulta e eventual análise.
- Pré-visualização.
- Estados de carregamento.
- Tratamento de falhas.
- Reenvio controlado.
- Mensagens compreensíveis.

Avalie um limite tecnicamente adequado, por exemplo, até 10 MB para o arquivo original, com otimização antes do armazenamento.

O limite definitivo deve considerar qualidade, segurança, custos e capacidade do backend.

Não aumente simplesmente o limite para um valor ilimitado.

Valide também o tamanho efetivo, a estrutura e o formato do arquivo no backend, sem confiar apenas na extensão ou no MIME informado pelo cliente.

Proteja o sistema contra arquivos maliciosos, formatos inesperados e consumo excessivo de recursos.

Evite registrar dados EXIF desnecessários, especialmente localização.

## 5. CORRIGIR A EXPERIÊNCIA VISUAL

A tela atual apresenta uma explicação extensa e mensagens técnicas sobre os formatos.

Quero uma experiência mais simples.

A interface deve apresentar:

**Registrar minha refeição**

Botões:

- Tirar foto.
- Escolher da galeria.

Campo:

- Observação sobre a refeição.

Quando a imagem for selecionada:

- Mostrar a prévia.
- Permitir remover ou substituir.
- Informar o estado do envio.
- Apresentar botão "Salvar refeição".

As informações técnicas devem aparecer apenas quando realmente necessárias.

Quero que as mensagens de erro expliquem o problema e a ação possível.

Exemplos:

"Não conseguimos preparar esta foto. Tente selecionar outra imagem."

"Não foi possível enviar agora. Verifique sua conexão e tente novamente."

Não exiba a mensagem de limite de 2 MB quando o sistema puder otimizar automaticamente a imagem.

## 6. TESTES DE FOTOGRAFIAS

Teste, no mínimo:

- Foto tirada por iPhone.
- Foto selecionada da galeria.
- JPEG.
- PNG.
- HEIC/HEIF quando suportado pelo fluxo.
- Imagem acima de 2 MB.
- Imagem próxima do limite permitido.
- Imagem inválida.
- Arquivo que não é uma fotografia.
- Internet lenta.
- Falha de upload.
- Tentativa de reenvio.
- Confirmação de armazenamento.
- Recuperação no histórico.
- Consulta pelo profissional autorizado.
- Bloqueio de acesso por outro paciente.

Teste em Safari iOS e Chrome Android quando houver dispositivos ou ambientes disponíveis.

Não declare teste físico aprovado sem evidência.

---

# PRIORIDADE 2 — VERIFICAR A INTELIGÊNCIA ARTIFICIAL

## 7. QUERO SABER SE A IA ESTÁ FUNCIONANDO DE VERDADE

Uma das funcionalidades previstas para o Viva+ é a utilização de inteligência artificial na análise das fotografias das refeições.

Preciso saber se essa funcionalidade está implementada e funcionando ou se atualmente o aplicativo apenas armazena fotografias.

**NÃO CONFUNDA UPLOAD DE IMAGEM COM ANÁLISE POR INTELIGÊNCIA ARTIFICIAL.**

Faça uma auditoria completa desse módulo.

Investigue:

1. Se existe um serviço real de IA configurado.
2. Qual provedor é utilizado, se houver.
3. Se existe uma integração ativa.
4. Quais endpoints processam as imagens.
5. Se as fotografias são efetivamente enviadas para análise.
6. Se existe processamento assíncrono.
7. Se há registros de sucesso ou falha.
8. Se os resultados são persistidos.
9. Se o paciente visualiza o resultado.
10. Se o profissional consegue consultar o resultado.
11. Se o sistema está utilizando dados simulados.
12. Se alguma funcionalidade ainda é apenas uma estrutura preparada.

Diferencie também a IA alimentar do OCR utilizado para reconhecer valores em fotografias de aparelhos de pressão arterial.

São funcionalidades distintas e devem possuir diagnósticos separados.

## 8. RESULTADO DA AUDITORIA

Classifique a situação atual da IA alimentar como uma das seguintes:

- Integração real ativa e testada.
- Integração real implementada, mas sem credenciais.
- Integração parcial.
- Simulação demonstrativa.
- Apenas armazenamento de fotos.
- Funcionalidade ainda não implementada.

Apresente evidências técnicas que sustentem a classificação.

Não afirme que a IA está analisando imagens sem comprovar o processamento real.

## 9. CONCLUIR O QUE FOR POSSÍVEL DA IA ALIMENTAR

Se já existir uma integração real autorizada, verifique seu funcionamento e corrija os erros encontrados.

Se ainda não houver um provedor habilitado, conclua os componentes técnicos que não dependam de credenciais:

- Interface de serviço.
- Contratos.
- Processamento.
- Estados de análise.
- Tratamento de falhas.
- Persistência.
- Exibição de resultados.
- Testes automatizados.
- Proteção de dados.
- Configuração segura do provedor.

Se a IA estiver inativa, não apresente resultados simulados como análises reais.

### Cuidados clínicos

A IA poderá auxiliar na descrição ou identificação provável de alimentos, conforme critérios aprovados.

Não deve afirmar com precisão clínica a quantidade de sódio, gordura, calorias ou nutrientes somente a partir de uma fotografia sem método validado e informações suficientes.

Não forneça diagnósticos, prescrições ou recomendações clínicas automáticas sem validação apropriada.

Os resultados devem indicar suas limitações e permitir conferência humana.

Se houver dependência de contrato, custo ou aprovação clínica, documente-a e preserve o registro manual de refeições.

## 10. TELA DE ALIMENTAÇÃO E ANÁLISE

Quero uma experiência organizada.

Depois de salvar uma refeição:

- Exibir fotografia.
- Exibir observação.
- Exibir data.
- Confirmar que o registro foi salvo.
- Exibir o estado da análise automática, quando aplicável.

Exemplos de estados:

- Análise não habilitada.
- Aguardando processamento.
- Em processamento.
- Análise disponível.
- Não foi possível analisar.

Somente apresente um resultado se ele tiver sido efetivamente produzido por um serviço configurado e aprovado para o escopo utilizado.

---

# PRIORIDADE 3 — PERMITIR QUE TODO O GRUPO TESTE O VIVA+

## 11. OBJETIVO

Agora quero disponibilizar o sistema para os integrantes do meu grupo da faculdade.

Preciso que eles consigam testar:

**VERSÃO DO PACIENTE**

E

**VERSÃO DO PROFISSIONAL DE SAÚDE**

O objetivo é receber avaliações das funcionalidades, da aparência, da navegação e da usabilidade antes da entrega acadêmica.

Não quero que os integrantes precisem instalar ferramentas de desenvolvimento ou executar serviços locais.

Eles devem conseguir abrir links e entrar no ambiente de testes.

## 12. VERSÃO DO PACIENTE

O aplicativo web do paciente deverá ser disponibilizado em um endereço HTTPS próprio, acessível por:

- Safari no iPhone.
- Chrome no Android.
- Navegadores de computador compatíveis.

Verifique o deploy existente na Railway.

Valide:

- Página inicial.
- Acesso por convite.
- Login.
- Home.
- Medicamentos.
- Pressão.
- Alimentação.
- Fotografias.
- Atividades.
- Histórico.
- Diário.
- Consultas.
- Perfil.
- Navegação.
- Responsividade.

Quero uma experiência simples para os participantes.

Não confunda a versão web de homologação com o aplicativo iOS nativo.

## 13. VERSÃO PROFISSIONAL

O portal profissional deverá estar disponível pela Vercel, com HTTPS.

Os integrantes autorizados com perfil profissional deverão conseguir testar:

- Login.
- Dashboard.
- Cadastro de pacientes fictícios.
- Busca.
- Ficha do paciente.
- Medicamentos.
- Consultas.
- Histórico.
- Relatórios.
- Configurações.
- Vínculos.
- Funcionalidades de acompanhamento.

Verifique se o portal está utilizando corretamente a API hospedada na Railway.

Quero que as versões profissional e paciente estejam conectadas ao mesmo ambiente de homologação, respeitando o isolamento entre participantes.

## 14. CRIAR ACESSO CONTROLADO PARA OS TESTADORES

A última execução implementou convites privados.

Quero que você confira essa implementação e conclua o fluxo.

Preciso conseguir cadastrar integrantes como testadores.

Cada convite deve possuir:

- Identificador único.
- Perfil autorizado.
- Prazo de validade.
- Possibilidade de revogação.
- Proteção contra reutilização indevida.
- Associação ao usuário.
- Registro de utilização.

### Perfis

Quero dois tipos principais de testadores:

**Paciente demonstrativo**

Acessa o ambiente do paciente e testa as funcionalidades previstas.

**Profissional demonstrativo**

Acessa o portal profissional e testa as funcionalidades correspondentes.

Preserve a autenticação segura do profissional.

Não conceda permissões administrativas desnecessárias.

### Segurança

Utilize exclusivamente dados fictícios.

Não exponha publicamente o modo local de autenticação apenas com CPF e nascimento.

Os convites devem restringir o acesso dos participantes ao ambiente de homologação e não substituir indevidamente a autenticação segura dos dados protegidos.

Se for necessário um mecanismo adicional de autenticação para os participantes, implemente uma opção simples e segura.

## 15. CRIAR UMA ÁREA DE GERENCIAMENTO DOS TESTADORES

Quero uma forma simples de administrar os participantes.

Se possível, crie no portal uma área administrativa restrita chamada:

**Grupo de testes**

Funcionalidades desejadas:

- Adicionar testador.
- Selecionar perfil.
- Gerar convite.
- Consultar status.
- Revogar acesso.
- Identificar convites expirados.
- Consultar data de utilização.
- Desativar participante.
- Reemitir convite quando necessário.

Não exponha os links privados em telas acessíveis a outros usuários.

Não envie convites automaticamente por e-mail ou SMS sem confirmação do canal e autorização.

## 16. DISPONIBILIZAR OS LINKS CORRETOS

Ao concluir, quero receber:

**Link da versão do paciente**

Endereço HTTPS real, validado no ambiente de homologação.

**Link da versão profissional**

Endereço HTTPS real, validado no ambiente de homologação.

**Link ou procedimento para convidar testadores**

Instruções de como criar e compartilhar o acesso.

Não invente URLs nem declare serviços publicados sem verificar o deploy.

## 17. PREPARAR DADOS PARA DEMONSTRAÇÃO

Quero que o grupo consiga testar as telas sem precisar cadastrar tudo manualmente.

Prepare dados sintéticos controlados, como:

- Pacientes fictícios.
- Medicamentos fictícios.
- Registros de pressão.
- Refeições.
- Fotografias de teste não pessoais.
- Consultas.
- Exercícios.
- Diário.
- Histórico.

Separe os ambientes ou contas para que os testes dos integrantes não prejudiquem uns aos outros.

Não inclua credenciais reais ou senhas ativas em documentos públicos.

## 18. CRIAR UM GUIA SIMPLES PARA O GRUPO

Crie:

`docs/GUIA_TESTES_GRUPO_VIVAMAIS.md`

O guia deverá ser escrito para pessoas que não são desenvolvedoras.

Inclua:

### Testadores pacientes

1. Como receber o convite.
2. Como acessar o Viva+.
3. Como entrar.
4. Como registrar pressão.
5. Como registrar medicamento.
6. Como fotografar uma refeição.
7. Como consultar histórico.
8. Como testar exercícios.
9. Como relatar problemas.

### Testadores profissionais

1. Como receber o convite.
2. Como acessar o portal.
3. Como entrar.
4. Como cadastrar paciente fictício.
5. Como consultar pacientes.
6. Como visualizar medicamentos.
7. Como consultar registros.
8. Como testar relatórios.
9. Como registrar problemas.

### Compatibilidade

Inclua instruções para:

- iPhone.
- Android.
- Computador.

### Registro de erros

Oriente os participantes a informar:

- Dispositivo utilizado.
- Sistema operacional.
- Navegador.
- Tela.
- Ação realizada.
- Erro encontrado.
- Resultado esperado.
- Captura, quando possível.

Não solicite dados pessoais ou clínicos reais.

---

# PRIORIDADE 4 — TESTES COMPLETOS

## 19. TESTAR A INTEGRAÇÃO NA NUVEM

Verifique o funcionamento real de:

- Railway.
- API Spring Boot.
- Supabase PostgreSQL.
- Supabase Storage.
- Vercel.
- Autenticação.
- Convites.
- Dados.
- Fotografias.
- Histórico.
- Medicamentos.

Diferencie os testes locais dos testes realizados contra os serviços efetivamente implantados.

## 20. TESTES DE SEGURANÇA

Confirme:

- HTTPS.
- Chaves secretas somente no backend.
- Bucket privado.
- Isolamento entre pacientes.
- Autorização profissional.
- Acesso dos convidados.
- Proteção contra envio de arquivos maliciosos.
- Validação de conteúdo.
- Limitação de upload.
- Proteção de logs.
- Tratamento de sessões.
- Revogação de acesso.

Não desabilite controles de segurança apenas para facilitar os testes do grupo.

## 21. REGRESSÃO

Execute os testes adequados:

- Java.
- PostgreSQL.
- Frontend.
- E2E.
- TypeScript.
- Lint.
- Next.js.
- Expo.
- Upload de fotografias.
- Armazenamento privado.
- Medicamentos.
- Convites.
- Acesso do paciente.
- Acesso profissional.

Não declare sucesso sem evidência.

---

# PRIORIDADE 5 — DOCUMENTAÇÃO

## 22. ATUALIZAR DOCUMENTOS

Atualize:

- `README.md`
- `PROGRESSO.md`
- `STATUS.md`
- `PROXIMA_EXECUCAO.md`
- Inventário de funcionalidades.
- Guia de testes.
- Documentação de armazenamento.
- Documentação de IA.
- Documentação de convites.
- Guia de homologação.

Crie um relatório específico:

`docs/evidencias/VALIDACAO_FOTOS_IA_E_TESTES_GRUPO.md`

Esse relatório deverá informar:

### Fotografias
- Causa do erro.
- Correção.
- Formatos aceitos.
- Limites.
- Tratamento de imagens de iPhone.
- Testes.
- Evidências.

### Inteligência artificial
- Estado real.
- Provedor utilizado, se houver.
- Funcionalidades ativas.
- Funcionalidades simuladas.
- Processamento realizado.
- Testes.
- Pendências.

### Grupo
- Portal profissional.
- Aplicativo do paciente.
- Links.
- Convites.
- Gestão de testadores.
- Testes realizados.
- Pendências.

---

# 23. CONTROLE DE CUSTOS

Antes de utilizar serviços adicionais pagos:

1. Verifique planos.
2. Verifique limites.
3. Consulte possíveis cobranças.
4. Informe o custo.
5. Solicite autorização.

Não contrate serviços de IA, armazenamento ou distribuição sem minha aprovação.

Reutilize os recursos existentes quando possível.

---

# 24. PRESERVAÇÃO

- Não reinicie o projeto.
- Não descarte alterações locais.
- Não apague dados existentes.
- Não modifique migrações Flyway aplicadas.
- Não publique credenciais.
- Não exponha o banco.
- Não disponibilize dados reais.
- Não faça merge automático de PRs.
- Não utilize force push.
- Não altere a autenticação real para torná-la insegura.
- Não declare IA ativa sem comprovação.
- Não declare testes em iPhone concluídos sem executá-los.

---

# RESULTADO FINAL OBRIGATÓRIO

Quero receber uma resposta organizada com:

**1. Fotografias**

O que causava o erro, como foi corrigido e se agora consigo enviar fotos normalmente pelo iPhone.

**2. Inteligência artificial**

Se a IA realmente analisa as refeições, qual tecnologia está sendo utilizada, o que ela consegue identificar e o que ainda não funciona.

**3. Versão do paciente**

Link HTTPS validado, como entrar e quais funcionalidades posso testar.

**4. Versão profissional**

Link HTTPS validado, como entrar e quais funcionalidades posso testar.

**5. Convites**

Como adicionar integrantes, criar convites, revogar acessos e separar os perfis.

**6. Testes**

Resultados dos testes automatizados e manuais, especialmente envio de imagens e acesso às duas versões.

**7. Documentação**

Arquivos atualizados e guia para o grupo.

**8. Pendências**

Somente as dependências que realmente não puderam ser resolvidas, com explicação e próximo passo.

---

# INSTRUÇÃO FINAL

Quero que você comece corrigindo o problema das fotografias apresentado no print.

**NÃO É ACEITÁVEL QUE O PACIENTE PRECISE COMPRIMIR MANUALMENTE TODAS AS FOTOS PARA CONSEGUIR UTILIZAR A FUNCIONALIDADE.**

Depois, investigue se a inteligência artificial realmente está processando essas imagens.

Em seguida, finalize o acesso dos integrantes do grupo às duas versões do sistema:

- Viva+ Paciente.
- Viva+ Profissional.

Quero que todos possam testar com segurança, utilizando dados fictícios e convites individuais.

Estou disponível para realizar procedimentos manuais no PowerShell ou nos painéis dos provedores, caso seja realmente necessário.

Preserve o código existente e aproveite a infraestrutura de Railway, Supabase e Vercel já preparada.

**NÃO ENCERRE APENAS COM UM RELATÓRIO. IMPLEMENTE, TESTE E DISPONIBILIZE AS FUNCIONALIDADES QUE ESTIVEREM AO SEU ALCANCE.**

COMECE AGORA.