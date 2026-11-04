# Diagnóstico del Proyecto 3

Fecha: 4 de noviembre de 2026. Rama de partida: `main`. El agente leyó el backend, el frontend, el README y el historial. No hay carpeta de pruebas.

## Estado

El Diario de Progreso Gamer del Proyecto 3 está implementado en local y responde la pregunta original.

- Videojuego guarda la ficha y los logros embebidos. Partida es una colección referenciada.
- El resumen (`totalPartidas`, `horasTotales`, `ultimaPartida`, `porcentajeAvanceActual`) se calcula en `videojuegos.service.ts`, no en el controlador ni en React.
- Hay CRUD de videojuegos, listado con filtro, partidas con `populate`, alta con validación de referencia, baja, ruta anidada y marcado de un logro.
- El frontend tiene las cinco pantallas, servicios de API separados y estados de carga, error y vacío. El detalle muestra el resumen.
- Al borrar un videojuego se borran sus partidas.
- Los errores de validación, id mal formado, referencia inexistente y fallo inesperado pasan por `errorHandler`.

Lo que no está: tests automatizados, edición de una partida, despliegue con URLs públicas y remoto en GitHub. `backend/.env` no está en el repositorio, que es lo correcto. Tampoco está en esta máquina, así que la API no arranca contra Atlas desde aquí.

## Problemas

| Problema | Impacto | Decisión |
| --- | --- | --- |
| `calcularResumen` no tiene tests | Un cambio en horas o en el desempate de la última partida no se nota | Bloquea. Se paga con criterio, test y verificación |
| No se puede editar una partida | La épica E2 pide volver a consultar el progreso al editar una sesión | Bloquea. Se agrega la actualización y el detalle la vuelve a pedir |
| `hasta` en el listado de partidas corta el día a medianoche UTC | Una partida de ese mismo día, si trae hora, puede quedar fuera | Bloquea. Se paga con una función pura y su test |
| No hay 409 en el catálogo de errores | E2 debe rechazar una segunda meta activa | Se resuelve dentro de E2, no es deuda vieja |
| La fecha de la partida es medianoche UTC | Pasarla a hora de Ecuador la corre un día atrás | Se documenta como regla de E2: el día es la fecha civil guardada |
| Sin URLs de Render | El entregable de despliegue sigue pendiente | Se difiere a la fase de publicación. No bloquea el cálculo |
| Sin remoto de GitHub | El pull request no se puede abrir desde aquí | Se difiere a la fase final, cuando haya sesión de `gh` |
| Las partidas no se paginan | Meses de sesiones alargan la lista | Se difiere. E2 no lo pide y el cálculo usa la consulta del servidor |
| `ObjectId.isValid` acepta algunas cadenas de 12 caracteres | Un id raro podría pasar el primer filtro | Se difiere. Mongoose igual rechaza el casteo inválido |
| La semilla solo rehace «Hades II» | No limpia el resto de la base | Se difiere. Es una herramienta de demo, no la regla de negocio |

## Qué no se toca

El modelo de Videojuego y de Partida, la fórmula del resumen y las capas (ruta, controlador, servicio, modelo, middlewares) se quedan. Solo se abren para los dos arreglos de la tabla que bloquean y para enganchar el borrado de metas.
