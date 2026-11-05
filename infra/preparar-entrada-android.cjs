async function prepararEntradasNativas() {
  const fs = await import("node:fs");
  const path = await import("node:path");
  const raiz = path.resolve(__dirname, "..");
  // Somente entradas de compilação: não copia .env, banco, chaves ou arquivos privados.
  const pastaGerada = process.argv.includes("--ios") ? "ios-preparacao" : "apk";
  const destino = path.join(raiz, ".local", pastaGerada);
  fs.mkdirSync(destino, { recursive: true });
  for (const arquivo of [
    "app.config.ts",
    "package.json",
    "tsconfig.json",
    "metro.config.js",
  ])
    fs.copyFileSync(path.join(raiz, arquivo), path.join(destino, arquivo));
  for (const pasta of [
    "assets",
    "app",
    "components",
    "contexts",
    "hooks",
    "services",
  ])
    fs.cpSync(path.join(raiz, pasta), path.join(destino, pasta), {
      recursive: true,
    });
  for (const nome of ["contracts", "design-tokens"]) {
    const origem = path.join(raiz, "packages", nome),
      alvo = path.join(destino, "packages", nome);
    fs.mkdirSync(alvo, { recursive: true });
    for (const item of ["src", "package.json", "tsconfig.json"])
      fs.cpSync(path.join(origem, item), path.join(alvo, item), {
        recursive: true,
      });
  }
  console.log(
    `Entradas nativas preparadas em .local/${pastaGerada}; fontes e dados preservados.`,
  );
}
prepararEntradasNativas().catch(() => {
  console.error(
    "Não foi possível preparar as entradas nativas. Fontes originais preservadas.",
  );
  process.exitCode = 1;
});
