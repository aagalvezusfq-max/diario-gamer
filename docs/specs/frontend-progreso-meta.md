# Spec · Progreso semanal en el detalle

Tickets: T-06, T-07 y la parte de pantalla de T-08.

## DEBE

- DEBE mostrar, en el detalle del videojuego, una sección «Esta semana» con la barra de horas contra la meta, los días jugados contra los días objetivo, la racha actual, la mejor racha y la lista de hitos con su estado.
- DEBE pintar la barra como máximo al 100 % del ancho y mostrar el porcentaje real, aunque pase de 100.
- DEBE, si no hay meta activa, mostrar horas, días y rachas, y una invitación a crear la meta. No muestra un porcentaje inventado.
- DEBE ofrecer un formulario para crear y para editar la meta: horas, días e hitos (descripción y porcentaje, máximo 5).
- DEBE pedir confirmación antes de desactivar la meta.
- DEBE hablar con la API solo a través de `frontend/src/api/metasApi.ts` y de los servicios de partidas y videojuegos ya existentes. La página no llama a `fetch`.
- DEBE mostrar carga, error con reintento, y vacío cuando todavía no hay meta o no hay partidas en la semana.
- DEBE volver a pedir el progreso después de registrar, editar o eliminar una partida.
- DEBE usar solamente los tokens de `DESIGN.md` (`--bg`, `--gold`, `--mint`, `--coral`, Newsreader, Outfit y el radio ya definido).

## NO DEBE

- NO DEBE calcular horas, racha ni hitos en el navegador.
- NO DEBE usar una librería de gráficos o de componentes.
- NO DEBE agregar un color que no esté en `DESIGN.md`.
- NO DEBE guardar la meta dentro del formulario del videojuego: la meta tiene su propia pantalla.
- NO DEBE desactivar la meta sin una confirmación explícita.

## Criterio → verificación

| Criterio | Verificación |
| --- | --- |
| F1 La sección se ve en el detalle | Recorrido manual: abrir un juego y leer «Esta semana» |
| F2 Barra, días, rachas e hitos | Recorrido con una meta y partidas; el número de horas coincide con la API |
| F3 Sin meta invita a crear | Juego sin meta activa: hay enlace a crear y no hay porcentaje |
| F4 Formulario de alta y edición | Crear 5 h y 4 días con un hito; editar el hito y ver el cambio al volver |
| F5 Desactivar con confirmación | Cancelar no apaga; confirmar apaga y vuelve el vacío |
| F6 Servicio aparte | `metasApi.ts` existe y las páginas no importan `fetch` |
| F7 Carga, error y vacío | Estados ya usados en el diario, repetidos en esta sección y en el formulario |
| F8 El progreso se refresca | Tras crear, editar o borrar una partida, el detalle pide otra vez el progreso semanal |
| F9 Solo tokens de DESIGN.md | Revisión de `index.css`: las reglas nuevas usan variables, no colores sueltos |

## Ticket → archivos

| Ticket | Archivos |
| --- | --- |
| T-06 | `frontend/src/pages/DetalleVideojuegoPage.tsx`, `frontend/src/api/videojuegosApi.ts`, `frontend/src/types.ts`, `frontend/src/index.css` |
| T-07 | `frontend/src/pages/FormMetaPage.tsx`, `frontend/src/api/metasApi.ts`, `frontend/src/App.tsx` |
| T-08 | `frontend/src/pages/FormPartidaPage.tsx`, `frontend/src/api/partidasApi.ts`, `frontend/src/pages/DetalleVideojuegoPage.tsx` |

## Revisión de diseño

Se hace al cerrar T-06 y T-07, contra `DESIGN.md`: tono de tú, foco visible, confirmación que no depende solo del color, y barra que no esconde el porcentaje real.
