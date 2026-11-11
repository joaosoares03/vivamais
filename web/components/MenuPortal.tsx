"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import {
  createContext,
  useContext,
  useEffect,
  useState,
  type ReactNode,
} from "react";
import { Icone, type NomeIcone } from "./Icones";

type Item = {
  href: string;
  rotulo: string;
  icone: NomeIcone;
  ativo: (caminho: string) => boolean;
};
type Grupo = { titulo: string; itens: Item[] };

/** Só lista telas que existem e que o perfil pode abrir. Unidade real usa contas por convite (Equipe); a de demonstração, o Grupo de testes. */
export function gruposMenu(
  administrador: boolean,
  contasInstitucionais: boolean,
): Grupo[] {
  const gestao: Item[] = [
    {
      href: "/relatorios",
      rotulo: "Relatórios",
      icone: "chart",
      ativo: (c) => c.startsWith("/relatorios"),
    },
  ];
  if (administrador && contasInstitucionais)
    gestao.push({
      href: "/contas",
      rotulo: "Equipe",
      icone: "people",
      ativo: (c) => c.startsWith("/contas"),
    });
  if (administrador && !contasInstitucionais)
    gestao.push({
      href: "/grupo-testes",
      rotulo: "Grupo de testes",
      icone: "people",
      ativo: (c) => c.startsWith("/grupo-testes"),
    });
  return [
    {
      titulo: "Visão geral",
      itens: [
        {
          href: "/painel",
          rotulo: "Início",
          icone: "grid",
          ativo: (c) => c === "/painel",
        },
      ],
    },
    {
      titulo: "Pacientes",
      itens: [
        {
          href: "/pacientes",
          rotulo: "Lista de pacientes",
          icone: "people",
          ativo: (c) => c.startsWith("/pacientes") && c !== "/pacientes/novo",
        },
        {
          href: "/pacientes/novo",
          rotulo: "Cadastrar paciente",
          icone: "plus",
          ativo: (c) => c === "/pacientes/novo",
        },
      ],
    },
    {
      titulo: "Acompanhamento",
      itens: [
        {
          href: "/consultas",
          rotulo: "Consultas",
          icone: "calendar",
          ativo: (c) => c.startsWith("/consultas"),
        },
      ],
    },
    { titulo: "Gestão", itens: gestao },
    {
      titulo: "Sistema",
      itens: [
        {
          href: "/configuracoes",
          rotulo: "Configurações",
          icone: "settings",
          ativo: (c) => c.startsWith("/configuracoes"),
        },
        {
          href: "/suporte",
          rotulo: "Ajuda e suporte",
          icone: "help",
          ativo: (c) => c.startsWith("/suporte"),
        },
      ],
    },
  ];
}

export function MenuPortal({
  administrador = false,
  contasInstitucionais = false,
}: {
  administrador?: boolean;
  contasInstitucionais?: boolean;
}) {
  const caminho = usePathname();
  return (
    <nav className="portal-nav" aria-label="Menu principal">
      {gruposMenu(administrador, contasInstitucionais).map((grupo) => (
        <div className="grupo-menu" key={grupo.titulo}>
          <span>{grupo.titulo}</span>
          {grupo.itens.map((item) => (
            <Link
              key={item.href}
              href={item.href}
              title={item.rotulo}
              aria-current={item.ativo(caminho) ? "page" : undefined}
            >
              <Icone name={item.icone} size={20} />
              <span className="rotulo-menu">{item.rotulo}</span>
            </Link>
          ))}
        </div>
      ))}
    </nav>
  );
}

type EstadoMenu = {
  aberto: boolean;
  recolhido: boolean;
  alternarAberto: () => void;
  alternarRecolhido: () => void;
};
const ContextoMenu = createContext<EstadoMenu>({
  aberto: false,
  recolhido: false,
  alternarAberto: () => undefined,
  alternarRecolhido: () => undefined,
});

/** Menu recolhível no desktop e em gaveta no tablet e no celular. */
export function EstruturaPortal({ children }: { children: ReactNode }) {
  const caminho = usePathname();
  const [aberto, definirAberto] = useState(false);
  const [recolhido, definirRecolhido] = useState(false);
  useEffect(() => {
    try {
      definirRecolhido(
        window.localStorage.getItem("viva-menu-recolhido") === "1",
      );
    } catch {
      // Preferência visual opcional; sem armazenamento o menu fica aberto.
    }
  }, []);
  useEffect(() => definirAberto(false), [caminho]);
  useEffect(() => {
    if (!aberto) return;
    const fechar = (evento: KeyboardEvent) => {
      if (evento.key === "Escape") definirAberto(false);
    };
    window.addEventListener("keydown", fechar);
    return () => window.removeEventListener("keydown", fechar);
  }, [aberto]);
  const estado: EstadoMenu = {
    aberto,
    recolhido,
    alternarAberto: () => definirAberto((valor) => !valor),
    alternarRecolhido: () =>
      definirRecolhido((valor) => {
        try {
          window.localStorage.setItem("viva-menu-recolhido", valor ? "0" : "1");
        } catch {
          // Preferência visual opcional.
        }
        return !valor;
      }),
  };
  return (
    <ContextoMenu.Provider value={estado}>
      <div
        className="portal-shell"
        data-menu-aberto={aberto}
        data-recolhido={recolhido}
      >
        {children}
        <button
          type="button"
          className="fundo-menu"
          aria-label="Fechar menu"
          tabIndex={-1}
          onClick={() => definirAberto(false)}
        />
      </div>
    </ContextoMenu.Provider>
  );
}

export function BotaoAbrirMenu() {
  const { aberto, alternarAberto } = useContext(ContextoMenu);
  return (
    <button
      type="button"
      className="abrir-menu"
      aria-label={aberto ? "Fechar menu" : "Abrir menu"}
      aria-expanded={aberto}
      aria-controls="menu-lateral"
      onClick={alternarAberto}
    >
      <Icone name="menu" size={22} />
    </button>
  );
}

export function BotaoRecolherMenu() {
  const { recolhido, alternarRecolhido } = useContext(ContextoMenu);
  return (
    <button
      type="button"
      className="recolher-menu"
      aria-pressed={recolhido}
      onClick={alternarRecolhido}
    >
      <Icone name="chevron" size={18} />
      <span className="rotulo-menu">
        {recolhido ? "Expandir menu" : "Recolher menu"}
      </span>
    </button>
  );
}
