import { Router } from "express";
import { crearPropietario, getPropietarioByCi } from "../controllers/propietario.controller";
import { verifyToken } from "../middleware/auth";
import { validateHeaderValue } from "http";

const router = Router();

router.get('/propietarios/:documento',verifyToken,getPropietarioByCi);
router.post('/propietario', verifyToken, crearPropietario);



export default router;