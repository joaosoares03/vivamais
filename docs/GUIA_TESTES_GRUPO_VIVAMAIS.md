# Testar o Viva+ com seu grupo

Este ambiente é acadêmico e aceita **somente informações fictícias**. Não informe dados de familiares ou pacientes e não use fotos pessoais. Os registros e medicamentos de exemplo não são orientações de saúde.

- [Viva+ Paciente](https://viva-api-paciente-homologacao.up.railway.app/convite)
- [Viva+ Profissional](https://vivamais-portal-viva-mais3.vercel.app)

O endereço sozinho não autoriza entrada. Peça um convite individual ao responsável. Não publique links de convite, QR, senhas ou capturas que os mostrem.

## Para o responsável

Entre no portal com sua conta de administrador da homologação. O arquivo privado `.local/nuvem/ACESSO_ADMIN_GRUPO.txt`, no computador do proprietário, contém o acesso; ele não faz parte do GitHub nem deve ser enviado ao grupo.

1. Abra **Grupo de testes** no menu.
2. Informe um apelido inventado e escolha **Paciente** ou **Profissional**.
3. Escolha a validade: 1, 3 ou 7 dias. Para pacientes, pode selecionar um profissional do grupo para acompanhar aquela conta. Sem seleção, somente o administrador acompanha esse paciente.
4. Informe sua senha de administrador e clique em **Adicionar integrante e gerar convite**.
5. Copie o link mostrado e entregue somente à pessoa escolhida, por um canal privado. O sistema não envia SMS ou e-mail.
6. O convite profissional abre uma página para criar uma senha individual. Ele não concede administração. Um paciente fictício exclusivo já é atribuído ao profissional.
7. O convite de paciente abre o aplicativo e autoriza a conta fictícia correspondente. Cada participante recebe seu próprio paciente, sem compartilhar os registros de outro integrante.

Cada conta nova inclui registros claramente fictícios de pressão, medicamento, refeição ilustrada, atividade, consulta e diário. Pode criar outros dados de teste pelos formulários. Não existe prescrição real nestes exemplos.

**Desativar e revogar acesso** encerra o acesso do integrante. Convites expirados não funcionam. Para emitir outro, preencha sua senha e use **Reemitir convite**. Isso encerra as sessões anteriores; profissionais precisam criar uma nova senha pelo novo link. O novo convite também é individual e de uso único. Reemitir um convite reativa aquele participante pelo novo prazo.

O status mostra espera, uso, expiração ou desativação. O link completo só aparece na emissão; se o perder, reemita. Há limites de tentativas e de novas contas para controlar uso e custos; aguarde se aparecer uma mensagem de limite.

## Testador paciente

1. Abra seu convite no navegador. Toque em **ENTRAR**. O aplicativo pode pedir um novo convite após expiração, revogação ou limpeza dos dados do navegador.
2. Na página inicial, abra **Pressão**, informe números fictícios e salve. Confira o histórico. O celular não mede pressão.
3. Abra **Medicamentos**. Veja os horários de exemplo e teste **Tomei** e **Não tomei**. São autorrelatos; não tome medicamento por causa da demonstração.
4. Em **Alimentação**, toque em **Tirar foto** ou **Escolher da galeria**. Prefira uma imagem de teste sem pessoas ou dados pessoais. Confira a prévia, escreva uma observação opcional e toque em **Salvar refeição**.
5. Aguarde a confirmação. A foto aparece em **Minhas refeições**, inclusive depois de atualizar a página ou entrar novamente. Pode substituir a seleção usando os mesmos botões ou escolher **Remover foto** antes de salvar.
6. Fotos comuns são reduzidas automaticamente. Se o envio falhar, mantenha a foto selecionada e tente salvar outra vez. A conexão é necessária para fotos; não feche a página durante o envio.
7. A mensagem **Análise não habilitada** informa a situação real da IA: neste ambiente, a foto é armazenada e compartilhada somente com a equipe autorizada. Não é uma avaliação nutricional automática.
8. Explore **Atividades**, histórico/semana, consultas, diário disponível, lembretes, mensagens e perfil. Não interprete exemplos de atividades como prescrição pessoal.

## Testador profissional

1. Abra seu link individual. Defina uma senha de pelo menos 12 caracteres e confirme-a.
2. Guarde o identificador de acesso apresentado. Ele é um endereço fictício gerado pelo sistema, não seu e-mail pessoal.
3. Clique em **Entrar no portal** e informe esse identificador e sua senha. Abra o painel e a lista de pacientes.
4. Acesse o paciente fictício atribuído e confira pressão, medicamentos, refeições, atividades, consultas e histórico. As fotografias permanecem privadas e exigem vínculo autorizado.
5. Em **Cadastrar paciente**, invente todos os dados e use os dados sintéticos combinados com o responsável. CPF exige dígitos válidos; nunca use um CPF real para passar a validação. O responsável pode criar contas de paciente pelo Grupo de testes sem solicitar CPF pessoal.
6. Teste a busca pelo nome fictício, a ficha, inclusão/edição de medicamentos de exemplo, consulta, relatórios/exportação e configurações. A inclusão de paciente pelo profissional cria seu vínculo automaticamente.
7. Na ficha do paciente fictício elegível, a equipe vinculada pode emitir convite de paciente mediante sua própria senha. A gestão dos integrantes e a criação de profissionais ficam com o administrador.
8. Não é esperado que apareçam pacientes atribuídos somente a outros profissionais. Informe ao responsável se algum registro indevido ficar visível.

## Aparelhos

- **iPhone:** abra no Safari atualizado. Permita acesso à câmera quando solicitado. Fotos HEIC/HEIF são convertidas quando o Safari ou o aparelho suporta sua abertura. Se o navegador não conseguir abrir uma imagem específica, tire outra foto pelo botão de câmera ou selecione JPEG/PNG. Não é necessário comprimir manualmente as imagens aceitas. O limite original é 10 MB.
- **Android:** use Chrome atualizado e autorize a câmera. O teste web não exige APK. O aplicativo nativo precisa de build que inclua os novos módulos de imagem; um APK antigo não recebe estas alterações automaticamente.
- **Computador:** use Chrome, Edge ou Safari atualizado. Se não houver câmera, escolha uma imagem da galeria/arquivos. O portal profissional também funciona no celular.
- O computador do desenvolvedor não precisa permanecer ligado para os endereços de homologação. Uma pausa/reinicialização dos provedores pode tornar o primeiro acesso mais lento.

## Como relatar um problema

Envie ao responsável: aparelho/modelo, versão do sistema, navegador, tela, ação realizada, mensagem do erro e o resultado esperado. Informe o horário aproximado. Se possível, envie uma captura **sem senha, convite, QR, identificadores pessoais ou informações clínicas reais**. Para falha de foto, diga se usou câmera/galeria e o tamanho aproximado; não envie foto pessoal.

Validação técnica e limites conhecidos: [relatório de fotos, IA e grupo](evidencias/VALIDACAO_FOTOS_IA_E_TESTES_GRUPO.md).
