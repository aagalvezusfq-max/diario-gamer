import { Request, Response } from "express";
import * as partidasService from "../services/partidas.service";
import * as videojuegosService from "../services/videojuegos.service";
import { asyncHandler } from "../utils/asyncHandler";

function texto(valor: unknown): string | undefined {
  return typeof valor === "string" ? valor : undefined;
}

export const listar = asyncHandler(async (req: Request, res: Response) => {
  const videojuegos = await videojuegosService.listar({
    estado: texto(req.query.estado),
    genero: texto(req.query.genero),
    plataformas: texto(req.query.plataformas),
    q: texto(req.query.q),
  });
  res.json(videojuegos);
});

export const obtener = asyncHandler(async (req: Request, res: Response) => {
  const videojuego = await videojuegosService.obtenerPorId(req.params.id);
  res.json(videojuego);
});

export const crear = asyncHandler(async (req: Request, res: Response) => {
  const videojuego = await videojuegosService.crear(req.body);
  res.status(201).json(videojuego);
});

export const actualizar = asyncHandler(async (req: Request, res: Response) => {
  const videojuego = await videojuegosService.actualizar(req.params.id, req.body);
  res.json(videojuego);
});

export const eliminar = asyncHandler(async (req: Request, res: Response) => {
  await videojuegosService.eliminar(req.params.id);
  res.status(204).send();
});

export const partidas = asyncHandler(async (req: Request, res: Response) => {
  const lista = await partidasService.listarPorVideojuego(req.params.id);
  res.json(lista);
});

export const resumen = asyncHandler(async (req: Request, res: Response) => {
  const calculado = await videojuegosService.obtenerResumen(req.params.id);
  res.json(calculado);
});

export const actualizarLogro = asyncHandler(async (req: Request, res: Response) => {
  const videojuego = await videojuegosService.actualizarLogro(req.params.id, req.params.logroId, req.body?.obtenido);
  res.json(videojuego);
});
