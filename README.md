# Diario de Progreso Gamer

Aplicación web para que cada estudiante lleve el control de los videojuegos que posee, las partidas que juega y un resumen calculado de su progreso real.

La pregunta del Proyecto 3 es: **¿qué estoy jugando ahora, cuánto le he dedicado y qué tan avanzado voy?**

La épica E2 agrega otra: **¿estoy cumpliendo lo que me propuse esta semana y cuántos días seguidos llevo jugando?**

El modelado reutiliza el criterio del ejercicio de Pawnee (Criaturas y Avistamientos): una lista corta que siempre se lee con su dueño va embebida, y los eventos que crecen sin límite van en otra colección, referenciados. La pieza nueva es que el backend no solo guarda y lee: calcula un resumen a partir de las partidas.

## Modelo de datos

### Videojuego

Ficha general de cada juego. Los logros son subdocumentos embebidos.

| Campo | Tipo | Reglas |
| --- | --- | --- |
| `nombre` | string | obligatorio, 1–120 caracteres |
| `plataformas` | unión literal | `PC`, `PlayStation`, `Xbox`, `Switch`, `Movil` |
| `genero` | unión literal | `accion`, `rol`, `estrategia`, `puzzle`, `deportes`, `otro` |
| `estado` | unión literal | `jugando`, `pausado`, `completado`, `abandonado` |
| `logros` | `[{ nombre, obtenido }]` | embebido. `nombre` 2–80 caracteres, `obtenido` boolean |
| `createdAt`, `updatedAt` | fecha | los agrega Mongoose |

`plataformas` sigue el diagrama: es un solo valor (la plataforma en la que se está jugando), no un arreglo.

### Partida

Cada sesión de juego. Colección propia.

| Campo | Tipo | Reglas |
| --- | --- | --- |
| `videojuego` | ObjectId | obligatorio, `ref: "Videojuego"` |
| `fecha` | Date | obligatoria |
| `duracionMinutos` | number | obligatoria, mínimo 1, máximo 1440 |
| `porcentajeAvance` | number | obligatorio, de 0 a 100 |
| `notas` | string | opcional, máximo 500 caracteres |
| `createdAt`, `updatedAt` | fecha | los agrega Mongoose |

## Por qué esta estructura

| Decisión | Justificación |
| --- | --- |
| `logros` se embebe dentro de Videojuego | Se lee siempre junto con el juego, no tiene entidad propia y es una lista corta y acotada. El mismo criterio que habilidades en Criatura. |
| `Partida` se referencia, no se embebe | Puede crecer sin límite (partidas semanales durante meses) y también se consulta sola, por ejemplo todas las partidas, sin abrir la ficha. El mismo criterio que Avistamiento. |
| El resumen se calcula en el backend | La misma regla de negocio no debe repetirse en cada cliente. Vive en `videojuegos.service.ts`, igual que la validación de que el videojuego referenciado exista. |

Al eliminar un videojuego, el servicio también borra sus partidas para no dejar referencias colgando.

## Fórmula del resumen

`GET /api/videojuegos/:id/resumen` responde:

```json
{
  "totalPartidas": 3,
  "horasTotales": 4.8,
  "ultimaPartida": "2026-10-02T00:00:00.000Z",
  "porcentajeAvanceActual": 67
}
```

El cálculo está en `calcularResumen` / `obtenerResumen` (`backend/src/services/videojuegos.service.ts`):

1. Se confirma que el videojuego existe. Si el id es válido y no hay ficha, responde 404.
2. Se obtienen todas las partidas de ese videojuego.
3. `totalPartidas` = cantidad de partidas.
4. `horasTotales` = suma de `duracionMinutos` / 60, redondeada a 1 decimal.
5. La partida más reciente es la de mayor `fecha`. Si dos comparten fecha, gana la de `createdAt` más nuevo.
6. `ultimaPartida` = esa fecha, en ISO.
7. `porcentajeAvanceActual` = `porcentajeAvance` de esa misma partida.

Si no hay partidas: `totalPartidas` 0, `horasTotales` 0, `ultimaPartida` null y `porcentajeAvanceActual` null.

Ejemplo: 90 + 120 + 75 minutos = 285. 285 / 60 = 4.75, que se redondea a **4.8** horas. La sesión del 2 de octubre queda como última y su avance, 67, es el avance actual.

## API

Base local: `http://localhost:3000`

### Videojuegos

| Método | Ruta | Qué hace |
| --- | --- | --- |
| GET | `/api/videojuegos` | Lista. Filtros opcionales: `q`, `estado`, `genero`, `plataformas` |
| POST | `/api/videojuegos` | Crea. 201 |
| GET | `/api/videojuegos/:id` | Obtiene una ficha |
| PUT | `/api/videojuegos/:id` | Actualiza la ficha, logros incluidos |
| DELETE | `/api/videojuegos/:id` | Elimina la ficha y sus partidas. 204 |
| GET | `/api/videojuegos/:id/partidas` | Partidas de ese juego, con `populate` |
| GET | `/api/videojuegos/:id/resumen` | Resumen calculado |
| PATCH | `/api/videojuegos/:id/logros/:logroId` | Actualiza el subdocumento embebido. Cuerpo: `{ "obtenido": true }` |

### Partidas

| Método | Ruta | Qué hace |
| --- | --- | --- |
| GET | `/api/partidas` | Todas, con `populate("videojuego")`. Filtros opcionales: `videojuego`, `desde`, `hasta` |
| POST | `/api/partidas` | Crea. Si el videojuego no existe, 404 `referencia_inexistente` |
| DELETE | `/api/partidas/:id` | Elimina. 204 |

`GET /api/health` responde `{ "ok": true }` para comprobar que el proceso está arriba.

## Errores

El `errorHandler` distingue estos casos. Toda respuesta de error incluye `requestId`.

| Situación | HTTP | `tipo` |
| --- | --- | --- |
| El cuerpo no cumple el esquema | 400 | `validacion` |
| El id no es un ObjectId | 400 | `id_mal_formado` |
| La partida apunta a un videojuego que no existe | 404 | `referencia_inexistente` |
| El videojuego, la partida o el logro no existen | 404 | `no_encontrado` |
| Cualquier otra falla | 500 | `inesperado` |

Hay un middleware de `requestId` (cabecera `X-Request-Id`) y un logger con método, ruta, status y duración.

```powershell
# 1. Validación de esquema
curl -i -X POST http://localhost:3000/api/videojuegos -H "Content-Type: application/json" -d "{}"

# 2. Id mal formado
curl -i http://localhost:3000/api/videojuegos/no-es-id

# 3. Referencia inexistente (el id tiene forma válida, el juego no existe)
curl -i -X POST http://localhost:3000/api/partidas -H "Content-Type: application/json" -d "{\"videojuego\":\"507f1f77bcf86cd799439011\",\"fecha\":\"2026-10-19\",\"duracionMinutos\":30,\"porcentajeAvance\":10}"

# 4. Inesperado: cualquier excepción no clasificada (por ejemplo, MongoDB caído) responde 500 con tipo inesperado.
```

## Capas del backend

```
rutas → controladores → servicios → modelos
```

- `config/env.ts` lee `.env`. La cadena de MongoDB no está en el código.
- `db/conexionDB.ts` solo conecta.
- El resumen y la comprobación de la referencia viven en servicios, no en el controlador ni en React.

## Frontend

React + TypeScript + Vite. Ninguna pantalla llama `fetch`: usan `src/api/videojuegosApi.ts` y `src/api/partidasApi.ts`.

| Ruta | Pantalla |
| --- | --- |
| `/` | Lista de videojuegos, con filtro |
| `/videojuegos/nuevo` y `/videojuegos/:id/editar` | Crear o editar, logros incluidos |
| `/videojuegos/:id` | Ficha, logros, resumen calculado y partidas de ese juego |
| `/partidas` | Todas las partidas |
| `/partidas/nueva` y `/videojuegos/:id/partidas/nueva` | Nueva partida |

Cada pantalla que depende de la API muestra carga, error (con reintento) o vacío.

## Instalación local

Requisitos: Node.js 20 o superior y una base en MongoDB Atlas.

```powershell
cd backend
copy .env.example .env
# Edita MONGODB_URI y, si hace falta, CORS_ORIGIN
npm install
npm run dev
```

En otra terminal:

```powershell
cd frontend
npm install
npm run dev
```

- API: http://localhost:3000
- Web: http://localhost:5173

`npm run seed` dentro de `backend` crea el juego de ejemplo **Hades II** con 3 logros y 3 partidas (resumen esperado: 3 partidas, 4.8 horas, avance 67). Si ya existía, lo reemplaza. No borra el resto de la base.

## Variables de entorno

`backend/.env.example`

| Variable | Uso |
| --- | --- |
| `PORT` | Puerto de la API. En Render lo asigna la plataforma. |
| `MONGODB_URI` | Cadena de MongoDB Atlas. |
| `CORS_ORIGIN` | Orígenes permitidos, separados por coma. |
| `NODE_ENV` | `development` o `production`. |

`frontend/.env.example`

| Variable | Uso |
| --- | --- |
| `VITE_API_URL` | URL pública del backend, sin barra final. En local se puede omitir y el cliente usa `http://localhost:3000`. |

Vite embebe `VITE_API_URL` en el build. En Render hay que definirla antes de compilar el frontend.

## Despliegue en Render

Hay un `render.yaml` en la raíz con los dos servicios. Las credenciales se cargan en el panel de Render, nunca en el repositorio.

1. Sube el repositorio a GitHub.
2. En Render, **New → Blueprint** y selecciona el repo, o crea los dos servicios a mano:
   - **Web Service** `diario-gamer-api`, raíz `backend`, build `npm install && npm run build`, start `npm start`.
   - **Static Site** `diario-gamer-web`, raíz `frontend`, build `npm install && npm run build`, publish `dist`. Añade una rewrite de `/*` hacia `/index.html` para que React Router funcione al recargar.
3. En la API configura `MONGODB_URI` y `CORS_ORIGIN` con la URL exacta del sitio (por ejemplo `https://diario-gamer-web.onrender.com`). Puedes sumar `http://localhost:5173` separado por coma si también pruebas en local contra la API desplegada.
4. En el sitio configura `VITE_API_URL` con la URL pública de la API (por ejemplo `https://diario-gamer-api.onrender.com`) y vuelve a desplegar para que el build la tome.
5. En Atlas, permite el acceso desde Render (en un cluster de práctica suele usarse `0.0.0.0/0`).

### URLs públicas

- API: https://diario-gamer-api-sxvv.onrender.com
- Frontend: https://diario-gamer-web-4u51.onrender.com

El progreso de la semana está en `GET /api/videojuegos/:id/progreso-semanal`.

## Flujo de la demo

1. Crear un videojuego con al menos un logro.
2. Registrar tres partidas con fechas y porcentajes distintos.
3. Abrir el detalle y comprobar que el resumen muestra la suma de horas, el número de partidas, la fecha más reciente y el avance de esa partida.
4. Marcar un logro como obtenido. Eso actualiza el subdocumento embebido, sin recalcular el resumen.
5. Borrar una partida y ver que horas, total y, si era la última, el avance cambian.

La demo de E2, en no más de 6 minutos: crear una meta con hitos, registrar partidas y ver la semana y la racha, alcanzar un hito, provocar el 409 de meta duplicada, y seguir un criterio desde el PRD hasta `docs/AUDITORIA.md`.

## Meta y progreso semanal

`GET /api/videojuegos/:id/progreso-semanal` no guarda el resultado. La semana es lunes a domingo en Ecuador. Las horas, los días distintos, la racha y los hitos salen de funciones puras en `backend/src/dominio/progreso.ts`. El porcentaje puede pasar de 100. Sin meta activa, `meta` y `porcentajeHoras` vienen en `null`.

La meta es otra colección, ligada al videojuego. Los hitos van dentro de ella. `alcanzado` no se guarda: se compara con el avance actual del resumen.

## Cómo trabajamos con el agente

El harness está en la raíz: `AGENTS.md` (memoria, máximo 60 líneas), `CLAUDE.md` (apunta a ese archivo), la skill `.claude/skills/nueva-spec` y los hooks de `.claude/settings.json`. Uno bloquea cualquier edición de `.env`. El otro pasa el archivo por Prettier. La interfaz sigue `DESIGN.md`; `AGENTS.md` solo dice que hay que leerlo.

El orden en Git es el de las sesiones: diagnóstico, harness, PRD, épicas, historias y tickets, specs, y recién ahí el código. Cada spec está commiteada antes que los archivos que la implementan. Los commits de código nombran el ticket (`feat(E2): T-04 ...`).

| Documento | Dónde |
| --- | --- |
| Diagnóstico | `docs/diagnostico.md` |
| PRD y huecos | `docs/prd/diario-progreso-gamer.md` |
| Épicas | `docs/backlog/epicas.md` |
| Historias, criterios y tickets | `docs/backlog/E2-metas-y-rachas.md` |
| Specs | `docs/specs/` |
| Auditoría | `docs/AUDITORIA.md` |
| Bitácora del agente | `docs/bitacora-agente.md` |

`npm test` en `backend` ejecuta los tests de dominio, del resumen y del límite `hasta`. E2 no agrega variables de entorno.
