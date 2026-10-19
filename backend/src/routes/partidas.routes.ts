import { Router } from "express";
import * as ctrl from "../controllers/partidas.controller";

const router = Router();

router.get("/", ctrl.listar);
router.post("/", ctrl.crear);
router.delete("/:id", ctrl.eliminar);

export default router;
