# Retomada: login, medicamentos, convites e Expo —04/11/2026

Pedidos integrais: [medicamentos/grupo](../product/PEDIDO_MEDICAMENTOS_E_GRUPO_2026-11-03.md) e [retomada remota pelo iPhone](../product/PEDIDO_RETOMADA_REMOTA_EXPO_2026-11-04.md). Continuação do mesmo checkout, sem recriar o produto, banco, repositório ou fases.

## Resultado implementado

Cadastro demonstrativo retorna habilitação real sem SMS; UI de confirmação simples e acesso CPF/nascimento apenas no ambiente local. Agenda/histórico/versionamento/dosagem/autorrelatos/concorrência estão na API e PostgreSQL; app utiliza a fila e o progresso persistido. Portal exibe histórico com autoria. Convites privados têm emissão, troca inicial, renovação, revogação e UI integrada. Detalhes em [medicamentos e convites](../MEDICAMENTOS_E_CONVITES.md).

Preparados `expo-dev-client`, `expo-updates`, identificadores separados, build2, perfis para aparelho iOS/Android/TestFlight e fingerprint/canais de atualização. Criados modelos de homologação, preparação de contas por APIs e guias de distribuição. Nenhuma conta, assinatura iOS, hospedagem ou atualização remota foi criada/publicada.

## Verificações

| Verificação | Evidência e resultado |
| --- | --- |
| Java completo com PostgreSQL real | **116 aprovados:38 unitários+78 integrações;0 falhas/erros/ignorados**, execução concluída01:03 de 04/11 pelo proprietário fora da sandbox. `work/grupo-java-completo.log` e `work/grupo-api-build`. Backend não alterado depois desse aceite. Não foi solicitada nova repetição. |
| Frontend integral antes da interrupção | **45 portal+72 app aprovados**, `work/grupo-frontend-completo.log`. |
| Últimos ajustes de medicamentos/lembretes/convites/configuração | **19 testes seletivos aprovados**, incluindo novo resumo do dia seguinte. São subconjunto/regressões, não19testes somados à suíte integral. |
| BFF de agenda/convites | **4novos testes aprovados**: whitelist, sessão, CSRF, no-store e rotas administrativas. |
| Confirmação de cadastro demonstrativo | **1 teste novo aprovado**, com resposta de contrato controlada: habilitação recebida do servidor, nenhuma emissão/consulta de SMS, três ações e novo formulário limpo. É teste de componente, não substitui o E2E integrado pendente. |
| Infra de acesso remoto | **2 testes aprovados** de rejeição de API local/insegura e validação de homologação sem vazar segredos. |
| E2E de interface disponível | **3 aprovados**, Chromium real: acesso demo sem SMS, redirecionamento de rotas antigas, 320/390/430 sem excesso horizontal, portal profissional e convite privado com recusa de formato inválido. `work/grupo-acesso-interface.log` e `work/grupo-convite-interface.log`. |
| E2E novo completo de cadastro/doses/calendário/offline/autoria | Implementado em `tests/grupo/medicamentos-demonstracao.spec.ts`; não executado com a API atual nesta retomada, pois o banco não pôde ser iniciado. Não contabilizado como aprovado. |
| TypeScript e lint | App/web aprovados; lint integral final exit0. Contratos regenerados a partir de `backend/demo/target/openapi.json`, gerado pelo teste Java real:54 caminhos, incluindo agenda e convites. |
| Next.js | Build otimizado aprovado; inicializador padrão autorizado nesta retomada, Ready em 3000. Sem API disponível, não comprova login/cadastro integrado corrente. |
| Expo/Hermes | Exportação Android/iOS/web aprovada após TEMP/TMP graváveis. Hermes mantido. Reprodutor `infra/exportar-expo.mjs` registra tamanho/hash por bundle; exportações de validação usam API local e não são instaladores remotos. |
| Geração da estrutura iOS | Tentativa local isolada em `.local/ios-preparacao`, sem instalar dependências: CLI Expo recusou geração no Windows e exige macOS/Linux. Fonte preservado; não alterado o SDK/guard da ferramenta. Perfis/plugins e bundles iOS preparados, mas nenhum projeto Xcode gerado localmente ou IPA compilado. Log privado `work/grupo-ios-preparacao.log`. |
| Auditoria Node | `pnpm audit --audit-level high` exit0:0 altos/críticos,5 moderados e1 baixo restantes. JSON de diagnóstico privado em work. Nenhuma supressão do limiar. |
| Auditoria Java | Dependências Java não mudaram nesta entrega. Preservada evidência OWASP anterior:42 dependências/nenhum alerta; OSS Index sem credenciais não coberto. Não alegar nova execução. |
| Segredos | Gitleaks final das fontes/configurações versionáveis, incluindo novos não commitados: exit0, nenhum vazamento. Banco, chaves e arquivos privados excluídos da cópia de auditoria; relatório privado em `work/grupo-gitleaks-final.json`. |

## Android0.2.0 real

Arquivo local: `.local/instalaveis/VivaMais-DemoRede-0.2.0-build2-arm64.apk`.

- 105.459.842bytes; SHA256 `0B566FC44F7E02DA920D40A3ECE5602681965DC6DC344946C7457B2D4EC70461`.
- `org.vivamais.academicdemo.local`, versionName 0.2.0/versionCode 2, arm64, minSDK 24/targetSDK 36.
- Assinatura v2 verificada, certificado RSA 3072 **igual ao APK 0.1.0 anterior**. Pode ser candidato à atualização por cima da instalação correspondente, sem troca de assinatura. Não foi instalado/testado fisicamente nesta retomada.
- Zipalign 16 KB aprovado e26bibliotecas ELF arm64 compatíveis com alinhamento 16 KB. [Detalhes ELF](medicamentos-grupo-2026-11-04/apk-020-elf.json).
- Configuração compilada de rede: cleartext bloqueado por padrão; permitido somente para192.168.0.8, sem subdomínios, pelo recurso XML associado ao manifesto. API configurada em `http://192.168.0.8:8083`. Esse APK é local, não o instalador remoto do grupo.
- A primeira compilação esgotou Metaspace 512 MB no lint nativo. A repetição usou 1024 MB e um worker, preservou caches/Hermes/SQLCipher/lint e concluiu em 2 min 44 s,918 tarefas (855 reutilizadas). Os APKs anteriores foram preservados.

## Capturas reais desta retomada

- [Acesso demo320](medicamentos-grupo-2026-11-04/acesso-demonstrativo-320.png), [390](medicamentos-grupo-2026-11-04/acesso-demonstrativo-390.png), [430](medicamentos-grupo-2026-11-04/acesso-demonstrativo-430.png).
- [Portal profissional](medicamentos-grupo-2026-11-04/portal-acesso-profissional-atual.png).
- [Convite privado do grupo](medicamentos-grupo-2026-11-04/app-convite-privado-390.png), sem convite ativo ou token exposto.

Foram inspecionadas visualmente; a captura 320 mostra apenas CPF/nascimento/ENTRAR, sem corte horizontal. Não são capturas de medicamento persistido ou de iPhone físico. O ensaio completo preparado gerará as capturas de cadastro, agenda, calendário, fila e autoria quando a API puder funcionar; nenhuma resposta falsa foi injetada para produzir evidência.

## Serviços e bloqueios atuais

Diretório e Git acessíveis. O cluster PostgreSQL 17 existente foi encontrado parado (`pg_ctl status`3). A tentativa normal de iniciar o mesmo cluster falhou **antes da inicialização do banco**, ao vincular IPv6/127.0.0.1: Permission denied. A permissão de rede já foi concedida; não se tentou contornar a restrição, trocar autenticação do banco, apagar PID/dados ou criar outro banco paralelo. A API 8080 foi confirmada indisponível pelo navegador, com conexão recusada. V13/V14 foram ensaiadas no banco de testes; sua aplicação no banco principal da demonstração continua pendente de inicialização autorizada.

O comando padrão existente do portal foi permitido nesta retomada, sem helper alternativo ou elevação: Next ativo em 3000. Prévias Expo web em 8082 (demonstração) e 8084 (convites), restritas a loopback. Metro/túnel não foi aberto porque faltam API HTTPS de homologação e Development Build iOS instalada; não há QR ou link remoto funcional para o proprietário fora de casa.

Não foi solicitado PowerShell, reinício manual, cópia de logs ou senha ao proprietário nesta retomada. A inicialização futura do cluster/API em ambiente autorizado, com preservação das chaves/dados e aplicação das migrações aditivas, permitirá executar o E2E completo e fechar as capturas pendentes. Enquanto isso, código, testes sem banco, builds e preparação de distribuição avançaram.

## Git e próxima tarefa

Branch `codex/corrigir-pr-1`, base `0c564c54e6b43ddbd5499855925716d62ff2b5c4`. Alterações anteriores e novas preservadas, sem stage/commit/push/merge/deploy. O checkout original `outputs/viva-mais` permanece limpo. O CI remoto histórico não valida estas alterações ainda não publicadas.

Arquivos principais: app.config.ts/eas.json/metro.config.js; ContextoAutenticacao; telas de acesso/convite/medicamentos/Configurações/Home; hooks e serviços de doses/fila/lembretes/renovação; CadastroPaciente/AtivacaoPaciente/AgendaMedicamentos/ConvitesTestadores e BFF; serviços Java/DTOs/repositório/segurança; migrações V13/V14; contratos; testes e scripts de exportação/compilação/homologação. O [estado completo do Git](medicamentos-grupo-2026-11-04/estado-git.json) inclui alterações anteriores preservadas; não é uma lista exclusiva desta retomada. [Metadados/hashes conferidos](medicamentos-grupo-2026-11-04/verificacao-entrega.json).

Primeiro passo pendente: disponibilizar PostgreSQL/API pelo mecanismo autorizado do ambiente e executar somente o ensaio completo novo de medicamentos/cadastro, com portal/prévia já disponíveis. Não repetir os 116 Java sem mudança Java/SQL. Em paralelo, o proprietário poderá configurar Expo/Apple e autorizar a hospedagem quando desejar; não há requisito de intervenção manual agora. [Guias para o grupo](../GUIA_DISTRIBUICAO_TESTES_GRUPO.md) e [acesso pelo iPhone](../GUIA_EXPO_ACESSO_REMOTO_CELULAR.md).
