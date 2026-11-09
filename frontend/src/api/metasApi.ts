import type { DatosMeta, Meta } from "../types";
import { api } from "./client";

export function listarMetas(videojuegoId: string) {
  return api<Meta[]>(`/api/videojuegos/${videojuegoId}/metas`);
}

export function obtenerMeta(id: string) {
  return api<Meta>(`/api/metas/${id}`);
}

export function crearMeta(datos: DatosMeta) {
  return api<Meta>("/api/metas", { method: "POST", body: datos });
}

export function actualizarMeta(id: string, datos: DatosMeta) {
  return api<Meta>(`/api/metas/${id}`, { method: "PUT", body: datos });
}

export function desactivarMeta(id: string) {
  return api<Meta>(`/api/metas/${id}/desactivar`, { method: "PATCH" });
}
