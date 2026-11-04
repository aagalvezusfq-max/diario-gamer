# Diario de Progreso Gamer

API Express + TypeScript + Mongoose y cliente React + Vite. E1 registra juegos, partidas y un resumen. E2 agrega metas, hitos y el progreso de la semana.

## Estructura

- `backend/src`: config, db, dominio, models, services, controllers, routes, middlewares
- `frontend/src`: api, pages, components, domain
- `docs/`: diagnóstico, PRD, backlog, specs, auditoría, bitácora

## Comandos

- API: `npm run dev --prefix backend`
- Tests: `npm test --prefix backend`
- Web: `npm run dev --prefix frontend`
- Build: `npm run build`

## Convenciones

La petición entra por la ruta, pasa al controlador y baja al servicio. El cálculo de semana, racha e hitos vive en `backend/src/dominio`, sin base de datos. Los errores salen por `AppError` y el `errorHandler`.

## Frontend

La interfaz sigue `DESIGN.md`. No copies ese documento aquí: léelo antes de tocar pantallas o CSS.

## Reglas

- Nunca leas ni modifiques `.env`.
- Ninguna funcionalidad sin una spec en `docs/specs/`.
- Ejecuta los tests antes de dar una tarea por terminada.
- La spec se commitea antes que el código que la implementa.
- El commit de implementación nombra su ticket: `feat(E2): T-03 ...`.
