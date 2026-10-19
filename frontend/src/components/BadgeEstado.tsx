import { ETIQUETA_ESTADO } from "../domain/catalogo";
import type { Estado } from "../types";

export function BadgeEstado({ estado }: { estado: Estado }) {
  return <span className={`badge badge-${estado}`}>{ETIQUETA_ESTADO[estado]}</span>;
}
