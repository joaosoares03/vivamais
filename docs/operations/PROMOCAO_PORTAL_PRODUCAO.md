# Promoção do portal reformulado para produção

Critérios do Cloud para receber a reformulação do portal profissional feita pelo Codex. A interface é uma só: a produção recebe por Git exatamente o SHA aprovado em homologação.

## Ordem de trabalho

1. A branch `claude/modo-produtivo` entra na homologação antes de a reformulação começar.
2. O Codex parte de um clone ou worktree novo da branch de homologação já atualizada. A cópia `viva-mais-pr-1` parte de `0c564c5` e não tem o modo produtivo.
3. O Codex entrega por PR para a branch de homologação, publica em homologação e informa o SHA.
4. O Cloud revisa o PR, ensaia em modo produção e só implanta com autorização expressa do titular.

## O que a reformulação precisa preservar

Funções de produção que já estão no portal e não aparecem na homologação, porque dependem de `APP_ENV=production`:

| Função | Arquivos | Como aparece |
| --- | --- | --- |
| Segundo fator no login | `FormularioAcesso.tsx`, `api/session`, `validacoes.ts` | Campo "Código do autenticador ou de recuperação" |
| Gestão de equipe | `ContasEquipe.tsx`, `(portal)/contas` | Item "Equipe" no menu, só para ADMIN e só em produção |
| Ativação de conta | `AtivarContaInstitucional.tsx`, `ativar-conta`, `api/conta/[acao]` | Página pública com chave do autenticador e códigos de recuperação |
| Ativação presencial | `AtivacaoPaciente.tsx` | Botão "Gerar código presencial" e código de seis números exibido uma vez |
| Modo de interface | `services/modoProducao.ts` | Esconde o grupo de testes e avisos de desenvolvimento |
| Mensagens de erro | `services/api.ts` | Convite inválido e senha errada não falam em sessão expirada |
| Suporte e exclusão | `suporte`, `exclusao-de-conta` | Exibem o e-mail de `PORTAL_EMAIL_SUPORTE`, quando definido |

Para ver essas telas na homologação local, inicie o portal com `PORTAL_MODO_PRODUCAO=true`.

## Contrato de interface

`tests/producao/portal.spec.ts` encontra as telas por rótulos e papéis acessíveis, como "Menu principal", "Equipe", "Gerar convite", "Gerar código presencial" e "Código do autenticador ou de recuperação". A reformulação pode mudar textos e layout, mas, se mudar um desses nomes, atualiza o teste no mesmo PR.

## O que o Cloud confere antes de promover

- [ ] PR para a branch de homologação, com CI verde nos cinco jobs.
- [ ] Diff sem migrations novas; se houver, migrations aditivas, com ensaio de upgrade.
- [ ] Contrato OpenAPI inalterado, ou `generated.ts` regenerado com compatibilidade documentada.
- [ ] BFF sem rotas novas fora da lista permitida e sem token no navegador.
- [ ] CSP mantida: sem atributo `style`, sem scripts externos.
- [ ] `tests/producao/portal.spec.ts` aprovado contra a API em modo produção.
- [ ] E2E, Vitest, lint, TypeScript e build com `APP_ENV=production` aprovados.
- [ ] Capturas antes e depois em 1440, 768 e 390 px, incluindo telas de produção.
- [ ] Sem permissões novas no menu além do que a API autoriza.
- [ ] SHA validado em homologação e registrado.

## Implantação em produção

Bloqueada até existir o ambiente de produção (contas e projetos) e até a autorização expressa do titular para o SHA. O portal não tem migração própria: o rollback é republicar o SHA anterior na Vercel.
