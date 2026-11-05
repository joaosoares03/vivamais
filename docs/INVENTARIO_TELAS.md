# Inventário real das telas

## Atualização de 03/11/2026

38arquivos de tela Expo (incluindo aliases/estados) e11páginas Next, conferidos nesta revisão. A nova rota `/consultas` mostra objetivos/plano compartilhados do paciente, com paginação real, restauração de sessão e cache recente; não expõe notas internas. Acesso em Home → Minhas consultas ou Perfil → Minhas consultas. [Captura](evidencias/finalizacao-2026-11-03/fonte-ampliada-320-final/app-consultas.png).

25rotas percorridas em390/320/430 e320 com fonte ampliada;25capturas do portal em1440/768/390. Correções finais e diferenças em [fidelidade visual](FIDELIDADE_VISUAL.md). Exportação completa/retificação são controles reais da ficha, não telas adicionais. APK local e de rede foram gerados; instalação/teste manual geral no Samsung confirmados pelo proprietário, sem captura nativa coletada nesta execução. As tabelas históricas abaixo não devem ser regeneradas pelo inventariador antigo sem atualizar seus metadados de autenticação.

## Inventário de 19–20/10/2026

Gerado por `node infra/inventariar-telas.mjs`, com leitura de cada arquivo de tela e metadados revisados contra seus controles. 49 arquivos de tela encontrados: 30 rotas canônicas Expo, 11 páginas Next, seis compatibilidades Expo e dois estados de rota não encontrada. Layouts, loading/error boundaries e endpoints BFF não contam como novas telas de produto.

Classificações: **Funcional e validada** indica o escopo de navegador/API ensaiado; **Parcialmente funcional** distingue armazenamento/navegação validados de análise, conteúdo clínico, notificações ou textos institucionais incompletos; **Implementada, mas ainda não validada** não possui evidência suficiente de interação. **Pendente de implementação** é reservado às capacidades ausentes, nunca inferido apenas pela existência de rota. Notificação tem serviço implementado e ensaio do SO pendente, conforme linha própria. Não há aceite de todos os protótipos nem testes físicos.

Os resultados dos ensaios desta execução estão em [evidências locais](evidencias/EXECUCAO_LOCAL_2026-10-19.md). O checklist do usuário começa sem aprovação preenchida.

## Rota

| ID / tela | Rota / aplicação / perfil | Estado e dependências | Acesso e captura |
|---|---|---|---|
| T01 Boas-vindas | `/` · Paciente · Público | Funcional e validada. API/PostgreSQL e sessão do paciente. Acesso abre; marca/ilustração legíveis | Começar ou Cadastrar ou ativar minha conta. [Imagem](evidencias/testes-manuais/app_01_boas_vindas.png) |
| T02 Entrar | `/acesso` · Paciente · Público | Funcional e validada. API/PostgreSQL e sessão do paciente. Login válido abre Home; inválido mantém acesso | Boas-vindas → Começar. [Imagem](evidencias/acesso-paciente/acesso_paciente.png) |
| T03 Cadastro orientado | `/cadastro` · Paciente · Público | Funcional e validada. API/PostgreSQL e sessão do paciente. Explica convite e abre ativação/acesso | Boas-vindas → Cadastrar ou ativar minha conta. [Imagem](evidencias/testes-manuais/extra_cadastro_aplicativo.png) |
| T04 Ativar conta | `/ativar-conta` · Paciente · Público | Funcional e validada. API/PostgreSQL e sessão do paciente. CPF/nascimento e código de 4 números autorizam aparelho; não pede senha | Cadastro → Já tenho código: ativar conta. [Imagem](evidencias/acesso-paciente/ativacao_paciente.png) |
| T05 Home paciente | `/inicio` · Paciente · Paciente autenticado | Funcional e validada. API/PostgreSQL e sessão do paciente. Nome, resumo API, quatro módulos e rodapé acessíveis | Entrar com paciente. [Imagem](evidencias/testes-manuais/app_03_pagina_inicial.png) |
| T06 Minha Pressão | `/pressao` · Paciente · Paciente autenticado | Funcional e validada. API/PostgreSQL e sessão do paciente. Entrada abre digitação, foto e histórico | Home → Minha Pressão. [Imagem](evidencias/testes-manuais/app_04_pressao_entrada.png) |
| T07 Digitar e conferir pressão | `/pressao/digitar` · Paciente · Paciente autenticado | Funcional e validada. API/PostgreSQL e sessão do paciente. Valida valores; exige conferência antes de enviar | Minha Pressão → Digitar os valores. [Imagem](evidencias/testes-manuais/app_05_pressao_digitacao.png) |
| T08 Foto do visor e OCR | `/pressao/foto` · Paciente · Paciente autenticado | Parcialmente funcional. API/PostgreSQL, modelo Tesseract; câmera nativa depende do SO. Upload privado e OCR real exigem revisão; câmera nativa sem ensaio | Minha Pressão → Tirar foto do aparelho. [Imagem](evidencias/testes-manuais/app_06_pressao_foto.png) |
| T09 Resultado da pressão | `/pressao/resultado` · Paciente · Paciente autenticado | Funcional e validada. API/PostgreSQL e sessão do paciente. Distingue confirmação API e fila; exige id e paciente | Digitar → Salvar → Sim, está correto. [Imagem](evidencias/testes-manuais/app_07_pressao_resultado.png) |
| T10 Histórico da pressão | `/pressao/historico` · Paciente · Paciente autenticado | Funcional e validada. API/PostgreSQL e sessão do paciente. Gráfico, filtros, páginas e reconsulta de dados salvos | Minha Pressão → Ver meu histórico. [Imagem](evidencias/testes-manuais/app_08_pressao_historico.png) |
| T11 Meus Medicamentos | `/medicamentos` · Paciente · Paciente autenticado | Funcional e validada. API/PostgreSQL e sessão do paciente. Horários reais e autorrelatos persistidos; sem alterar plano | Home → Meus Medicamentos. [Imagem](evidencias/testes-manuais/app_09_medicamentos.png) |
| T12 Lembretes | `/lembretes` · Paciente · Paciente autenticado | Parcialmente funcional. Plano real; build nativo/permissão para notificação. Horários persistidos; notificação do SO indisponível no navegador | Home → Meus Lembretes ou barra → Lembretes. [Imagem](evidencias/testes-manuais/extra_lembretes_aplicativo.png) |
| T13 Foto e histórico alimentar | `/alimentacao` · Paciente · Paciente autenticado | Parcialmente funcional. API/PostgreSQL e storage; serviço/critérios alimentares pendentes. Foto/observação privadas persistem e reabrem; análise não configurada | Home → Minha Alimentação. [Imagem](evidencias/testes-manuais/app_11_alimentacao_foto.png) |
| T14 Resultado alimentar | `/alimentacao/resultado` · Paciente · Paciente autenticado | Parcialmente funcional. Id de refeição autorizado; provedor/critério aprovado pendente. Mostra foto/dados e indisponibilidade; não inventa classificação | Alimentação → Ver resultado da refeição. [Imagem](evidencias/testes-manuais/app_12_alimentacao_resultado.png) |
| T15 Entrada da atividade | `/atividade-fisica` · Paciente · Paciente autenticado | Funcional e validada. API/PostgreSQL e sessão do paciente. Abre roteiro, registro, semana, galeria e orientações | Home → Atividade Física. [Imagem](evidencias/testes-manuais/atividade_02_entrada.png) |
| T16 Estado atual informado | `/atividade-fisica/como-esta-hoje` · Paciente · Paciente autenticado | Funcional e validada. API/PostgreSQL e sessão do paciente. Três respostas; Continuar exige escolha e não libera exercício | Atividade → Ver minhas informações. [Imagem](evidencias/testes-manuais/atividade_03_como_esta_hoje.png) |
| T17 Verificação da pressão | `/atividade-fisica/verificacao-pressao` · Paciente · Paciente autenticado | Funcional e validada. API/PostgreSQL e sessão do paciente. Última medição real e escolha obrigatória | Estado atual → Continuar. [Imagem](evidencias/testes-manuais/atividade_04_verificacao_pressao.png) |
| T18 Informações da atividade | `/atividade-fisica/suas-informacoes` · Paciente · Paciente autenticado | Funcional e validada. API/PostgreSQL e sessão do paciente. Idade derivada do cadastro e perfil real; ausência explícita | Verificação da pressão → Continuar. [Imagem](evidencias/testes-manuais/atividade_05_suas_informacoes.png) |
| T19 Atividade de hoje | `/atividade-fisica/atividade-hoje` · Paciente · Paciente autenticado | Parcialmente funcional. Critérios/conteúdo clínico aprovados pendentes. Navega e mostra bloqueio de recomendação personalizada | Informações → Ver orientações da atividade. [Imagem](evidencias/testes-manuais/atividade_06_atividade_hoje.png) |
| T20 Passo a passo | `/atividade-fisica/passo-a-passo` · Paciente · Paciente autenticado | Parcialmente funcional. Material aprovado pendente. Bloqueio explícito, sem sequência clínica inventada | Atividade de hoje → Passo a passo e materiais. [Imagem](evidencias/testes-manuais/atividade_07_passo_a_passo.png) |
| T21 Vídeo | `/atividade-fisica/video` · Paciente · Paciente autenticado | Parcialmente funcional. Arquivo/autorização/material aprovados pendentes. Indica vídeo revisado não fornecido | Passo a passo → Vídeo demonstrativo. [Imagem](evidencias/testes-manuais/atividade_08_video_demonstrativo.png) |
| T22 Alternativa de atividade | `/atividade-fisica/alternativa` · Paciente · Paciente autenticado | Parcialmente funcional. Critérios clínicos aprovados pendentes. Bloqueio honesto e acesso ao registro voluntário | Atividade de hoje → Hoje preciso de algo mais leve. [Imagem](evidencias/testes-manuais/atividade_09_alternativa_mais_leve.png) |
| T23 Galeria de atividades | `/atividade-fisica/ilustracoes` · Paciente · Paciente autenticado | Funcional e validada. API/PostgreSQL e sessão do paciente. Cinco imagens; escolha preenche tipo de atividade já realizada | Atividade → Ilustrações das atividades. [Imagem](evidencias/testes-manuais/extra_ilustracoes_atividades.png) |
| T24 Registro e conclusão da atividade | `/atividade-fisica/registro` · Paciente · Paciente autenticado | Funcional e validada. API/PostgreSQL e sessão do paciente. Valida relato/minutos/data; salva ou mantém fila idempotente | Atividade → Registrar atividade realizada. [Imagem](evidencias/testes-manuais/atividade_10_registro_atividade.png) |
| T25 Semana e histórico de atividade | `/atividade-fisica/historico` · Paciente · Paciente autenticado | Funcional e validada. API/PostgreSQL e sessão do paciente. Totais completos da semana, mês/todos e paginação reais | Atividade → Ver minha semana de atividades. [Imagem](evidencias/testes-manuais/atividade_11_historico_atividades.png) |
| T26 Orientações gerais da atividade | `/atividade-fisica/orientacoes` · Paciente · Paciente autenticado | Funcional e validada. API/PostgreSQL e sessão do paciente. Explicações gerais e retorno pelo Perfil/Início | Atividade → Mensagens e orientações da atividade. [Imagem](evidencias/testes-manuais/extra_orientacoes_atividade.png) |
| T27 Meu Histórico | `/historico` · Paciente · Paciente autenticado | Funcional e validada. API/PostgreSQL e sessão do paciente. Quatro categorias; filtros e persistência conforme categoria | Home → Meu Histórico. [Imagem](evidencias/testes-manuais/extra_historico_geral.png) |
| T28 Orientações da equipe | `/mensagens` · Paciente · Paciente autenticado | Funcional e validada. API/PostgreSQL e sessão do paciente. Consulta/atualiza orientação do perfil; sem envio de chat | Barra inferior → Mensagens. [Imagem](evidencias/testes-manuais/atividade_12_orientacoes.png) |
| T29 Meu Perfil | `/perfil` · Paciente · Paciente autenticado | Funcional e validada. API/PostgreSQL e sessão do paciente. Dados reais; telefone editável reflete no portal após nova sessão | Home → Meu Perfil ou barra → Perfil. [Imagem](evidencias/testes-manuais/extra_perfil_paciente.png) |
| T30 Configurações do paciente | `/configuracoes` · Paciente · Paciente autenticado | Funcional e validada. API/PostgreSQL e sessão do paciente. Texto aumenta; sessão/saída reais; preferência persistente por conta | Home ou Perfil → Configurações e acessibilidade. [Imagem](evidencias/testes-manuais/extra_configuracoes_aplicativo.png) |
| T31 Acesso profissional | `/` · Profissional · Público | Funcional e validada. Next; revisão institucional para texto final. Login/BFF seguro e retorno ao painel | Entrar na plataforma. [Imagem](evidencias/testes-manuais/web_01_login_profissional.png) |
| T32 Painel | `/painel` · Profissional · Profissional ou administrador | Funcional e validada. Next/BFF, API/PostgreSQL e sessão autorizada. Contagens e lista no escopo autorizado | Menu → Início. [Imagem](evidencias/testes-manuais/web_02_painel_inicial.png) |
| T33 Lista/busca de pacientes | `/pacientes` · Profissional · Profissional ou administrador | Funcional e validada. Next/BFF, API/PostgreSQL e sessão autorizada. Busca por nome, estado vazio e paginação da API | Menu → Pacientes. [Imagem](evidencias/testes-manuais/extra_web_lista_pacientes.png) |
| T34 Cadastrar paciente | `/pacientes/novo` · Profissional · Profissional ou administrador | Funcional e validada. Next/BFF, API/PostgreSQL e sessão autorizada. Demografia/modalidade/vínculo e código único para APP | Menu → Cadastrar paciente. [Imagem](evidencias/testes-manuais/web_03_cadastro_paciente.png) |
| T35 Ficha do paciente | `/pacientes/{id}` · Profissional · Profissional vinculado ou administrador da clínica | Funcional e validada. Next/BFF, API/PostgreSQL e sessão autorizada. Dados, edição e abas autorizadas; id não amplia permissão | Pacientes → nome. [Imagem](evidencias/testes-manuais/web_04_perfil_paciente.png) |
| T36 Selecionar paciente para consulta | `/consultas` · Profissional · Profissional ou administrador | Funcional e validada. Next/BFF, API/PostgreSQL e sessão autorizada. Seleção abre ficha na aba Consultas; não é agenda | Menu → Consultas. [Imagem](evidencias/testes-manuais/extra_web_consultas.png) |
| T37 Selecionar paciente para relatório | `/relatorios` · Profissional · Profissional ou administrador | Funcional e validada. Next/BFF, API/PostgreSQL e sessão autorizada. Seleção leva ao resumo/JSON autorizado, sem PDF/analytics fictício | Menu → Relatórios. [Imagem](evidencias/testes-manuais/extra_web_relatorios.png) |
| T38 Configurações do portal | `/configuracoes` · Profissional · Profissional ou administrador | Funcional e validada. Next/BFF, API/PostgreSQL e sessão autorizada. Conta/unidade, gestão de vínculos e links públicos | Menu → Configurações. [Imagem](evidencias/testes-manuais/extra_web_configuracoes.png) |
| T39 Privacidade | `/privacidade` · Profissional · Público | Parcialmente funcional. Next; revisão institucional para texto final. Rascunho declarado, revisão institucional pendente | Rodapé/login → Privacidade. [Imagem](evidencias/testes-manuais/extra_web_privacidade.png) |
| T40 Suporte | `/suporte` · Profissional · Público | Parcialmente funcional. Next; revisão institucional para texto final. Rascunho; não envia mensagens nem possui canal final | Menu/rodapé → Ajuda e suporte. [Imagem](evidencias/testes-manuais/extra_web_suporte.png) |
| T41 Exclusão de conta | `/exclusao-de-conta` · Profissional · Público | Parcialmente funcional. Next; revisão institucional para texto final. Rascunho; não envia solicitação fictícia | Configurações → Solicitação de exclusão. [Imagem](evidencias/testes-manuais/extra_web_exclusao.png) |

## Compatibilidade

| ID / tela | Rota / aplicação / perfil | Estado e dependências | Acesso e captura |
|---|---|---|---|
| T42 Compatibilidade: /activate | `/activate` · Paciente · Público | Implementada, mas ainda não validada. Destino canônico/componente compartilhado; aliases públicos e módulo legado ainda sem ensaio próprio nesta etapa. /ativar-conta | Endereço antigo /activate. Sem captura própria |
| T43 Compatibilidade: /login | `/login` · Paciente · Público | Implementada, mas ainda não validada. Destino canônico/componente compartilhado; aliases públicos e módulo legado ainda sem ensaio próprio nesta etapa. /acesso | Endereço antigo /login. Sem captura própria |
| T44 Compatibilidade: /home | `/home` · Paciente · Paciente | Funcional e validada. Destino canônico/componente compartilhado; aliases públicos e módulo legado ainda sem ensaio próprio nesta etapa. /inicio | Endereço antigo /home. Sem captura própria |
| T45 Compatibilidade: /history | `/history` · Paciente · Paciente | Funcional e validada. Destino canônico/componente compartilhado; aliases públicos e módulo legado ainda sem ensaio próprio nesta etapa. /historico | Endereço antigo /history. Sem captura própria |
| T46 Compatibilidade: /profile | `/profile` · Paciente · Paciente | Funcional e validada. Destino canônico/componente compartilhado; aliases públicos e módulo legado ainda sem ensaio próprio nesta etapa. /perfil | Endereço antigo /profile. Sem captura própria |
| T47 Compatibilidade: /module/{key} | `/module/{key}` · Paciente · Paciente | Implementada, mas ainda não validada. Destino canônico/componente compartilhado; aliases públicos e módulo legado ainda sem ensaio próprio nesta etapa. Componente de cuidado para quatro chaves; disponibilidade para outras | Endereço antigo /module/{key}. Sem captura própria |

## Estado técnico

| ID / tela | Rota / aplicação / perfil | Estado e dependências | Acesso e captura |
|---|---|---|---|
| T48 Rota não encontrada | `Endereço inexistente` · Paciente · Conforme autenticação do caminho | Implementada, mas ainda não validada. Roteador. Mensagem de página não encontrada e retorno | Digitar caminho inexistente. Sem captura própria |
| T49 Rota não encontrada | `Endereço inexistente` · Profissional · Conforme autenticação do caminho | Implementada, mas ainda não validada. Roteador. Mensagem de página não encontrada e retorno | Digitar caminho inexistente. Sem captura própria |

## Aba/estado da ficha

| ID / tela | Rota / aplicação / perfil | Estado e dependências | Acesso e captura |
|---|---|---|---|
| T50 Pressão arterial | `/pacientes/{id}?aba=readings` · Profissional · Profissional vinculado/administrador; Pulseira somente BRACELET_DIARY | Funcional e validada. API/PostgreSQL; dependências externas explicitadas quando indisponíveis. Registro, filtros rápidos/manuais, gráfico/páginas | Ficha → Pressão arterial. [Imagem](evidencias/testes-manuais/web_05_historico_pressao.png) |
| T51 Medicamentos | `/pacientes/{id}?aba=medications` · Profissional · Profissional vinculado/administrador; Pulseira somente BRACELET_DIARY | Funcional e validada. API/PostgreSQL; dependências externas explicitadas quando indisponíveis. Plano, edição/versionamento e autorrelatos | Ficha → Medicamentos. [Imagem](evidencias/testes-manuais/web_06_medicamentos.png) |
| T52 Sete dias de autorrelatos | `/pacientes/{id}?aba=medications` · Profissional · Profissional vinculado/administrador; Pulseira somente BRACELET_DIARY | Funcional e validada. API/PostgreSQL; dependências externas explicitadas quando indisponíveis. Período de sete datas com totais reais | Ficha → Sete dias de autorrelatos. [Imagem](evidencias/testes-manuais/extra_web_autorrelatos_semana.png) |
| T53 Alimentação | `/pacientes/{id}?aba=meals` · Profissional · Profissional vinculado/administrador; Pulseira somente BRACELET_DIARY | Parcialmente funcional. API/PostgreSQL; dependências externas explicitadas quando indisponíveis. Fotos/histórico privados; análise externa indisponível | Ficha → Alimentação. [Imagem](evidencias/testes-manuais/web_07_alimentacao.png) |
| T54 Atividade física | `/pacientes/{id}?aba=activities` · Profissional · Profissional vinculado/administrador; Pulseira somente BRACELET_DIARY | Funcional e validada. API/PostgreSQL; dependências externas explicitadas quando indisponíveis. Registros e perfil funcional; sem prescrição automática | Ficha → Atividade física. [Imagem](evidencias/testes-manuais/web_08_atividade_fisica.png) |
| T55 Pulseira | `/pacientes/{id}?aba=device` · Profissional · Profissional vinculado/administrador; Pulseira somente BRACELET_DIARY | Parcialmente funcional. API/PostgreSQL; dependências externas explicitadas quando indisponíveis. Modalidade diário, configuração/simulador; hardware bloqueado | Ficha → Pulseira. [Imagem](evidencias/testes-manuais/web_09_configuracao_pulseira.png) |
| T56 Diário impresso | `/pacientes/{id}?aba=diary` · Profissional · Profissional vinculado/administrador; Pulseira somente BRACELET_DIARY | Funcional e validada. API/PostgreSQL; dependências externas explicitadas quando indisponíveis. Transcrição persistida e origem/autoria distintas | Ficha → Diário impresso. [Imagem](evidencias/testes-manuais/web_10_registro_diario.png) |
| T57 Formulário de consulta | `/pacientes/{id}?aba=consultations` · Profissional · Profissional vinculado/administrador; Pulseira somente BRACELET_DIARY | Funcional e validada. API/PostgreSQL; dependências externas explicitadas quando indisponíveis. Nova consulta real, campos validados | Ficha → Formulário de consulta. [Imagem](evidencias/testes-manuais/web_11_resumo_consulta.png) |
| T58 Histórico/resumo de consultas | `/pacientes/{id}?aba=consultations` · Profissional · Profissional vinculado/administrador; Pulseira somente BRACELET_DIARY | Funcional e validada. API/PostgreSQL; dependências externas explicitadas quando indisponíveis. Consulta, resumo de registros recentes e export JSON | Ficha → Histórico/resumo de consultas. [Imagem](evidencias/testes-manuais/web_12_historico_consultas.png) |
| T59 Editar cadastro | `/pacientes/{id}?aba=overview` · Profissional · Profissional vinculado/administrador; Pulseira somente BRACELET_DIARY | Funcional e validada. API/PostgreSQL; dependências externas explicitadas quando indisponíveis. Demografia validada e edição versionada | Ficha → Editar cadastro. [Imagem](evidencias/testes-manuais/extra_web_editar_cadastro.png) |

## Estado do sistema operacional (sem rota web)

| ID / tela | Rota / aplicação / perfil | Estado e dependências | Acesso e captura |
|---|---|---|---|
| T60 Notificação nativa de medicamento | `—` · Paciente · Paciente com permissão no SO | Implementada, mas ainda não validada. Build Android/iOS, permissão e aparelho; serviço local implementado, entrega não ensaiada. Navegador explica limite; entrega/aparência do SO exigem ensaio físico | Lembretes → Autorizar e agendar lembretes locais em aparelho. Sem captura própria |

## As 42 capturas anteriores e os estados repetidos

O manifesto anterior permanece em evidencias/visual/capturas.json. Seus 42 PNG não são 42 rotas: atividade_01_inicio_atividade repete a Home; atividade_12_orientacoes representa /mensagens; web_11_resumo_consulta mostra o formulário de Nova consulta; abas da ficha compartilham /pacientes/{id}; confirmação de pressão e conclusão de atividade são estados de suas rotas. O arquivo antigo app_02_acesso_cpf mostrava e-mail/senha; a revisão atual usa CPF/nascimento e aparelho autorizado, com capturas separadas em evidencias/acesso-paciente. A referência de notificação nativa não possui captura web.

## Capturas desta execução

| Arquivo | Tela ou estado |
|---|---|
| [extra_web_privacidade.png](evidencias/testes-manuais/extra_web_privacidade.png) | extra_web_privacidade |
| [extra_web_suporte.png](evidencias/testes-manuais/extra_web_suporte.png) | extra_web_suporte |
| [extra_web_exclusao.png](evidencias/testes-manuais/extra_web_exclusao.png) | extra_web_exclusao |
| [web_01_login_profissional.png](evidencias/testes-manuais/web_01_login_profissional.png) | web_01_login_profissional |
| [web_02_painel_inicial.png](evidencias/testes-manuais/web_02_painel_inicial.png) | web_02_painel_inicial |
| [web_03_cadastro_paciente.png](evidencias/testes-manuais/web_03_cadastro_paciente.png) | web_03_cadastro_paciente |
| [web_04_perfil_paciente.png](evidencias/testes-manuais/web_04_perfil_paciente.png) | web_04_perfil_paciente |
| [extra_web_editar_cadastro.png](evidencias/testes-manuais/extra_web_editar_cadastro.png) | extra_web_editar_cadastro |
| [web_05_historico_pressao.png](evidencias/testes-manuais/web_05_historico_pressao.png) | web_05_historico_pressao |
| [web_06_medicamentos.png](evidencias/testes-manuais/web_06_medicamentos.png) | web_06_medicamentos |
| [extra_web_autorrelatos_semana.png](evidencias/testes-manuais/extra_web_autorrelatos_semana.png) | extra_web_autorrelatos_semana |
| [web_07_alimentacao.png](evidencias/testes-manuais/web_07_alimentacao.png) | web_07_alimentacao |
| [web_08_atividade_fisica.png](evidencias/testes-manuais/web_08_atividade_fisica.png) | web_08_atividade_fisica |
| [web_12_historico_consultas.png](evidencias/testes-manuais/web_12_historico_consultas.png) | web_12_historico_consultas |
| [web_11_resumo_consulta.png](evidencias/testes-manuais/web_11_resumo_consulta.png) | web_11_resumo_consulta |
| [web_09_configuracao_pulseira.png](evidencias/testes-manuais/web_09_configuracao_pulseira.png) | web_09_configuracao_pulseira |
| [web_10_registro_diario.png](evidencias/testes-manuais/web_10_registro_diario.png) | web_10_registro_diario |
| [extra_web_lista_pacientes.png](evidencias/testes-manuais/extra_web_lista_pacientes.png) | extra_web_lista_pacientes |
| [extra_web_consultas.png](evidencias/testes-manuais/extra_web_consultas.png) | extra_web_consultas |
| [extra_web_relatorios.png](evidencias/testes-manuais/extra_web_relatorios.png) | extra_web_relatorios |
| [extra_web_configuracoes.png](evidencias/testes-manuais/extra_web_configuracoes.png) | extra_web_configuracoes |
| [app_01_boas_vindas.png](evidencias/testes-manuais/app_01_boas_vindas.png) | app_01_boas_vindas |
| [extra_cadastro_aplicativo.png](evidencias/testes-manuais/extra_cadastro_aplicativo.png) | extra_cadastro_aplicativo |
| [extra_ativacao_aplicativo.png](evidencias/testes-manuais/extra_ativacao_aplicativo.png) | extra_ativacao_aplicativo |
| [app_02_acesso_cpf.png](evidencias/testes-manuais/app_02_acesso_cpf.png) | app_02_acesso_cpf |
| [app_03_pagina_inicial.png](evidencias/testes-manuais/app_03_pagina_inicial.png) | app_03_pagina_inicial |
| [atividade_01_inicio_atividade.png](evidencias/testes-manuais/atividade_01_inicio_atividade.png) | atividade_01_inicio_atividade |
| [app_04_pressao_entrada.png](evidencias/testes-manuais/app_04_pressao_entrada.png) | app_04_pressao_entrada |
| [app_05_pressao_digitacao.png](evidencias/testes-manuais/app_05_pressao_digitacao.png) | app_05_pressao_digitacao |
| [app_06_pressao_foto.png](evidencias/testes-manuais/app_06_pressao_foto.png) | app_06_pressao_foto |
| [app_07_pressao_resultado.png](evidencias/testes-manuais/app_07_pressao_resultado.png) | app_07_pressao_resultado |
| [app_08_pressao_historico.png](evidencias/testes-manuais/app_08_pressao_historico.png) | app_08_pressao_historico |
| [app_09_medicamentos.png](evidencias/testes-manuais/app_09_medicamentos.png) | app_09_medicamentos |
| [app_11_alimentacao_foto.png](evidencias/testes-manuais/app_11_alimentacao_foto.png) | app_11_alimentacao_foto |
| [app_12_alimentacao_resultado.png](evidencias/testes-manuais/app_12_alimentacao_resultado.png) | app_12_alimentacao_resultado |
| [atividade_02_entrada.png](evidencias/testes-manuais/atividade_02_entrada.png) | atividade_02_entrada |
| [atividade_03_como_esta_hoje.png](evidencias/testes-manuais/atividade_03_como_esta_hoje.png) | atividade_03_como_esta_hoje |
| [atividade_04_verificacao_pressao.png](evidencias/testes-manuais/atividade_04_verificacao_pressao.png) | atividade_04_verificacao_pressao |
| [atividade_05_suas_informacoes.png](evidencias/testes-manuais/atividade_05_suas_informacoes.png) | atividade_05_suas_informacoes |
| [atividade_06_atividade_hoje.png](evidencias/testes-manuais/atividade_06_atividade_hoje.png) | atividade_06_atividade_hoje |
| [atividade_07_passo_a_passo.png](evidencias/testes-manuais/atividade_07_passo_a_passo.png) | atividade_07_passo_a_passo |
| [atividade_08_video_demonstrativo.png](evidencias/testes-manuais/atividade_08_video_demonstrativo.png) | atividade_08_video_demonstrativo |
| [atividade_09_alternativa_mais_leve.png](evidencias/testes-manuais/atividade_09_alternativa_mais_leve.png) | atividade_09_alternativa_mais_leve |
| [atividade_10_registro_atividade.png](evidencias/testes-manuais/atividade_10_registro_atividade.png) | atividade_10_registro_atividade |
| [atividade_11_historico_atividades.png](evidencias/testes-manuais/atividade_11_historico_atividades.png) | atividade_11_historico_atividades |
| [atividade_12_orientacoes.png](evidencias/testes-manuais/atividade_12_orientacoes.png) | atividade_12_orientacoes |
| [extra_perfil_paciente.png](evidencias/testes-manuais/extra_perfil_paciente.png) | extra_perfil_paciente |
| [extra_configuracoes_aplicativo.png](evidencias/testes-manuais/extra_configuracoes_aplicativo.png) | extra_configuracoes_aplicativo |
| [extra_lembretes_aplicativo.png](evidencias/testes-manuais/extra_lembretes_aplicativo.png) | extra_lembretes_aplicativo |
| [extra_ilustracoes_atividades.png](evidencias/testes-manuais/extra_ilustracoes_atividades.png) | extra_ilustracoes_atividades |
| [extra_orientacoes_atividade.png](evidencias/testes-manuais/extra_orientacoes_atividade.png) | extra_orientacoes_atividade |
| [extra_historico_geral.png](evidencias/testes-manuais/extra_historico_geral.png) | extra_historico_geral |

## Fontes conferidas

- `app/+not-found.tsx`
- `app/acesso.tsx`
- `app/activate.tsx`
- `app/alimentacao/index.tsx`
- `app/alimentacao/resultado.tsx`
- `app/ativar-conta.tsx`
- `app/atividade-fisica/alternativa.tsx`
- `app/atividade-fisica/atividade-hoje.tsx`
- `app/atividade-fisica/como-esta-hoje.tsx`
- `app/atividade-fisica/historico.tsx`
- `app/atividade-fisica/ilustracoes.tsx`
- `app/atividade-fisica/index.tsx`
- `app/atividade-fisica/orientacoes.tsx`
- `app/atividade-fisica/passo-a-passo.tsx`
- `app/atividade-fisica/registro.tsx`
- `app/atividade-fisica/suas-informacoes.tsx`
- `app/atividade-fisica/verificacao-pressao.tsx`
- `app/atividade-fisica/video.tsx`
- `app/cadastro.tsx`
- `app/configuracoes.tsx`
- `app/historico/index.tsx`
- `app/history.tsx`
- `app/home.tsx`
- `app/index.tsx`
- `app/inicio.tsx`
- `app/lembretes.tsx`
- `app/login.tsx`
- `app/medicamentos/index.tsx`
- `app/mensagens.tsx`
- `app/module/[key].tsx`
- `app/perfil.tsx`
- `app/pressao/digitar.tsx`
- `app/pressao/foto.tsx`
- `app/pressao/historico.tsx`
- `app/pressao/index.tsx`
- `app/pressao/resultado.tsx`
- `app/profile.tsx`
- `web/app/(portal)/configuracoes/page.tsx`
- `web/app/(portal)/consultas/page.tsx`
- `web/app/(portal)/pacientes/novo/page.tsx`
- `web/app/(portal)/pacientes/page.tsx`
- `web/app/(portal)/pacientes/[id]/page.tsx`
- `web/app/(portal)/painel/page.tsx`
- `web/app/(portal)/relatorios/page.tsx`
- `web/app/exclusao-de-conta/page.tsx`
- `web/app/not-found.tsx`
- `web/app/page.tsx`
- `web/app/privacidade/page.tsx`
- `web/app/suporte/page.tsx`

O JSON correspondente permite comparar uma próxima alteração de rotas com este inventário, sem recomeçar a análise. Uma captura comprova apresentação; as asserções E2E e Java/API comprovam os fluxos indicados, sem cobrir conteúdo clínico bloqueado.

Atualização V9: acesso/ativação continuam por CPF/nascimento e aparelho, agora com código por SMS; portal não exibe o código. Celular é obrigatório em novos cadastros e só a equipe altera o autenticador após conferência/senha. Configurações e navegação têm capturas responsivas no relatório [cadastro/SMS/interface](evidencias/CORRECOES_CADASTRO_SMS_INTERFACE_2026-10-20.md).
