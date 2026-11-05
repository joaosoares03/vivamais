## Versão web do grupo — 05/11/2026

Use o [roteiro atualizado para pacientes e profissionais](GUIA_TESTES_GRUPO_VIVAMAIS.md). O administrador emite convites individuais; não há SMS. As fotos são preparadas automaticamente e exigem confirmação antes de salvar. Os endereços HTTPS funcionam sem manter o computador ligado.

[Paciente](https://viva-api-paciente-homologacao.up.railway.app/convite) · [Profissional](https://vivamais-portal-viva-mais3.vercel.app). Testes de navegador e Storage passaram; Safari/HEIC físicos continuam pendentes. A atualização web não atualiza o APK antigo, e não há novo APK/IPA nesta entrega.

# Testar o Viva+ no celular

**Homologação04/11 validada:** web do paciente por convite e portal disponíveis em HTTPS, medicamentos/agenda/histórico/offline e arquivos privados conectados ao PostgreSQL. Teste físico do iPhone adiado pelo titular; builds nativos seguem distintos da versão Safari. [Acesso e resultados](evidencias/nuvem-2026-11-04/README.md). As instruções anteriores abaixo permanecem históricas.

Atualizado em 04/11/2026. Este guia vale para o futuro ambiente privado do grupo. A distribuição remota ainda depende de API HTTPS, contas Expo e, no iPhone, assinatura Apple. O APK local já testado pelo proprietário continua sendo uma entrega diferente, dependente do computador da demonstração.

## Receber o acesso

O responsável enviará, em particular, um link de instalação e um convite individual. Cada integrante usará um paciente fictício próprio. Não encaminhe seu convite nem use nome, documento, foto de pessoas ou informações clínicas reais.

Depois de instalar, abra **Viva+ Testes**, cole o convite em **Seu convite** e toque **ENTRAR**. Um convite permite autorizar um aparelho, tem validade de até sete dias e pode ser revogado. Ele não serve para entrar no portal profissional. Ao sair da conta ou expirar o acesso, peça um novo convite. O responsável pode revogar um aparelho perdido.

## Android

1. Abra somente o link privado enviado pelo responsável e baixe o APK indicado.
2. Se necessário, autorize temporariamente a instalação pelo navegador/gerenciador de arquivos que utilizou. Não desative o Play Protect. Se houver alerta de integridade, pare e avise o responsável.
3. Instale e abra **Viva+ Testes**. A versão fica em **Configurações**.
4. Para atualizar por APK, instale a versão nova por cima da anterior, mantendo o mesmo pacote e assinatura. Não desinstale se houver registros aguardando envio.
5. Para remover, sincronize seus registros de teste, saia da conta e use **Informações do aplicativo → Desinstalar** no Android. Isso remove a fila guardada no aparelho.

O APK **Viva+ Demo local 0.1.0**, já instalado/testado no Samsung do proprietário, não é o instalador remoto do grupo. Não compartilhe o endereço doméstico como se funcionasse fora de casa.

## iPhone

Quando o responsável confirmar a liberação, instale **TestFlight**, da Apple, e aceite o convite privado recebido. Dentro do TestFlight, escolha **Instalar** ou **Atualizar** no Viva+. Não há IPA assinado disponível nesta execução. Expo Go não executa a configuração nativa protegida do Viva+; um QR do Metro sozinho não resolve isso.

A alternativa futura pelo Safari é a exportação web do aplicativo, hospedada com HTTPS e conectada à API de testes por convite. Ela permite avaliar telas e registros conectados, mas não comprova SQLCipher, notificações locais, câmera nativa ou instalação iOS. Ainda não existe endereço remoto ativo para essa alternativa.

## Roteiro de teste

| Tela | O que conferir |
| --- | --- |
| Acesso | Convite válido entra; inválido informa erro sem revelar outras contas. |
| Início | Nome da conta fictícia, próximo horário, módulos e navegação inferior. |
| Medicamentos | Doses previstas, dosagem cadastrada, instruções, horário e progresso salvo. Registre uma como tomada e outra como não tomada; tocar repetidamente não pode duplicar. |
| Histórico e calendário | Hoje, ontem, sete dias e período escolhido. Volte ao mesmo dia e confira os registros. |
| Pressão | Registre valores fictícios; confira confirmação e histórico. Não use o teste para decisões clínicas. |
| Alimentação e fotos | Use uma ilustração ou foto de objeto sem pessoas. Confira envio e consulta privada; análise indisponível deve ser informada como tal. |
| Atividades | Registre uma atividade fictícia e consulte a semana. Materiais existentes não são prescrição automática. |
| Diário e consultas | Consulte os registros da sua conta e orientações compartilhadas. O diário impresso é transcrito pelo profissional em conta fictícia própria no portal. |
| Perfil | Confira os dados fictícios e amplie os textos em Configurações. Teste rolagem e botões com a fonte do celular ampliada. |
| Lembretes | No app nativo, ative notificações e teste um horário cadastrado. Informe aparelho, permissão e se o alerta chegou. Testes automáticos de agendamento não comprovam entrega pelo sistema. |
| Offline | Com sessão válida, desligue a internet e registre uma resposta. A tela deve informar envio pendente e manter o progresso salvo anterior. Reconecte e sincronize; confira um único registro. No nativo, teste também fechar/reabrir com fila pendente. |

Antes de sair ou atualizar, envie os registros pendentes. O responsável deve testar revogação e isolamento com duas contas distintas; ninguém deve enxergar os registros dos colegas.

## Informar um problema

Envie pelo canal privado combinado com o grupo:

```text
Identificação do testador (apelido do ensaio):
Android ou iPhone:
Modelo do aparelho e versão do sistema:
Versão/build do Viva+ (Configurações):
Tela:
Passos que executei:
O que aconteceu:
O que esperava:
Estava sem internet? Havia registros pendentes?
Captura, se ajudar (ocultar convite e dados pessoais):
```

Não envie senhas, convites, tokens ou dados clínicos reais. Confira a versão antes de repetir um erro corrigido. Veja o [plano de distribuição](PLANO_DISTRIBUICAO_INTERNA_VIVAMAIS.md) para o estado das dependências externas.
