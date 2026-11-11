# Contas reais na homologação

Ensaia na homologação o mesmo acesso da produção: convite individual, senha própria, autenticador (MFA) e códigos de recuperação. A unidade de demonstração e o Grupo de testes continuam como estão.

**Somente dados fictícios.** "Real" aqui é só o tipo de conta, e a homologação não tem as proteções exigidas para dados de saúde.

## Pré-requisitos no serviço da Railway

- **`MFA_ENCRYPTION_KEY`** (obrigatória): 32 bytes em Base64, gerados com `openssl rand -base64 32` no Console do próprio serviço. Não troque a chave depois: sem ela, os autenticadores já cadastrados deixam de valer. Sem a variável, a API sorteia uma chave a cada reinício.
- **`LOGIN_LIMIT_PERSISTED=true`**: o limite de tentativas de login fica no banco, como em produção.
- **`SMS_PROVIDER=PRESENCIAL`**: o código de ativação do paciente aparece uma vez para o profissional, que o entrega em mãos.
- **`APP_MFA_REQUIRED`** fica `false` na homologação, senão as contas demo, que não têm MFA, deixam de entrar. As contas da unidade real pedem o código mesmo assim, porque têm autenticador confirmado.

## Criar a unidade e a primeira administração (uma vez)

1. No Console do serviço, rode o comando abaixo. O convite vai para o arquivo, nunca para o log. Se já existir administração real, o comando recusa.

```bash
PROVISAO_UNIDADE='Unidade de ensaio (dados fictícios)' PROVISAO_NOME='Nome' PROVISAO_EMAIL='email@exemplo.com' PROVISAO_SAIDA=/tmp/convite-admin.txt java -Xmx256m -jar /app/app.jar --spring.profiles.include=nuvem,provisionar --server.port=0
```

2. Leia o convite com `cat /tmp/convite-admin.txt` e abra `PORTAL/ativar-conta#CONVITE`. Lá a pessoa cria a senha, cadastra o autenticador e guarda os 8 códigos de recuperação.
3. Apague o arquivo com `rm /tmp/convite-admin.txt`.
4. Convide um segundo administrador em **Equipe**.

Em produção o procedimento é o mesmo, com `/app/entrada-producao.sh provisionar` (ver `PRODUCAO.md`).
