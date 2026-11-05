# Cadastro e ativação por SMS

## Exceções de demonstração e grupo — 04/11/2026

SMS não participa do cadastro/acesso demonstrativo local: a resposta de cadastro informa DEMONSTRACAO_HABILITADA, o portal mostra confirmação simples e a emissão é recusada no backend. Para testadores remotos sintéticos, usar convites individuais controlados, HTTPS e identificador separado; o modo CPF/nascimento permanece desligado fora da demonstração local. O fluxo seguro e os provedores descritos abaixo foram preservados. [Medicamentos/convites](MEDICAMENTOS_E_CONVITES.md) e [guia do grupo](GUIA_DISTRIBUICAO_TESTES_GRUPO.md).


Implementação de 20/10/2026, posterior ao acesso sem senha V8. O [pedido integral](product/PEDIDO_CADASTRO_SMS_INTERFACE_2026-10-20.md) substitui a entrega manual do código no portal. A interface/API profissional agora retornam somente metadados de envio. Nenhum provedor foi contratado, nenhuma credencial externa foi fornecida e nenhum SMS real foi enviado nesta execução.

## Fluxo disponível

1. Profissional autorizado cadastra o paciente. Celular brasileiro com DDD é obrigatório em todo novo cadastro; CPF e nascimento continuam obrigatórios na modalidade Aplicativo. Contato por e-mail continua opcional. A modalidade Pulseira + diário não passa a exigir smartphone ou login do paciente.
2. A API verifica formato/dígitos do CPF, unicidade por unidade, calendário e celular. Salva novos celulares em E.164, com `+55`. Não consulta a Receita nem comprova a titularidade da linha.
3. Em **Ativar ou recuperar acesso**, o profissional confere presencialmente identidade e celular, marca a declaração e confirma sua própria senha. A declaração não substitui um processo institucional de identificação aprovado.
4. O backend gera quatro números com CSPRNG, grava somente HMAC do código e solicita o envio pela porta `ServicoEnvioSms`. Não há endpoint público de emissão ou reenvio.
5. Paciente informa CPF/nascimento, recebe desafio opaco e informa os quatro números recebidos. Dados pessoais sozinhos não abrem prontuário. Em seguida autoriza-se o aparelho e abre-se a Home, sem criar senha.
6. Reenvio e recuperação seguem o mesmo fluxo profissional. Novo código invalida o anterior. Aparelhos/sessões anteriores são revogados quando a nova solicitação obtém aceitação adequada; uma falha de envio não encerra aparelhos que já funcionavam.

## Testar nesta máquina, sem SMS real

Na raiz do projeto, iniciar `Iniciar-VivaMais.cmd -Producao -SmsLocal`. `-Producao` seleciona os builds otimizados locais; o ambiente continua de desenvolvimento. Se houver um conjunto iniciado pelo controlador, encerrá-lo antes com `infra/encerrar-local.ps1`; preservar o PostgreSQL e os diretórios privados. Para recompilar, acrescentar `-Recompilar`, conforme o [guia Windows](GUIA_COMPLETO_EXECUCAO_LOCAL_WINDOWS.md).

O parâmetro `-SmsLocal` configura explicitamente `SMS_PROVIDER=LOCAL`, `SMS_LOCAL_TEST_ENABLED=true`, `SMS_REAL_AUTHORIZED=false` e ambiente de desenvolvimento. Sem isso ou configuração equivalente, o padrão é DESABILITADO. A implementação LOCAL recusa inicialização em produção e não chama operadoras.

1. Abrir portal `http://127.0.0.1:3000`; usar a credencial profissional sintética privada descrita em [Como navegar](COMO_NAVEGAR.md). Não enviar a senha ao chat ou ao Git.
2. Cadastrar uma pessoa fictícia e seu celular fictício estruturalmente válido. O exemplo privado `../../work/exemplo-cadastro-acesso.json`, relativo à raiz, já inclui celular para novos cadastros. Os testes geram dados sintéticos em tempo de execução; não usar uma pessoa real.
3. Solicitar o SMS pelo formulário profissional. Conferir **Teste local registrado. Nenhum SMS real foi enviado**. Copiar somente a referência UUID apresentada, que não é o código.
4. Executar localmente `node infra/caixa-sms-local.cjs REFERENCIA_DO_TESTE`. O utilitário não imprime o código: informa o caminho de `.local/private-files/sms-teste/consulta-privada.json`, dentro da pasta com ACL privada. Abrir esse arquivo somente no próprio computador. O arquivo contém dados de teste sensíveis e não deve ser compartilhado, versionado ou usado em captura.
5. Abrir `http://127.0.0.1:8081/acesso`. Informar o CPF/nascimento fictícios cadastrados e o código da caixa local. A validade continua sendo dez minutos; o leitor recusa mensagem expirada, e o servidor recusa código expirado/usado.
6. Atualizar a página, sair/entrar no aparelho autorizado, testar outro perfil do navegador e **Desautorizar este aparelho**. Os mecanismos V8 de cookie HttpOnly/Secure ou SecureStore, renovação e revogação permanecem.

A caixa de desenvolvimento guarda envelopes AES-GCM em `FILES_DIRECTORY/sms-teste`, com chave e permissões privadas. Não existe rota HTTP de leitura. A consulta privada exportada pelo utilitário destina-se somente ao operador de teste; não é armazenamento de produção. O backup clínico não inclui essa caixa nem sua chave. Restaurações devem invalidar códigos e aparelhos antes de disponibilizar o clone.

SMS local não confirma telefone real: `telefone_confirmado_em` permanece nulo nessa modalidade. Esse campo somente pode ser preenchido após verificação de um código emitido pelo canal externo; isso registra posse do código naquele momento, não titularidade do CPF, ausência de SIM swap ou identidade civil.

## Contratos alterados

Prefixo da API: `/api/v1`. Profissional mantém autenticação anterior e escopo por unidade/vínculo.

| Método/rota | Entrada | Saída e regra |
| --- | --- | --- |
| POST `/patients` | Cadastro, incluindo celular | Cadastro/vínculo persistidos; não emite código automaticamente |
| PUT `/pacientes/{id}/dados-pessoais` | Dados/versão; na troca de celular, `senhaProfissional` e `identidadeConferida=true` | Atualização concorrente protegida; troca revoga aparelhos/sessões/códigos/desafios e exige nova ativação |
| PUT `/pacientes/{id}/contato` | Contrato legado | Paciente recebe 403 e orientação para a equipe; não muda sozinho o autenticador telefônico |
| POST `/patients/{id}/access-reset` | Senha atual do profissional e conferência de identidade | `idEnvio`, `estadoEnvio`, `expiraEm`, `destinoMascarado`, `provedor`; **sem `activationToken` e sem código** |
| GET `/patients/{id}/access-status` | Sessão profissional autorizada | Estado do acesso, disponibilidade/provedor e último envio; nunca recupera código |
| POST `/auth/paciente/iniciar` | CPF/nascimento e tipo do cliente | Mesmo contrato V8, resposta genérica para identidade desconhecida/divergente/ambígua |
| POST `/auth/paciente/verificar` | Desafio + string de quatro números | Exige envio elegível e mesma versão do telefone; código de uso único, sessão e aparelho |
| POST `/auth/paciente/renovar`, `/esquecer`; POST `/auth/logout` | Credencial/cookie ou sessão conforme a operação | Contratos e regras V8 preservados |

OpenAPI foi regenerado a partir da API testada e os tipos TypeScript estão em `packages/contracts`. Consumidores antigos que liam `activationToken` devem ser atualizados em conjunto. Não reintroduzir a devolução do segredo para compatibilidade. O cadastro mantém propriedades legadas nulas; não há código nelas.

## Estados e falhas

| Estado do envio | Significado |
| --- | --- |
| PREPARADO | Registro interno; não há confirmação de envio |
| NAO_CONFIGURADO | Serviço desabilitado; nenhum SMS solicitado |
| TESTE_LOCAL | Caixa cifrada de desenvolvimento; nenhum SMS real |
| ACEITO_PROVEDOR | Provedor aceitou a solicitação; não afirmar entrega ao celular |
| ENTREGUE | Provedor informou entrega; ainda não é comprovação de identidade civil |
| FALHA / NAO_ENTREGUE | Falha conhecida; código dessa tentativa não deve autorizar acesso |
| INDETERMINADO | Resposta ausente/inválida ou falha ambígua; código invalidado, sem repetição automática do POST |

Na Twilio, `queued`, `accepted`, `sending` e `sent` são tratados como aceitação, não entrega. `delivered` produz ENTREGUE; `failed`, `undelivered` ou `canceled` produzem NAO_ENTREGUE. A API consulta o estado quando o profissional consulta a ficha, no máximo uma vez a cada trinta segundos por envio. Não há webhook público ou trabalhador contínuo nesta versão; fechar o portal interrompe essa atualização ativa. [Contrato oficial de mensagens](https://www.twilio.com/docs/messaging/api/message-resource), [transições de estado](https://www.twilio.com/docs/messaging/guides/outbound-message-status-in-status-callbacks).

HTTP 409 solicita regularização de cadastro antigo sem celular válido; 429 indica limite temporário; 503 indica envio não confirmado/serviço indisponível. Corpo do provedor, segredo, código e telefone completo não entram nos logs de status/auditoria. Em timeout, o provedor pode ter recebido o pedido: não reenviar automaticamente a mesma mensagem e não autorizar o código que ficou indeterminado. Um eventual SMS tardio dessa tentativa será inutilizável.

## Limites persistidos

| Operação | Limite |
| --- | --- |
| Emissão por paciente | 1/minuto, 3/hora, 10/dia |
| Emissão por telefone, inclusive em pacientes diferentes | 3/hora, 10/dia |
| Emissão por profissional | 40/hora, incluindo falhas de reautenticação |
| Emissão por unidade | 60/hora, 300/dia |
| Emissão por instalação | 100/hora, 500/dia |
| Reautenticação para troca de telefone | 10 tentativas/15 minutos, com contador em transação independente |
| Verificação do código | 5/identidade por 15 minutos e 30/IP por 15 minutos, mantendo regras V8 |

Limites usam chaves HMAC e PostgreSQL, sobrevivem ao reinício e não são desfeitos por uma resposta de erro. Reenvio não zera tentativas de verificação. Janelas são fixas a partir da primeira tentativa. Não alterar o banco principal/chaves/relógio para contornar cooldown. Testes ajustam somente seus schemas exclusivos.

## Configurar provedor externo posteriormente

Implementado adaptador Twilio REST usando o cliente HTTP Java 21, sem SDK adicional. URL do provedor é fixa em HTTPS; não há URL arbitrária configurável para redirecionar credenciais. Redirects são recusados. Conexão tem prazo de três segundos e requisição de cinco; respostas são limitadas a 16 KiB, com conferência de conta, destinatário e referência. Os testes HTTP usam servidor local, não a operadora.

Variáveis **somente do backend**: `SMS_PROVIDER=TWILIO`, `SMS_REAL_AUTHORIZED=true`, `SMS_TWILIO_ACCOUNT_SID`, `SMS_TWILIO_AUTH_TOKEN` e remetente `SMS_TWILIO_FROM` ou `SMS_TWILIO_MESSAGING_SERVICE_SID`. Segredos nunca devem ter prefixo NEXT_PUBLIC/EXPO_PUBLIC. Configuração incompleta ou falta de autorização explícita falha antes de habilitar o adaptador. Não habilitar o envio real durante as suítes; seus helpers exigem provedor LOCAL antes de solicitar mensagens.

Pendem contratação/autorização, remetente e habilitações para Brasil, credenciais, limites financeiros no fornecedor, destinatários de homologação autorizados, avaliação institucional de tratamento de telefone e ensaio real de entrega/falha. O contrato do fornecedor deve ser confirmado pela instituição. O [preço público consultado em 20/10/2026](https://www.twilio.com/en-us/sms/pricing/br) indicava US$ 0,0599 por segmento de SMS de saída usando números internacionais, sujeito a taxas/condições e alteração. Não é orçamento nem custo total garantido; podem existir número/remetente, impostos e cobranças por falhas. Nenhum gasto foi realizado.

A emissão atual é síncrona, com limite de cinco segundos sob transação. Para maior carga/disponibilidade, falta outbox durável e reconciliação do caso de resposta perdida/commit interrompido. Os limites técnicos não substituem teto financeiro no fornecedor. Ver o inventário geral e o plano técnico para os critérios de produção.

## Migração e arquivos

V9 amplia `patient.telefone` para varchar(16), adiciona versão/confirmação do número e cria `envio_sms_ativacao`, sem corpo/código do SMS em texto puro. A nova tabela tem RLS e revogações diretas. O banco fica com 33 tabelas incluindo Flyway, 32 com RLS. V1–V8 permanecem inalteradas.

Cadastros anteriores, inclusive sem celular ou com formato antigo, são preservados. Regularização profissional é exigida antes de novos envios. O simples ajuste da máscara de um celular antigo válido não equivale a trocar seu número. Códigos manuais pendentes anteriores à V9 são invalidados; aparelhos já autorizados permanecem. A [conferência da migração](evidencias/cadastro-sms-interface/migracao-v9.json) registra o ensaio do banco local.

Arquivos centrais: `service/sms/ServicoEnvioSms`, `SmsLocalDesenvolvimento`, `EnvioSmsTwilio`, `config/ConfiguracaoSms`, `service/AcessoPacienteService`, `DadosPessoaisService`, V9, `web/components/AtivacaoPaciente.tsx`, `CamposDadosPessoais.tsx`, `DadosPessoaisPaciente.tsx`, `components/ContatoPaciente.tsx`, contratos e `infra/caixa-sms-local.cjs`. Caminhos Java têm prefixo `backend/demo/src/main/java/com/vivamais/`.

Testes relevantes: `CadastroSmsIT`, `AcessoPacienteIT`, `ConfiguracaoSmsTest`, `EnvioSmsTwilioTest`, `ValidacaoCadastroTest`, `tests/mobile/cadastro.test.ts`, `web/components/AtivacaoPaciente.test.tsx` e `tests/e2e/cadastro-sms.spec.ts`. Resultados finais e limitações ficam no relatório desta entrega; compilação/exportação não comprova aparelho físico, entrega de SMS real ou validação oficial de CPF.
