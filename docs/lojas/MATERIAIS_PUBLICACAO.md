# Materiais técnicos para revisão institucional

Rascunho de 03/11/2026. Não representa aprovação clínica/jurídica ou ficha enviada. Confirmar os dados efetivamente coletados e os prestadores da implantação antes de preencher as lojas.

## Textos propostos

**Nome:** Viva+. **Categoria proposta:** Saúde e fitness; confirmar a finalidade aprovada. **Idioma:** português brasileiro.

**Descrição curta:** Registre seus cuidados e consulte as orientações da sua equipe de saúde.

**Descrição completa:**

O Viva+ organiza registros de pressão arterial, planos de medicamentos, autorrelatos, alimentação, atividades realizadas e orientações compartilhadas pela equipe. O paciente acompanha seu histórico e o profissional consulta os registros das pessoas sob sua responsabilidade.

Registros de medicamentos são relatos do usuário: o aplicativo não comprova ingestão. A leitura de fotos do visor auxilia a transcrição e exige conferência dos valores. O aplicativo não substitui avaliação profissional, não diagnostica condições e não atende emergências. Recomendações individualizadas, análise alimentar e comunicação com dispositivos dependem de integração e validação específicas; não anunciar essas funções como disponíveis enquanto estiverem bloqueadas.

O acesso é restrito a contas cadastradas e autorizadas. A disponibilidade das funcionalidades depende do serviço implantado pela instituição responsável.

**Notas da versão propostas:** interface em português, datas brasileiras, histórico de cuidados, orientações de consultas, exportação autorizada e correções textuais com trilha de autoria. Publicar apenas as funções verificadas no binário enviado.

## Identidade e capturas

- Fonte do logotipo de alta resolução: `assets/images/individuais/01_logos/logo_viva_mais_sem_slogan.png`; ícone/splash configurados no Expo. Gerar e conferir as dimensões finais exigidas pelos painéis; não esticar o logotipo.
- Capturas reais atuais: `docs/evidencias/finalizacao-2026-11-03/`. São navegador/Expo Web com dados fictícios; úteis para revisão da interface, **não são provas de Android/iOS instalado**.
- Capturas finais de loja: Android/iPhone/iPad efetivos conforme tamanhos aceitos pelo painel, sem CPF, celular, tokens, nomes de pessoas reais ou códigos. Feature graphic/promocionais só após confirmar dimensões e identidade institucional. Não fabricar screenshots nativas ou selos.

## Matriz de dados a conferir

| Categoria | Uso técnico presente | Pontos a declarar/revisar |
| --- | --- | --- |
| Nome, CPF, nascimento, telefone | Identificação e gestão do acesso | Vínculo com pessoa, finalidade e base legal; CPF estrutural não confirma identidade oficial |
| E-mail/senha profissional | Autenticação de equipe | Senha com hash; nenhum envio da senha para app de paciente |
| Medições, medicamentos, relatos e consultas | Acompanhamento autorizado | Dados de saúde sensíveis, acesso por vínculo/unidade e retenção institucional |
| Fotos do visor/refeições | OCR e registro autorizado | Armazenamento privado cifrado, revisão humana, fornecedor alimentar se habilitado |
| Sessões/dispositivo e auditoria | Segurança e rastreabilidade | Tokens revogáveis, SecureStore/SQLCipher nativos, memória no navegador |
| Notificações locais | Lembretes configurados | Permissão opcional; entrega em aparelho ainda exige ensaio |
| Câmera/galeria | Foto escolhida pelo usuário | Solicitação contextual, recusa e alternativa de digitação; sem microfone/localização |
| SMS | Ativação segura quando contratado | Provedor, compartilhamento de número e finalidade; LOCAL não envia SMS real |

Não selecionar automaticamente “nenhum dado coletado”, “não compartilhado” ou alegar criptografia ponta a ponta. O servidor acessa o conteúdo para prestar o serviço, mesmo com TLS e objetos cifrados. Confirmar retenção, subprocessadores, transferências e processo de exclusão. O cache local tem escopo/validade limitada; isso não define a retenção do banco.

## Privacidade, termos e exclusão

As páginas técnicas existentes informam o estado acadêmico e as revisões pendentes. Para publicação, a instituição precisa fornecer controlador/responsável, contato de suporte e privacidade, finalidade/base legal, retenção, direitos, processo operacional de exclusão e exceções de guarda aprovadas. Não inventar e-mail, endereço, CNPJ, DPO, aprovação ética, certificação ou regularização como dispositivo médico.

Preparar URLs públicas HTTPS permanentes `/privacidade`, `/suporte` e `/exclusao`, com procedimento real dentro/fora do app conforme as regras da loja aplicáveis. O envio de um formulário só pode declarar recebimento após existir destinatário/fluxo funcionando. Nenhuma decisão jurídica é presumida neste rascunho.

## Instruções para revisores

Fornecer conta sintética no **ambiente público de homologação segura**, sem acesso a pacientes reais, com instruções exatas de autorização por aparelho. Providenciar recebimento/controladoria do código de forma aprovada e estável durante a revisão. Não incluir credenciais neste documento nem usar o login local simplificado em servidor público. Explicar quais integrações estão desabilitadas, como registrar e consultar um dado e como solicitar exclusão.

Apresentar separadamente o binário, perfil/versão, limitações, evidências de ensaio e eventuais permissões. Nenhuma conta de revisor operacional foi criada nesta execução, pois ainda não há ambiente público/contas de loja autorizados.
