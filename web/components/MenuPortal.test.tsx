import { describe, expect, it, vi } from "vitest";
import { render, screen } from "@testing-library/react";
import { gruposMenu, MenuPortal } from "./MenuPortal";

vi.mock("next/navigation", () => ({ usePathname: () => "/pacientes/123" }));

const rotulos = (administrador: boolean, producao: boolean) =>
  gruposMenu(administrador, producao).flatMap((grupo) =>
    grupo.itens.map((item) => item.rotulo),
  );

describe("menu do portal", () => {
  it("mostra só o que cada perfil pode abrir", () => {
    expect(rotulos(false, false)).not.toContain("Grupo de testes");
    expect(rotulos(false, true)).not.toContain("Equipe");
    expect(rotulos(true, false)).toContain("Grupo de testes");
    expect(rotulos(true, false)).not.toContain("Equipe");
    expect(rotulos(true, true)).toContain("Equipe");
    expect(rotulos(true, true)).not.toContain("Grupo de testes");
  });

  it("organiza os itens em grupos e marca a página atual", () => {
    render(<MenuPortal />);
    expect(screen.getByText("Acompanhamento")).toBeInTheDocument();
    expect(
      screen.getByRole("link", { name: "Lista de pacientes" }),
    ).toHaveAttribute("aria-current", "page");
    expect(
      screen.getByRole("link", { name: "Cadastrar paciente" }),
    ).not.toHaveAttribute("aria-current");
  });
});
