# Operação de produção

Produção é um ambiente separado da homologação: banco, Storage, chaves, projetos e origens próprios. Nunca restaure dados da homologação aqui. Os nomes de variáveis estão em `infra/producao.env.example`; os valores ficam no cofre do provedor.

A API só inicia se `ValidadorProducao` aprovar a configuração e `VerificacaoBancoProducao` aprovar o banco. A recusa cita os nomes do que falta, nunca os valores.

## Antes do primeiro paciente real

Estar no ar não libera dados reais. Confirme, e registre em `PRODUCAO_AUTORIZACAO`:

1. Controles técnicos testados em pré-produção, incluindo restauração de backup.
2. Pessoa ou entidade responsável pelos dados.
3. Autorização por escrito do local onde o app será usado.
4. Política de privacidade publicada.

## Primeira implantação

1. **Banco.** Um administrador cria os papéis, as senhas e o schema, como descrito no cabeçalho de `infra/producao/papeis.sql`.
2. **Migração.** Execute `/app/entrada-producao.sh migrar` com `DATABASE_MIGRATION_USER` e `DATABASE_MIGRATION_PASSWORD`.
3. **Permissões.** Rode `infra/producao/papeis.sql` como `viva_migrador`.
4. **Primeira unidade.** Execute `/app/entrada-producao.sh provisionar` com as variáveis `PROVISAO_*`. O convite vai para o arquivo de `PROVISAO_SAIDA`, nunca para o log. Esse comando funciona uma vez.
5. **API.** Inicie com `/app/entrada-producao.sh`, usando `viva_runtime`. Confira `/actuator/health/readiness`.
6. **Portal.** Publique com `APP_ENV=production` e as origens HTTPS.
7. **Administrador.** Abra `https://PORTAL/ativar-conta#CONVITE`, crie a senha, configure o autenticador e guarde os códigos de recuperação. Apague o arquivo do convite.

## Cada nova versão

1. Faça backup e confira que ele restaura.
2. Rode `migrar` e depois `infra/producao/papeis.sql`, que concede acesso às tabelas novas.
3. Publique a API. Ela recusa iniciar se as migrações do banco diferirem da versão.
4. Valide saúde, login e uma leitura autorizada com conta de teste.

Rollback do binário não desfaz migração. Veja o capítulo de recuperação do pacote de transferência.

## Contas

- **Equipe:** a administração convida em **Equipe**, no portal. O link vale 48 horas e funciona uma vez.
- **Senha ou autenticador perdidos:** a administração gera um novo convite, que encerra as sessões e apaga o autenticador anterior. Códigos de recuperação entram no lugar do autenticador, uma vez cada.
- **Único administrador sem acesso:** ainda não há caminho automático. Mantenha pelo menos dois administradores.
- **Paciente:** o profissional confere a identidade pessoalmente e gera o código na ficha. O código tem seis números, vale dez minutos e aparece uma vez. Gerar outro revoga os aparelhos anteriores.

## Limites conhecidos

- Em produção, `/ativar-conta` mostra a chave do autenticador em texto, sem QR code.
- `SMS_PROVIDER=PRESENCIAL` não confirma o celular. `telefone_confirmado_em` fica vazio nesse canal.
- A remoção do default de `demo_only` fica para uma migration futura, quando o binário anterior não estiver mais em uso.
- Direitos do titular, como exclusão e anonimização, ainda não têm fluxo no sistema.
- `application-producao.yml` confia no proxy da Railway. Revise se o provedor mudar.
