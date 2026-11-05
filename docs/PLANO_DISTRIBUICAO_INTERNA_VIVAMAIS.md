# Distribuição interna e backend sintético do grupo

Estado em 04/11/2026: código e perfis preparados; nenhuma hospedagem, conta EAS, build de nuvem ou distribuição iOS criada. O proprietário já instalou e testou o APK Android local 0.1.0. Isso não valida a versão 0.2.0 nem acesso fora da rede doméstica.

## Ambientes separados

| Uso | Identificador | Acesso | API |
| --- | --- | --- | --- |
| Demonstração local | `org.vivamais.academicdemo.local` | CPF fictício + nascimento; sem SMS | Loopback, ou conector LAN limitado ao aparelho autorizado |
| Grupo | `org.vivamais.academicdemo.teste` | Convite forte individual, renovação protegida e revogável | Homologação sintética HTTPS |
| Futuro uso real | Identificador institucional a confirmar | Fluxo seguro existente e revisão institucional | Produção permanece bloqueada no backend atual |

O grupo usa um aplicativo instalado que não depende de Metro ou do computador do autor. EAS Internal Distribution para Android e TestFlight para iPhone são os canais previstos. Development Build/Metro é ferramenta de desenvolvimento; não substitui a distribuição autônoma.

## API, banco e arquivos

Reutilizar a arquitetura econômica de [HOSPEDAGEM_DEMO](operations/HOSPEDAGEM_DEMO.md): Next na Vercel, API Java no Railway, PostgreSQL e bucket privado no Supabase. Não foi contratado ou implantado nenhum serviço.

1. Criar um projeto/banco **exclusivo e vazio** para o grupo e um bucket privado exclusivo. Não apontar para o banco local ou para dados reais.
2. Usar `backend/demo/Dockerfile`, raiz de serviço `backend/demo` e a configuração `infra/railway.toml`. Manter uma réplica inicialmente, pool 4 e os limites de upload existentes. Não publicar a porta PostgreSQL; conexão somente da API por JDBC com TLS e certificado verificado. Usar usuário dedicado ao schema, sem SUPERUSER/BYPASSRLS, e restringir credenciais no painel.
3. Preencher `infra/grupo.env.example` no gerenciador privado do provedor. `APP_ENV=preview`, `TESTER_ACCESS_ENABLED=true`, unidade fictícia explícita, `PATIENT_DEMO_LOGIN_ENABLED=false`, SMS e análise clínica desativados. Chaves de arquivos/HMAC estáveis, diferentes das locais; nunca no app, Git ou chat.
4. Rodar `node infra/verificar-ambiente-grupo.mjs` com esse ambiente. O script valida a configuração sem exibir os valores secretos e sem criar recursos. A conferência não substitui o ensaio de implantação.
5. Aplicar Flyway V1–V14 sem editar migrações. O bootstrap existente pode ser usado uma única vez, com perfil explícito e senha aleatória privada; depois retirar perfil/segredo. A senha não é sobrescrita nos reinícios. Obter o UUID da unidade fictícia A pelo operador e configurar `TESTER_ORGANIZATION_ID`.
6. Publicar a API atrás de HTTPS. O acesso por convite recusa HTTP remoto. Se TLS termina em proxy, configurar a estratégia nativa do Tomcat **somente com a expressão exata dos proxies confiáveis do provedor** e impedir acesso direto ao serviço. O modelo deixa confiança em proxy desativada; não usar `.*` nem aceitar cabeçalhos arbitrários para fazer o teste passar. Conferir isso no provedor antes da liberação.
7. Configurar CORS com origens HTTPS exatas do portal e da prévia do paciente. No navegador, a renovação usa cookie HttpOnly/Secure/SameSite Strict: manter aplicativo web e API no mesmo site, por subdomínios próprios, ou implantar um proxy de mesma origem revisado. Vercel/Railway em domínios de sites diferentes não comprovam renovação por cookie. O app nativo usa SecureStore.
8. Next pode ser compilado em modo otimizado para o ambiente sintético. Usar URLs explícitas de API/app, sem credenciais e sem segredo de bootstrap no portal. O cliente nunca acessa diretamente tabelas ou service-role do Supabase.
9. Ensaiar saúde, login profissional, convite, renovação, revogação, upload privado e duas contas isoladas antes de enviar instaladores ao grupo. Não publicar o endpoint demonstrativo CPF/nascimento por túnel.

## Contas e registros individuais

O portal permite criar um paciente APP fictício por integrante. Na ficha, **Acesso privado aos testes** oferece emissão após reautenticação, validade 1/3/7 dias e revogação. O segredo aparece uma única vez na resposta e na tela; no banco ficam hashes. O convite é de uso único e vincula um aparelho. A renovação rotativa termina na validade original, revogação ou saída. Não cria autorização permanente de paciente real.

Para preparar um lote com dados de exemplo, o operador pode usar `infra/preparar-contas-grupo.mjs --api ORIGEM_HTTPS --email PROFISSIONAL --participantes 5 --confirmar-somente-sinteticos`, fornecendo a senha somente por variável privada de processo `VIVA_GRUPO_SENHA_PROFISSIONAL`. Não incluir a senha na linha de comando. O script cria contas separadas pelas APIs, medicamento explicitamente fictício, pressão, consulta, atividade, refeição com ilustração do projeto e diário impresso separado. Não oferece prescrição nem análise clínica.

Os convites são salvos somente em `.local/grupo/convites-<lote>.json`, fora do Git. Entregar cada convite individual por canal privado, sem compartilhar o lote. Se uma etapa falhar, revisar os pacientes já criados e o arquivo marcado incompleto antes de repetir. O script não foi executado contra um serviço remoto nesta entrega.

## Operação e custos

Habilitar alertas/limite de gasto, medir RAM/CPU/saída e tamanho de banco/arquivos. Planejar backup cifrado do PostgreSQL e objetos com as respectivas chaves, cópia fora do provedor e ensaio de restauração em banco separado antes de liberar testes. Não considerar o plano gratuito uma política de backup. Preservar logs sanitizados, sem corpos clínicos, Authorization, cookies, documentos ou convites; não habilitar access log contendo parâmetros de links privados. Sem credenciais, esse ensaio remoto permanece pendente.

Valores oficiais consultados em 04/11/2026: [Railway Hobby](https://railway.com/pricing) tem mínimo de US$ 5/mês, com excedente por consumo; [Supabase Free](https://supabase.com/pricing) inclui 500 MB de banco e1 GB de arquivos, com pausa após uma semana de inatividade. Manter a reserva estimativa de US$ 10–25/mês definida anteriormente, sem garantia de consumo. [Expo Free](https://expo.dev/pricing) inclui cota de15 builds Android e15 iOS e atualizações para até1.000 usuários ativos mensais; custos Apple e limites do provedor são separados. Nenhum pagamento autorizado ou realizado nesta execução.

## Critério de liberação

Só chamar o grupo depois de existir instalador verificado, API HTTPS operacional, bucket privado, contas/convites individuais, teste de isolamento e roteiro de atualização. Registrar versão, build, runtime, canal, hash, assinatura, URL de instalação protegida e ensaio físico por plataforma. Não há link remoto pronto neste momento. Consultar o [guia EAS/TestFlight](GUIA_CONFIGURACAO_EXPO_EAS_TESTFLIGHT.md) e o [roteiro dos testadores](GUIA_TESTES_GRUPO_ANDROID_IOS.md).
