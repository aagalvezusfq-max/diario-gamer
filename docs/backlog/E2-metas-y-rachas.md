# E2 · Metas y rachas

## Historias

### H1 · Proponerme una semana

Como persona que lleva el diario, quiero fijar cuántas horas y cuántos días a la semana voy a jugar un videojuego, para saber si estoy cumpliendo lo que me propuse.

- Independiente: se entiende sin la racha.
- Negociable: los hitos pueden ir vacíos.
- Valiosa: es la pregunta nueva de la épica.
- Estimable: un formulario y una meta por juego.
- Pequeña: no incluye el histórico del mes.
- Comprobable: los criterios de abajo.

Criterios:

- DADO un videojuego que sigo jugando, CUANDO fijo 5 horas y 4 días, ENTONCES esa pasa a ser mi meta de la semana.
- DADO que ya tengo una meta encendida, CUANDO intento encender otra para el mismo juego, ENTONCES el diario me lo impide y me dice que primero apague la anterior.
- DADO un videojuego completado o abandonado, CUANDO intento ponerle una meta activa, ENTONCES no queda activa.

### H2 · Ver si la semana va bien

Como persona que lleva el diario, quiero ver en el juego cuántas horas llevo esta semana frente a mi meta, para darme cuenta a tiempo si me estoy quedando corto.

Criterios:

- DADO una meta de 5 horas y partidas de esta semana que suman 3,5 horas, CUANDO abro el detalle, ENTONCES veo 3,5 horas y un 70 %.
- DADO que jugué 7 horas con una meta de 5, CUANDO miro el porcentaje, ENTONCES veo 140 y la barra llena, no un 100 recortado.
- DADO que no tengo meta activa, CUANDO abro el detalle, ENTONCES veo las horas y los días de la semana, sin porcentaje, y una invitación a crear la meta.
- DADO que cambié la meta a mitad de semana, CUANDO miro el porcentaje, ENTONCES se calcula con la meta que quedó encendida.

### H3 · Ver si soy constante

Como persona que lleva el diario, quiero ver cuántos días distintos jugué esta semana y cuántos días seguidos llevo, para no confundir un sábado largo con una semana constante.

Criterios:

- DADO dos partidas el mismo día, CUANDO miro los días jugados, ENTONCES ese día cuenta una sola vez.
- DADO que jugué ayer y hoy todavía no, CUANDO miro la racha, ENTONCES sigue viva.
- DADO que mi última partida fue anteayer o antes, CUANDO miro la racha actual, ENTONCES es cero, y la mejor racha se conserva.
- DADO partidas en días separados por un hueco, CUANDO miro la mejor racha, ENTONCES es la seguidilla más larga de todo el historial.

### H4 · Hitos de avance

Como persona que lleva el diario, quiero anotar hitos como «llegar al 50 %», para ver cuáles ya alcancé con el avance real del juego.

Criterios:

- DADO un hito al 50 % y un avance actual de 67, CUANDO miro la meta, ENTONCES el hito figura alcanzado.
- DADO un hito que ya se veía alcanzado, CUANDO el avance actual baja de su objetivo, ENTONCES deja de figurar alcanzado.
- DADO un juego sin partidas, CUANDO miro sus hitos, ENTONCES ninguno está alcanzado.

### H5 · Soltar la meta

Como persona que lleva el diario, quiero editar o apagar la meta, para que un juego terminado o dejado de lado no siga exigiéndome la semana.

Criterios:

- DADO una meta activa, CUANDO la edito, ENTONCES horas, días e hitos quedan actualizados y sigue habiendo una sola meta activa.
- DADO una meta activa, CUANDO la desactivo y confirmo, ENTONCES deja de ser la meta de la semana y el detalle me invita a crear otra.
- DADO un videojuego con meta, CUANDO borro el videojuego, ENTONCES la meta no queda suelta.

## Tickets

| Id | Historia | Tipo | Definition of Done | Depende de |
| --- | --- | --- | --- | --- |
| T-01 | H2, H3, H4 | dominio | Funciones puras de semana, días, racha e hitos, con un test por criterio que no necesita base de datos. `npm test` pasa. | Spec de backend |
| T-02 | H1 | modelo | Existe Meta, referenciada al videojuego, con hitos embebidos y las validaciones de horas, días y tope de 5 hitos. | T-01 no es requisito; sí la spec |
| T-03 | H1, H5 | API | Se puede crear, ver, listar, editar y desactivar una meta. La segunda meta activa responde 409 con un mensaje claro. Un juego completado o abandonado también. El videojuego inexistente responde 404. | T-02 |
| T-04 | H2, H3, H4 | API | `GET` del progreso semanal cumple las reglas del PRD, incluido el caso sin meta y el caso sin partidas. Id inválido: 400. Juego inexistente: 404. | T-01, T-03 |
| T-05 | H5 | API | Borrar el videojuego borra sus metas. Pasarlo a completado o abandonado apaga la meta activa. | T-02 |
| T-06 | H2, H3, H4 | pantalla | El detalle muestra barra, días, rachas e hitos. Sin meta, invita a crear una. Hay carga, error y vacío. | T-04, spec de frontend |
| T-07 | H1, H5 | pantalla | Formulario de alta y edición con hitos, y desactivar con confirmación. Usa `metasApi.ts`, no `fetch` en la página. | T-03, T-06 |
| T-08 | Deuda | API y pantalla | Se puede editar una partida. Al crearla, editarla o borrarla, el detalle vuelve a pedir el progreso. | Diagnóstico |
| T-09 | Deuda | test | `calcularResumen` queda cubierto por tests de horas, partida más reciente y lista vacía. | Diagnóstico |
| T-10 | Deuda | dominio | El límite `hasta` incluye el día civil completo, con test. | Diagnóstico |

## Deuda técnica que se difiere

| Problema | Motivo para diferirlo |
| --- | --- |
| Sin URLs públicas de Render | No cambia la regla de la semana. Se cierra al publicar, no dentro del cálculo. |
| Sin remoto de GitHub | Hace falta la sesión de la terminal. No bloquea las funciones puras. |
| Partidas sin paginación | E2 no pide recortar la lista. El progreso se calcula en el servidor igual. |
| `ObjectId.isValid` es permisivo con algunas cadenas cortas | El error de id mal formado ya existe para el caso de la demo. |
| La semilla solo rehace un juego de ejemplo | No es una regla del diario. |

T-08, T-09 y T-10 no se difieren: el diagnóstico los marcó como bloqueo y se pagan en esta rama.
