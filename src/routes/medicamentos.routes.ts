import { Router } from "express";
import { 
    createMedicamento,
    getMedicamentos, 
    getMedicamentoById,
    updateMedicamento,
    deleteMedicamento,
    adjustStock,
    getMedicamentosConStockBajo,
    buscarMedicamentos,
    getMedicamentosDisponibles,
    getEstadisticasMedicamentos
} from "../controllers/medicamentos.controller";
import { verifyToken } from "../middleware/auth";

const router = Router();

// Rutas básicas CRUD
router.get('/medicamentos', verifyToken, getMedicamentos);
router.post('/medicamentos', verifyToken, createMedicamento);
router.get('/medicamentos/:id', verifyToken, getMedicamentoById);
router.put('/medicamentos/:id', verifyToken, updateMedicamento);
router.delete('/medicamentos/:id', verifyToken, deleteMedicamento);

// Rutas especializadas
router.patch('/medicamentos/:id/stock', verifyToken, adjustStock);
router.get('/medicamentos/stock/bajo', verifyToken, getMedicamentosConStockBajo);
router.get('/medicamentos/disponibles/stock', verifyToken, getMedicamentosDisponibles);
router.get('/medicamentos/buscar/filtros', verifyToken, buscarMedicamentos);
router.get('/medicamentos/estadisticas/resumen', verifyToken, getEstadisticasMedicamentos);

export default router;