import { appendFile } from "node:fs/promises";
import { resolve } from "node:path";
import { fileURLToPath } from "node:url";

export const URL_METADADOS_NVD =
  "https://nvd.nist.gov/feeds/json/cve/2.0/nvdcve-2.0-modified.meta";
const DIA_MS = 24 * 60 * 60 * 1000;

export function validarMetadadosNvd(texto, agora = Date.now()) {
  if (typeof texto !== "string" || texto.length > 4096) {
    throw new Error("Metadados NVD ausentes ou acima do limite.");
  }
  const campos = new Map();
  for (const linha of texto.trim().split(/\r?\n/)) {
    const separador = linha.indexOf(":");
    if (separador < 1) throw new Error("Formato inválido dos metadados NVD.");
    const nome = linha.slice(0, separador);
    if (campos.has(nome)) throw new Error("Campo duplicado nos metadados NVD.");
    campos.set(nome, linha.slice(separador + 1).trim());
  }
  const ultimaAtualizacao = campos.get("lastModifiedDate");
  const instante = Date.parse(ultimaAtualizacao ?? "");
  if (!Number.isFinite(instante) || !Number.isFinite(agora)) {
    throw new Error("Data inválida nos metadados NVD.");
  }
  const idadeMs = agora - instante;
  if (idadeMs > DIA_MS || idadeMs < -15 * 60 * 1000) {
    throw new Error(
      "Feed NVD desatualizado ou com data futura; auditoria bloqueada.",
    );
  }
  for (const nome of ["size", "gzSize"]) {
    const valor = campos.get(nome) ?? "";
    if (!/^[1-9]\d*$/.test(valor) || !Number.isSafeInteger(Number(valor))) {
      throw new Error("Tamanho inválido nos metadados NVD.");
    }
  }
  if (!/^[a-f\d]{64}$/i.test(campos.get("sha256") ?? "")) {
    throw new Error("SHA-256 ausente ou inválido nos metadados NVD.");
  }
  return {
    ultimaAtualizacao,
    idadeHoras: Math.max(0, idadeMs / (60 * 60 * 1000)),
    dia: new Date(agora).toISOString().slice(0, 10),
  };
}

export async function verificarFeedNvd(consultar = fetch, agora = Date.now()) {
  const resposta = await consultar(URL_METADADOS_NVD, {
    signal: AbortSignal.timeout(20_000),
    redirect: "error",
  });
  if (!resposta.ok) throw new Error(`Metadados NVD: HTTP ${resposta.status}.`);
  return validarMetadadosNvd(await resposta.text(), agora);
}

if (
  process.argv[1] &&
  fileURLToPath(import.meta.url) === resolve(process.argv[1])
) {
  try {
    const metadados = await verificarFeedNvd();
    if (process.env.GITHUB_OUTPUT) {
      await appendFile(process.env.GITHUB_OUTPUT, `dia=${metadados.dia}\n`);
    }
    console.log(
      `NVD oficial: atualização ${metadados.ultimaAtualizacao}, idade ${metadados.idadeHoras.toFixed(1)} h.`,
    );
  } catch (falha) {
    console.error(
      falha instanceof Error ? falha.message : "Feed NVD indisponível.",
    );
    process.exitCode = 1;
  }
}
