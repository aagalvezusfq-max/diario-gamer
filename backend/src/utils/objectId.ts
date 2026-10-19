import mongoose from "mongoose";
import { AppError } from "../errors/AppError";

export function assertObjectId(id: string, campo = "id"): void {
  if (!mongoose.Types.ObjectId.isValid(id)) {
    throw new AppError(`El ${campo} no tiene un formato válido`, 400, "id_mal_formado");
  }
}
