import { Router } from "express";
import { createPropietario, deletePropietario, getPropietarios, updatePropietario } from "../controllers/propietario.controller";

const router = Router();

router.get('/propietarios',getPropietarios);
router.post('/propietarios',createPropietario);
router.put('/propietario/:id', updatePropietario);
router.delete('/propietario/:id',deletePropietario);


export default router;