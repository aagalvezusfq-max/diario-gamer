import { useEffect, useState } from "react";
import { Link } from "react-router-dom";
import { mensajeDe } from "../api/client";
import { eliminarPartida, idDelVideojuego, listarPartidas, nombreDelVideojuego } from "../api/partidasApi";
import { Cargando, ErrorEstado, Vacio } from "../components/Estados";
import { Pagina } from "../components/Layout";
import { formatearDuracion, formatearFecha } from "../lib/formato";
import type { Partida } from "../types";

type Carga = "cargando" | "listo" | "error";

export function ListaPartidasPage() {
  const [carga, setCarga] = useState<Carga>("cargando");
  const [error, setError] = useState("");
  const [partidas, setPartidas] = useState<Partida[]>([]);
  const [aviso, setAviso] = useState("");
  const [reintento, setReintento] = useState(0);

  useEffect(() => {
    let vigente = true;
    setCarga("cargando");
    setAviso("");
    listarPartidas()
      .then((datos) => {
        if (!vigente) return;
        setPartidas(datos);
        setCarga("listo");
      })
      .catch((err: unknown) => {
        if (!vigente) return;
        setError(mensajeDe(err).mensaje);
        setCarga("error");
      });
    return () => {
      vigente = false;
    };
  }, [reintento]);

  async function quitar(id: string) {
    if (!window.confirm("¿Eliminar esta partida?")) return;
    setAviso("");
    try {
      await eliminarPartida(id);
      setPartidas((actuales) => actuales.filter((partida) => partida._id !== id));
    } catch (err: unknown) {
      setAviso(mensajeDe(err).mensaje);
    }
  }

  return (
    <Pagina
      titulo="Partidas"
      bajada="Todas las sesiones, también las de esta semana, sin abrir la ficha de cada juego."
      accion={
        <Link to="/partidas/nueva" className="btn btn-primario">
          Nueva partida
        </Link>
      }
    >
      {aviso ? (
        <p className="aviso" role="alert">
          {aviso}
        </p>
      ) : null}
      {carga === "cargando" ? <Cargando texto="Reuniendo partidas…" /> : null}
      {carga === "error" ? <ErrorEstado mensaje={error} onReintentar={() => setReintento((valor) => valor + 1)} /> : null}
      {carga === "listo" && partidas.length === 0 ? (
        <Vacio
          titulo="No hay partidas registradas"
          texto="Cuando anotes una sesión vas a ver aquí la fecha, la duración y el avance."
          accion={
            <Link to="/partidas/nueva" className="btn btn-primario">
              Registrar la primera
            </Link>
          }
        />
      ) : null}
      {carga === "listo" && partidas.length > 0 ? (
        <ul className="sesiones sesiones-global">
          {partidas.map((partida) => {
            const videojuegoId = idDelVideojuego(partida);
            return (
              <li key={partida._id}>
                <div>
                  <strong>{formatearFecha(partida.fecha)}</strong>
                  <span>{formatearDuracion(partida.duracionMinutos)}</span>
                </div>
                {videojuegoId ? (
                  <Link to={`/videojuegos/${videojuegoId}`}>{nombreDelVideojuego(partida)}</Link>
                ) : (
                  <span>{nombreDelVideojuego(partida)}</span>
                )}
                <b>{partida.porcentajeAvance}%</b>
                <p>{partida.notas?.trim() ? partida.notas : "Sin notas"}</p>
                <button type="button" className="btn btn-texto" onClick={() => quitar(partida._id)}>
                  Eliminar
                </button>
              </li>
            );
          })}
        </ul>
      ) : null}
    </Pagina>
  );
}
