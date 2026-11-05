import * as Notifications from "expo-notifications";
import { Platform } from "react-native";
import * as SecureStore from "expo-secure-store";
import { calcularLembretes, type PlanoLembretes } from "./calculoLembretes";
import {
  normalizarPreferenciasLembretes,
  type PreferenciasLembretes,
} from "./preferenciasLembretes";
Notifications.setNotificationHandler({
  handleNotification: async () => ({
    shouldShowBanner: true,
    shouldShowList: true,
    shouldPlaySound: true,
    shouldSetBadge: false,
  }),
});
const geracoes = new Map<string, number>();
let agendamento: Promise<unknown> = Promise.resolve();
function chavePreferencias(titular: string) {
  if (!/^[0-9a-f-]{36}$/i.test(titular))
    throw new Error("Sessão indisponível.");
  return `viva.lembretes.${titular}`;
}
export async function lerPreferenciasLembretes(titular: string) {
  const valor = await SecureStore.getItemAsync(chavePreferencias(titular));
  try {
    return normalizarPreferenciasLembretes(valor ? JSON.parse(valor) : null);
  } catch {
    return normalizarPreferenciasLembretes(null);
  }
}
export async function salvarPreferenciasLembretes(
  titular: string,
  preferencias: PreferenciasLembretes,
) {
  await SecureStore.setItemAsync(
    chavePreferencias(titular),
    JSON.stringify(normalizarPreferenciasLembretes(preferencias)),
    { keychainAccessible: SecureStore.WHEN_UNLOCKED_THIS_DEVICE_ONLY },
  );
  if (!preferencias.habilitados) await cancelarLembretes(titular);
}
export async function cancelarLembretes(idTitular: string) {
  geracoes.set(idTitular, (geracoes.get(idTitular) ?? 0) + 1);
  for (const item of await Notifications.getAllScheduledNotificationsAsync()) {
    if (item.content.data?.owner === idTitular)
      await Notifications.cancelScheduledNotificationAsync(item.identifier);
  }
}
export async function agendarLembretes(
  idTitular: string,
  planos: PlanoLembretes[],
  solicitarPermissao: boolean,
) {
  const geracao = geracoes.get(idTitular) ?? 0;
  const executar = async () => {
    const preferencias = await lerPreferenciasLembretes(idTitular);
    if (geracao !== (geracoes.get(idTitular) ?? 0))
      return "Agendamento cancelado.";
    if (!preferencias.habilitados) {
      await cancelarLembretes(idTitular);
      return "Lembretes desativados neste aparelho.";
    }
    if (Platform.OS === "android")
      await Notifications.setNotificationChannelAsync("medication-reminders", {
        name: "Lembretes de medicamentos",
        importance: Notifications.AndroidImportance.DEFAULT,
        lockscreenVisibility:
          Notifications.AndroidNotificationVisibility.PRIVATE,
      });
    let permissao = await Notifications.getPermissionsAsync();
    if (!permissao.granted && solicitarPermissao)
      permissao = await Notifications.requestPermissionsAsync();
    if (!permissao.granted)
      return "Notificações desativadas. Você pode autorizá-las nas configurações do aparelho.";
    const horarios = calcularLembretes(
      planos,
      Date.now(),
      preferencias.antecipar,
    );
    const identificador = (item: (typeof horarios)[number]) =>
      `viva-${item.planId}-${item.date}-${item.kind}`;
    const esperados = new Set(horarios.map(identificador));
    const existentes = await Notifications.getAllScheduledNotificationsAsync();
    for (const item of existentes)
      if (
        item.content.data?.owner === idTitular &&
        !esperados.has(item.identifier)
      )
        await Notifications.cancelScheduledNotificationAsync(item.identifier);
    const mantidos = new Set(
      existentes
        .filter(
          (item) =>
            item.content.data?.owner === idTitular &&
            esperados.has(item.identifier),
        )
        .map((item) => item.identifier),
    );
    for (const item of horarios) {
      if (geracao !== (geracoes.get(idTitular) ?? 0))
        return "Agendamento cancelado.";
      const id = identificador(item);
      if (mantidos.has(id)) continue;
      await Notifications.scheduleNotificationAsync({
        identifier: id,
        content: {
          title: "Viva+ · lembrete",
          body:
            item.kind === "BEFORE"
              ? "Em cinco minutos há um horário de medicamento. Consulte seu plano no aplicativo."
              : "Há um horário de medicamento no seu plano. Consulte o aplicativo e as instruções profissionais.",
          data: { owner: idTitular, planId: item.planId, kind: item.kind },
        },
        trigger: {
          type: Notifications.SchedulableTriggerInputTypes.DATE,
          date: new Date(item.date),
          channelId: "medication-reminders",
        },
      });
      if (geracao !== (geracoes.get(idTitular) ?? 0))
        await Notifications.cancelScheduledNotificationAsync(id);
    }
    return `${horarios.length} lembretes locais programados, sem duplicar horários existentes. Reabra o app para renovar. Restrições do sistema podem afetar a entrega; agendamento não comprova ingestão.`;
  };
  const resultado = agendamento.then(executar, executar);
  agendamento = resultado.catch(() => undefined);
  return resultado;
}
