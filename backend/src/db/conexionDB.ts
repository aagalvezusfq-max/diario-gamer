import mongoose from "mongoose";
import { env } from "../config/env";

export async function conectarDB(): Promise<void> {
  mongoose.set("strictQuery", true);
  await mongoose.connect(env.MONGODB_URI);
  const nombre = mongoose.connection.name;
  console.log(`MongoDB conectado (base: ${nombre})`);
}
