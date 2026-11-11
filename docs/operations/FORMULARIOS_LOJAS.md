# Formulários das lojas

Respostas levantadas do código em 07/11/2026. Quem envia confere cada item antes de declarar: resposta errada pode tirar o app da loja. Valores entre colchetes dependem do titular.

## Dados coletados

| Dado | Finalidade | Obrigatório | Compartilhado com terceiros |
| --- | --- | --- | --- |
| Nome | Identificar o paciente | Sim | Não |
| CPF e nascimento | Identificar na ativação | Sim, no app | Não |
| Celular | Contato | Sim | Não, na ativação presencial |
| E-mail, sexo, endereço | Cadastro | Não | Não |
| Pressão e pulso | Acompanhamento | Não | Não |
| Medicamentos e autorrelatos | Acompanhamento | Não | Não |
| Atividade física | Acompanhamento | Não | Não |
| Refeições e fotos | Acompanhamento | Não | Não |
| Foto do visor do aparelho | OCR com conferência | Não | Não |
| Identificador de aparelho | Manter o acesso | Sim | Não |

Provedores de infraestrutura processam os dados em nome do serviço. Não há publicidade nem rastreamento entre apps. A análise alimentar por IA está desligada; revisar se isso mudar.

## Google Play

- **Segurança dos dados:** dados cifrados em trânsito; sim. Exclusão a pedido; sim, pela URL de exclusão.
- **Declaração de apps de saúde:** marcar as categorias aplicáveis, como acompanhamento de doenças ou medicação. Não declarar como dispositivo médico sem avaliação regulatória.
- **Descrição:** incluir que o app não é dispositivo médico e não substitui atendimento.
- **Público-alvo:** adultos. Não direcionado a crianças.
- **Anúncios:** não contém.
- **Acesso ao app:** informar conta de teste, pois o acesso exige cadastro.
- **Testadores:** teste fechado com ao menos 12 pessoas por 14 dias seguidos, em conta pessoal.

## App Store

- **Privacidade do app:** dados de saúde, contato, identificadores e fotos; vinculados à pessoa; sem rastreamento.
- **Criptografia:** o app usa apenas criptografia padrão (HTTPS e SQLCipher). Responder ao questionário de exportação com base nisso.
- **Classificação etária:** responder ao questionário; conteúdo médico informativo.
- **Conta de revisão:** obrigatória, porque não há cadastro público.
- **Regra 5.1.1(ix):** app de saúde deve ser enviado pela entidade que presta o serviço. Conta individual tem risco de recusa.

## Notas para a revisão

Texto base, em inglês, para os campos das duas lojas:

> Viva+ is a companion app for patients of a health service. There is no public sign-up: the care team registers each patient and hands over a one-time activation code in person.
> To review the app, use the test patient below, with fictional data. Open "Acesso", enter the CPF and birth date, then the activation code.
> CPF: [CPF fictício] / Birth date: [data] / Code: [gerar no dia, vale 10 minutos]
> The app does not diagnose, does not measure blood pressure and does not replace medical care.

O código vale dez minutos, então uma conta de revisão precisa de um caminho próprio. Antes de enviar, combine com o Claude como manter essa conta ativa durante a revisão.

## URLs

- Privacidade: `https://[PORTAL]/privacidade`
- Exclusão de conta: `https://[PORTAL]/exclusao-de-conta`
- Suporte: `https://[PORTAL]/suporte`
- E-mail de suporte: [e-mail]

## Pendências antes de enviar

- [ ] Identificador definitivo, nome e ícone 1024 × 1024.
- [ ] Capturas de tela com dados fictícios.
- [ ] Ensaio do binário em Android e iPhone físicos.
- [ ] `PORTAL_EMAIL_SUPORTE` configurado.
