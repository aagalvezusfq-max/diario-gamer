import { Document, Schema, Types, model } from "mongoose";

export interface IPartida extends Document {
  videojuego: Types.ObjectId;
  fecha: Date;
  duracionMinutos: number;
  porcentajeAvance: number;
  notas?: string;
  createdAt: Date;
  updatedAt: Date;
}

const partidaSchema = new Schema<IPartida>(
  {
    videojuego: {
      type: Schema.Types.ObjectId,
      ref: "Videojuego",
      required: [true, "El videojuego es obligatorio"],
    },
    fecha: {
      type: Date,
      required: [true, "La fecha es obligatoria"],
    },
    duracionMinutos: {
      type: Number,
      required: [true, "La duración en minutos es obligatoria"],
      min: [1, "La partida debe durar al menos 1 minuto"],
      max: [1440, "La partida no puede superar 1440 minutos (24 horas)"],
    },
    porcentajeAvance: {
      type: Number,
      required: [true, "El porcentaje de avance es obligatorio"],
      min: [0, "El porcentaje no puede ser menor que 0"],
      max: [100, "El porcentaje no puede ser mayor que 100"],
    },
    notas: {
      type: String,
      trim: true,
      maxlength: [500, "Las notas no pueden superar 500 caracteres"],
    },
  },
  { timestamps: true, versionKey: false },
);

partidaSchema.index({ videojuego: 1, fecha: -1, createdAt: -1 });

export const Partida = model<IPartida>("Partida", partidaSchema);
