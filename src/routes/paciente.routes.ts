import { Router } from "express";
import {createPaciente, listPacientes} from "../controllers/paciente.controller";
import { verifyToken } from "../middleware/auth";

const router = Router();

router.post('/mascotas',verifyToken, createPaciente);
router.get('/mascotas',verifyToken, listPacientes);

export default router;