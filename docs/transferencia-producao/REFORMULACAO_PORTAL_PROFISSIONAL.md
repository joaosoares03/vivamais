# Reformulação do portal profissional

Branch `claude/reformulacao-portal`, a partir de `4c241f7` e do primeiro commit do Codex (`b7a4083`). Uma única interface para homologação e produção: o que muda entre os ambientes é configuração, não código.

## Auditoria (antes)

Capturas reais da homologação `4c241f7` em 1440, 768 e 390 px, com API de teste e dados fictícios. As capturas selecionadas estão em `docs/evidencias/portal-reformulacao/antes`.

| Tela                 | Problema                                                                                                | Tipo           | Correção                                                                    |
| -------------------- | ------------------------------------------------------------------------------------------------------- | -------------- | --------------------------------------------------------------------------- |
| Todas                | `globals.css` com 2.839 linhas, regras duplicadas e sobrescritas (menu e logotipo definidos duas vezes) | Inconsistência | Design system novo em quatro arquivos                                       |
| Todas                | Fundo do menu lateral termina na altura da tela em páginas longas                                       | Formatação     | Menu fixo e fundo de coluna contínuo                                        |
| Todas                | Link "Pular para o conteúdo" visível sobre a página no celular                                          | Acessibilidade | Aparece só com foco de teclado                                              |
| Todas                | Menu sem grupos, "Cadastrar paciente" quebrando em duas linhas, sem recolher                            | Navegação      | Grupos, rótulos curtos, recolhível, gaveta no tablet e celular              |
| Cabeçalho            | Sem unidade nem acesso à conta                                                                          | Hierarquia     | Nome, perfil, unidade, atalho para a conta e "Sair"                         |
| Painel               | Indicadores sem ação, espaço vazio, atalhos ausentes                                                    | Fluxo          | Indicadores clicáveis, últimas medições e ações rápidas                     |
| Pacientes            | Busca duplicada, botão solto no meio do cabeçalho, "Página 1" sem estilo, sem filtro nem ordenação      | Fluxo          | Filtros por nome, modalidade e ordem, contagem, paginação, tabela e cartões |
| Cadastro             | Campos sem estilo consistente, modalidade com espaço vazio                                              | Formatação     | Grade de campos e modalidade em cartões selecionáveis                       |
| Ficha                | Painel de ativação repetido no fim de todas as abas                                                     | Fluxo          | Aba própria "Acesso ao aplicativo"                                          |
| Ficha · Medicamentos | Tabela de horários sem estilo, colunas coladas ("HorárioMedicamento")                                   | Falha visual   | Tabela com etiquetas de situação                                            |
| Ficha · celular      | Palavras quebradas ao meio ("Pres são", "Profissi onal")                                                | Responsividade | Tabelas viram cartões abaixo de 720 px                                      |
| Ficha · celular      | Rolagem lateral de 240 a 610 px                                                                         | Responsividade | Itens de grid e fieldset com `min-width: 0`                                 |
| Configurações        | Cartões desalinhados, títulos com peso diferente                                                        | Formatação     | Grade de três colunas e tipografia única                                    |
| Relatórios           | Só uma lista, sem explicar o fluxo                                                                      | Clareza        | Passos de geração e exportação                                              |
| Login                | Rodapé com links colados                                                                                | Formatação     | Espaçamento                                                                 |

## Design system

Arquivos em `web/app/estilos`, importados por `web/app/layout.tsx`:

- `base.css`: tokens de cor (azul principal, verde complementar, neutros e estados), tipo, espaço, raio, sombra e foco.
- `layout.css`: menu lateral, cabeçalho, área de conteúdo e comportamento responsivo.
- `componentes.css`: botões, etiquetas, avisos, campos, abas, tabelas, tabelas em cartões, paginação, estados vazios e indicadores.
- `paginas.css`: regras próprias de cada tela.

Componentes e classes reutilizáveis:

- **Botões:** `.button`, `.button-primary`, `.button-secondary`, `.acao-tabela`.
- **Etiquetas:** `.badge` com `-sucesso`, `-alerta`, `-erro`, `-info` e `-neutro`.
- **Tabelas:** `.tabela-cartoes`, com `data-rotulo` em cada célula.
- **Estruturas:** `.paginacao`, `.empty-state`, `.indicador-painel`, `.atalho`.
- **Menu:** `MenuPortal`, com `gruposMenu` testável, `EstruturaPortal`, `BotaoAbrirMenu` e `BotaoRecolherMenu`.

Os nomes de classe anteriores foram mantidos onde componentes os usam, para não alterar regras de negócio.

## Rotas e contratos

- **Rotas:** nenhuma removida.
- **`/pacientes`:** aceita `modalidade` e `ordem`, além de `busca` e `pagina`.
- **API, mudança aditiva:** `GET /api/v1/patients/search` aceita `modalidade` (`APP` ou `BRACELET_DIARY`) e `ordem` (`nome` ou `recentes`), ambos opcionais. Sem eles, o resultado é igual ao anterior. Teste em `RegistrosReaisIT`.
- **Ficha:** a aba "Acesso ao aplicativo" substitui o painel de ativação no fim da página. `?aba=access` abre direto nela.
- **Menu:** "Pacientes" passou a "Lista de pacientes"; Relatórios e o grupo de testes ficam em "Gestão".

## Testes

Resultados da rodada final em `docs/evidencias/portal-reformulacao/README.md`.

## Promoção

1. PR para `codex/homologacao-nuvem-20261104`, CI verde.
2. Homologação: publicar o SHA na Vercel (portal) e na Railway (API, por causa do filtro novo, sem migration).
3. Produção: mesmo SHA, depois dos critérios de `docs/operations/PROMOCAO_PORTAL_PRODUCAO.md` e da autorização expressa do titular.
4. Rollback: republicar o SHA anterior na Vercel. A mudança da API é compatível com o portal anterior.

## Pendências

- **Painel:** sem filtro de período nem gráficos agregados. A API atual não oferece agregados por período, e não foram criados números simulados.
- **Relatórios:** continuam por paciente. Relatórios da unidade exigem endpoint e decisão de escopo.
- **Acessibilidade:** sem verificação automatizada WCAG (axe) nem teste com leitor de tela. Não declarar conformidade.
- **Ficha:** `CuidadoPaciente.tsx` segue com 1.200 linhas. Dividir por aba é a próxima melhoria estrutural.
