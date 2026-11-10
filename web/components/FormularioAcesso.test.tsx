import { fireEvent, render, screen } from "@testing-library/react";
import { describe, expect, it } from "vitest";
import { FormularioAcesso } from "./FormularioAcesso";

describe("acesso profissional", () => {
  it("possui rótulos acessíveis e permite mostrar e ocultar a senha", () => {
    render(<FormularioAcesso />);
    expect(screen.getByLabelText("E-mail institucional")).toHaveAttribute(
      "autocomplete",
      "username",
    );
    const senha = screen.getByLabelText("Senha");
    expect(senha).toHaveAttribute("type", "password");
    fireEvent.click(screen.getByRole("button", { name: "Mostrar senha" }));
    expect(senha).toHaveAttribute("type", "text");
    expect(
      screen.getByRole("button", { name: "Ocultar senha" }),
    ).toHaveAttribute("aria-pressed", "true");
    fireEvent.click(screen.getByRole("button", { name: "Ocultar senha" }));
    expect(senha).toHaveAttribute("type", "password");
    expect(
      screen.getByRole("button", { name: "Entrar na plataforma" }),
    ).toHaveAttribute("type", "submit");
  });

  it("mostra o código do autenticador também fora da produção, sem obrigar", () => {
    const homologacao = render(<FormularioAcesso />).container;
    expect(homologacao).toHaveTextContent("(se a sua conta tiver)");
    expect(
      homologacao.querySelector('input[name="codigoMfa"]'),
    ).not.toBeRequired();
    const producao = render(<FormularioAcesso exigirCodigo />).container;
    expect(producao).not.toHaveTextContent("(se a sua conta tiver)");
    expect(producao.querySelector('input[name="codigoMfa"]')).toBeRequired();
  });
});
