import type { AgendaMedicamentos } from "@viva/contracts";
export function resumirAgendaMedicamentos(
  agenda: AgendaMedicamentos,
  dia: string,
  agora = Date.now(),
) {
  const hoje = agenda.dias.find((item) => item.data === dia);
  return {
    horarios: hoje?.resumo.previstas ?? 0,
    respostas: (hoje?.resumo.tomadas ?? 0) + (hoje?.resumo.naoTomadas ?? 0),
    proximoHorario:
      agenda.dias
        .flatMap((item) => item.eventos)
        .filter(
          (item) =>
            item.status === "NO_CONFIRMATION" &&
            Date.parse(item.scheduledAt) >= agora,
        )
        .sort((a, b) => a.scheduledAt.localeCompare(b.scheduledAt))[0] ?? null,
  };
}
