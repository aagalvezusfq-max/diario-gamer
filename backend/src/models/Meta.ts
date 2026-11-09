import { Document, Schema, Types, model } from "mongoose";

export interface IHitoMeta {
  _id: Types.ObjectId;
  descripcion: string;
  porcentajeObjetivo: number;
}

export interface IMeta extends Document {
  videojuego: Types.ObjectId;
  horasSemanales: number;
  diasPorSemana: number;
  activa: boolean;
  hitos: IHitoMeta[];
  createdAt: Date;
  updatedAt: Date;
}

const hitoMetaSchema = new Schema<IHitoMeta>(
  {
    descripcion: {
      type: String,
      required: [true, "La descripción del hito es obligatoria"],
      trim: true,
      minlength: [2, "El hito debe tener al menos 2 caracteres"],
      maxlength: [80, "El hito no puede superar 80 caracteres"],
    },
    porcentajeObjetivo: {
      type: Number,
      required: [true, "El porcentaje objetivo del hito es obligatorio"],
      min: [1, "El hito debe pedir al menos 1 %"],
      max: [100, "El hito no puede pasar de 100 %"],
    },
  },
  { _id: true },
);

const metaSchema = new Schema<IMeta>(
  {
    videojuego: {
      type: Schema.Types.ObjectId,
      ref: "Videojuego",
      required: [true, "El videojuego es obligatorio"],
    },
    horasSemanales: {
      type: Number,
      required: [true, "Las horas semanales son obligatorias"],
      validate: {
        validator: (valor: number) => valor > 0 && valor <= 100,
        message: "Las horas semanales deben ser mayores que 0 y como máximo 100",
      },
    },
    diasPorSemana: {
      type: Number,
      required: [true, "Los días por semana son obligatorios"],
      min: [1, "Debes proponerte al menos 1 día"],
      max: [7, "Una semana tiene como máximo 7 días"],
      validate: {
        validator: Number.isInteger,
        message: "Los días por semana deben ser un número entero",
      },
    },
    activa: {
      type: Boolean,
      default: true,
    },
    hitos: {
      type: [hitoMetaSchema],
      default: [],
      validate: {
        validator: (hitos: IHitoMeta[]) => hitos.length <= 5,
        message: "Una meta tiene como máximo 5 hitos",
      },
    },
  },
  { timestamps: true, versionKey: false },
);

metaSchema.index({ videojuego: 1, activa: 1 });

export const Meta = model<IMeta>("Meta", metaSchema);
