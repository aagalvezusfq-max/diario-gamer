import { Request, Response } from "express";
import * as partidasService from "../services/partidas.service";
import { asyncHandler } from "../utils/asyncHandler";

function texto(valor: unknown): string | undefined {
  return typeof valor === "string" ? valor : undefined;
}

export const listar = asyncHandler(async (req: Request, res: Response) => {
  const partidas = await partidasService.listar({
    videojuego: texto(req.query.videojuego),
    desde: texto(req.query.desde),
    hasta: texto(req.query.hasta),
  });
  res.json(partidas);
});

export const crear = asyncHandler(async (req: Request, res: Response) => {
  const partida = await partidasService.crear(req.body);
  res.status(201).json(partida);
});

export const obtener = asyncHandler(async (req: Request, res: Response) => {
  const partida = await partidasService.obtenerPorId(req.params.id);
  res.json(partida);
});

export const actualizar = asyncHandler(async (req: Request, res: Response) => {
  const partida = await partidasService.actualizar(req.params.id, req.body);
  res.json(partida);
});

export const eliminar = asyncHandler(async (req: Request, res: Response) => {
  await partidasService.eliminar(req.params.id);
  res.status(204).send();
});
