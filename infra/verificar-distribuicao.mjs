import { spawnSync } from "node:child_process";
import { createRequire } from "node:module";
import { fileURLToPath } from "node:url";
const raiz = fileURLToPath(new URL("../", import.meta.url));
const carregar = createRequire(new URL("../package.json", import.meta.url));
const indice = process.argv.indexOf("--perfil");
const perfil = indice >= 0 ? process.argv[indice + 1] : "preview";
if (!["development", "preview", "testflight", "production"].includes(perfil))
  throw new Error("Use --perfil development, preview ou production.");
const ambiente = {
  ...process.env,
  APP_ENV: perfil==="testflight"?"preview":perfil,
  EAS_BUILD_PROFILE:perfil,
  VIVA_ACESSO_TESTADORES:perfil!=="production"?"true":"false",
  VIVA_ATUALIZACOES:perfil==="preview"||perfil==="testflight"?"true":"false",
  EXPO_NO_TELEMETRY: "1",
  VIVA_LOGIN_DEMONSTRACAO: "false",
};
const resultado = spawnSync(
  process.execPath,
  [carregar.resolve("expo/bin/cli"), "config", "--type", "public", "--json"],
  {
    cwd: raiz,
    env: ambiente,
    encoding: "utf8",
    windowsHide: true,
  },
);
if (resultado.status !== 0) {
  console.error(
    "Configuração recusada. Defina uma API HTTPS autorizada para preview/production e confira APP_ENV. Nenhum build foi enviado.",
  );
  process.exitCode = 1;
} else {
  const configuracao = JSON.parse(resultado.stdout);
  const projetoVinculado = Boolean(configuracao.extra?.eas?.projectId);
  console.log(
    JSON.stringify(
      {
        perfil,
        nome: configuracao.name,
        versao: configuracao.version,
        android: {
          identificador: configuracao.android?.package,
          numero: configuracao.android?.versionCode,
          backupAutomatico: configuracao.android?.allowBackup,
        },
        ios: {
          identificador: configuracao.ios?.bundleIdentifier,
          numero: configuracao.ios?.buildNumber,
        },
        loginSimplificado: configuracao.extra?.acessoDemonstracao === true,
        acessoPorConvite:configuracao.extra?.acessoTestadores===true,
        atualizacoesHabilitadas:configuracao.updates?.enabled===true,
        runtime:configuracao.runtimeVersion,
        canal:perfil==="production"?"producao":perfil==="development"?"desenvolvimento":"grupo",
        projetoEasVinculado: projetoVinculado,
        assinaturaEEnvioVerificados: false,
      },
      null,
      2,
    ),
  );
  if (!projetoVinculado) {
    console.error(
      "Vincule o projeto à sua conta Expo com eas init antes do build na nuvem.",
    );
    process.exitCode = 1;
  }
}
