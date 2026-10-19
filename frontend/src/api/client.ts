export class ApiError extends Error {
  readonly status: number;
  readonly tipo?: string;
  readonly detalles?: string[];

  constructor(mensaje: string, status: number, tipo?: string, detalles?: string[]) {
    super(mensaje);
    this.name = "ApiError";
    this.status = status;
    this.tipo = tipo;
    this.detalles = detalles;
  }
}

interface ErrorApi {
  error?: {
    mensaje?: string;
    tipo?: string;
    detalles?: string[];
  };
}

interface Opciones extends Omit<RequestInit, "body"> {
  body?: unknown;
}

const BASE_URL = (import.meta.env.VITE_API_URL ?? "http://localhost:3000").replace(/\/$/, "");

export async function api<T>(path: string, opciones: Opciones = {}): Promise<T> {
  const { body, headers, ...resto } = opciones;
  let respuesta: Response;

  try {
    respuesta = await fetch(`${BASE_URL}${path}`, {
      ...resto,
      headers: {
        ...(body !== undefined ? { "Content-Type": "application/json" } : {}),
        ...headers,
      },
      body: body !== undefined ? JSON.stringify(body) : undefined,
    });
  } catch {
    throw new ApiError("No hay conexión con el servidor", 0, "red");
  }

  if (respuesta.status === 204) {
    return undefined as T;
  }

  const datos = (await respuesta.json().catch(() => null)) as ErrorApi | T | null;

  if (!respuesta.ok) {
    const error = (datos as ErrorApi | null)?.error;
    throw new ApiError(
      error?.mensaje ?? "La solicitud no se pudo completar",
      respuesta.status,
      error?.tipo,
      error?.detalles,
    );
  }

  return datos as T;
}

export function mensajeDe(error: unknown): { mensaje: string; detalles?: string[] } {
  if (error instanceof ApiError) {
    return { mensaje: error.message, detalles: error.detalles };
  }
  return { mensaje: "Ocurrió un error inesperado" };
}
