import { FilterQuery } from "mongoose";
import { limiteHasta } from "../dominio/fechas";
import { AppError } from "../errors/AppError";
import { IPartida, Partida } from "../models/Partida";
import { Videojuego } from "../models/Videojuego";
import { assertObjectId } from "../utils/objectId";

export interface FiltroPartidas {
  videojuego?: string;
  desde?: string;
  hasta?: string;
}

export interface DatosPartida {
  videojuego?: string;
  fecha?: string | Date;
  duracionMinutos?: number;
  porcentajeAvance?: number;
  notas?: string;
}

function fechaValida(valor: string, campo: string): Date {
  const fecha = new Date(valor);
  if (Number.isNaN(fecha.getTime())) {
    throw new AppError(`${campo} no es una fecha válida`, 400, "validacion");
  }
  return fecha;
}

export async function listar(filtro: FiltroPartidas): Promise<IPartida[]> {
  const consulta: FilterQuery<IPartida> = {};

  if (filtro.videojuego) {
    assertObjectId(filtro.videojuego, "videojuego");
    consulta.videojuego = filtro.videojuego;
  }

  if (filtro.desde || filtro.hasta) {
    const rango: { $gte?: Date; $lte?: Date } = {};
    if (filtro.desde) rango.$gte = fechaValida(filtro.desde, "desde");
    if (filtro.hasta) {
      fechaValida(filtro.hasta, "hasta");
      rango.$lte = limiteHasta(filtro.hasta);
    }
    consulta.fecha = rango;
  }

  return Partida.find(consulta).populate("videojuego").sort({ fecha: -1, createdAt: -1 });
}

export async function listarPorVideojuego(videojuegoId: string): Promise<IPartida[]> {
  assertObjectId(videojuegoId);
  const existe = await Videojuego.exists({ _id: videojuegoId });
  if (!existe) {
    throw new AppError("Videojuego no encontrado", 404, "no_encontrado");
  }
  return listar({ videojuego: videojuegoId });
}

export async function crear(datos: DatosPartida): Promise<IPartida> {
  if (!datos.videojuego || typeof datos.videojuego !== "string") {
    throw new AppError("El videojuego es obligatorio", 400, "validacion");
  }

  assertObjectId(datos.videojuego, "videojuego");

  const existe = await Videojuego.exists({ _id: datos.videojuego });
  if (!existe) {
    throw new AppError("El videojuego referenciado no existe", 404, "referencia_inexistente");
  }

  const notas = typeof datos.notas === "string" ? datos.notas.trim() : undefined;
  const partida = await Partida.create({
    ...datos,
    notas: notas || undefined,
  });

  return partida.populate("videojuego");
}

export async function obtenerPorId(id: string): Promise<IPartida> {
  assertObjectId(id);
  const partida = await Partida.findById(id).populate("videojuego");
  if (!partida) throw new AppError("Partida no encontrada", 404, "no_encontrado");
  return partida;
}

export async function actualizar(id: string, datos: DatosPartida): Promise<IPartida> {
  assertObjectId(id);
  const partida = await Partida.findById(id);
  if (!partida) throw new AppError("Partida no encontrada", 404, "no_encontrado");

  const notas = typeof datos.notas === "string" ? datos.notas.trim() : partida.notas;
  partida.set({
    fecha: datos.fecha ?? partida.fecha,
    duracionMinutos: datos.duracionMinutos ?? partida.duracionMinutos,
    porcentajeAvance: datos.porcentajeAvance ?? partida.porcentajeAvance,
    notas: notas || undefined,
  });
  await partida.save();
  return partida.populate("videojuego");
}

export async function eliminar(id: string): Promise<void> {
  assertObjectId(id);
  const partida = await Partida.findByIdAndDelete(id);
  if (!partida) {
    throw new AppError("Partida no encontrada", 404, "no_encontrado");
  }
}
