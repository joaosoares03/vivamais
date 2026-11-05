## Correção de fotos e grupo em validação

Preparação automática de fotos originais até 10 MiB, prévia/confirmar/remover/repetir, validação no servidor e novos convites profissionais implementados localmente. 76 testes app, 55 portal, 11 Java e 8 integrações PG passaram; regressão final/contratos e publicação em andamento. IA confirmada desabilitada, sem chamadas no banco. A versão implantada ainda é cd1c24d. Estado detalhado em [validação de fotos, IA e grupo](evidencias/VALIDACAO_FOTOS_IA_E_TESTES_GRUPO.md); guia em docs/GUIA_TESTES_GRUPO_VIVAMAIS.md. Não confundir os testes locais com implantação ou ensaio físico.

# Medicamentos e acesso do grupo — implementação de 04/11/2026

**Homologação04/11 validada:** web do paciente por convite e portal disponíveis em HTTPS, medicamentos/agenda/histórico/offline e arquivos privados conectados ao PostgreSQL. Teste físico do iPhone adiado pelo titular; builds nativos seguem distintos da versão Safari. [Acesso e resultados](evidencias/nuvem-2026-11-04/README.md). As instruções anteriores abaixo permanecem históricas.

## Medicamentos

`components/MedicamentosPaciente.tsx` substitui a antiga listagem das rotas principais de medicamentos/lembretes, preservando os demais módulos. Mostra resumo persistido, progresso, dosagem/instruções cadastradas, horários, autorrelato, próximo horário, filtros hoje/ontem/sete dias/período até 31 dias e calendário. Botões grandes, texto ampliável, navegação inferior e retorno ao início permanecem disponíveis. Não calcula prescrição ou dose extra.

O hook `useMedicamentos` consulta a API e integra a fila protegida existente. Um toque guarda UUID e horário efetivo; respostas pendentes aparecem como aguardando envio e não aumentam o progresso salvo. Cliques concorrentes são serializados. Reconexão/retentativa preservam o UUID; falhas definitivas exigem revisão, sem apagar ou sobrescrever autorrelatos. Consultas/fila são vinculadas ao titular. No nativo, SQLCipher/SecureStore permanecem; no navegador não se promete persistência nativa após encerramento.

Na Home, o resumo usa os totais salvos do dia. O próximo horário é buscado na agenda dos próximos sete dias e apresenta a data quando ocorrer em outro dia. Resposta já registrada não aparece como próxima dose.

### API e histórico

- `GET /api/v1/patients/{id}/medication-agenda?from=AAAA-MM-DD&to=AAAA-MM-DD`: até 31 dias, contagens e eventos com dosagem, frequência, fuso, situação, autor/origem e horário efetivo. Vínculo/unidade/conta são verificados no servidor.
- As rotas anteriores de plano, eventos diários, versões e autorrelatos continuam disponíveis.
- V13 acrescenta dosagem opcional sem alterar dados antigos. Na atualização do plano, ausência de dosagem preserva o valor existente; string vazia remove explicitamente a dosagem cadastrada.
- Mudanças geram snapshots e janelas de validade. A consulta histórica utiliza a programação da versão correspondente, inclusive para autorrelato atrasado após edição do plano.
- A unicidade `(plan_id, scheduled_at)` impede duas doses no mesmo horário. Repetição da mesma situação retorna o registro canônico; situação diferente produz conflito sem sobrescrever o anterior. O horário efetivo é o `reportedAt`, distinto do horário programado.

O portal autorizado mostra **Programação e histórico de doses**, filtros e tabela com autoria/origem. As respostas continuam sendo autorrelatos; ausência de confirmação não é classificada como dose não tomada automaticamente.

### Lembretes

Preferências são individuais por aparelho/titular, inicialmente desligadas, com aviso opcional cinco minutos antes. IDs determinísticos impedem duplicação; alterações removem agendamentos antigos e logout cancela somente os do titular. O agendador ordena/limita os próximos 60 alertas e solicita permissão apenas após ação do usuário. A tela orienta reabrir o app para renovar a programação. Mensagens de notificação não contêm nome/dose ou dados clínicos.

Testes com substitutos das APIs do sistema verificam deduplicação, preferências e isolamento; não comprovam entrega no Android/iOS. Entrega com aplicativo fechado, bateria/restrições do sistema e permissões precisa de ensaio físico da versão 0.2.0. O APK 0.1.0 foi testado anteriormente pelo proprietário; isso é evidência distinta.

## Cadastro e modos de acesso

O cadastro APP devolve `acesso` calculado pelo servidor. Paciente fictício elegível, em unidade e ambiente locais explicitamente autorizados, recebe `DEMONSTRACAO_HABILITADA`: sem criação/envio de SMS, código ou aparelho permanente. O portal confirma o sucesso com ficha/novo cadastro/lista. A emissão de SMS para esse paciente é recusada pelo backend. Acesso/cadastro/ativação antigos do app não mostram SMS no build demonstrativo.

No grupo, `TESTE_POR_CONVITE` apresenta o gerenciamento de convites. A criação exige vínculo e reautenticação profissional. V14 guarda hashes de convite/renovação e vincula as sessões às contas fictícias; tabelas têm RLS e privilégios públicos revogados. São até 7 dias, um uso inicial, um aparelho por convite, renovação rotativa e revogação/saída/expiração imediatas no servidor. O app nativo guarda a renovação em SecureStore; web usa cookie HttpOnly/Secure/SameSite Strict e não armazena tokens no localStorage. O marcador de saída web não contém segredo.

As novas rotas são `/auth/testadores/convite`, `/auth/testadores/renovar`, `/patients/{id}/test-invites` e `/patients/{id}/test-invites/{convite}/revoke`, sob `/api/v1`. O BFF profissional permite somente as rotas administrativas necessárias, preserva CSRF/sessão/no-store e não abre a autenticação pública do app por seu proxy genérico.

Grupo remoto exige dados sintéticos, flag/unidade próprias e HTTPS. Login simples CPF/nascimento continua local. Produção e perfis reais são bloqueados; o fluxo seguro anterior permanece coberto pelos testes. Convites não concedem acesso a dados reais nem autorizam uso clínico.

## Evidências e limites

[Relatório da execução](evidencias/MEDICAMENTOS_CONVITES_EXPO_2026-11-04.md):116 Java com PostgreSQL,45 testes portal/72 app integrais anteriores e verificações adicionais após os últimos ajustes. OpenAPI de54 caminhos foi recuperado da integração real aprovada e os contratos TypeScript foram regenerados. Capturas novas do acesso demonstrativo e portal são de navegador real; capturas/E2E completo dos cards com API atual e ensaios físicos permanecem pendentes pelo bloqueio de inicialização do PostgreSQL. Ver [distribuição do grupo](GUIA_DISTRIBUICAO_TESTES_GRUPO.md).
