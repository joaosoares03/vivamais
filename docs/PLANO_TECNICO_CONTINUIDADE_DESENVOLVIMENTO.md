# Plano técnico de continuidade do desenvolvimento

Base de 20/10/2026: [inventário por ID](LEVANTAMENTO_COMPLETO_PENDENCIAS.md), especificação original, código e evidências. Preservar Expo na raiz, Next em web/, Java 21/Spring Boot em backend/demo e PostgreSQL/Flyway. V1–V9 são imutáveis. Não criar apps/mobile, apps/web ou services/api. Este plano não é autorização para publicar, contratar ou decidir protocolos clínicos/jurídicos.

Cada pacote abaixo documenta os treze aspectos técnicos e recebe um roteiro de execução/testes ao fim e referencia os IDs individuais, cujos critérios de aceite/testes também se aplicam. Rotas, tabelas e classes identificadas como **futuras/propostas** não existem nem representam entregas concluídas. A próxima versão Flyway deverá ser coordenada com o outro desenvolvedor; não reservar uma numeração concorrente.

## Ordem sugerida

| Ordem | Pacotes | Condição de avanço |
| --- | --- | --- |
| 1 | G01, G02, G14 | Aprovar condições de uso real e resolver gates de segurança; demonstração sintética pode continuar |
| 2 | G03, G04, G18 | Habilitações de identidade/SMS e política de contas; sem scraping ou envio real implícito |
| 3 | G05–G09 | Build instalável → armazenamento/câmera/acessibilidade/notificações/offline físicos |
| 4 | G10–G13 | Ambiente HTTPS autorizado → storage → recuperação e observabilidade |
| 5 | G15–G17 | Integrações dependem de hardware e responsáveis externos/clinicamente aprovados |
| 6 | G19–G21 | Completude documental/relatórios/visual e escopo adicional aprovados |

G16/G17 são do outro desenvolvedor. Dev geral pode preservar contratos e executar regressões, sem construir recomendações, catálogo, vídeos ou modelos desses módulos nesta frente.

Nos caminhos, `Java/` abrevia `backend/demo/src/main/java/com/vivamais/`; `SQL/` abrevia `backend/demo/src/main/resources/db/migration/`. IDs do inventário são a referência para prioridade e responsável.

## G01 — Modelo produtivo e verificação institucional (P01, P06)

| Aspecto | Implementação a realizar |
| --- | --- |
| 1. Objetivo | Definir condições verificáveis para sair da demonstração sem transformar um rótulo de ambiente em autorização de uso real |
| 2. Comportamento esperado | Produção só inicia com modelo, identidade, responsabilidades e operação aprovados; recuperação atende perda/troca de linha sem acesso só por CPF |
| 3. Situação atual | ConfiguracaoAmbiente bloqueia produção; demo_only é requisito SQL; identidade é declaração presencial com reautenticação |
| 4. Arquivos existentes | Java/config/ConfiguracaoAmbiente.java; PropriedadesAplicacao.java; Java/service/AcessoPacienteService.java; SQL/V1__foundation.sql; docs/operations/DEPLOY.md |
| 5. Criar/alterar | ADR/procedimento institucional, revisão de configuração e futura migração aprovada; adaptar formulários de conferência somente após definir o procedimento |
| 6. Endpoints | Login profissional, access-reset, dados-pessoais e rotas de cadastro; nenhum endpoint produtivo novo implícito |
| 7. Tabelas | organization, user_account, patient, auth_session, dispositivo_acesso_paciente, envio_sms_ativacao; manter dados antigos |
| 8. Contratos | Documento versionado de ambiente/identidade, recuperação e tipos de evidência permitidos, sem anexar documentos pessoais por conveniência |
| 9. Dependências | Instituição, segurança, privacidade e responsáveis pelo atendimento; custos/infra autorizados |
| 10. Etapas | Registrar decisões → revisar ameaças/coleta → desenhar migração → testar clone → revisar operação → liberar ambiente explicitamente autorizado |
| 11. Segurança | Não retirar bloqueio isoladamente; não equiparar SMS, checkbox ou CPF matemático a identidade civil; revogar acesso na recuperação |
| 12. Testes | Configurações negativas, migração com legado, perda de aparelho/linha, múltiplas unidades e revisão independente |
| 13. Conclusão | Aprovações rastreáveis, controles implementados e evidência de implantação/recuperação; nenhum dado real antes disso |

## G02 — Vulnerabilidades e CI verificável (P02, P21)

| Aspecto | Implementação a realizar |
| --- | --- |
| 1. Objetivo | Resolver riscos do grafo e comprovar a execução dos gates em ambiente limpo |
| 2. Comportamento esperado | Instalação reproduzível, testes/builds/contratos e scans executados, sem esconder alerta para obter verde |
| 3. Situação atual | 2 altos em 922 dependências; workflow contém auditoria pnpm, OWASP e gitleaks; scan local completo aprovado, execução remota a conferir no relatório |
| 4. Arquivos existentes | .github/workflows/ci.yml; pnpm-lock.yaml; patches/; package.json; infra/verificar-dependencias.mjs; docs/DEPENDENCIAS_SEGURANCA.md |
| 5. Criar/alterar | Atualização suportada de consumidores/patch revisado; job de comparação OpenAPI real/gerado e retenção de relatórios sanitizados quando necessário |
| 6. Endpoints | Nenhum endpoint de produto; API de homologação apenas durante E2E |
| 7. Tabelas | Somente bancos/schemas descartáveis de CI, nunca banco principal |
| 8. Contratos | pnpm 10.28.2/Node compatível/Java21, lockfile congelado, SMS LOCAL nos testes, códigos fora dos artefatos |
| 9. Dependências | Correções upstream; autorização de remoto/CI; base NVD/credencial quando exigida pelo scanner Java |
| 10. Etapas | Inventariar caminho vulnerável → corrigir cadeia compatível → testar consumidores → exportar plataformas → executar scans → executar CI autorizada |
| 11. Segurança | Não remover teste, usar suppression vazia ou atualizar major incompatível apenas para silenciar alerta; não publicar logs com segredos |
| 12. Testes | Audit, gitleaks, OWASP, regressões CJS/ESM, JWT/sessões afetadas, exports e E2E |
| 13. Conclusão | Relatórios completos e gates relevantes aprovados com vulnerabilidades resolvidas ou decisão técnica fundamentada que não disfarce o risco |

## G03 — SMS externo e outbox durável (P03, P37)

| Aspecto | Implementação a realizar |
| --- | --- |
| 1. Objetivo | Homologar entrega real autorizada e evoluir confiabilidade antes de aumentar carga |
| 2. Comportamento esperado | Aceito/entregue/falhou/indeterminado distintos; reprocessamento não multiplica SMS ou revive código invalidado |
| 3. Situação atual | Porta e Twilio síncrono implementados; HTTP local e caixa cifrada testados; sem operadora, contrato ou credencial ativos |
| 4. Arquivos existentes | Java/service/sms/ServicoEnvioSms.java; EnvioSmsTwilio.java; SmsLocalDesenvolvimento.java; Java/service/AcessoPacienteService.java; SQL/V9__envio_sms_ativacao.sql |
| 5. Criar/alterar | Configuração secreta de homologação; futura outbox/trabalhador de reconciliação e métricas; revisar consulta de status ou callback autenticado se escolhido |
| 6. Endpoints | access-reset/access-status existentes; eventual callback novo só com assinatura/conta validadas e proteção contra replay |
| 7. Tabelas | envio_sms_ativacao, codigo_ativacao_paciente, limite_acesso_paciente, patient; futura outbox com RLS e referência de telefone/versão |
| 8. Contratos | UUID da operação, TTL de dez minutos, estado final verdadeiro; HMAC não recupera código: envio assíncrono exigirá envelope cifrado temporário, com chave fora do banco e descarte aprovado |
| 9. Dependências | Instituição autoriza fornecedor, remetente, orçamento, destinatários e tratamento de telefone; não ativar real nos E2E |
| 10. Etapas | Homologar fornecedor → testar estados → definir ledger/idempotência local → outbox transacional → reconciliar ambiguidades → testar queda/escala antes de liberar |
| 11. Segurança | Não repetir POST ambíguo automaticamente, não inventar Idempotency-Key suportada pelo provedor, respeitar todos os limites e não guardar corpo/código em log |
| 12. Testes | Aceite/entrega reais controlados, falha/timeout, perda após aceite, queda no commit, duplicidade, troca de telefone, código expirado/usado e custo |
| 13. Conclusão | Evidência autorizada de envio/recebimento, estados corretos e reconciliação rastreável; orçamento e monitoração definidos |

## G04 — Consulta oficial e contexto de identidade (P04, P05)

| Aspecto | Implementação a realizar |
| --- | --- |
| 1. Objetivo | Separar situação oficial de CPF da identificação/autenticação e resolver ambiguidade institucional |
| 2. Comportamento esperado | Consulta oficial só após fonte autorizada; conta correta selecionada por contexto explícito sem enumerar outras unidades |
| 3. Situação atual | Validação estrutural/unicidade por unidade; consulta oficial desligada/inexistente; CPF+nascimento ambíguos falham sem sessão |
| 4. Arquivos existentes | docs/CONSULTA_OFICIAL_CPF.md; packages/contracts/src/cadastro.ts; Java/service/DadosPessoaisService.java; AcessoPacienteService.java; app/acesso.tsx |
| 5. Criar/alterar | Futura porta ConsultaCpfOficial, adaptador contratado e estados minimizados; contexto de unidade/desafio após decisão institucional, com contratos atualizados |
| 6. Endpoints | Cadastro e auth/paciente/iniciar/verificar; eventual consulta oficial exclusivamente profissional/autorizada, sem proxy público de CPF |
| 7. Tabelas | patient/organization; desafios/dispositivos; eventual metadado mínimo de consulta com origem/instante/estado e política de retenção, sem resposta integral por padrão |
| 8. Contratos | Serpro versão vigente ou Conecta habilitado; CPF/nascimento minimizados, indisponível distinto de divergente; contexto nunca substitui credencial do aparelho |
| 9. Dependências | Necessidade, autorização, contrato/chaves, elegibilidade e política de múltiplos cadastros |
| 10. Etapas | Definir finalidade → obter acesso → homologar porta → decidir contexto → migrar/adaptar clientes → testar identidades iguais em unidades distintas |
| 11. Segurança | Sem scraping/CAPTCHA automatizado, chave de terceiro, exclusão de prontuário por divergência ou autenticação só por CPF/data |
| 12. Testes | Fonte autorizada, dados de homologação, indisponibilidade, inconsistência, limites, outra unidade e código/aparelho cruzados |
| 13. Conclusão | Resultado oficial rastreável sem alegação excessiva; ambiguidade resolvida com conta/contexto corretos e isolamento mantido |

## G05 — Instalação e autenticação nativa (P07–P09)

| Aspecto | Implementação a realizar |
| --- | --- |
| 1. Objetivo | Transformar exports existentes em builds instalados e testar a proteção no SO |
| 2. Comportamento esperado | Android/iOS mantêm autorização segura, rotacionam/expiram/revogam e falham sem armazenamento inseguro |
| 3. Situação atual | Hermes exportado; SecureStore implementado e testado por contrato; sem APK/AAB/IPA/aparelho comprovados |
| 4. Arquivos existentes | app.config.ts; eas.json; services/autenticacao/armazenamentoSessao.ts; dispositivoPaciente.ts; contexts/ContextoAutenticacao.tsx; docs/operations/LOJAS.md |
| 5. Criar/alterar | Perfis de build autorizados, assinatura/provisionamento, matriz mínima de SO/navegadores e roteiros com evidências por aparelho |
| 6. Endpoints | auth/paciente/*, auth/logout e recursos clínicos; mesmos contratos da web, canal NATIVO protegido |
| 7. Tabelas | dispositivo_acesso_paciente/auth_session no servidor; keychain/keystore locais, sem tabela de credencial no AsyncStorage |
| 8. Contratos | Credencial de 256 bits, expiração absoluta, WHEN_UNLOCKED_THIS_DEVICE_ONLY e API HTTPS no ambiente distribuído |
| 9. Dependências | Contas/assinaturas autorizadas, aparelho Android/iPhone e ambiente de build apropriado |
| 10. Etapas | Definir matriz → gerar build identificado → instalar → ativar → testar ciclo de vida → corrigir → repetir em ambos os SOs |
| 11. Segurança | Sem segredo de servidor no bundle, sem downgrade de armazenamento, assinatura/credenciais fora do Git; não publicar automaticamente |
| 12. Testes | Bloqueio/reinício, reinstalação/backup do SO, offline, gravação falha, concorrência de renovação, desautorização/remoto |
| 13. Conclusão | Artefato instalável identificado, registro de dispositivos/versões e todos os cenários pertinentes aprovados; export isolado não satisfaz |

## G06 — Acessibilidade representativa (P10)

| Aspecto | Implementação a realizar |
| --- | --- |
| 1. Objetivo | Remover barreiras observadas por leitores de tela e pessoas idosas |
| 2. Comportamento esperado | Login/ativação/registros/navegação completos com leitor, teclado e ampliação, sem depender só de cor |
| 3. Situação atual | Rótulos/alvos/texto ampliável e responsividade implementados; falta ensaio representativo |
| 4. Arquivos existentes | components/TextoAcessivel.tsx; ElementosInterface.tsx; BarraNavegacao.tsx; app/ativar-conta.tsx; web/app/globals.css |
| 5. Criar/alterar | Roteiro/registro de achados por tarefa; ajustar foco/ordem/contraste/dimensões conforme evidência, preservando ações reais |
| 6. Endpoints | Nenhum novo; exercícios de navegação usam APIs existentes com dados sintéticos |
| 7. Tabelas | Preferências da conta existentes; não coletar dados de participantes sem procedimento aprovado |
| 8. Contratos | Código como um único campo acessível com quatro espaços visuais; mensagens curtas e estados de erro anunciados |
| 9. Dependências | TalkBack/VoiceOver, aparelhos e participantes/roteiro autorizados |
| 10. Etapas | Ensaiar tarefas críticas → registrar obstáculo → corrigir componente comum → repetir em todas as telas consumidoras |
| 11. Segurança | Não remover conferências de identidade/valor para reduzir passos; evidências sem CPF/código ativo |
| 12. Testes | Leitor, teclado, zoom/fonte, baixo espaço, foco após falha e orientação vertical/horizontal quando pertinente |
| 13. Conclusão | Nenhum achado crítico pendente no roteiro aceito; não declarar conformidade apenas pelo screenshot |

## G07 — Câmera/galeria no aparelho (P11)

| Aspecto | Implementação a realizar |
| --- | --- |
| 1. Objetivo | Validar captura nativa sem comprometer privacidade e confirmação da leitura |
| 2. Comportamento esperado | Captura/cancelamento/negação/retorno de permissão produzem estados corretos e upload ao titular |
| 3. Situação atual | Seleção/upload web e backend sanitizado/cifrado testados; câmera física não ensaiada |
| 4. Arquivos existentes | components/FluxoFotografia.tsx; app/pressao/foto.tsx; app/alimentacao/index.tsx; app.config.ts; Java/service/ArquivoPrivadoService.java |
| 5. Criar/alterar | Ajustes de permissões/orientação/compressão e tratamento de memória após ensaio; roteiro de evidência por SO |
| 6. Endpoints | POST patients/{id}/files; pressure-ocr; files/{id}/link; leitura privada do conteúdo |
| 7. Tabelas | file_object, file_download_grant, pressure_ocr_document, meal_photo |
| 8. Contratos | JPEG/PNG e limites existentes, finalidade explícita, data/autor e confirmação humana da pressão |
| 9. Dependências | G05, aparelho e imagens de homologação autorizadas |
| 10. Etapas | Instalar → negar/autorizar → capturar/cancelar → enviar → consultar/confirmar → repetir falhas e outros titulares |
| 11. Segurança | Não expor EXIF, galeria inteira ou link permanente; câmera não mede pressão |
| 12. Testes | Rotação, baixa memória, imagem grande/ilegível, cancelamento, rede caída e acesso de outro paciente |
| 13. Conclusão | Fluxos observados em Android/iOS com imagem correta e nenhuma confirmação/salvamento fictícios |

## G08 — Notificações e atualização de agenda (P12, P13)

| Aspecto | Implementação a realizar |
| --- | --- |
| 1. Objetivo | Comprovar lembretes locais e definir renovação quando o app não é reaberto |
| 2. Comportamento esperado | Antecipação/no horário conforme plano, cancelamento de plano/conta e informação honesta quando o SO restringe entrega |
| 3. Situação atual | Agendamento finito/calculado e cancelamento por owner existem; sem entrega física ou renovação em segundo plano comprovadas |
| 4. Arquivos existentes | services/lembretes/calculoLembretes.ts; lembretes.native.ts; app/lembretes.tsx; app.config.ts; hooks/usePainelPaciente.ts |
| 5. Criar/alterar | Estratégia de reagendamento por ciclo de vida/fuso/reboot e, se suportada/aprovada, tarefa de fundo com limites explícitos |
| 6. Endpoints | GET patients/{id}/medications e medication-events; planos alterados pela equipe continuam no backend |
| 7. Tabelas | medication_plan/schedule/history; autorrelatos separados do estado de notificação do SO |
| 8. Contratos | Notificação não prova ingestão; agendamento não equivale à entrega; instruções clínicas vêm do profissional |
| 9. Dependências | G05, permissões e matriz de suporte Android/iOS |
| 10. Etapas | Ensaiar agenda atual → definir comportamento degradado → reagendamento → testar cancelamento/alteração → documentar restrições |
| 11. Segurança | Conteúdo minimizado na tela bloqueada, cancelamento por titular, sem compensação de dose automática |
| 12. Testes | Plano novo/alterado/revogado, app encerrado, agenda vencida, fuso/reboot, negação de permissão e logout |
| 13. Conclusão | Comportamento físico registrado e limitações claras; nenhum lembrete de plano cancelado nos cenários suportados |

## G09 — Offline protegido e reconciliação (P14–P16)

| Aspecto | Implementação a realizar |
| --- | --- |
| 1. Objetivo | Permitir consulta mínima e registros pendentes após reinício, sem mistura de titulares ou perda silenciosa |
| 2. Comportamento esperado | Cache cifrado identifica versão/prazo; fila persiste UUID e reenvia idempotentemente; conflitos exigem tratamento explícito |
| 3. Situação atual | Fila nativa SQLCipher implementada; web só memória; cache de consulta não persiste todo o plano/histórico |
| 4. Arquivos existentes | services/sincronizacao/armazenamentoFila.native.ts; regrasSincronizacao.ts; services/autenticacao/; app/_layout.tsx; hooks/usePainelPaciente.ts |
| 5. Criar/alterar | Futuro armazenamentoCacheProtegido.native.ts com schema/versionamento, integração ao cache de consultas e UI de desatualização/conflito |
| 6. Endpoints | Recursos clínicos existentes com UUID/versão; autenticação/renovação não vira validação offline de CPF |
| 7. Tabelas | pending_operation local; futuras entradas locais de cache por titular/versão; sync_operation e tabelas clínicas no servidor |
| 8. Contratos | TTL offline e revogação aprovados, dados mínimos, um efeito por UUID e distinção pendente/enviado/erro |
| 9. Dependências | G05/G06, plugin SQLCipher e política institucional para cache/expiração |
| 10. Etapas | Ensaiar fila física → definir cache mínimo → criar schema/migração local → integrar queries → testar queda/revogação/conflitos |
| 11. Segurança | Chave SecureStore sem fallback, owner obrigatório, não sobrescrever edição clínica, limpar/desabilitar acesso conforme política |
| 12. Testes | Arquivo sem chave, processo morto, ACK perdido, reinício sem rede, 401/409/429/5xx, conta diferente e plano alterado |
| 13. Conclusão | Dados permitidos continuam acessíveis com prazo visível; fila íntegra e sem duplicação/vazamento em ambos os SOs |

## G10 — Hospedagem HTTPS e limites por instância (P17, P40)

| Aspecto | Implementação a realizar |
| --- | --- |
| 1. Objetivo | Homologar a infraestrutura econômica existente sem degradar cookies/CORS/limites |
| 2. Comportamento esperado | App/API no mesmo site ou proxy adequado, TLS real e limite profissional coordenado quando houver réplicas |
| 3. Situação atual | Execução local otimizada; nenhum deploy. Limite de login profissional em memória por instância; SMS/paciente persistidos |
| 4. Arquivos existentes | infra/railway.toml; web/next.config.ts; Java/config/ConfiguracaoSeguranca.java; Java/security/LimitadorTentativasAcesso.java; docs/operations/HOSPEDAGEM_DEMO.md |
| 5. Criar/alterar | Manifestos/configuração autorizados, proxy restrito para API do app, limite compartilhado conforme estratégia; não abrir proxy genérico |
| 6. Endpoints | Health, auth/paciente/* e API clínica; limites do profissional mantêm o método de autenticação |
| 7. Tabelas | Sessões/limites existentes; eventual armazenamento atômico compartilhado do limiter profissional com nova migração/RLS |
| 8. Contratos | Origens exatas, Secure/HttpOnly/SameSite, sem credencial em URL; definição do IP confiável no proxy |
| 9. Dependências | Autorização/contas, G01/G02, TLS/domínio e limites comerciais atuais a conferir |
| 10. Etapas | Provisionar homologação → configurar segredos/proxy → migrar clone → testar TLS/cookie/CORS → medir consumo → aprovar implantação |
| 11. Segurança | Não confiar em X-Forwarded-For arbitrário nem retirar Secure; serviço de banco/storage somente backend; bootstrap desligado |
| 12. Testes | Hosts reais, browsers com restrição de terceiros, Origin falso, réplicas/reinício/concorrência, hibernação e quotas |
| 13. Conclusão | Evidência no ambiente autorizado, limites preservados e custos/alertas aceitos; local não comprova esse pacote |

## G11 — Storage privado no fornecedor (P18)

| Aspecto | Implementação a realizar |
| --- | --- |
| 1. Objetivo | Homologar Supabase privado preservando a cifra e a autorização da API |
| 2. Comportamento esperado | Upload/download/remoção técnica autorizada funcionam sem objeto público ou service-role no cliente |
| 3. Situação atual | Adaptador HTTP existe; ensaios atuais usam disco local cifrado |
| 4. Arquivos existentes | Java/service/ArmazenamentoArquivos.java; ArquivoPrivadoService.java; Java/controller/ArquivoPrivadoController.java; application.yml |
| 5. Criar/alterar | Configuração privada do bucket/chaves e testes de contrato reais; corrigir tratamento de falha conforme homologação |
| 6. Endpoints | Upload/link/conteúdo da API; não expor endpoints de storage diretamente para contornar autorização |
| 7. Tabelas | file_object/file_download_grant/meal_photo/pressure_ocr_document; objetos cifrados e chave fora do dump puro |
| 8. Contratos | Nomes UUID, limites de arquivo, AES-GCM, concessões curtas revogáveis e consistência entre metadado/objeto |
| 9. Dependências | Conta, segredo backend, bucket privado e autorização do fornecedor |
| 10. Etapas | Criar bucket autorizado → configurar → enviar/ler → falhar em rede/cota → restaurar objeto/chave → revisar acesso |
| 11. Segurança | Nenhum bucket público ou URL permanente, service-role só servidor; chaves estáveis e backup separado |
| 12. Testes | Acesso cruzado, sessão revogada, objeto ausente, limite, timeout, cota e integridade de cifra |
| 13. Conclusão | Ensaios no fornecedor com objetos privados e resposta honesta a falhas, mantendo testes locais |

## G12 — Recuperação operacional (P19)

| Aspecto | Implementação a realizar |
| --- | --- |
| 1. Objetivo | Recuperar o ambiente hospedado com banco, arquivos e chaves dentro de prazos definidos |
| 2. Comportamento esperado | Backup autenticado, retenção/agenda e restauração isolada com credenciais invalidadas no clone |
| 3. Situação atual | Backup/restauração local V8 já provados; snapshot anterior à V9 e preservação de dados comprovados; fornecedor não ensaiado |
| 4. Arquivos existentes | infra/cifrar-backup.mjs; ensaiar-backup-local.ps1; verificar-restauracao.mjs; docs/operations/BACKUP_RESTORE.md |
| 5. Criar/alterar | Procedimento/agenda da infraestrutura autorizada, controle de chaves e ensaio V9 no destino; excluir caixa de teste do conjunto produtivo |
| 6. Endpoints | Health e leitura de foto/login de homologação para comprovar recuperação; SMS real desligado no clone |
| 7. Tabelas | Todas as tabelas/migrations; sessões, aparelhos, códigos, desafios e concessões revogados somente no clone |
| 8. Contratos | Envelope/manifesto de integridade, chave separada, RPO/RTO e retenção aprovados |
| 9. Dependências | G10/G11, destino privado, política e acesso operacional autorizado |
| 10. Etapas | Definir prazos → configurar cópia → restaurar em destino novo → comparar dados/objetos → revogar clone → ensaiar API → registrar recuperação |
| 11. Segurança | Não restaurar sobre o principal, publicar dump/chave, reativar SMS ou deixar credencial copiada utilizável |
| 12. Testes | Adulteração, chave ausente, objeto faltante, restauração completa, foto antiga, acesso cruzado e incidente simulado |
| 13. Conclusão | Ensaio reproduzível do ambiente real de hospedagem, com prazos medidos e original preservado |

## G13 — Observabilidade e consulta de auditoria (P20, P22)

| Aspecto | Implementação a realizar |
| --- | --- |
| 1. Objetivo | Detectar falhas e permitir investigação autorizada sem registrar conteúdo clínico |
| 2. Comportamento esperado | Alertas acionáveis e consulta mínima por ator/recurso/instante, com controle de acesso |
| 3. Situação atual | Health mínimo, logs técnicos e audit_event imutável; sem monitoração externa/console de auditoria completo |
| 4. Arquivos existentes | application.yml; Java/repositories/InstituicaoRepository.java; SQL/V1__foundation.sql; docs/operations/ |
| 5. Criar/alterar | Configuração de métricas/alertas autorizada; futura consulta administrativa de auditoria e procedimento de incidente |
| 6. Endpoints | Health existente; eventual GET administrativo de auditoria minimizado, sem corpos/segredos |
| 7. Tabelas | audit_event, envio_sms_ativacao e metadados operacionais; não liberar alteração/remoção da trilha |
| 8. Contratos | Métrica sem CPF/telefone como label, identificação de incidente sem payload, prazos e responsável pela resposta |
| 9. Dependências | G10, serviço de monitor autorizado, papéis institucionais e retenção |
| 10. Etapas | Definir sinais/SLIs → configurar métricas → simular falha → ajustar alerta → disponibilizar consulta autorizada → exercitar incidente |
| 11. Segurança | Sem senha/código/token/URL de concessão ou resposta de SMS em log; health público sem detalhe de banco |
| 12. Testes | Falhas API/banco/storage/SMS/backup, alertas sem dados pessoais, paginação/isolamento da auditoria |
| 13. Conclusão | Falha detectada e atendida no ensaio, com trilha preservada e nenhum vazamento por logs/métricas |

## G14 — Privacidade, direitos e retenção (P23–P25, P38)

| Aspecto | Implementação a realizar |
| --- | --- |
| 1. Objetivo | Substituir páginas informativas pendentes por processos institucionais reais e verificáveis |
| 2. Comportamento esperado | Bases/avisos versionados, canal de suporte e pedido de exclusão rastreável com avaliação de retenção |
| 3. Situação atual | consent_or_legal_basis_record existe; páginas declaram que o fluxo ainda não recebe pedidos; sem política de limpeza periódica |
| 4. Arquivos existentes | web/app/privacidade/page.tsx; suporte/page.tsx; exclusao-de-conta/page.tsx; SQL/V1__foundation.sql; SQL/V8__acesso_paciente_sem_senha.sql; SQL/V9__envio_sms_ativacao.sql; infra/caixa-sms-local.cjs |
| 5. Criar/alterar | Futuro serviço/UI de solicitações e registro de base aplicável, migração com RLS, tarefa de retenção aprovada e documentos institucionais |
| 6. Endpoints | Propostos: solicitações autenticadas/assistidas e acompanhamento de protocolo; não criar exclusão clínica direta sem procedimento aprovado |
| 7. Tabelas | consent_or_legal_basis_record; futura solicitacao_privacidade; dados/sessões/arquivos envolvidos; trilha imutável preservada conforme política |
| 8. Contratos | Categoria, finalidade, base/referência, prazo, estado/protocolo e motivo de retenção; não presumir consentimento para todos os tratamentos |
| 9. Dependências | Instituição/jurídico/privacidade, canal real e responsáveis nomeados |
| 10. Etapas | Aprovar política → desenhar processo → criar contratos/RLS → implementar recepção/análise/resposta → ensaiar retenção/exclusão → publicar só após autorização |
| 11. Segurança | Identificação proporcional, minimização, não apagar prontuário por pedido não verificado, não eliminar auditoria para ocultar operação |
| 12. Testes | Pedido duplicado, titular errado, acesso administrativo, retenção, revogação, estado da solicitação e limpeza idempotente |
| 13. Conclusão | Pedido realmente registrado/tratado e comunicado; políticas/canais aprovados e ausência de promessa fictícia nas páginas |

## G15 — Integração real da pulseira (P26)

| Aspecto | Implementação a realizar |
| --- | --- |
| 1. Objetivo | Substituir apenas o adaptador de hardware indisponível quando houver especificação e aparelho |
| 2. Comportamento esperado | Programação/ACK/estado reais e lembretes offline conforme capacidades documentadas |
| 3. Situação atual | Porta e simulador explícito existem; nenhuma medição de pressão pela pulseira |
| 4. Arquivos existentes | Java/service/AdaptadorPulseira.java; CuidadoService.java; web/components/CuidadoPaciente.tsx; SQL/V2__care.sql |
| 5. Criar/alterar | Adaptador específico, transporte/firmware e UI de sincronização; não mudar o contrato do simulador para afirmar sucesso real |
| 6. Endpoints | patients/{id}/device e device/configurations; novas rotas somente conforme protocolo aprovado |
| 7. Tabelas | device/device_configuration; futuras confirmações/versões se necessárias e aprovadas |
| 8. Contratos | Identidade do dispositivo, comandos/ACK, relógio, retry e semântica do botão de reconhecimento |
| 9. Dependências | Fabricante, firmware, hardware, conectividade e ensaio autorizado |
| 10. Etapas | Receber especificação → definir ameaça/pareamento → implementar adaptador → ensaiar bancada → integrar UI/registro → testar falha |
| 11. Segurança | Pareamento/autorização por paciente, proteção do transporte, ACK não equivale a ingestão; manter modo simulado identificado |
| 12. Testes | Falta de rede/bateria, relógio errado, reenvio, aparelho trocado, armazenamento offline e comandos de outro paciente |
| 13. Conclusão | Programação demonstrada no hardware, estado verdadeiro e nenhuma capacidade inventada |

## G16 — Catálogo, personalização e vídeos (P27, P28; outro desenvolvedor)

| Aspecto | Implementação a realizar |
| --- | --- |
| 1. Objetivo | Entregar atividades/materiais aprovados sem transformar registro voluntário em prescrição automática |
| 2. Comportamento esperado | Sugestão contextualizada/explicável, restrições respeitadas, ausência de dados/contraindicação sem recomendação |
| 3. Situação atual | Perfil, roteiro, registro e histórico; catálogo local estático `2026-10-21` com 10 mídias aprovadas pela gestão e player MP4, sem catálogo clínico/persistência/motor |
| 4. Arquivos existentes | services/atividades/atividades.ts; hooks/useRoteiroAtividade.ts; components/RoteiroAtividade.tsx; app/atividade-fisica/; Java/service/CuidadoService.java |
| 5. Criar/alterar | Pelo outro dev: evoluir somente após aceite o catálogo persistido, política de recomendação e serviço/contratos institucionais; preservar o catálogo local e sua separação do autorrelato |
| 6. Endpoints | activity-profile/activities existentes; futuras consultas de catálogo/recomendação distintas de POST de autorrelato |
| 7. Tabelas | physical_activity_profile/activity_record; futuras tabelas de conteúdo/protocolo/aprovação com RLS |
| 8. Contratos | Versão local e aprovação de gestão da mídia registradas; protocolo/aprovador clínico, limitações, origem de recomendação e separação do autorrelato continuam exigidos |
| 9. Dependências | Responsável de exercícios, clínica, critérios, licenças e conteúdo acessível |
| 10. Etapas | Aprovar catálogo/protocolo → modelar versões → implementar regras/contratos → integrar telas → avaliar segurança e acessibilidade |
| 11. Segurança | Não inferir risco pelo texto, inventar limiares clínicos ou tratar mídia como segura; ausência de dados, alerta, restrição ou protocolo pendente não exibem sugestão; não alterar autenticação/SMS |
| 12. Testes | Perfis/idades, ausência de dados, restrições, contraindicação, versão de conteúdo, vídeo indisponível e auditoria; há teste unitário da separação dos grupos e dos bloqueios |
| 13. Conclusão | Aceite clínico e técnico rastreável do responsável; geral apenas preserva integração e executa regressões |

## G17 — Alimentação automatizada e evolução do OCR (P29, P30; outro desenvolvedor)

| Aspecto | Implementação a realizar |
| --- | --- |
| 1. Objetivo | Avaliar e integrar análise com limites/privacidade mensuráveis, mantendo confirmação humana da pressão |
| 2. Comportamento esperado | Foto ilegível/baixa confiança não vira resultado clínico; serviço indisponível é distinto de análise válida |
| 3. Situação atual | Tesseract real em fixture, parser com revisão; alimentação tem porta HTTP desligada, sem fornecedor/critérios aprovados |
| 4. Arquivos existentes | Java/service/ProvedorOcr.java; ReconhecedorTesseract.java; ProvedorAnaliseAlimentacaoHttp.java; ArquivoPrivadoService.java; infra/ocr-worker.mjs |
| 5. Criar/alterar | Pelo outro dev: corpus aprovado/métricas e versão de modelo/critérios, adaptador contratado e histórico de avaliação quando definido |
| 6. Endpoints | pressure-ocr, meals/{id}/analyze, refeicoes/{id}; preservar escopo da API e status UNAVAILABLE |
| 7. Tabelas | pressure_ocr_document, meal_photo, food_analysis_attempt; futuras versões de avaliação/modelo com migração coordenada |
| 8. Contratos | Campos mínimos/estados/versão, limite de resposta, retenção do provedor e comprovação de não uso indevido de fotos |
| 9. Dependências | Responsável de IA, nutrição/clínica, privacidade, corpus/licença e credencial/custo autorizado |
| 10. Etapas | Definir critérios → autorizar corpus → medir baseline → integrar serviço em homologação → testar falhas/baixa confiança → revisar com clínica |
| 11. Segurança | Nenhum segredo no cliente, treinamento implícito com fotos ou semáforo fictício; não medir sódio/pressão por inferência indevida |
| 12. Testes | Corpus representativo por campo, ilegível/reflexo/rotação, indisponibilidade, falso positivo, custo, isolamento e revisão obrigatória |
| 13. Conclusão | Métricas/critérios e tratamento de erros aprovados, resultado versionado e limitações claras; esta frente não implementa o modelo |

## G18 — Ciclo de vida profissional (P32)

| Aspecto | Implementação a realizar |
| --- | --- |
| 1. Objetivo | Provisionar, recuperar e desativar contas sem depender do bootstrap sintético |
| 2. Comportamento esperado | Convite/recuperação verificáveis, papéis/unidade corretos e revogação imediata de sessões ao desativar |
| 3. Situação atual | Login/saída/escopo funcionam; não há autoinscrição pública nem CRUD produtivo de profissionais |
| 4. Arquivos existentes | Java/config/DadosDemonstracao.java; Java/service/AutenticacaoService.java; Java/controller/InstituicaoController.java; web/app/page.tsx |
| 5. Criar/alterar | Futuros serviço/controlador/UI administrativos de convite, recuperação e desativação; migração de convites de uso único quando aprovada |
| 6. Endpoints | Auth profissional existente; novas rotas administrativas/recuperação após contrato, sem reutilizar código SMS de paciente como senha profissional |
| 7. Tabelas | user_account, professional, organization, assignments, auth_session e futura credencial de recuperação de uso único |
| 8. Contratos | Canal verificável, TTL, uso único, papéis e auditoria; erro público sem enumeração |
| 9. Dependências | Política de identidade institucional e canal de recuperação autorizado |
| 10. Etapas | Definir responsáveis → criar contrato → implementar convite/desativação → revogar sessões → testar recuperação → revisar ameaças |
| 11. Segurança | Não enfraquecer BCrypt/login atual, permitir autoinscrição irrestrita ou reutilizar bootstrap como reset de senha |
| 12. Testes | Papel/unidade, convite usado/expirado, conta desativada, sessão antiga, recuperação abusiva e auditoria |
| 13. Conclusão | Conta pode ser gerida com procedimento aprovado sem acesso ampliado nem credenciais divulgadas |

## G19 — Resumo/exportação e retificação (P35, P39)

| Aspecto | Implementação a realizar |
| --- | --- |
| 1. Objetivo | Tornar limites do resumo inequívocos e preservar o original em correções de transcrição |
| 2. Comportamento esperado | Exportação identifica período/completude; retificação tem versão, motivo, autor e relação ao original |
| 3. Situação atual | Resumo JSON até vinte itens/coleção e totais completos; criação/leitura de diário/consulta, sem retificação geral |
| 4. Arquivos existentes | Java/service/CuidadoService.java:resumirConsulta/exportarResumo; Java/controller/CuidadoController.java; web/components/TabelaCuidado.tsx; web/app/(portal)/relatorios/page.tsx |
| 5. Criar/alterar | Contrato de exportação aprovado; futura retificação/supersessão e UI/migração correspondente, sem reescrever registros silenciosamente |
| 6. Endpoints | summary/export e diary/consultations existentes; futura operação explícita de retificação com versão/motivo |
| 7. Tabelas | printed_diary_entry/consultation/audit_event; eventual histórico de retificação com FK para o original |
| 8. Contratos | Escopo/limite/filtro/geradoEm e estado de completude; motivo/versão/autor da correção, sem protocolo clínico inventado |
| 9. Dependências | Definição de escopo e política clínica/jurídica de correção e retenção |
| 10. Etapas | Confirmar necessidade → definir contrato → modelar histórico → implementar UI/API → testar paginação/concorrência → revisar resumo |
| 11. Segurança | Mesmo vínculo/unidade em export/retificação; minimizar dados e auditar; não exportar tudo indiscriminadamente ou apagar o original |
| 12. Testes | Mais de vinte itens, filtros, conflito de versão, autor/unidade errados, idempotência e leitura histórica |
| 13. Conclusão | Limite/completude explícitos, nenhuma perda silenciosa e trilha de correção verificável |

## G20 — Escopo adicional e padronização gradual (P33, P34, P36)

| Aspecto | Implementação a realizar |
| --- | --- |
| 1. Objetivo | Decidir integrações/comunicação adicionais e reduzir legado sem inventar funcionalidades obrigatórias |
| 2. Comportamento esperado | Prontuário externo/chat só após escopo/contrato; identificadores próprios em português com compatibilidade preservada |
| 3. Situação atual | Sem conector institucional; Mensagens lê orientação do perfil, não envia chat; contratos legados possuem nomes preservados |
| 4. Arquivos existentes | app/mensagens.tsx; hooks/useDadosAtividade.ts; Java/service/CuidadoService.java; packages/contracts/; docs/REFATORACAO_VISUAL_E_ESTRUTURAL.md |
| 5. Criar/alterar | Se aprovados: adaptadores backend do sistema institucional e serviço de comunicação; mapear/refatorar legado por módulo com aliases/mapeadores |
| 6. Endpoints | Nenhum envio/chat atual. Futuras APIs deverão declarar destinatário/escopo/status; nomes JSON/rotas existentes não mudam isoladamente |
| 7. Tabelas | Só criar tabelas de mensagens/conectores após escopo; nunca alterar SQL aplicado por renomeação cosmética |
| 8. Contratos | Autorização, destinatário, SLA, idempotência/versionamento de integração; exceções de framework/compatibilidade documentadas |
| 9. Dependências | Produto/instituição, sistema externo e coordenação dos responsáveis de exercícios/IA |
| 10. Etapas | Confirmar requisito → definir contrato mínimo → aprovar coleta/canal → implementar fatia real → atualizar consumidores/testes → documentar exceções |
| 11. Segurança | Não simular envio, criar expectativa de atendimento imediato ou passar dados/segredos a conector não autorizado |
| 12. Testes | Contrato externo, duplicidade/falha, outro destinatário/unidade, mensagens vazias e regressão de nomes/serialização |
| 13. Conclusão | Escopo aprovado implementado de ponta a ponta; se não aprovado, ausência explicitamente documentada sem promessa na UI |

## G21 — Fidelidade das referências (P31)

| Aspecto | Implementação a realizar |
| --- | --- |
| 1. Objetivo | Fechar diferenças visuais registradas sem substituir telas funcionais por mockups |
| 2. Comportamento esperado | Componentes reais seguem referências aprovadas; divergências obrigatórias de segurança/estado ficam registradas |
| 3. Situação atual | Trinta e cinco comparações anteriores têm diferenças; notificação física não capturada; dois prints desta execução corrigidos e recapturados |
| 4. Arquivos existentes | referencias_codex/prototipos/; referencias_codex/telas/; docs/FIDELIDADE_VISUAL.md; infra/capturar-telas.mjs; infra/comparar-telas.py |
| 5. Criar/alterar | Ajustar componente/asset/layout por tela e atualizar pares/manifesto após teste; manter logos originais de alta resolução |
| 6. Endpoints | Consumir APIs reais existentes; não introduzir dados fixos para coincidir com valores ilustrados |
| 7. Tabelas | Nenhuma tabela nova apenas para aparência; dados sintéticos de captura identificados |
| 8. Contratos | Referência visual por tela/viewport; fluxo CPF+dispositivo/SMS vigente substitui autenticação insegura ilustrada |
| 9. Dependências | Aceite visual, UX/acessibilidade e aparelhos para cenas nativas; responsáveis dos módulos delegados |
| 10. Etapas | Escolher diferença registrada → ajustar componente → testar função → capturar → comparar → registrar diferença/aceite |
| 11. Segurança | Capturas sem CPF/nascimento preenchidos, senha/código ativo; não esconder bloqueio clínico, prova de envio ou modo de demonstração |
| 12. Testes | Responsividade/densidade/fonte, leitores, ação real/API e estados de erro/vazio; comparação visual sem declarar igualdade por inspeção superficial |
| 13. Conclusão | Matriz por referência com comparação e aceite; nenhuma cena física fabricada ou funcionalidade simulada para o print |


## Roteiro reproduzível por pacote (14º aspecto: execução e verificação)

O conteúdo técnico acima é a referência única migrada do plano anterior; o nome antigo passa a apontar para este manual. Complexidade/APIs/banco/responsável por cadaPxx estão no levantamento ampliado. Componentes existentes estão no inventário funcional; classes/tabelas/rotas futuras continuam propostas. Não implantar ou contratar para executar um plano sem a autorização correspondente.

Pré-requisitos comuns: seguir GUIA_COMPLETO_AMBIENTE_DESENVOLVIMENTO, criar banco exclusivo de teste, selecionarJava21 e configurar TEST_DATABASE_* sem senha em linha. Com pnpm10.28.2, `pnpm typecheck`, `pnpm lint`, `pnpm test`; Java `backend/demo/mvnw.cmd -f backend/demo/pom.xml verify`; E2E `pnpm test:e2e` com API/PG/SMSLOCAL. Os comandos detalhados e variáveis estão no [manual de testes](MANUAL_COMPLETO_TESTES_DESENVOLVEDOR.md).

### Execução G01 — P01, P06

1. **Reutilizar/localizar:** os arquivos,componentes,Services,contratos e tabela do pacote G01 acima; catálogo e inventário têm links.
2. **Sequência:** Obter decisões institucionais de finalidade/identidade/retenção/canais → registrar ADR e exemplos aceitos → desenhar contrato de estados/autoria sem coletar documento desnecessário → aprovar migração e processo → implementar UI/API → testar trilha e decisões negativas. Não remover APP_ENV production isoladamente.
3. **Validação executável:** `pnpm typecheck`; `pnpm lint`; `pnpm test`; `backend/demo/mvnw.cmd -f backend/demo/pom.xml verify`; E2E dos fluxos afetados.
4. **Aceite:** cumprir a linha13do pacote e todos os critérios Pxx do levantamento; registrar data,build,resultados e limitações. Falha/serviço não ensaiado não recebe concluído.

### Execução G02 — P02, P21

1. **Reutilizar/localizar:** os arquivos,componentes,Services,contratos e tabela do pacote G02 acima; catálogo e inventário têm links.
2. **Sequência:** Executar audit e obter caminho vulnerável → conferir advisory/correção upstream → selecionar atualização/patch suportado → instalar lock congelado → testar consumidores → build/export → executar auditoria e CI novamente. Gitleaks examina histórico e árvore candidata; nenhuma suppression para esconder os2 altos.
3. **Validação executável:** `pnpm audit --json`; `pnpm install --frozen-lockfile`; `pnpm typecheck`; `pnpm lint`; `pnpm test`; `pnpm build:web`; `pnpm exec expo export --platform all --output-dir .local/export-revisao`; verificar jobs GitHub e OWASP.
4. **Aceite:** cumprir a linha13do pacote e todos os critérios Pxx do levantamento; registrar data,build,resultados e limitações. Falha/serviço não ensaiado não recebe concluído.

### Execução G03 — P03, P37

1. **Reutilizar/localizar:** os arquivos,componentes,Services,contratos e tabela do pacote G03 acima; catálogo e inventário têm links.
2. **Sequência:** Obter credenciais/remetente/destinatários e limite financeiro autorizados → habilitar TWILIO somente em homologação privada → executar envio controlado e registrar aceite/entrega/falha → projetar outbox e tratamento de resposta perdida sem duplicar cobrança → implementar nova migração/trabalhador aprovado → testar crash/retry/limites e revogação. Não habilitar TWILIO nos E2E.
3. **Validação executável:** `backend/demo/mvnw.cmd -f backend/demo/pom.xml -Dit.test=CadastroSmsIT,AcessoPacienteIT verify`; `pnpm exec playwright test tests/e2e/cadastro-sms.spec.ts`; ensaio externo separado com custo aprovado.
4. **Aceite:** cumprir a linha13do pacote e todos os critérios Pxx do levantamento; registrar data,build,resultados e limitações. Falha/serviço não ensaiado não recebe concluído.

### Execução G04 — P04, P05

1. **Reutilizar/localizar:** os arquivos,componentes,Services,contratos e tabela do pacote G04 acima; catálogo e inventário têm links.
2. **Sequência:** Escolher canal oficial elegível/contratável,sem scraping → aprovar finalidade/minimização → definir contexto de múltiplas unidades sem enumeração → documentar DTO/estados e retenção → implementar adaptador somente após contrato → testar indisponibilidade/ambiguidade/código cruzado. CPF estrutural não deve passar a significar identidade confirmada.
3. **Validação executável:** `pnpm typecheck`; `pnpm lint`; `pnpm test`; `backend/demo/mvnw.cmd -f backend/demo/pom.xml verify`; E2E dos fluxos afetados.
4. **Aceite:** cumprir a linha13do pacote e todos os critérios Pxx do levantamento; registrar data,build,resultados e limitações. Falha/serviço não ensaiado não recebe concluído.

### Execução G05 — P07, P08, P09

1. **Reutilizar/localizar:** os arquivos,componentes,Services,contratos e tabela do pacote G05 acima; catálogo e inventário têm links.
2. **Sequência:** Preparar build instalável e API de homologação autorizados → repetir baseline em Android/iOS → observar permissão/chave/fila/notificação conforme o pacote → simular queda/negação/reinício/mudança de titular → corrigir comportamento real → repetir no mesmo modelo/SO e em outro alvo → registrar versão/build/cenários. Export não fecha esse pacote.
3. **Validação executável:** `pnpm test:mobile`; `pnpm typecheck`; `pnpm export:mobile`; `pnpm exec expo export --platform all --output-dir .local/export-nativo`; build/instalação conforme Android Studio ou EAS autorizado; matriz física do manual.
4. **Aceite:** cumprir a linha13do pacote e todos os critérios Pxx do levantamento; registrar data,build,resultados e limitações. Falha/serviço não ensaiado não recebe concluído.

### Execução G06 — P10

1. **Reutilizar/localizar:** os arquivos,componentes,Services,contratos e tabela do pacote G06 acima; catálogo e inventário têm links.
2. **Sequência:** Reproduzir estado atual e ler arquivos/contratos do pacote → registrar decisão pendente antes de criar arquitetura definitiva → implementar uma mudança aditiva em branch coordenada → testar sucesso/falha/escopo e persistência → revisar evidência e critérios de conclusão acima.
3. **Validação executável:** `pnpm typecheck`; `pnpm lint`; `pnpm test`; `backend/demo/mvnw.cmd -f backend/demo/pom.xml verify`; E2E dos fluxos afetados.
4. **Aceite:** cumprir a linha13do pacote e todos os critérios Pxx do levantamento; registrar data,build,resultados e limitações. Falha/serviço não ensaiado não recebe concluído.

### Execução G07 — P11

1. **Reutilizar/localizar:** os arquivos,componentes,Services,contratos e tabela do pacote G07 acima; catálogo e inventário têm links.
2. **Sequência:** Preparar build instalável e API de homologação autorizados → repetir baseline em Android/iOS → observar permissão/chave/fila/notificação conforme o pacote → simular queda/negação/reinício/mudança de titular → corrigir comportamento real → repetir no mesmo modelo/SO e em outro alvo → registrar versão/build/cenários. Export não fecha esse pacote.
3. **Validação executável:** `pnpm test:mobile`; `pnpm typecheck`; `pnpm export:mobile`; `pnpm exec expo export --platform all --output-dir .local/export-nativo`; build/instalação conforme Android Studio ou EAS autorizado; matriz física do manual.
4. **Aceite:** cumprir a linha13do pacote e todos os critérios Pxx do levantamento; registrar data,build,resultados e limitações. Falha/serviço não ensaiado não recebe concluído.

### Execução G08 — P12, P13

1. **Reutilizar/localizar:** os arquivos,componentes,Services,contratos e tabela do pacote G08 acima; catálogo e inventário têm links.
2. **Sequência:** Preparar build instalável e API de homologação autorizados → repetir baseline em Android/iOS → observar permissão/chave/fila/notificação conforme o pacote → simular queda/negação/reinício/mudança de titular → corrigir comportamento real → repetir no mesmo modelo/SO e em outro alvo → registrar versão/build/cenários. Export não fecha esse pacote.
3. **Validação executável:** `pnpm test:mobile`; `pnpm typecheck`; `pnpm export:mobile`; `pnpm exec expo export --platform all --output-dir .local/export-nativo`; build/instalação conforme Android Studio ou EAS autorizado; matriz física do manual.
4. **Aceite:** cumprir a linha13do pacote e todos os critérios Pxx do levantamento; registrar data,build,resultados e limitações. Falha/serviço não ensaiado não recebe concluído.

### Execução G09 — P14, P15, P16

1. **Reutilizar/localizar:** os arquivos,componentes,Services,contratos e tabela do pacote G09 acima; catálogo e inventário têm links.
2. **Sequência:** Preparar build instalável e API de homologação autorizados → repetir baseline em Android/iOS → observar permissão/chave/fila/notificação conforme o pacote → simular queda/negação/reinício/mudança de titular → corrigir comportamento real → repetir no mesmo modelo/SO e em outro alvo → registrar versão/build/cenários. Export não fecha esse pacote.
3. **Validação executável:** `pnpm test:mobile`; `pnpm typecheck`; `pnpm export:mobile`; `pnpm exec expo export --platform all --output-dir .local/export-nativo`; build/instalação conforme Android Studio ou EAS autorizado; matriz física do manual.
4. **Aceite:** cumprir a linha13do pacote e todos os critérios Pxx do levantamento; registrar data,build,resultados e limitações. Falha/serviço não ensaiado não recebe concluído.

### Execução G10 — P17, P40

1. **Reutilizar/localizar:** os arquivos,componentes,Services,contratos e tabela do pacote G10 acima; catálogo e inventário têm links.
2. **Sequência:** Obter ambiente de homologação econômico autorizado → criar segredos no fornecedor sem publicá-los → configurar caminho mínimo do pacote → testar TLS/Origin/credencial/isolamento e falha → medir custo/recuperação/limites → registrar procedimento de operação e repetir em clone/restauração isolada. Não publicar só para demonstrar um passo deste documento.
3. **Validação executável:** `pnpm typecheck`; `pnpm lint`; `pnpm test`; `backend/demo/mvnw.cmd -f backend/demo/pom.xml verify`; E2E dos fluxos afetados.
4. **Aceite:** cumprir a linha13do pacote e todos os critérios Pxx do levantamento; registrar data,build,resultados e limitações. Falha/serviço não ensaiado não recebe concluído.

### Execução G11 — P18

1. **Reutilizar/localizar:** os arquivos,componentes,Services,contratos e tabela do pacote G11 acima; catálogo e inventário têm links.
2. **Sequência:** Obter ambiente de homologação econômico autorizado → criar segredos no fornecedor sem publicá-los → configurar caminho mínimo do pacote → testar TLS/Origin/credencial/isolamento e falha → medir custo/recuperação/limites → registrar procedimento de operação e repetir em clone/restauração isolada. Não publicar só para demonstrar um passo deste documento.
3. **Validação executável:** `pnpm typecheck`; `pnpm lint`; `pnpm test`; `backend/demo/mvnw.cmd -f backend/demo/pom.xml verify`; E2E dos fluxos afetados.
4. **Aceite:** cumprir a linha13do pacote e todos os critérios Pxx do levantamento; registrar data,build,resultados e limitações. Falha/serviço não ensaiado não recebe concluído.

### Execução G12 — P19

1. **Reutilizar/localizar:** os arquivos,componentes,Services,contratos e tabela do pacote G12 acima; catálogo e inventário têm links.
2. **Sequência:** Obter ambiente de homologação econômico autorizado → criar segredos no fornecedor sem publicá-los → configurar caminho mínimo do pacote → testar TLS/Origin/credencial/isolamento e falha → medir custo/recuperação/limites → registrar procedimento de operação e repetir em clone/restauração isolada. Não publicar só para demonstrar um passo deste documento.
3. **Validação executável:** `pnpm typecheck`; `pnpm lint`; `pnpm test`; `backend/demo/mvnw.cmd -f backend/demo/pom.xml verify`; E2E dos fluxos afetados.
4. **Aceite:** cumprir a linha13do pacote e todos os critérios Pxx do levantamento; registrar data,build,resultados e limitações. Falha/serviço não ensaiado não recebe concluído.

### Execução G13 — P20, P22

1. **Reutilizar/localizar:** os arquivos,componentes,Services,contratos e tabela do pacote G13 acima; catálogo e inventário têm links.
2. **Sequência:** Obter ambiente de homologação econômico autorizado → criar segredos no fornecedor sem publicá-los → configurar caminho mínimo do pacote → testar TLS/Origin/credencial/isolamento e falha → medir custo/recuperação/limites → registrar procedimento de operação e repetir em clone/restauração isolada. Não publicar só para demonstrar um passo deste documento.
3. **Validação executável:** `pnpm typecheck`; `pnpm lint`; `pnpm test`; `backend/demo/mvnw.cmd -f backend/demo/pom.xml verify`; E2E dos fluxos afetados.
4. **Aceite:** cumprir a linha13do pacote e todos os critérios Pxx do levantamento; registrar data,build,resultados e limitações. Falha/serviço não ensaiado não recebe concluído.

### Execução G14 — P23, P24, P25, P38

1. **Reutilizar/localizar:** os arquivos,componentes,Services,contratos e tabela do pacote G14 acima; catálogo e inventário têm links.
2. **Sequência:** Obter decisões institucionais de finalidade/identidade/retenção/canais → registrar ADR e exemplos aceitos → desenhar contrato de estados/autoria sem coletar documento desnecessário → aprovar migração e processo → implementar UI/API → testar trilha e decisões negativas. Não remover APP_ENV production isoladamente.
3. **Validação executável:** `pnpm typecheck`; `pnpm lint`; `pnpm test`; `backend/demo/mvnw.cmd -f backend/demo/pom.xml verify`; E2E dos fluxos afetados.
4. **Aceite:** cumprir a linha13do pacote e todos os critérios Pxx do levantamento; registrar data,build,resultados e limitações. Falha/serviço não ensaiado não recebe concluído.

### Execução G15 — P26

1. **Reutilizar/localizar:** os arquivos,componentes,Services,contratos e tabela do pacote G15 acima; catálogo e inventário têm links.
2. **Sequência:** Responsável especializado confirma especificação/protocolo/conteúdo autorizado → lê manual de transferência e contratos existentes → prepara dados de avaliação/licença → implementa adaptador/catálogo sem quebrar portas → registra baixa confiança/falha/indisponibilidade → ensaia com hardware ou corpus conforme o pacote → obtém revisão responsável. Dev geral mantém regressões; esta consolidação não implementa esses módulos.
3. **Validação executável:** `pnpm typecheck`; `pnpm lint`; `pnpm test`; `backend/demo/mvnw.cmd -f backend/demo/pom.xml verify`; E2E dos fluxos afetados.
4. **Aceite:** cumprir a linha13do pacote e todos os critérios Pxx do levantamento; registrar data,build,resultados e limitações. Falha/serviço não ensaiado não recebe concluído.

### Execução G16 — P27, P28

1. **Reutilizar/localizar:** os arquivos,componentes,Services,contratos e tabela do pacote G16 acima; catálogo e inventário têm links.
2. **Sequência:** Responsável especializado confirma especificação/protocolo/conteúdo autorizado → lê manual de transferência e contratos existentes → prepara dados de avaliação/licença → implementa adaptador/catálogo sem quebrar portas → registra baixa confiança/falha/indisponibilidade → ensaia com hardware ou corpus conforme o pacote → obtém revisão responsável. Dev geral mantém regressões; esta consolidação não implementa esses módulos.
3. **Validação executável:** `pnpm typecheck`; `pnpm lint`; `pnpm test`; `backend/demo/mvnw.cmd -f backend/demo/pom.xml verify`; E2E dos fluxos afetados.
4. **Aceite:** cumprir a linha13do pacote e todos os critérios Pxx do levantamento; registrar data,build,resultados e limitações. Falha/serviço não ensaiado não recebe concluído.

### Execução G17 — P29, P30

1. **Reutilizar/localizar:** os arquivos,componentes,Services,contratos e tabela do pacote G17 acima; catálogo e inventário têm links.
2. **Sequência:** Responsável especializado confirma especificação/protocolo/conteúdo autorizado → lê manual de transferência e contratos existentes → prepara dados de avaliação/licença → implementa adaptador/catálogo sem quebrar portas → registra baixa confiança/falha/indisponibilidade → ensaia com hardware ou corpus conforme o pacote → obtém revisão responsável. Dev geral mantém regressões; esta consolidação não implementa esses módulos.
3. **Validação executável:** `pnpm typecheck`; `pnpm lint`; `pnpm test`; `backend/demo/mvnw.cmd -f backend/demo/pom.xml verify`; E2E dos fluxos afetados.
4. **Aceite:** cumprir a linha13do pacote e todos os critérios Pxx do levantamento; registrar data,build,resultados e limitações. Falha/serviço não ensaiado não recebe concluído.

### Execução G18 — P32

1. **Reutilizar/localizar:** os arquivos,componentes,Services,contratos e tabela do pacote G18 acima; catálogo e inventário têm links.
2. **Sequência:** Definir quem convida/recupera/desativa e como comprovar identidade → projetar convite de uso único/expiração e trilha → criar DTO/tabela futuros aprovados → integrar sessão/revogação e papel/unidade → testar conta desativada,convite expirado,outra unidade e recuperação. Não habilitar autoinscrição profissional irrestrita.
3. **Validação executável:** `pnpm typecheck`; `pnpm lint`; `pnpm test`; `backend/demo/mvnw.cmd -f backend/demo/pom.xml verify`; E2E dos fluxos afetados.
4. **Aceite:** cumprir a linha13do pacote e todos os critérios Pxx do levantamento; registrar data,build,resultados e limitações. Falha/serviço não ensaiado não recebe concluído.

### Execução G19 — P35, P39

1. **Reutilizar/localizar:** os arquivos,componentes,Services,contratos e tabela do pacote G19 acima; catálogo e inventário têm links.
2. **Sequência:** Confirmar se export completo e retificação entram no escopo → definir formato/período/limites e regra de supersessão → preservar original/autoria/motivo/versão → implementar contrato e migração coordenados → integrar formulário/tabela → testar >20 registros,concorrência e acesso cruzado. Resumo atual continua explicitamente limitado até isso.
3. **Validação executável:** `pnpm typecheck`; `pnpm lint`; `pnpm test`; `backend/demo/mvnw.cmd -f backend/demo/pom.xml verify`; E2E dos fluxos afetados.
4. **Aceite:** cumprir a linha13do pacote e todos os critérios Pxx do levantamento; registrar data,build,resultados e limitações. Falha/serviço não ensaiado não recebe concluído.

### Execução G20 — P33, P34, P36

1. **Reutilizar/localizar:** os arquivos,componentes,Services,contratos e tabela do pacote G20 acima; catálogo e inventário têm links.
2. **Sequência:** Obter decisão explícita de escopo de conector/chat → definir sistema/destinatário/SLA e contrato mínimo → manter unavailable sem fornecedor → implementar por adaptador aprovado e validação de falhas/duplicidade. Para português, refatorar por símbolo em lote pequeno,preservando paths/JSON/SQL e testes; não usar substituição global.
3. **Validação executável:** `pnpm typecheck`; `pnpm lint`; `pnpm test`; `backend/demo/mvnw.cmd -f backend/demo/pom.xml verify`; E2E dos fluxos afetados.
4. **Aceite:** cumprir a linha13do pacote e todos os critérios Pxx do levantamento; registrar data,build,resultados e limitações. Falha/serviço não ensaiado não recebe concluído.

### Execução G21 — P31

1. **Reutilizar/localizar:** os arquivos,componentes,Services,contratos e tabela do pacote G21 acima; catálogo e inventário têm links.
2. **Sequência:** Escolher uma referência e localizar captura/arquivo em FIDELIDADE_VISUAL → comparar no mesmo viewport/densidade → ajustar componente comum preservando fluxo real → rodar E2E responsivo e recapturar → inspecionar CSP/teclado/fonte grande → registrar diferença inevitável (segurança/autenticação/logo original) e obter aceite visual. Não declarar36idênticas sem comparação.
3. **Validação executável:** `pnpm exec playwright test tests/e2e/interface-responsiva.spec.ts`; `node infra/capturar-telas.mjs` com E2E_PASSWORD privada/SMSLOCAL; comparação via infra/comparar-telas.py conforme seu ambientePython.
4. **Aceite:** cumprir a linha13do pacote e todos os critérios Pxx do levantamento; registrar data,build,resultados e limitações. Falha/serviço não ensaiado não recebe concluído.


## G01/P01 — auditoria de privilégios JDBC

A role local é superusuária/BYPASSRLS. Preservá-la nesta tarefa de documentação, mas não replicar na hospedagem. Definir credencial de migração proprietária separada de runtime sem superusuário/BYPASSRLS/DDL; opções: configuração Flyway dedicada ou etapa controlada anterior ao start. Avaliar grants de tabelas/sequências, ownership e autorização Java antes de escolher. Criar testes de privilégios, migração em banco isolado e58 operações com negação cruzada; testar restore com ambas as funções. Não considerar P01fechado removendo somente APP_ENV production.
