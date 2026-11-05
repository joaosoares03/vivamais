import { dataCivilValida } from "./datas";
export interface EventoMedicamento {
  planId: string;
  name: string;
  instruction: string;
  dosagem: string | null;
  frequencia: number;
  timeZone: string;
  horarioLocal: string;
  dataProgramada: string;
  scheduledAt: string;
  status: "NO_CONFIRMATION" | "TAKEN" | "NOT_TAKEN";
  reportedAt?: string;
  authorName?: string;
  source?: "SELF_REPORT" | "PROFESSIONAL_TRANSCRIPTION";
}
export interface DiaMedicamentos {
  data: string;
  resumo: {
    previstas: number;
    tomadas: number;
    naoTomadas: number;
    pendentes: number;
  };
  eventos: EventoMedicamento[];
}
export interface AgendaMedicamentos {
  inicio: string;
  fim: string;
  dias: DiaMedicamentos[];
}
export function deslocarDataCivil(data: string, dias: number): string {
  if (!dataCivilValida(data) || !Number.isInteger(dias))
    throw new Error("Data inválida.");
  const instante = new Date(data + "T12:00:00Z");
  if (!Number.isFinite(instante.getTime())) throw new Error("Data inválida.");
  instante.setUTCDate(instante.getUTCDate() + dias);
  return instante.toISOString().slice(0, 10);
}
