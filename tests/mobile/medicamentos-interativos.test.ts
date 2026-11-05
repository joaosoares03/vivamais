import { describe, it, expect } from "vitest";
import {
  deslocarDataCivil,
  extrairConviteTeste,
  type EventoMedicamento,
} from "@viva/contracts";
import { criarEnfileiradorDoses } from "../../services/medicamentos/regrasDoses";
import {
  criarFilaSincronizacao,
  type OperacaoPendente,
} from "../../services/sincronizacao/regrasSincronizacao";
import {
  calcularLembretes,
  type PlanoLembretes,
} from "../../services/lembretes/calculoLembretes";
import { resumirAgendaMedicamentos } from "../../services/medicamentos/resumoMedicamentos";
import type { AgendaMedicamentos } from "@viva/contracts";
const evento = {
  planId: "plano-a",
  scheduledAt: "2026-11-03T11:00:00Z",
  status: "NO_CONFIRMATION",
} as EventoMedicamento;
it("resumo da Home usa apenas contagens salvas de hoje e encontra o próximo dia sem repetir dose respondida", () => {
  const agenda = {
    dias: [
      {
        data: "2026-11-03",
        resumo: { previstas: 2, tomadas: 1, naoTomadas: 1, pendentes: 0 },
        eventos: [{ ...evento, status: "TAKEN" }],
      },
      {
        data: "2026-11-04",
        resumo: { previstas: 1, tomadas: 0, naoTomadas: 0, pendentes: 1 },
        eventos: [
          {
            ...evento,
            scheduledAt: "2026-11-04T11:00:00Z",
            dataProgramada: "2026-11-04",
          },
        ],
      },
    ],
  } as AgendaMedicamentos;
  const resumo = resumirAgendaMedicamentos(
    agenda,
    "2026-11-03",
    Date.parse("2026-11-03T22:00Z"),
  );
  expect(resumo.horarios).toBe(2);
  expect(resumo.respostas).toBe(2);
  expect(resumo.proximoHorario?.dataProgramada).toBe("2026-11-04");
});
function preparar() {
  const persistidos = new Map<string, OperacaoPendente>();
  const armazenamento = {
    async read(titular: string) {
      return [...persistidos.values()].filter((x) => x.owner === titular);
    },
    async put(item: OperacaoPendente) {
      persistidos.set(item.id, item);
    },
    async remove(id: string) {
      persistidos.delete(id);
    },
  };
  const fila = criarFilaSincronizacao(armazenamento);
  let sequencia = 0;
  const enfileirar = criarEnfileiradorDoses({
    ler: fila.read,
    adicionar: fila.enqueue,
    gerarId: () => `registro-${++sequencia}`,
    agora: () => new Date("2026-11-03T11:07:00Z"),
  });
  return { fila, armazenamento, enfileirar };
}
describe("autorrelatos de medicamentos", () => {
  it("serializa cliques concorrentes e preserva horário efetivo e id ao reenviar", async () => {
    const { fila, enfileirar } = preparar();
    const ids = await Promise.all([
      enfileirar("a", "paciente-a", evento, "TAKEN"),
      enfileirar("a", "paciente-a", evento, "TAKEN"),
    ]);
    expect(new Set(ids).size).toBe(1);
    const item = (await fila.read("a"))[0]!;
    expect(item.body).toMatchObject({
      id: ids[0],
      reportedAt: "2026-11-03T11:07:00.000Z",
      scheduledAt: evento.scheduledAt,
    });
    await expect(
      enfileirar("a", "paciente-a", evento, "NOT_TAKEN"),
    ).rejects.toThrow("aguardando envio");
  });
  it("recupera a fila ao reabrir, impede envio de outra conta e sincroniza uma única dose", async () => {
    const { fila, armazenamento, enfileirar } = preparar();
    await enfileirar("a", "paciente-a", evento, "NOT_TAKEN");
    await fila.sync("a", async () => {
      throw { status: 0 };
    });
    const reaberta = criarFilaSincronizacao(armazenamento);
    let envios = 0;
    await reaberta.sync("b", async () => {
      envios++;
    });
    expect(envios).toBe(0);
    expect(await reaberta.read("a")).toHaveLength(1);
    await reaberta.retry("a");
    await reaberta.sync("a", async (_, corpo) => {
      envios++;
      expect(corpo).toMatchObject({ status: "NOT_TAKEN" });
    });
    expect(envios).toBe(1);
    expect(await reaberta.read("a")).toHaveLength(0);
  });
  it("recusa novo autorrelato quando o servidor já confirmou a dose", async () => {
    await expect(
      preparar().enfileirar(
        "a",
        "paciente-a",
        { ...evento, status: "TAKEN" },
        "TAKEN",
      ),
    ).rejects.toThrow("já tem um autorrelato salvo");
  });
});
describe("calendário e lembretes", () => {
  it("atravessa mês e ano sem transformar o dia por fuso", () => {
    expect(deslocarDataCivil("2026-01-01", -1)).toBe("2025-12-31");
    expect(deslocarDataCivil("2024-03-01", -1)).toBe("2024-02-29");
    expect(() => deslocarDataCivil("2026-02-30", 1)).toThrow();
  });
  it("ordena e elimina notificações repetidas, respeita a preferência de antecipação", () => {
    const plano = {
      id: "p",
      active: true,
      startsOn: "2026-11-03",
      endsOn: "2026-11-03",
      timeZone: "America/Sao_Paulo",
      schedules: ["20:00", "08:00", "08:00"],
    } as PlanoLembretes;
    const itens = calcularLembretes(
      [plano, plano],
      Date.parse("2026-11-03T10:00Z"),
      false,
    );
    expect(itens.map((i) => new Date(i.date).toISOString())).toEqual([
      "2026-11-03T11:00:00.000Z",
      "2026-11-03T23:00:00.000Z",
    ]);
    expect(itens.every((i) => i.kind === "AT")).toBe(true);
  });
});
describe("convites privados", () => {
  it("aceita segredo ou fragmento e rejeita segredo em query, protocolos e tamanhos inválidos", () => {
    const segredo = "a".repeat(43);
    expect(extrairConviteTeste(segredo)).toBe(segredo);
    expect(extrairConviteTeste(`vivamais-teste://convite#${segredo}`)).toBe(
      segredo,
    );
    expect(
      extrairConviteTeste(`https://grupo.example.org/convite#${segredo}`),
    ).toBe(segredo);
    for (const valor of [
      `https://grupo.example.org/?convite=${segredo}`,
      `http://grupo.example.org/#${segredo}`,
      `javascript:${segredo}`,
      "abc",
    ])
      expect(extrairConviteTeste(valor)).toBeNull();
  });
});
