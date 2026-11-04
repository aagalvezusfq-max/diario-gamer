import type { DatosVideojuego, FiltroVideojuegos, ProgresoSemanal, ResumenVideojuego, Videojuego } from "../types";
import { api } from "./client";

function consulta(filtro: FiltroVideojuegos = {}): string {
  const params = new URLSearchParams();
  if (filtro.q) params.set("q", filtro.q);
  if (filtro.estado) params.set("estado", filtro.estado);
  if (filtro.genero) params.set("genero", filtro.genero);
  if (filtro.plataformas) params.set("plataformas", filtro.plataformas);
  const qs = params.toString();
  return qs ? `?${qs}` : "";
}

export function listarVideojuegos(filtro?: FiltroVideojuegos) {
  return api<Videojuego[]>(`/api/videojuegos${consulta(filtro)}`);
}

export function obtenerVideojuego(id: string) {
  return api<Videojuego>(`/api/videojuegos/${id}`);
}

export function crearVideojuego(datos: DatosVideojuego) {
  return api<Videojuego>("/api/videojuegos", { method: "POST", body: datos });
}

export function actualizarVideojuego(id: string, datos: DatosVideojuego) {
  return api<Videojuego>(`/api/videojuegos/${id}`, { method: "PUT", body: datos });
}

export function eliminarVideojuego(id: string) {
  return api<void>(`/api/videojuegos/${id}`, { method: "DELETE" });
}

export function obtenerResumen(id: string) {
  return api<ResumenVideojuego>(`/api/videojuegos/${id}/resumen`);
}

export function obtenerProgresoSemanal(id: string) {
  return api<ProgresoSemanal>(`/api/videojuegos/${id}/progreso-semanal`);
}

export function actualizarLogro(videojuegoId: string, logroId: string, obtenido: boolean) {
  return api<Videojuego>(`/api/videojuegos/${videojuegoId}/logros/${logroId}`, {
    method: "PATCH",
    body: { obtenido },
  });
}
