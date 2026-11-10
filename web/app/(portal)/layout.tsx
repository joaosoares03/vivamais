import type { ReactNode } from "react";
import Link from "next/link";
import {
  PreferenciasPortal,
  type Preferencias,
} from "@/components/PreferenciasPortal";
import { buscarSessao, requisicaoAutenticada } from "@/services/api";
import { MarcaViva, Icone } from "@/components/Icones";
import {
  BotaoAbrirMenu,
  BotaoRecolherMenu,
  EstruturaPortal,
  MenuPortal,
} from "@/components/MenuPortal";
import { portalEmProducao } from "@/services/modoProducao";

export default async function LayoutPortal({
  children,
}: {
  children: ReactNode;
}) {
  const { user } = await buscarSessao();
  const administrador = user.role === "ADMIN";
  const producao = portalEmProducao();
  const [preferencias, painel] = await Promise.all([
    requisicaoAutenticada<Preferencias>("/conta/preferencias").catch(
      () => null,
    ),
    requisicaoAutenticada<{ organizationName?: string }>("/dashboard").catch(
      () => null,
    ),
  ]);
  const iniciais = user.displayName
    .split(/\s+/)
    .filter((parte) => /^\p{L}/u.test(parte))
    .slice(0, 2)
    .map((parte) => parte.charAt(0).toLocaleUpperCase("pt-BR"))
    .join("");
  return (
    <PreferenciasPortal key={user.id} iniciais={preferencias}>
      <EstruturaPortal>
        <aside className="sidebar" id="menu-lateral" aria-label="Navegação">
          <Link
            href="/painel"
            className="brand-link"
            aria-label="Viva+, início"
          >
            <MarcaViva />
            <span className="identidade-portal">
              Viva+
              <small>Portal profissional</small>
            </span>
          </Link>
          <MenuPortal administrador={administrador} producao={producao} />
          <div className="sidebar-bottom">
            <Link href="/privacidade">Privacidade</Link>
            {!producao && (
              <span className="aviso-ambiente">
                Ambiente de testes · somente dados fictícios
              </span>
            )}
            <BotaoRecolherMenu />
          </div>
        </aside>
        <div className="portal-body">
          <header className="portal-header">
            <BotaoAbrirMenu />
            <form
              method="get"
              action="/pacientes"
              className="busca-cabecalho"
              role="search"
            >
              <label className="sr-only" htmlFor="busca-cabecalho">
                Buscar paciente
              </label>
              <span className="icone-busca-portal">
                <Icone name="search" size={18} />
              </span>
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
                  {administrador ? "Administração" : "Profissional de saúde"}
                  {painel?.organizationName
                    ? ` · ${painel.organizationName}`
                    : ""}
                </small>
              </span>
              <Link
                href="/configuracoes"
                className="avatar-usuario"
                aria-label="Minha conta e preferências"
                title="Minha conta e preferências"
              >
                {iniciais || "?"}
              </Link>
              <form method="post" action="/api/logout">
                <button className="logout-button" type="submit">
                  <Icone name="logout" size={18} />
                  <span>Sair</span>
                </button>
              </form>
            </div>
          </header>
          <main id="conteudo" className="portal-content">
            {children}
          </main>
          <footer className="portal-footer">
            Viva+ · Pulso em Dia · O portal não substitui avaliação profissional
          </footer>
        </div>
      </EstruturaPortal>
    </PreferenciasPortal>
  );
}
