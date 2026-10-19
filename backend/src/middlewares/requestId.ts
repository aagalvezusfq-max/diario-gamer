import { randomUUID } from "crypto";
import { NextFunction, Request, Response } from "express";

export function requestId(req: Request, res: Response, next: NextFunction): void {
  const entrante = req.header("x-request-id")?.trim();
  const id = entrante && entrante.length <= 80 ? entrante : randomUUID();
  req.requestId = id;
  res.setHeader("X-Request-Id", id);
  next();
}
