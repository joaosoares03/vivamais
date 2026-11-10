// Backup de produção: banco cifrado, objetos do Storage e manifesto com SHA-256.
// Uso: node infra/producao/backup.mjs criar <pasta-nova>
//      node infra/producao/backup.mjs decifrar <banco.dump.cifrado> <saida>
// Ambiente: PG* (ou PGPASSFILE), BACKUP_KEY_FILE, SUPABASE_URL, SUPABASE_STORAGE_BUCKET, SUPABASE_SECRET_KEY.
// BACKUP_KEY_FILE guarda 32 bytes em Base64 e fica em custódia separada do backup.
import { spawnSync } from "node:child_process";
import {
  createCipheriv,
  createDecipheriv,
  createHash,
  randomBytes,
} from "node:crypto";
import { createReadStream, createWriteStream } from "node:fs";
import { mkdir, open, readFile, rm, stat, writeFile } from "node:fs/promises";
import { dirname, join } from "node:path";
import { pipeline } from "node:stream/promises";

const MARCA = Buffer.from("VIVAP1");

async function chaveBackup() {
  const caminho = process.env.BACKUP_KEY_FILE;
  if (!caminho) throw new Error("Defina BACKUP_KEY_FILE.");
  const chave = Buffer.from((await readFile(caminho, "utf8")).trim(), "base64");
  if (chave.length !== 32)
    throw new Error("A chave de backup precisa de 32 bytes em Base64.");
  return chave;
}

async function resumo(arquivo) {
  const hash = createHash("sha256");
  await pipeline(createReadStream(arquivo), hash);
  return hash.digest("hex");
}

export async function cifrar(origem, destino, chave) {
  const iv = randomBytes(12);
  const cifra = createCipheriv("aes-256-gcm", chave, iv);
  const saida = createWriteStream(destino);
  saida.write(Buffer.concat([MARCA, iv]));
  await pipeline(createReadStream(origem), cifra, saida, { end: false });
  await new Promise((pronto, falha) =>
    saida.end(cifra.getAuthTag(), (erro) => (erro ? falha(erro) : pronto())),
  );
}

export async function decifrar(origem, destino, chave) {
  const tamanho = (await stat(origem)).size;
  const cabecalho = MARCA.length + 12;
  const leitura = Buffer.alloc(cabecalho);
  const arquivo = await open(origem);
  await arquivo.read(leitura, 0, cabecalho, 0);
  await arquivo.close();
  if (!leitura.subarray(0, MARCA.length).equals(MARCA))
    throw new Error("Arquivo de backup inválido.");
  const fim = await new Promise((pronto, falha) => {
    const partes = [];
    createReadStream(origem, { start: tamanho - 16 })
      .on("data", (parte) => partes.push(parte))
      .on("end", () => pronto(Buffer.concat(partes)))
      .on("error", falha);
  });
  const decifra = createDecipheriv(
    "aes-256-gcm",
    chave,
    leitura.subarray(MARCA.length),
  );
  decifra.setAuthTag(fim);
  await pipeline(
    createReadStream(origem, { start: cabecalho, end: tamanho - 17 }),
    decifra,
    createWriteStream(destino),
  );
}

async function listarObjetos(base, bucket, cabecalhos) {
  const objetos = [];
  for (let deslocamento = 0; ; deslocamento += 1000) {
    const resposta = await fetch(`${base}/storage/v1/object/list/${bucket}`, {
      method: "POST",
      headers: { ...cabecalhos, "Content-Type": "application/json" },
      body: JSON.stringify({ prefix: "", limit: 1000, offset: deslocamento }),
    });
    if (!resposta.ok)
      throw new Error(`Listagem do Storage falhou: HTTP ${resposta.status}.`);
    const pagina = await resposta.json();
    objetos.push(...pagina.filter((item) => item.id).map((item) => item.name));
    if (pagina.length < 1000) return objetos;
  }
}

async function copiarObjetos(pasta) {
  const {
    SUPABASE_URL: base,
    SUPABASE_STORAGE_BUCKET: bucket,
    SUPABASE_SECRET_KEY: chave,
  } = process.env;
  if (!base || !bucket || !chave)
    throw new Error("Defina as variáveis do Storage.");
  const cabecalhos = { Authorization: `Bearer ${chave}`, apikey: chave };
  const resultado = {};
  for (const nome of await listarObjetos(base, bucket, cabecalhos)) {
    const resposta = await fetch(
      `${base}/storage/v1/object/${bucket}/${encodeURIComponent(nome)}`,
      { headers: cabecalhos },
    );
    if (!resposta.ok)
      throw new Error(`Download de objeto falhou: HTTP ${resposta.status}.`);
    const destino = join(pasta, "objetos", nome);
    await mkdir(dirname(destino), { recursive: true });
    await writeFile(destino, Buffer.from(await resposta.arrayBuffer()), {
      flag: "wx",
    });
    resultado[nome] = await resumo(destino);
  }
  return resultado;
}

async function criar(pasta) {
  const chave = await chaveBackup();
  await mkdir(pasta);
  const claro = join(pasta, "banco.dump"),
    cifrado = `${claro}.cifrado`;
  const dump = spawnSync(
    "pg_dump",
    [
      "--format=custom",
      "--no-owner",
      "--no-acl",
      "--schema=viva",
      `--file=${claro}`,
    ],
    { stdio: ["ignore", "ignore", "inherit"] },
  );
  if (dump.status !== 0) throw new Error("pg_dump falhou.");
  await cifrar(claro, cifrado, chave);
  await rm(claro);
  const objetos = await copiarObjetos(pasta);
  await writeFile(
    join(pasta, "manifesto.json"),
    JSON.stringify(
      {
        criadoEm: new Date().toISOString(),
        banco: await resumo(cifrado),
        objetos,
      },
      null,
      1,
    ),
  );
  console.log(`Backup concluído: ${Object.keys(objetos).length} objeto(s).`);
}

const [modo, primeiro, segundo] = process.argv.slice(2);
if (modo === "criar" && primeiro) await criar(primeiro);
else if (modo === "decifrar" && primeiro && segundo)
  await decifrar(primeiro, segundo, await chaveBackup());
else if (modo)
  throw new Error("Use: criar <pasta> ou decifrar <arquivo> <saida>.");
