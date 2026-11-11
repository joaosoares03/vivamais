# Fotografias, IA alimentar e testes do grupo — validação final

Concluído em 05/11/2026 no ambiente acadêmico de homologação. Fonte implantada: `6a807978b96807d2059d7862016a3abd98590186`, branch `codex/homologacao-nuvem-20261104`.

- [Viva+ Paciente](https://viva-api-paciente-homologacao.up.railway.app/convite)
- [Viva+ Profissional](https://vivamais-portal-viva-mais3.vercel.app)
- [Guia do grupo](../GUIA_TESTES_GRUPO_VIVAMAIS.md)
- [Comprovantes e capturas](fotos-grupo/README.md)

## Fotografias

O seletor rejeitava arquivos maiores que 2 MiB antes do envio; no navegador, o parâmetro de qualidade do ImagePicker não fazia a compressão esperada. O Spring também limitava o original a 2 MiB, e a regravação PNG podia ultrapassar o limite novamente.

Agora o paciente escolhe/captura, confere a prévia, pode substituir/remover, informa observação opcional e toca em **Salvar refeição**. O preparo ocorre automaticamente, antes do upload. Falhas de conexão conservam a seleção. Se só o registro da refeição falhar, a tentativa seguinte reaproveita o upload; a associação é idempotente por arquivo. Se a resposta do próprio upload se perder, seu identificador pode não ser conhecido pelo cliente; não se promete deduplicação desse caso.

| Etapa | Limite e tratamento |
| --- | --- |
| Original | 10 MiB, até 12.000 por lado e 50 milhões de pixels |
| Cliente web | Assinatura verificada, orientação pelo navegador, canvas proporcional até 2048 no maior lado, JPEG com orçamento de 1800 KiB |
| Cliente nativo | Expo SDK 57 ImageManipulator/FileSystem; redução e JPEG; exige novo build com os módulos |
| API | 10 MiB por arquivo/11 MiB por requisição; conteúdo JPEG/PNG validado sem confiar em nome/MIME |
| Servidor | Amostragem antes da decodificação completa, orientação EXIF JPEG, PNG novo sem EXIF/GPS, redução até 2 MiB |
| Storage | AES-GCM, bucket privado, octet-stream; limite existente de 3 MiB preservado |
| Download | Grant de 60 segundos, sessão e escopo verificados novamente a cada leitura |

JPEG e PNG foram ensaiados. HEIC/HEIF só é convertido quando o aparelho/navegador consegue decodificá-lo; o servidor não aceita HEIC bruto. Não houve ensaio de um HEIC real ou de câmera física nesta execução. A alternativa compreensível para formato não decodificado é tirar outra foto pelo aparelho ou selecionar JPEG/PNG, sem exigir compressão manual dos arquivos aceitos.

**Ensaio real na Railway/Supabase:** PNG sintético de **8.671.131 bytes** foi reduzido para **1.120.898 bytes**, persistido, recuperado como PNG e consultado pelo profissional vinculado. Nome `conteudo-sem-extensao.bin` e MIME octet-stream não impediram reconhecer o conteúdo válido. SVG disfarçado de PNG foi recusado.

No processamento real em Chromium, PNG de 8.671.131 e JPEG de 7.358.235 bytes foram preparados em aproximadamente 1,67 MB; original de 10.485.760 bytes também foi aceito. Excesso de bytes, SVG disfarçado e JPEG corrompido foram rejeitados. O servidor mantém o limite final, independentemente do cliente.

O E2E confirmou ausência de upload antes da confirmação, prévia enquadrada, remoção, troca da foto, erro de transporte, nova tentativa, reaproveitamento do arquivo quando o registro falha, confirmação e histórico após recarregar. Falhas foram injetadas somente no transporte; a aprovação exigiu o envio posterior ao backend e ao Storage reais.

## IA alimentar

**Classificação: integração parcial; na homologação, somente armazenamento de fotos e registro manual estão ativos. A análise alimentar continua desabilitada.** Consulta final ao banco: zero `food_analysis_attempt`. O teste HTTPS confirmou `enabled=false`, `status=DISABLED`; solicitar análise devolveu `UNAVAILABLE` e `providerCalled=false`. Salvar uma foto não a classifica.

A interface informa **Análise não habilitada** e desabilita o botão de análise. Não foram fabricados alimentos, nutrientes, semáforos, diagnósticos ou recomendações.

Existem a porta `ProvedorAnaliseAlimentacao`, o adaptador `ProvedorAnaliseAlimentacaoHttp`, o contrato `FOOD_EDUCATIONAL_CONTRACT_V1`, orçamento persistido, rastreabilidade e persistência de sucesso/falha. O processamento opcional é síncrono; não há fila cuja espera deva ser simulada. Nenhum fornecedor comercial foi escolhido/ensaiado como compatível.

Endpoints autenticados: `GET /api/v1/food/status`, `POST /api/v1/meals/{id}/analyze`, listagem de refeições e `GET /api/v1/refeicoes/{id}`. O adaptador exige HTTPS, chave de servidor, fornecedor/modelo/critérios versionados, aprovação e política `X-Viva-Data-Policy: no-training`. Tem orçamento de cinco chamadas/dia e duas tentativas/refeição, valida campos/versões e rejeita inferências numéricas indevidas. Respostas de teste de fornecedor são fixtures, não análise externa real.

Pendentes: seleção/autorização do fornecedor e custo, privacidade/retenção, credenciais, critérios institucionais e validação clínica/externa. O inicializador atual impede ativação inadvertida. [Configuração e limites](../IA_ALIMENTAR_ESTADO_E_HABILITACAO.md).

OCR Tesseract de visor é outro serviço: o ensaio remoto o executou e obteve **UNREADABLE**, com confirmação humana obrigatória; nenhuma medição foi salva automaticamente.

## Grupo e permissões

Gestão em `/grupo-testes`, exclusiva de ADMIN da unidade fictícia autorizada. Cria paciente ou profissional, apelido fictício, validade de 1/3/7 dias, convite individual, status, reemissão e desativação. Não envia SMS/e-mail. Profissionais não recebem administração e só consultam pacientes vinculados.

Profissional abre `/convite-profissional#segredo`, define senha individual BCrypt, recebe identificador fictício e entra no portal normal. O fragmento é retirado antes da requisição. Convites aleatórios são de uso único e armazenados como hash; validade/desativação são verificadas também nas sessões existentes. Reemissão encerra acessos anteriores e exige nova ativação.

Pacientes preservam o convite forte, cookie seguro HttpOnly/SameSite e renovação rotativa. Desativar bloqueia sessão, renovação e download por grants já emitidos. CPF/nascimento público permanece desabilitado.

V15 adicionou `integrante_grupo_teste`, com RLS e privilégios de PUBLIC/anon/authenticated revogados. V1–V14 foram preservadas. Novas contas recebem pacientes próprios e dados explicitamente fictícios: pressão, medicamento de exemplo, refeição ilustrada sem foto pessoal, atividade, consulta e diário. A ilustração também passa pelo serviço e armazenamento reais.

A conferência visual revelou que contas de teste revogadas caíam na indicação antiga de SMS. Corrigido com identidade da unidade separada da elegibilidade de autenticação, estado **TESTE_DESATIVADO**, orientação ao administrador e recusa de SMS mantida mesmo após desativação.

O preparo completo da conta leva mais de dez segundos na infraestrutura econômica. O BFF passou a aguardar até 60 segundos somente nesse POST; consultas comuns continuam em 10 segundos. O limite da função foi definido em 90 segundos, sem contratar plano adicional. Dois testes de resposta lenta cobrem essa diferença.

## Regressão de medicamentos

O ensaio noturno identificou que editar o início para amanhã podia remover horários anteriores à nova vigência: o leitor usava apenas o instante da alteração como término da versão antiga.

O leitor agora considera o início declarado e a alteração, e resolve revisões futuras substituídas por versões mais recentes. Planos, relatos e snapshots persistidos não foram alterados. Teste PostgreSQL determinístico confirma horários de amanhã preservados quando a mudança vale só depois de amanhã e ausência de duplicação após outra revisão. O ensaio HTTPS confirmou uma tomada e uma não tomada anteriores preservadas, e a agenda futura atualizada.

## Resultados

| Verificação | Resultado |
| --- | --- |
| Java unitário no ciclo | 51 aprovados; rodada final revalidou os 5 testes de imagens pertinentes |
| PostgreSQL real, rodada final | 10 integrações aprovadas por XML fresco; schema isolado removido e ausência confirmada |
| Aplicativo | 79 testes aprovados |
| Portal final | 58 testes aprovados |
| TypeScript app/portal, lint, Java e Next | Aprovados |
| Expo | Web final exportado no build de homologação; exports Android/iOS/web da base de fotos aprovados, sem equivaler a novos APK/IPA |
| Fotos/grupo por HTTPS | 17 verificações API aprovadas |
| Interface HTTPS Chromium | 11 verificações, larguras 390/1440, zero erros JavaScript; cinco capturas |
| Regressão API | 23 verificações aprovadas |
| Outros módulos | Atividade/perfil isolados, consulta sem notas internas, diário, histórico/agenda de medicamentos, IA desligada e OCR executado |
| Segurança remota | HTTP→HTTPS 301/308; CORS forjado 403; CPF/nascimento 403; três caminhos de configuração negados |
| JavaScript público | 1.442.863 bytes verificados, sem chave Storage ou valores privados conhecidos |
| Banco | 15 Flyway, 38 tabelas/37 com RLS, zero restrições inválidas; anon/authenticated sem acesso ao schema |
| Supabase | Bucket privado; advisors sem WARN/ERROR; INFO de RLS sem políticas esperado para schema privado |
| Dependências npm | Nenhuma alta/crítica; uma baixa e três moderadas registradas |
| Gitleaks | Nenhum segredo encontrado |

Houve ajustes de scripts para Windows PowerShell 5: saída informativa de programas nativos deixou de ser tratada como falha; encerramento do processo e XML fresco passaram a ser exigidos. Tentativas em schema já consumido não foram contabilizadas como aprovação. O iniciador do Codex falhou com `CreateProcessSecurityEnvironment 0x8007000A`; o proprietário executou os auxiliares revisados no PowerShell normal. Isso não muda a natureza real dos ensaios nos fornecedores.

## Implantação, Git e evidências

Railway `4e29e353-9f34-4d94-ad73-be8fbaa2603b` SUCCESS e Vercel `dpl_zYVrSFQioWBkvt3hE2huWiS7n3Jp` READY/staging, ambos na fonte `6a80797`. Serviços, segredos, região e limites econômicos existentes foram preservados. Bootstrap continua desativado; nenhum serviço pago novo, merge, force push, mudança em main/PR #1 ou produção.

Três commits de fonte: `2aec855` (fotos/grupo), `ac705f0` (prazo do preparo) e `6a80797` (acesso revogado/agenda). São 66 arquivos únicos, listados em [arquivos-alterados.json](fotos-grupo/arquivos-alterados.json). A documentação final tem commit separado, registrado pelo auxiliar de publicação. A cópia original e seu estágio foram preservados; revisão/publicação no worktree de homologação existente.

[API](fotos-grupo/api.json), [interface](fotos-grupo/interface.json), [regressão API](fotos-grupo/regressao-api.json), [módulos](fotos-grupo/regressao-modulos.json), [segurança](fotos-grupo/seguranca-publica.json), [banco](fotos-grupo/banco.json), [implantação](fotos-grupo/implantacao.json), [processamento](fotos-grupo/processamento.json) e [testes locais](fotos-grupo/testes.json). Comprovantes antigos de novembro/04 permanecem preservados na pasta histórica.

## Limites e próximos passos externos

Não houve teste em iPhone/Android físico, câmera física ou HEIC real nesta execução. Chromium com largura de celular não equivale a Safari físico. O proprietário pode reabrir/atualizar o aplicativo no Safari e executar o roteiro do guia. Não há novo APK/IPA; um APK antigo não recebe os módulos nativos desta alteração.

IA real continua dependendo das autorizações e configurações listadas acima. Os links web de paciente/profissional já estão disponíveis para o grupo, com convites individuais. Não é necessário manter o computador ou o PowerShell ligados após a conclusão do auxiliar de publicação.
