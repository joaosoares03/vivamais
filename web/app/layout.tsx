import type { Metadata } from "next";
import type { ReactNode } from "react";
import { headers } from "next/headers";
import { tokens } from "@viva/design-tokens";
import "./globals.css";
import "./portal-visual.css";

export const dynamic = "force-dynamic";
export const metadata: Metadata = {
  title: { default: "Viva+ | Plataforma profissional", template: "%s | Viva+" },
  description: "Viva+ / Pulso em Dia. Plataforma de acompanhamento de saúde.",
  robots: { index: false, follow: false },
};

export default async function LayoutPrincipal({
  children,
}: {
  children: ReactNode;
}) {
  const colors = tokens.colors;
  const nonce = (await headers()).get("x-nonce") || undefined;
  const theme = `:root{--brand:${colors.primary};--brand-dark:${colors.primaryDark};--teal:${colors.teal};--surface:${colors.surface};--background:${colors.background};--ink:${colors.text};--muted:${colors.muted};--border:${colors.border};--danger:${colors.danger};--focus:${colors.focus}}`;
  return (
    <html lang="pt-BR">
      <head>
        <style nonce={nonce}>{theme}</style>
      </head>
      <body>
        <a className="skip-link" href="#conteudo">
          Pular para o conteúdo
        </a>
        {children}
      </body>
    </html>
  );
}
