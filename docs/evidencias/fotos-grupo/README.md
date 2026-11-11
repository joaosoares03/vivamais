# Evidências — fotografias e grupo de testes

Rodada final de 05/11/2026, fonte `6a807978b96807d2059d7862016a3abd98590186`. Ensaios HTTPS na Railway, Vercel e Supabase reais; somente contas e imagens fictícias.

O [relatório técnico](../VALIDACAO_FOTOS_IA_E_TESTES_GRUPO.md) distingue testes locais, integrações PostgreSQL, navegador e limitações de aparelhos físicos. O [guia do grupo](../../GUIA_TESTES_GRUPO_VIVAMAIS.md) explica os acessos individuais.

## Comprovantes

| Arquivo | Conteúdo |
| --- | --- |
| [api.json](api.json) | 17 verificações de fotos, Storage privado, convites, isolamento e revogação |
| [interface.json](interface.json) | 11 verificações de interfaces HTTPS em Chromium, incluindo falhas de transporte e nova tentativa real |
| [processamento.json](processamento.json) | Preparo de JPEG/PNG grandes e rejeição de arquivos inválidos |
| [regressao-api.json](regressao-api.json) | 23 verificações gerais da API |
| [regressao-modulos.json](regressao-modulos.json) | Medicamentos e agenda futura, atividade, perfil, consultas, diário, IA e OCR |
| [seguranca-publica.json](seguranca-publica.json) | HTTPS, CORS, caminhos privados e inspeção do JavaScript público |
| [testes.json](testes.json) | Contagens e escopo dos testes e builds |
| [banco.json](banco.json) | Migrações, RLS, privilégios, bucket e ausência de chamadas de IA |
| [implantacao.json](implantacao.json) | Identificadores e fonte dos deploys de homologação |
| [arquivos-alterados.json](arquivos-alterados.json) | 66 arquivos únicos dos três commits de código |

## Capturas verificadas

- [Administração do grupo, 1440 px](grupo-administracao-1440.png)
- [Prévia da fotografia, 390 px](paciente-previa-foto-390.png)
- [Refeição persistida, 390 px](paciente-refeicao-persistida-390.png)
- [Leitura autorizada no portal, 1440 px](portal-refeicao-autorizada-1440.png)
- [Profissional convidado e conta desativada sem SMS, 1440 px](profissional-convidado-refeicao-1440.png)

As imagens de ruído e as ilustrações são arquivos sintéticos para exercitar compressão, persistência e leitura. As capturas não contêm senhas, convites ou QR. Largura móvel em Chromium não equivale a ensaio de iPhone/Safari, câmera ou HEIC físicos.

A análise alimentar permanece desabilitada, com zero tentativas no banco. Nenhum novo APK/IPA foi gerado nesta rodada.
