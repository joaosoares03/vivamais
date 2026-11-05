import { afterEach, describe, expect, it, vi } from "vitest";
import {
  buscarAutorrelatosPeriodo,
  diasAutorrelatos,
  periodoPressao,
} from "./periodosCuidados";

afterEach(() => vi.unstubAllGlobals());
describe("períodos do acompanhamento", () => {
  it("inclui sete datas e atravessa ano e mês sem pular o dia final", () => {
    expect(diasAutorrelatos("2026-01-03", 7)).toEqual([
      "2025-12-28",
      "2025-12-29",
      "2025-12-30",
      "2025-12-31",
      "2026-01-01",
      "2026-01-02",
      "2026-01-03",
    ]);
    expect(() => diasAutorrelatos("2026-02-30", 7)).toThrow();
  });
  it("reúne horários de todas as datas e não converte ausência em Não tomei", async () => {
    const consulta = vi
      .fn<typeof fetch>()
      .mockImplementation(async () =>
        Response.json([
          { planId: "plano", reportedAt: null, status: "NO_RESPONSE" },
        ]),
      );
    vi.stubGlobal("fetch", consulta);
    const eventos = await buscarAutorrelatosPeriodo(
      "paciente",
      "2026-01-03",
      7,
    );
    expect(consulta).toHaveBeenCalledTimes(7);
    expect(
      consulta.mock.calls.map((argumentos) => String(argumentos[0])),
    ).toHaveLength(7);
    expect(eventos).toHaveLength(7);
    expect(eventos.every((evento) => evento.status === "NO_RESPONSE")).toBe(
      true,
    );
  });
  it("não mostra um total parcial se um dia falhar", async () => {
    vi.stubGlobal(
      "fetch",
      vi
        .fn()
        .mockImplementationOnce(async () =>
          Response.json({ detail: "Falha de leitura" }, { status: 503 }),
        )
        .mockImplementation(async () => Response.json([])),
    );
    await expect(
      buscarAutorrelatosPeriodo("paciente", "2026-01-03", 7),
    ).rejects.toThrow("Falha de leitura");
  });
  it("gera campos locais para o intervalo corrido de pressão", () => {
    const agora = new Date("2026-10-19T17:30:00Z");
    expect(periodoPressao(7, agora)).toEqual({
      inicio: "2026-10-12T14:30",
      fim: "2026-10-19T14:31",
    });
  });
});
