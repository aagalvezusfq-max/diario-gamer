import type { ReactNode } from "react";
import { Link, Outlet, useLocation } from "react-router-dom";

export function Layout() {
  const { pathname } = useLocation();
  const enVideojuegos = pathname === "/" || pathname.startsWith("/videojuegos");
  const enPartidas = pathname.startsWith("/partidas");

  return (
    <div className="app">
      <a className="saltar" href="#contenido">
        Saltar al contenido
      </a>
      <header className="barra">
        <Link to="/" className="marca">
          <span className="marca-icono" aria-hidden="true">
            <svg viewBox="0 0 24 24">
              <path fill="currentColor" d="M10 2h4v6h6v4h-6v6h-4v-6H4V8h6V2z" />
            </svg>
          </span>
          <span>
            <strong>Diario Gamer</strong>
            <small>Progreso real</small>
          </span>
        </Link>
        <nav className="nav" aria-label="Principal">
          <Link to="/" className={enVideojuegos ? "nav-link activo" : "nav-link"} aria-current={enVideojuegos ? "page" : undefined}>
            Videojuegos
          </Link>
          <Link to="/partidas" className={enPartidas ? "nav-link activo" : "nav-link"} aria-current={enPartidas ? "page" : undefined}>
            Partidas
          </Link>
        </nav>
        <Link to="/videojuegos/nuevo" className="btn btn-primario">
          Nuevo videojuego
        </Link>
      </header>
      <main id="contenido" className="contenido">
        <Outlet />
      </main>
      <footer className="pie">
        El resumen no se guarda: el servidor lo calcula cada vez a partir de las partidas.
      </footer>
    </div>
  );
}

export function Pagina({
  titulo,
  bajada,
  accion,
  children,
}: {
  titulo: string;
  bajada?: string;
  accion?: ReactNode;
  children: ReactNode;
}) {
  return (
    <section className="pagina">
      <header className="pagina-cabecera">
        <div>
          <h1>{titulo}</h1>
          {bajada ? <p className="bajada">{bajada}</p> : null}
        </div>
        {accion}
      </header>
      {children}
    </section>
  );
}
