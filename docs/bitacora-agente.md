# Bitácora del agente

## 1. Diagnóstico antes de escribir E2

Se le pidió leer el Proyecto 3 y separar lo que bloquea de lo que puede esperar. Encontró el resumen, las capas y las pantallas, y también tres huecos reales: no hay tests, no se puede editar una partida y `hasta` corta el día a medianoche. Esos tres se pagaron. Paginación, semilla y el remoto de GitHub quedaron diferidos, con el motivo en el diagnóstico.

## 2. El porcentaje no se recorta

Al pensar el ejemplo de 7 horas contra una meta de 5, la primera tendencia fue mostrar 100 % «porque la barra ya está llena». La ficha no dice eso, y el hueco 5 pide una decisión explícita. Quedó 140 en el número y la barra llena. Está en el PRD, en la spec (NO DEBE recortar) y en el test.

## 3. La medianoche de Ecuador

Convertir `fecha` a `America/Guayaquil` parecía lo correcto. No lo es: el formulario guarda la fecha a medianoche UTC, y en Ecuador eso es el día anterior. La spec lo prohíbe. El día de la partida es la fecha civil; «hoy» y el lunes de la semana sí usan Ecuador. El test de `2026-11-02T00:00:00.000Z` fija esa decisión.

## 4. El hito no se guarda como alcanzado

El modelo tentaba un booleano `alcanzado` dentro del hito, para no recalcular. La spec dice que no se guarda, porque el avance ya vive en las partidas. Se detectó al releer la spec antes de crear `Meta.ts`. La prueba de API lo confirma: al bajar el avance de 67 a 40, el hito del 50 % deja de estar alcanzado y el del 25 % sigue.

## 5. 409 y 400 no son lo mismo

Al probar una meta con 0 horas sobre un juego que ya tenía meta activa, la API respondió 409. No estaba mal: primero mira si ya hay una meta encendida. El criterio de validación pide 400, así que se repitió sobre un juego limpio (0 horas, 8 días y 6 hitos) y ahí sí respondió 400. El 409 de la segunda meta y el del juego completado se vieron aparte.

## 6. La spec fue antes que el código

`docs/specs/` está en el commit `cda319d`. El primer código de dominio es posterior (`feat(E2): T-01`). Cuando hizo falta tocar un archivo, la tabla ticket → archivos de la spec ya decía cuál.

## 7. El harness no puede instalarse con administrador

`winget` pidió un permiso que esta cuenta no puede aceptar. El hook que bloquea `.env` igual se probó: ante `backend/.env` sale con código 2; ante `app.ts`, sigue. La sesión de GitHub en el navegador no llegó a la terminal, así que el pull request remoto sigue pendiente y está anotado como deuda.

## 8. Desviación que se corrigió con la spec

En un borrador, la racha se rompía en cuanto «hoy» no tenía partida. Eso apaga la racha todas las mañanas, antes de que la persona pueda jugar. El PRD dice lo contrario: si ayer hubo partida, la racha sigue viva. El test «mantiene la racha viva si el último día jugado es ayer» evita que vuelva a colarse.
