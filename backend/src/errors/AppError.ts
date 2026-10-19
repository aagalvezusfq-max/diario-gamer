export type TipoError =
  | "validacion"
  | "id_mal_formado"
  | "referencia_inexistente"
  | "no_encontrado"
  | "inesperado";

export class AppError extends Error {
  readonly statusCode: number;
  readonly tipo: TipoError;
  readonly detalles?: string[];

  constructor(mensaje: string, statusCode: number, tipo: TipoError, detalles?: string[]) {
    super(mensaje);
    this.name = "AppError";
    this.statusCode = statusCode;
    this.tipo = tipo;
    this.detalles = detalles;
  }
}
