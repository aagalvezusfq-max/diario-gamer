import { useCallback, useEffect, useState } from "react";
import { Link, useNavigate, useParams } from "react-router-dom";
import { mensajeDe } from "../api/client";
import { desactivarMeta, listarMetas } from "../api/metasApi";
import { eliminarPartida, listarPartidasDeVideojuego } from "../api/partidasApi";
import { actualizarLogro, eliminarVideojuego, obtenerProgresoSemanal, obtenerResumen, obtenerVideojuego } from "../api/videojuegosApi";
import { BadgeEstado } from "../components/BadgeEstado";
import { Cargando, ErrorEstado, Vacio } from "../components/Estados";
import { ETIQUETA_GENERO, ETIQUETA_PLATAFORMA } from "../domain/catalogo";
import { formatearDuracion, formatearFecha, formatearHoras } from "../lib/formato";
import type { Partida, ProgresoSemanal, ResumenVideojuego, Videojuego } from "../types";

type Carga = "cargando" | "listo" | "error";

export function DetalleVideojuegoPage() {
  const { id = "" } = useParams();
  const navigate = useNavigate();
  const [carga, setCarga] = useState<Carga>("cargando");
  const [error, setError] = useState("");
  const [aviso, setAviso] = useState("");
  const [juego, setJuego] = useState<Videojuego | null>(null);
  const [resumen, setResumen] = useState<ResumenVideojuego | null>(null);
  const [partidas, setPartidas] = useState<Partida[]>([]);
  const [progreso, setProgreso] = useState<ProgresoSemanal | null>(null);
  const [metaActivaId, setMetaActivaId] = useState<string | null>(null);
  const [logroPendiente, setLogroPendiente] = useState<string | null>(null);
  const [eliminando, setEliminando] = useState(false);
  const [reintento, setReintento] = useState(0);

  const cargar = useCallback(() => {
    let vigente = true;
    setCarga("cargando");
    setAviso("");

    Promise.all([
      obtenerVideojuego(id),
      obtenerResumen(id),
      listarPartidasDeVideojuego(id),
      obtenerProgresoSemanal(id),
      listarMetas(id),
    ])
      .then(([juegoData, resumenData, partidasData, progresoData, metas]) => {
        if (!vigente) return;
        setJuego(juegoData);
        setResumen(resumenData);
        setPartidas(partidasData);
        setProgreso(progresoData);
        setMetaActivaId(metas.find((meta) => meta.activa)?._id ?? null);
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
  }, [id, reintento]);

  useEffect(() => cargar(), [cargar]);

  async function alternarLogro(logroId: string, obtenido: boolean) {
    setAviso("");
    setLogroPendiente(logroId);
    try {
      const actualizado = await actualizarLogro(id, logroId, obtenido);
      setJuego(actualizado);
    } catch (err: unknown) {
      setAviso(mensajeDe(err).mensaje);
    } finally {
      setLogroPendiente(null);
    }
  }

  async function quitarPartida(partidaId: string) {
    if (!window.confirm("¿Eliminar esta partida? El resumen se recalcula en el servidor.")) return;
    setAviso("");
    try {
      await eliminarPartida(partidaId);
      const [resumenData, partidasData, progresoData] = await Promise.all([
        obtenerResumen(id),
        listarPartidasDeVideojuego(id),
        obtenerProgresoSemanal(id),
      ]);
      setResumen(resumenData);
      setPartidas(partidasData);
      setProgreso(progresoData);
    } catch (err: unknown) {
      setAviso(mensajeDe(err).mensaje);
    }
  }

  async function borrarJuego() {
    if (!juego) return;
    if (!window.confirm(`¿Eliminar ${juego.nombre}, sus partidas y su meta?`)) return;
    setEliminando(true);
    try {
      await eliminarVideojuego(juego._id);
      navigate("/");
    } catch (err: unknown) {
      setAviso(mensajeDe(err).mensaje);
      setEliminando(false);
    }
  }

  async function apagarMeta() {
    if (!metaActivaId) return;
    if (!window.confirm("¿Apagar esta meta? La semana dejará de medirse contra ella.")) return;
    setAviso("");
    try {
      await desactivarMeta(metaActivaId);
      const [progresoData, metas] = await Promise.all([obtenerProgresoSemanal(id), listarMetas(id)]);
      setProgreso(progresoData);
      setMetaActivaId(metas.find((meta) => meta.activa)?._id ?? null);
    } catch (err: unknown) {
      setAviso(mensajeDe(err).mensaje);
    }
  }

  if (carga === "cargando") return <Cargando texto="Abriendo la ficha…" />;
  if (carga === "error" || !juego || !resumen || !progreso) {
    return <ErrorEstado mensaje={error || "No se pudo abrir el videojuego"} onReintentar={() => setReintento((valor) => valor + 1)} />;
  }

  const avance = resumen.porcentajeAvanceActual ?? 0;

  return (
    <article className="detalle">
      <header className="detalle-cabecera">
        <div>
          <p className="ceja">
            {ETIQUETA_GENERO[juego.genero]} · {ETIQUETA_PLATAFORMA[juego.plataformas]}
          </p>
          <h1>{juego.nombre}</h1>
          <BadgeEstado estado={juego.estado} />
        </div>
        <div className="acciones">
          <Link to={`/videojuegos/${juego._id}/editar`} className="btn btn-secundario">
            Editar
          </Link>
          <Link to={`/videojuegos/${juego._id}/partidas/nueva`} className="btn btn-primario">
            Registrar partida
          </Link>
          <button type="button" className="btn btn-peligro" onClick={borrarJuego} disabled={eliminando}>
            {eliminando ? "Eliminando…" : "Eliminar"}
          </button>
        </div>
      </header>

      {aviso ? (
        <p className="aviso" role="alert">
          {aviso}
        </p>
      ) : null}

      <section className="resumen" aria-labelledby="titulo-resumen">
        <div className="seccion-titulo">
          <h2 id="titulo-resumen">Resumen calculado</h2>
          <p>Horas totales, cantidad de partidas, última sesión y el avance de esa sesión. Lo calcula el backend.</p>
        </div>
        <dl className="metricas">
          <div>
            <dt>Partidas</dt>
            <dd>{resumen.totalPartidas}</dd>
          </div>
          <div>
            <dt>Horas totales</dt>
            <dd>{formatearHoras(resumen.horasTotales)}</dd>
          </div>
          <div>
            <dt>Última partida</dt>
            <dd title={resumen.ultimaPartida ?? undefined}>{formatearFecha(resumen.ultimaPartida)}</dd>
          </div>
          <div>
            <dt>Avance actual</dt>
            <dd>{resumen.porcentajeAvanceActual === null ? "—" : `${resumen.porcentajeAvanceActual}%`}</dd>
          </div>
        </dl>
        <div className="avance-barra" role="img" aria-label={`Avance actual ${avance}%`}>
          <span style={{ width: `${avance}%` }} />
        </div>
        {resumen.totalPartidas === 0 ? (
          <p className="nota-vacia">Aún no hay partidas. El avance aparece cuando registres la primera sesión.</p>
        ) : null}
      </section>

      <section className="panel semana" aria-labelledby="titulo-semana">
        <div className="seccion-titulo">
          <h2 id="titulo-semana">Esta semana</h2>
          <p>
            {formatearFecha(`${progreso.semana.inicio}T00:00:00.000Z`)} – {formatearFecha(`${progreso.semana.fin}T00:00:00.000Z`)}. Lunes a domingo, hora de Ecuador.
          </p>
        </div>
        <dl className="metricas">
          <div>
            <dt>Horas</dt>
            <dd>{formatearHoras(progreso.horasSemana)}</dd>
          </div>
          <div>
            <dt>De la meta</dt>
            <dd>{progreso.porcentajeHoras === null ? "—" : `${progreso.porcentajeHoras}%`}</dd>
          </div>
          <div>
            <dt>Días jugados</dt>
            <dd>
              {progreso.diasJugadosSemana}
              {progreso.meta ? ` de ${progreso.meta.diasPorSemana}` : ""}
            </dd>
          </div>
          <div>
            <dt>Racha</dt>
            <dd>
              {progreso.rachaActual}
              <span className="racha-mejor"> mejor {progreso.mejorRacha}</span>
            </dd>
          </div>
        </dl>
        {progreso.meta ? (
          <div className="avance-barra" role="img" aria-label={`Horas de la semana ${progreso.porcentajeHoras}%`}>
            <span style={{ width: `${Math.min(progreso.porcentajeHoras ?? 0, 100)}%` }} />
          </div>
        ) : null}
        {progreso.meta ? (
          progreso.hitos.length === 0 ? (
            <p className="nota-vacia">Esta meta todavía no tiene hitos.</p>
          ) : (
            <ul className="hitos-meta">
              {progreso.hitos.map((hito) => (
                <li key={`${hito.descripcion}-${hito.porcentajeObjetivo}`} className={hito.alcanzado ? "hito-meta alcanzado" : "hito-meta"}>
                  <span>{hito.descripcion}</span>
                  <b>{hito.alcanzado ? `Alcanzado · ${hito.porcentajeObjetivo}%` : `Pendiente · ${hito.porcentajeObjetivo}%`}</b>
                </li>
              ))}
            </ul>
          )
        ) : (
          <Vacio
            titulo="Sin meta activa"
            texto={
              juego.estado === "completado" || juego.estado === "abandonado"
                ? "Un juego completado o abandonado no lleva una meta encendida."
                : "Fija horas y días para ver si esta semana vas cumpliendo."
            }
            accion={
              juego.estado === "jugando" || juego.estado === "pausado" ? (
                <Link to={`/videojuegos/${juego._id}/meta`} className="btn btn-primario">
                  Crear meta
                </Link>
              ) : undefined
            }
          />
        )}
        {progreso.meta && metaActivaId ? (
          <div className="acciones">
            <Link to={`/videojuegos/${juego._id}/meta/${metaActivaId}`} className="btn btn-secundario">
              Editar meta
            </Link>
            <button type="button" className="btn btn-peligro" onClick={apagarMeta}>
              Desactivar
            </button>
          </div>
        ) : null}
      </section>

      <div className="detalle-grid">
        <section className="panel" aria-labelledby="titulo-logros">
          <div className="seccion-titulo">
            <h2 id="titulo-logros">Logros</h2>
            <p>Viven dentro de la ficha. Márcalos cuando los consigas.</p>
          </div>
          {juego.logros.length === 0 ? (
            <Vacio
              titulo="Sin logros"
              texto="Edita el videojuego para agregar la lista corta de logros."
              accion={
                <Link to={`/videojuegos/${juego._id}/editar`} className="btn btn-secundario">
                  Editar ficha
                </Link>
              }
            />
          ) : (
            <ul className="logros">
              {juego.logros.map((logro) => (
                <li key={logro._id}>
                  <button
                    type="button"
                    className={logro.obtenido ? "logro obtenido" : "logro"}
                    aria-pressed={logro.obtenido}
                    disabled={logroPendiente === logro._id}
                    onClick={() => alternarLogro(logro._id, !logro.obtenido)}
                  >
                    <span className="caja" aria-hidden="true" />
                    <span>{logro.nombre}</span>
                  </button>
                </li>
              ))}
            </ul>
          )}
        </section>

        <section className="panel" aria-labelledby="titulo-partidas">
          <div className="seccion-titulo">
            <h2 id="titulo-partidas">Partidas de este juego</h2>
            <p>Cada sesión es un documento aparte, ligado por referencia.</p>
          </div>
          {partidas.length === 0 ? (
            <Vacio
              titulo="Sin sesiones"
              texto="Registra cuándo jugaste, cuánto tiempo y en qué porcentaje quedaste."
              accion={
                <Link to={`/videojuegos/${juego._id}/partidas/nueva`} className="btn btn-primario">
                  Registrar partida
                </Link>
              }
            />
          ) : (
            <ul className="sesiones">
              {partidas.map((partida) => (
                <li key={partida._id}>
                  <div>
                    <strong>{formatearFecha(partida.fecha)}</strong>
                    <span>{formatearDuracion(partida.duracionMinutos)}</span>
                  </div>
                  <b>{partida.porcentajeAvance}%</b>
                  <p>{partida.notas?.trim() ? partida.notas : "Sin notas"}</p>
                  <span className="acciones-sesion">
                    <Link to={`/videojuegos/${juego._id}/partidas/${partida._id}/editar`} className="btn btn-texto">
                      Editar
                    </Link>
                    <button type="button" className="btn btn-texto" onClick={() => quitarPartida(partida._id)}>
                      Eliminar
                    </button>
                  </span>
                </li>
              ))}
            </ul>
          )}
        </section>
      </div>
    </article>
  );
}
