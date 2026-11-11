import { createReadStream } from "node:fs";
import { realpath, stat } from "node:fs/promises";
import { createServer } from "node:http";
import { extname, isAbsolute, relative, resolve } from "node:path";
import { fileURLToPath } from "node:url";

// Local verification of an already exported Expo bundle. This is not a production host.
const raizProjeto = fileURLToPath(new URL("../", import.meta.url));
const diretorioExport = process.env.VIVA_PREVIEW_DIRECTORY ?? "dist";
if (!/^(dist|\.local[\\/]export-[a-z0-9-]+)$/.test(diretorioExport))
  throw new Error("Diretório de export inválido.");
const root = await realpath(resolve(raizProjeto, diretorioExport));
const porta = Number(process.env.VIVA_PREVIEW_PORT ?? 8081);
if (!Number.isInteger(porta) || porta < 1024 || porta > 65535)
  throw new Error("Porta local inválida.");
const contentTypes = {
  ".html": "text/html; charset=utf-8",
  ".js": "application/javascript; charset=utf-8",
  ".css": "text/css; charset=utf-8",
  ".json": "application/json; charset=utf-8",
  ".png": "image/png",
  ".gif": "image/gif",
  ".mp4": "video/mp4",
  ".jpg": "image/jpeg",
  ".jpeg": "image/jpeg",
  ".svg": "image/svg+xml",
  ".webp": "image/webp",
  ".ico": "image/x-icon",
  ".woff": "font/woff",
  ".woff2": "font/woff2",
  ".ttf": "font/ttf",
};

function insideRoot(candidate) {
  const path = relative(root, candidate);
  return (
    path === "" ||
    (!isAbsolute(path) &&
      path !== ".." &&
      !path.startsWith("../") &&
      !path.startsWith("..\\"))
  );
}

async function resolveFile(candidate) {
  try {
    const canonical = await realpath(candidate);
    if (!insideRoot(canonical)) return null;
    const info = await stat(canonical);
    return info.isFile() ? { path: canonical, size: info.size } : null;
  } catch (error) {
    if (error.code === "ENOENT" || error.code === "ENOTDIR") return null;
    throw error;
  }
}

const server = createServer(async (request, response) => {
  response.setHeader("Cache-Control", "no-store");
  response.setHeader("X-Content-Type-Options", "nosniff");
  response.setHeader("Referrer-Policy", "no-referrer");
  response.setHeader("X-Frame-Options", "DENY");
  if (request.method !== "GET" && request.method !== "HEAD") {
    response.writeHead(405, { Allow: "GET, HEAD" }).end();
    return;
  }
  try {
    // Decode before path resolution so both encoded traversal and Windows separators are rejected.
    const rawPath = (request.url ?? "/").split("?")[0];
    let path;
    try {
      path = decodeURIComponent(rawPath);
    } catch {
      response.writeHead(400).end();
      return;
    }
    if (
      !path.startsWith("/") ||
      path.startsWith("//") ||
      /[\\\x00%]/.test(path) ||
      path.split("/").some((segment) => segment.startsWith("."))
    ) {
      response.writeHead(403).end();
      return;
    }
    const candidate = resolve(root, `.${path}`);
    if (!insideRoot(candidate)) {
      response.writeHead(403).end();
      return;
    }
    let file = await resolveFile(candidate);
    // Expo Router routes do not have a physical HTML file in a single-page export.
    if (!file && !extname(path))
      file = await resolveFile(resolve(root, "index.html"));
    if (!file) {
      response.writeHead(404).end();
      return;
    }
    const cabecalhos = {
      "Content-Type":
        contentTypes[extname(file.path).toLowerCase()] ??
        "application/octet-stream",
      "Content-Length": file.size,
      "Accept-Ranges": "bytes",
    };
    let inicio = 0,
      fim = file.size - 1,
      codigo = 200;
    if (request.headers.range) {
      const partes = /^bytes=(\d*)-(\d*)$/.exec(request.headers.range);
      if (!partes || (!partes[1] && !partes[2])) {
        response
          .writeHead(416, { "Content-Range": `bytes */${file.size}` })
          .end();
        return;
      }
      inicio = partes[1]
        ? Number(partes[1])
        : Math.max(0, file.size - Number(partes[2]));
      fim =
        partes[1] && partes[2]
          ? Math.min(Number(partes[2]), file.size - 1)
          : file.size - 1;
      if (
        !Number.isSafeInteger(inicio) ||
        !Number.isSafeInteger(fim) ||
        inicio > fim ||
        inicio >= file.size
      ) {
        response
          .writeHead(416, { "Content-Range": `bytes */${file.size}` })
          .end();
        return;
      }
      codigo = 206;
      cabecalhos["Content-Length"] = fim - inicio + 1;
      cabecalhos["Content-Range"] = `bytes ${inicio}-${fim}/${file.size}`;
    }
    response.writeHead(codigo, cabecalhos);
    if (request.method === "HEAD") {
      response.end();
      return;
    }
    const stream = createReadStream(file.path, { start: inicio, end: fim });
    stream.on("error", () => response.destroy());
    stream.pipe(response);
  } catch {
    if (response.headersSent) response.destroy();
    else response.writeHead(500).end();
  }
});

server.requestTimeout = 15000;
server.headersTimeout = 10000;
server.listen(porta, "127.0.0.1", () => {
  console.log(`Expo export preview: http://127.0.0.1:${porta}`);
});
for (const signal of ["SIGINT", "SIGTERM"]) {
  process.on(signal, () => server.close(() => process.exit(0)));
}
