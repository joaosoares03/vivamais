# Plano de teste do Viva+ para participantes

Reserve de 15 a 20 minutos. Faça o roteiro do perfil que recebeu e marque cada etapa como **Passou**, **Falhou** ou **Não testei**. Use dados inventados e, para a refeição, uma foto de teste sem pessoas ou dados pessoais.

Abra o convite individual que o responsável enviou e guarde a senha e o link em particular. Se o convite tiver expirado, peça outro ao responsável. Você pode usar Safari no iPhone, Chrome no Android ou um navegador no computador.

## Paciente

| Código | O que fazer | O que deve acontecer |
| --- | --- | --- |
| PAC-01 | Abra seu convite e toque em **Entrar**. | A tela inicial abre com sua conta de teste. |
| PAC-02 | Em **Pressão**, registre uma medição fictícia e abra o histórico. | O registro aparece com os valores e a data informados. |
| PAC-03 | Em **Medicamentos**, marque um horário de exemplo como **Tomei** ou **Não tomei**. | O horário exibe a opção selecionada e continua registrado depois de recarregar. |
| PAC-04 | Em **Alimentação**, tire uma foto de teste ou selecione uma da galeria. Confira a prévia e toque em **Salvar refeição**. | A foto aparece na prévia sem precisar comprimi-la manualmente. Depois de salvar, ela aparece em **Minhas refeições**, inclusive após recarregar. O estado da IA informa **Análise não habilitada**. |
| PAC-05 | Registre uma atividade fictícia e volte ao histórico. Abra também **Consultas** e **Perfil**. | A atividade é registrada e as outras telas abrem com os dados da sua conta. |

Se estiver no celular, anote se usou câmera ou galeria na etapa PAC-04. Quando possível, repita com a outra opção. Registre separadamente se uma imagem da galeria em HEIC abriu no seu aparelho.

## Profissional

| Código | O que fazer | O que deve acontecer |
| --- | --- | --- |
| PRO-01 | Abra o convite, crie a senha e toque em **Ativar minha conta profissional**. | A página mostra **Conta ativada** e o e-mail completo em **Identificador de acesso**. |
| PRO-02 | Confira a tela em um celular. Toque em **Copiar e-mail**, depois em **Entrar no portal**. Cole o endereço em **E-mail institucional** e entre com a senha que criou. | O endereço continua legível, com os botões em linhas separadas. O e-mail colado é idêntico ao exibido e o login abre o painel. |
| PRO-03 | Abra **Pacientes** e busque pelo nome do paciente fictício que recebeu. | A busca encontra o paciente vinculado e abre sua ficha. Registros exclusivos de outros participantes permanecem restritos. |
| PRO-04 | Na ficha, consulte pressão, medicamentos e refeições. Se o responsável vinculou um paciente do grupo a você, confira a foto salva por ele. | Registros autorizados aparecem e a foto abre quando há uma refeição com imagem. |
| PRO-05 | Abra **Consultas**, **Relatórios** e **Configurações**. Em relatórios, use um período com registros fictícios. | As telas abrem e o relatório reflete os registros do período e do seu escopo. |

Se o navegador pedir permissão para copiar, use a opção de permitir. Também é possível selecionar o e-mail na própria tela e copiar manualmente. Se já tiver ativado a conta, use o e-mail que guardou e marque PRO-01 como **Não testei** nesta rodada.

[Portal profissional](https://vivamais-portal-viva-mais3.vercel.app) · [Viva+ Paciente](https://viva-api-paciente-homologacao.up.railway.app/convite)

## Envie o resultado ao responsável

Copie o modelo abaixo. Para cada falha, inclua o código do teste, o passo em que ocorreu, o que apareceu e o horário aproximado. Se anexar uma captura, cubra senhas, convites e dados pessoais.

```text
Apelido e perfil
Aparelho, sistema e navegador
Data e horário aproximado
Resultados por código (Passou / Falhou / Não testei)
Falha observada, passo e mensagem da tela
Sugestão de melhoria (opcional)
```

## Para quem organiza a rodada

Crie convites separados no **Grupo de testes** e envie cada um em particular. Para verificar a mesma refeição nas duas versões, vincule uma conta de paciente a um profissional da rodada. Reúna resultados por código e aparelho. Após os testes, confirme a revogação em uma conta combinada com o participante.

[Guia de acesso e gestão de convites](GUIA_TESTES_GRUPO_VIVAMAIS.md)
