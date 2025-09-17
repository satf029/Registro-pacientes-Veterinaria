import { Router } from "express";
import { createPropietario, deletePropietario, getPropietarios, updatePropietario } from "../controllers/propietario.controller";
import { verifyToken } from "../middleware/auth";

const router = Router();

router.get('/propietarios',verifyToken,getPropietarios);
router.post('/propietarios',verifyToken,createPropietario);
router.put('/propietario/:id',verifyToken, updatePropietario);
router.delete('/propietario/:id',verifyToken,deletePropietario);


export default router;