# Catálogo de API, rotas e arquivos

## Contrato de 04/11/2026

OpenAPI recuperado do teste real PostgreSQL aprovado:54caminhos; contratos TypeScript regenerados. Novos: GET /patients/{id}/medication-agenda, GET/POST /patients/{paciente}/test-invites, POST /patients/{paciente}/test-invites/{convite}/revoke, POST /auth/testadores/convite e /auth/testadores/renovar (prefixo /api/v1). Cadastro passa a devolver estado de acesso; medicamento aceita dosagem opcional. Vínculo, papéis, CSRF/HTTPS e hashes de convites preservam o escopo sintético. [Contratos/comportamento](MEDICAMENTOS_E_CONVITES.md).


Snapshot autenticado atualizado em03/11/2026: **63operações em49paths e41schemas**. Métodos/tipos em [openapi.json](../backend/demo/openapi.json); contratos TypeScript regenerados. Inclui demonstração, consultas do paciente, exportação por categoria e versões de retificação. Preserva nomes legados de contratos para compatibilidade. O utilitário local GET /demonstracao/vivamais.apk fica fora do contrato de domínio: exige conector sintético/IP do celular e arquivo explícito, sem disponibilidade produtiva. Actuator também não faz parte deste snapshot. Status documentados não esgotam erros contextuais.

## Operações backend

| Método | Rota | operationId | Tag/controller | Respostas documentadas |
| --- | --- | --- | --- | --- |
| GET | `/api/v1/patients/{id}/activity-profile` | perfilAtividade | cuidado-controller | 200,204,401,403,500 |
| PUT | `/api/v1/patients/{id}/activity-profile` | perfilAtividade_1 | cuidado-controller | 200,401,403,500 |
| GET | `/api/v1/pacientes/{idPaciente}/dados-pessoais` | buscar | dados-pessoais-controller | 200,401,403,500 |
| PUT | `/api/v1/pacientes/{idPaciente}/dados-pessoais` | atualizar | dados-pessoais-controller | 200,401,403,500 |
| PUT | `/api/v1/pacientes/{idPaciente}/contato` | atualizarContato | dados-pessoais-controller | 200,401,403,500 |
| PUT | `/api/v1/medications/{plan}` | updateMedication | cuidado-controller | 200,401,403,500 |
| GET | `/api/v1/conta/preferencias` | buscar_1 | preferencias-controller | 200,401,403,500 |
| PUT | `/api/v1/conta/preferencias` | salvar | preferencias-controller | 200,401,403,500 |
| GET | `/api/v1/patients` | pacientes | instituicao-controller | 200,401,403,500 |
| POST | `/api/v1/patients` | create | cuidado-controller | 200,401,403,500 |
| GET | `/api/v1/patients/{id}/readings` | listarRegistrosPressao | cuidado-controller | 200,401,403,500 |
| POST | `/api/v1/patients/{id}/readings` | salvarRegistroPressao | cuidado-controller | 200,401,403,500 |
| GET | `/api/v1/patients/{id}/medications` | listarMedicamentos | cuidado-controller | 200,401,403,500 |
| POST | `/api/v1/patients/{id}/medications` | salvarMedicamento | cuidado-controller | 200,401,403,500 |
| POST | `/api/v1/patients/{id}/medication-reports` | registrarAutorrelato | cuidado-controller | 200,401,403,500 |
| GET | `/api/v1/patients/{id}/meals` | listarRefeicoes | arquivo-privado-controller | 200,401,403,500 |
| POST | `/api/v1/patients/{id}/meals` | registrarRefeicao | arquivo-privado-controller | 200,401,403,500 |
| POST | `/api/v1/patients/{id}/files` | upload | arquivo-privado-controller | 200,401,403,500 |
| GET | `/api/v1/patients/{id}/diary` | diario | cuidado-controller | 200,401,403,500 |
| POST | `/api/v1/patients/{id}/diary` | diario_1 | cuidado-controller | 200,401,403,500 |
| GET | `/api/v1/patients/{id}/device` | pulseira | cuidado-controller | 200,204,401,403,500 |
| POST | `/api/v1/patients/{id}/device` | pulseira_1 | cuidado-controller | 200,401,403,500 |
| GET | `/api/v1/patients/{id}/device/configurations` | listarConfiguracoes | cuidado-controller | 200,401,403,500 |
| POST | `/api/v1/patients/{id}/device/configurations` | configurar | cuidado-controller | 200,401,403,500 |
| GET | `/api/v1/patients/{id}/consultations` | consultations | cuidado-controller | 200,401,403,500 |
| POST | `/api/v1/patients/{id}/consultations` | registrarConsulta | cuidado-controller | 200,401,403,500 |
| GET | `/api/v1/patients/{id}/assignments` | listarVinculos | cuidado-controller | 200,401,403,500 |
| POST | `/api/v1/patients/{id}/assignments` | autorizarVinculo | cuidado-controller | 200,401,403,500 |
| POST | `/api/v1/patients/{id}/assignments/revoke` | revogarVinculo | cuidado-controller | 200,401,403,500 |
| GET | `/api/v1/patients/{id}/activities` | activities | cuidado-controller | 200,401,403,500 |
| POST | `/api/v1/patients/{id}/activities` | registrarAtividade | cuidado-controller | 200,401,403,500 |
| POST | `/api/v1/patients/{id}/access-reset` | reset | cuidado-controller | 200,401,403,500 |
| GET | `/api/v1/pacientes/{idPaciente}/registros/{tipo}/{idRegistro}/retificacoes` | listar | retificacao-registro-controller | 200,401,403,500 |
| POST | `/api/v1/pacientes/{idPaciente}/registros/{tipo}/{idRegistro}/retificacoes` | salvar_1 | retificacao-registro-controller | 200,401,403,500 |
| POST | `/api/v1/meals/{id}/analyze` | analisarAlimentacao | arquivo-privado-controller | 200,401,403,500 |
| POST | `/api/v1/files/{id}/ocr` | ocr | arquivo-privado-controller | 200,401,403,500 |
| POST | `/api/v1/files/{id}/link` | link | arquivo-privado-controller | 200,401,403,500 |
| POST | `/api/v1/auth/paciente/verificar` | verificar | acesso-paciente-controller | 200,400,401,403,413,429,500 |
| POST | `/api/v1/auth/paciente/renovar` | renovar | acesso-paciente-controller | 200,400,401,403,413,429,500 |
| POST | `/api/v1/auth/paciente/iniciar` | iniciar | acesso-paciente-controller | 200,400,401,403,413,429,500 |
| POST | `/api/v1/auth/paciente/esquecer` | esquecer | acesso-paciente-controller | 204,400,401,403,413,429,500 |
| POST | `/api/v1/auth/paciente/demonstracao` | demonstracao | acesso-paciente-controller | 200,400,401,403,413,429,500 |
| POST | `/api/v1/auth/logout` | sair | instituicao-controller | 204,401,403,500 |
| POST | `/api/v1/auth/login` | entrar | instituicao-controller | 200,400,401,413,429,500 |
| GET | `/api/v1/system/modules` | listarModulos | instituicao-controller | 200,401,403,500 |
| GET | `/api/v1/refeicoes/{idRefeicao}` | buscarRefeicao | arquivo-privado-controller | 200,401,403,500 |
| GET | `/api/v1/professionals` | listarProfissionais | cuidado-controller | 200,401,403,500 |
| GET | `/api/v1/patients/{id}` | paciente | instituicao-controller | 200,401,403,500 |
| GET | `/api/v1/patients/{id}/summary` | resumirConsulta | cuidado-controller | 200,401,403,500 |
| GET | `/api/v1/patients/{id}/medication-events` | events | cuidado-controller | 200,401,403,500 |
| GET | `/api/v1/patients/{id}/export` | exportarResumo | cuidado-controller | 200,401,403,500 |
| GET | `/api/v1/patients/{id}/access-status` | estadoAcesso | cuidado-controller | 200,401,403,500 |
| GET | `/api/v1/patients/search` | search | cuidado-controller | 200,401,403,500 |
| GET | `/api/v1/patients/me` | ownPatient | instituicao-controller | 200,401,403,500 |
| GET | `/api/v1/pacientes/{idPaciente}/registros-pressao/{idRegistro}` | buscarRegistroPressao | cuidado-controller | 200,401,403,500 |
| GET | `/api/v1/pacientes/{idPaciente}/exportacao/{categoria}` | exportar | exportacao-paciente-controller | 200,401,403,500 |
| GET | `/api/v1/pacientes/{idPaciente}/atividades/semana` | semanaAtividades | cuidado-controller | 200,401,403,500 |
| GET | `/api/v1/pacientes/me/consultas` | listar_1 | consultas-paciente-controller | 200,401,403,500 |
| GET | `/api/v1/organization` | buscarUnidade | instituicao-controller | 200,401,403,500 |
| GET | `/api/v1/medications/{plan}/history` | history | cuidado-controller | 200,401,403,500 |
| GET | `/api/v1/files/{id}/content` | content | arquivo-privado-controller | 200,401,403,500 |
| GET | `/api/v1/dashboard` | consultarPainel | instituicao-controller | 200,401,403,500 |
| GET | `/api/v1/auth/me` | me | instituicao-controller | 200,401,403,500 |

## Rotas Expo

Nova rota /consultas em app/consultas.tsx: orientações compartilhadas/paginação/cache. As demais entradas são preservadas abaixo.

Aliases e telas de etapa não são módulos distintos. Arquivos _layout.tsx fornecem escopo/navegação.

| Arquivo real |
| --- |
| [app/+not-found.tsx](../app/+not-found.tsx) |
| [app/acesso.tsx](../app/acesso.tsx) |
| [app/activate.tsx](../app/activate.tsx) |
| [app/alimentacao/index.tsx](../app/alimentacao/index.tsx) |
| [app/alimentacao/resultado.tsx](../app/alimentacao/resultado.tsx) |
| [app/ativar-conta.tsx](../app/ativar-conta.tsx) |
| [app/atividade-fisica/alternativa.tsx](../app/atividade-fisica/alternativa.tsx) |
| [app/atividade-fisica/atividade-hoje.tsx](../app/atividade-fisica/atividade-hoje.tsx) |
| [app/atividade-fisica/como-esta-hoje.tsx](../app/atividade-fisica/como-esta-hoje.tsx) |
| [app/atividade-fisica/historico.tsx](../app/atividade-fisica/historico.tsx) |
| [app/atividade-fisica/ilustracoes.tsx](../app/atividade-fisica/ilustracoes.tsx) |
| [app/atividade-fisica/index.tsx](../app/atividade-fisica/index.tsx) |
| [app/atividade-fisica/orientacoes.tsx](../app/atividade-fisica/orientacoes.tsx) |
| [app/atividade-fisica/passo-a-passo.tsx](../app/atividade-fisica/passo-a-passo.tsx) |
| [app/atividade-fisica/registro.tsx](../app/atividade-fisica/registro.tsx) |
| [app/atividade-fisica/suas-informacoes.tsx](../app/atividade-fisica/suas-informacoes.tsx) |
| [app/atividade-fisica/verificacao-pressao.tsx](../app/atividade-fisica/verificacao-pressao.tsx) |
| [app/atividade-fisica/video.tsx](../app/atividade-fisica/video.tsx) |
| [app/cadastro.tsx](../app/cadastro.tsx) |
| [app/configuracoes.tsx](../app/configuracoes.tsx) |
| [app/historico/index.tsx](../app/historico/index.tsx) |
| [app/history.tsx](../app/history.tsx) |
| [app/home.tsx](../app/home.tsx) |
| [app/index.tsx](../app/index.tsx) |
| [app/inicio.tsx](../app/inicio.tsx) |
| [app/lembretes.tsx](../app/lembretes.tsx) |
| [app/login.tsx](../app/login.tsx) |
| [app/medicamentos/index.tsx](../app/medicamentos/index.tsx) |
| [app/mensagens.tsx](../app/mensagens.tsx) |
| [app/module/[key].tsx](../app/module/[key].tsx) |
| [app/perfil.tsx](../app/perfil.tsx) |
| [app/pressao/digitar.tsx](../app/pressao/digitar.tsx) |
| [app/pressao/foto.tsx](../app/pressao/foto.tsx) |
| [app/pressao/historico.tsx](../app/pressao/historico.tsx) |
| [app/pressao/index.tsx](../app/pressao/index.tsx) |
| [app/pressao/resultado.tsx](../app/pressao/resultado.tsx) |
| [app/profile.tsx](../app/profile.tsx) |

## Páginas Next

O grupo (portal) não faz parte da URL pública.

| Arquivo real |
| --- |
| [web/app/(portal)/configuracoes/page.tsx](../web/app/%28portal%29/configuracoes/page.tsx) |
| [web/app/(portal)/consultas/page.tsx](../web/app/%28portal%29/consultas/page.tsx) |
| [web/app/(portal)/pacientes/[id]/page.tsx](../web/app/%28portal%29/pacientes/[id]/page.tsx) |
| [web/app/(portal)/pacientes/novo/page.tsx](../web/app/%28portal%29/pacientes/novo/page.tsx) |
| [web/app/(portal)/pacientes/page.tsx](../web/app/%28portal%29/pacientes/page.tsx) |
| [web/app/(portal)/painel/page.tsx](../web/app/%28portal%29/painel/page.tsx) |
| [web/app/(portal)/relatorios/page.tsx](../web/app/%28portal%29/relatorios/page.tsx) |
| [web/app/exclusao-de-conta/page.tsx](../web/app/exclusao-de-conta/page.tsx) |
| [web/app/page.tsx](../web/app/page.tsx) |
| [web/app/privacidade/page.tsx](../web/app/privacidade/page.tsx) |
| [web/app/suporte/page.tsx](../web/app/suporte/page.tsx) |

## Classes e testes


### controller

- [controller/AcessoPacienteController.java](../backend/demo/src/main/java/com/vivamais/controller/AcessoPacienteController.java)
- [controller/ArquivoPrivadoController.java](../backend/demo/src/main/java/com/vivamais/controller/ArquivoPrivadoController.java)
- [controller/CuidadoController.java](../backend/demo/src/main/java/com/vivamais/controller/CuidadoController.java)
- [controller/DadosPessoaisController.java](../backend/demo/src/main/java/com/vivamais/controller/DadosPessoaisController.java)
- [controller/InstituicaoController.java](../backend/demo/src/main/java/com/vivamais/controller/InstituicaoController.java)
- [controller/PreferenciasController.java](../backend/demo/src/main/java/com/vivamais/controller/PreferenciasController.java)

### service

- [service/AcessoPacienteService.java](../backend/demo/src/main/java/com/vivamais/service/AcessoPacienteService.java)
- [service/AdaptadorPulseira.java](../backend/demo/src/main/java/com/vivamais/service/AdaptadorPulseira.java)
- [service/ArmazenamentoArquivos.java](../backend/demo/src/main/java/com/vivamais/service/ArmazenamentoArquivos.java)
- [service/ArquivoPrivadoService.java](../backend/demo/src/main/java/com/vivamais/service/ArquivoPrivadoService.java)
- [service/AutenticacaoService.java](../backend/demo/src/main/java/com/vivamais/service/AutenticacaoService.java)
- [service/CuidadoService.java](../backend/demo/src/main/java/com/vivamais/service/CuidadoService.java)
- [service/DadosPessoaisService.java](../backend/demo/src/main/java/com/vivamais/service/DadosPessoaisService.java)
- [service/ProvedorAnaliseAlimentacao.java](../backend/demo/src/main/java/com/vivamais/service/ProvedorAnaliseAlimentacao.java)
- [service/ProvedorAnaliseAlimentacaoHttp.java](../backend/demo/src/main/java/com/vivamais/service/ProvedorAnaliseAlimentacaoHttp.java)
- [service/ProvedorOcr.java](../backend/demo/src/main/java/com/vivamais/service/ProvedorOcr.java)
- [service/ReconhecedorTesseract.java](../backend/demo/src/main/java/com/vivamais/service/ReconhecedorTesseract.java)
- [service/sms/EnvioSmsTwilio.java](../backend/demo/src/main/java/com/vivamais/service/sms/EnvioSmsTwilio.java)
- [service/sms/ServicoEnvioSms.java](../backend/demo/src/main/java/com/vivamais/service/sms/ServicoEnvioSms.java)
- [service/sms/SmsLocalDesenvolvimento.java](../backend/demo/src/main/java/com/vivamais/service/sms/SmsLocalDesenvolvimento.java)

### repositories

- [repositories/InstituicaoRepository.java](../backend/demo/src/main/java/com/vivamais/repositories/InstituicaoRepository.java)

### security

- [security/CodificadorToken.java](../backend/demo/src/main/java/com/vivamais/security/CodificadorToken.java)
- [security/FiltroLimiteRequisicao.java](../backend/demo/src/main/java/com/vivamais/security/FiltroLimiteRequisicao.java)
- [security/FiltroTokenAcesso.java](../backend/demo/src/main/java/com/vivamais/security/FiltroTokenAcesso.java)
- [security/LimitadorTentativasAcesso.java](../backend/demo/src/main/java/com/vivamais/security/LimitadorTentativasAcesso.java)
- [security/ProtecaoAcessoPaciente.java](../backend/demo/src/main/java/com/vivamais/security/ProtecaoAcessoPaciente.java)

### config

- [config/ConfiguracaoAmbiente.java](../backend/demo/src/main/java/com/vivamais/config/ConfiguracaoAmbiente.java)
- [config/ConfiguracaoOpenApi.java](../backend/demo/src/main/java/com/vivamais/config/ConfiguracaoOpenApi.java)
- [config/ConfiguracaoSeguranca.java](../backend/demo/src/main/java/com/vivamais/config/ConfiguracaoSeguranca.java)
- [config/ConfiguracaoSms.java](../backend/demo/src/main/java/com/vivamais/config/ConfiguracaoSms.java)
- [config/DadosDemonstracao.java](../backend/demo/src/main/java/com/vivamais/config/DadosDemonstracao.java)
- [config/PropriedadesAplicacao.java](../backend/demo/src/main/java/com/vivamais/config/PropriedadesAplicacao.java)
- [config/TratadorExcecoesApi.java](../backend/demo/src/main/java/com/vivamais/config/TratadorExcecoesApi.java)

### dto

- [dto/ModelosAcessoPaciente.java](../backend/demo/src/main/java/com/vivamais/dto/ModelosAcessoPaciente.java)
- [dto/ModelosApi.java](../backend/demo/src/main/java/com/vivamais/dto/ModelosApi.java)
- [dto/ModelosCuidado.java](../backend/demo/src/main/java/com/vivamais/dto/ModelosCuidado.java)

### model

- [model/ModalidadeAcompanhamento.java](../backend/demo/src/main/java/com/vivamais/model/ModalidadeAcompanhamento.java)

### Suítes

- [backend/demo/src/test/java/com/vivamais/AcessoPacienteIT.java](../backend/demo/src/test/java/com/vivamais/AcessoPacienteIT.java)
- [backend/demo/src/test/java/com/vivamais/ApoioAcessoPaciente.java](../backend/demo/src/test/java/com/vivamais/ApoioAcessoPaciente.java)
- [backend/demo/src/test/java/com/vivamais/CadastroSmsIT.java](../backend/demo/src/test/java/com/vivamais/CadastroSmsIT.java)
- [backend/demo/src/test/java/com/vivamais/ConfiguracaoAmbienteTest.java](../backend/demo/src/test/java/com/vivamais/ConfiguracaoAmbienteTest.java)
- [backend/demo/src/test/java/com/vivamais/ConfiguracaoSmsTest.java](../backend/demo/src/test/java/com/vivamais/ConfiguracaoSmsTest.java)
- [backend/demo/src/test/java/com/vivamais/CuidadoIT.java](../backend/demo/src/test/java/com/vivamais/CuidadoIT.java)
- [backend/demo/src/test/java/com/vivamais/InstituicaoIT.java](../backend/demo/src/test/java/com/vivamais/InstituicaoIT.java)
- [backend/demo/src/test/java/com/vivamais/ValidacaoCadastroTest.java](../backend/demo/src/test/java/com/vivamais/ValidacaoCadastroTest.java)
- [backend/demo/src/test/java/com/vivamais/security/CodificadorTokenTest.java](../backend/demo/src/test/java/com/vivamais/security/CodificadorTokenTest.java)
- [backend/demo/src/test/java/com/vivamais/security/LimitadorTentativasAcessoTest.java](../backend/demo/src/test/java/com/vivamais/security/LimitadorTentativasAcessoTest.java)
- [backend/demo/src/test/java/com/vivamais/service/sms/EnvioSmsTwilioTest.java](../backend/demo/src/test/java/com/vivamais/service/sms/EnvioSmsTwilioTest.java)
- [tests/e2e/acesso-navegacao.spec.ts](../tests/e2e/acesso-navegacao.spec.ts)
- [tests/e2e/acesso-paciente.spec.ts](../tests/e2e/acesso-paciente.spec.ts)
- [tests/e2e/cadastro-sms.spec.ts](../tests/e2e/cadastro-sms.spec.ts)
- [tests/e2e/care.spec.ts](../tests/e2e/care.spec.ts)
- [tests/e2e/execucao-local.spec.ts](../tests/e2e/execucao-local.spec.ts)
- [tests/e2e/foundation.spec.ts](../tests/e2e/foundation.spec.ts)
- [tests/e2e/interface-responsiva.spec.ts](../tests/e2e/interface-responsiva.spec.ts)
- [tests/e2e/mobile-care.spec.ts](../tests/e2e/mobile-care.spec.ts)
- [tests/e2e/mobile-web.spec.ts](../tests/e2e/mobile-web.spec.ts)
- [tests/e2e/portugues-pressao.spec.ts](../tests/e2e/portugues-pressao.spec.ts)
- [tests/e2e/preferencias.spec.ts](../tests/e2e/preferencias.spec.ts)
- [tests/mobile/acesso-paciente.test.ts](../tests/mobile/acesso-paciente.test.ts)
- [tests/mobile/ambiente.test.ts](../tests/mobile/ambiente.test.ts)
- [tests/mobile/api-core.test.ts](../tests/mobile/api-core.test.ts)
- [tests/mobile/app-config.test.ts](../tests/mobile/app-config.test.ts)
- [tests/mobile/cadastro.test.ts](../tests/mobile/cadastro.test.ts)
- [tests/mobile/care-core.test.ts](../tests/mobile/care-core.test.ts)
- [tests/mobile/dispositivo-paciente.test.ts](../tests/mobile/dispositivo-paciente.test.ts)
- [tests/mobile/idade.test.ts](../tests/mobile/idade.test.ts)
- [web/app/api/logout/route.test.ts](../web/app/api/logout/route.test.ts)
- [web/app/api/session/route.test.ts](../web/app/api/session/route.test.ts)
- [web/components/AtivacaoPaciente.test.tsx](../web/components/AtivacaoPaciente.test.tsx)
- [web/components/FormularioAcesso.test.tsx](../web/components/FormularioAcesso.test.tsx)
- [web/components/PreferenciasPortal.test.tsx](../web/components/PreferenciasPortal.test.tsx)
- [web/services/periodosCuidados.test.ts](../web/services/periodosCuidados.test.ts)
- [web/services/validacoes.test.ts](../web/services/validacoes.test.ts)
