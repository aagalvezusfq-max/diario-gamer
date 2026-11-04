import { Router } from "express";
import * as ctrl from "../controllers/metas.controller";

const router = Router();

router.post("/", ctrl.crear);
router.get("/:id", ctrl.obtener);
router.put("/:id", ctrl.actualizar);
router.patch("/:id/desactivar", ctrl.desactivar);

export default router;
