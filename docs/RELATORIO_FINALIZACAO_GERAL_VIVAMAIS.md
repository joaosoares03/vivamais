# Finalização e retomada do Viva+ — 03/11/2026

APKs locais USB/rede entregues; download, instalação e teste manual geral no Samsung confirmados pelo proprietário em03/11/2026. Ensaios específicos de câmera/notificações/cache após reabertura ainda pendentes. Não representa liberação clínica/produtiva nem publicação nas lojas. Trabalho retomado no worktree `viva-mais-pr-1`, branch `codex/corrigir-pr-1`, base `0c564c54e6b43ddbd5499855925716d62ff2b5c4`. Main preservada. Pedidos integrais em `product/PEDIDO_FINALIZACAO_GERAL_2026-11-03.md`, `product/PEDIDO_RETOMADA_FINALIZACAO_2026-11-03.md` e `product/PEDIDO_INSTALACAO_MANUAL_ANDROID_2026-11-03.md`.

## O ponto interrompido e o que foi fechado

A interrupção ocorreu antes do aceite browser da exportação/retificação e da conclusão do Gradle Android. Foram preservados código, dados, alterações documentais anteriores, arquitetura Expo na raiz/Next em web/Java21 em backend/demo/PostgreSQL e todas as migrações antigas. A retomada concluiu o primeiro APK real, o reprodutor versionado, testes de acesso/offline/retificação/exportação, restauração V12 e capturas responsivas. Instalação e teste manual geral no Samsung foram confirmados pelo proprietário; os cenários nativos específicos continuam separados.

## Funcionalidades implementadas

- **Demonstração sem SMS:** endpoint separado `POST /api/v1/auth/paciente/demonstracao`, CPF/nascimento, unidade fictícia explicitamente escolhida, binding loopback e recusa de proxy/origem/ambiente indevido. V11 mantém a sessão demonstrativa separada; não ativa conta ou aparelho persistente. Flag desligada recusa essas sessões. Fluxo seguro por aparelho/SMS e login profissional preservados. Build público recusa login simplificado.
- **Datas:** componentes DD/MM/AAAA, validação civil/bissextos, data e hora separadas e conversão America/Sao_Paulo. Contratos mantêm ISO/instantes; o usuário não precisa digitar ISO ou selecionar fuso.
- **Consultas do paciente:** paginação real de objetivos/plano compartilhado; sem notas internas/motivo de retificação. Corrigido redirecionamento antes de terminar a restauração da sessão.
- **Offline:** leitura de caminhos permitidos, titular/TTL15min limitado pela sessão, limpeza na saída, SQLCipher no nativo e memória no navegador. 401/403 não viram cache. React Query agora chega ao fallback em vez de pausar antes dele. Fila/idempotência/reconexão existentes preservadas. Cache Metro separado por configuração/ambiente impede misturar builds seguro e demonstrativo.
- **Exportação completa:** oito categorias, todas as páginas, filtro civil de período, corte de criação, autoria e histórico de planos. Recusa truncamento/duplicação/corte alterado; limite explícito50mil. Fotos/credenciais não entram. Resumo limitado continua identificado separadamente.
- **Retificação textual:** V12/API/interface criam versões de anotações do diário/consulta com motivo/autor/horário e conflito409. Original preservado; triggers impedem update/delete/truncate das versões. Não altera pressão/pulso/ocorrência nem decide política de prontuário.
- **Interface:** barra inferior comum fora da rolagem, contraste/textos maiores, teclado e formulários. Corrigidos overflow no histórico de atividades, semana/paginação e corte dos nomes dos cartões da Home. Em tela estreita/fonte ampliada, cartões passam a uma coluna e a navegação se reorganiza em duas linhas para manter nomes e áreas de toque legíveis. Configurações demonstrativas não pedem nova ativação SMS.
- **Vídeos:** prévia serve MP4/GIF corretamente, range206/416 e HEAD, com verificação de bytes e caminho. Não representa ensaio de player nativo.
- **Instalação sem ADB:** conector opcional8083 somente no IPv4 privado escolhido e para o celular explicitamente autorizado. Valida Host/interface/porta/canal e recusa proxy. API principal8080 permanece loopback. Apenas saúde e download de um único APK aceitam navegação do navegador; login nativo continua separado. Sem diretórios, upload, arquivos clínicos ou disponibilidade em produção. Nenhum novo serviço pago ou túnel.

## Testes e evidências

| Verificação | Resultado observado |
| --- | --- |
| Java/PostgreSQL/OCR anterior |94 aprovados (30unitários+64integração),0falhas/erros/ignorados. POM preservado; a rede/download posteriores possuem regressão seletiva própria. |
| Java nesta continuação de instalação manual |41cenários distintos selecionados ao longo das rodadas:8unitários+33integração. Última seleção:13aprovados (8unitários+5integração),0falhas/erros/ignorados; inclui download autorizado, bytes/headers, isolamento e ausência da rota sem opt-in. Não somar repetições nem afirmar nova execução integral de94. |
| Frontend anterior |101 aprovados (43web+58app) na rodada registrada; após ajustes visuais, tipagem/lint/E2E específicos aprovados. |
| TypeScript/lint |Aprovados após os últimos ajustes da Home, histórico e navegação. |
| Next16.4.2 |Build otimizado aprovado, sem avisos de cache anteriores; fonte web preservada desde esse build. |
| E2E padrão |17 aprovados com API/PostgreSQL reais. Regressão específica de fila offline/OCR/refeição repetida depois do ajuste de rede e aprovada; não contada como teste distinto adicional. |
| Aceitação demonstrativa |Login sem SMS, isolamento403, navegação, data civil, offline/reconexão e logout/token401 aprovados. |
| Exportação/retificação browser |103consultas exportadas em duas páginas reais; filtro03/11, diário e consulta retificados, originais/números preservados e compartilhamento limitado ao paciente aprovados. |
| Acessibilidade320px |Novo cenário com fonte ampliada aprovado: controles dentro da tela, alvos>=48px e navegação reorganizada. |
| Rodadas conjuntas novas |3aprovados após diretório de downloads privado e API de rede. Na repetição depois do download dedicado:2aprovados e1interrompido por ECONNREFUSED no portal3000, que voltou a encerrar. O caso de exportação/retificação havia passado; a última repetição não é uma rodada verde. |
| Infraestrutura de vídeo |Teste Node real de MP4/ranges aprovado. |
| Backup/restauração V12 |APROVADO em banco exclusivo: envelope cifrado, migrações/checksums/contagens/RLS, chaves/objetos, login, isolamento e foto recuperada; original preservado. |
| Android |Compilação release e verificações de APK/assinatura/zipalign/ELF aprovadas. Proprietário confirmou download, instalação e teste manual geral no Samsung; sem automação nativa ou confirmação dos cenários específicos restantes. |
| Instalação de dependências |pnpm10.28.2, frozen lockfile e cache offline: aprovada, sem regravar o grafo. |
| Guardas do gerador APK |5entradas inválidas recusadas pela CLI real antes do build: IP público, wildcard, hostname, porta incorreta e IPv4 abreviado. |

Logs completos ficam privados em `../../work/finalizacao-*.log` e `.local/execucao/`. Evidências sanitizadas: [APK](evidencias/finalizacao-2026-11-03/apk-verificacao.json), [ELF](evidencias/finalizacao-2026-11-03/apk-elf.json), [restauração](evidencias/finalizacao-2026-11-03/backup-restauracao-v12.json), [portal](evidencias/finalizacao-2026-11-03/portal/auditoria-portal.json) e pastas de capturas. Não somar execuções repetidas como novos cenários.

[Resumo verificável das rodadas](evidencias/finalizacao-2026-11-03/resumo-verificacoes.json): nomes/quantidades das suítes finais, estado das auditorias, capturas e os dois APKs. Gitleaks aprovado nos textos alterados/novos, sem achados; recortes públicos do apksigner omitem fingerprints redundantes de chave pública que disparavam falsos positivos, preservando certificado/verificações. Logs brutos permanecem privados. `git diff --check` aprovado, stage preservado e V1–V10 sem alteração.

## Android instalável

Arquivo final de celular: `.local/instalaveis/VivaMais-DemoLocal-arm64.apk`, **101.700.565 bytes (aprox.97MiB)**, SHA256 `BB5716F989804737778822A3CD3077F548248719801401059AB6FFF066702520`. Nome **Viva+ Demo local**, pacote `org.vivamais.academicdemo.local`, versão0.1.0/build1, arm64-v8a, Android7/API24+, compile/target36. Inclui as últimas correções de texto ampliado da Home.

Release assinado com chave RSA3072 exclusiva de testes, fora do Git. Certificado SHA256 `1ca165284ac6d234517421a8b9c0d1077fa2a0599548bf310d9a007619175e93` conferido contra a chave local. ApksignerV2 e zipalign16KB passaram;25bibliotecas ELF do próprio APK passaram no alinhamento16KB. Isso verifica o artefato, não comprova instalação ou funcionamento em hardware.

`infra/Gerar-APK-Demonstracao.ps1` e `infra/preparar-entrada-android.cjs` reproduzem o build. SDK autorizado somente na pasta de trabalho, sem registro/variáveis globais/drivers. Gradle9.3.1 com checksum; Ninja1.13.2 oficial com checksum. Caches anteriores preservados. Corrigidos CMake/Ninja e caminhos absolutos longos: cache Gradle curto em `C:\Users\joaos\Documents\Codex\g`, raiz CMake em `...\c`, namespace por configuração e pasta de app abreviada. Reprodutor concluiu a compilação; APK original foi mantido durante as tentativas com falha.

[Instalação manual e USB](GUIA_PUBLICACAO_PLAY_STORE_APP_STORE.md). O APK **DemoLocal** anterior usa loopback e precisa de `adb reverse tcp:8080 tcp:8080`. Não confundir localhost do celular com o computador. Nenhum APK contém servidor/banco; usar somente conta APP fictícia da unidade configurada.

Para instalar e usar **sem ADB**, foi gerado separadamente `.local/instalaveis/VivaMais-DemoRede-arm64.apk`, **101.700.985bytes**, SHA256 `E248B0B2C76C8419274DEAF16363F006F51FECAB106286E4385DD54A068AD7CE`. Mesma versão/pacote/assinatura exclusiva de testes. Geração em03/11/2026,22:51 (São Paulo). Contém as mesmas correções da Home, além da URL do computador `http://192.168.0.8:8083` no bundle Hermes e política Android que restringe HTTP ao host escolhido. Assinatura, manifesto, zipalign e25ELF16KB aprovados; [prova de rede](evidencias/finalizacao-2026-11-03/apk-rede-verificacao.json). O original USB não foi recompilado nem substituído.

Download previsto no Samsung autorizado: `http://192.168.0.8:8083/demonstracao/vivamais.apk`. Alternativa: transferir o mesmo arquivo para Downloads por MTP/Bluetooth e abrir Meus Arquivos. [Passo a passo](GUIA_PUBLICACAO_PLAY_STORE_APP_STORE.md#instalar-manualmente-no-samsung-sem-adb). Além das verificações do artefato, o proprietário confirmou download, instalação e teste geral no Samsung após executar a API fora da sandbox. Essa confirmação manual não equivale a ensaio automatizado de todos os recursos nativos.

O computador está cabeado192.168.0.8 e o Samsung no Wi-Fi192.168.0.5. O proprietário executou a regra de firewall restrita após consentimento UAC; a repetição encontrou erro, sem sobrescrever a regra. A comunicação ainda ficou carregando no telefone. A API respondeu no PC, com8080somente loopback e8083somente no endereço privado; outro cliente recebeu403 e download loopback404. A mesma API foi iniciada pelo proprietário em PowerShell normal e o acesso passou a funcionar; ele confirmou que instalou e testou o aplicativo. A solução observada foi manter a API fora da sandbox e a regra restrita. Não atribuir defeito ao driver/cabo nem ampliar o acesso. Consulta somente leitura posterior encontrou4novas sessões demonstrativas e2registros manuais de pressão criados por pacientes desde esse início externo; as contagens foram registradas sem identificadores ou valores clínicos.

O proprietário conectou/aceitou USB, mas ADB37.0.1 dentro **e fora** da sandbox reportou zero aparelhos físicos, inclusive zero aguardando autorização. Não diagnosticar driver/cabo sem identificar o aparelho. Modelo/Android foram solicitados para orientação oficial; consulta PnP/CIM pelo Codex não foi permitida. Nenhum driver global foi instalado.

Foi gerado também `.local/instalaveis/VivaMais-DemoLocal-x86_64.apk`, 102.489.698 bytes, SHA256 `65465775936FC48F74EA7C7BF70E8508FE2BB7E1ED12F03B706487E9DA9DBDAF`, exclusivamente para emulador x86_64. A imagem AOSP36 e o AVD foram instalados na pasta de trabalho. A tentativa sem aceleração chegou a `emulator-5554 offline`, sem boot completo ou shell; foi encerrada sem instalar APK. Isso não comprova problema específico no Windows global nem funcionamento nativo. O APK arm64 foi preservado separadamente.

## Segurança e banco

OWASP12.2.2 executado pelo proprietário fora da sandbox, em03/11: atualização NVD e análise concluídas,42dependências/nenhum alerta reportado, CVSS7 e failOnError mantidos. Artefatos privados JSON/HTML conferidos. Sonatype OSS Index não foi analisado por ausência de credenciais. Não houve mudança no POM para justificar repetir a auditoria aprovada.

pnpm high passou (exit0),0altos/0críticos, **5moderados+1baixo** ainda reportados: minimatch em quatro cadeias, glob e deepmerge. Não foram adicionados ignores/suppressions. As correções major indicadas precisam de atualização compatível dos consumidores; não forçar substituição global de API antiga. Ver [registro de segurança](DEPENDENCIAS_SEGURANCA.md).

Banco sintético revisado:12migrações aplicadas com sucesso,34tabelas de aplicação e34com RLS. Snapshot OpenAPI:49paths/63operações/41schemas, contratos regenerados. Role local superusuária/BYPASSRLS continua bloqueio de uso real; RLS não substitui a autorização na API. Nenhum dado principal/chave/migração antiga apagado.

## Auditoria visual

38arquivos de tela Expo (incluindo aliases/estados) e11páginas Next; isso não é uma contagem de funcionalidades aceitas.25rotas de paciente percorridas a390px e também320/430; ensaio adicional320com fonte ampliada.25capturas do portal em1440/768/390 e páginas públicas. Portal:25cenas verificadas quanto a excesso horizontal;21cenas possuem também verificações de campos/imagens. Nessas verificações:0excessos,0campos sem nome e0imagens quebradas. Não extrapolar critérios ausentes nas quatro cenas públicas.

As capturas iniciais identificaram overflow do histórico, sobreposição dos rótulos inferiores e corte de nomes na Home com fonte ampliada. As correções passaram no E2E320; a recaptura final de 25 rotas está em [fonte ampliada320](evidencias/finalizacao-2026-11-03/fonte-ampliada-320-final/auditoria-app.json), sem excesso horizontal ou redirecionamento nesse percurso. Home e histórico finais também foram inspecionados visualmente. A inspeção cobre configurações/ficha/home comparadas com as referências fornecidas; não alegar identidade pixel a pixel dos36protótipos. Cores mais escuras para contraste, textos maiores e reorganização em fonte ampliada são diferenças intencionais de acessibilidade. Capturas web não são apresentadas como fotos de Android/iOS.

## iOS, lojas e infraestrutura

Bundle provisório seguro `org.vivamais.academicdemo`, demo `.local`, versão0.1.0/build1, permissões/ícone/splash e perfis EAS preparados. Usuário confirmou ausência de contas Expo/EAS e Apple Developer; não perguntar novamente. Pré-build iOS foi recusado neste Windows. **IPA/AAB público não gerados, nenhum upload/TestFlight/submissão/aprovação de loja.**

[Guia Play/AppStore](GUIA_PUBLICACAO_PLAY_STORE_APP_STORE.md) e [rascunhos de materiais/privacidade](lojas/MATERIAIS_PUBLICACAO.md) incluem descrições, identidade, revisão, requisitos API36/Xcode26 e passos para contas/assinaturas. Capturas nativas/promocionais finais e respostas institucionais das lojas dependem dos ensaios/decisões descritos; não inventar suporte, certificação, contato ou aprovação jurídica.

Infraestrutura econômica Vercel/Railway/Supabase/EAS preservada e preços principais reconferidos em03/11. Sem contratação/deploy. Demonstração pública precisa HTTPS e acesso seguro: login apenas por CPF/nascimento permanece restrito ao local. Produção continua bloqueada até governança/modelo/credencial runtime/privacidade aprovados. SMS real, IA, CPF oficial e pulseira dependem dos provedores/protocolo/credenciais e validações próprias; nunca apresentar estados simulados como conclusão.

## Git e próxima continuidade

PR#1 confirmado aberto/não mesclado: head0c564c5 no fork LucasBS-Dev/main e basec1b597a. CI verde histórico pertence àquele head, não às alterações locais atuais. Nenhum commit/push/merge/deploy realizado nesta retomada. Código e evidências atuais ainda devem ser revisados/versionados no destino autorizado; APK/chaves/cache/banco permanecem fora do Git.

Manuais, README, PROGRESSO, STATUS, próxima execução, inventário, pendências, plano e guias foram atualizados. O [manifesto real](evidencias/finalizacao-2026-11-03/arquivos-alterados.txt) inclui alterações anteriores e novas/capturas. Os17arquivos citados no pedido eram um recorte da última etapa; git status do worktree contém um conjunto maior, integralmente preservado. Estado final:66arquivos rastreados alterados e248novos (incluindo187imagens de evidência),314arquivos no manifesto. Stage não foi alterado. Main continua limpa emc1b597a e PR#1 aberto/não mesclado em0c564c5, conferidos nesta retomada. Sem commit/push.

Próximo: testar especificamente câmera/notificações/SecureStore/SQLCipher/reabertura e sincronização nativa; fechar repetição do portal quando3000permanecer ativo. Instalação/teste geral já foram confirmados; não pedir para refazer essa etapa sem necessidade. O portal respondeu e aprovou a rodada anterior, mas a última sondagem retornou ECONNREFUSED. A revisão automática rejeitou iniciar o Next e preparar helper pelo Codex; não foi contornada. Não reimplementar módulos concluídos nem repetir auditorias aprovadas sem mudança pertinente.
