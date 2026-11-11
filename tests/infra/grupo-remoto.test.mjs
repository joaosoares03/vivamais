import { test } from "node:test";
import assert from "node:assert/strict";
import { validarApiExpoRemoto } from "../../infra/regras-expo-remoto.mjs";
import { verificarAmbienteGrupo } from "../../infra/verificar-ambiente-grupo.mjs";
test("túnel recusa backend local, compartilhamento inseguro e endereços de exemplo", () => {
  for (const endereco of [
    "",
    "http://teste.universidade.edu.br",
    "https://127.0.0.1",
    "https://192.168.0.8:8083",
    "https://172.16.1.2",
    "https://10.1.2.3",
    "https://100.64.1.2",
    "https://[::1]",
    "https://localhost",
    "https://api.example.org",
    "https://api.invalid",
    "https://teste.universidade.edu.br/?chave=segredo",
    "https://usuario:segredo@teste.universidade.edu.br",
  ]) {
    assert.throws(() => validarApiExpoRemoto(endereco));
  }
  assert.equal(
    validarApiExpoRemoto("https://teste.universidade.edu.br/"),
    "https://teste.universidade.edu.br",
  );
});
test("homologação mantém convites, TLS e origens exatas sem vazar segredos nos diagnósticos", () => {
  const ambiente = {
    APP_ENV: "preview",
    TESTER_ACCESS_ENABLED: "true",
    PATIENT_DEMO_LOGIN_ENABLED: "false",
    SMS_PROVIDER: "DESABILITADO",
    SMS_LOCAL_TEST_ENABLED: "false",
    SMS_REAL_AUTHORIZED: "false",
    FOOD_ANALYSIS_ENABLED: "false",
    DATABASE_URL:
      "jdbc:postgresql://banco.universidade.edu.br/viva?sslmode=verify-full",
    DATABASE_USER: "usuario-teste",
    DATABASE_PASSWORD: "segredo-somente-do-teste",
    FILES_ENCRYPTION_KEY: "chave-no-gerenciador",
    PATIENT_AUTH_HMAC_KEY: "outra-chave-no-gerenciador",
    SUPABASE_URL: "https://teste.supabase.co",
    SUPABASE_SERVICE_ROLE_KEY: "segredo-de-servico-no-teste",
    TESTER_ORGANIZATION_ID: "00000000-0000-4000-8000-000000000001",
    CORS_ALLOWED_ORIGINS: "https://portal.universidade.edu.br",
    STORAGE_BACKEND: "supabase",
  };
  assert.deepEqual(verificarAmbienteGrupo(ambiente), []);
  assert.deepEqual(
    verificarAmbienteGrupo({
      ...ambiente,
      SUPABASE_SERVICE_ROLE_KEY: "",
      SUPABASE_SECRET_KEY: "sb_secret_teste",
    }),
    [],
  );
  assert.ok(
    verificarAmbienteGrupo({
      ...ambiente,
      SUPABASE_SECRET_KEY: "sb_publishable_teste",
    }).length,
  );
  for (const alteracao of [
    { PATIENT_DEMO_LOGIN_ENABLED: "true" },
    { CORS_ALLOWED_ORIGINS: "*" },
    { DATABASE_URL: "jdbc:postgresql://localhost/viva" },
    {
      SERVER_FORWARD_HEADERS_STRATEGY: "NATIVE",
      SERVER_TOMCAT_REMOTEIP_INTERNAL_PROXIES: ".*",
    },
  ]) {
    const falhas = verificarAmbienteGrupo({ ...ambiente, ...alteracao });
    assert.ok(falhas.length);
    assert.ok(!falhas.join(" ").includes(ambiente.DATABASE_PASSWORD));
    assert.ok(!falhas.join(" ").includes(ambiente.SUPABASE_SERVICE_ROLE_KEY));
  }
});
