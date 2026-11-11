# Fotografias privadas

O original é aceito até 10 MiB, com limites de dimensões/pixels. O paciente não precisa comprimir manualmente: o cliente prepara JPEG proporcional e mostra a prévia antes de salvar. HEIC/HEIF depende da conversão pelo aparelho/navegador. O servidor aceita conteúdo JPEG/PNG, sem confiar em extensão ou MIME.

| Etapa | Limite/comportamento |
| --- | --- |
| Seleção original | 10 MiB; até 12.000 por lado e 50 milhões de pixels |
| Preparação cliente | Maior lado até 2048; JPEG com orçamento de 1800 KiB |
| Multipart Java | 10 MiB arquivo; 11 MiB requisição |
| Portal BFF | Corpo até 3 MiB; recebe imagem já preparada |
| Processamento Java | Amostragem antes de decodificar; orientação JPEG; PNG novo sem EXIF/GPS; redução progressiva |
| Arquivo armazenado | PNG até 2 MiB, cifrado AES-GCM com nonce aleatório |
| Bucket | Privado, octet-stream; limite 3 MiB; chave secreta só no backend |
| Download | Grant aleatório/hash por 60 segundos; sessão e autorização central verificadas a cada leitura |

`POST /api/v1/patients/{id}/files` recebe `purpose=MEAL` ou `PRESSURE_DISPLAY`. `POST /api/v1/patients/{id}/meals` associa arquivo/data/observação, de forma idempotente por arquivo. `GET /api/v1/patients/{id}/meals` recupera o histórico. `POST /api/v1/files/{id}/link` cria o caminho de leitura autorizado; a foto nunca fica pública no Storage. Revogação/expiração da sessão ou do integrante bloqueia também a leitura por grants existentes.

Há limite de 20 fotos/mês por paciente na demonstração. O servidor permite um processamento de imagem por vez por instância; concorrência recebe mensagem de tentar novamente. Não se guardam o original nem metadados de localização. O reenvio do registro reaproveita o upload conhecido; uma resposta de upload perdida pode deixar um objeto órfão, que exige coleta operacional após conferir referências. Nunca apague arquivos por idade sem verificar essas referências.

Chaves de cifra devem ser preservadas separadamente do backup. O banco contém referências, não o conteúdo dos objetos. Veja [evidências e limites dos testes](evidencias/VALIDACAO_FOTOS_IA_E_TESTES_GRUPO.md).
