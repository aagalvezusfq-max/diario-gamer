export const PLATAFORMAS = ["PC", "PlayStation", "Xbox", "Switch", "Movil"] as const;
export const GENEROS = ["accion", "rol", "estrategia", "puzzle", "deportes", "otro"] as const;
export const ESTADOS = ["jugando", "pausado", "completado", "abandonado"] as const;

export type Plataforma = (typeof PLATAFORMAS)[number];
export type Genero = (typeof GENEROS)[number];
export type Estado = (typeof ESTADOS)[number];

export interface Logro {
  _id: string;
  nombre: string;
  obtenido: boolean;
}

export interface Videojuego {
  _id: string;
  nombre: string;
  plataformas: Plataforma;
  genero: Genero;
  estado: Estado;
  logros: Logro[];
  createdAt: string;
  updatedAt: string;
}

export interface ResumenVideojuego {
  totalPartidas: number;
  horasTotales: number;
  ultimaPartida: string | null;
  porcentajeAvanceActual: number | null;
}

export interface Partida {
  _id: string;
  videojuego: Videojuego | string | null;
  fecha: string;
  duracionMinutos: number;
  porcentajeAvance: number;
  notas?: string;
  createdAt: string;
  updatedAt: string;
}

export interface FiltroVideojuegos {
  q?: string;
  estado?: string;
  genero?: string;
  plataformas?: string;
}

export interface DatosLogro {
  _id?: string;
  nombre: string;
  obtenido: boolean;
}

export interface DatosVideojuego {
  nombre: string;
  plataformas: Plataforma;
  genero: Genero;
  estado: Estado;
  logros: DatosLogro[];
}

export interface DatosPartida {
  videojuego: string;
  fecha: string;
  duracionMinutos: number;
  porcentajeAvance: number;
  notas?: string;
}

export interface HitoMeta {
  _id?: string;
  descripcion: string;
  porcentajeObjetivo: number;
}

export interface Meta {
  _id: string;
  videojuego: string;
  horasSemanales: number;
  diasPorSemana: number;
  activa: boolean;
  hitos: HitoMeta[];
}

export interface ProgresoSemanal {
  semana: { inicio: string; fin: string };
  meta: { horasSemanales: number; diasPorSemana: number } | null;
  horasSemana: number;
  porcentajeHoras: number | null;
  diasJugadosSemana: number;
  rachaActual: number;
  mejorRacha: number;
  hitos: { descripcion: string; porcentajeObjetivo: number; alcanzado: boolean }[];
}

export interface DatosMeta {
  videojuego: string;
  horasSemanales: number;
  diasPorSemana: number;
  hitos: { _id?: string; descripcion: string; porcentajeObjetivo: number }[];
}
