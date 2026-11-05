import { render, screen, fireEvent, cleanup } from "@testing-library/react";
import { afterEach, it, expect, vi } from "vitest";
import { CadastroPaciente } from "./CadastroPaciente";
afterEach(() => {
  cleanup();
  vi.unstubAllGlobals();
});
it("cadastro habilitado pelo servidor confirma acesso direto, não solicita SMS e permite novo cadastro", async () => {
  const digitos = Array.from({ length: 9 }, () =>
    Math.floor(Math.random() * 10),
  );
  for (const tamanho of [9, 10]) {
    const resto =
      11 - (digitos.reduce((s, n, i) => s + n * (tamanho + 1 - i), 0) % 11);
    digitos.push(resto >= 10 ? 0 : resto);
  }
  const cpf = digitos.join("");
  const buscar = vi
    .fn()
    .mockResolvedValue(
      Response.json({
        patient: {
          id: "00000000-0000-4000-8000-000000000001",
          displayName: "Paciente fictício do teste",
          modality: "APP",
        },
        acesso: { estado: "DEMONSTRACAO_HABILITADA", smsDisponivel: false },
      }),
    );
  vi.stubGlobal("fetch", buscar);
  render(<CadastroPaciente />);
  fireEvent.change(screen.getByLabelText("Nome completo"), {
    target: { value: "Paciente fictício do teste" },
  });
  fireEvent.change(screen.getByLabelText("CPF"), { target: { value: cpf } });
  fireEvent.change(screen.getByLabelText("Data de nascimento"), {
    target: { value: "01/01/1950" },
  });
  fireEvent.change(screen.getByLabelText("Telefone com DDD"), {
    target: { value: "11990000002" },
  });
  fireEvent.submit(
    screen.getByRole("button", { name: "Salvar paciente" }).closest("form")!,
  );
  await screen.findByRole("heading", {
    name: "Paciente cadastrado com sucesso!",
  });
  expect(
    screen.getByText(
      "O paciente já pode acessar o Viva+ utilizando o CPF e a data de nascimento cadastrados.",
    ),
  ).toBeInTheDocument();
  expect(
    screen.queryByRole("button", { name: "Solicitar código por SMS" }),
  ).toBeNull();
  expect(screen.queryByLabelText("Sua senha profissional")).toBeNull();
  expect(buscar).toHaveBeenCalledTimes(1);
  expect(JSON.parse(buscar.mock.calls[0]![1].body).dataNascimento).toBe(
    "1950-01-01",
  );
  expect(
    screen.getByRole("link", { name: "Abrir ficha do paciente" }),
  ).toHaveAttribute("href", "/pacientes/00000000-0000-4000-8000-000000000001");
  expect(
    screen.getByRole("link", { name: "Voltar para pacientes" }),
  ).toHaveAttribute("href", "/pacientes");
  fireEvent.click(
    screen.getByRole("button", { name: "Cadastrar outro paciente" }),
  );
  expect(screen.getByLabelText("CPF")).toHaveValue("");
});
