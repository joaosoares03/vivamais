import { describe, expect, it } from "vitest";
import {
  dataCivilValida,
  dataCivilBrasil,
  interpretarDataCivil,
  interpretarNascimento,
  instanteDeDataHoraBrasil,
  partesInstanteBrasil,
  hojeBrasil,
} from "../../packages/contracts/src";

describe("datas civis brasileiras e instantes", () => {
  it("valida bissexto, fim de mês e mudança de ano sem normalizar datas inválidas", () => {
    for (const data of [
      "2024-02-29",
      "2000-02-29",
      "2026-12-31",
      "2027-01-01",
    ]) {
      expect(dataCivilValida(data)).toBe(true);
      expect(interpretarDataCivil(dataCivilBrasil(data))).toBe(data);
    }
    for (const data of [
      "1900-02-29",
      "2026-02-29",
      "2026-04-31",
      "2026-13-01",
      "2026-00-01",
      "2026-01-00",
    ])
      expect(dataCivilValida(data)).toBe(false);
  });
  it("nascimento usa o dia brasileiro perto da meia-noite UTC", () => {
    const agora = new Date("2026-11-04T01:00:00Z");
    expect(hojeBrasil(agora)).toBe("2026-11-03");
    expect(interpretarNascimento("04/11/2026", agora)).toBeNull();
    expect(interpretarNascimento("03/11/2026", agora)).toBe("2026-11-03");
  });
  it("preserva o dia e converte o horário brasileiro independente do fuso do aparelho", () => {
    expect(instanteDeDataHoraBrasil("2026-12-31", "23:50")).toBe(
      "2027-01-01T02:50:00.000Z",
    );
    expect(partesInstanteBrasil("2027-01-01T02:50:00Z")).toEqual({
      data: "2026-12-31",
      hora: "23:50",
    });
    expect(instanteDeDataHoraBrasil("2024-02-29", "00:15")).toBe(
      "2024-02-29T03:15:00.000Z",
    );
    expect(instanteDeDataHoraBrasil("2026-11-03", "24:00")).toBeNull();
    expect(instanteDeDataHoraBrasil("2018-11-04", "00:30")).toBeNull();
  });
});
