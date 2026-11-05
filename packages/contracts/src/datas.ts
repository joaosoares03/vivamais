/** Datas civis nunca passam por conversão de fuso ou por meia-noite UTC. */
export function dataCivilValida(valor: string): boolean {
  const partes = /^(\d{4})-(\d{2})-(\d{2})$/.exec(valor);
  if (!partes) return false;
  const [, anoTexto, mesTexto, diaTexto] = partes;
  const ano = Number(anoTexto),
    mes = Number(mesTexto),
    dia = Number(diaTexto);
  const bissexto = ano % 4 === 0 && (ano % 100 !== 0 || ano % 400 === 0);
  const dias = [31, bissexto ? 29 : 28, 31, 30, 31, 30, 31, 31, 30, 31, 30, 31];
  return (
    ano >= 1900 &&
    ano <= 9999 &&
    mes >= 1 &&
    mes <= 12 &&
    dia >= 1 &&
    dia <= dias[mes - 1]!
  );
}
export function dataCivilBrasil(valor: string): string {
  return dataCivilValida(valor) ? valor.split("-").reverse().join("/") : "";
}
export function interpretarDataCivil(valor: string): string | null {
  const partes = /^(\d{2})\/(\d{2})\/(\d{4})$/.exec(valor);
  if (!partes) return null;
  const iso = `${partes[3]}-${partes[2]}-${partes[1]}`;
  return dataCivilValida(iso) ? iso : null;
}
export function partesInstanteBrasil(valor: string | Date = new Date()) {
  const instante = typeof valor === "string" ? new Date(valor) : valor;
  if (!Number.isFinite(instante.getTime())) return { data: "", hora: "" };
  const partes = new Intl.DateTimeFormat("en-CA", {
    timeZone: "America/Sao_Paulo",
    year: "numeric",
    month: "2-digit",
    day: "2-digit",
    hour: "2-digit",
    minute: "2-digit",
    hourCycle: "h23",
  }).formatToParts(instante);
  const ler = (tipo: string) =>
    partes.find((parte) => parte.type === tipo)?.value ?? "";
  return {
    data: `${ler("year")}-${ler("month")}-${ler("day")}`,
    hora: `${ler("hour")}:${ler("minute")}`,
  };
}
export function hojeBrasil(agora = new Date()): string {
  return partesInstanteBrasil(agora).data;
}
export function instanteDeDataHoraBrasil(
  data: string,
  hora: string,
): string | null {
  if (!dataCivilValida(data) || !/^([01]\d|2[0-3]):[0-5]\d$/.test(hora))
    return null;
  const [ano, mes, dia] = data.split("-").map(Number);
  const [horas, minutos] = hora.split(":").map(Number);
  const alvo = Date.UTC(ano!, mes! - 1, dia!, horas!, minutos!);
  let estimativa = alvo;
  for (let indice = 0; indice < 4; indice++) {
    const partes = partesInstanteBrasil(new Date(estimativa));
    const [a, m, d] = partes.data.split("-").map(Number);
    const [h, min] = partes.hora.split(":").map(Number);
    estimativa += alvo - Date.UTC(a!, m! - 1, d!, h!, min!);
  }
  const resultado = new Date(estimativa).toISOString();
  const conferido = partesInstanteBrasil(resultado);
  // Horários inexistentes na mudança histórica de horário de verão são recusados.
  return conferido.data === data && conferido.hora === hora ? resultado : null;
}
export function horarioBrasilParaCampo(agora = new Date()): string {
  const { data, hora } = partesInstanteBrasil(agora);
  return `${data}T${hora}`;
}
export function interpretarHorarioBrasil(valor: string): string {
  const resultado = instanteDeDataHoraBrasil(
    valor.slice(0, 10),
    valor.slice(11, 16),
  );
  if (!resultado || valor.length !== 16 || valor[10] !== "T")
    throw new Error("Confira a data e a hora informadas.");
  return resultado;
}
