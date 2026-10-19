import { FilterQuery } from "mongoose";
import { AppError } from "../errors/AppError";
import { Partida } from "../models/Partida";
import {
  ESTADOS,
  GENEROS,
  IVideojuego,
  PLATAFORMAS,
  Videojuego,
} from "../models/Videojuego";
import { assertObjectId } from "../utils/objectId";

export interface ResumenVideojuego {
  totalPartidas: number;
  horasTotales: number;
  ultimaPartida: string | null;
  porcentajeAvanceActual: number | null;
}

export interface PartidaParaResumen {
  fecha: Date;
  createdAt: Date;
  duracionMinutos: number;
  porcentajeAvance: number;
}

export interface FiltroVideojuegos {
  estado?: string;
  genero?: string;
  plataformas?: string;
  q?: string;
}

export interface DatosLogro {
  _id?: string;
  nombre: string;
  obtenido?: boolean;
}

export interface DatosVideojuego {
  nombre: string;
  plataformas: string;
  genero: string;
  estado: string;
  logros?: DatosLogro[];
}

function opcionalDe<T extends string>(valor: string | undefined, permitidos: readonly T[], campo: string): T | undefined {
  if (valor === undefined || valor.trim() === "") return undefined;
  if (!permitidos.includes(valor as T)) {
    throw new AppError(`${campo} debe ser uno de: ${permitidos.join(", ")}`, 400, "validacion");
  }
  return valor as T;
}

function escaparRegex(valor: string): string {
  return valor.replace(/[.*+?^${}()|[\]\\]/g, "\\$&");
}

function compararRecencia(a: PartidaParaResumen, b: PartidaParaResumen): number {
  const porFecha = b.fecha.getTime() - a.fecha.getTime();
  if (porFecha !== 0) return porFecha;
  return b.createdAt.getTime() - a.createdAt.getTime();
}

/**
 * Fórmula del resumen, pura y sin acceso a base de datos:
 * - totalPartidas = cantidad de partidas
 * - horasTotales = suma(duracionMinutos) / 60, redondeada a 1 decimal
 * - ultimaPartida = fecha de la partida más reciente (empate: la creada después)
 * - porcentajeAvanceActual = porcentajeAvance de esa misma partida
 */
export function calcularResumen(partidas: PartidaParaResumen[]): ResumenVideojuego {
  if (partidas.length === 0) {
    return {
      totalPartidas: 0,
      horasTotales: 0,
      ultimaPartida: null,
      porcentajeAvanceActual: null,
    };
  }

  const totalMinutos = partidas.reduce((suma, partida) => suma + partida.duracionMinutos, 0);
  const masReciente = [...partidas].sort(compararRecencia)[0];

  return {
    totalPartidas: partidas.length,
    horasTotales: Math.round((totalMinutos / 60) * 10) / 10,
    ultimaPartida: masReciente.fecha.toISOString(),
    porcentajeAvanceActual: masReciente.porcentajeAvance,
  };
}

export async function listar(filtro: FiltroVideojuegos): Promise<IVideojuego[]> {
  const consulta: FilterQuery<IVideojuego> = {};
  const estado = opcionalDe(filtro.estado, ESTADOS, "estado");
  const genero = opcionalDe(filtro.genero, GENEROS, "genero");
  const plataformas = opcionalDe(filtro.plataformas, PLATAFORMAS, "plataformas");

  if (estado) consulta.estado = estado;
  if (genero) consulta.genero = genero;
  if (plataformas) consulta.plataformas = plataformas;

  const q = filtro.q?.trim();
  if (q) {
    if (q.length > 80) {
      throw new AppError("La búsqueda no puede superar 80 caracteres", 400, "validacion");
    }
    consulta.nombre = { $regex: escaparRegex(q), $options: "i" };
  }

  return Videojuego.find(consulta).sort({ updatedAt: -1 });
}

export async function obtenerPorId(id: string): Promise<IVideojuego> {
  assertObjectId(id);
  const videojuego = await Videojuego.findById(id);
  if (!videojuego) {
    throw new AppError("Videojuego no encontrado", 404, "no_encontrado");
  }
  return videojuego;
}

export async function crear(datos: DatosVideojuego): Promise<IVideojuego> {
  return Videojuego.create(datos);
}

export async function actualizar(id: string, datos: DatosVideojuego): Promise<IVideojuego> {
  assertObjectId(id);
  const videojuego = await Videojuego.findByIdAndUpdate(id, datos, {
    new: true,
    runValidators: true,
  });
  if (!videojuego) {
    throw new AppError("Videojuego no encontrado", 404, "no_encontrado");
  }
  return videojuego;
}

export async function eliminar(id: string): Promise<void> {
  assertObjectId(id);
  const videojuego = await Videojuego.findByIdAndDelete(id);
  if (!videojuego) {
    throw new AppError("Videojuego no encontrado", 404, "no_encontrado");
  }
  await Partida.deleteMany({ videojuego: videojuego._id });
}

export async function actualizarLogro(videojuegoId: string, logroId: string, obtenido: unknown): Promise<IVideojuego> {
  assertObjectId(videojuegoId, "id del videojuego");
  assertObjectId(logroId, "id del logro");

  if (typeof obtenido !== "boolean") {
    throw new AppError("El campo obtenido debe ser true o false", 400, "validacion");
  }

  const videojuego = await Videojuego.findById(videojuegoId);
  if (!videojuego) {
    throw new AppError("Videojuego no encontrado", 404, "no_encontrado");
  }

  const logro = videojuego.logros.find((item) => item._id.toString() === logroId);
  if (!logro) {
    throw new AppError("Logro no encontrado", 404, "no_encontrado");
  }

  logro.obtenido = obtenido;
  videojuego.markModified("logros");
  await videojuego.save();
  return videojuego;
}

export async function obtenerResumen(id: string): Promise<ResumenVideojuego> {
  await obtenerPorId(id);
  const partidas = await Partida.find({ videojuego: id }).select("fecha createdAt duracionMinutos porcentajeAvance");
  return calcularResumen(partidas);
}
