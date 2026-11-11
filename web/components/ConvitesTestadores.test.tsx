import { render, screen, fireEvent, cleanup } from "@testing-library/react";
import { afterEach, it, expect, vi } from "vitest";
import { ConvitesTestadores } from "./ConvitesTestadores";
afterEach(() => {
  cleanup();
  vi.unstubAllGlobals();
  vi.unstubAllEnvs();
});
it("cria convite após senha, limpa a senha e revoga sem persistir o segredo no navegador", async () => {
  vi.stubEnv("NEXT_PUBLIC_APLICATIVO_URL", "https://paciente.example.org");
  const segredo = "t".repeat(43);
  let criado = false,
    revogado = false;
  const buscar = vi.fn().mockImplementation((url, opcoes) => {
    if (opcoes?.method === "POST") {
      if (url.endsWith("/revoke")) {
        revogado = true;
        return Promise.resolve(new Response(null, { status: 204 }));
      }
      criado = true;
      return Promise.resolve(
        Response.json({
          id: "convite-a",
          convite: segredo,
          expiraEm: "2026-11-10T10:00Z",
        }),
      );
    }
    return Promise.resolve(
      Response.json(
        criado
          ? [
              {
                id: "convite-a",
                criadoEm: "2026-11-03T10:00Z",
                expiraEm: "2030-11-10T10:00Z",
                utilizadoEm: null,
                revogadoEm: revogado ? "2026-11-03T11:00Z" : null,
              },
            ]
          : [],
      ),
    );
  });
  vi.stubGlobal("fetch", buscar);
  render(<ConvitesTestadores idPaciente="paciente-a" />);
  await screen.findByText("Nenhum convite cadastrado.");
  fireEvent.change(screen.getByLabelText("Sua senha profissional"), {
    target: { value: "credencial-unitaria" },
  });
  fireEvent.submit(
    screen.getByLabelText("Sua senha profissional").closest("form")!,
  );
  await screen.findByRole("heading", { name: "Convite criado" });
  expect(screen.getByLabelText("Sua senha profissional")).toHaveValue("");
  expect(screen.getByLabelText("Convite individual")).toHaveValue(segredo);
  const link = (
    screen.getByLabelText(
      "Link privado para iPhone e navegador",
    ) as HTMLInputElement
  ).value;
  expect(link).toBe(`https://paciente.example.org/convite#${segredo}`);
  expect(new URL(link).search).toBe("");
  fireEvent.click(screen.getByRole("button", { name: "Ocultar convite" }));
  expect(screen.queryByLabelText("Convite individual")).toBeNull();
  fireEvent.click(screen.getByRole("button", { name: "Revogar acesso" }));
  await screen.findByText(/Revogado/);
  expect(
    buscar.mock.calls.find(([, o]) => o?.method === "POST")?.[1].body,
  ).toContain('"validadeDias":7');
});
