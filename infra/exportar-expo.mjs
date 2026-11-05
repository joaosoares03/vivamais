import { mkdir, readFile, writeFile, stat } from "node:fs/promises";
import { spawn } from "node:child_process";
import { createRequire } from "node:module";
import { createHash } from "node:crypto";
import { fileURLToPath } from "node:url";
import path from "node:path";
const raiz = fileURLToPath(new URL("../", import.meta.url)),
  carregar = createRequire(new URL("../package.json", import.meta.url));
const argumentos = process.argv.slice(2),
  ler = (chave, padrao) => {
    const i = argumentos.indexOf(chave);
    return i < 0 ? padrao : argumentos[i + 1];
  };
const modo = ler("--modo", "seguro"),
  plataforma = ler("--plataforma", "all");
if (
  !["seguro", "demonstracao", "convites"].includes(modo) ||
  !["all", "web", "android", "ios"].includes(plataforma)
)
  throw new Error(
    "Informe --modo seguro|demonstracao|convites e --plataforma all|web|android|ios.",
  );
const saida = `.local/export-${modo}-validacao`,
  temporario = path.join(raiz, ".local/execucao/temporarios");
await mkdir(temporario, { recursive: true });
const ambiente = {
  ...process.env,
  TEMP: temporario,
  TMP: temporario,
  APP_ENV: "development",
  VIVA_LOGIN_DEMONSTRACAO: String(modo === "demonstracao"),
  VIVA_ACESSO_TESTADORES: String(modo === "convites"),
  VIVA_ATUALIZACOES: "false",
  EXPO_NO_TELEMETRY: "1",
  EXPO_PUBLIC_API_BASE_URL: ler("--api", "http://127.0.0.1:8080"),
};
const processo = spawn(
  process.execPath,
  [
    carregar.resolve("expo/bin/cli"),
    "export",
    "--platform",
    plataforma,
    "--output-dir",
    saida,
  ],
  { cwd: raiz, env: ambiente, windowsHide: true, stdio: "inherit" },
);
const codigo = await new Promise((resolver, rejeitar) => {
  processo.once("error", rejeitar);
  processo.once("exit", resolver);
});
if (codigo !== 0) process.exitCode = Number(codigo ?? 1);
else {
  const metadados = plataforma==="web"?{}:JSON.parse(await readFile(path.join(raiz, saida, "metadata.json"), "utf8")), arquivos = [];
  const entradas=Object.entries(metadados.fileMetadata??{}).map(([sistema,dados])=>[sistema,dados.bundle]);
  if(plataforma==="all"||plataforma==="web"){
    const pagina=await readFile(path.join(raiz,saida,"index.html"),"utf8");
    for(const referencia of pagina.matchAll(/src=["']\/?(_expo\/static\/js\/web\/[^"']+\.js)["']/g))entradas.push(["web",referencia[1]]);
  }
  for (const [sistema, relativo] of entradas) {
    if (!relativo) continue;
    const arquivo = path.resolve(raiz, saida, relativo),
      base = path.resolve(raiz, saida) + path.sep;
    if (!arquivo.startsWith(base))
      throw new Error("Caminho de bundle inválido.");
    const conteudo = await readFile(arquivo);
    if (!(await stat(arquivo)).size) throw new Error("Bundle vazio.");
    arquivos.push({
      sistema,
      arquivo: relativo,
      bytes: conteudo.length,
      sha256: createHash("sha256").update(conteudo).digest("hex"),
      hermes: relativo.endsWith(".hbc"),
    });
  }
  for(const sistema of plataforma==="all"?["android","ios","web"]:[plataforma])if(!arquivos.some(arquivo=>arquivo.sistema===sistema))throw new Error(`Bundle ${sistema} não encontrado.`);
  await writeFile(
    path.join(temporario, "..", `export-${modo}.json`),
    JSON.stringify(
      { modo, plataforma, validacaoLocal: true, instalavel: false, arquivos },
      null,
      2,
    ),
  );
  console.log(
    "Exportação local verificada. Bundles não são APK/IPA e não comprovam notificações ou testes físicos.",
  );
}
