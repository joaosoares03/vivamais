# VIVA+ — RETOMAR IMPLANTAÇÃO NA NUVEM E DISPONIBILIZAR O SISTEMA PARA TESTES NO IPHONE E ANDROID

Quero que você retome imediatamente a última execução do projeto Viva+, interrompida pelo limite de utilização do Codex.

**A PENDÊNCIA DA CHAVE DO SUPABASE JÁ FOI RESOLVIDA.**

Eu já adicionei e salvei a variável `SUPABASE_SECRET_KEY` no serviço correspondente da Railway.

Agora quero que você continue a implantação exatamente de onde parou, aproveitando os recursos já criados, as integrações conectadas e todo o código existente.

**Estou em casa e tenho acesso ao PowerShell. Caso alguma operação precise ser executada manualmente fora da sandbox, você pode me enviar o comando exato.**

Não reinicie a implantação do zero.

## 1. CONTEXTO DO PROJETO

Diretório local:

`C:\Users\joaos\Documents\Codex\2026-10-16\p\outputs\viva-mais-pr-1`

Repositório GitHub:

`https://github.com/joaosoares03/vivamais`

Na última execução, foram criados e configurados recursos nos seguintes provedores:

**Railway**
- Projeto: VivaMais Demo.
- Serviço para a API Spring Boot.
- Variáveis de ambiente e chaves de criptografia.
- Configuração inicial de TLS.

**Supabase**
- Organização: VivaMais.
- Projeto: VivaMais Homologacao.
- Região: São Paulo.
- Plano gratuito aprovado de US$ 0/mês.
- PostgreSQL.
- Usuário restrito para a API.
- Schema privado.
- Bucket privado para arquivos.

**Vercel**
- Projeto criado para o portal profissional.
- Conta conectada e acesso ao projeto confirmado.

Os três conectores já foram autorizados no ChatGPT.

Antes de criar qualquer novo recurso, verifique o que já existe.

## 2. PRIMEIRA PRIORIDADE — CONFIRMAR A CHAVE DO SUPABASE

Acabei de adicionar:

`SUPABASE_SECRET_KEY`

na Railway.

Quero que você:

1. Verifique se a variável existe.
2. Confirme que está no serviço correto.
3. Confirme que pertence ao ambiente de homologação correto.
4. Verifique se a aplicação consegue utilizá-la.
5. Não revele nem registre o valor da chave.
6. Não envie essa chave para o frontend.
7. Não inclua essa chave em arquivos versionados.
8. Verifique se o serviço necessita de redeploy para aplicar a configuração.

A chave deverá permanecer disponível apenas ao backend autorizado.

## 3. RETOMAR A IMPLANTAÇÃO DA API NA RAILWAY

Continue a configuração do backend Spring Boot.

Verifique:

- Java 21.
- Maven.
- Comando de build.
- Comando de inicialização.
- Variáveis de ambiente.
- Perfil de homologação.
- Configuração de memória.
- Porta disponibilizada pela Railway.
- Conexão PostgreSQL.
- Certificados e TLS.
- Armazenamento privado.
- Logs.
- Health checks.
- Tratamento de erros.
- Segurança de autenticação.

Utilize os arquivos de implantação já preparados anteriormente.

Não recrie configurações existentes sem necessidade.

### Objetivo

Quero que a API esteja acessível por HTTPS em um endereço de homologação e responda corretamente às verificações de saúde.

Não coloque dados reais de pacientes nesse ambiente.

## 4. CONFIGURAR E VALIDAR O BANCO SUPABASE

Verifique o projeto VivaMais Homologacao.

Confirme:

- Conexão com PostgreSQL.
- Permissões do usuário restrito.
- Schema privado.
- Políticas de segurança.
- Migrações Flyway.
- Índices.
- Restrições.
- Integridade dos dados.
- Separação entre usuários.
- Configurações de backup disponíveis no plano.
- Possibilidade de restauração.

Execute as migrações necessárias no ambiente de homologação de forma controlada.

Não utilize o banco local de desenvolvimento como banco público.

Não copie dados reais ou privados para o Supabase.

Utilize somente dados sintéticos.

## 5. INTEGRAR O STORAGE PRIVADO

Quero concluir a integração de imagens e arquivos com o Supabase Storage.

Verifique:

- Bucket privado.
- Credencial configurada.
- Upload autenticado.
- Download autorizado.
- Controle de acesso por paciente.
- URLs temporárias quando apropriado.
- Proteção contra acesso a arquivos de outros usuários.
- Limites de tamanho.
- Tipos de arquivo permitidos.
- Tratamento de falhas.
- Exclusão e retenção de arquivos.
- Segurança dos metadados.

Teste o fluxo de ponta a ponta:

1. Paciente autorizado envia uma foto de refeição.
2. Backend recebe a solicitação.
3. Arquivo é armazenado no bucket privado.
4. Registro é salvo no PostgreSQL.
5. O próprio paciente pode consultar sua foto.
6. Profissional autorizado pode visualizar a informação quando permitido.
7. Outro paciente não consegue acessar o arquivo.

Não exponha o bucket como público.

## 6. PUBLICAR O PORTAL PROFISSIONAL NA VERCEL

O projeto Vercel já foi criado.

Quero que você:

1. Confirme o projeto existente.
2. Verifique as configurações de build Next.js.
3. Configure as variáveis de ambiente necessárias.
4. Utilize o endereço HTTPS da API Railway.
5. Execute o build.
6. Faça o deploy de homologação.
7. Verifique o funcionamento das rotas.
8. Teste o login profissional.
9. Teste o cadastro de pacientes.
10. Teste a consulta de informações.
11. Teste medicamentos, histórico e relatórios.
12. Verifique as permissões e o isolamento de dados.

Não exponha variáveis secretas em configurações públicas do Next.js.

Não utilize credenciais fictícias como credenciais de produção.

## 7. PREPARAR O ACESSO PELO IPHONE

Esta é uma das minhas maiores prioridades.

Quero conseguir abrir o Viva+ no iPhone sem depender do computador ligado.

Inicialmente, utilizaremos uma versão de homologação acessível pelo Safari.

### Requisitos

- Endereço HTTPS.
- Interface adaptada ao iPhone.
- Navegação responsiva.
- Fonte legível.
- Botões acessíveis.
- Funcionamento dos formulários.
- Integração com API.
- Sessão segura.
- Acesso por convite.
- Dados de demonstração.
- Carregamento adequado.
- Tratamento de erros.

Não utilize `localhost` nem `127.0.0.1` como endereço da API na versão compartilhada.

Verifique se a versão web do aplicativo pode ser disponibilizada utilizando a infraestrutura escolhida, sem confundir o aplicativo do paciente com o portal profissional.

Se a versão web precisar de serviço ou configuração adicional, identifique a alternativa que aproveite os recursos existentes e informe custos antes de criar recursos pagos.

Não apresente a versão Safari como equivalente a um aplicativo iOS nativo. Registre as limitações de câmera, notificações e armazenamento protegido que dependerem de testes nativos.

## 8. PREPARAR TESTES PARA O GRUPO

Quero que os integrantes do grupo consigam testar o Viva+ nos próprios celulares.

O sistema deve funcionar em:

- Android.
- iPhone.
- Navegadores móveis compatíveis.

Não quero que cada integrante precise instalar ferramentas de programação ou manter o computador conectado.

### Convites privados

Na execução anterior, foi implementada uma estrutura de convites individuais.

Verifique e conclua:

- Geração de convite.
- Validade.
- Revogação.
- Uso individual.
- Associação ao participante.
- Prevenção de reutilização.
- Controle de acesso.
- Isolamento de dados.
- Interface de gerenciamento.

O convite não deve substituir indevidamente os controles de autenticação necessários para proteger informações de saúde.

Para o ambiente compartilhado, utilize apenas dados sintéticos e contas de testes controladas.

**Não exponha publicamente o login demonstrativo apenas com CPF e nascimento.**

Esse modo deve continuar restrito ao ambiente local e isolado.

## 9. FINALIZAR AS MELHORIAS DE MEDICAMENTOS

A última execução também implementou melhorias importantes no módulo de medicamentos.

Foram informados:

- Agenda por período.
- Dosagem cadastrada.
- Resumo diário.
- Calendário.
- Histórico.
- Registro do horário efetivo.
- Prevenção de doses duplicadas.
- Preservação dos planos anteriores.
- Sincronização offline.

Quero que você verifique essas funcionalidades no ambiente implantado.

Valide:

1. Visualização dos medicamentos.
2. Programação diária.
3. Barra de progresso.
4. Confirmação de dose tomada.
5. Registro de dose não tomada.
6. Histórico por período.
7. Calendário.
8. Alteração de horários pelo profissional.
9. Preservação de registros anteriores.
10. Persistência no PostgreSQL.
11. Isolamento entre pacientes.

Corrija eventuais erros de integração.

Não invente prescrições ou orientações clínicas.

## 10. CORRIGIR A EXPORTAÇÃO EXPO

Na execução anterior, a exportação Expo apresentou uma falha relacionada à gravação de arquivos temporários pelo compilador Hermes.

Você informou que utilizaria uma pasta de trabalho gravável para resolver o problema.

Verifique se essa correção já foi concluída.

Caso contrário:

1. Consulte o erro original.
2. Identifique a causa.
3. Utilize diretórios graváveis autorizados.
4. Preserve bibliotecas nativas.
5. Repita a exportação.
6. Verifique os resultados Android, iOS e web conforme aplicável.

Não desabilite recursos importantes apenas para obter sucesso artificial no build.

## 11. TESTES DE INTEGRAÇÃO COMPLETOS

Após a implantação, execute testes adequados ao ambiente de homologação.

### Backend

- API.
- PostgreSQL.
- Migrações.
- Autenticação.
- Autorização.
- Convites.
- Medicamentos.
- Armazenamento.
- Tratamento de erros.

### Portal

- Login.
- Dashboard.
- Cadastro.
- Busca.
- Histórico.
- Medicamentos.
- Consultas.
- Relatórios.
- Configurações.

### Aplicativo

- Acesso por convite.
- Home.
- Pressão.
- Medicamentos.
- Alimentação.
- Fotos.
- Atividades.
- Histórico.
- Diário.
- Consultas.
- Perfil.
- Navegação.

### Segurança

- HTTPS.
- Proteção das variáveis.
- Controle de acesso.
- Isolamento dos pacientes.
- Links de arquivos privados.
- Configurações CORS.
- Sessões.
- Bloqueio de autenticação demonstrativa insegura.
- Ausência de dados reais no ambiente.

Não declare os testes concluídos sem executá-los.

Diferencie testes automatizados, testes manuais e verificações que dependem de aparelho físico.

## 12. CONTROLE DE CUSTOS

Antes de criar novos recursos pagos:

1. Verifique o plano disponível.
2. Consulte os limites.
3. Identifique possíveis cobranças.
4. Informe o custo estimado.
5. Solicite minha autorização.

A organização Supabase VivaMais já teve o projeto gratuito de US$ 0/mês confirmado.

Isso não significa que todos os serviços dos demais provedores serão necessariamente gratuitos.

Não contrate planos, habilite serviços pagos ou aumente recursos sem minha aprovação.

## 13. ATUALIZAR A DOCUMENTAÇÃO

Atualize os documentos existentes, incluindo:

- `README.md`
- `PROGRESSO.md`
- `STATUS.md`
- `PROXIMA_EXECUCAO.md`
- Guias de implantação.
- Documentação de autenticação.
- Documentação de medicamentos.
- Guia de testes.
- Guia de distribuição para o grupo.

Atualize especialmente:

`docs/operations/IMPLANTACAO_NUVEM_2026-11-04.md`

Documente:

- Recursos criados.
- Configurações aplicadas.
- URLs.
- Versões implantadas.
- Migrações executadas.
- Testes.
- Custos.
- Segurança.
- Pendências.
- Procedimentos para atualização.
- Procedimentos para recuperação.

Não inclua chaves, senhas ou tokens nos documentos.

## 14. PRESERVAÇÃO DO PROJETO

- Não reinicie o Viva+ do zero.
- Não descarte alterações locais.
- Não apague os recursos já criados.
- Não execute comandos Git destrutivos.
- Não modifique migrações aplicadas.
- Não exponha dados reais.
- Não publique chaves de API.
- Não abra acesso público ao PostgreSQL.
- Não desabilite autenticação e autorização.
- Não faça merge automático do PR #1.
- Não utilize force push.
- Não publique em ambiente de produção.
- Não realize alterações pagas sem autorização.

Revise cuidadosamente o estado do Git antes de publicar qualquer versão.

Como existem alterações locais que podem ainda não estar no GitHub, não faça deploy de um commit antigo presumindo que contém todas as funcionalidades recentes.

## 15. RESULTADO FINAL ESPERADO

Quero que você apresente:

**Railway**
- Estado do backend.
- URL HTTPS.
- Resultado do deploy.
- Health checks.
- Erros, se houver.

**Supabase**
- Estado do banco.
- Migrações.
- Storage.
- Permissões.
- Testes.

**Vercel**
- URL do portal.
- Resultado do build.
- Resultado do deploy.
- Integração com a API.

**Aplicativo do paciente**
- URL para acessar pelo Safari.
- Como entrar.
- Como aceitar um convite.
- Quais funcionalidades estão disponíveis.

**Testes do grupo**
- Como convidar integrantes.
- Como acessar.
- Como registrar problemas.
- Como manter os dados separados.

**Expo**
- Resultado da exportação.
- Configuração Android.
- Configuração iOS.
- Pendências de builds nativos.

**Segurança**
- Testes executados.
- Riscos identificados.
- Pendências de produção.

**Documentação**
- Arquivos atualizados.
- Instruções de continuidade.

**Git**
- Branch atual.
- Alterações locais.
- Commits.
- Estado da publicação.

---

# INSTRUÇÃO FINAL

**A CHAVE `SUPABASE_SECRET_KEY` JÁ FOI SALVA NA RAILWAY.**

Não me solicite novamente essa configuração sem antes verificar sua existência.

Agora quero que você:

1. Confirme as configurações da Railway.
2. Conclua a integração com o Supabase.
3. Publique a API de homologação.
4. Publique o portal profissional na Vercel.
5. Disponibilize o acesso de testes pelo Safari no iPhone.
6. Valide os convites privados do grupo.
7. Teste medicamentos e os demais módulos.
8. Corrija a exportação Expo, se ainda estiver pendente.
9. Atualize a documentação.
10. Apresente as URLs reais e os resultados.

**NÃO FIQUE APENAS DOCUMENTANDO OU DESCREVENDO O QUE DEVERIA SER FEITO. EXECUTE AS ETAPAS POSSÍVEIS.**

Se encontrar um bloqueio que dependa de mim, informe exatamente o procedimento necessário, mas continue com as demais tarefas.

Estou em casa e posso utilizar o PowerShell quando for necessário.

**MEU OBJETIVO É TER O VIVA+ FUNCIONANDO EM UM AMBIENTE DE HOMOLOGAÇÃO, PARA TESTAR PELO IPHONE E COMPARTILHAR COM MEU GRUPO DA FACULDADE.**

COMECE AGORA, RETOMANDO EXATAMENTE DE ONDE PAROU.