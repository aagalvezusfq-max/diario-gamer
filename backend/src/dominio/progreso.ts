export interface PartidaParaProgreso {
  fecha: Date;
  duracionMinutos: number;
}

export interface HitoParaProgreso {
  descripcion: string;
  porcentajeObjetivo: number;
}

export interface MetaParaProgreso {
  horasSemanales: number;
  diasPorSemana: number;
  hitos: HitoParaProgreso[];
}

export interface HitoCalculado extends HitoParaProgreso {
  alcanzado: boolean;
}

export interface ProgresoSemanal {
  semana: { inicio: string; fin: string };
  meta: { horasSemanales: number; diasPorSemana: number } | null;
  horasSemana: number;
  porcentajeHoras: number | null;
  diasJugadosSemana: number;
  rachaActual: number;
  mejorRacha: number;
  hitos: HitoCalculado[];
}

const ZONA = "America/Guayaquil";

export function fechaCivil(fecha: Date): string {
  const mes = String(fecha.getUTCMonth() + 1).padStart(2, "0");
  const dia = String(fecha.getUTCDate()).padStart(2, "0");
  return `${fecha.getUTCFullYear()}-${mes}-${dia}`;
}

export function hoyEnGuayaquil(ahora: Date): string {
  return new Intl.DateTimeFormat("en-CA", {
    timeZone: ZONA,
    year: "numeric",
    month: "2-digit",
    day: "2-digit",
  }).format(ahora);
}

export function sumarDias(civil: string, dias: number): string {
  const [anio, mes, dia] = civil.split("-").map(Number);
  const fecha = new Date(Date.UTC(anio, mes - 1, dia));
  fecha.setUTCDate(fecha.getUTCDate() + dias);
  return fechaCivil(fecha);
}

export function lunesDe(civil: string): string {
  const [anio, mes, dia] = civil.split("-").map(Number);
  const fecha = new Date(Date.UTC(anio, mes - 1, dia));
  const distancia = fecha.getUTCDay() === 0 ? 6 : fecha.getUTCDay() - 1;
  return sumarDias(civil, -distancia);
}

function horasDe(minutos: number): number {
  return Math.round((minutos / 60) * 10) / 10;
}

function diasUnicos(partidas: PartidaParaProgreso[]): string[] {
  return [...new Set(partidas.map((partida) => fechaCivil(partida.fecha)))].sort();
}

function rachaQueTerminaEn(dias: Set<string>, ultimo: string): number {
  let total = 0;
  let cursor = ultimo;
  while (dias.has(cursor)) {
    total += 1;
    cursor = sumarDias(cursor, -1);
  }
  return total;
}

export function calcularRachas(diasOrdenados: string[], hoy: string): { actual: number; mejor: number } {
  if (diasOrdenados.length === 0) return { actual: 0, mejor: 0 };

  const conjunto = new Set(diasOrdenados);
  let mejor = 1;
  let tramo = 1;
  for (let i = 1; i < diasOrdenados.length; i += 1) {
    tramo = diasOrdenados[i] === sumarDias(diasOrdenados[i - 1], 1) ? tramo + 1 : 1;
    if (tramo > mejor) mejor = tramo;
  }

  const ultimo = diasOrdenados[diasOrdenados.length - 1];
  const ayer = sumarDias(hoy, -1);
  const actual = ultimo === hoy || ultimo === ayer ? rachaQueTerminaEn(conjunto, ultimo) : 0;
  return { actual, mejor };
}

export function calcularProgresoSemanal(entrada: {
  hoy: string;
  partidas: PartidaParaProgreso[];
  meta: MetaParaProgreso | null;
  porcentajeAvanceActual: number | null;
}): ProgresoSemanal {
  const inicio = lunesDe(entrada.hoy);
  const fin = sumarDias(inicio, 6);
  const dias = diasUnicos(entrada.partidas);
  const deLaSemana = entrada.partidas.filter((partida) => {
    const civil = fechaCivil(partida.fecha);
    return civil >= inicio && civil <= fin;
  });
  const minutos = deLaSemana.reduce((suma, partida) => suma + partida.duracionMinutos, 0);
  const horasSemana = horasDe(minutos);
  const rachas = calcularRachas(dias, entrada.hoy);
  const diasJugadosSemana = new Set(deLaSemana.map((partida) => fechaCivil(partida.fecha))).size;

  return {
    semana: { inicio, fin },
    meta: entrada.meta
      ? { horasSemanales: entrada.meta.horasSemanales, diasPorSemana: entrada.meta.diasPorSemana }
      : null,
    horasSemana,
    porcentajeHoras: entrada.meta ? Math.round((horasSemana / entrada.meta.horasSemanales) * 100) : null,
    diasJugadosSemana,
    rachaActual: rachas.actual,
    mejorRacha: rachas.mejor,
    hitos:
      entrada.meta?.hitos.map((hito) => ({
        ...hito,
        alcanzado: entrada.porcentajeAvanceActual !== null && entrada.porcentajeAvanceActual >= hito.porcentajeObjetivo,
      })) ?? [],
  };
}
