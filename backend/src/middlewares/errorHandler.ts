import { NextFunction, Request, Response } from "express";
import mongoose from "mongoose";
import { AppError, TipoError } from "../errors/AppError";

interface CuerpoError {
  error: {
    tipo: TipoError;
    mensaje: string;
    detalles?: string[];
    requestId: string;
  };
}

function responder(
  res: Response,
  req: Request,
  status: number,
  tipo: TipoError,
  mensaje: string,
  detalles?: string[],
): void {
  const cuerpo: CuerpoError = {
    error: {
      tipo,
      mensaje,
      requestId: req.requestId,
      ...(detalles && detalles.length > 0 ? { detalles } : {}),
    },
  };
  res.status(status).json(cuerpo);
}

function esJsonInvalido(err: unknown): boolean {
  if (!(err instanceof SyntaxError)) return false;
  const conEstado = err as SyntaxError & { status?: number; type?: string };
  return conEstado.status === 400 || conEstado.type === "entity.parse.failed";
}

export function errorHandler(err: unknown, req: Request, res: Response, next: NextFunction): void {
  if (res.headersSent) {
    next(err);
    return;
  }

  if (err instanceof AppError) {
    responder(res, req, err.statusCode, err.tipo, err.message, err.detalles);
    return;
  }

  if (err instanceof mongoose.Error.ValidationError) {
    const detalles = Object.values(err.errors).map((item) => item.message);
    responder(res, req, 400, "validacion", "Los datos no cumplen el esquema", detalles);
    return;
  }

  if (err instanceof mongoose.Error.CastError) {
    const esIdentificador = err.path === "_id" || err.kind === "ObjectId";
    if (esIdentificador) {
      responder(res, req, 400, "id_mal_formado", "El identificador no tiene un formato válido");
      return;
    }
    responder(res, req, 400, "validacion", `El valor de ${err.path} no es válido`);
    return;
  }

  if (esJsonInvalido(err)) {
    responder(res, req, 400, "validacion", "El cuerpo de la petición no es JSON válido");
    return;
  }

  const mongo = err as { code?: number };
  if (mongo.code === 11000) {
    responder(res, req, 400, "validacion", "Ya existe un documento con esos datos");
    return;
  }

  console.error(req.requestId, err);
  responder(res, req, 500, "inesperado", "Ocurrió un error inesperado");
}
