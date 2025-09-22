import { Router } from "express";
import {
  addServicios,
  listarServicios
} from "../controllers/servicio.controller";
import { verifyToken } from "../middleware/auth";

const router = Router();

router.get("/servicios",verifyToken, listarServicios);
router.post('/servicios',verifyToken, addServicios);


export default router;
