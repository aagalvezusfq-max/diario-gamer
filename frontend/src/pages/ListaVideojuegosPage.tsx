import { useEffect, useState, type FormEvent } from "react";
import { Link, useSearchParams } from "react-router-dom";
import { mensajeDe } from "../api/client";
import { listarVideojuegos } from "../api/videojuegosApi";
import { BadgeEstado } from "../components/BadgeEstado";
import { Cargando, ErrorEstado, Vacio } from "../components/Estados";
import { Pagina } from "../components/Layout";
import { ETIQUETA_ESTADO, ETIQUETA_GENERO, ETIQUETA_PLATAFORMA } from "../domain/catalogo";
import type { FiltroVideojuegos, Videojuego } from "../types";
import { ESTADOS, GENEROS, PLATAFORMAS } from "../types";

type Carga = "cargando" | "listo" | "error";

function filtroDesde(params: URLSearchParams): FiltroVideojuegos {
  return {
    q: params.get("q") ?? "",
    estado: params.get("estado") ?? "",
    genero: params.get("genero") ?? "",
    plataformas: params.get("plataformas") ?? "",
  };
}

export function ListaVideojuegosPage() {
  const [params, setParams] = useSearchParams();
  const [borrador, setBorrador] = useState<FiltroVideojuegos>(() => filtroDesde(params));
  const [juegos, setJuegos] = useState<Videojuego[]>([]);
  const [carga, setCarga] = useState<Carga>("cargando");
  const [error, setError] = useState("");
  const [reintento, setReintento] = useState(0);
  const consulta = params.toString();

  useEffect(() => {
    setBorrador(filtroDesde(params));
  }, [params]);

  useEffect(() => {
    const filtro = filtroDesde(new URLSearchParams(consulta));
    let vigente = true;
    setCarga("cargando");

    listarVideojuegos({
      q: filtro.q || undefined,
      estado: filtro.estado || undefined,
      genero: filtro.genero || undefined,
      plataformas: filtro.plataformas || undefined,
    })
      .then((datos) => {
        if (!vigente) return;
        setJuegos(datos);
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
  }, [consulta, reintento]);

  function aplicar(event: FormEvent) {
    event.preventDefault();
    const siguientes = new URLSearchParams();
    if (borrador.q?.trim()) siguientes.set("q", borrador.q.trim());
    if (borrador.estado) siguientes.set("estado", borrador.estado);
    if (borrador.genero) siguientes.set("genero", borrador.genero);
    if (borrador.plataformas) siguientes.set("plataformas", borrador.plataformas);
    setParams(siguientes);
  }

  function limpiar() {
    setBorrador({ q: "", estado: "", genero: "", plataformas: "" });
    setParams(new URLSearchParams());
  }

  const hayFiltro = consulta.length > 0;

  return (
    <Pagina
      titulo="¿Qué estás jugando ahora?"
      bajada="Cada ficha guarda el juego y sus logros. Las horas y el avance se calculan desde las partidas."
      accion={
        <Link to="/videojuegos/nuevo" className="btn btn-primario">
          Registrar juego
        </Link>
      }
    >
      <form className="filtros" onSubmit={aplicar}>
        <div className="campo">
          <label htmlFor="q">Nombre</label>
          <input
            id="q"
            value={borrador.q ?? ""}
            onChange={(event) => setBorrador({ ...borrador, q: event.target.value })}
            placeholder="Buscar por nombre"
          />
        </div>
        <div className="campo">
          <label htmlFor="estado">Estado</label>
          <select
            id="estado"
            value={borrador.estado ?? ""}
            onChange={(event) => setBorrador({ ...borrador, estado: event.target.value })}
          >
            <option value="">Todos</option>
            {ESTADOS.map((estado) => (
              <option key={estado} value={estado}>
                {ETIQUETA_ESTADO[estado]}
              </option>
            ))}
          </select>
        </div>
        <div className="campo">
          <label htmlFor="genero">Género</label>
          <select
            id="genero"
            value={borrador.genero ?? ""}
            onChange={(event) => setBorrador({ ...borrador, genero: event.target.value })}
          >
            <option value="">Todos</option>
            {GENEROS.map((genero) => (
              <option key={genero} value={genero}>
                {ETIQUETA_GENERO[genero]}
              </option>
            ))}
          </select>
        </div>
        <div className="campo">
          <label htmlFor="plataforma">Plataforma</label>
          <select
            id="plataforma"
            value={borrador.plataformas ?? ""}
            onChange={(event) => setBorrador({ ...borrador, plataformas: event.target.value })}
          >
            <option value="">Todas</option>
            {PLATAFORMAS.map((plataforma) => (
              <option key={plataforma} value={plataforma}>
                {ETIQUETA_PLATAFORMA[plataforma]}
              </option>
            ))}
          </select>
        </div>
        <div className="filtros-acciones">
          <button type="submit" className="btn btn-secundario">
            Filtrar
          </button>
          {hayFiltro ? (
            <button type="button" className="btn btn-texto" onClick={limpiar}>
              Limpiar
            </button>
          ) : null}
        </div>
      </form>

      {carga === "cargando" ? <Cargando texto="Buscando videojuegos…" /> : null}
      {carga === "error" ? <ErrorEstado mensaje={error} onReintentar={() => setReintento((valor) => valor + 1)} /> : null}
      {carga === "listo" && juegos.length === 0 ? (
        <Vacio
          titulo={hayFiltro ? "Nada coincide con ese filtro" : "Todavía no hay videojuegos"}
          texto={
            hayFiltro
              ? "Prueba con otro nombre, estado o plataforma."
              : "Registra el primer juego para empezar el diario."
          }
          accion={
            hayFiltro ? (
              <button type="button" className="btn btn-secundario" onClick={limpiar}>
                Ver todos
              </button>
            ) : (
              <Link to="/videojuegos/nuevo" className="btn btn-primario">
                Crear videojuego
              </Link>
            )
          }
        />
      ) : null}
      {carga === "listo" && juegos.length > 0 ? (
        <>
          <p className="conteo">
            {juegos.length} {juegos.length === 1 ? "videojuego" : "videojuegos"}
          </p>
          <ul className="rejilla">
            {juegos.map((juego) => (
              <li key={juego._id}>
                <Link to={`/videojuegos/${juego._id}`} className="tarjeta">
                  <p className="ceja">
                    {ETIQUETA_GENERO[juego.genero]} · {ETIQUETA_PLATAFORMA[juego.plataformas]}
                  </p>
                  <h2>{juego.nombre}</h2>
                  <div className="tarjeta-pie">
                    <BadgeEstado estado={juego.estado} />
                    <span>
                      {juego.logros.length} {juego.logros.length === 1 ? "logro" : "logros"}
                    </span>
                  </div>
                </Link>
              </li>
            ))}
          </ul>
        </>
      ) : null}
    </Pagina>
  );
}
