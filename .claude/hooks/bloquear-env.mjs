import { readFileSync } from "node:fs";

const entrada = JSON.parse(readFileSync(0, "utf8"));
const ruta = String(entrada?.tool_input?.file_path ?? entrada?.tool_input?.path ?? "");
const normalizada = ruta.replaceAll("\\", "/");

if (normalizada.endsWith("/.env") || normalizada.endsWith(".env")) {
  console.error("Regla del harness: no se lee ni se modifica .env.");
  process.exit(2);
}
