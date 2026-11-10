# Evidências da reformulação do portal

Capturas reais, 10/11/2026, com API de teste e dados fictícios. "Antes" é a homologação `4c241f7`; "depois" é a branch `claude/reformulacao-portal`. Foram feitas 66 capturas antes e 69 depois (a aba nova soma três), em 1440, 768 e 390 px. As selecionadas estão em `antes/` e `depois/`.

| Tela                 | Antes                                                                                                                         | Depois                                                                                                                           |
| -------------------- | ----------------------------------------------------------------------------------------------------------------------------- | -------------------------------------------------------------------------------------------------------------------------------- |
| Login                | [1440](antes/login-1440.png) · [390](antes/login-390.png)                                                                     | [1440](depois/login-1440.png) · [390](depois/login-390.png)                                                                      |
| Painel               | [1440](antes/painel-1440.png) · [390](antes/painel-390.png)                                                                   | [1440](depois/painel-1440.png) · [390](depois/painel-390.png)                                                                    |
| Pacientes            | [1440](antes/pacientes-1440.png) · [390](antes/pacientes-390.png)                                                             | [1440](depois/pacientes-1440.png) · [390](depois/pacientes-390.png)                                                              |
| Cadastro             | [1440](antes/cadastro-1440.png) · [390](antes/cadastro-390.png)                                                               | [1440](depois/cadastro-1440.png) · [390](depois/cadastro-390.png)                                                                |
| Ficha                | [1440](antes/ficha-visa-o-geral-1440.png) · [768](antes/ficha-visa-o-geral-768.png) · [390](antes/ficha-visa-o-geral-390.png) | [1440](depois/ficha-visa-o-geral-1440.png) · [768](depois/ficha-visa-o-geral-768.png) · [390](depois/ficha-visa-o-geral-390.png) |
| Medicamentos         | [1440](antes/ficha-medicamentos-1440.png) · [390](antes/ficha-medicamentos-390.png)                                           | [1440](depois/ficha-medicamentos-1440.png) · [390](depois/ficha-medicamentos-390.png)                                            |
| Acesso ao aplicativo | painel no fim de cada aba                                                                                                     | [1440](depois/ficha-acesso-ao-aplicativo-1440.png)                                                                               |
| Configurações        | [1440](antes/configuracoes-1440.png) · [390](antes/configuracoes-390.png)                                                     | [1440](depois/configuracoes-1440.png) · [390](depois/configuracoes-390.png)                                                      |
| Relatórios           | [1440](antes/relatorios-1440.png) · [390](antes/relatorios-390.png)                                                           | [1440](depois/relatorios-1440.png) · [390](depois/relatorios-390.png)                                                            |

## Medidas automáticas (todas as capturas)

- **Rolagem lateral da página:** zero em todas as telas e larguras, antes e depois. Na primeira versão nova, a ficha chegou a 610 px em 390; isso foi corrigido.
- **Campos sem rótulo e imagens sem texto alternativo:** nenhum.
- **Abas da ficha:** rolam dentro da própria faixa, de propósito.
- **Botões sem nome:** os três sinalizados estavam dentro de seções recolhidas e têm texto; era limitação da medição.

## Testes da versão final

| Suíte                                      | Resultado    |
| ------------------------------------------ | ------------ |
| ESLint e TypeScript                        | Sem erros    |
| Vitest portal (inclui menu por perfil)     | 64 aprovados |
| Vitest app                                 | 79 aprovados |
| Java unitários                             | 82 aprovados |
| Java integração (inclui filtros da busca)  | 96 aprovados |
| E2E Playwright                             | 17 de 17     |
| Ensaio em modo produção (`tests/producao`) | 2 de 2       |
| Build do portal com `APP_ENV=production`   | Aprovado     |

A primeira rodada E2E encontrou um defeito real (logotipo distorcido) e testes presos a textos antigos. Foram corrigidos e documentados no PR.

## Não verificado

- **Acessibilidade:** sem verificação WCAG automatizada nem leitor de tela.
- **Tablet:** sem teste em aparelho real.
- **Homologação:** a versão nova ainda não foi publicada.
