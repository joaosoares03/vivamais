# ADR 002 — Identidade e modo produtivo do Viva+

**Estado:** Parcialmente implementada, 05/11/2026, por decisão do titular: ativação presencial e conta local com MFA. Implementado: D1, D2 (primeira etapa), D3 opção B, D4 ativação presencial, D5. Pendente: remoção do default de `demo_only`, cifra de aplicação, direitos do titular, base legal e representante legal.
**Base analisada:** `9d1f71d1d40d62585ec838b7e8b9446644237d26`. Complementa o [ADR 001](ADR-001.md), que vale para a demo sintética.
**Decide:** o titular, com instituição, clínica e jurídico nos pontos marcados **[Titular]**.
**Fora deste ADR:** exercícios e IA alimentar (outro desenvolvedor), hardware, lojas, orçamento.

## Problema

Hoje o sistema só funciona com dados sintéticos, e isso é imposto em cinco camadas, não só no guard:

| Camada | Onde | Efeito |
| --- | --- | --- |
| Guard de início | `ConfiguracaoAmbiente.java` | `production` sempre recusa. Testado nesta fase em 4 combinações. |
| Propriedade fixa | `application.yml`, `app.demo-only: true` | Não vem de variável de ambiente. |
| Banco | `CHECK (demo_only)` em `organization`, `user_account`, `patient` (V1) | O PostgreSQL rejeita qualquer linha real, mesmo sem o guard. |
| Default de coluna | `DEFAULT true`, e `CuidadoService` insere paciente sem informar `demo_only` | Tirar o CHECK sem mais nada marcaria paciente real como demo. |
| Entrada do contêiner | `infra/entrada-nuvem.sh` | Exige `APP_ENV=preview` e testadores ligados. |

Os filtros `demo_only=true` em `AcessoPacienteService` (linhas 49 e 264) e em `InstituicaoRepository.principalAutenticado` ficam só nos caminhos de demonstração e testadores. Eles **não** bloqueiam o fluxo real e devem ser mantidos.

Lacunas de identidade encontradas no código:

1. **Paciente real não tem como ativar sem SMS.** Com `SMS_PROVIDER=DESABILITADO`, `AcessoPacienteService.emitir` responde 503, e o V9 proíbe devolver o código ao portal. O convite usado na homologação é bloqueado fora dela. Logo, SMS real, ou um canal novo, é pré-requisito do acesso, não uma função opcional.
2. **Profissional não tem recuperação nem MFA.** "Esqueci minha senha" é um link para `/suporte`. Nenhuma implementação de MFA foi encontrada.
3. **Não há criação de unidade nem de profissional fora da demo.** Organização só nasce em `DadosDemonstracao` (bootstrap), e profissional só nesse caminho ou em `GrupoTestesService`. Ambos ficam proibidos em produção, então hoje não existiria como criar a unidade, o primeiro ADMIN nem os profissionais.
4. **Código de ativação curto.** Quatro dígitos, 10 minutos, 5 tentativas por identidade em 15 minutos. Adequado à demo; fraco para dado de saúde real.
5. **Limite de login em memória.** `LimitadorTentativasAcesso` declara ser de instância única. Com duas réplicas, o limite efetivo dobra e some a cada reinício. O limite do paciente já é persistido.
6. **Paciente em duas unidades fica sem acesso.** `iniciar` usa `LIMIT 2` e rejeita identidade ambígua, o que é seguro, mas não há fluxo para esse caso.
7. **Sem representante legal.** Não encontrei modelo para responsável ou cuidador, relevante para menores e idosos dependentes.
8. **Papel JDBC é dono das tabelas.** RLS sem `FORCE` e sem políticas não limita esse papel. O dono também poderia desligar os gatilhos que protegem `audit_event` e `retificacao_registro`.
9. **Base legal e titulares sem implementação.** `consent_or_legal_basis_record` existe no banco e não é usada pelo código Java. Não encontrei fluxo de exclusão ou anonimização.
10. **CPF, telefone e endereço sem cifra de aplicação.** A busca compara `p.cpf=?` diretamente. A proteção atual é só a do provedor de banco.

## Decisão proposta

### D1. Modo produtivo explícito, que falha fechado

- `app.demo-only` passa a vir de variável, com default `true`. Produção exige `false` e `APP_ENV=production` juntos.
- `ConfiguracaoAmbiente` deixa de recusar sempre e passa a chamar um validador de início. A API não sobe em produção se encontrar qualquer um destes itens:
  - perfil `bootstrap` ou `DEMO_BOOTSTRAP_PASSWORD` preenchida;
  - `TESTER_ACCESS_ENABLED=true` ou `PATIENT_DEMO_*` preenchidas;
  - `SMS_PROVIDER=LOCAL`, simulador de pulseira, `STORAGE_BACKEND=local`;
  - `FILES_ENCRYPTION_KEY` ou `PATIENT_AUTH_HMAC_KEY` ausentes;
  - `DATABASE_URL` sem `sslmode=verify-full`, CORS sem HTTPS ou com curinga;
  - linhas com `demo_only=true` no banco;
  - papel JDBC dono das tabelas (ver D5).
- Em produção, rotas e beans de demonstração, testadores, grupo e instalador LAN nem são registrados: respondem 404, não 403.
- Nova `infra/entrada-producao.sh`. A atual fica intocada e segue só para homologação.
- O mesmo vale para `APP_ENV=preview`: hoje o jar sobe com `preview` sem nenhuma configuração, e só o script de entrada impede isso (testado nesta fase). As regras devem migrar para o Java.

### D2. Dados: migrations aditivas em duas releases

V1–V15 ficam imutáveis. Como o binário antigo depende do default, a mudança é em etapas:

1. **Release N, V16:** remove os três `CHECK (demo_only)`. Mantém o default. O código passa a gravar `demo_only` explicitamente, com o valor do modo. Gatilho impede misturar linha demo e real numa mesma organização.
2. **Release N+1, V17:** remove o default, para que uma inserção que esqueça a coluna falhe em vez de marcar errado.

Produção nunca recebe dump de homologação.

### D3. Identidade do profissional e do ADMIN

**Recomendação [Titular]:** OIDC com o provedor da instituição, se existir. Senão, conta local com MFA obrigatório.

| | A. OIDC institucional | B. Conta local + MFA (TOTP) |
| --- | --- | --- |
| Identidade | Comprovada pela instituição | Comprovada por convite de um ADMIN |
| MFA e recuperação | Do provedor | A construir |
| Saída de funcionário | Automática se desprovisionada | Depende de processo manual |
| Depende de | Instituição ter o serviço | Só deste código |

Nos dois casos:

- Unidade e primeiro ADMIN criados por comando operacional auditado, fora do deploy, com credencial de uso único.
- Demais contas por convite individual, reaproveitando a mecânica de V15 (hash, validade, uso único) em caminho próprio, sem as restrições de teste.
- Sem contas compartilhadas. Trocar papel ou desativar revoga todas as sessões.
- Limite de login persistido, como o do paciente.
- Reautenticação para exportar dados e gerir vínculos.

### D4. Identidade do paciente

Mantém o desenho do V8: **CPF e nascimento só identificam, nunca autenticam**, e o aparelho é autorizado por um segundo fator.

- **Cadastro verificado.** O profissional confirma documento e celular e registra quem conferiu e quando. Validação de CPF hoje é só matemática.
- **Canal de ativação [Titular], é o que destrava o acesso real:**
  - A. SMS real, sujeito ao gate próprio (conta, finalidade, antiabuso, custo).
  - B. Ativação presencial: o profissional, autenticado, gera QR ou código exibido uma vez para o paciente à sua frente. Sem custo por mensagem e com identidade conferida. Exige revisar a regra do V9, pois hoje o código nunca aparece no portal.
  - **Recomendação:** B como padrão no piloto, A como complemento. B dá identidade mais forte, tira o SMS do caminho crítico e pode ser construído sem contratar fornecedor.
- **Código:** subir para no mínimo 6 dígitos, mantendo HMAC, uso único e limites.
- **Recuperação:** aparelho perdido exige reemissão por profissional da unidade, revogando aparelhos e sessões anteriores, como `emitir` já faz. Telefone novo segue a regra V9.
- **Representante legal [Titular]:** decidir antes do piloto se menores ou pessoas com cuidador entram. Se entrarem, é preciso modelo próprio; se não, registrar a exclusão.
- **Paciente em duas unidades:** continua bloqueado no piloto, com mensagem orientando procurar a equipe.

### D5. Banco e papéis

- Papel de migração (dono) separado do papel de execução (só DML nas tabelas necessárias). `spring.flyway.enabled=false` em produção; migrations rodam em job próprio.
- O papel de execução perde `TRUNCATE` e a capacidade de alterar gatilhos, o que torna a proteção de auditoria efetiva.
- A API segue como autoridade de escopo. RLS continua como defesa contra acesso direto; políticas por sessão ficam fora deste ADR.

### D6. Auditoria e privacidade

- A cobertura de leitura é boa: `PATIENT_VIEWED`, `READINGS_VIEWED`, `PRIVATE_FILE_VIEWED`, exportações e sessões já são registrados. Falta evento de falha de login: hoje a tentativa negada não deixa trilha. Novas funções de D3 (papéis, MFA, recuperação) precisam nascer auditadas.
- Registrar base legal em `consent_or_legal_basis_record`, conforme definição do controlador **[Titular]**.
- Construir fluxos de titular (acesso, correção, exclusão ou restrição), respeitando retenção legal de registro de saúde **[Titular/Jurídico]**.
- Avaliar cifra de aplicação com índice cego para CPF e telefone. Recomendo decidir junto com o jurídico; não bloqueia o desenho de pré-produção.

## Alternativas descartadas

- **Só remover o guard:** o banco ainda recusaria tudo, e os testadores ficariam ligados.
- **Banco de produção sem V1–V15, com schema próprio:** quebraria a história única do Flyway e a promoção por SHA.
- **Reescrever V1 para tirar o CHECK:** viola a imutabilidade e o checksum aplicado.
- **CPF e nascimento como acesso direto:** dados conhecidos por terceiros; proibido pelo requisito.
- **Autenticação terceirizada para pacientes (Auth0, Supabase Auth etc.):** reabre o desenho do V8, adiciona operador de dados e custo, sem resolver a comprovação de identidade.

## Consequências

- Exige trabalho de código novo (D1 a D5). Pelo acordo vigente, isso entra por PR do Codex e passa pelos gates do Cloud.
- A homologação recebe V16 e V17 antes de produção e precisa continuar passando em tudo.
- O piloto fica sem SMS se a opção B for aceita, o que reduz custo e dependência externa.
- O bloqueio `APP_ENV=production` só cai depois de aprovação institucional. O código pode ser preparado antes, mas a liberação é uma decisão separada, por SHA e ambiente.

## Critérios de aceite (em pré-produção, só contas fictícias)

1. API recusa iniciar em produção para **cada** item proibido de D1, um teste por item.
2. Rotas de demo, testadores, grupo e LAN respondem 404 em produção.
3. Inserir paciente com `demo_only` omitido falha após V17; linha demo em unidade real é rejeitada.
4. Primeiro ADMIN criado sem bootstrap; a credencial não funciona duas vezes.
5. Login sem MFA é recusado; recuperação de profissional funciona e fica auditada.
6. Ativação: código expirado, reusado, errado 5 vezes e de outro paciente são todos recusados, inclusive sob concorrência.
7. Aparelho perdido: reemissão revoga sessões e aparelhos anteriores, inclusive leitura de foto.
8. Limite de login vale entre duas réplicas e após reinício.
9. Papel de execução não consegue `TRUNCATE`, desligar gatilho nem alterar `audit_event`.
10. Casos negativos por papel, unidade, vínculo revogado, sessão, foto e exportação.
11. Logs sem CPF, código, token ou imagem em toda a rodada.

## Decisões pendentes do titular

Representante legal, base legal e retenção, e cifra de aplicação.
