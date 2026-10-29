# Transferência técnica — exercícios e atividades físicas

**Consolidação GitHub e transferência:** entrada técnica principal em [MANUAL_TECNICO_COMPLETO_VIVAMAIS](MANUAL_TECNICO_COMPLETO_VIVAMAIS.md), com [inventário](INVENTARIO_COMPLETO_FUNCIONALIDADES.md), [rastreio de implementação](COMO_FORAM_IMPLEMENTADAS_AS_FUNCIONALIDADES.md), [ambiente novo](GUIA_COMPLETO_AMBIENTE_DESENVOLVIMENTO.md), [testes](MANUAL_COMPLETO_TESTES_DESENVOLVEDOR.md), [banco](ARQUITETURA_BANCO_DADOS.md), [plano](PLANO_TECNICO_CONTINUIDADE_DESENVOLVIMENTO.md) e [índice](INDICE_DOCUMENTACAO.md). V9/SMS permanece vigente; histórias anteriores não autorizam login de senha do paciente.

**Integração V9 atual:** ler [cadastro/SMS](CADASTRO_E_ATIVACAO_SMS.md), [pendências por ID](LEVANTAMENTO_COMPLETO_PENDENCIAS.md) e [plano técnico](PLANO_IMPLEMENTACAO_PENDENCIAS.md). V1–V9 aplicadas são imutáveis. Código não aparece na API profissional: emissão retorna metadados de SMS. Novos pacientes exigem celular, trocas são assistidas e revogam credenciais. Para testes, somente LOCAL cifrado explicitamente habilitado; nunca SMS real implícito. Autenticação/contratos gerais continuam com dev geral; exercícios/IA continuam com o responsável delegado.

Atualização transversal de 20/10: [acesso sem senha do paciente e V8](ACESSO_PACIENTE_SEM_SENHA.md). Paciente usa CPF/nascimento e credencial de aparelho ou código de quatro números. /auth/login permanece profissional; /auth/activate foi retirado. Manter os contratos clínicos e preservar V1–V8 aplicadas. Nenhuma funcionalidade específica delegada foi alterada.

Atualizado em 22/10/2026. Responsável pela evolução específica: **outro desenvolvedor**, conforme [pedido de transferência](product/PEDIDO_TRANSFERENCIA_DEV_2026-10-20.md). As mídias aprovadas pela gestão foram integradas ao catálogo local estático 2026-10-21: ex02/ex03/ex04/ex07/ex08 no grupo com risco de queda/mobilidade reduzida e ex01/ex05/ex06/ex09/ex10 no grupo sem risco de queda/mobilidade preservada. Cada item aponta para capa, dois quadros, GIF e MP4 locais. O Perfil Funcional agora carrega approvedCatalogGroup explícito, escolhido pelo profissional: NAO_DEFINIDO, COM_RISCO_QUEDA_SENTADO ou SEM_RISCO_QUEDA_EM_PE. A escolha libera somente a visualização educativa direcionada dos cinco materiais do grupo, desde que as travas do dia estejam satisfeitas; não cria prescrição, algoritmo de risco nem autorrelato automático.

## 1. Objetivo e limite clínico

O módulo permite ao paciente consultar informações registradas pela equipe e informar atividades que já realizou. O profissional acompanha registros e mantém um perfil funcional. Público: pacientes do Viva+, incluindo idosos, e profissionais vinculados na mesma unidade.

Registro voluntário, ilustração e total de minutos não são prescrição, prova de execução, liberação clínica ou detecção de contraindicação. Não há algoritmo de exercício seguro por pressão, idade ou sintomas. A seleção “Estou bem” não autoriza atividade. As mídias locais aprovadas pela gestão são apresentadas como catálogo, nunca como liberação clínica ou recomendação personalizada.

## 2. Estado real por funcionalidade

| Item solicitado             | Estado                          | Evidência e limite                                                                                            |
| --------------------------- | ------------------------------- | ------------------------------------------------------------------------------------------------------------- |
| Avaliação inicial           | Parcial                         | Perguntas de sentimento/pressão e leitura do perfil; não é avaliação clínica validada                         |
| Como está se sentindo       | Implementado para coleta        | Contexto transitório do roteiro; registro final exige feeling explícito e o persiste com a atividade          |
| Catálogo                    | Parcial                         | Catálogo local versionado com 10 mídias aprovadas pela gestão; grupo educativo individual vinculado pelo profissional no perfil existente, sem catálogo persistido, progressão ou prescrição |
| Orientações                 | Parcial                         | Texto livre professionalGuidance informado pela equipe; não há instruções específicas aprovadas por exercício |
| Vídeos                      | Parcial                         | MP4 local por item é exibido pelo player; o grupo escolhido pelo profissional direciona cinco materiais educativos, sem protocolo clínico ou ensaio físico |
| Passo a passo               | Parcial                         | Dois quadros e GIF locais por item; nenhuma sequência clínica textual foi inventada                            |
| Registro de execução        | Implementado como autorregistro | Atividade já realizada, duração, instante, observação e sentimento; não comprova execução física              |
| Histórico                   | Implementado                    | Semana/mês/todos, filtro, paginação e ordenação; totais semanais completos no banco                           |
| Planejamento semanal        | Pendente                        | Existe resumo dos registros realizados, sem agenda/metas/exercícios programados                               |
| Integração profissional     | Implementado, com limites       | Perfil, lista/registro, autoria, resumo; não há editor de prescrição de exercícios                            |
| Regras clínicas             | Parcial                         | Grupo educativo explícito por profissional libera somente o respectivo catálogo; sem inferência de risco, protocolo ou prescrição |
| Restrições/contraindicações | Parcial                         | Campos textuais bloqueiam conservadoramente o roteiro ativo; sem motor diagnóstico ou validação clínica automatizada |
| Dispositivos                | Dependente de especificação     | Não há contador de passos/atividade, sensor ou integração fitness. Pulseira existente é de lembretes          |

“Implementado” descreve a capacidade técnica exercitada; não significa validação em aparelhos físicos ou aprovação clínica.

## 3. Mapa do código existente

Caminhos relativos à raiz do repositório, portáveis para outra máquina:

| Camada                  | Arquivos reais e função                                                                                                                                                                                                                           |
| ----------------------- | ------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------- |
| Rotas Expo              | app/atividade-fisica/index.tsx; como-esta-hoje.tsx; verificacao-pressao.tsx; suas-informacoes.tsx; atividade-hoje.tsx; passo-a-passo.tsx; video.tsx; alternativa.tsx; registro.tsx; historico.tsx; ilustracoes.tsx; orientacoes.tsx; \_layout.tsx |
| Roteiro                 | components/RoteiroAtividade.tsx seleciona etapas; contexts/ContextoAtividade.tsx e hooks/useRoteiroAtividade.ts mantêm sentimento/verificação em memória e reiniciam ao trocar conta                                                              |
| Registro                | components/TelaCuidado.tsx, função salvarAtividade; app/atividade-fisica/registro.tsx monta o módulo activity                                                                                                                                     |
| Histórico               | components/HistoricoAtividades.tsx; services/atividades/periodos.ts; histórico geral em app/historico/index.tsx                                                                                                                                   |
| Perfil e dados          | hooks/useDadosAtividade.ts; services/atividades/atividades.ts e idade.ts; hooks/useResumoPaciente.ts; services/pacientes/pacientes.ts                                                                                                             |
| Orientação da equipe    | app/mensagens.tsx; perfil funcional lido no mesmo paciente autorizado                                                                                                                                                                             |
| Recursos                | components/IlustracoesViva.tsx; components/VideoGuiadoAtividade.tsx; assets/images/exercicios/ex01-* a ex10-*; referências em referencias_codex/telas e referencias_codex/imagens_individuais/assets                                                                                    |
| Portal                  | web/components/CuidadoPaciente.tsx, TabelaCuidado.tsx, VisaoGeralPaciente.tsx; web/services/resumoPaciente.ts; ficha web/app/(portal)/pacientes/[id]/page.tsx                                                                                     |
| API                     | backend/demo/src/main/java/com/vivamais/controller/CuidadoController.java; service/CuidadoService.java; dto/ModelosCuidado.java                                                                                                                   |
| Autorização/repositório | repositories/InstituicaoRepository.java, buscarPacienteAutorizado; não existe repository JPA dedicado de exercícios                                                                                                                               |
| Modelo                  | DTOs PerfilAtividade e EntradaAtividade; consultas JDBC parametrizadas retornam mapas. Não há entidade ORM Exercicio ou catálogo persistido                                                                                                       |
| Contratos               | backend/demo/openapi.json; packages/contracts/src/generated.ts. Gerar, não editar tipos gerados à mão                                                                                                                                             |

Arquivos Java acima usam o prefixo backend/demo/src/main/java/com/vivamais/. Compartilhados TelaCuidado, CuidadoService, DTOs, BFF e migrações atendem outros módulos: coordenar alterações com o responsável geral.

## 4. Persistência e regras já aplicadas

V2\_\_care.sql cria:

- physical_activity_profile: patient_id (PK/FK), mobility e balance (300 caracteres), restrictions e professional_guidance (2.000), author_id e updated_at. Um perfil por paciente; PUT faz upsert profissional.
- activity_record: id UUID, patient_id, author_id, type (160), duration_minutes (1–1.440), occurred_at, notes (2.000), feeling (WELL/TIRED/UNWELL), created_at e synced_at. Índice por paciente/data/id.
- sync_operation: mantém a operação idempotente, ator, paciente, tipo, hash do conteúdo e resposta. Mesmo UUID com outro conteúdo/ator recebe 409.

V5 habilita RLS e revoga acesso direto de PUBLIC/anon/authenticated. O JDBC proprietário aplica autorização por organização e vínculo; RLS não substitui esse filtro. V6 acrescenta nascimento usado para idade. V7 guarda preferências de apresentação e não é plano de atividade. Nenhuma migração V1–V7 deve ser reescrita.

## 5. Contratos existentes

Prefixo /api/v1, autenticação Bearer. Paciente só acessa o próprio cadastro; profissional precisa vínculo, administrador fica na própria unidade.

| Método e rota                                                   | Entrada/saída                                                                                                   |
| --------------------------------------------------------------- | --------------------------------------------------------------------------------------------------------------- |
| GET /patients/{id}/activity-profile                             | 200 com perfil, authorName e personalizationStatus; 204 se ausente; 403 se não autorizado                       |
| PUT /patients/{id}/activity-profile                             | Profissional/admin autorizado; mobility, balance, restrictions, professionalGuidance; devolve perfil persistido |
| POST /patients/{id}/activities                                  | EntradaAtividade abaixo; operação idempotente e auditada                                                        |
| GET /patients/{id}/activities?page=0&size=20&from=...&to=...    | items,total,page,size; size de 1–100; from inclusivo/to exclusivo; occurredAt DESC,id DESC                      |
| GET /pacientes/{idPaciente}/atividades/semana?inicio=2026-10-19 | inicio deve ser segunda-feira; inicio,fimExclusivo,dias,totalMinutos,totalRegistros                             |
| GET /patients/{id}/readings?size=1                              | Última medição, sem classificar segurança de exercício                                                          |
| GET /pacientes/{id}/dados-pessoais                              | Nascimento para idade; idade ausente permanece sem informação                                                   |
| GET /patients/{id}/summary                                      | Resumo profissional, totais completos e até 20 registros recentes por categoria                                 |

Exemplo sintético de POST (gerar um UUID uma vez e reutilizá-lo em reenvios):

```json
{
  "id": "00000000-0000-4000-8000-000000000001",
  "type": "Movimento voluntário de teste",
  "durationMinutes": 5,
  "occurredAt": "2026-10-20T12:00:00Z",
  "notes": "Registro sintético; não é prescrição",
  "feeling": "WELL"
}
```

Usar instante passado ou atual: API aceita no máximo cinco minutos no futuro e não aceita anterior a 1900. Não repetir o UUID de exemplo com conteúdo diferente. O autor vem da sessão, nunca de um campo enviado pelo cliente. PUT do perfil não possui controle de versão atualmente: concorrência de dois profissionais é uma pendência a coordenar; a versão das preferências não protege esse perfil.

A agregação semanal usa America/Sao_Paulo e soma todo o período no SQL, independentemente da paginação. A resposta dias contém apenas dias com registros; a tela monta os sete dias. Dia sem registro não equivale a atividade não realizada nem a descumprimento de uma meta inexistente.

## 6. Integração com o restante do Viva+

Autenticação vem de ContextoAutenticacao/useAutenticacao. Identificação vem de /patients/me; não confiar em um id arbitrário de parâmetros. React Query usa chaves com usuário/paciente e o logout limpa consultas. A fila services/sincronizacao conserva o UUID: navegador somente em memória; nativo usa expo-sqlite/SQLCipher e SecureStore, ainda sem ensaio físico.

A informação inicial do roteiro é transitória. O formulário de registro solicita sentimento e o persiste junto ao registro; não há tabela de avaliações diárias separadas. Histórico geral e portal consultam os mesmos registros da API. Perfil demográfico e preferências de texto são módulos separados; não duplicar nascimento ou senha em tabelas de atividade.

O portal usa cookie HttpOnly/CSRF e encaminha rotas permitidas pelo BFF web/app/api/domain/[...path]/route.ts. A rota semanal hoje é consumida diretamente pelo app: uma nova chamada pelo BFF exige avaliar e ampliar a allowlist, sem criar um proxy aberto.

## 7. Pendências priorizadas para o responsável

| Prioridade/item           | Objetivo e comportamento esperado                                                      | Pontos de integração e persistência                                                      | Dependências, teste e aceite                                                                                                                                       |
| ------------------------- | -------------------------------------------------------------------------------------- | ---------------------------------------------------------------------------------------- | ------------------------------------------------------------------------------------------------------------------------------------------------------------------ |
| P0 — escopo clínico       | Definir público, critérios, alertas, contraindicações e responsável aprovador          | Documentar decisões antes de alterar RoteiroAtividade/serviço                            | Aprovação identificável; ausência continua indisponível; testar que nenhuma resposta isolada libera atividade                                                      |
| P1 — catálogo versionado  | Trocar seleção ilustrativa por conteúdo aprovado consultável, sem recomendações falsas | Rotas/DTOs/modelo novos a definir; migração aditiva coordenada; preservar type legado    | Testar conteúdo ativo/inativo, versão, autorização e acessibilidade; aceite: item exibido corresponde ao conteúdo aprovado persistido                              |
| P1 — passos e vídeos      | Conteúdo correto para cada item, legendas, descrição e tratamento de indisponibilidade | Rotas passos/video e RoteiroAtividade; serviço de mídia e versão do conteúdo a definir   | Direitos de uso, revisão clínica, hospedagem e limites de custo; testar falha de mídia e leitor; aceite: nenhuma sequência inventada/fallback prescritivo          |
| P1 — avaliação/prescrição | Avaliação e decisão profissional rastreáveis; não inferir de idade/pressão isoladas    | Perfil atual é texto; avaliações/prescrições/histórico requerem modelo/DTO/API próprios  | Aprovação clínica e coordenação com geral; testar concorrência/autoria/versão/revogação; aceite: plano vinculado a aprovador e paciente autorizado                 |
| P2 — semana programada    | Distinguir programado, realizado, não confirmado e cancelado                           | Não reutilizar activity_record como agenda; novo modelo aditivo e views de semana        | Depende de catálogo/plano; testar fuso, mudança de semana, ausência e múltiplas atividades; aceite: total realizado continua correto sem marcar falta por ausência |
| P2 — robustez do perfil   | Evitar sobrescrita silenciosa de edição concorrente                                    | CuidadoService/PerfilAtividade/portal; versão aditiva a definir                          | Preservar GET204; testar dois profissionais e conflito; aceite: alteração desatualizada não sobrescreve                                                            |
| P2 — dispositivos         | Somente integrar após protocolo/escopo acordados                                       | AdaptadorPulseira existente não mede pressão nem atividade; não inventar passos/calorias | Fornecedor/hardware/permissões e ensaio físico; aceite: estados reais distintos do simulador                                                                       |

Não criar tudo numa migração nem reservar V8 sem coordenação: as frentes de desenvolvimento compartilharão o diretório Flyway. Para cada item, atualizar OpenAPI/tipos, UI/estados vazios, testes Java/PostgreSQL/TS/E2E e evidências. Coordenação e checklist em [matriz](MATRIZ_RESPONSABILIDADES_DESENVOLVIMENTO.md).

## 8. Executar e testar o que já existe

1. Seguir [guia Windows](GUIA_COMPLETO_EXECUCAO_LOCAL_WINDOWS.md), iniciar com Iniciar-VivaMais.cmd e verificar os quatro serviços. Não provisionar outro banco sobre vivamais.
2. No portal, cadastrar/ativar uma pessoa fictícia e registrar perfil funcional na ficha → Atividade física → Perfil funcional e restrições. Confirmar a leitura no app.
3. No app, abrir Atividade Física → Ver minhas informações, responder às perguntas e conferir nascimento/perfil/última medição. Navegar por passos/vídeo/alternativa: devem informar indisponibilidade clínica.
4. Registrar uma atividade que já realizou com dados sintéticos; conferir o mesmo registro no portal, histórico geral e semana. Registrar mais de 20 entradas em banco de teste para testar total completo.
5. Simular falha de rede no ensaio e reenviar o mesmo UUID. Confirmar uma ocorrência; outra conta/clínica deve receber403. Não apagar registros do banco principal para repetir testes.

Exemplo utilizável no console do portal autenticado, após obter o id da pessoa fictícia criada nesse ensaio (não usar outro paciente):

```javascript
const idPaciente = "SUBSTITUA_PELO_ID_DO_CADASTRO_SINTETICO";
const resposta = await fetch(
  "/api/domain/patients/" + idPaciente + "/activities",
  {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify({
      id: crypto.randomUUID(),
      type: "Atividade sintética",
      durationMinutes: 5,
      occurredAt: new Date().toISOString(),
      feeling: "WELL",
      notes: "Ensaio",
    }),
  },
);
console.log(resposta.status); //200 quando autorizado; não imprimir sessão/corpo clínico
```

Testes existentes a preservar: CuidadoIT.semanaAtividadesUsaHorarioLocalEPeriodoCompleto; consultationActivityAndBraceletSimulationDoNotPretendHardware; recursosOpcionaisAusentesRetornamSemConteudoEContinuamAutorizados; resumoTemTotaisCompletosAutoriaEOrdemDaOcorrencia. No app: tests/mobile/idade.test.ts e care-core.test.ts. E2E: acesso-navegacao.spec.ts, execucao-local.spec.ts, portugues-pressao.spec.ts, preferencias.spec.ts. Comandos completos e configuração do banco exclusivo: [manual geral](MANUAL_CONTINUIDADE_DESENVOLVIMENTO.md).

A última rodada anterior à transferência teve 31 testes Java, 40 frontend e 13 E2E aprovados; não é necessário repetir tudo para ler este documento. Mudanças futuras no módulo exigem testes proporcionais, incluindo fronteiras de horário, isolamento, idempotência e rotas sem perfil. Android/iOS físicos e conteúdo clínico continuam pendentes.
