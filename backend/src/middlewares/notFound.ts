import { Request, Response } from "express";

export function notFound(req: Request, res: Response): void {
  res.status(404).json({
    error: {
      tipo: "no_encontrado",
      mensaje: `Ruta no encontrada: ${req.method} ${req.originalUrl}`,
      requestId: req.requestId,
    },
  });
}
