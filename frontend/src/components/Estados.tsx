import type { ReactNode } from "react";

export function Cargando({ texto = "Cargando tu diario…" }: { texto?: string }) {
  return (
    <div className="estado" role="status">
      <span className="pulso" aria-hidden="true" />
      <p>{texto}</p>
    </div>
  );
}

export function ErrorEstado({
  mensaje,
  detalles,
  onReintentar,
}: {
  mensaje: string;
  detalles?: string[];
  onReintentar?: () => void;
}) {
  return (
    <div className="estado estado-error" role="alert">
      <h2>No se pudo completar</h2>
      <p>{mensaje}</p>
      {detalles && detalles.length > 0 ? (
        <ul className="detalles">
          {detalles.map((detalle) => (
            <li key={detalle}>{detalle}</li>
          ))}
        </ul>
      ) : null}
      {onReintentar ? (
        <button type="button" className="btn btn-secundario" onClick={onReintentar}>
          Reintentar
        </button>
      ) : null}
    </div>
  );
}

export function Vacio({
  titulo,
  texto,
  accion,
}: {
  titulo: string;
  texto: string;
  accion?: ReactNode;
}) {
  return (
    <div className="estado">
      <h2>{titulo}</h2>
      <p>{texto}</p>
      {accion}
    </div>
  );
}
