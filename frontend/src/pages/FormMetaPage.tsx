import { useEffect, useState, type FormEvent } from "react";
import { Link, useNavigate, useParams } from "react-router-dom";
import { mensajeDe } from "../api/client";
import { actualizarMeta, crearMeta, desactivarMeta, obtenerMeta } from "../api/metasApi";
import { obtenerVideojuego } from "../api/videojuegosApi";
import { Cargando, ErrorEstado } from "../components/Estados";
import { Pagina } from "../components/Layout";
import type { HitoMeta } from "../types";

type Carga = "cargando" | "listo" | "error";

const hitoVacio = (): HitoMeta => ({ descripcion: "", porcentajeObjetivo: 50 });

export function FormMetaPage() {
  const { id = "", metaId } = useParams();
  const esEdicion = Boolean(metaId);
  const navigate = useNavigate();
  const [carga, setCarga] = useState<Carga>("cargando");
  const [errorCarga, setErrorCarga] = useState("");
  const [nombreJuego, setNombreJuego] = useState("");
  const [horas, setHoras] = useState("5");
  const [dias, setDias] = useState("4");
  const [hitos, setHitos] = useState<HitoMeta[]>([hitoVacio()]);
  const [enviando, setEnviando] = useState(false);
  const [error, setError] = useState("");
  const [detalles, setDetalles] = useState<string[]>([]);
  const [reintento, setReintento] = useState(0);

  useEffect(() => {
    let vigente = true;
    setCarga("cargando");
    Promise.all([obtenerVideojuego(id), metaId ? obtenerMeta(metaId) : Promise.resolve(null)])
      .then(([juego, meta]) => {
        if (!vigente) return;
        setNombreJuego(juego.nombre);
        if (meta) {
          setHoras(String(meta.horasSemanales));
          setDias(String(meta.diasPorSemana));
          setHitos(meta.hitos.length > 0 ? meta.hitos : [hitoVacio()]);
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
  }, [id, metaId, reintento]);

  function cambiarHito(indice: number, cambio: Partial<HitoMeta>) {
    setHitos((actuales) => actuales.map((hito, i) => (i === indice ? { ...hito, ...cambio } : hito)));
  }

  async function enviar(event: FormEvent) {
    event.preventDefault();
    setError("");
    setDetalles([]);
    const horasSemanales = Number(horas);
    const diasPorSemana = Number(dias);
    if (!(horasSemanales > 0) || horasSemanales > 100) {
      setError("Las horas por semana tienen que ser mayores que 0 y como máximo 100.");
      return;
    }
    if (!Number.isInteger(diasPorSemana) || diasPorSemana < 1 || diasPorSemana > 7) {
      setError("Los días por semana tienen que ser un entero entre 1 y 7.");
      return;
    }

    const hitosLimpios = hitos
      .map((hito) => ({ ...hito, descripcion: hito.descripcion.trim() }))
      .filter((hito) => hito.descripcion.length > 0)
      .map((hito) => ({
        ...(hito._id ? { _id: hito._id } : {}),
        descripcion: hito.descripcion,
        porcentajeObjetivo: Number(hito.porcentajeObjetivo),
      }));

    setEnviando(true);
    try {
      const datos = { videojuego: id, horasSemanales, diasPorSemana, hitos: hitosLimpios };
      if (esEdicion && metaId) await actualizarMeta(metaId, datos);
      else await crearMeta(datos);
      navigate(`/videojuegos/${id}`);
    } catch (err: unknown) {
      const info = mensajeDe(err);
      setError(info.mensaje);
      setDetalles(info.detalles ?? []);
      setEnviando(false);
    }
  }

  async function apagar() {
    if (!metaId) return;
    if (!window.confirm("¿Apagar esta meta? La semana dejará de medirse contra ella.")) return;
    setEnviando(true);
    try {
      await desactivarMeta(metaId);
      navigate(`/videojuegos/${id}`);
    } catch (err: unknown) {
      setError(mensajeDe(err).mensaje);
      setEnviando(false);
    }
  }

  if (carga === "cargando") return <Cargando texto="Abriendo la meta…" />;
  if (carga === "error") return <ErrorEstado mensaje={errorCarga} onReintentar={() => setReintento((valor) => valor + 1)} />;

  return (
    <Pagina
      titulo={esEdicion ? "Editar meta" : "Nueva meta"}
      bajada={`${nombreJuego}. Horas y días que quieres jugar esta semana, más una lista corta de hitos.`}
    >
      <form className="formulario" onSubmit={enviar}>
        <div className="formulario-grid">
          <div className="campo">
            <label htmlFor="horas">Horas por semana</label>
            <input id="horas" type="number" min={0.5} max={100} step={0.5} value={horas} onChange={(event) => setHoras(event.target.value)} required />
          </div>
          <div className="campo">
            <label htmlFor="dias">Días por semana</label>
            <input id="dias" type="number" min={1} max={7} step={1} value={dias} onChange={(event) => setDias(event.target.value)} required />
          </div>
        </div>
        <fieldset className="logros-editor">
          <legend>Hitos</legend>
          <p className="ayuda">Como máximo 5. Se marcan solos cuando el avance actual llega al porcentaje.</p>
          {hitos.map((hito, indice) => (
            <div className="logro-fila" key={hito._id ?? `hito-${indice}`}>
              <input
                aria-label={`Descripción del hito ${indice + 1}`}
                value={hito.descripcion}
                maxLength={80}
                placeholder="Llegar al 50 %"
                onChange={(event) => cambiarHito(indice, { descripcion: event.target.value })}
              />
              <input
                aria-label={`Porcentaje del hito ${indice + 1}`}
                type="number"
                min={1}
                max={100}
                value={hito.porcentajeObjetivo}
                onChange={(event) => cambiarHito(indice, { porcentajeObjetivo: Number(event.target.value) })}
              />
              <button type="button" className="btn btn-texto" onClick={() => setHitos((actuales) => actuales.filter((_, i) => i !== indice))}>
                Quitar
              </button>
            </div>
          ))}
          <button
            type="button"
            className="btn btn-secundario"
            disabled={hitos.length >= 5}
            onClick={() => setHitos((actuales) => [...actuales, hitoVacio()])}
          >
            Agregar hito
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
            {enviando ? "Guardando…" : "Guardar meta"}
          </button>
          {esEdicion ? (
            <button type="button" className="btn btn-peligro" onClick={apagar} disabled={enviando}>
              Desactivar
            </button>
          ) : null}
          <Link to={`/videojuegos/${id}`} className="btn btn-texto">
            Cancelar
          </Link>
        </div>
      </form>
    </Pagina>
  );
}
