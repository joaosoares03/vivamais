# Sessões, matriz de acesso e compartilhamento — 12/11/2026

Base: `4411125f1f0ffc3c36d3317b8464410423daac32` da `main`. Branch de Lucas: `lucas/corrige-sessoes-e-validacao-20261112`. Os PRs #1 e #6 já foram integrados por João; esta é uma entrega posterior, preservando também os PRs #7–#12.

## Estado das três frentes

| Frente | Resultado |
| --- | --- |
| Origem da sessão nativa | Implementada; regressões de restauração, expiração, offline, sessões antigas e saída aprovadas. |
| Matriz de CPF e convite | Implementada em teste de navegador e job independente na CI, com API/PostgreSQL sintéticos. |
| Paciente → profissional | Validado localmente em três percursos com o mesmo ID de paciente e atividade persistida. Homologação remota ainda não executada: Lucas informou que precisa de novo convite. |

Nenhuma alteração de migration V1–V18, POM Java, contrato OpenAPI ou código G16/G17. Nenhum merge no principal, deploy, instalação nativa ou uso de dados reais foi realizado pelo agente nesta entrega.

## Correção da sessão

O app salvava token, validade e usuário no cofre nativo, mas a origem (`PACIENTE` ou `TESTADOR`) existia só em memória. Ao reabrir com uma sessão de convite válida, a pessoa correta era autenticada, porém o indicador de origem ficava falso. A tela de configurações passava a mostrar instruções e controles de CPF/código para aquela sessão.

O formato protegido agora inclui `origemAcesso`. A restauração recupera esse dado, valida a sessão no servidor e distingue origem conhecida de desconhecida. A função exclusiva de desautorizar o aparelho recusa origens que não sejam `PACIENTE`, mesmo se chamada fora da tela.

**Sessões antigas:** continuam compatíveis. No build que só aceita CPF, preservam o comportamento anterior. No build misto, sem origem registrada, recebem orientações neutras e não liberam controles exclusivos até a origem ser confirmada pela renovação. Ao sair de uma sessão de origem desconhecida, a mensagem orienta procurar a equipe.

**Expiração e falta de rede:** o token expirado não é retornado como sessão nem conservado no cofre. Permanece apenas um marcador protegido `{somenteOrigem:true, origemAcesso:...}`, usado para escolher o canal de renovação. Esse marcador não contém token, não autentica e não libera leitura offline. A renovação depende da credencial e da autorização do servidor.

Foram reproduzidos dois casos adicionais com credenciais de ambos os canais disponíveis: o convite expirado não deve renovar uma conta de CPF; e uma origem CPF recusada não deve migrar automaticamente para outra sessão de convite. Ambos foram corrigidos. O marcador também mantém a preferência correta após expirar sem rede e reabrir mais tarde. Saída explícita remove a sessão/marcador e a renovação do convite.

No navegador, token e origem não são persistidos pelo adaptador do cofre. Cookies HttpOnly e as regras existentes de renovação permanecem como autoridade do acesso web. Nenhuma informação local passa a conceder papel, unidade ou vínculo no backend.

**Arquivos principais:**

- `services/autenticacao/contratoSessao.ts`: interpretação compatível e separação entre sessão válida e marcador de origem.
- `services/autenticacao/armazenamentoSessao.ts`: persistência protegida e descarte do token mantendo somente a preferência de canal.
- `contexts/ContextoAutenticacao.tsx`: gravação, restauração e renovação com a origem correta.
- `app/configuracoes.tsx`: instruções e ações conforme a origem confirmada.

## Testes de sessão

`tests/mobile/restauracao-sessao.test.tsx` exercita o Provider real com API e SecureStore simulados; `tests/mobile/origem-sessao-protegida.test.ts` verifica o contrato do cofre. Os 29 cenários novos cobrem:

- restauração de CPF e convite válidos, sem renovação desnecessária;
- gravação da origem após cada tipo de entrada;
- CPF → saída → convite → reabertura;
- compatibilidade com sessão antiga, incluindo origem desconhecida;
- expiração, duas credenciais disponíveis e ausência de troca automática de canal conhecido;
- falta de rede, marcador sem token e reabertura posterior;
- saída, revogação e bloqueio de desautorização pelo canal errado;
- descarte de metadados inválidos e ausência de gravação de token no navegador.

O Vitest mobile agora descobre `.test.tsx` com ambiente JSDOM explícito para esse Provider. `@testing-library/react` 16.3.0 e `jsdom` 27.0.0 foram declarados na raiz: são as mesmas versões já usadas pelo portal. O lockfile acrescenta apenas os importadores da raiz, sem mudar versões resolvidas ou dependências de produção.

## Matriz automatizada e CI

`playwright.acesso.config.ts` executa quatro cenários em `tests/acesso/matriz-acesso.spec.ts`:

| Build | Percurso | Verificações |
| --- | --- | --- |
| Seguro | CPF + nascimento + código | Ativação, reabertura, atividade compartilhada, saída, novo acesso e desautorização. |
| Seguro | Convite indisponível | Não oferece convite; a rota retorna ao acesso por CPF. |
| Com convites | CPF + nascimento + código | Mesmo ciclo do build seguro, no build que aceita os dois canais. |
| Com convites | Convite individual | Entrada, reabertura, instruções corretas, atividade compartilhada, recusa por outra unidade e revogação. |

O job novo `access-matrix` tem PostgreSQL, API, credenciais e arquivos próprios. A unidade A é usada no CPF/SMS LOCAL; a B, nos convites sintéticos. O job `browser` anterior foi preservado, com sua configuração original. Nenhum limite de segurança foi aumentado, desativado ou zerado para aprovar os testes.

O teste cria dados apenas contra API e portal em loopback. Uma configuração com host remoto é recusada antes de iniciar os servidores. A suíte de massa local não é um executor de testes contra a homologação.

As credenciais de CI são aleatórias e mascaradas; os convites não aparecem nas evidências públicas. O artefato `acesso-compartilhado-*` contém somente IDs sintéticos e resultados das conferências, sem token, senha, CPF ou fotografia.

## Prova de compartilhamento local

Cada percurso positivo registra uma atividade fictícia pela interface do paciente. O teste confere:

1. o ID do paciente no endpoint do POST;
2. o `patientId` e o ID da resposta persistida;
3. a consulta autenticada do profissional, contendo essa mesma atividade, paciente, texto e duração;
4. a célula da tabela na ficha do paciente correto;
5. a persistência após recarregar o portal.

Há três atividades distintas nessa prova: CPF no build seguro, CPF no build com convites e convite no build com convites. O acesso de um profissional de outra unidade à atividade do paciente do convite retorna 403.

[Resumo sanitizado](sessoes-validacao-20261112/validacao.json) · [IDs e resultados do compartilhamento](sessoes-validacao-20261112/compartilhamento.json).

Esta evidência confirma o fluxo local com ficha e vínculo conhecidos. Não comprova a identidade das contas usadas em 06/11 na nuvem nem estabelece a causa daquele incidente remoto.

## Validação desta entrega

| Verificação | Resultado |
| --- | --- |
| Instalação com lockfile congelado | Aprovada. |
| TypeScript e lint | Aprovados, incluindo teste mobile TSX, matriz e configuração Playwright. |
| Portal Vitest | 69 aprovados. |
| App Vitest | 124 aprovados, incluindo 29 regressões novas de sessão/cofre. |
| Matriz Playwright | 4 aprovados, sem retries ou testes ignorados. |
| Bateria Playwright anterior | 18 aprovados, sem retries ou testes ignorados, com OCR real. |
| Build do portal | Aprovado. |
| Export Expo web seguro e com convites | Aprovados no código final; não são APK/IPA. |
| YAML da CI | Válido; job `browser` anterior conferido sem alteração. |
| Configuração com portal remoto | Recusada como esperado. |
| Migrations, contrato gerado e POM | Preservados. |
| Auditoria pnpm | Zero críticos/altos; seis moderados e dois baixos. Gate `high` retorna 0. |
| Gitleaks v8.30.1 | Zero achados nos 700 arquivos de texto versionados/novos não ignorados; 816 binários excluídos desse escopo. |

**Total local desta entrega: 215 testes distintos aprovados** (69 portal + 124 app + 4 matriz + 18 bateria anterior). Os 29 testes novos de sessão/cofre já estão incluídos nos 124 do app; reexecuções não foram somadas. A API e os servidores das baterias foram encerrados ao final.

A API foi empacotada com testes Java pulados para servir às suítes de navegador. Não se declarou nova execução local dos testes Java. O job Java original da CI permanece responsável pela sua bateria e pela auditoria OWASP/NVD. O novo job não substitui nenhum gate antigo.

Logs completos, runtime e credenciais ficam em `.local/sessoes-validacao-20261112`, ignorado pelo Git. Não publicar XML Maven ou logs brutos com propriedades do processo. Schemas de desenvolvimento e validação foram separados e preservados; não houve restauração sobre o schema da aplicação existente.

O scan local de segredos usa snapshot dos arquivos UTF-8 listados pelo Git, sem arquivos privados ignorados. O relatório inclui contagem e escopo; não representa inspeção de conteúdo binário nem substitui o job de segredos da CI, que examina o histórico do Git.

## Tentativas e correções durante a validação

- Regressão de origem: o código anterior falhou nos novos testes de persistência/restauração. A prova original tinha um defeito confirmado; falhas de novas asserções não foram contadas como defeitos distintos de produto.
- Expiração: dois casos com outra credencial disponível falharam antes da preservação da origem; a renovação agora permanece no canal conhecido.
- Portal: uma execução inicial atingiu o timeout de 5 segundos de `CadastroPaciente.test.tsx` durante compilações concorrentes. Reexecução sem essa carga passou; não houve aumento de timeout nem alteração do componente.
- Matriz, rodada 1: três falhas de asserção porque o teste usava `duration_minutes`; o contrato público usa `durationMinutes`. Corrigido o teste, preservando a conferência do valor e acrescentando `patientId`.
- Matriz, rodada 2: o texto da atividade aparecia na tabela e no cartão responsivo. A asserção passou a usar a célula acessível da tabela, evitando seletor ambíguo.
- Matriz, rodada 3: duas entradas recusadas com 429 após repetir contas na mesma instância. A CI foi organizada em job independente, e o fechamento local usou instâncias separadas. Os limites de 10 entradas por e-mail/15 minutos e 40 por IP permaneceram intactos.
- A bateria anterior e a matriz já passaram em rodadas preliminares; os arquivos sanitizados desta entrega usam os resultados definitivos, sem somar repetições.

## Pendência para homologação

O portal público foi aberto no navegador do Codex e mostrou o formulário de acesso. Lucas informou **“Preciso de novo convite”**. Nenhuma conta autenticada estava disponível nessa sessão. Não foram usadas credenciais do proprietário, convites antigos consumidos ou arquivos privados da administração.

Para concluir a frente remota, são necessários:

1. novos acessos individuais de profissional e paciente **vinculados à mesma ficha sintética**, emitidos pelo responsável;
2. confirmação dos commits implantados da API/app do paciente e do portal; o SHA da API é consultável pela administração em `/actuator/info`;
3. entrada no próprio portal, com senha digitada somente na interface, seguida do teste de atividade fictícia e conferência da ficha.

Os SHAs dos dois serviços devem ser registrados e sua compatibilidade conferida; não se presume deploy pela existência de um merge. Não é necessário fornecer chave, senha administrativa ou dados reais.

Quando os acessos estiverem disponíveis, usar uma atividade de teste única, conferir nome, duração e horário no histórico do paciente e na ficha vinculada, recarregar ambas as interfaces e registrar o resultado. Sem esses acessos, o estado remoto continua **NÃO EXECUTADO — AGUARDANDO CONVITES**, mesmo com o fluxo local aprovado.

## Limites e próximos passos

A sessão nativa foi exercitada com SecureStore e API simulados em JSDOM. Não houve teste físico em Android/iPhone nem novo APK/IPA. A mudança é de código; builds nativos instalados anteriormente não a recebem automaticamente.

A consulta de dependências de 12/11 detectou novos avisos baixos/moderados de `node-forge` 1.4.2, além dos avisos anteriores. O auditor indica 1.4.3 como versão corrigida para esses novos avisos; atualização de dependências e alinhamento do Expo devem ser uma mudança própria, com regressão. Nenhum alerta foi suprimido nesta entrega.

Próximos passos: revisão do PR desta branch e CI; João decide o merge e o deploy. A confirmação autenticada na homologação aguarda o par de acessos acima. Fornecedor alimentar externo, dados reais, produção clínica e decisões de prescrição continuam fora desta execução.
