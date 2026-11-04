import { readFileSync } from "node:fs";
import { spawnSync } from "node:child_process";

const entrada = JSON.parse(readFileSync(0, "utf8"));
const ruta = String(entrada?.tool_input?.file_path ?? entrada?.tool_input?.path ?? "");

if (!/\.(ts|tsx|css|md|json|mjs)$/.test(ruta) || ruta.replaceAll("\\", "/").endsWith(".env")) {
  process.exit(0);
}

const resultado = spawnSync("npx", ["prettier", "--write", ruta], { stdio: "inherit", shell: true });
process.exit(resultado.status ?? 0);
