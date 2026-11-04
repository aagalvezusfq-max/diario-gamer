# Diseño del Diario

Bitácora de noche: papel oscuro, título de diario y un acento de ámbar. No es un dashboard genérico.

## Colores

| Token | Valor | Uso |
| --- | --- | --- |
| `--bg` | `#110f0c` | Fondo |
| `--bg-2` | `#1b1814` | Tarjetas y paneles |
| `--bg-3` | `#262119` | Superficie activa |
| `--ink` | `#f6f1e7` | Texto principal |
| `--muted` | `#b7ad9f` | Texto secundario |
| `--faint` | `#857b6e` | Etiquetas pequeñas |
| `--line` | `rgba(246, 241, 231, 0.12)` | Bordes |
| `--gold` | `#e6a23c` | Acción principal y progreso |
| `--gold-ink` | `#2a1c08` | Texto sobre el ámbar |
| `--mint` | `#8fd0ae` | Jugando y hito alcanzado |
| `--blue` | `#9ebcff` | Completado |
| `--coral` | `#ef6f5e` | Peligro y abandonado |

No se agregan colores fuera de esta tabla. La barra de la semana usa el degradado ya existente de `--gold` a `--mint`.

## Tipografía

- Títulos: Newsreader, con Georgia de respaldo.
- Interfaz: Outfit, con Segoe UI de respaldo.
- Un título de página, `clamp(2.2rem, 4vw, 3.6rem)`. Un título de sección, cerca de `1.55rem`.
- Las cifras del progreso usan la serif, no una tercera familia.

## Espaciado

- Radio de tarjeta: `--radius` (`16px`). Controles: `12px`. Pastillas: `999px`.
- Hueco base entre bloques: `1rem`. Dentro de un panel: `0.8rem` a `1.2rem`.
- El contenido mide como máximo `1120px` y se centra.
- En pantallas de menos de `860px` las rejillas pasan a una columna.

## Componentes

- Botón primario ámbar, secundario con borde, texto suelto y peligro en coral.
- Badge de estado con el color de la tabla.
- Panel con fondo `--bg-2`, borde `--line` y sombra suave.
- Estados de carga (pulso), error (borde coral) y vacío (título más una frase).
- Barra de avance: carril `--bg`, relleno hasta el 100 % visual aunque el número pase de 100.
- Hito alcanzado: borde `--mint` y marca. Hito pendiente: borde `--line`.

## Tono

Se habla de tú, en frases cortas. Se dice qué falta y qué puede hacer la persona. No se anima con exclamaciones ni se compara con otros jugadores.

## Accesibilidad

- `lang="es"` y un enlace para saltar al contenido.
- Cada control tiene etiqueta. El hito y la desactivación se confirman con texto, no solo con color.
- El foco visible es un anillo ámbar.
- Se respeta `prefers-reduced-motion`.

## No hacemos

- No usamos librerías de componentes ni de gráficos.
- No usamos gradientes morados, la fuente Inter ni tarjetas con sombra de color.
- No mostramos notificaciones, rankings ni un histórico de semanas.
- No escondemos el número real de horas detrás de un tope visual: la barra se llena, el número dice 140 % si corresponde.
