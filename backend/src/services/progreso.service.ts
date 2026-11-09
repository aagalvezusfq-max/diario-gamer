import { calcularProgresoSemanal, hoyEnGuayaquil, ProgresoSemanal } from "../dominio/progreso";
import { Meta } from "../models/Meta";
import { Partida } from "../models/Partida";
import { calcularResumen, obtenerPorId } from "./videojuegos.service";

export async function obtenerProgresoSemanal(videojuegoId: string): Promise<ProgresoSemanal> {
  await obtenerPorId(videojuegoId);
  const [partidas, meta] = await Promise.all([
    Partida.find({ videojuego: videojuegoId }).select("fecha createdAt duracionMinutos porcentajeAvance"),
    Meta.findOne({ videojuego: videojuegoId, activa: true }),
  ]);
  const resumen = calcularResumen(partidas);

  return calcularProgresoSemanal({
    hoy: hoyEnGuayaquil(new Date()),
    partidas,
    meta: meta
      ? {
          horasSemanales: meta.horasSemanales,
          diasPorSemana: meta.diasPorSemana,
          hitos: meta.hitos.map((hito) => ({
            descripcion: hito.descripcion,
            porcentajeObjetivo: hito.porcentajeObjetivo,
          })),
        }
      : null,
    porcentajeAvanceActual: resumen.porcentajeAvanceActual,
  });
}
