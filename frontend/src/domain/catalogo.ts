import type { Estado, Genero, Plataforma } from "../types";

export const ETIQUETA_PLATAFORMA: Record<Plataforma, string> = {
  PC: "PC",
  PlayStation: "PlayStation",
  Xbox: "Xbox",
  Switch: "Switch",
  Movil: "Móvil",
};

export const ETIQUETA_GENERO: Record<Genero, string> = {
  accion: "Acción",
  rol: "Rol",
  estrategia: "Estrategia",
  puzzle: "Puzzle",
  deportes: "Deportes",
  otro: "Otro",
};

export const ETIQUETA_ESTADO: Record<Estado, string> = {
  jugando: "Jugando",
  pausado: "Pausado",
  completado: "Completado",
  abandonado: "Abandonado",
};
