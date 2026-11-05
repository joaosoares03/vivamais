import { cleanup, fireEvent, render, screen } from "@testing-library/react";
import { afterEach, describe, expect, it } from "vitest";
import { CampoData } from "./CampoData";
afterEach(cleanup);

describe("data civil no portal", () => {
  it("mostra data brasileira e envia ISO sem hora ou fuso", () => {
    render(
      <form data-testid="formulario">
        <label>
          Nascimento
          <CampoData
            name="nascimento"
            rotulo="Nascimento"
            defaultValue="1950-12-31"
            required
          />
        </label>
      </form>,
    );
    const campo = screen.getByRole("textbox", { name: "Nascimento" });
    expect(campo).toHaveValue("31/12/1950");
    fireEvent.change(campo, { target: { value: "29022024" } });
    expect(campo).toHaveValue("29/02/2024");
    expect(
      new FormData(screen.getByTestId("formulario") as HTMLFormElement).get(
        "nascimento",
      ),
    ).toBe("2024-02-29");
  });
  it("recusa dias inexistentes em vez de normalizar para o mês seguinte", () => {
    render(<CampoData name="data" rotulo="Data" required />);
    const campo = screen.getByRole("textbox", { name: "Data" });
    fireEvent.change(campo, { target: { value: "31022026" } });
    expect(campo).toBeInvalid();
    fireEvent.change(campo, { target: { value: "28022026" } });
    expect(campo).toBeValid();
  });
});
