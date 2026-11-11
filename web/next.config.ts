import type { NextConfig } from "next";

const ambiente = process.env.APP_ENV ?? "development";
if (!["development", "test", "preview", "production"].includes(ambiente))
  throw new Error("APP_ENV inválido.");
if (["preview", "production"].includes(ambiente)) {
  for (const valor of [
    process.env.API_BASE_URL,
    process.env.NEXT_PUBLIC_APLICATIVO_URL,
  ]) {
    if (!valor)
      throw new Error(
        "Homologação/produção exige endereços explícitos de API e aplicativo.",
      );
    const endereco = new URL(valor);
    if (
      endereco.protocol !== "https:" ||
      endereco.username ||
      endereco.password ||
      endereco.search ||
      endereco.hash ||
      endereco.pathname !== "/" ||
      endereco.hostname.includes("*") ||
      /^(localhost|.*\.localhost|.*\.local|127\..*|0\..*|10\..*|192\.168\..*|169\.254\..*|172\.(1[6-9]|2[0-9]|3[01])\..*|\[::1\]|\[::\]|\[f[cd].*|\[fe80:.*)\.?$/i.test(
        endereco.hostname,
      )
    )
      throw new Error(
        "Homologação/produção exige origens HTTPS sem credenciais e fora da rede local.",
      );
  }
  if (
    process.env.SPRING_PROFILES_ACTIVE?.split(",").includes("bootstrap") ||
    process.env.DEMO_BOOTSTRAP_PASSWORD
  )
    throw new Error(
      "Bootstrap não pode estar configurado no portal de produção.",
    );
}

const nextConfig: NextConfig = {
  // Somente para a sandbox Windows: permite preparar diretórios de saída antes do build.
  cleanDistDir: process.env.VIVA_BUILD_DIRETORIOS_PREPARADOS !== "1",
  webpack(configuracao) {
    // Cópias locais dos workspaces mudam sem reinstalação. Evita snapshots antigos
    // de node_modules apenas no build preparado para a sandbox Windows.
    if (process.env.VIVA_BUILD_DIRETORIOS_PREPARADOS === "1")
      configuracao.cache = false;
    // Os workspaces @viva/* são copiados para node_modules (inject-workspace-packages)
    // sem mudar de versão. Como caminho gerenciado, o cache persistente do webpack,
    // que a Vercel restaura entre deploys, reaproveitaria a cópia antiga do pacote.
    configuracao.snapshot = {
      ...configuracao.snapshot,
      managedPaths: [/^(.+?[\\/]node_modules[\\/])(?!@viva[\\/])/],
    };
    // Importação de algo que o módulo não exporta falha o build em vez de virar
    // um aviso e uma função indefinida no navegador.
    configuracao.module = configuracao.module ?? {};
    configuracao.module.parser = {
      ...configuracao.module.parser,
      javascript: {
        ...configuracao.module.parser?.javascript,
        exportsPresence: "error",
      },
    };
    return configuracao;
  },
  poweredByHeader: false,
  transpilePackages: ["@viva/contracts", "@viva/design-tokens"],
  async headers() {
    return [
      {
        source: "/:path*",
        headers: [
          { key: "X-Content-Type-Options", value: "nosniff" },
          // Preserve Origin em POSTs de navegação do formulário, sem enviar Referer a outros sites.
          { key: "Referrer-Policy", value: "same-origin" },
          { key: "X-Frame-Options", value: "DENY" },
          {
            key: "Permissions-Policy",
            value: "camera=(), microphone=(), geolocation=()",
          },
          { key: "Cache-Control", value: "private, no-store, max-age=0" },
        ],
      },
    ];
  },
};

export default nextConfig;
