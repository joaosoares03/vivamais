import { spawn } from "node:child_process";
import { createRequire } from "node:module";
import { mkdir } from "node:fs/promises";
import { fileURLToPath } from "node:url";
import path from "node:path";
import { validarApiExpoRemoto } from "./regras-expo-remoto.mjs";
const indice = process.argv.indexOf("--api"),
  api = validarApiExpoRemoto(indice < 0 ? "" : process.argv[indice + 1]);
if (!process.argv.includes("--confirmar-api-por-convite"))
  throw new Error(
    "Antes de expor o bundle, confirme que a API usa somente dados sintéticos, login CPF desativado e convites privados.",
  );
const saude = await fetch(api + "/actuator/health", {
  redirect: "error",
  signal: AbortSignal.timeout(10000),
});
if (!saude.ok || (await saude.json()).status !== "UP")
  throw new Error(
    "A API de homologação não confirmou disponibilidade. Nenhum túnel iniciado.",
  );
const raiz = fileURLToPath(new URL("../", import.meta.url)),
  carregar = createRequire(new URL("../package.json", import.meta.url)),
  temporario = path.join(raiz, ".local/execucao/temporarios");
await mkdir(temporario, { recursive: true });
console.log(
  "O QR é para uma Development Build já instalada. Expo Go não inclui o SQLCipher deste projeto. O túnel transporta o bundle, não publica a API.",
);
const processo = spawn(
  process.execPath,
  [carregar.resolve("expo/bin/cli"), "start", "--dev-client", "--tunnel"],
  {
    cwd: raiz,
    env: {
      ...process.env,
      TEMP: temporario,
      TMP: temporario,
      APP_ENV: "development",
      VIVA_LOGIN_DEMONSTRACAO: "false",
      VIVA_ACESSO_TESTADORES: "true",
      VIVA_ATUALIZACOES: "false",
      EXPO_PUBLIC_API_BASE_URL: api,
      EXPO_NO_TELEMETRY: "1",
    },
    windowsHide: true,
    stdio: "inherit",
  },
);
processo.once("error", () => {
  console.error("Não foi possível iniciar o Expo. Nenhuma API foi publicada.");
  process.exitCode = 1;
});
processo.once("exit", (codigo) => {
  process.exitCode = codigo ?? 1;
});
