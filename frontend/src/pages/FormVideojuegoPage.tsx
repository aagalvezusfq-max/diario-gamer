import { useEffect, useState, type FormEvent } from "react";
import { Link, useNavigate, useParams } from "react-router-dom";
import { mensajeDe } from "../api/client";
import { actualizarVideojuego, crearVideojuego, obtenerVideojuego } from "../api/videojuegosApi";
import { Cargando, ErrorEstado } from "../components/Estados";
import { Pagina } from "../components/Layout";
import { ETIQUETA_ESTADO, ETIQUETA_GENERO, ETIQUETA_PLATAFORMA } from "../domain/catalogo";
import type { DatosLogro, Estado, Genero, Plataforma } from "../types";
import { ESTADOS, GENEROS, PLATAFORMAS } from "../types";

type Carga = "cargando" | "listo" | "error";

const logroVacio = (): DatosLogro => ({ nombre: "", obtenido: false });

export function FormVideojuegoPage() {
  const { id } = useParams();
  const esEdicion = Boolean(id);
  const navigate = useNavigate();
  const [carga, setCarga] = useState<Carga>(esEdicion ? "cargando" : "listo");
  const [errorCarga, setErrorCarga] = useState("");
  const [nombre, setNombre] = useState("");
  const [plataformas, setPlataformas] = useState<Plataforma>("PC");
  const [genero, setGenero] = useState<Genero>("accion");
  const [estado, setEstado] = useState<Estado>("jugando");
  const [logros, setLogros] = useState<DatosLogro[]>([logroVacio()]);
  const [enviando, setEnviando] = useState(false);
  const [reintento, setReintento] = useState(0);
  const [error, setError] = useState("");
  const [detalles, setDetalles] = useState<string[]>([]);

  useEffect(() => {
    if (!id) {
      setNombre("");
      setPlataformas("PC");
      setGenero("accion");
      setEstado("jugando");
      setLogros([logroVacio()]);
      setCarga("listo");
      setError("");
      setDetalles([]);
      return;
    }
    let vigente = true;
    setCarga("cargando");
    obtenerVideojuego(id)
      .then((juego) => {
        if (!vigente) return;
        setNombre(juego.nombre);
        setPlataformas(juego.plataformas);
        setGenero(juego.genero);
        setEstado(juego.estado);
        setLogros(juego.logros.length > 0 ? juego.logros.map((logro) => ({ ...logro })) : [logroVacio()]);
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
  }, [id, reintento]);

  function actualizarCampoLogro(indice: number, cambio: Partial<DatosLogro>) {
    setLogros((actuales) => actuales.map((logro, i) => (i === indice ? { ...logro, ...cambio } : logro)));
  }

  async function enviar(event: FormEvent) {
    event.preventDefault();
    setError("");
    setDetalles([]);
    setEnviando(true);

    const payload = {
      nombre: nombre.trim(),
      plataformas,
      genero,
      estado,
      logros: logros
        .map((logro) => ({ ...logro, nombre: logro.nombre.trim() }))
        .filter((logro) => logro.nombre.length > 0)
        .map((logro) => ({
          ...(logro._id ? { _id: logro._id } : {}),
          nombre: logro.nombre,
          obtenido: logro.obtenido,
        })),
    };

    try {
      const guardado = esEdicion && id ? await actualizarVideojuego(id, payload) : await crearVideojuego(payload);
      navigate(`/videojuegos/${guardado._id}`);
    } catch (err: unknown) {
      const info = mensajeDe(err);
      setError(info.mensaje);
      setDetalles(info.detalles ?? []);
      setEnviando(false);
    }
  }

  if (carga === "cargando") return <Cargando texto="Cargando la ficha…" />;
  if (carga === "error") return <ErrorEstado mensaje={errorCarga} onReintentar={() => setReintento((valor) => valor + 1)} />;

  return (
    <Pagina
      titulo={esEdicion ? "Editar videojuego" : "Nuevo videojuego"}
      bajada="La ficha guarda los datos generales y la lista corta de logros, embebida en el mismo documento."
    >
      <form className="formulario" onSubmit={enviar}>
        <div className="campo">
          <label htmlFor="nombre">Nombre</label>
          <input id="nombre" value={nombre} onChange={(event) => setNombre(event.target.value)} required maxLength={120} />
        </div>
        <div className="formulario-grid">
          <div className="campo">
            <label htmlFor="plataformas">Plataforma</label>
            <select
              id="plataformas"
              value={plataformas}
              onChange={(event) => setPlataformas(event.target.value as Plataforma)}
            >
              {PLATAFORMAS.map((item) => (
                <option key={item} value={item}>
                  {ETIQUETA_PLATAFORMA[item]}
                </option>
              ))}
            </select>
          </div>
          <div className="campo">
            <label htmlFor="genero">Género</label>
            <select id="genero" value={genero} onChange={(event) => setGenero(event.target.value as Genero)}>
              {GENEROS.map((item) => (
                <option key={item} value={item}>
                  {ETIQUETA_GENERO[item]}
                </option>
              ))}
            </select>
          </div>
          <div className="campo">
            <label htmlFor="estado-juego">Estado</label>
            <select id="estado-juego" value={estado} onChange={(event) => setEstado(event.target.value as Estado)}>
              {ESTADOS.map((item) => (
                <option key={item} value={item}>
                  {ETIQUETA_ESTADO[item]}
                </option>
              ))}
            </select>
          </div>
        </div>

        <fieldset className="logros-editor">
          <legend>Logros</legend>
          <p className="ayuda">Una lista corta que siempre se lee con el juego. Deja la fila vacía si no aplica.</p>
          {logros.map((logro, indice) => (
            <div className="logro-fila" key={logro._id ?? `nuevo-${indice}`}>
              <input
                aria-label={`Nombre del logro ${indice + 1}`}
                value={logro.nombre}
                maxLength={80}
                placeholder="Nombre del logro"
                onChange={(event) => actualizarCampoLogro(indice, { nombre: event.target.value })}
              />
              <label className="check">
                <input
                  type="checkbox"
                  checked={logro.obtenido}
                  onChange={(event) => actualizarCampoLogro(indice, { obtenido: event.target.checked })}
                />
                Obtenido
              </label>
              <button
                type="button"
                className="btn btn-texto"
                onClick={() => setLogros((actuales) => actuales.filter((_, i) => i !== indice))}
              >
                Quitar
              </button>
            </div>
          ))}
          <button type="button" className="btn btn-secundario" onClick={() => setLogros((actuales) => [...actuales, logroVacio()])}>
            Agregar logro
          </button>
        </fieldset>

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
            {enviando ? "Guardando…" : esEdicion ? "Guardar cambios" : "Crear videojuego"}
          </button>
          <Link to={id ? `/videojuegos/${id}` : "/"} className="btn btn-texto">
            Cancelar
          </Link>
        </div>
      </form>
    </Pagina>
  );
}
