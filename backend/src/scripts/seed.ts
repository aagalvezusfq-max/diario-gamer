import { conectarDB } from "../db/conexionDB";
import { Partida } from "../models/Partida";
import { Videojuego } from "../models/Videojuego";
import mongoose from "mongoose";

async function sembrar(): Promise<void> {
  await conectarDB();

  const nombre = "Hades II";
  const anterior = await Videojuego.findOne({ nombre });
  if (anterior) {
    await Partida.deleteMany({ videojuego: anterior._id });
    await anterior.deleteOne();
  }

  const juego = await Videojuego.create({
    nombre,
    plataformas: "PC",
    genero: "accion",
    estado: "jugando",
    logros: [
      { nombre: "Escapar del inframundo", obtenido: true },
      { nombre: "Derrotar a Cronos", obtenido: false },
      { nombre: "Completar una carrera sin daño", obtenido: false },
    ],
  });

  await Partida.create([
    {
      videojuego: juego._id,
      fecha: new Date("2026-09-20T00:00:00.000Z"),
      duracionMinutos: 90,
      porcentajeAvance: 20,
      notas: "Primera bajada",
    },
    {
      videojuego: juego._id,
      fecha: new Date("2026-09-27T00:00:00.000Z"),
      duracionMinutos: 120,
      porcentajeAvance: 45,
      notas: "Llegué a los Campos",
    },
    {
      videojuego: juego._id,
      fecha: new Date("2026-10-02T00:00:00.000Z"),
      duracionMinutos: 75,
      porcentajeAvance: 67,
      notas: "Casi el jefe",
    },
  ]);

  console.log(`Semilla lista. Videojuego ${nombre}: ${juego._id.toString()}`);
  console.log("Resumen esperado: totalPartidas 3, horasTotales 4.8, avance 67, última 2026-10-02.");
  await mongoose.disconnect();
}

sembrar().catch(async (error: unknown) => {
  console.error(error);
  await mongoose.disconnect();
  process.exit(1);
});
