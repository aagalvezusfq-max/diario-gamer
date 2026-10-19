import { Document, Schema, model } from "mongoose";

export const PLATAFORMAS = ["PC", "PlayStation", "Xbox", "Switch", "Movil"] as const;
export const GENEROS = ["accion", "rol", "estrategia", "puzzle", "deportes", "otro"] as const;
export const ESTADOS = ["jugando", "pausado", "completado", "abandonado"] as const;

export type Plataforma = (typeof PLATAFORMAS)[number];
export type Genero = (typeof GENEROS)[number];
export type Estado = (typeof ESTADOS)[number];

export interface ILogro {
  _id: Schema.Types.ObjectId;
  nombre: string;
  obtenido: boolean;
}

export interface IVideojuego extends Document {
  nombre: string;
  plataformas: Plataforma;
  genero: Genero;
  estado: Estado;
  logros: ILogro[];
  createdAt: Date;
  updatedAt: Date;
}

const logroSchema = new Schema<ILogro>(
  {
    nombre: {
      type: String,
      required: [true, "El nombre del logro es obligatorio"],
      trim: true,
      minlength: [2, "El nombre del logro debe tener al menos 2 caracteres"],
      maxlength: [80, "El nombre del logro no puede superar 80 caracteres"],
    },
    obtenido: {
      type: Boolean,
      required: [true, "Debes indicar si el logro fue obtenido"],
      default: false,
    },
  },
  { _id: true },
);

const videojuegoSchema = new Schema<IVideojuego>(
  {
    nombre: {
      type: String,
      required: [true, "El nombre es obligatorio"],
      trim: true,
      minlength: [1, "El nombre no puede estar vacío"],
      maxlength: [120, "El nombre no puede superar 120 caracteres"],
    },
    plataformas: {
      type: String,
      required: [true, "La plataforma es obligatoria"],
      enum: {
        values: [...PLATAFORMAS],
        message: "La plataforma debe ser PC, PlayStation, Xbox, Switch o Movil",
      },
    },
    genero: {
      type: String,
      required: [true, "El género es obligatorio"],
      enum: {
        values: [...GENEROS],
        message: "El género debe ser accion, rol, estrategia, puzzle, deportes u otro",
      },
    },
    estado: {
      type: String,
      required: [true, "El estado es obligatorio"],
      enum: {
        values: [...ESTADOS],
        message: "El estado debe ser jugando, pausado, completado o abandonado",
      },
      default: "jugando",
    },
    logros: {
      type: [logroSchema],
      default: [],
    },
  },
  { timestamps: true, versionKey: false },
);

export const Videojuego = model<IVideojuego>("Videojuego", videojuegoSchema);
