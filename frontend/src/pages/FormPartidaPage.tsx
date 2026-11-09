import { useEffect, useState, type FormEvent } from "react";
import { Link, useNavigate, useParams } from "react-router-dom";
import { mensajeDe } from "../api/client";
import { actualizarPartida, crearPartida, idDelVideojuego, obtenerPartida } from "../api/partidasApi";
import { listarVideojuegos } from "../api/videojuegosApi";
import { Cargando, ErrorEstado, Vacio } from "../components/Estados";
import { Pagina } from "../components/Layout";
import { hoyISO } from "../lib/formato";
import type { Videojuego } from "../types";

type Carga = "cargando" | "listo" | "error";

export function FormPartidaPage() {
  const { id, partidaId } = useParams();
  const esEdicion = Boolean(partidaId);
  const navigate = useNavigate();
  const [carga, setCarga] = useState<Carga>("cargando");
  const [errorCarga, setErrorCarga] = useState("");
  const [juegos, setJuegos] = useState<Videojuego[]>([]);
  const [videojuegoId, setVideojuegoId] = useState(id ?? "");
  const [fecha, setFecha] = useState(hoyISO());
  const [duracion, setDuracion] = useState("60");
  const [avance, setAvance] = useState("0");
  const [notas, setNotas] = useState("");
  const [enviando, setEnviando] = useState(false);
  const [error, setError] = useState("");
  const [detalles, setDetalles] = useState<string[]>([]);
  const [reintento, setReintento] = useState(0);

  useEffect(() => {
    let vigente = true;
    setCarga("cargando");
    Promise.all([listarVideojuegos(), partidaId ? obtenerPartida(partidaId) : Promise.resolve(null)])
      .then(([datos, partida]) => {
        if (!vigente) return;
        setJuegos(datos);
        if (partida) {
          setVideojuegoId(idDelVideojuego(partida) ?? id ?? "");
          setFecha(partida.fecha.slice(0, 10));
          setDuracion(String(partida.duracionMinutos));
          setAvance(String(partida.porcentajeAvance));
          setNotas(partida.notas ?? "");
        } else {
          setVideojuegoId(id || datos[0]?._id || "");
        }
        setCarga("listo");
      })
      .catch((err: unknown) => {
        if (!vigente) return;
        setErrorCarga(mensajeDe(err).mensaje);
        setCarga("error");
      });
    return () => {
      vigente = false;
    };
  }, [id, partidaId, reintento]);

  async function enviar(event: FormEvent) {
    event.preventDefault();
    setError("");
    setDetalles([]);

    const duracionMinutos = Number(duracion);
    const porcentajeAvance = Number(avance);

    if (!videojuegoId) {
      setError("Elige un videojuego.");
      return;
    }
    if (!Number.isInteger(duracionMinutos) || duracionMinutos < 1 || duracionMinutos > 1440) {
      setError("La duración debe ser un entero entre 1 y 1440 minutos.");
      return;
    }
    if (!Number.isFinite(porcentajeAvance) || porcentajeAvance < 0 || porcentajeAvance > 100) {
      setError("El avance debe estar entre 0 y 100.");
      return;
    }

    setEnviando(true);
    try {
      const datos = {
        videojuego: videojuegoId,
        fecha,
        duracionMinutos,
        porcentajeAvance,
        notas: notas.trim() || undefined,
      };
      if (esEdicion && partidaId) await actualizarPartida(partidaId, datos);
      else await crearPartida(datos);
      navigate(`/videojuegos/${videojuegoId}`);
    } catch (err: unknown) {
      const info = mensajeDe(err);
      setError(info.mensaje);
      setDetalles(info.detalles ?? []);
      setEnviando(false);
    }
  }

  if (carga === "cargando") return <Cargando texto="Cargando videojuegos…" />;
  if (carga === "error") return <ErrorEstado mensaje={errorCarga} onReintentar={() => setReintento((valor) => valor + 1)} />;
  if (juegos.length === 0) {
    return (
      <Vacio
        titulo="Primero crea un videojuego"
        texto="Una partida siempre referencia un juego que ya existe."
        accion={
          <Link to="/videojuegos/nuevo" className="btn btn-primario">
            Crear videojuego
          </Link>
        }
      />
    );
  }

  return (
    <Pagina
      titulo={esEdicion ? "Editar partida" : "Nueva partida"}
      bajada="Al guardarla, el detalle vuelve a pedir el resumen y el progreso de la semana."
    >
      <form className="formulario" onSubmit={enviar}>
        <div className="campo">
          <label htmlFor="videojuego">Videojuego</label>
          <select id="videojuego" value={videojuegoId} onChange={(event) => setVideojuegoId(event.target.value)} required disabled={esEdicion}>
            {juegos.map((juego) => (
              <option key={juego._id} value={juego._id}>
                {juego.nombre}
              </option>
            ))}
          </select>
        </div>
        <div className="formulario-grid">
          <div className="campo">
            <label htmlFor="fecha">Fecha</label>
            <input id="fecha" type="date" value={fecha} onChange={(event) => setFecha(event.target.value)} required />
          </div>
          <div className="campo">
            <label htmlFor="duracion">Duración (minutos)</label>
            <input
              id="duracion"
              type="number"
              min={1}
              max={1440}
              step={1}
              value={duracion}
              onChange={(event) => setDuracion(event.target.value)}
              required
            />
          </div>
          <div className="campo">
            <label htmlFor="avance">Avance (%)</label>
            <input
              id="avance"
              type="number"
              min={0}
              max={100}
              step={1}
              value={avance}
              onChange={(event) => setAvance(event.target.value)}
              required
            />
          </div>
        </div>
        <div className="campo">
          <label htmlFor="notas">Notas</label>
          <textarea
            id="notas"
            value={notas}
            maxLength={500}
            rows={4}
            placeholder="Opcional. Qué pasó en la sesión."
            onChange={(event) => setNotas(event.target.value)}
          />
        </div>

        {error ? (
          <div className="aviso" role="alert">
            <p>{error}</p>
            {detalles.length > 0 ? (
              <ul className="detalles">
                {detalles.map((detalle) => (
                  <li key={detalle}>{detalle}</li>
                ))}
              </ul>
            ) : null}
          </div>
        ) : null}

        <div className="acciones">
          <button type="submit" className="btn btn-primario" disabled={enviando}>
            {enviando ? "Guardando…" : "Guardar partida"}
          </button>
          <Link to={videojuegoId ? `/videojuegos/${videojuegoId}` : "/partidas"} className="btn btn-texto">
            Cancelar
          </Link>
        </div>
      </form>
    </Pagina>
  );
}
