# Spec · Meta y progreso semanal

Tickets: T-01, T-02, T-03, T-04, T-05, T-08, T-09, T-10.

## Decisiones que esta spec obedece

- La meta se referencia al videojuego. Tiene vida propia: se crea, se reemplaza y se desactiva sin reescribir la ficha, y las metas apagadas quedan como historial.
- Los hitos van embebidos. Son como máximo 5 y solo significan algo dentro de su meta.
- «Alcanzado» no se guarda. Sale de comparar `porcentajeAvanceActual` del resumen ya existente con `porcentajeObjetivo`.
- El día de una partida es su fecha civil (año-mes-día de `fecha` en UTC, que es lo que guarda el formulario). No se convierte a hora de Ecuador, porque medianoche UTC caería en el día anterior.
- «Hoy» y el lunes-domingo de la semana sí se calculan en `America/Guayaquil`.
- El porcentaje de horas no tiene tope.
- La racha actual sigue viva si el último día jugado es hoy o ayer en ese calendario. Si es anterior, vale 0.
- La semana consultada usa la meta activa de ahora, no la que estaba activa cuando se jugó.

## DEBE

- DEBE existir el modelo Meta con `videojuego` (ObjectId, ref Videojuego, obligatorio), `horasSemanales` (número > 0 y ≤ 100), `diasPorSemana` (entero de 1 a 7), `activa` (boolean, por defecto true), `hitos` (máximo 5 de `{ descripcion, porcentajeObjetivo }` con objetivo entre 1 y 100) y timestamps.
- DEBE haber una sola meta activa por videojuego.
- DEBE poder crear, obtener por id, listar las de un videojuego, actualizar y desactivar (`activa: false`).
- DEBE responder 404 si el videojuego de una meta nueva no existe, y 400 si el id no es un ObjectId.
- DEBE responder 409 si se intenta una segunda meta activa, o si el videojuego está completado o abandonado.
- DEBE exponer `GET /api/videojuegos/:id/progreso-semanal` con `semana.inicio`, `semana.fin`, `meta`, `horasSemana`, `porcentajeHoras`, `diasJugadosSemana`, `rachaActual`, `mejorRacha` y `hitos[].alcanzado`.
- DEBE calcular semana, días, rachas e hitos en funciones puras de `backend/src/dominio/progreso.ts`. El servicio solo lee y delega.
- DEBE redondear `horasSemana` a un decimal y `porcentajeHoras` al entero más cercano.
- DEBE dejar `meta` y `porcentajeHoras` en `null` si no hay meta activa, y aun así devolver horas, días y rachas. `hitos` queda vacío.
- DEBE devolver ceros y ningún hito alcanzado si no hay partidas.
- DEBE borrar las metas al borrar el videojuego.
- DEBE apagar la meta activa si el videojuego pasa a completado o abandonado.
- DEBE permitir editar una partida (T-08) y tratar `hasta=YYYY-MM-DD` como el final de ese día civil (T-10).
- DEBE cubrir `calcularResumen` con tests (T-09).

## NO DEBE

- NO DEBE guardar el booleano `alcanzado` en la base.
- NO DEBE embeber la meta dentro de Videojuego.
- NO DEBE calcular la semana dentro del controlador ni del frontend.
- NO DEBE recortar el porcentaje a 100.
- NO DEBE contar dos partidas del mismo día civil como dos días.
- NO DEBE romper la racha el mismo día en que todavía se puede jugar, si ayer hubo partida.
- NO DEBE dejar metas después de borrar el videojuego.

## Criterio → verificación

| Criterio | Verificación |
| --- | --- |
| C1 Semana lunes a domingo según el hoy de Ecuador | Test puro: un miércoles de noviembre de 2026 da inicio lunes y fin domingo |
| C2 Horas de la semana a un decimal | Test puro: 90 + 120 minutos en la semana → 3,5 |
| C3 Porcentaje sin tope | Test puro: 7 h contra meta de 5 → 140 |
| C4 Un día, varias partidas | Test puro: dos partidas el mismo día → `diasJugadosSemana` 1 |
| C5 Racha viva si el último día es ayer | Test puro: última partida ayer, hoy sin partida → racha > 0 |
| C6 Racha rota si el último día es anterior a ayer | Test puro: última partida hace dos días o más → `rachaActual` 0 y `mejorRacha` conserva el tramo |
| C7 Mejor racha de todo el historial | Test puro: una seguidilla de 4 y otra de 2, con un hueco → mejor 4 |
| C8 El día es la fecha civil, no la hora de Ecuador | Test puro: `2026-11-02T00:00:00.000Z` cuenta como 2026-11-02 |
| C9 Hito alcanzado con el avance actual | Test puro: avance 67 y objetivo 50 → alcanzado |
| C10 El hito no queda pegado | Test puro: el mismo hito con avance 40 → no alcanzado |
| C11 Sin meta activa | Test puro: `meta` null, `porcentajeHoras` null, horas y racha calculadas, hitos `[]` |
| C12 Sin partidas | Test puro: horas 0, días 0, rachas 0, hitos no alcanzados |
| C13 Videojuego inexistente | Prueba manual o de ruta: progreso y alta de meta → 404 |
| C14 Id mal formado | `GET .../progreso-semanal/no-es-id` → 400 `id_mal_formado` |
| C15 Segunda meta activa | Alta duplicada → 409 y mensaje que pide desactivar la anterior |
| C16 Juego completado o abandonado | Alta de meta activa → 409 |
| C17 Borrar el juego borra la meta | El servicio de borrado llama a borrar metas; se revisa en código y en la prueba manual |
| C18 Validación del esquema | Alta con 0 horas, 8 días o 6 hitos → 400 |
| C19 La semana usa la meta activa de ahora | El servicio lee solo `activa: true`; un test puro recibe esa meta y no una anterior |
| C20 Editar partida | `PUT /api/partidas/:id` actualiza fecha, duración y avance |
| C21 `hasta` incluye el día | Test puro: `2026-11-02` termina en `23:59:59.999` UTC |
| C22 Resumen del Proyecto 3 | Tests de 285 minutos → 4,8 h, avance de la más reciente, y vacío |

## Ticket → archivos

| Ticket | Archivos |
| --- | --- |
| T-01 | `backend/src/dominio/progreso.ts`, `backend/src/dominio/progreso.test.ts` |
| T-02 | `backend/src/models/Meta.ts` |
| T-03 | `backend/src/services/metas.service.ts`, `backend/src/controllers/metas.controller.ts`, `backend/src/routes/metas.routes.ts`, `backend/src/app.ts`, `backend/src/errors/AppError.ts` |
| T-04 | `backend/src/services/progreso.service.ts`, `backend/src/controllers/videojuegos.controller.ts`, `backend/src/routes/videojuegos.routes.ts` |
| T-05 | `backend/src/services/videojuegos.service.ts`, `backend/src/services/metas.service.ts` |
| T-08 | `backend/src/services/partidas.service.ts`, `backend/src/controllers/partidas.controller.ts`, `backend/src/routes/partidas.routes.ts` |
| T-09 | `backend/src/services/videojuegos.resumen.test.ts` |
| T-10 | `backend/src/dominio/fechas.ts`, `backend/src/dominio/fechas.test.ts`, `backend/src/services/partidas.service.ts` |
