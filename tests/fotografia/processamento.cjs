const fs = require("node:fs"),
  path = require("node:path"),
  assert = require("node:assert/strict");
const { chromium } = require("@playwright/test");
const { build } = require("esbuild");
const raiz = path.resolve(__dirname, "../..");
const saida = path.join(raiz, ".local/fotos-validacao");
async function executar() {
  fs.mkdirSync(saida, { recursive: true });
  const codigo = await build({
    entryPoints: [
      path.join(raiz, "services/fotografia/prepararFotografia.web.ts"),
    ],
    bundle: true,
    write: false,
    format: "iife",
    globalName: "Fotografias",
  });
  const navegador = await chromium.launch({ headless: true });
  try {
    const pagina = await navegador.newPage();
    await pagina.setContent(
      "<!doctype html><title>Ensaio de imagens sintéticas</title>",
    );
    await pagina.addScriptTag({ content: codigo.outputFiles[0].text });
    const resultado = await pagina.evaluate(async () => {
      const tela = document.createElement("canvas");
      tela.width = 1800;
      tela.height = 1400;
      const contexto = tela.getContext("2d");
      const pixels = contexto.createImageData(tela.width, tela.height);
      let semente = 42;
      for (let i = 0; i < pixels.data.length; i += 4) {
        for (let j = 0; j < 3; j++) {
          semente = (semente * 1664525 + 1013904223) >>> 0;
          pixels.data[i + j] = semente >>> 24;
        }
        pixels.data[i + 3] = 255;
      }
      contexto.putImageData(pixels, 0, 0);
      const blob = (tipo) =>
        new Promise((resolve) => tela.toBlob(resolve, tipo, 1));
      const png = await blob("image/png"),
        jpeg = await blob("image/jpeg");
      const resultados = [];
      const arquivos = [];
      for (const [nome, dados] of [
        ["ruido.png", png],
        ["ruido.jpg", jpeg],
        [
          "limite.jpg",
          new Blob([jpeg, new Uint8Array(10 * 1024 * 1024 - jpeg.size)], {
            type: "image/jpeg",
          }),
        ],
      ]) {
        const original = new File([dados], nome, { type: dados.type });
        const pronta = await Fotografias.prepararArquivo(original);
        resultados.push({
          nome,
          original: original.size,
          otimizado: pronta.tamanho,
          largura: pronta.largura,
          altura: pronta.altura,
          tipo: pronta.arquivo.type,
        });
        arquivos.push({
          nome,
          base64: await new Promise((resolve) => {
            const leitor = new FileReader();
            leitor.onload = () => resolve(leitor.result.split(",")[1]);
            leitor.readAsDataURL(original);
          }),
        });
        pronta.liberar();
      }
      let rejeitados = 0;
      for (const dados of [
        new File(["<svg><script>erro</script></svg>"], "foto.jpg", {
          type: "image/jpeg",
        }),
        new File([new Uint8Array(10 * 1024 * 1024 + 1)], "grande.jpg"),
        new File([new Uint8Array([255, 216, 255, 0])], "corrompida.jpg"),
      ]) {
        try {
          await Fotografias.prepararArquivo(dados);
        } catch {
          rejeitados++;
        }
      }
      return { resultados, arquivos, rejeitados };
    });
    for (const foto of resultado.resultados) {
      assert.ok(foto.original > 2097152);
      assert.ok(foto.otimizado <= 1800 * 1024);
      assert.equal(foto.tipo, "image/jpeg");
      assert.equal(foto.largura / foto.altura, 1800 / 1400);
    }
    assert.equal(resultado.rejeitados, 3);
    for (const arquivo of resultado.arquivos)
      fs.writeFileSync(
        path.join(saida, arquivo.nome),
        Buffer.from(arquivo.base64, "base64"),
      );
    const relatorio = {
      quando: new Date().toISOString(),
      aprovado: true,
      navegador: "Chromium real / processamento canvas",
      aparelhoFisico: false,
      resultados: resultado.resultados,
      rejeitados: resultado.rejeitados,
    };
    fs.writeFileSync(
      path.join(saida, "processamento.json"),
      JSON.stringify(relatorio, null, 2),
    );
    console.log(JSON.stringify(relatorio));
  } finally {
    await navegador.close();
  }
}
executar().catch(() => {
  console.error(
    "Falha no ensaio de processamento de imagens. Verifique o script e as dependências locais.",
  );
  process.exitCode = 1;
});
