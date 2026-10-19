import dotenv from "dotenv";

dotenv.config();

function requerida(nombre: string): string {
  const valor = process.env[nombre]?.trim();
  if (!valor) {
    throw new Error(`Falta la variable de entorno ${nombre}. Revísa backend/.env`);
  }
  return valor;
}

function origenesCors(valor: string | undefined): string[] {
  const crudo = valor?.trim() || "http://localhost:5173";
  return crudo
    .split(",")
    .map((origen) => origen.trim().replace(/\/$/, ""))
    .filter(Boolean);
}

const puerto = Number(process.env.PORT ?? 3000);

if (!Number.isInteger(puerto) || puerto <= 0) {
  throw new Error("PORT debe ser un número entero positivo");
}

export const env = {
  PORT: puerto,
  MONGODB_URI: requerida("MONGODB_URI"),
  CORS_ORIGINS: origenesCors(process.env.CORS_ORIGIN),
  NODE_ENV: process.env.NODE_ENV ?? "development",
};
