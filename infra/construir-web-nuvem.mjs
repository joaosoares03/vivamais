import { spawn } from "node:child_process";
import { mkdir, readFile, readdir, writeFile } from "node:fs/promises";
import { createHash } from "node:crypto";
import { createRequire } from "node:module";
import { fileURLToPath } from "node:url";
import path from "node:path";

const raiz = fileURLToPath(new URL("../", import.meta.url));
const carregar = createRequire(new URL("../package.json", import.meta.url));
const saida = path.join(raiz, ".local/export-nuvem");
const temporario = path.join(raiz, ".local/execucao/temporarios");
await mkdir(temporario, { recursive: true });
const ambiente = {
  ...process.env,
  APP_ENV: "preview",
  VIVA_ACESSO_TESTADORES: "true",
  VIVA_LOGIN_DEMONSTRACAO: "false",
  VIVA_WEB_MESMA_ORIGEM: "true",
  VIVA_ATUALIZACOES: "false",
  EXPO_NO_TELEMETRY: "1",
  EXPO_NO_DOTENV: "1",
  TEMP: temporario,
  TMP: temporario,
};
// A URL não é compilada no site: API e paciente compartilham a origem HTTPS efetiva.
delete ambiente.EXPO_PUBLIC_API_BASE_URL;
delete ambiente.EAS_BUILD_PLATFORM;
delete ambiente.EAS_BUILD_PROFILE;
const processo = spawn(
  process.execPath,
  [
    carregar.resolve("expo/bin/cli"),
    "export",
    "--platform",
    "web",
    "--max-workers",
    "2",
    "--output-dir",
    saida,
  ],
  {
    cwd: raiz,
    env: ambiente,
    windowsHide: true,
    stdio: "inherit",
  },
);
const codigo = await new Promise((resolver, rejeitar) => {
  processo.once("error", rejeitar);
  processo.once("exit", resolver);
});
if (codigo !== 0) process.exitCode = Number(codigo ?? 1);
else {
  const pagina = await readFile(path.join(saida, "index.html"), "utf8");
  if (/<script\b[^>]*>\s*[^<\s]/i.test(pagina))
    throw new Error(
      "A exportação passou a exigir script inline; revisar CSP antes de publicar.",
    );
  const arquivos = [];
  async function inventariar(pasta) {
    for (const item of await readdir(pasta, { withFileTypes: true })) {
      const arquivo = path.join(pasta, item.name);
      if (item.isDirectory()) await inventariar(arquivo);
      else if (item.isFile()) {
        const conteudo = await readFile(arquivo);
        arquivos.push({
          arquivo: path.relative(saida, arquivo).replaceAll(path.sep, "/"),
          bytes: conteudo.length,
          sha256: createHash("sha256").update(conteudo).digest("hex"),
        });
      }
    }
  }
  await inventariar(saida);
  await writeFile(
    path.join(temporario, "../export-nuvem.json"),
    JSON.stringify(
      { modo: "convites", apiMesmaOrigem: true, instalavel: false, arquivos },
      null,
      2,
    ),
  );
  console.log(
    "Exportação web para homologação concluída. Ainda exige API, banco e ensaio HTTPS implantados.",
  );
}
