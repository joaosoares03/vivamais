const { getDefaultConfig } = require("expo/metro-config");
const { createHash } = require("node:crypto");
const { readFileSync } = require("node:fs");
const { join } = require("node:path");

const configuracao = getDefaultConfig(__dirname);
// Constants incorpora a configuração pública no bundle. Modos diferentes não
// podem reaproveitar a transformação de um build anterior.
const chavesAmbiente = [
  "APP_ENV",
  "VIVA_LOGIN_DEMONSTRACAO",
  "VIVA_ACESSO_TESTADORES",
  "VIVA_WEB_MESMA_ORIGEM",
  "VIVA_ATUALIZACOES",
  "EAS_BUILD_PROFILE",
  "EXPO_PUBLIC_API_BASE_URL",
  "VIVA_ANDROID_APPLICATION_ID",
  "VIVA_IOS_BUNDLE_IDENTIFIER",
  "EXPO_EAS_PROJECT_ID",
];
configuracao.cacheVersion =
  "viva-" +
  createHash("sha256")
    .update(readFileSync(join(__dirname, "app.config.ts")))
    .update(
      JSON.stringify(
        chavesAmbiente.map((chave) => [chave, process.env[chave] ?? ""]),
      ),
    )
    .digest("hex");
module.exports = configuracao;
