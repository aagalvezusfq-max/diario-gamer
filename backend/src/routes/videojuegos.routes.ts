import { Router } from "express";
import * as ctrl from "../controllers/videojuegos.controller";

const router = Router();

router.get("/", ctrl.listar);
router.post("/", ctrl.crear);
router.get("/:id/partidas", ctrl.partidas);
router.get("/:id/resumen", ctrl.resumen);
router.get("/:id/progreso-semanal", ctrl.progresoSemanal);
router.get("/:id/metas", ctrl.metas);
router.patch("/:id/logros/:logroId", ctrl.actualizarLogro);
router.get("/:id", ctrl.obtener);
router.put("/:id", ctrl.actualizar);
router.delete("/:id", ctrl.eliminar);

export default router;
