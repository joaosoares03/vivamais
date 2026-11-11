# Alterações — fotos, IA e grupo — 05/11/2026

Fonte final `6a80797`, branch `codex/homologacao-nuvem-20261104`, implantada na homologação econômica existente.

- Fotos: preparo automático de originais até 10 MiB; orientação/redução, prévia, substituição, remoção e confirmação explícita. Falhas conservam a seleção; registro da refeição reaproveita o arquivo já conhecido.
- API: validação de conteúdo, dimensões e memória; PNG final até 2 MiB sem EXIF/GPS. Mantidos cifragem, bucket privado, grants curtos e autorização por vínculo.
- IA: estado autenticado exposto e mensagem honesta nas duas interfaces; serviço permanece desligado, sem chamadas ou classificações fabricadas.
- Grupo: gestão exclusiva de administrador, pacientes e profissionais com dados fictícios, convites individuais de uso único, validade, senha profissional própria, reemissão e revogação. V15 aditiva com RLS.
- Portal: espera de até 60 segundos somente para criação completa da conta do grupo; consultas comuns preservam 10 segundos.
- Acesso: conta fictícia desativada não oferece ativação por SMS; interface orienta procurar o administrador.
- Medicamentos: revisão com vigência futura preserva a agenda anterior e resolve substituições de versões sem duplicação.

[Validação, arquivos e limites conhecidos](evidencias/VALIDACAO_FOTOS_IA_E_TESTES_GRUPO.md). Não houve merge, alteração de main/PR #1, force push, produção ou contratação adicional. Não houve ensaio físico, novo APK/IPA ou ativação de IA externa.
