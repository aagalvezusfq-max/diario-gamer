# Auditoría E2

Fecha: 4 de noviembre de 2026. `npm test` en `backend`: 16 tests, 3 archivos, todos pasando. Las filas de API se comprobaron contra un Mongo de prueba local, no contra Atlas: en esta máquina no hay `backend/.env`.

| Criterio | Cómo se verificó | Resultado | Evidencia |
| --- | --- | --- | --- |
| C1 Semana lunes a domingo | Test puro y respuesta real | Cumple | Test «arma la semana…». La API, con hoy 2026-11-04, respondió inicio `2026-11-02` y fin `2026-11-08` |
| C2 Horas a un decimal | Test y API | Cumple | 210 minutos en la semana → `horasSemana` 3,5 |
| C3 Porcentaje sin tope | Test puro | Cumple | 7 h contra meta de 5 → 140 |
| C4 Varias partidas, un día | Test puro | Cumple | `diasJugadosSemana` 2 con dos partidas el 2 nov y una el 4 |
| C5 Racha viva si ayer hubo partida | Test puro | Cumple | Último día 2026-11-03 y hoy 2026-11-04 → racha 2 |
| C6 Racha rota y mejor se conserva | Test y API | Cumple | API: última partida el 2 nov, hoy 4 nov → `rachaActual` 0, `mejorRacha` 4 |
| C7 Mejor racha del historial | Test puro | Cumple | Seguidilla de 4 y un día suelto → mejor 4 |
| C8 Fecha civil, no hora de Ecuador | Test puro | Cumple | `2026-11-02T00:00:00.000Z` cuenta como 2026-11-02 |
| C9 Hito según el avance actual | Test y API | Cumple | Avance 67 → hitos 25 y 50 alcanzados |
| C10 El hito no queda pegado | Test y API | Cumple | Tras editar la partida a 40 %, el hito de 50 % pasa a `alcanzado: false` y el de 25 % sigue |
| C11 Sin meta activa | Test y API | Cumple | Antes de crear la meta: `meta` null, `porcentajeHoras` null, horas 0 |
| C12 Sin partidas | Test y API | Cumple | Mismos ceros y ningún hito alcanzado |
| C13 Videojuego inexistente | Petición | Cumple | `GET /api/videojuegos/507f1f77bcf86cd799439011/progreso-semanal` → 404 |
| C14 Id mal formado | Petición | Cumple | `GET .../progreso-semanal/no-es-id` → 400 `id_mal_formado` |
| C15 Segunda meta activa | Petición | Cumple | Segundo `POST /api/metas` → 409 `conflicto` y pide desactivar la anterior |
| C16 Juego completado | Petición | Cumple | Meta sobre un juego `completado` → 409 |
| C17 Borrar el juego borra la meta | Petición | Cumple | Después de `DELETE` del videojuego, `GET /api/metas/:id` → 404 |
| C18 Validación del esquema | Petición | Cumple | Juego sin meta, 0 horas, 8 días y 6 hitos → 400 |
| C19 Usa la meta activa | Código y respuesta | Cumple | El servicio lee `activa: true`. La respuesta trajo 5 horas y 4 días, que es la meta encendida |
| C20 Editar partida | Petición | Cumple | `PUT /api/partidas/:id` dejó el avance en 40 |
| C21 `hasta` incluye el día | Test puro | Cumple | `limiteHasta("2026-11-02")` → `2026-11-02T23:59:59.999Z` |
| C22 Resumen del Proyecto 3 | Tests | Cumple | 285 minutos → 4,8 h y avance 67; lista vacía en ceros |
| F1 Sección en el detalle | Revisión del JSX | Cumple | `DetalleVideojuegoPage` renderiza «Esta semana» |
| F2 Barra, días, rachas e hitos | Revisión del JSX | Cumple | Usa `horasSemana`, `porcentajeHoras`, días, `rachaActual`, `mejorRacha` y la lista de hitos que devuelve la API |
| F3 Sin meta invita a crear | Revisión del JSX | Cumple | Estado vacío con enlace a `/meta`, salvo juego completado o abandonado |
| F4 Formulario | Revisión de `FormMetaPage` | Cumple | Alta y edición de horas, días y hasta 5 hitos |
| F5 Confirmación al desactivar | Revisión | Cumple | `window.confirm` en el detalle y en el formulario |
| F6 Servicio aparte | Revisión | Cumple | `metasApi.ts` es el único que llama a `/api/metas`. Las páginas no importan `fetch` |
| F7 Carga, error y vacío | Revisión | Cumple | La ficha y el formulario usan `Cargando`, `ErrorEstado` y `Vacio` |
| F8 El progreso se refresca | Revisión | Cumple | Borrar una partida vuelve a pedir el progreso. Crear o editar navega al detalle, que lo pide de nuevo |
| F9 Tokens de DESIGN.md | Revisión de CSS | Cumple | Las reglas nuevas usan `var(--bg)`, `var(--line)`, `var(--mint)`, `var(--faint)` y `var(--sans)`. No hay librería de UI |

## Revisión de diseño

La sección usa el panel, la serif de las cifras y la barra ámbar–menta que ya tenía el resumen. El porcentaje real se lee al lado; la barra no pasa del 100 % de ancho. Desactivar no depende solo del color: hay texto y confirmación. El tono sigue en segunda persona y sin exclamaciones.
