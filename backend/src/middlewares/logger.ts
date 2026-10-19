import { NextFunction, Request, Response } from "express";

export function logger(req: Request, res: Response, next: NextFunction): void {
  const inicio = Date.now();
  res.on("finish", () => {
    const ms = Date.now() - inicio;
    console.log(`${req.requestId} ${req.method} ${req.originalUrl} ${res.statusCode} ${ms}ms`);
  });
  next();
}
