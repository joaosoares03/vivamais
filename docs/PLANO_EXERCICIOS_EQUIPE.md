# Plano de exercícios definido pela equipe

Atualizado em 10/11/2026. Responsável pela frente: o titular, que assumiu exercícios e IA.

## O que faz

1. **Aprovação clínica do catálogo.** A administração da unidade registra em **Configurações → Catálogo de exercícios** o responsável clínico que revisou a versão atual do catálogo, com nome, conselho e número de registro. Sem esse registro, a situação fica `BLOCKED_PENDING_CLINICAL_APPROVAL`: ninguém monta planos e o paciente não vê planos.
2. **Plano por paciente.** Na ficha → **Atividade física**, o profissional escolhe até 5 exercícios do grupo definido no perfil funcional e informa para cada um os dias da semana, a duração e uma observação. O sistema não sugere exercícios nem infere risco: o plano é a decisão do profissional.
3. **No app.** A tela Atividade Física mostra "Seu plano da equipe", com os itens de hoje, "Ver como fazer" (imagens, animação e vídeo do catálogo) e "Registrar que fiz". O registro continua pedindo como a pessoa se sente, e fica ligado ao item do plano.
4. **Acompanhamento.** A ficha mostra quantos dias da semana tiveram registro para cada item. Dia sem registro não é tratado como falta, e o registro é informado pelo paciente: não comprova a execução.

## Regras de segurança

- **Revogação:** revogar a aprovação bloqueia na hora todos os planos da unidade. O paciente deixa de ver os itens, e registros ligados ao plano são recusados. Uma nova aprovação não reativa planos antigos: o profissional precisa salvar o plano de novo.
- **Mudança de grupo:** se o grupo do perfil funcional mudar, o plano vigente é encerrado, porque os itens deixam de pertencer ao grupo.
- **Conflito:** cada alteração cria um plano novo e encerra o anterior. Duas pessoas editando ao mesmo tempo recebem 409, e o perfil funcional passou a ter `version`, também com 409. Clientes que não enviam `version` continuam funcionando.
- **Restrições:** quando o perfil registra restrições, a ficha avisa. O roteiro do app continua pedindo a conferência do dia antes da atividade.

## O que precisa de pessoas, não de código

- **Revisão clínica real:** um profissional habilitado precisa revisar os 10 exercícios (nome, mídia e grupo) antes de registrar a aprovação na unidade de produção. Os dados usados nos testes são fictícios.
- **Texto de cada exercício:** as orientações escritas por exercício continuam pendentes. Não foram criadas instruções clínicas.
- **Contraindicações por exercício:** não há regra automática. O profissional decide pelo perfil.

## Técnica

- **Migration `V18__plano_exercicios.sql` (aditiva):**
  - tabelas `aprovacao_catalogo_exercicio`, `plano_exercicio` e `plano_exercicio_item`, com RLS e acesso revogado;
  - `activity_record` ganha `id_plano_exercicio` e `id_exercicio`;
  - `physical_activity_profile` ganha `grupo_catalogo` e `versao`. O grupo antes ficava como marcador no início de `professional_guidance`; a migration move o valor para a coluna e limpa o texto.
- **Catálogo da API:** `backend/demo/src/main/resources/exercicios/catalogo.json`. O teste `tests/mobile/plano-exercicios.test.ts` garante que ele é igual ao catálogo do app (`services/atividades/atividades.ts`). Uma versão nova do catálogo exige nova aprovação.
- **Rotas (`/api/v1`):**

  | Rota                                             | Quem                                                                |
  | ------------------------------------------------ | ------------------------------------------------------------------- |
  | `GET /exercicios/catalogo`                       | Profissional e administração                                        |
  | `POST /exercicios/catalogo/aprovacao`            | Administração                                                       |
  | `POST /exercicios/catalogo/aprovacao/revogar`    | Administração                                                       |
  | `GET /pacientes/{id}/plano-exercicios`           | Paciente (o próprio) e equipe vinculada; 204 sem plano              |
  | `PUT /pacientes/{id}/plano-exercicios`           | Equipe vinculada; `idPlanoAtual` obrigatório quando já existe plano |
  | `POST /pacientes/{id}/plano-exercicios/encerrar` | Equipe vinculada                                                    |
  | `POST /patients/{id}/activities`                 | Novo campo opcional `exerciseId`, validado contra o plano ativo     |

- **Auditoria:** `CATALOGO_EXERCICIOS_APROVADO`, `CATALOGO_EXERCICIOS_REVOGADO`, `PLANO_EXERCICIO_SALVO`, `PLANO_EXERCICIO_ENCERRADO` e `PLANO_EXERCICIO_CONSULTADO`.
- **Código:**
  - API: `ExerciciosService`, `ExerciciosController` e `ModelosExercicios`;
  - portal: `AprovacaoCatalogoExercicios` e `PlanoExerciciosPaciente`;
  - app: `PlanoDaEquipe`, `usePlanoExercicios` e o parâmetro `exercicio` em `TelaCuidado`;
  - tipos compartilhados: `packages/contracts/src/planoExercicios.ts`.
- **Testes:**
  - `ExerciciosIT` (4 cenários com PostgreSQL);
  - `tests/mobile/plano-exercicios.test.ts`;
  - `web/components/PlanoExerciciosPaciente.test.tsx`;
  - E2E `tests/e2e/plano-exercicios.spec.ts` (aprovação, plano e recebimento pelo paciente).

## Não verificado

- **App em aparelho:** não houve ensaio em Android ou iPhone físico. O cartão do app foi verificado por testes de unidade, não por E2E na tela.
- **Acessibilidade:** não houve teste com leitor de tela.
