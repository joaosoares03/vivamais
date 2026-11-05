# Inventário completo de funcionalidades

## Atualização de 04/11/2026 — medicamentos e grupo

Cadastro local sem SMS reconhecido no backend e portal; agenda/histórico/dosagem/horário efetivo/concorrência/fila e resumo da Home implementados; portal com autoria e filtros. Convites individuais fortes, renovação rotativa, revogação e UI concluídos no código. Perfis Expo/EAS/iOS e homologação preparados, sem publicação. [Detalhamento técnico](MEDICAMENTOS_E_CONVITES.md) e [evidências/limites](evidencias/MEDICAMENTOS_CONVITES_EXPO_2026-11-04.md). Notificações são agendadas com preferências/deduplicação; entrega nativa não ensaiada. Novo E2E completo da UI aguarda PostgreSQL/API autorizados; nenhum progresso fictício de tela usado como conclusão.


## Atualização de 03/11/2026

A tabela abaixo é histórica. Nesta revisão, foram adicionados: login demonstrativo isolado sem SMS; datas DD/MM/AAAA com hora separada; consultas dos próprios objetivos/plano pelo paciente; leitura local com TTL/SQLCipher nativo e memória web; exportação completa paginada de oito categorias; retificação imutável de anotações com motivo/autor/versão e original preservado. Aceites Java/frontend e browser aprovados, incluindo103consultas exportadas. O cache após reabertura ainda precisa de ensaio nativo. APKs reais USB/rede foram gerados e verificados, sem instalação presumida.

Instalação manual preparada: APK de rede aponta ao PC, conector8083 opcional restrito ao celular sintético e download de um único instalável;8080 continua loopback. Não abre API pública. A regra Windows depende de execução/UAC autorizado pelo proprietário. Guia passo a passo e estado real no relatório. Home/histórico/menu corrigidos em320 com fonte ampliada; capturas finais preservadas.

As consultas do paciente não devolvem notas internas nem motivos de retificação. A exportação não inclui fotografias/credenciais e recusa arquivo parcial. A retificação não altera pressão/pulso/data. Configuração EAS e IDs seguros/separados preparados; export Hermes não equivale a APK/IPA. Consultar [relatório vigente](RELATORIO_FINALIZACAO_GERAL_VIVAMAIS.md) para resultados efetivamente executados e [guia](GUIA_PUBLICACAO_PLAY_STORE_APP_STORE.md) para contas/assinatura/publicação. Não interpretar P15/P35/P39 ou as contagens antigas como fotografia atual.

## Inventário histórico de 20/10

Verificação de20/10/2026, escopo de demonstração sintética. Cada estado abaixo se refere ao limite descrito: “Concluída e testada” é aceite local, não produtivo/nativo. As cinco classificações são: Concluída e testada; Implementada parcialmente; Implementada sem validação suficiente; Pendente; Bloqueada por dependência externa.

Foram encontrados37 arquivos de rota Expo (incluindo aliases/estados),11 páginas Next e58 operações OpenAPI. Quantidade de arquivos não é quantidade de funcionalidades concluídas. Este inventário cobre produto e controles transversais; o [catálogo de endpoints](CATALOGO_API_E_ROTAS.md) e o [dicionário das33 tabelas](ARQUITETURA_BANCO_DADOS.md) são anexos completos. Testes citados são arquivos existentes; resultados novos no [relatório](RELATORIO_TRANSFERENCIA_E_PUBLICACAO.md).

| ID | Módulo | Estado | Limite |
| --- | --- | --- | --- |
| F01 | Acesso profissional | Concluída e testada | Limite de login em memória por instância; gestão/recuperação produtiva pendente P32/P40 |
| F02 | Cadastro de paciente | Concluída e testada | CPF estrutural não confirma identidade; ambiguidade entre unidades P05 |
| F03 | Dados pessoais e troca telefônica | Concluída e testada | Paciente recebe403 ao tentar trocar telefone sozinho; processo institucional ainda P06 |
| F04 | Ativação por SMS LOCAL | Concluída e testada | Somente LOCAL habilitado em development/test; nenhum SMS externo; não confirma telefone |
| F05 | SMS Twilio | Bloqueada por dependência externa | Faltam conta/credenciais/autorização/remetente/custo/ensaio real; outbox P37 |
| F06 | Identificação e dispositivos | Concluída e testada | Aceite browser/Java; SecureStore e ciclo nativo dependem P07/P08/P09 |
| F07 | Home e perfil paciente | Concluída e testada | QueryClient em memória; cache persistente pós-reinício não existe P15 |
| F08 | Pressão manual | Concluída e testada | Faixas técnicas/abreviação não equivalem diagnóstico ou protocolo aprovado |
| F09 | Pressão: histórico e gráfico | Concluída e testada | Sem interpretação clínica automática; totais/paginação não são relatório ilimitado |
| F10 | Arquivos privados | Concluída e testada | Local AES-GCM validado; Supabase externo não validado P18; câmera física P11 |
| F11 | OCR de pressão | Implementada parcialmente | Fixture funcional; precisão representativa/novos modelos pertencem outro dev P30 |
| F12 | Planos de medicamentos | Concluída e testada | Não prescreve automaticamente; validade clínica da prescrição é responsabilidade da equipe |
| F13 | Autorrelatos de medicamentos | Concluída e testada | Notificação e autorrelato não comprovam ingestão; comportamento nativo pendente |
| F14 | Lembretes e notificações | Implementada sem validação suficiente | Sem ensaio de SO/aparelho; agenda finita depende de reabertura P12/P13 |
| F15 | Alimentação: foto e histórico | Concluída e testada | Foto/histórico funcionais; análise é outra funcionalidade F16 |
| F16 | Análise alimentar | Bloqueada por dependência externa | Outro dev IA/nutrição,contrato/credenciais/corpus/aprovação P29 |
| F17 | Perfil e registro de atividades | Concluída e testada | Perfil/autorrelato não são recomendação clínica; catálogo/vídeo em P27/P28 |
| F18 | Semana e histórico de atividade | Concluída e testada | Não é planejamento semanal prescritivo nem metas aprovadas |
| F19 | Recomendação/vídeo de exercícios | Bloqueada por dependência externa | Outro dev exercícios; protocolo,catálogo licenciado,videos/acessibilidade P27/P28 |
| F20 | Mensagens e orientações | Implementada parcialmente | Somente leitura de orientação; chat/envio bidirecional não existe P34 |
| F21 | Diário transcrito | Concluída e testada | Retificação auditada ainda P39; não é leitura direta do paciente/dispositivo |
| F22 | Consultas | Concluída e testada | Não é agenda/teleconsulta; retificação e estrutura adicional dependem escopo P39 |
| F23 | Resumo e relatórios | Implementada parcialmente | JSON é resumo com20 itens/coleção e totais completos; export completo/formato institucional P35 |
| F24 | Painel,busca e vínculos | Concluída e testada | Ciclo de vida de profissional ainda P32; filtros correspondem à API real |
| F25 | Preferências e acessibilidade visual | Concluída e testada | Aceite browser; leitores/usuários representativos e nativo P10 |
| F26 | Offline e sincronização | Implementada parcialmente | Web memória; SQLCipher/cache e queda física ainda P14/P15/P16 |
| F27 | Navegação,responsividade e identidade | Implementada parcialmente | Larguras de browser aprovadas; fidelidade36 referências e acessibilidade física P10/P31 |
| F28 | Pulseira | Bloqueada por dependência externa | Sem BLE/protocolo/fabricante/ensaio físico P26 |
| F29 | Auditoria e base legal | Implementada parcialmente | Consulta/retenção e fluxo base legal institucionais P22/P23 |
| F30 | Privacidade,suporte e exclusão | Pendente | Políticas/canal oficial/protocolo/exclusão conforme retenção P23/P24/P25 |
| F31 | Backup,infra e publicação de app | Implementada parcialmente | Sem deploy/HTTPS/lojas/monitoramento/restore hospedado/ensaio físico P17–P21 |
| F32 | Consulta oficial de CPF | Bloqueada por dependência externa | Serpro/Conecta exigem habilitação/contrato; sem scraping/P04 |

## F01 — Acesso profissional

| Campo | Implementação real |
| --- | --- |
| 1.Nome | Acesso profissional |
| 2.Objetivo | Abrir e encerrar sessão profissional/admin |
| 3.Como funciona | Formulário → BFF session → senha BCrypt → token opaco/hash PG → cookie HttpOnly → layout autorizado |
| 4.Arquivos responsáveis | web/app/page.tsx; web/app/api/session/route.ts; web/app/api/logout/route.ts; web/services/api.ts; backend/demo/src/main/java/com/vivamais/controller/InstituicaoController; backend/demo/src/main/java/com/vivamais/service/AutenticacaoService (nomes agrupados identificam classes separadas, não um único caminho) |
| 5.Endpoints | POST /api/v1/auth/login; POST /api/v1/auth/logout; GET /api/v1/auth/me |
| 6.Tabelas | user_account,auth_session,audit_event |
| 7.Fluxo | Formulário → BFF session → senha BCrypt → token opaco/hash PG → cookie HttpOnly → layout autorizado; validações: Conta habilitada, papel não PATIENT, senha até72bytes, limite email/IP; erro401 genérico |
| 8.Estado atual | Concluída e testada |
| 9.Testes existentes | InstituicaoIT; foundation.spec.ts; web/services/validacoes.test.ts |
| 10.Limitações conhecidas | Limite de login em memória por instância; gestão/recuperação produtiva pendente P32/P40 |

## F02 — Cadastro de paciente

| Campo | Implementação real |
| --- | --- |
| 1.Nome | Cadastro de paciente |
| 2.Objetivo | Cadastrar e vincular paciente APP ou diário |
| 3.Como funciona | Formulário → normalização → BFF → DTO EntradaPaciente → transação → paciente/vínculo → ficha |
| 4.Arquivos responsáveis | web/components/CadastroPaciente.tsx; web/components/CamposDadosPessoais.tsx; web/app/api/domain/[...path]/route.ts; packages/contracts/src/cadastro.ts; backend/demo/src/main/java/com/vivamais/controller/CuidadoController; backend/demo/src/main/java/com/vivamais/service/CuidadoService (nomes agrupados identificam classes separadas, não um único caminho) |
| 5.Endpoints | POST /api/v1/patients |
| 6.Tabelas | patient,user_account,patient_professional_assignment,audit_event |
| 7.Fluxo | Formulário → normalização → BFF → DTO EntradaPaciente → transação → paciente/vínculo → ficha; validações: Profissional/admin da unidade; celular E.164 válido; CPF único na unidade; APP exige nascimento/CPF; não expor código |
| 8.Estado atual | Concluída e testada |
| 9.Testes existentes | CadastroSmsIT; CuidadoIT; cadastro-sms.spec.ts |
| 10.Limitações conhecidas | CPF estrutural não confirma identidade; ambiguidade entre unidades P05 |

## F03 — Dados pessoais e troca telefônica

| Campo | Implementação real |
| --- | --- |
| 1.Nome | Dados pessoais e troca telefônica |
| 2.Objetivo | Consultar/editar cadastro com concorrência e revogação |
| 3.Como funciona | Ficha → versão/novos dados → senha profissional se telefone mudou → update versão → revogação → UI recarrega |
| 4.Arquivos responsáveis | web/components/DadosPessoaisPaciente.tsx; components/ContatoPaciente.tsx; packages/contracts/src/cadastro.ts; web/app/api/domain/[...path]/route.ts; backend/demo/src/main/java/com/vivamais/controller/DadosPessoaisController; backend/demo/src/main/java/com/vivamais/service/DadosPessoaisService (nomes agrupados identificam classes separadas, não um único caminho) |
| 5.Endpoints | GET /api/v1/pacientes/{idPaciente}/dados-pessoais; PUT /api/v1/pacientes/{idPaciente}/dados-pessoais; PUT /api/v1/pacientes/{idPaciente}/contato |
| 6.Tabelas | patient,user_account,dispositivo_acesso_paciente,auth_session,codigo_ativacao_paciente,desafio_acesso_paciente |
| 7.Fluxo | Ficha → versão/novos dados → senha profissional se telefone mudou → update versão → revogação → UI recarrega; validações: Vínculo/unidade, versão409, data não futura, CPF/DDD; campos legados sem alteração preservados |
| 8.Estado atual | Concluída e testada |
| 9.Testes existentes | CadastroSmsIT; CuidadoIT; execucao-local.spec.ts |
| 10.Limitações conhecidas | Paciente recebe403 ao tentar trocar telefone sozinho; processo institucional ainda P06 |

## F04 — Ativação por SMS LOCAL

| Campo | Implementação real |
| --- | --- |
| 1.Nome | Ativação por SMS LOCAL |
| 2.Objetivo | Emitir código sem revelar na API e ativar paciente fictício |
| 3.Como funciona | Profissional confirma identidade/senha → HMAC + envelope AES-GCM privado → metadados → operador lê caixa → paciente verifica |
| 4.Arquivos responsáveis | web/components/AtivacaoPaciente.tsx; app/ativar-conta.tsx; infra/caixa-sms-local.cjs; contexts/ContextoAutenticacao.tsx; backend/demo/src/main/java/com/vivamais/controller/AcessoPacienteController; CuidadoController; backend/demo/src/main/java/com/vivamais/service/AcessoPacienteService; sms/SmsLocalDesenvolvimento (nomes agrupados identificam classes separadas, não um único caminho) |
| 5.Endpoints | POST /api/v1/patients/{id}/access-reset; GET /api/v1/patients/{id}/access-status; POST /api/v1/auth/paciente/verificar |
| 6.Tabelas | envio_sms_ativacao,codigo_ativacao_paciente,limite_acesso_paciente,desafio_acesso_paciente |
| 7.Fluxo | Profissional confirma identidade/senha → HMAC + envelope AES-GCM privado → metadados → operador lê caixa → paciente verifica; validações: Quatro números,10min/uso único,limites persistidos,versão telefone; código nunca em portal/resposta comum/log |
| 8.Estado atual | Concluída e testada |
| 9.Testes existentes | CadastroSmsIT; AcessoPacienteIT; cadastro-sms.spec.ts; AtivacaoPaciente.test.tsx |
| 10.Limitações conhecidas | Somente LOCAL habilitado em development/test; nenhum SMS externo; não confirma telefone |

## F05 — SMS Twilio

| Campo | Implementação real |
| --- | --- |
| 1.Nome | SMS Twilio |
| 2.Objetivo | Separar envio real, aceitação e entrega/falha |
| 3.Como funciona | Porta ServicoEnvioSms → HTTPS fixo → resposta validada → estado persistido; consulta ativa limitada30s |
| 4.Arquivos responsáveis | web/components/AtivacaoPaciente.tsx; web/app/api/domain/[...path]/route.ts; backend/demo/src/main/java/com/vivamais/controller/AcessoPacienteController; CuidadoController; backend/demo/src/main/java/com/vivamais/service/AcessoPacienteService; sms/EnvioSmsTwilio (nomes agrupados identificam classes separadas, não um único caminho) |
| 5.Endpoints | POST /api/v1/patients/{id}/access-reset; GET /api/v1/patients/{id}/access-status |
| 6.Tabelas | envio_sms_ativacao,codigo_ativacao_paciente,limite_acesso_paciente |
| 7.Fluxo | Porta ServicoEnvioSms → HTTPS fixo → resposta validada → estado persistido; consulta ativa limitada30s; validações: Sem redirect/retry POST ambíguo; segredo backend; ACEITO_PROVEDOR não significa ENTREGUE |
| 8.Estado atual | Bloqueada por dependência externa |
| 9.Testes existentes | EnvioSmsTwilioTest (HTTP local); ConfiguracaoSmsTest |
| 10.Limitações conhecidas | Faltam conta/credenciais/autorização/remetente/custo/ensaio real; outbox P37 |

## F06 — Identificação e dispositivos

| Campo | Implementação real |
| --- | --- |
| 1.Nome | Identificação e dispositivos |
| 2.Objetivo | Acesso sem senha com prova criptográfica do aparelho |
| 3.Como funciona | CPF+nascimento → desafio opaco → cookie/credencial ou código → sessão curta → rotação/saída/desautorização |
| 4.Arquivos responsáveis | app/acesso.tsx; app/ativar-conta.tsx; contexts/ContextoAutenticacao.tsx; services/autenticacao/dispositivoPaciente.ts; services/autenticacao/armazenamentoSessao.ts; backend/demo/src/main/java/com/vivamais/controller/AcessoPacienteController; backend/demo/src/main/java/com/vivamais/service/AcessoPacienteService (nomes agrupados identificam classes separadas, não um único caminho) |
| 5.Endpoints | POST /api/v1/auth/paciente/iniciar; POST /api/v1/auth/paciente/verificar; POST /api/v1/auth/paciente/renovar; POST /api/v1/auth/paciente/esquecer |
| 6.Tabelas | patient,dispositivo_acesso_paciente,desafio_acesso_paciente,codigo_ativacao_paciente,auth_session |
| 7.Fluxo | CPF+nascimento → desafio opaco → cookie/credencial ou código → sessão curta → rotação/saída/desautorização; validações: Não conceder por dados pessoais; erro genérico; credencial não exposta a JS web; revogar/expirar |
| 8.Estado atual | Concluída e testada |
| 9.Testes existentes | AcessoPacienteIT; acesso-paciente.spec.ts; dispositivo-paciente.test.ts |
| 10.Limitações conhecidas | Aceite browser/Java; SecureStore e ciclo nativo dependem P07/P08/P09 |

## F07 — Home e perfil paciente

| Campo | Implementação real |
| --- | --- |
| 1.Nome | Home e perfil paciente |
| 2.Objetivo | Apresentar dados e contadores reais do titular |
| 3.Como funciona | Identificação da sessão → consultas paralelas por id → totais/última pressão → cards reais |
| 4.Arquivos responsáveis | app/inicio.tsx; app/perfil.tsx; hooks/usePainelPaciente.ts; hooks/useResumoPaciente.ts; services/pacientes/pacientes.ts; backend/demo/src/main/java/com/vivamais/controller/InstituicaoController; CuidadoController; backend/demo/src/main/java/com/vivamais/service/CuidadoService (nomes agrupados identificam classes separadas, não um único caminho) |
| 5.Endpoints | GET /api/v1/patients/me; GET /api/v1/patients/{id}/readings; GET /api/v1/patients/{id}/medication-events |
| 6.Tabelas | patient,blood_pressure_reading,medication_plan,medication_self_report,meal_photo,activity_record |
| 7.Fluxo | Identificação da sessão → consultas paralelas por id → totais/última pressão → cards reais; validações: Query keys incluem titular,estado vazio/erro; não manter dado do titular anterior |
| 8.Estado atual | Concluída e testada |
| 9.Testes existentes | acesso-navegacao.spec.ts; mobile-web.spec.ts; CuidadoIT |
| 10.Limitações conhecidas | QueryClient em memória; cache persistente pós-reinício não existe P15 |

## F08 — Pressão manual

| Campo | Implementação real |
| --- | --- |
| 1.Nome | Pressão manual |
| 2.Objetivo | Registrar valor conferido com autoria e idempotência |
| 3.Como funciona | Formulário → criarCorpoRegistro → UUID/fila → POST → INSERT idempotente → resultado/histórico |
| 4.Arquivos responsáveis | app/pressao/digitar.tsx; app/pressao/resultado.tsx; services/pressao/registrosPressao.ts; services/sincronizacao/filaRegistros.ts; backend/demo/src/main/java/com/vivamais/controller/CuidadoController; backend/demo/src/main/java/com/vivamais/service/CuidadoService (nomes agrupados identificam classes separadas, não um único caminho) |
| 5.Endpoints | POST /api/v1/patients/{id}/readings; GET /api/v1/pacientes/{idPaciente}/registros-pressao/{idRegistro} |
| 6.Tabelas | blood_pressure_reading,sync_operation,audit_event |
| 7.Fluxo | Formulário → criarCorpoRegistro → UUID/fila → POST → INSERT idempotente → resultado/histórico; validações: Titular/vínculo; valores e confirmação explícita; mesma operação não duplica |
| 8.Estado atual | Concluída e testada |
| 9.Testes existentes | CuidadoIT; mobile-care.spec.ts; portugues-pressao.spec.ts; care-core.test.ts |
| 10.Limitações conhecidas | Faixas técnicas/abreviação não equivalem diagnóstico ou protocolo aprovado |

## F09 — Pressão: histórico e gráfico

| Campo | Implementação real |
| --- | --- |
| 1.Nome | Pressão: histórico e gráfico |
| 2.Objetivo | Consultar medições por período com leitura visual |
| 3.Como funciona | Filtro → GET paginado → lista/gráfico sistólica/diastólica → vazio/erro explícito |
| 4.Arquivos responsáveis | app/pressao/historico.tsx; components/GraficoPressao.tsx; web/components/GraficoPressao.tsx; hooks/usePainelPaciente.ts; web/components/CuidadoPaciente.tsx; backend/demo/src/main/java/com/vivamais/controller/CuidadoController; backend/demo/src/main/java/com/vivamais/service/CuidadoService (nomes agrupados identificam classes separadas, não um único caminho) |
| 5.Endpoints | GET /api/v1/patients/{id}/readings |
| 6.Tabelas | blood_pressure_reading |
| 7.Fluxo | Filtro → GET paginado → lista/gráfico sistólica/diastólica → vazio/erro explícito; validações: from/to,ordem,escopo; datas em America/Sao_Paulo |
| 8.Estado atual | Concluída e testada |
| 9.Testes existentes | CuidadoIT; mobile-care.spec.ts; portugues-pressao.spec.ts |
| 10.Limitações conhecidas | Sem interpretação clínica automática; totais/paginação não são relatório ilimitado |

## F10 — Arquivos privados

| Campo | Implementação real |
| --- | --- |
| 1.Nome | Arquivos privados |
| 2.Objetivo | Receber e entregar imagem autorizada/sanitizada |
| 3.Como funciona | Upload multipart → autorização → ImageIO reencode → objeto cifrado + metadado → grant60s → leitura autorizada |
| 4.Arquivos responsáveis | components/FluxoFotografia.tsx; components/ImagemPrivada.tsx; services/api.ts; web/app/api/photos/[id]/route.ts; backend/demo/src/main/java/com/vivamais/controller/ArquivoPrivadoController; backend/demo/src/main/java/com/vivamais/service/ArquivoPrivadoService; ArmazenamentoArquivos (nomes agrupados identificam classes separadas, não um único caminho) |
| 5.Endpoints | POST /api/v1/patients/{id}/files; POST /api/v1/files/{id}/link; GET /api/v1/files/{id}/content |
| 6.Tabelas | file_object,file_download_grant |
| 7.Fluxo | Upload multipart → autorização → ImageIO reencode → objeto cifrado + metadado → grant60s → leitura autorizada; validações: PNG/JPEG até2MB,20–4096px,até12M pixels,20 fotos/mês/paciente; grant depende sessão |
| 8.Estado atual | Concluída e testada |
| 9.Testes existentes | CuidadoIT; mobile-care.spec.ts; restore anterior |
| 10.Limitações conhecidas | Local AES-GCM validado; Supabase externo não validado P18; câmera física P11 |

## F11 — OCR de pressão

| Campo | Implementação real |
| --- | --- |
| 1.Nome | OCR de pressão |
| 2.Objetivo | Extrair proposta de valores de visor com revisão humana |
| 3.Como funciona | Imagem privada → OCR local → proposta/estado → tela confere → registro OCR_CONFIRMED explícito |
| 4.Arquivos responsáveis | app/pressao/foto.tsx; components/FluxoFotografia.tsx; services/pressao/registrosPressao.ts; infra/ocr-worker.mjs; backend/demo/src/main/java/com/vivamais/controller/ArquivoPrivadoController; backend/demo/src/main/java/com/vivamais/service/ArquivoPrivadoService; ReconhecedorTesseract (nomes agrupados identificam classes separadas, não um único caminho) |
| 5.Endpoints | POST /api/v1/files/{id}/ocr; POST /api/v1/patients/{id}/readings |
| 6.Tabelas | pressure_ocr_document,file_object,blood_pressure_reading |
| 7.Fluxo | Imagem privada → OCR local → proposta/estado → tela confere → registro OCR_CONFIRMED explícito; validações: Nunca grava medição por OCR sozinho; titular,finalidade,limites e associação documento |
| 8.Estado atual | Implementada parcialmente |
| 9.Testes existentes | CuidadoIT com Tesseract real; mobile-care.spec.ts |
| 10.Limitações conhecidas | Fixture funcional; precisão representativa/novos modelos pertencem outro dev P30 |

## F12 — Planos de medicamentos

| Campo | Implementação real |
| --- | --- |
| 1.Nome | Planos de medicamentos |
| 2.Objetivo | Profissional manter dose/horários e histórico de versão |
| 3.Como funciona | Formulário equipe → DTO → transação plano+horários/histórico → GET paciente autorizado |
| 4.Arquivos responsáveis | web/components/CuidadoPaciente.tsx; app/medicamentos/index.tsx; components/TelaCuidado.tsx; hooks/usePainelPaciente.ts; backend/demo/src/main/java/com/vivamais/controller/CuidadoController; backend/demo/src/main/java/com/vivamais/service/CuidadoService (nomes agrupados identificam classes separadas, não um único caminho) |
| 5.Endpoints | GET /api/v1/patients/{id}/medications; POST /api/v1/patients/{id}/medications; PUT /api/v1/medications/{plan}; GET /api/v1/medications/{plan}/history |
| 6.Tabelas | medication_plan,medication_schedule,medication_plan_history |
| 7.Fluxo | Formulário equipe → DTO → transação plano+horários/histórico → GET paciente autorizado; validações: Ação de escrita profissional,versão concorrente e horários válidos |
| 8.Estado atual | Concluída e testada |
| 9.Testes existentes | CuidadoIT; care.spec.ts; mobile-care.spec.ts |
| 10.Limitações conhecidas | Não prescreve automaticamente; validade clínica da prescrição é responsabilidade da equipe |

## F13 — Autorrelatos de medicamentos

| Campo | Implementação real |
| --- | --- |
| 1.Nome | Autorrelatos de medicamentos |
| 2.Objetivo | Paciente registrar resposta de cuidado sem comprovar ingestão |
| 3.Como funciona | Plano/dia → botão de resposta → evento idempotente → estado por horário → ficha |
| 4.Arquivos responsáveis | app/medicamentos/index.tsx; components/TelaCuidado.tsx; services/lembretes/calculoLembretes.ts; backend/demo/src/main/java/com/vivamais/controller/CuidadoController; backend/demo/src/main/java/com/vivamais/service/CuidadoService (nomes agrupados identificam classes separadas, não um único caminho) |
| 5.Endpoints | POST /api/v1/patients/{id}/medication-reports; GET /api/v1/patients/{id}/medication-events |
| 6.Tabelas | medication_self_report,medication_plan,medication_schedule |
| 7.Fluxo | Plano/dia → botão de resposta → evento idempotente → estado por horário → ficha; validações: Titular,plano ativo,UUID,horário; texto verdadeiro para NO_CONFIRMATION |
| 8.Estado atual | Concluída e testada |
| 9.Testes existentes | CuidadoIT; mobile-care.spec.ts; care-core.test.ts |
| 10.Limitações conhecidas | Notificação e autorrelato não comprovam ingestão; comportamento nativo pendente |

## F14 — Lembretes e notificações

| Campo | Implementação real |
| --- | --- |
| 1.Nome | Lembretes e notificações |
| 2.Objetivo | Calcular e agendar notificações locais no nativo |
| 3.Como funciona | Consulta plano → cálculo → agendamento expo-notifications → cancelamento por titular |
| 4.Arquivos responsáveis | app/lembretes.tsx; services/lembretes/lembretes.native.ts; services/lembretes/calculoLembretes.ts; backend/demo/src/main/java/com/vivamais/controller/CuidadoController; backend/demo/src/main/java/com/vivamais/service/CuidadoService (nomes agrupados identificam classes separadas, não um único caminho) |
| 5.Endpoints | GET /api/v1/patients/{id}/medication-events |
| 6.Tabelas | medication_plan,medication_schedule |
| 7.Fluxo | Consulta plano → cálculo → agendamento expo-notifications → cancelamento por titular; validações: Permissão SO,propriedade da agenda,privacidade tela bloqueada; web não simula entrega |
| 8.Estado atual | Implementada sem validação suficiente |
| 9.Testes existentes | care-core.test.ts (cálculo); acesso-navegacao.spec.ts (tela) |
| 10.Limitações conhecidas | Sem ensaio de SO/aparelho; agenda finita depende de reabertura P12/P13 |

## F15 — Alimentação: foto e histórico

| Campo | Implementação real |
| --- | --- |
| 1.Nome | Alimentação: foto e histórico |
| 2.Objetivo | Registrar refeições com objeto privado e consultar |
| 3.Como funciona | Upload autorizado → metadados refeição → resultado real → histórico/ficha |
| 4.Arquivos responsáveis | app/alimentacao/index.tsx; app/alimentacao/resultado.tsx; web/components/RefeicoesPaciente.tsx; hooks/useResultadoRefeicao.ts; services/alimentacao/refeicoes.ts; backend/demo/src/main/java/com/vivamais/controller/ArquivoPrivadoController; backend/demo/src/main/java/com/vivamais/service/ArquivoPrivadoService (nomes agrupados identificam classes separadas, não um único caminho) |
| 5.Endpoints | POST /api/v1/patients/{id}/meals; GET /api/v1/patients/{id}/meals; GET /api/v1/refeicoes/{idRefeicao} |
| 6.Tabelas | meal_photo,file_object |
| 7.Fluxo | Upload autorizado → metadados refeição → resultado real → histórico/ficha; validações: Titular,imagem/finalidade e referência de arquivo; sem classificação inventada |
| 8.Estado atual | Concluída e testada |
| 9.Testes existentes | CuidadoIT; mobile-care.spec.ts |
| 10.Limitações conhecidas | Foto/histórico funcionais; análise é outra funcionalidade F16 |

## F16 — Análise alimentar

| Campo | Implementação real |
| --- | --- |
| 1.Nome | Análise alimentar |
| 2.Objetivo | Chamar provedor somente com serviço/critérios aprovados |
| 3.Como funciona | Refeição autorizada → orçamento/tentativa → porta indisponível ou HTTPS autorizado → estado verdadeiro |
| 4.Arquivos responsáveis | app/alimentacao/resultado.tsx; web/components/RefeicoesPaciente.tsx; services/alimentacao/refeicoes.ts; backend/demo/src/main/java/com/vivamais/controller/ArquivoPrivadoController; backend/demo/src/main/java/com/vivamais/service/ProvedorAnaliseAlimentacaoHttp; ArquivoPrivadoService (nomes agrupados identificam classes separadas, não um único caminho) |
| 5.Endpoints | POST /api/v1/meals/{id}/analyze |
| 6.Tabelas | food_analysis_attempt,meal_photo,file_object |
| 7.Fluxo | Refeição autorizada → orçamento/tentativa → porta indisponível ou HTTPS autorizado → estado verdadeiro; validações: Não estimar sódio exato por foto; falha/baixa confiança sem sucesso fictício |
| 8.Estado atual | Bloqueada por dependência externa |
| 9.Testes existentes | CuidadoIT (indisponibilidade/falhas); sem fornecedor real |
| 10.Limitações conhecidas | Outro dev IA/nutrição,contrato/credenciais/corpus/aprovação P29 |

## F17 — Perfil e registro de atividades

| Campo | Implementação real |
| --- | --- |
| 1.Nome | Perfil e registro de atividades |
| 2.Objetivo | Ler orientação da equipe e registrar atividade voluntária |
| 3.Como funciona | Equipe mantém perfil → paciente lê informação → tipo/duração/estado → registro → ficha |
| 4.Arquivos responsáveis | app/atividade-fisica/index.tsx; app/atividade-fisica/registro.tsx; components/RoteiroAtividade.tsx; services/atividades/atividades.ts; hooks/useRoteiroAtividade.ts; backend/demo/src/main/java/com/vivamais/controller/CuidadoController; backend/demo/src/main/java/com/vivamais/service/CuidadoService (nomes agrupados identificam classes separadas, não um único caminho) |
| 5.Endpoints | GET /api/v1/patients/{id}/activity-profile; PUT /api/v1/patients/{id}/activity-profile; POST /api/v1/patients/{id}/activities |
| 6.Tabelas | physical_activity_profile,activity_record,sync_operation |
| 7.Fluxo | Equipe mantém perfil → paciente lê informação → tipo/duração/estado → registro → ficha; validações: Escrita perfil profissional; registro por titular/equipe; resposta explícita e UUID |
| 8.Estado atual | Concluída e testada |
| 9.Testes existentes | CuidadoIT; execucao-local.spec.ts; acesso-navegacao.spec.ts |
| 10.Limitações conhecidas | Perfil/autorrelato não são recomendação clínica; catálogo/vídeo em P27/P28 |

## F18 — Semana e histórico de atividade

| Campo | Implementação real |
| --- | --- |
| 1.Nome | Semana e histórico de atividade |
| 2.Objetivo | Agrupar registros em semana local e filtrar histórico |
| 3.Como funciona | Data início → limites America/Sao_Paulo → agregação PG → dias/total/marcadores |
| 4.Arquivos responsáveis | components/HistoricoAtividades.tsx; app/atividade-fisica/historico.tsx; services/atividades/periodos.ts; services/atividades/idade.ts; backend/demo/src/main/java/com/vivamais/controller/CuidadoController; backend/demo/src/main/java/com/vivamais/service/CuidadoService (nomes agrupados identificam classes separadas, não um único caminho) |
| 5.Endpoints | GET /api/v1/patients/{id}/activities; GET /api/v1/pacientes/{idPaciente}/atividades/semana |
| 6.Tabelas | activity_record |
| 7.Fluxo | Data início → limites America/Sao_Paulo → agregação PG → dias/total/marcadores; validações: Intervalos/ordem,domingo/segunda,ocorrência UTC e titular |
| 8.Estado atual | Concluída e testada |
| 9.Testes existentes | CuidadoIT; idade.test.ts; execucao-local.spec.ts |
| 10.Limitações conhecidas | Não é planejamento semanal prescritivo nem metas aprovadas |

## F19 — Recomendação/vídeo de exercícios

| Campo | Implementação real |
| --- | --- |
| 1.Nome | Recomendação/vídeo de exercícios |
| 2.Objetivo | Reservar evolução específica para outro responsável |
| 3.Como funciona | UI apresenta indisponibilidade/orientação atual; não escolhe prescrição inventada |
| 4.Arquivos responsáveis | app/atividade-fisica/video.tsx; app/atividade-fisica/ilustracoes.tsx; hooks/useRoteiroAtividade.ts; services/atividades/atividades.ts; backend/demo/src/main/java/com/vivamais/controller/CuidadoController; backend/demo/src/main/java/com/vivamais/service/CuidadoService (nomes agrupados identificam classes separadas, não um único caminho) |
| 5.Endpoints | GET /api/v1/patients/{id}/activity-profile |
| 6.Tabelas | physical_activity_profile (existente); catálogo futuro não existe |
| 7.Fluxo | UI apresenta indisponibilidade/orientação atual; não escolhe prescrição inventada; validações: BLOCKED_PENDING_CLINICAL_APPROVAL; ausência de conteúdo não vira sucesso |
| 8.Estado atual | Bloqueada por dependência externa |
| 9.Testes existentes | E2E navegação/estados; sem motor clínico validado |
| 10.Limitações conhecidas | Outro dev exercícios; protocolo,catálogo licenciado,videos/acessibilidade P27/P28 |

## F20 — Mensagens e orientações

| Campo | Implementação real |
| --- | --- |
| 1.Nome | Mensagens e orientações |
| 2.Objetivo | Mostrar informação registrada pela equipe |
| 3.Como funciona | Perfil autorizado → orientação ou estado vazio → leitura no app |
| 4.Arquivos responsáveis | app/mensagens.tsx; app/atividade-fisica/orientacoes.tsx; hooks/useDadosAtividade.ts; backend/demo/src/main/java/com/vivamais/controller/CuidadoController; backend/demo/src/main/java/com/vivamais/service/CuidadoService (nomes agrupados identificam classes separadas, não um único caminho) |
| 5.Endpoints | GET /api/v1/patients/{id}/activity-profile |
| 6.Tabelas | physical_activity_profile |
| 7.Fluxo | Perfil autorizado → orientação ou estado vazio → leitura no app; validações: Não prometer envio/entrega de mensagem inexistente |
| 8.Estado atual | Implementada parcialmente |
| 9.Testes existentes | acesso-navegacao.spec.ts; interface-responsiva.spec.ts |
| 10.Limitações conhecidas | Somente leitura de orientação; chat/envio bidirecional não existe P34 |

## F21 — Diário transcrito

| Campo | Implementação real |
| --- | --- |
| 1.Nome | Diário transcrito |
| 2.Objetivo | Equipe registrar dados com origem/autoria |
| 3.Como funciona | Formulário transcrição → DTO → ocorrência/autor/origem → listagem/resumo |
| 4.Arquivos responsáveis | web/components/CuidadoPaciente.tsx; web/components/TabelaCuidado.tsx; web/app/api/domain/[...path]/route.ts; backend/demo/src/main/java/com/vivamais/controller/CuidadoController; backend/demo/src/main/java/com/vivamais/service/CuidadoService (nomes agrupados identificam classes separadas, não um único caminho) |
| 5.Endpoints | GET /api/v1/patients/{id}/diary; POST /api/v1/patients/{id}/diary |
| 6.Tabelas | printed_diary_entry,blood_pressure_reading,medication_self_report |
| 7.Fluxo | Formulário transcrição → DTO → ocorrência/autor/origem → listagem/resumo; validações: Profissional autorizado; distinguir ocorrência/inserção; preservação original |
| 8.Estado atual | Concluída e testada |
| 9.Testes existentes | CuidadoIT; care.spec.ts; execucao-local.spec.ts |
| 10.Limitações conhecidas | Retificação auditada ainda P39; não é leitura direta do paciente/dispositivo |

## F22 — Consultas

| Campo | Implementação real |
| --- | --- |
| 1.Nome | Consultas |
| 2.Objetivo | Registrar notas,objetivos e plano individual da equipe |
| 3.Como funciona | Equipe abre paciente → ocorrência/notas/objetivos/plano → gravação → histórico/resumo |
| 4.Arquivos responsáveis | web/app/(portal)/consultas/page.tsx; web/components/CuidadoPaciente.tsx; web/app/api/domain/[...path]/route.ts; backend/demo/src/main/java/com/vivamais/controller/CuidadoController; backend/demo/src/main/java/com/vivamais/service/CuidadoService (nomes agrupados identificam classes separadas, não um único caminho) |
| 5.Endpoints | GET /api/v1/patients/{id}/consultations; POST /api/v1/patients/{id}/consultations |
| 6.Tabelas | consultation |
| 7.Fluxo | Equipe abre paciente → ocorrência/notas/objetivos/plano → gravação → histórico/resumo; validações: Escrita/leitura profissional; autor nominal; ordenar ocorrência |
| 8.Estado atual | Concluída e testada |
| 9.Testes existentes | CuidadoIT; care.spec.ts; execucao-local.spec.ts |
| 10.Limitações conhecidas | Não é agenda/teleconsulta; retificação e estrutura adicional dependem escopo P39 |

## F23 — Resumo e relatórios

| Campo | Implementação real |
| --- | --- |
| 1.Nome | Resumo e relatórios |
| 2.Objetivo | Reunir dados autorizados e totais do acompanhamento |
| 3.Como funciona | Seleciona paciente → agregações → resumo/ficha/JSON → limites descritos |
| 4.Arquivos responsáveis | web/app/(portal)/relatorios/page.tsx; web/components/VisaoGeralPaciente.tsx; web/services/resumoPaciente.ts; backend/demo/src/main/java/com/vivamais/controller/CuidadoController; backend/demo/src/main/java/com/vivamais/service/CuidadoService (nomes agrupados identificam classes separadas, não um único caminho) |
| 5.Endpoints | GET /api/v1/patients/{id}/summary; GET /api/v1/patients/{id}/export |
| 6.Tabelas | patient,blood_pressure_reading,medication_plan,medication_self_report,activity_record,meal_photo,consultation |
| 7.Fluxo | Seleciona paciente → agregações → resumo/ficha/JSON → limites descritos; validações: Escopo profissional/admin e vínculo; sem export de outra unidade |
| 8.Estado atual | Implementada parcialmente |
| 9.Testes existentes | CuidadoIT (>20 itens); care.spec.ts |
| 10.Limitações conhecidas | JSON é resumo com20 itens/coleção e totais completos; export completo/formato institucional P35 |

## F24 — Painel,busca e vínculos

| Campo | Implementação real |
| --- | --- |
| 1.Nome | Painel,busca e vínculos |
| 2.Objetivo | Organizar carteira e administrar autorização por paciente |
| 3.Como funciona | Sessão/unidade → consulta escopada/paginada → lista/ficha → admin altera vínculo → acesso muda no backend |
| 4.Arquivos responsáveis | web/app/(portal)/painel/page.tsx; web/app/(portal)/pacientes/page.tsx; web/components/VinculosPaciente.tsx; web/services/api.ts; backend/demo/src/main/java/com/vivamais/controller/InstituicaoController; CuidadoController; backend/demo/src/main/java/com/vivamais/service/CuidadoService (nomes agrupados identificam classes separadas, não um único caminho) |
| 5.Endpoints | GET /api/v1/dashboard; GET /api/v1/patients/search; GET /api/v1/professionals; GET /api/v1/patients/{id}/assignments; POST /api/v1/patients/{id}/assignments; POST /api/v1/patients/{id}/assignments/revoke |
| 6.Tabelas | patient,patient_professional_assignment,professional,organization,consultation |
| 7.Fluxo | Sessão/unidade → consulta escopada/paginada → lista/ficha → admin altera vínculo → acesso muda no backend; validações: Admin da unidade para vínculos; profissional precisaassignment; busca não enumera outra clínica |
| 8.Estado atual | Concluída e testada |
| 9.Testes existentes | InstituicaoIT; CuidadoIT; foundation.spec.ts; care.spec.ts |
| 10.Limitações conhecidas | Ciclo de vida de profissional ainda P32; filtros correspondem à API real |

## F25 — Preferências e acessibilidade visual

| Campo | Implementação real |
| --- | --- |
| 1.Nome | Preferências e acessibilidade visual |
| 2.Objetivo | Salvar fonte ampliada/tamanho de página por conta |
| 3.Como funciona | Conta da sessão → GET ou padrão → PUT versão → UI aplica → nova sessão recupera |
| 4.Arquivos responsáveis | app/configuracoes.tsx; contexts/ContextoPreferencias.tsx; web/components/PreferenciasPortal.tsx; web/app/api/domain/[...path]/route.ts; backend/demo/src/main/java/com/vivamais/controller/PreferenciasController; backend/demo/src/main/java/com/vivamais/service/JDBC no próprio controller (sem Service extra) (nomes agrupados identificam classes separadas, não um único caminho) |
| 5.Endpoints | GET /api/v1/conta/preferencias; PUT /api/v1/conta/preferencias |
| 6.Tabelas | preferencia_conta |
| 7.Fluxo | Conta da sessão → GET ou padrão → PUT versão → UI aplica → nova sessão recupera; validações: Sem user_id no corpo; versão409;tamanho permitido; isolamento da conta |
| 8.Estado atual | Concluída e testada |
| 9.Testes existentes | CuidadoIT; preferencias.spec.ts; PreferenciasPortal.test.tsx |
| 10.Limitações conhecidas | Aceite browser; leitores/usuários representativos e nativo P10 |

## F26 — Offline e sincronização

| Campo | Implementação real |
| --- | --- |
| 1.Nome | Offline e sincronização |
| 2.Objetivo | Enfileirar operação sem duplicar efeito/titular |
| 3.Como funciona | Gerar UUID → guardar pendente → retry/backoff → autorização API → uma gravação → remover após ACK |
| 4.Arquivos responsáveis | components/TelaCuidado.tsx; services/sincronizacao/filaRegistros.ts; services/sincronizacao/regrasSincronizacao.ts; services/sincronizacao/armazenamentoFila.native.ts; backend/demo/src/main/java/com/vivamais/controller/CuidadoController; backend/demo/src/main/java/com/vivamais/service/CuidadoService (nomes agrupados identificam classes separadas, não um único caminho) |
| 5.Endpoints | POST /api/v1/patients/{id}/readings; POST /api/v1/patients/{id}/activities |
| 6.Tabelas | sync_operation,blood_pressure_reading,activity_record |
| 7.Fluxo | Gerar UUID → guardar pendente → retry/backoff → autorização API → uma gravação → remover após ACK; validações: Não reenviar comnovoUUID;filtrar dono;401/409/429/definitivo tratados;nenhum fallback sem cifra |
| 8.Estado atual | Implementada parcialmente |
| 9.Testes existentes | care-core.test.ts; mobile-care.spec.ts |
| 10.Limitações conhecidas | Web memória; SQLCipher/cache e queda física ainda P14/P15/P16 |

## F27 — Navegação,responsividade e identidade

| Campo | Implementação real |
| --- | --- |
| 1.Nome | Navegação,responsividade e identidade |
| 2.Objetivo | Compartilhar layout/barra e logo original sem obstruir ações |
| 3.Como funciona | Tela separa ScrollView/rodapé → últimos botões visíveis → classes/CSP e logo original → menu responsivo |
| 4.Arquivos responsáveis | components/ElementosInterface.tsx; components/BarraNavegacao.tsx; web/components/Icones.tsx; web/app/globals.css; services/ambiente.ts; Sem endpoint próprio; Sem Service próprio (nomes agrupados identificam classes separadas, não um único caminho) |
| 5.Endpoints | Sem endpoint próprio |
| 6.Tabelas | Nenhuma tabela própria |
| 7.Fluxo | Tela separa ScrollView/rodapé → últimos botões visíveis → classes/CSP e logo original → menu responsivo; validações: Sem rolagem horizontal;safearea estrutural; sem recriar logo;diferenças dos protótipos registradas |
| 8.Estado atual | Implementada parcialmente |
| 9.Testes existentes | interface-responsiva.spec.ts; preferencias.spec.ts |
| 10.Limitações conhecidas | Larguras de browser aprovadas; fidelidade36 referências e acessibilidade física P10/P31 |

## F28 — Pulseira

| Campo | Implementação real |
| --- | --- |
| 1.Nome | Pulseira |
| 2.Objetivo | Persistir configuração sem alegar comunicação inexistente |
| 3.Como funciona | Profissional registra dispositivo/configuração → adaptador explícito → estado persistido |
| 4.Arquivos responsáveis | web/components/CuidadoPaciente.tsx; web/app/api/domain/[...path]/route.ts; backend/demo/src/main/java/com/vivamais/controller/CuidadoController; backend/demo/src/main/java/com/vivamais/service/AdaptadorPulseira; CuidadoService (nomes agrupados identificam classes separadas, não um único caminho) |
| 5.Endpoints | GET /api/v1/patients/{id}/device; POST /api/v1/patients/{id}/device; POST /api/v1/patients/{id}/device/configurations |
| 6.Tabelas | device,device_configuration |
| 7.Fluxo | Profissional registra dispositivo/configuração → adaptador explícito → estado persistido; validações: Não afirmar sincronização real/medição/ingestão;204 sem dispositivo |
| 8.Estado atual | Bloqueada por dependência externa |
| 9.Testes existentes | CuidadoIT; execucao-local.spec.ts (simulação/indisponibilidade) |
| 10.Limitações conhecidas | Sem BLE/protocolo/fabricante/ensaio físico P26 |

## F29 — Auditoria e base legal

| Campo | Implementação real |
| --- | --- |
| 1.Nome | Auditoria e base legal |
| 2.Objetivo | Rastrear ação mínima e preservar trilha |
| 3.Como funciona | Negócio autorizado → INSERT auditável sem corpo clínico → trigger recusa mutação |
| 4.Arquivos responsáveis | backend/demo/src/main/java/com/vivamais/repositories/InstituicaoRepository.java; Chamadas dos Services autorizados; backend/demo/src/main/java/com/vivamais/controller/InstituicaoController; CuidadoController; backend/demo/src/main/java/com/vivamais/service/InstituicaoRepository.auditar (nomes agrupados identificam classes separadas, não um único caminho) |
| 5.Endpoints | Sem endpoint administrativo geral de consulta da trilha |
| 6.Tabelas | audit_event,consent_or_legal_basis_record |
| 7.Fluxo | Negócio autorizado → INSERT auditável sem corpo clínico → trigger recusa mutação; validações: Escopo por unidade; nunca anexar segredo/OTP/foto; base legal exige definição |
| 8.Estado atual | Implementada parcialmente |
| 9.Testes existentes | InstituicaoIT; CuidadoIT; migrações |
| 10.Limitações conhecidas | Consulta/retenção e fluxo base legal institucionais P22/P23 |

## F30 — Privacidade,suporte e exclusão

| Campo | Implementação real |
| --- | --- |
| 1.Nome | Privacidade,suporte e exclusão |
| 2.Objetivo | Exibir informação honesta e encaminhar definição institucional |
| 3.Como funciona | Página pública → informação de revisão; não registra/enviapedido |
| 4.Arquivos responsáveis | web/app/privacidade/page.tsx; web/app/suporte/page.tsx; web/app/exclusao-de-conta/page.tsx; web/components/DocumentoPublico.tsx; Sem endpoint de solicitação implementado; Sem Service de solicitação (nomes agrupados identificam classes separadas, não um único caminho) |
| 5.Endpoints | Sem endpoint de envio de solicitação |
| 6.Tabelas | Nenhuma tabela de pedido implementada |
| 7.Fluxo | Página pública → informação de revisão; não registra/enviapedido; validações: Não alegar política aprovada ou formulário enviado; não apagar dado clínico sem regra |
| 8.Estado atual | Pendente |
| 9.Testes existentes | Testes de rotas públicas; não atendimento real |
| 10.Limitações conhecidas | Políticas/canal oficial/protocolo/exclusão conforme retenção P23/P24/P25 |

## F31 — Backup,infra e publicação de app

| Campo | Implementação real |
| --- | --- |
| 1.Nome | Backup,infra e publicação de app |
| 2.Objetivo | Preservar conjunto de dados e preparar implantação econômica |
| 3.Como funciona | Dump+objetos+chaves → envelope cifrado → banco isolado → revogação → login/foto/escopo |
| 4.Arquivos responsáveis | infra/ensaiar-backup-local.ps1; infra/cifrar-backup.mjs; docs/operations/HOSPEDAGEM_DEMO.md; infra/verificar-restauracao.mjs; backend/demo/src/main/java/com/vivamais/controller/Actuator e API isolada de restore; backend/demo/src/main/java/com/vivamais/service/ArmazenamentoArquivos (nomes agrupados identificam classes separadas, não um único caminho) |
| 5.Endpoints | GET /actuator/health; rotas autorizadas de verificação |
| 6.Tabelas | Todas as tabelas + objetos/chaves privados |
| 7.Fluxo | Dump+objetos+chaves → envelope cifrado → banco isolado → revogação → login/foto/escopo; validações: RPO/RTO/retencão pendentes; nunca publicar backup/chaves; não desabilitar APP_ENV production |
| 8.Estado atual | Implementada parcialmente |
| 9.Testes existentes | Restore V8 anterior; preservação V9 anterior; builds/testes locais atuais |
| 10.Limitações conhecidas | Sem deploy/HTTPS/lojas/monitoramento/restore hospedado/ensaio físico P17–P21 |

## F32 — Consulta oficial de CPF

| Campo | Implementação real |
| --- | --- |
| 1.Nome | Consulta oficial de CPF |
| 2.Objetivo | Distinguir validação de dígitos de comprovação externa |
| 3.Como funciona | UI/APIvalidam estrutura → eventual serviço futuro só após decisão → não marcar identidade confirmada |
| 4.Arquivos responsáveis | packages/contracts/src/cadastro.ts; docs/CONSULTA_OFICIAL_CPF.md; Validação estrutural atual,sem chamada externa; backend/demo/src/main/java/com/vivamais/controller/DadosPessoaisController; CuidadoController; backend/demo/src/main/java/com/vivamais/service/DadosPessoaisService (nomes agrupados identificam classes separadas, não um único caminho) |
| 5.Endpoints | Sem endpoint de consulta oficial implementado |
| 6.Tabelas | patient |
| 7.Fluxo | UI/APIvalidam estrutura → eventual serviço futuro só após decisão → não marcar identidade confirmada; validações: Não enviar CPF real a consulta nesta demonstração;minimização e finalidade aprovadas |
| 8.Estado atual | Bloqueada por dependência externa |
| 9.Testes existentes | ValidacaoCadastroTest apenas estrutura; pesquisa oficial documentada |
| 10.Limitações conhecidas | Serpro/Conecta exigem habilitação/contrato; sem scraping/P04 |

## Localização exata das classes e testes

Para evitar interpretar nomes agrupados acima como caminho literal, as classes estão listadas no [catálogo](CATALOGO_API_E_ROTAS.md), com links para arquivos. Em F25 a persistência fica no controller; em F29 no repository; não há camada Service/Repository fictícia. Os caminhos de UI/cliente são relativos à raiz. Fronteiras futuras são propostas no plano, não código concluído.
