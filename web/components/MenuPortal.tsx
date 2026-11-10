"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import { Icone } from "./Icones";

export function MenuPortal({
  administrador = false,
  producao = false,
}: {
  administrador?: boolean;
  producao?: boolean;
}) {
  const caminho = usePathname();
  return (
    <nav className="portal-nav" aria-label="Menu principal">
      <Link
        href="/painel"
        aria-current={caminho === "/painel" ? "page" : undefined}
      >
        <Icone name="grid" /> Início
      </Link>
      <Link
        href="/pacientes"
        aria-current={
          caminho.startsWith("/pacientes") && caminho !== "/pacientes/novo"
            ? "page"
            : undefined
        }
      >
        <Icone name="people" /> Pacientes
      </Link>
      <Link
        href="/pacientes/novo"
        aria-current={caminho === "/pacientes/novo" ? "page" : undefined}
      >
        <Icone name="people" /> Cadastrar paciente
      </Link>
      <Link
        href="/consultas"
        aria-current={caminho === "/consultas" ? "page" : undefined}
      >
        <Icone name="book" /> Consultas
      </Link>
      <Link
        href="/relatorios"
        aria-current={caminho === "/relatorios" ? "page" : undefined}
      >
        <Icone name="book" /> Relatórios
      </Link>
      <Link
        href="/configuracoes"
        aria-current={caminho === "/configuracoes" ? "page" : undefined}
      >
        <Icone name="shield" /> Configurações
      </Link>
      {administrador && producao && (
        <Link
          href="/contas"
          aria-current={caminho === "/contas" ? "page" : undefined}
        >
          <Icone name="people" /> Equipe
        </Link>
      )}
      {administrador && !producao && (
        <Link
          href="/grupo-testes"
          aria-current={caminho === "/grupo-testes" ? "page" : undefined}
        >
          <Icone name="people" /> Grupo de testes
        </Link>
      )}
    </nav>
  );
}
