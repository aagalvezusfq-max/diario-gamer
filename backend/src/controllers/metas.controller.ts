import { Request, Response } from "express";
import * as metasService from "../services/metas.service";
import { asyncHandler } from "../utils/asyncHandler";

export const listarPorVideojuego = asyncHandler(async (req: Request, res: Response) => {
  const metas = await metasService.listarPorVideojuego(req.params.id);
  res.json(metas);
});

export const obtener = asyncHandler(async (req: Request, res: Response) => {
  const meta = await metasService.obtenerPorId(req.params.id);
  res.json(meta);
});

export const crear = asyncHandler(async (req: Request, res: Response) => {
  const meta = await metasService.crear(req.body);
  res.status(201).json(meta);
});

export const actualizar = asyncHandler(async (req: Request, res: Response) => {
  const meta = await metasService.actualizar(req.params.id, req.body);
  res.json(meta);
});

export const desactivar = asyncHandler(async (req: Request, res: Response) => {
  const meta = await metasService.desactivar(req.params.id);
  res.json(meta);
});
