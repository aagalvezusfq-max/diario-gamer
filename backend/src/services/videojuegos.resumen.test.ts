import { describe, expect, it } from "vitest";
import { calcularResumen } from "./videojuegos.service";

describe("calcularResumen", () => {
  it("suma las horas a un decimal y toma el avance de la partida más reciente", () => {
    const resumen = calcularResumen([
      { fecha: new Date("2026-09-20T00:00:00.000Z"), createdAt: new Date("2026-09-20T01:00:00.000Z"), duracionMinutos: 90, porcentajeAvance: 20 },
      { fecha: new Date("2026-09-27T00:00:00.000Z"), createdAt: new Date("2026-09-27T01:00:00.000Z"), duracionMinutos: 120, porcentajeAvance: 45 },
      { fecha: new Date("2026-10-02T00:00:00.000Z"), createdAt: new Date("2026-10-02T01:00:00.000Z"), duracionMinutos: 75, porcentajeAvance: 67 },
    ]);
    expect(resumen).toEqual({
      totalPartidas: 3,
      horasTotales: 4.8,
      ultimaPartida: "2026-10-02T00:00:00.000Z",
      porcentajeAvanceActual: 67,
    });
  });

  it("desempata dos partidas de la misma fecha por la que se creó después", () => {
    const resumen = calcularResumen([
      { fecha: new Date("2026-10-02T00:00:00.000Z"), createdAt: new Date("2026-10-02T01:00:00.000Z"), duracionMinutos: 30, porcentajeAvance: 40 },
      { fecha: new Date("2026-10-02T00:00:00.000Z"), createdAt: new Date("2026-10-02T03:00:00.000Z"), duracionMinutos: 30, porcentajeAvance: 55 },
    ]);
    expect(resumen.porcentajeAvanceActual).toBe(55);
  });

  it("devuelve ceros y nulos cuando no hay partidas", () => {
    expect(calcularResumen([])).toEqual({
      totalPartidas: 0,
      horasTotales: 0,
      ultimaPartida: null,
      porcentajeAvanceActual: null,
    });
  });
});
