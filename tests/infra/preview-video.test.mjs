import test from "node:test";
import assert from "node:assert/strict";
import { spawn } from "node:child_process";
import { mkdir, readFile, readdir, writeFile } from "node:fs/promises";
import { resolve } from "node:path";

test("prévia serve MP4 real, intervalos, HEAD e rejeita caminhos privados", async () => {
  const pasta = resolve(".local/export-teste-video");
  await mkdir(pasta, { recursive: true });
  const exercicio = (await readdir("assets/images/exercicios")).find((nome) =>
    nome.startsWith("ex01-"),
  );
  assert.ok(exercicio);
  const video = await readFile(
    resolve("assets/images/exercicios", exercicio, "guiado.mp4"),
  );
  await writeFile(resolve(pasta, "video.mp4"), video);
  await writeFile(
    resolve(pasta, "index.html"),
    "<!doctype html><title>Teste de mídia</title>",
  );
  const processo = spawn(process.execPath, ["infra/serve-mobile-preview.mjs"], {
    env: {
      ...process.env,
      VIVA_PREVIEW_DIRECTORY: ".local/export-teste-video",
      VIVA_PREVIEW_PORT: "18081",
    },
    stdio: ["ignore", "pipe", "pipe"],
    windowsHide: true,
  });
  try {
    await new Promise((concluir, rejeitar) => {
      const limite = setTimeout(
        () => rejeitar(new Error("Servidor de teste não iniciou")),
        10000,
      );
      processo.stdout.on("data", (dados) => {
        if (String(dados).includes("Expo export preview")) {
          clearTimeout(limite);
          concluir();
        }
      });
      processo.once("exit", (codigo) => {
        clearTimeout(limite);
        rejeitar(new Error("Servidor encerrou: " + codigo));
      });
    });
    const base = "http://127.0.0.1:18081";
    const parcial = await fetch(base + "/video.mp4", {
      headers: { Range: "bytes=20-99" },
    });
    assert.equal(parcial.status, 206);
    assert.equal(parcial.headers.get("content-type"), "video/mp4");
    assert.equal(
      parcial.headers.get("content-range"),
      `bytes 20-99/${video.length}`,
    );
    assert.deepEqual(
      Buffer.from(await parcial.arrayBuffer()),
      video.subarray(20, 100),
    );
    const fim = await fetch(base + "/video.mp4", {
      headers: { Range: "bytes=-12" },
    });
    assert.equal(fim.status, 206);
    assert.deepEqual(Buffer.from(await fim.arrayBuffer()), video.subarray(-12));
    const cabecalho = await fetch(base + "/video.mp4", { method: "HEAD" });
    assert.equal(cabecalho.headers.get("content-length"), String(video.length));
    assert.equal(await cabecalho.text(), "");
    for (const intervalo of [
      "bytes=999999999999-",
      "bytes=3-1",
      "bytes=1-2,4-5",
      "bytes=-0",
    ])
      assert.equal(
        (await fetch(base + "/video.mp4", { headers: { Range: intervalo } }))
          .status,
        416,
      );
    assert.equal((await fetch(base + "/%2elocal/secreto")).status, 403);
    assert.equal(
      (await fetch(base + "/video.mp4", { method: "POST" })).status,
      405,
    );
  } finally {
    processo.kill();
  }
});
