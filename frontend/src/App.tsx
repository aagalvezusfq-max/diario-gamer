import { Link, Route, Routes } from "react-router-dom";
import { Layout } from "./components/Layout";
import { DetalleVideojuegoPage } from "./pages/DetalleVideojuegoPage";
import { FormPartidaPage } from "./pages/FormPartidaPage";
import { FormVideojuegoPage } from "./pages/FormVideojuegoPage";
import { ListaPartidasPage } from "./pages/ListaPartidasPage";
import { ListaVideojuegosPage } from "./pages/ListaVideojuegosPage";

function NoEncontrada() {
  return (
    <div className="estado">
      <h1>Esa página no está en el diario</h1>
      <p>Vuelve a la lista de videojuegos.</p>
      <Link to="/" className="btn btn-primario">
        Ir al inicio
      </Link>
    </div>
  );
}

export function App() {
  return (
    <Routes>
      <Route element={<Layout />}>
        <Route path="/" element={<ListaVideojuegosPage />} />
        <Route path="/videojuegos/nuevo" element={<FormVideojuegoPage />} />
        <Route path="/videojuegos/:id" element={<DetalleVideojuegoPage />} />
        <Route path="/videojuegos/:id/editar" element={<FormVideojuegoPage />} />
        <Route path="/videojuegos/:id/partidas/nueva" element={<FormPartidaPage />} />
        <Route path="/partidas" element={<ListaPartidasPage />} />
        <Route path="/partidas/nueva" element={<FormPartidaPage />} />
        <Route path="*" element={<NoEncontrada />} />
      </Route>
    </Routes>
  );
}
