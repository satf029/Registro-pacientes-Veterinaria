import { Router } from "express";
import {
  listarServicios
} from "../controllers/servicio.controller";
import { verifyToken } from "../middleware/auth";

const router = Router();

router.get("/servicios",verifyToken, listarServicios);


export default router;
