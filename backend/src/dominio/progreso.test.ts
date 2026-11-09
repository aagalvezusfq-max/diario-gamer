import { describe, expect, it } from "vitest";
import { calcularProgresoSemanal, fechaCivil, hoyEnGuayaquil } from "./progreso";

const hoy = "2026-11-04";
const meta = {
  horasSemanales: 5,
  diasPorSemana: 4,
  hitos: [
    { descripcion: "Llegar al 25 %", porcentajeObjetivo: 25 },
    { descripcion: "Llegar al 50 %", porcentajeObjetivo: 50 },
    { descripcion: "Terminar el juego", porcentajeObjetivo: 100 },
  ],
};

function partida(civil: string, minutos: number) {
  return { fecha: new Date(`${civil}T00:00:00.000Z`), duracionMinutos: minutos };
}

describe("progreso semanal", () => {
  it("arma la semana de lunes a domingo para un miércoles de Ecuador", () => {
    const progreso = calcularProgresoSemanal({ hoy, partidas: [], meta, porcentajeAvanceActual: null });
    expect(progreso.semana).toEqual({ inicio: "2026-11-02", fin: "2026-11-08" });
  });

  it("suma las horas de la semana a un decimal", () => {
    const progreso = calcularProgresoSemanal({
      hoy,
      partidas: [partida("2026-11-02", 90), partida("2026-11-03", 120)],
      meta,
      porcentajeAvanceActual: 67,
    });
    expect(progreso.horasSemana).toBe(3.5);
    expect(progreso.porcentajeHoras).toBe(70);
  });

  it("no recorta el porcentaje cuando la meta se supera", () => {
    const progreso = calcularProgresoSemanal({
      hoy,
      partidas: [partida("2026-11-02", 420)],
      meta,
      porcentajeAvanceActual: 80,
    });
    expect(progreso.horasSemana).toBe(7);
    expect(progreso.porcentajeHoras).toBe(140);
  });

  it("cuenta varias partidas del mismo día como un solo día", () => {
    const progreso = calcularProgresoSemanal({
      hoy,
      partidas: [partida("2026-11-02", 30), partida("2026-11-02", 40), partida("2026-11-04", 20)],
      meta,
      porcentajeAvanceActual: 10,
    });
    expect(progreso.diasJugadosSemana).toBe(2);
  });

  it("mantiene la racha viva si el último día jugado es ayer", () => {
    const progreso = calcularProgresoSemanal({
      hoy,
      partidas: [partida("2026-11-02", 30), partida("2026-11-03", 30)],
      meta,
      porcentajeAvanceActual: 10,
    });
    expect(progreso.rachaActual).toBe(2);
  });

  it("rompe la racha actual y conserva la mejor cuando el último día ya pasó", () => {
    const progreso = calcularProgresoSemanal({
      hoy,
      partidas: [
        partida("2026-10-26", 20),
        partida("2026-10-27", 20),
        partida("2026-10-28", 20),
        partida("2026-10-29", 20),
        partida("2026-11-02", 20),
      ],
      meta,
      porcentajeAvanceActual: 10,
    });
    expect(progreso.rachaActual).toBe(0);
    expect(progreso.mejorRacha).toBe(4);
  });

  it("toma el día civil de la fecha y no la hora de Ecuador", () => {
    expect(fechaCivil(new Date("2026-11-02T00:00:00.000Z"))).toBe("2026-11-02");
    const progreso = calcularProgresoSemanal({
      hoy,
      partidas: [{ fecha: new Date("2026-11-02T00:00:00.000Z"), duracionMinutos: 60 }],
      meta,
      porcentajeAvanceActual: 10,
    });
    expect(progreso.diasJugadosSemana).toBe(1);
    expect(progreso.horasSemana).toBe(1);
  });

  it("marca el hito con el avance actual y lo suelta si el avance baja", () => {
    const alto = calcularProgresoSemanal({ hoy, partidas: [partida("2026-11-04", 30)], meta, porcentajeAvanceActual: 67 });
    const bajo = calcularProgresoSemanal({ hoy, partidas: [partida("2026-11-04", 30)], meta, porcentajeAvanceActual: 40 });
    expect(alto.hitos.map((hito) => hito.alcanzado)).toEqual([true, true, false]);
    expect(bajo.hitos[1].alcanzado).toBe(false);
  });

  it("calcula horas y racha sin porcentaje cuando no hay meta activa", () => {
    const progreso = calcularProgresoSemanal({
      hoy,
      partidas: [partida("2026-11-03", 60)],
      meta: null,
      porcentajeAvanceActual: 20,
    });
    expect(progreso.meta).toBeNull();
    expect(progreso.porcentajeHoras).toBeNull();
    expect(progreso.hitos).toEqual([]);
    expect(progreso.horasSemana).toBe(1);
    expect(progreso.rachaActual).toBe(1);
  });

  it("deja todo en cero y sin hitos alcanzados cuando no hay partidas", () => {
    const progreso = calcularProgresoSemanal({ hoy, partidas: [], meta, porcentajeAvanceActual: null });
    expect(progreso.horasSemana).toBe(0);
    expect(progreso.diasJugadosSemana).toBe(0);
    expect(progreso.rachaActual).toBe(0);
    expect(progreso.mejorRacha).toBe(0);
    expect(progreso.hitos.every((hito) => !hito.alcanzado)).toBe(true);
  });

  it("lee el hoy de Ecuador, no el día UTC cuando ya pasó la medianoche allá", () => {
    expect(hoyEnGuayaquil(new Date("2026-11-04T03:00:00.000Z"))).toBe("2026-11-03");
  });
});
