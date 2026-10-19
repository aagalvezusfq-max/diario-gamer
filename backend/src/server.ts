import { app } from "./app";
import { env } from "./config/env";
import { conectarDB } from "./db/conexionDB";

async function main(): Promise<void> {
  await conectarDB();
  app.listen(env.PORT, () => {
    console.log(`API escuchando en el puerto ${env.PORT}`);
  });
}

main().catch((error: unknown) => {
  console.error("No se pudo iniciar el servidor");
  console.error(error);
  process.exit(1);
});
