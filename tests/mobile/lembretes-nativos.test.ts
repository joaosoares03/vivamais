import { beforeEach, it, expect, vi } from "vitest";
import type { PlanoLembretes } from "../../services/lembretes/calculoLembretes";
const apoio = vi.hoisted(() => ({
  preferencia: { habilitados: true, antecipar: false },
  agendadas: [] as {
    identifier: string;
    content: { data: { owner: string } };
  }[],
  agendar: vi.fn(),
  cancelar: vi.fn(),
  permissao: vi.fn(),
  solicitar: vi.fn(),
}));
vi.mock("react-native", () => ({ Platform: { OS: "android" } }));
vi.mock("expo-secure-store", () => ({
  getItemAsync: async () => JSON.stringify(apoio.preferencia),
  setItemAsync: vi.fn(),
  WHEN_UNLOCKED_THIS_DEVICE_ONLY: 1,
}));
vi.mock("expo-notifications", () => ({
  setNotificationHandler: vi.fn(),
  setNotificationChannelAsync: vi.fn(),
  AndroidImportance: { DEFAULT: 3 },
  AndroidNotificationVisibility: { PRIVATE: 0 },
  SchedulableTriggerInputTypes: { DATE: "date" },
  getPermissionsAsync: apoio.permissao,
  requestPermissionsAsync: apoio.solicitar,
  getAllScheduledNotificationsAsync: async () => apoio.agendadas,
  scheduleNotificationAsync: apoio.agendar,
  cancelScheduledNotificationAsync: apoio.cancelar,
}));
const titular = "00000000-0000-4000-8000-000000000001";
beforeEach(() => {
  vi.resetModules();
  vi.clearAllMocks();
  apoio.preferencia = { habilitados: true, antecipar: false };
  apoio.agendadas = [];
  apoio.permissao.mockResolvedValue({ granted: true });
  apoio.agendar.mockImplementation(async (pedido) => {
    apoio.agendadas.push(pedido);
    return pedido.identifier;
  });
  apoio.cancelar.mockImplementation(async (id) => {
    apoio.agendadas = apoio.agendadas.filter((i) => i.identifier !== id);
  });
});
function plano() {
  return {
    id: "p",
    active: true,
    startsOn: "2026-11-05",
    endsOn: "2026-11-05",
    timeZone: "America/Sao_Paulo",
    schedules: ["08:00"],
  } as PlanoLembretes;
}
it("reabrir e atualizar o plano não duplicam; cancelamento preserva notificações de outro titular", async () => {
  vi.spyOn(Date, "now").mockReturnValue(Date.parse("2026-11-04T10:00Z"));
  const modulo = await import("../../services/lembretes/lembretes.native");
  apoio.agendadas.push({
    identifier: "outro",
    content: { data: { owner: "outro" } },
  });
  await modulo.agendarLembretes(titular, [plano()], false);
  await modulo.agendarLembretes(titular, [plano()], false);
  expect(apoio.agendar).toHaveBeenCalledTimes(1);
  await modulo.cancelarLembretes(titular);
  expect(apoio.agendadas.map((i) => i.identifier)).toEqual(["outro"]);
  vi.restoreAllMocks();
});
it("preferência desativada não solicita permissão nem agenda", async () => {
  apoio.preferencia.habilitados = false;
  await (
    await import("../../services/lembretes/lembretes.native")
  ).agendarLembretes(titular, [plano()], true);
  expect(apoio.solicitar).not.toHaveBeenCalled();
  expect(apoio.agendar).not.toHaveBeenCalled();
});
it("negação do sistema produz orientação sem alegar agendamento", async () => {
  apoio.permissao.mockResolvedValue({ granted: false });
  const mensagem = await (
    await import("../../services/lembretes/lembretes.native")
  ).agendarLembretes(titular, [plano()], false);
  expect(mensagem).toContain("Notificações desativadas");
  expect(apoio.agendar).not.toHaveBeenCalled();
});
