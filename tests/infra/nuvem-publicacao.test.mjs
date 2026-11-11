import { readFileSync } from "node:fs";
import { createRequire } from "node:module";
import { test } from "node:test";
import assert from "node:assert/strict";
const carregar = createRequire(import.meta.url);
const ignorar = carregar("ignore");
test("upload Railway permite fonte atual e impede bancos, segredos e instaláveis locais", () => {
  const regras = ignorar().add(readFileSync(new URL("../../.railwayignore", import.meta.url), "utf8"));
  for (const arquivo of ["app/convite.tsx", "services/api.ts", "infra/Dockerfile.nuvem", "infra/entrada-nuvem.sh", "backend/demo/src/main/resources/application-nuvem.yml", "backend/demo/pom.xml", "packages/contracts/src/index.ts", "patches/query-string@7.1.3.patch", "web/package.json", "assets/images/exemplo.png"])
    assert.equal(regras.ignores(arquivo), false, arquivo);
  for (const arquivo of [".local/private-files/sms-teste/consulta-privada.json", "work/postgres-local-credentials.json", ".git/config", ".env", "backend/demo/.env.production", "services/.env", "assets/assinatura.keystore", ".local/instalaveis/viva.apk", "referencias_codex/projeto.zip", "node_modules/pacote/index.js", "docs/pedido.md", "web/.next/server/app.js"])
    assert.equal(regras.ignores(arquivo), true, arquivo);
});
