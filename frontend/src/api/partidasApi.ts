import type { DatosPartida, Partida } from "../types";
import { api } from "./client";

export function listarPartidas() {
  return api<Partida[]>("/api/partidas");
}

export function listarPartidasDeVideojuego(videojuegoId: string) {
  return api<Partida[]>(`/api/videojuegos/${videojuegoId}/partidas`);
}

export function crearPartida(datos: DatosPartida) {
  return api<Partida>("/api/partidas", { method: "POST", body: datos });
}

export function eliminarPartida(id: string) {
  return api<void>(`/api/partidas/${id}`, { method: "DELETE" });
}

export function nombreDelVideojuego(partida: Partida): string {
  const videojuego = partida.videojuego;
  if (videojuego && typeof videojuego === "object" && "nombre" in videojuego) {
    return videojuego.nombre;
  }
  return "Videojuego no disponible";
}

export function idDelVideojuego(partida: Partida): string | null {
  const videojuego = partida.videojuego;
  if (typeof videojuego === "string") return videojuego;
  if (videojuego && typeof videojuego === "object" && "_id" in videojuego) return videojuego._id;
  return null;
}
