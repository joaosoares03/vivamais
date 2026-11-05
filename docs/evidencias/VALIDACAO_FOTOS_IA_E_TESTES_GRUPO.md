# Fotografias, IA alimentar e testes do grupo

Atualização em andamento em 04/11/2026. **A homologação ainda atende a versão anterior cd1c24d até o envio e deploy desta correção.** Os resultados abaixo distinguem código local e implantação.

## Causa e correção das fotos

O seletor recusava `fileSize > 2097152` antes do upload. O Spring aceitava 2 MB, e o sanitizador regravava PNG sem redução; imagens válidas podiam ultrapassar o limite novamente após a decodificação. O parâmetro `quality` do ImagePicker não comprime no navegador. O fluxo agora prepara os pixels explicitamente.

- Original: até **10 MiB**, dimensões até 12.000 por lado e 50 milhões de pixels. JPEG/PNG com conteúdo válido; HEIC/HEIF apenas quando o decodificador do aparelho/navegador permite converter.
- Web: seletor aberto diretamente pelo gesto, assinatura do arquivo verificada antes da decodificação; orientação pelo navegador, canvas proporcional até 2048 pixels no maior lado, JPEG e redução progressiva com orçamento de 1800 KiB.
- Nativo: Expo SDK 57 ImageManipulator e FileSystem, redimensionamento proporcional e JPEG em arquivo temporário; limpeza da prévia ao remover, substituir ou sair. Exige novo build nativo, não altera um APK instalado anteriormente.
- Servidor: valida conteúdo independentemente do nome/MIME, amostra pixels antes da decodificação completa, lê orientação EXIF de JPEG, regrava PNG sem EXIF/GPS e reduz até **2 MiB armazenados**. Não se guardam arquivos originais ou metadados. Um processador concorrente por instância limita memória.
- Multipart API: 10 MiB por arquivo, 11 MiB por requisição. O portal envia a versão já preparada, abaixo de seu proxy limitado a 3 MiB.
- Storage permanece privado, com AES-GCM e objetos `application/octet-stream`; limite do bucket de 3 MiB e contrato PNG de 2 MiB foram preservados. Não há alteração das migrações V1–V14.
- Prévia, remover/substituir, observação, confirmação explícita e carregamento. Falha após upload conserva o identificador e permite repetir o registro; `file_id` único torna o registro da refeição idempotente. Se a resposta do próprio upload se perder, o cliente pode não conhecer seu identificador; não se promete deduplicação desse caso.

## IA: integração existente, inativa

Consulta ao banco de homologação confirmou **zero `food_analysis_attempt`**. `FOOD_ANALYSIS_ENABLED=false`; o inicializador da homologação exige esse valor. Nenhum provedor pago foi contratado ou ativado.

Existem a porta `ProvedorAnaliseAlimentacao`, o adaptador HTTP `ProvedorAnaliseAlimentacaoHttp`, o serviço `ArquivoPrivadoService.analisarAlimentacao`, as tabelas `meal_photo`/`food_analysis_attempt` e o contrato `FOOD_EDUCATIONAL_CONTRACT_V1`. O adaptador exige HTTPS, chave de servidor, provedor/modelo/critérios versionados, referência de aprovação e resposta com política `X-Viva-Data-Policy: no-training`. Não há um provedor comercial escolhido ou verificado como compatível com esse contrato.

Endpoints autenticados: `GET /api/v1/food/status`, `POST /api/v1/meals/{id}/analyze`, `GET /api/v1/patients/{id}/meals`, `GET /api/v1/refeicoes/{id}`. A interface consulta a disponibilidade real e mostra **Análise não habilitada**. O botão de análise fica desabilitado nesse estado; salvar uma foto não gera avaliação.

O processamento opcional é síncrono, não uma fila. Quando autorizado/configurado, o pedido mostra “Em processamento” enquanto aguarda a resposta; sucesso validado é persistido e pode ser reaproveitado por versão. Há orçamento de cinco chamadas por dia e duas tentativas por refeição. Falha é registrada e não gera semáforo fictício. Não se exibem estados de fila inexistentes.

O contrato permite alimentos identificados e orientação educativa limitada, sujeita a incerteza e revisão humana. Rejeita campos inesperados e inferências numéricas de sódio, gordura, calorias ou pressão. Não constitui diagnóstico ou prescrição. OCR Tesseract do visor é outro módulo e exige confirmação; não é análise alimentar.

Para habilitar IA: escolher e aprovar provedor/contrato, privacidade/retenção e custo; aprovar critérios institucionais e versões; configurar segredos apenas no backend; adaptar o inicializador conscientemente; executar ensaio externo com imagens sintéticas, falhas, orçamento e revisão clínica. Esses requisitos continuam pendentes. As respostas de fornecedores em testes unitários são fixtures, nunca resultados clínicos reais.

## Grupo

V15 adiciona `integrante_grupo_teste`, com RLS e revogação de privilégios de PUBLIC/anon/authenticated. Gestão exclusiva de ADMIN da unidade fictícia configurada; não concede administração a convidados. Tokens aleatórios de uso único são armazenados somente como hash. Convite profissional permite senha individual BCrypt e login normal; validade/desativação são verificadas também na autorização central de sessões existentes. Reemissão revoga sessões e a senha anterior deixa de autenticar até nova ativação. Pacientes preservam convite/cookie seguro/renovação rotativa existentes, acrescidos do bloqueio do integrante.

Novas contas recebem pacientes exclusivos e fixtures explicitamente fictícias por APIs/serviços reais, inclusive ilustração gerada por código e armazenamento cifrado. Profissional só lê os pacientes vinculados; a atribuição opcional de um paciente a um profissional é explícita. Não há envio automático de mensagens.

Guia para participantes: [GUIA_TESTES_GRUPO_VIVAMAIS.md](../GUIA_TESTES_GRUPO_VIVAMAIS.md). Rotas de gestão: `/grupo-testes` no portal e `/api/v1/grupo-testes` na API; ativação profissional em `/convite-profissional#segredo`, retirado da URL antes da requisição. Links privados só são exibidos na emissão e não entram em evidências.

## Testes já executados nesta alteração

- 11 testes Java iniciais: otimização/limites/orientação, OCR e contrato de provedor alimentar, todos aprovados.
- 8 integrações com PostgreSQL real em schema exclusivo: migrations V1–V15, sessões de paciente, novo profissional, uso único, reemissão, desativação, expiração, isolamento, dados fictícios e IA desabilitada. Aprovadas; schema removido e ausência confirmada. Banco principal continuou em V14.
- Aplicativo: 76 testes aprovados. Portal: 55 testes aprovados, incluindo ativação e proteção CSRF/stream do novo BFF. TypeScript app/portal e lint dos componentes alterados passaram.
- Processamento real em Chromium: PNG sintético de 8.671.131 bytes → JPEG de 1.675.123; JPEG de 7.358.235 → 1.675.913; original de 10.485.760 → 1.675.913. Proporções preservadas. SVG disfarçado, excesso de bytes e JPEG corrompido rejeitados. Não é ensaio de câmera física.
- Exportação Expo web de homologação e bundles Android/iOS/web passaram. Não equivalem a APK/IPA novos ou ensaio em aparelhos.
- Next build passou após preparar os diretórios gerados na sandbox; a primeira tentativa falhou em `mkdir .next`, sem erro de código.

Regressão confirmada adicionalmente: 51 unitários Java aprovados; rodada final de 10 integrações PostgreSQL e 5 testes de imagem aprovada por XML fresco, schema removido e ausência confirmada. Contratos atualizados e TypeScript aprovados. Auditoria npm: 1 baixa e 3 moderadas, nenhuma alta/crítica. O primeiro script externo foi reforçado para aguardar o Maven e validar XML/horário; uma tentativa posterior no schema já consumido não foi contada como aprovação.

Em execução: revisão/scan, commit autorizado, publicação e testes HTTPS completos de fotos/grupo. Nenhuma aprovação física de iPhone/Android declarada para esta versão. O print original é evidência da falha anterior, não da correção.

## Git e implantação

Originais preservados em `outputs/viva-mais-pr-1`, branch `codex/corrigir-pr-1`, HEAD 0c564c5, stage vazio. A revisão/publicação ocorre no worktree existente `work/viva-mais-nuvem-publicacao`, branch autorizada `codex/homologacao-nuvem-20261104`, base 06359a1. PR #1 continua aberto, sem merge, head 0c564c5; não é a branch de homologação.

Usam-se os mesmos Railway, Supabase e Vercel, sem novas contas, recursos pagos ou produção. Estado final dos deploys e ensaios remotos será registrado após a atualização efetiva.
