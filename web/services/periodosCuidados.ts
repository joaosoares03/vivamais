import { consultarDominio } from "./dominio";
import { horarioBrasilParaCampo } from "@viva/contracts";

export function diasAutorrelatos(
  ultimoDia: string,
  quantidade: 1 | 7,
): string[] {
  if (!/^\d{4}-\d{2}-\d{2}$/.test(ultimoDia))
    throw new Error("Selecione um dia válido.");
  const referencia = new Date(`${ultimoDia}T12:00:00Z`);
  if (
    !Number.isFinite(referencia.getTime()) ||
    referencia.toISOString().slice(0, 10) !== ultimoDia
  )
    throw new Error("Selecione um dia válido.");
  return Array.from({ length: quantidade }, (_, indice) => {
    const dia = new Date(referencia);
    dia.setUTCDate(dia.getUTCDate() - quantidade + 1 + indice);
    return dia.toISOString().slice(0, 10);
  });
}

export async function buscarAutorrelatosPeriodo(
  idPaciente: string,
  ultimoDia: string,
  quantidade: 1 | 7,
) {
  const dias = diasAutorrelatos(ultimoDia, quantidade);
  const resultados = await Promise.all(
    dias.map((data) =>
      consultarDominio<Record<string, unknown>[]>(
        `/patients/${idPaciente}/medication-events?date=${data}`,
      ),
    ),
  );
  return resultados.flat();
}

export function periodoPressao(dias: 7 | 30, agora = new Date()) {
  const formatar = horarioBrasilParaCampo;
  // Intervalo corrido, apresentado pelo mesmo horário brasileiro usado ao salvar.
  return {
    inicio: formatar(new Date(agora.getTime() - dias * 86400000)),
    fim: formatar(new Date(agora.getTime() + 60000)),
  };
}
