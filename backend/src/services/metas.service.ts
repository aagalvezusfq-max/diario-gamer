import { FilterQuery } from "mongoose";
import { AppError } from "../errors/AppError";
import { IMeta, Meta } from "../models/Meta";
import { Videojuego } from "../models/Videojuego";
import { assertObjectId } from "../utils/objectId";

export interface DatosHito {
  _id?: string;
  descripcion: string;
  porcentajeObjetivo: number;
}

export interface DatosMeta {
  videojuego?: string;
  horasSemanales?: number;
  diasPorSemana?: number;
  activa?: boolean;
  hitos?: DatosHito[];
}

const MENSAJE_DUPLICADA = "Este videojuego ya tiene una meta activa. Desactívala antes de crear otra.";
const MENSAJE_CERRADO = "Un videojuego completado o abandonado no puede tener una meta activa.";

async function juegoExistente(videojuegoId: string) {
  assertObjectId(videojuegoId, "videojuego");
  const juego = await Videojuego.findById(videojuegoId);
  if (!juego) {
    throw new AppError("El videojuego referenciado no existe", 404, "referencia_inexistente");
  }
  return juego;
}

function rechazarSiEstaCerrado(estado: string): void {
  if (estado === "completado" || estado === "abandonado") {
    throw new AppError(MENSAJE_CERRADO, 409, "conflicto");
  }
}

async function rechazarSiHayOtraActiva(videojuegoId: string, exceptoId?: string): Promise<void> {
  const filtro: FilterQuery<IMeta> = { videojuego: videojuegoId, activa: true };
  if (exceptoId) filtro._id = { $ne: exceptoId };
  const yaExiste = await Meta.exists(filtro);
  if (yaExiste) {
    throw new AppError(MENSAJE_DUPLICADA, 409, "conflicto");
  }
}

export async function listarPorVideojuego(videojuegoId: string): Promise<IMeta[]> {
  await juegoExistente(videojuegoId);
  return Meta.find({ videojuego: videojuegoId }).sort({ createdAt: -1 });
}

export async function obtenerPorId(id: string): Promise<IMeta> {
  assertObjectId(id);
  const meta = await Meta.findById(id);
  if (!meta) throw new AppError("Meta no encontrada", 404, "no_encontrado");
  return meta;
}

export async function crear(datos: DatosMeta): Promise<IMeta> {
  if (!datos.videojuego || typeof datos.videojuego !== "string") {
    throw new AppError("El videojuego es obligatorio", 400, "validacion");
  }
  const juego = await juegoExistente(datos.videojuego);
  const activa = datos.activa !== false;
  if (activa) {
    rechazarSiEstaCerrado(juego.estado);
    await rechazarSiHayOtraActiva(datos.videojuego);
  }
  return Meta.create({ ...datos, activa });
}

export async function actualizar(id: string, datos: DatosMeta): Promise<IMeta> {
  const meta = await obtenerPorId(id);
  const juego = await juegoExistente(meta.videojuego.toString());
  const quedaraActiva = datos.activa ?? meta.activa;
  if (quedaraActiva) {
    rechazarSiEstaCerrado(juego.estado);
    await rechazarSiHayOtraActiva(meta.videojuego.toString(), meta.id);
  }
  meta.set({
    horasSemanales: datos.horasSemanales ?? meta.horasSemanales,
    diasPorSemana: datos.diasPorSemana ?? meta.diasPorSemana,
    hitos: datos.hitos ?? meta.hitos,
    activa: quedaraActiva,
  });
  await meta.save();
  return meta;
}

export async function desactivar(id: string): Promise<IMeta> {
  const meta = await obtenerPorId(id);
  meta.activa = false;
  await meta.save();
  return meta;
}

export async function desactivarActivaDe(videojuegoId: string): Promise<void> {
  await Meta.updateMany({ videojuego: videojuegoId, activa: true }, { activa: false });
}

export async function eliminarDeVideojuego(videojuegoId: string): Promise<void> {
  await Meta.deleteMany({ videojuego: videojuegoId });
}
