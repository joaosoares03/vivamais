export interface PlanoLembretes {
  id: string;
  name: string;
  instruction: string;
  startsOn: string;
  endsOn: string | null;
  timeZone: string;
  schedules: string[];
  version: number;
  active: boolean;
}
function partesData(instanteEvento: Date, fuso: string) {
  const partes = new Intl.DateTimeFormat("en-CA", {
    timeZone: fuso,
    year: "numeric",
    month: "2-digit",
    day: "2-digit",
    hour: "2-digit",
    minute: "2-digit",
    second: "2-digit",
    hourCycle: "h23",
  }).formatToParts(instanteEvento);
  const lerParte = (chave: string) =>
    Number(partes.find((x) => x.type === chave)?.value);
  return {
    year: lerParte("year"),
    month: lerParte("month"),
    day: lerParte("day"),
    hour: lerParte("hour"),
    minute: lerParte("minute"),
    second: lerParte("second"),
  };
}
export function converterHorarioFuso(
  dataCivil: string,
  horario: string,
  fuso: string,
) {
  const y = Number(dataCivil.slice(0, 4)),
    m = Number(dataCivil.slice(5, 7)),
    d = Number(dataCivil.slice(8, 10)),
    h = Number(horario.slice(0, 2)),
    min = Number(horario.slice(3, 5));
  const destino = Date.UTC(y, m - 1, d, h, min);
  let estimativa = destino;
  for (let i = 0; i < 3; i++) {
    const partes = partesData(new Date(estimativa), fuso);
    const local = Date.UTC(
      partes.year,
      partes.month - 1,
      partes.day,
      partes.hour,
      partes.minute,
      partes.second,
    );
    estimativa += destino - local;
  }
  return estimativa;
}
export function calcularLembretes(
  planos: PlanoLembretes[],
  agora = Date.now(),
  antecipar = true,
) {
  const saida: { planId: string; date: number; kind: "BEFORE" | "AT" }[] = [];
  for (const plano of planos.filter((partes) => partes.active)) {
    const partes = partesData(new Date(agora), plano.timeZone);
    for (let n = 0; n < 7; n++) {
      const dataCivil = new Date(
        Date.UTC(+partes.year, +partes.month - 1, +partes.day + n),
      )
        .toISOString()
        .slice(0, 10);
      if (
        dataCivil < plano.startsOn ||
        (plano.endsOn && dataCivil > plano.endsOn)
      )
        continue;
      for (const horario of plano.schedules) {
        const instanteEvento = converterHorarioFuso(
          dataCivil,
          horario,
          plano.timeZone,
        );
        if (antecipar && instanteEvento - 300000 > agora)
          saida.push({
            planId: plano.id,
            date: instanteEvento - 300000,
            kind: "BEFORE",
          });
        if (instanteEvento > agora)
          saida.push({ planId: plano.id, date: instanteEvento, kind: "AT" });
      }
    }
  }
  const unicos = new Map(
    saida.map((item) => [`${item.planId}|${item.date}|${item.kind}`, item]),
  );
  return [...unicos.values()]
    .sort(
      (a, b) =>
        a.date - b.date ||
        a.planId.localeCompare(b.planId) ||
        a.kind.localeCompare(b.kind),
    )
    .slice(0, 60);
}
