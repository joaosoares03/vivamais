# Acesso do paciente sem senha

**Homologação04/11:** paciente remoto usa convite privado individual, não CPF/nascimento nem SMS. Fluxo seguro local anterior preservado. [Guia/testes de nuvem](GUIA_TESTES_NUVEM.md) · [Resultados reais](evidencias/nuvem-2026-11-04/README.md).

## Modos novos em 04/11/2026

O fluxo seguro descrito abaixo permanece. A exceção local sintética recebe DEMONSTRACAO_HABILITADA no servidor e usa somente CPF/nascimento, sem SMS. Em homologação sintética, TESTE_POR_CONVITE oferece segredo forte individual, uso único, renovação protegida e revogação; não é login público por dados pessoais nem acesso a dados reais. Produção continua bloqueada. [Implementação e testes](MEDICAMENTOS_E_CONVITES.md) · [Distribuição segura do grupo](PLANO_DISTRIBUICAO_INTERNA_VIVAMAIS.md).


**Atualização V9/SMS:** ler primeiro [cadastro e ativação por SMS](CADASTRO_E_ATIVACAO_SMS.md). Celular obrigatório em novos cadastros; portal/API não devolvem código. A caixa LOCAL é cifrada e identificada, sem SMS real. Profissionais mantêm seu login.

Alteração de 20/10/2026. Estado dos ensaios e capturas em [relatório](evidencias/ACESSO_PACIENTE_2026-10-20.md). A migração é aditiva; nenhum prontuário é apagado. O paciente não cria senha. Profissionais e administradores continuam no portal com o método existente.

## Testar localmente

Um exemplo de cadastro fictício está no arquivo privado `../../work/exemplo-cadastro-acesso.json`, caminho relativo à raiz do projeto. Ele não é uma conta já criada: use-o somente no cadastro local de demonstração. Não copie seus campos para documentação versionada ou capturas.

1. Iniciar `Iniciar-VivaMais.cmd -Producao -SmsLocal` na raiz, após os builds desta entrega. O guia Windows explica `-Recompilar`. Abrir portal em http://127.0.0.1:3000 e app em http://127.0.0.1:8081/acesso. O modo otimizado local não libera produção.
2. Entrar como profissional com a credencial sintética privada já configurada. Não utilizar a senha antiga de paciente. Cadastrar uma pessoa fictícia na modalidade Aplicativo, com CPF sintético estruturalmente válido, nascimento e celular fictícios válidos. O e-mail é contato opcional.
3. Em **Ativar ou recuperar acesso**, conferir pessoalmente a identidade, marcar a confirmação e informar a própria senha profissional. Selecionar **Solicitar código por SMS**. Em LOCAL, consultar a referência na caixa cifrada pelo utilitário descrito no guia SMS; nunca há código exibido no portal. Há bloqueio de reemissão por um minuto; até três emissões/hora e dez/dia por paciente.
4. No app, informar CPF e nascimento em DD/MM/AAAA. Selecionar **ENTRAR**. Se o aparelho não estiver autorizado, a tela **Ativar minha conta** solicita somente o código de quatro números. Selecionar **ATIVAR CONTA**; a confirmação permite abrir o início.
5. Navegar por pressão, medicamentos, alimentação, histórico, perfil e consultas disponíveis. Atualizar a página no mesmo navegador deve recuperar a sessão autorizada, sem nova senha/código. Preferências continuam no PostgreSQL.
6. Usar **Sair da minha conta**: a renovação automática é desabilitada. No mesmo aparelho, CPF+nascimento e ENTRAR abrem a Home sem outro código. Em navegador/perfil/aparelho novo, a verificação é obrigatória novamente.
7. Em Configurações, **Desautorizar este aparelho → Confirmar desautorização** revoga o acesso. Na recuperação, o profissional emite outro código após nova conferência; os aparelhos anteriores são revogados. O SMS usa provedor configurado/autorizado ou caixa LOCAL explicitamente identificada. Não há solicitação pública que permita emitir códigos sem a equipe.

Não publicar credenciais, CPF, nascimento, código ativo ou capturas dos campos preenchidos. Os testes geram identificadores sintéticos em tempo de execução. Se precisar gerar um CPF de teste, o helper `tests/e2e/apoio-acesso-paciente.ts` usa CSPRNG e calcula dígitos; isso serve ao ensaio sintético, não comprova identidade de ninguém.

## Transição de contas existentes

V8 invalida os códigos longos da tabela antiga e revoga somente sessões antigas de pacientes. Usuários, hashes de senha, nomes, vínculos e registros clínicos permanecem. A senha legada de paciente passa a ser recusada por `/auth/login`; não há fallback que dispense o aparelho. Sessões/senhas profissionais permanecem.

O responsável autorizado completa CPF/nascimento ausentes em **Editar cadastro**, sem inventar os dados de pessoas reais. Depois emite o novo código. Pacientes sem esses campos continuam cadastrados e disponíveis para acompanhamento profissional, mas não podem ativar o app até a complementação. Alterar CPF/nascimento revoga aparelhos, sessões, códigos e desafios desse paciente, exigindo nova verificação. Troca do celular exige reautenticação/conferência profissional e também revoga acesso; edição somente de nome não troca o autenticador.

CPF não é globalmente único no modelo por unidade. CPF+nascimento ambíguos entre unidades falham sem selecionar uma conta ao acaso. A instituição precisa definir contexto de unidade/conta antes de ampliar esse cenário; não unir cadastros nem remover a unicidade por unidade para contornar a ambiguidade.

## Contratos reais

| Método /api/v1                   | Entrada                                                                     | Resultado                                                                                                             |
| -------------------------------- | --------------------------------------------------------------------------- | --------------------------------------------------------------------------------------------------------------------- |
| POST /auth/login                 | email,password                                                              | Somente profissional/admin; paciente recebe falha genérica                                                            |
| POST /auth/paciente/iniciar      | cpf,dataNascimento ISO,tipo WEB/NATIVO; credencialDispositivo apenas nativa | AUTENTICADO com sessao, ou VERIFICACAO_NECESSARIA com desafio opaco e desafioExpiraEm; não revela existência da conta |
| POST /auth/paciente/verificar    | desafio,codigo como string de quatro números,tipo                           | Sessão e autorização do aparelho após validação; não envia CPF/nascimento novamente nem pede senha                    |
| POST /auth/paciente/renovar      | tipo; credencialDispositivo apenas nativa                                   | Rotaciona credencial e sessão se aparelho válido e renovação habilitada                                               |
| POST /auth/paciente/esquecer     | tipo + Bearer atual                                                         | 204, revoga aparelho/sessões e limpa cookie web                                                                       |
| POST /auth/logout                | Bearer atual                                                                | 204, revoga sessão e desliga renovação automática; autorização permanece                                              |
| POST /patients/{id}/access-reset | senhaProfissional,identidadeConferida=true + Bearer profissional            | Metadados de SMS sem código: idEnvio/estadoEnvio/expiraEm/destinoMascarado/provedor; recuperação aceita revoga aparelhos                           |
| GET /patients/{id}/access-status | Bearer profissional com vínculo/unidade                                     | estado,expiraEm e dispositivosAutorizados; nunca devolve o código                                                     |

`/auth/activate` foi retirado; não enviar `{token,password}`. Desde V9, `activationToken` não retorna na emissão profissional; consumidores devem usar o contrato de SMS. Atualizar consumidores em conjunto. OpenAPI em `backend/demo/openapi.json`; tipos gerados e helpers em `packages/contracts/`.

Estados profissionais: AGUARDANDO_EMISSAO, AGUARDANDO_ATIVACAO, EXPIRADO, ATIVADO, UTILIZADO_OU_SUBSTITUIDO. Desde V9, nenhum código é exibido ou recuperado pelo portal; a ficha consulta somente estado e metadados de envio. Não prometer remoção instantânea em outro cliente sem canal de eventos. O servidor impede reutilização imediatamente.

## Proteções e limites

| Recurso                 | Regra implementada                                                                                                                                                                  |
| ----------------------- | ----------------------------------------------------------------------------------------------------------------------------------------------------------------------------------- |
| Código                  | SecureRandom, exatamente 0000–9999 como string; dez minutos; uso único, inclusive concorrência por lock de paciente/código; novo valor diferente do imediatamente anterior          |
| Armazenamento do código | HMAC-SHA256 com chave privada fora do banco; não é senha permanente nem hash SHA simples enumerável offline                                                                         |
| Desafio                 | 256 bits aleatórios, hash no banco, cinco minutos, canal fixo WEB/NATIVO, cinco tentativas; não aparece em URL ou armazenamento persistente do cliente                              |
| Tentativas              | Cinco verificações por identidade/15 minutos, mesmo mudando nascimento/desafio; trinta por IP/15 minutos. Janela fixa a partir da primeira tentativa; erro HTTP não desfaz contagem |
| Início/renovação        | Sessenta inícios/IP e quinze/CPF por 15 minutos; 120 renovações/IP por 15 minutos                                                                                                   |
| Emissão                 | Uma/minuto, três/hora, dez/dia por paciente; quarenta/hora por profissional, com reautenticação e declaração de conferência presencial; limites mantidos ao reiniciar API           |
| Aparelho                | Token de 256 bits, só hash no banco, trinta dias absolutos, rotação ao entrar/renovar. Bearer de dados continua curto, trinta minutos, e vinculado ao aparelho                      |
| Revogação               | Esquecer, recuperação profissional, alteração de CPF/nascimento ou expiração impedem sessões/renovação; logout mantém autorização, desliga renovação automática                     |

CPF/nascimento identificam; a posse da credencial ou a ativação com código é obrigatória. A credencial de aparelho é um segredo protegido, não impressão de navegador, ID de publicidade nem prova de hardware. Não há atestação de hardware. Perda/cópia da credencial é risco a tratar com revogação e proteção do aparelho; o ensaio físico nativo permanece necessário.

No browser, `__Secure-viva_paciente` é host-only, HttpOnly, Secure, SameSite Strict e restrito a `/api/v1/auth/paciente`. WEB exige Origin presente e exatamente permitido. Canal NATIVO é recusado se houver Origin/Sec-Fetch de navegador, para não exportar o segredo web em JSON. CORS com credenciais limita-se a essas rotas. Dados clínicos nunca são autenticados apenas pelo cookie. Token curto fica em memória e `fetch` não segue redirects; não usar localStorage/sessionStorage/IndexedDB.

No nativo, credencial e sessão ficam no SecureStore com WHEN_UNLOCKED_THIS_DEVICE_ONLY; falha de gravação não usa armazenamento inseguro como fallback. Dispositivos físicos ainda precisam de ensaio. A fila clínica nativa/SQLCipher não foi substituída.

Browser distribuído exige HTTPS e app/API no mesmo site ou proxy de mesma origem: cookies de terceiros podem ser bloqueados. Se o cookie não for aceito, a ativação informa a falha; não há falsa persistência nem rebaixamento para localStorage. O desenho econômico existente pode usar encaminhamento de API; nenhuma publicação/domínio/serviço foi contratado nesta etapa.

## Banco, chaves e operação

`V8__acesso_paciente_sem_senha.sql`: quatro tabelas novas com RLS/revogação de PUBLIC/anon/authenticated; coluna `auth_session.id_dispositivo_paciente`. As 31 tabelas do sistema ficam protegidas; 32 contando Flyway. JDBC continua aplicando organização/vínculo por recurso, sem acesso direto do cliente.

Chave HMAC: `PATIENT_AUTH_HMAC_KEY` em Base64 de 32 bytes, ou `.patient-auth-key` no `FILES_DIRECTORY` privado local. Não imprimir/commitar. Manter a chave estável e igual entre réplicas; ambiente local tem uma instância. Chave ausente é criada localmente, chave inválida falha. Perda/troca da chave invalida códigos pendentes e as chaves dos limites; não girá-la para contornar bloqueios. Rotação em serviço exige procedimento coordenado. Aparelhos usam hashes SHA de tokens aleatórios, independentes desse segredo de códigos.

Backup cifrado inclui `.encryption-key`, `.patient-auth-key` quando presente, objetos e dump; chave do envelope fica separada. Em restauração/clone, revogar sessões, aparelhos, códigos, desafios e concessões antes de iniciar a API. Isso não deve ocorrer no banco original. O [procedimento existente](operations/BACKUP_RESTORE.md) foi adaptado; consultar o relatório para distinguir snapshot de ensaio de restauração efetivamente executado.

Retenção/limpeza periódica de metadados de acesso e limites expirados precisa de política operacional aprovada; não apagar auditoria ou dados clínicos. Credenciais de provedor externo não são necessárias para o fluxo presencial local. Produção permanece bloqueada pelos alertas gerais e revisões institucionais existentes.

## Desenvolver e validar

Arquivos centrais: `AcessoPacienteService.java`, `AcessoPacienteController.java`, `ProtecaoAcessoPaciente.java`, `ModelosAcessoPaciente.java`, `InstituicaoRepository.java`, `AutenticacaoService.java`, V8, `ContextoAutenticacao.tsx`, `services/autenticacao/dispositivoPaciente.ts`, `app/acesso.tsx`, `app/ativar-conta.tsx` e `web/components/AtivacaoPaciente.tsx`. Respeitar `AGENTS.md`; não editar V1–V9 aplicadas nem contornar os limites nos scripts de produção.

Java: `AcessoPacienteIT` exercita fluxo real, falhas, tentativas persistidas, renovação/revogação, RLS e atualização V7→V8. Fixtures autorizadas em `ApoioAcessoPaciente` existem apenas para regressões dos módulos; não são evidência do login público. Frontend: `tests/mobile/acesso-paciente.test.ts` e `web/components/AtivacaoPaciente.test.tsx`. E2E: `tests/e2e/acesso-paciente.spec.ts` e percursos existentes adaptados, sem retirar suas verificações clínicas.

Usar Java 21, banco exclusivo de testes e comandos do [manual geral](MANUAL_CONTINUIDADE_DESENVOLVIMENTO.md). Para o ensaio de navegador: `infra/validar-interface-local.ps1 -Producao -ArquivosTeste tests/e2e/acesso-paciente.spec.ts`. Definir `VIVA_CAPTURAR_ACESSO=true` somente para gerar as capturas sem segredos no diretório de evidências específico. Não tratar testes pulados por falta de credenciais como aprovação.

Orientações consultadas: [OWASP recuperação](https://cheatsheetseries.owasp.org/cheatsheets/Forgot_Password_Cheat_Sheet.html), [OWASP sessões](https://cheatsheetseries.owasp.org/cheatsheets/Session_Management_Cheat_Sheet.html). Quatro dígitos possuem pouca entropia; os limites, verificação presencial e credencial criptográfica são necessários e não constituem certificação de segurança clínica.
