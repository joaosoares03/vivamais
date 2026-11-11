## Fotos e grupo disponíveis na homologação — 05/11/2026

Fonte implantada `6a80797` na branch `codex/homologacao-nuvem-20261104`. Fotos originais até 10 MiB recebem preparo automático, prévia e confirmação; persistência privada e leitura autorizada foram verificadas em nuvem. O administrador cria convites individuais de paciente ou profissional em **Grupo de testes**, com validade, reemissão e revogação; SMS não participa desse acesso. A agenda anterior foi preservada ao editar medicamentos com vigência futura.

[Paciente](https://viva-api-paciente-homologacao.up.railway.app/convite) · [Profissional](https://vivamais-portal-viva-mais3.vercel.app). IA alimentar continua **desabilitada**, com zero tentativas no banco. Testes: 79 app, 58 portal, 10 integrações PostgreSQL na rodada final, 17 verificações de fotos/grupo e 23 de regressão API, além do ensaio das duas interfaces e demais módulos. Não houve ensaio físico de Safari/HEIC nem novo APK/IPA.

[Guia de acesso e testes](GUIA_TESTES_GRUPO_VIVAMAIS.md) · [Relatório e evidências](evidencias/VALIDACAO_FOTOS_IA_E_TESTES_GRUPO.md).

As seções datadas abaixo preservam o histórico anterior. Para o estado atual, use os links acima.

# Testar o Viva+ na nuvem

Atualização de04/11/2026. Homologação acadêmica com dados sintéticos; não depende do computador ligado.

## Endereços

- [Portal profissional](https://vivamais-portal-viva-mais3.vercel.app).
- [Aplicativo do paciente no Safari/Chrome](https://viva-api-paciente-homologacao.up.railway.app/convite).
- [Saúde da API e do banco](https://viva-api-paciente-homologacao.up.railway.app/actuator/health/readiness).

São interfaces diferentes conectadas à mesma API Java/PostgreSQL. O paciente exige convite; não existe login público por CPF/nascimento ou SMS nesta homologação.

## Primeiro acesso do titular

1. No computador, abra .local/nuvem/ACESSO_PRIVADO.txt. Ele contém a credencial profissional gerada para esta instalação e um convite individual. Não versionar ou compartilhar esse arquivo.
2. Para o iPhone, abra .local/nuvem/CONVITE_IPHONE.svg no computador e leia o QR com a câmera do iPhone. Abra o endereço no Safari e toque em ENTRAR. O agente não consumiu esse convite.
3. Após entrar, reutilize o mesmo navegador. O cookie de renovação é HttpOnly/Secure/SameSite=Strict. O convite só permite uma entrada inicial e vale7dias; limpar cookies, sair ou revogar exige novo convite.
4. O QR é uma credencial privada: não envie ao grupo nem inclua em capturas.

## Convidar integrantes

Entre no portal com a credencial privada do titular. Cadastre uma ficha fictícia por participante, com dados de teste e modalidade Aplicativo. Na ficha/resultado do cadastro, em Acesso privado aos testes, informe sua senha profissional, escolha1/3/7dias e use Criar convite privado. Entregue somente o link individual ao respectivo participante. Ele abre o link no próprio Safari/Chrome e toca em ENTRAR. Nunca compartilhe o acesso profissional com o grupo.

A mesma conta individual deve ser usada em um navegador/aparelho por convite. O portal permite revogar o acesso; depois disso a renovação e os links de fotos vinculados à sessão devem ser recusados. Os demais pacientes e clínicas não ficam visíveis ao participante.

## Roteiro de teste

- Portal: login, cadastro/busca, ficha, plano fictício de medicamentos, histórico, consultas, exportação e preferências.
- Paciente: início, pressão manual, medicamentos/agenda/calendário/autorrelatos, alimentação, atividade voluntária, consultas, histórico e perfil. Use apenas exemplos sintéticos, sem prescrição ou orientação clínica real.
- Offline: com a tela já aberta, desative a rede, registre um autorrelato e confira o aviso de fila; reative a rede e sincronize. Reabra a página e confirme o mesmo registro no portal. O ensaio web não prova persistência nativa SQLCipher ou uso totalmente offline após fechar o Safari.
- Fotos: PNG/JPEG até2MB e dimensões limitadas; metadados removidos e objeto cifrado no bucket privado. Upload, refeição e download autorizado passaram nos testes remotos; outro paciente é recusado. O link temporário depende da sessão e da validade.

Registre problema com data/hora, navegador/aparelho, tela, ação e mensagem. Evite senhas, CPF, link de convite ou dados reais no relato.

## Limites e evidências

Os ensaios remotos automatizados usam Chromium em390/1440px. Teste físico no Safari/iPhone ainda precisa de confirmação do titular. Esta versão é web: não é IPA, TestFlight ou publicação na App Store. Câmera, notificações e armazenamento nativo precisam de builds e ensaios próprios; o APK LAN antigo não deve ser distribuído como versão de nuvem. Exportações Hermes Android/iOS/web foram geradas, não equivalem a instaláveis.

SMS real e IA alimentar externa permanecem desligados; critérios clínicos e pulseira real continuam indisponíveis sem validação. A API não é liberada para pacientes reais.

Supabase permanece Free aprovado; Vercel Hobby. Railway utiliza o plano/saldo da conta, com uma réplica,1CPU/1GB e sleep. Nenhum upgrade foi contratado; confira o consumo no painel antes de ampliar o grupo. Free/sleep podem causar espera no primeiro acesso.

[Estado técnico, testes e pendências](operations/IMPLANTACAO_NUVEM_2026-11-04.md). Backup PostgreSQL restaurado em schema isolado e removido após conferência. A foto daquele snapshot tem cópia cifrada recuperada pelo Java; dump/chaves/objetos permanecem privados. [Evidências](evidencias/nuvem-2026-11-04/README.md).
