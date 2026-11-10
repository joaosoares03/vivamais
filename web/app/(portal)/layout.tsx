import type { ReactNode } from "react";
import Link from "next/link";
import {
  PreferenciasPortal,
  type Preferencias,
} from "@/components/PreferenciasPortal";
import { buscarSessao, requisicaoAutenticada } from "@/services/api";
import { MarcaViva, Icone } from "@/components/Icones";
import { MenuPortal } from "@/components/MenuPortal";
import { portalEmProducao } from "@/services/modoProducao";

export default async function LayoutPortal({
  children,
}: {
  children: ReactNode;
}) {
  const { user } = await buscarSessao();
  const administrador = user.role === "ADMIN";
  const producao = portalEmProducao();
  const preferencias = await requisicaoAutenticada<Preferencias>(
    "/conta/preferencias",
  ).catch(() => null);
  return (
    <PreferenciasPortal key={user.id} iniciais={preferencias}>
      <div className="portal-shell">
        <aside className="sidebar">
          <Link
            href="/painel"
            className="brand-link"
            aria-label="Viva+, início"
          >
            <MarcaViva />
            <span className="identidade-portal">Portal profissional</span>
          </Link>
          <MenuPortal administrador={administrador} producao={producao} />
          <div className="sidebar-bottom">
            <Link href="/suporte">
              Ajuda e suporte <Icone name="arrow" size={17} />
            </Link>
            <Link href="/privacidade">Privacidade</Link>
            {!producao && (
              <span>
                Ambiente de desenvolvimento
                <br />
                Somente dados fictícios
              </span>
            )}
          </div>
        </aside>
        <div className="portal-body">
          <header className="portal-header">
            <form method="get" action="/pacientes" className="busca-cabecalho">
              <label className="sr-only" htmlFor="busca-cabecalho">
                Buscar paciente
              </label>
              <span className="icone-busca-portal"><Icone name="search" size={19} /></span>
              <input
                id="busca-cabecalho"
                name="busca"
                type="search"
                maxLength={120}
                placeholder="Buscar paciente por nome"
              />
              <button type="submit" className="sr-only">
                Buscar
              </button>
            </form>
            <div className="user-area">
              <span className="user-meta">
                <strong>{user.displayName}</strong>
                <small>
                  {administrador ? "Administrador" : "Profissional de saúde"}
                </small>
              </span>
              <form method="post" action="/api/logout">
                <button className="logout-button" type="submit">
                  <Icone name="logout" size={19} /> Sair
                </button>
              </form>
            </div>
          </header>
          <main id="conteudo" className="portal-content">
            {children}
          </main>
          <footer className="portal-footer">
            Viva+ / Pulso em Dia · Acompanhamento de saúde
          </footer>
        </div>
      </div>
    </PreferenciasPortal>
  );
}
