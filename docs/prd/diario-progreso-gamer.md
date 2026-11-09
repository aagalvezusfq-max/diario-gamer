# PRD · Diario de Progreso Gamer

## Problema

La persona anota qué juega y cuánto le dedicó, y ya puede ver el avance de cada título. No puede ver si esta semana jugó lo que se había propuesto, ni si lleva varios días seguidos o solo un fin de semana intenso.

## Quién lo usa

La misma persona que registra sus videojuegos y sus partidas. No hay cuentas compartidas ni un grupo de juego.

## Objetivo y métrica

Poder fijar una meta por videojuego y, en el detalle de ese juego, ver cómo va la semana, cuántos días seguidos lleva y qué hitos alcanzó.

Éxito, dicho por el cliente: en un mes, cumple su meta semanal al menos 3 de 4 semanas.

## Alcance

- Una meta por videojuego, con horas por semana y días por semana.
- Una lista corta de hitos de avance dentro de esa meta.
- La semana en curso, de lunes a domingo, en hora de Ecuador.
- La racha de días seguidos con al menos una partida de ese juego, y la mejor racha.
- Crear, cambiar y desactivar la meta desde el detalle del juego.

## No-alcance

Notificaciones, recordatorios, metas compartidas, rankings y gráficos históricos. Tampoco se guarda un archivo de «cómo iba cada semana pasada».

## Lo que ya existe

El diario ya responde qué está jugando, cuánto tiempo le ha dedicado y qué tan avanzado va. Esa parte no se rehace. La meta y la semana se apoyan en las partidas que ya se registran.

## Reglas de negocio

1. Cada videojuego tiene como máximo una meta activa. Puede conservar metas viejas, apagadas.
2. La semana va de lunes a domingo, hora de Ecuador (`America/Guayaquil`).
3. Las horas de la semana son la suma de las partidas de esos días, en horas con un decimal.
4. Los días jugados de la semana son fechas distintas con al menos una partida. Dos partidas el mismo día cuentan como un día.
5. La racha y la mejor racha miran todo el historial de ese videojuego, no solo la semana.
6. Un hito se considera alcanzado cuando el avance actual del juego llega a su objetivo. Ese estado no se guarda aparte: se mira el avance que ya calculan las partidas.
7. Si no hay meta activa, igual se muestran horas, días y rachas. No hay porcentaje contra una meta.
8. Si no hay partidas, horas, días y rachas quedan en cero y ningún hito está alcanzado.

### Huecos resueltos

1. **Racha y el día de hoy.** Si hoy todavía no hay partida, pero ayer sí, la racha sigue viva. El día de hoy no ha terminado. La racha se rompe solo cuando el último día jugado es anterior a ayer. En ese caso la racha actual es cero; la mejor racha no se borra.
2. **Varias partidas el mismo día.** Cuentan como un solo día jugado.
3. **Partida que cruza la medianoche.** Una partida no tiene hora de inicio ni de fin: tiene la fecha que la persona eligió. Esa fecha es el día de la partida. No se reparte entre dos días. La semana se arma con el calendario de Ecuador, y cada partida cae en el día de su fecha.
4. **Cambio de meta a mitad de semana.** El porcentaje de la semana se calcula con la meta que está activa en el momento de mirar. La meta anterior queda en el historial y no reescribe esta semana. No prometemos recalcular semanas ya cerradas.
5. **Meta superada.** Si se juegan 7 horas y la meta es de 5, el porcentaje es 140. No se recorta a 100. La barra se llena por completo y el número muestra el 140, para que se note que se pasó.
6. **Hito ya alcanzado.** Si después se registra una partida con menos avance, el hito deja de verse alcanzado. No queda «pegado»: siempre refleja el avance actual.
7. **Videojuego completado o abandonado.** No puede tener una meta activa. No se crea ni se vuelve a encender una meta en ese estado. Si el juego pasa a completado o abandonado, su meta activa se apaga.
8. **Eliminar un videojuego.** Su meta y los hitos que van dentro desaparecen con él. No quedan metas sueltas.

## Supuestos

- La persona registra la partida el día en que la jugó, con la fecha del formulario, no con un reloj de inicio y fin.
- «Cumplir la semana» significa llegar al 100 % de las horas pedidas. Los días objetivos se muestran al lado, pero la métrica de éxito del cliente habla de la meta semanal de horas.
- Ecuador no cambia de horario de verano. La zona `America/Guayaquil` basta.

## Puntos abiertos

- No está definido un premio ni un mensaje especial al cumplir 3 de 4 semanas. El producto muestra cada semana; no lleva la cuenta del mes. Queda fuera a propósito, junto con el histórico.
- No se decidió avisar dentro de la pantalla cuando falte un día para no romper la racha. Sería un recordatorio, y los recordatorios están fuera de alcance.
