import { render, screen, fireEvent, waitFor, cleanup } from "@testing-library/react";
import { afterEach, it, expect, vi } from "vitest";
import { AtivarProfissionalTeste } from "./AtivarProfissionalTeste";
afterEach(() => { cleanup(); vi.unstubAllGlobals(); window.history.replaceState(null,"","/"); });
it("retira o segredo da URL, exige confirmação e entrega o identificador somente após ativação", async () => {
  const convite="a".repeat(43);window.history.replaceState(null,"",`/convite-profissional#${convite}`);
  const buscar=vi.fn().mockResolvedValue(Response.json({email:"conta-ficticia@grupo.vivamais.invalid"}));vi.stubGlobal("fetch",buscar);
  render(<AtivarProfissionalTeste />);expect(window.location.hash).toBe("");
  fireEvent.change(screen.getByLabelText("Crie sua senha"),{target:{value:"somente-teste-123"}});fireEvent.change(screen.getByLabelText("Repita sua senha"),{target:{value:"diferente"}});fireEvent.click(screen.getByRole("button",{name:"Ativar minha conta profissional"}));expect(buscar).not.toHaveBeenCalled();
  fireEvent.change(screen.getByLabelText("Repita sua senha"),{target:{value:"somente-teste-123"}});fireEvent.click(screen.getByRole("button",{name:"Ativar minha conta profissional"}));
  await waitFor(() => expect(screen.getByText("Conta ativada")).toBeVisible());
  expect(JSON.parse(buscar.mock.calls[0]![1].body).convite).toBe(convite);
  expect(screen.getByRole("link", { name: "Entrar no portal" })).toHaveAttribute("href", "/");

  const email = "conta-ficticia@grupo.vivamais.invalid";
  const campo = screen.getByRole<HTMLTextAreaElement>("textbox", {
    name: "Identificador de acesso",
  });
  expect(campo).toHaveValue(email);
  expect(campo).toHaveAttribute("readonly");

  const copiar = vi.fn().mockResolvedValueOnce(undefined).mockRejectedValueOnce(new Error());
  vi.stubGlobal("navigator", { clipboard: { writeText: copiar } });
  const botao = screen.getByRole("button", { name: "Copiar e-mail" });
  fireEvent.click(botao);
  expect(await screen.findByText("E-mail copiado.")).toBeVisible();
  expect(copiar).toHaveBeenCalledWith(email);

  fireEvent.click(botao);
  expect(await screen.findByText("Copie manualmente o e-mail selecionado.")).toBeVisible();
  expect(campo).toHaveFocus();
  expect(campo.selectionStart).toBe(0);
  expect(campo.selectionEnd).toBe(email.length);
});
it("não envia convite ausente",()=>{const buscar=vi.fn();vi.stubGlobal("fetch",buscar);render(<AtivarProfissionalTeste />);expect(screen.queryByRole("button")).not.toBeInTheDocument();expect(buscar).not.toHaveBeenCalled();});
