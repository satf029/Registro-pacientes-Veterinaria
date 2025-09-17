import { Response, Request, NextFunction } from "express";
import { PrismaClient } from "@prisma/client";

const prisma = new PrismaClient();

export const getMedicamentos = async (req: Request, res: Response, next: NextFunction) => {
    try {
        const medicamentos = await prisma.medicamento.findMany({
            include: {
                detalleServicios: true
            },
            orderBy: {
                nombre: 'asc'
            }
        });
        res.json(medicamentos);
    } catch (error) {
        next(error);
    }
}

export const getMedicamentoById = async (req: Request, res: Response, next: NextFunction) => {
    const { id } = req.params;
    try {
        const medicamento = await prisma.medicamento.findUnique({
            where: {
                id: Number(id)
            },
            include: {
                detalleServicios: true
            }
        });

        if (!medicamento) {
            return res.status(404).json({ 
                message: 'Medicamento no encontrado' 
            });
        }

        res.json(medicamento);
    } catch (error) {
        next(error);
    }
}

export const createMedicamento = async (req: Request, res: Response, next: NextFunction) => {
    try {
        let { 
            nombre,
            principioActivo,
            laboratorio,
            dosis,
            presentacion,
            stock = 0,
            precio,
            requierePrescripcion = false
        } = req.body;
        
        // Validar que los campos requeridos estén presentes
        if (!nombre) {
            return res.status(400).json({ 
                message: 'El nombre del medicamento es requerido' 
            });
        }

        // Validar que el stock no sea negativo
        if (stock < 0) {
            return res.status(400).json({ 
                message: 'El stock no puede ser negativo' 
            });
        }

        // Validar que el precio sea positivo si se proporciona
        if (precio !== undefined && precio < 0) {
            return res.status(400).json({ 
                message: 'El precio no puede ser negativo' 
            });
        }

        // Crear el medicamento
        const medicamento = await prisma.medicamento.create({
            data: {
                nombre,
                principioActivo,
                laboratorio,
                dosis,
                presentacion,
                stock: Number(stock),
                precio: precio ? Number(precio) : null,
                requierePrescripcion: Boolean(requierePrescripcion)
            },
            include: {
                detalleServicios: true
            }
        });
        
        res.status(201).json(medicamento);
    } catch (error) {
        next(error);
    }
}

export const updateMedicamento = async (req: Request, res: Response, next: NextFunction) => {
    const { id } = req.params;
    try {
        const {
            nombre,
            principioActivo,
            laboratorio,
            dosis,
            presentacion,
            stock,
            precio,
            requierePrescripcion
        } = req.body;

        // Verificar que el medicamento existe
        const medicamentoExistente = await prisma.medicamento.findUnique({
            where: { id: Number(id) }
        });

        if (!medicamentoExistente) {
            return res.status(404).json({ 
                message: 'Medicamento no encontrado' 
            });
        }

        // Validar stock si se proporciona
        if (stock !== undefined && stock < 0) {
            return res.status(400).json({ 
                message: 'El stock no puede ser negativo' 
            });
        }

        // Validar precio si se proporciona
        if (precio !== undefined && precio < 0) {
            return res.status(400).json({ 
                message: 'El precio no puede ser negativo' 
            });
        }

        const medicamentoActualizado = await prisma.medicamento.update({
            where: {
                id: Number(id)
            },
            data: {
                nombre,
                principioActivo,
                laboratorio,
                dosis,
                presentacion,
                stock: stock !== undefined ? Number(stock) : undefined,
                precio: precio !== undefined ? Number(precio) : undefined,
                requierePrescripcion: requierePrescripcion !== undefined ? Boolean(requierePrescripcion) : undefined
            },
            include: {
                detalleServicios: true
            }
        });

        res.json(medicamentoActualizado);
    } catch (error) {
        next(error);
    }
}

export const deleteMedicamento = async (req: Request, res: Response, next: NextFunction) => {
    const { id } = req.params;
    try {
        // Verificar que el medicamento existe
        const medicamento = await prisma.medicamento.findUnique({
            where: { id: Number(id) },
            include: {
                detalleServicios: true
            }
        });

        if (!medicamento) {
            return res.status(404).json({ 
                message: 'Medicamento no encontrado' 
            });
        }

        // Verificar si el medicamento está siendo usado en servicios
        if (medicamento.detalleServicios.length > 0) {
            return res.status(400).json({ 
                message: 'No se puede eliminar el medicamento porque está siendo usado en servicios' 
            });
        }

        // Eliminar el medicamento
        await prisma.medicamento.delete({
            where: {
                id: Number(id)
            }
        });

        res.json({ 
            message: 'Medicamento eliminado correctamente'
        });
    } catch (error) {
        next(error);
    }
}

export const adjustStock = async (req: Request, res: Response, next: NextFunction) => {
    const { id } = req.params;
    try {
        const { 
            tipo, // 'ENTRADA' o 'SALIDA'
            cantidad,
            motivo
        } = req.body;

        // Validaciones
        if (!tipo || !cantidad) {
            return res.status(400).json({ 
                message: 'Tipo y cantidad son requeridos' 
            });
        }

        if (!['ENTRADA', 'SALIDA'].includes(tipo)) {
            return res.status(400).json({ 
                message: 'Tipo debe ser ENTRADA o SALIDA' 
            });
        }

        if (cantidad <= 0) {
            return res.status(400).json({ 
                message: 'La cantidad debe ser mayor a 0' 
            });
        }

        // Verificar que el medicamento existe
        const medicamento = await prisma.medicamento.findUnique({
            where: { id: Number(id) }
        });

        if (!medicamento) {
            return res.status(404).json({ 
                message: 'Medicamento no encontrado' 
            });
        }

        // Calcular nuevo stock
        const cantidadMovimiento = tipo === 'ENTRADA' ? Number(cantidad) : -Number(cantidad);
        const nuevoStock = medicamento.stock + cantidadMovimiento;

        // Validar que el stock no sea negativo
        if (nuevoStock < 0) {
            return res.status(400).json({ 
                message: 'Stock insuficiente para realizar la salida' 
            });
        }

        // Actualizar stock del medicamento
        const medicamentoActualizado = await prisma.medicamento.update({
            where: { id: Number(id) },
            data: { stock: nuevoStock },
            include: {
                detalleServicios: true
            }
        });

        res.json({
            message: `Stock ajustado correctamente. ${tipo}: ${cantidad} unidades`,
            medicamento: medicamentoActualizado,
            stockAnterior: medicamento.stock,
            stockNuevo: nuevoStock,
            motivo: motivo || `${tipo} de stock`
        });
    } catch (error) {
        next(error);
    }
}

export const getMedicamentosConStockBajo = async (req: Request, res: Response, next: NextFunction) => {
    try {
        const { limite = 10 } = req.query; // Stock mínimo por defecto: 10
        
        const medicamentos = await prisma.medicamento.findMany({
            where: {
                stock: {
                    lte: Number(limite)
                }
            },
            include: {
                detalleServicios: true
            },
            orderBy: {
                stock: 'asc'
            }
        });

        res.json(medicamentos);
    } catch (error) {
        next(error);
    }
}

export const buscarMedicamentos = async (req: Request, res: Response, next: NextFunction) => {
    try {
        const { 
            nombre, 
            principioActivo, 
            laboratorio,
            requierePrescripcion,
            stockMinimo
        } = req.query;

        const whereConditions: any = {};

        if (nombre) {
            whereConditions.nombre = {
                contains: String(nombre),
                mode: 'insensitive'
            };
        }

        if (principioActivo) {
            whereConditions.principioActivo = {
                contains: String(principioActivo),
                mode: 'insensitive'
            };
        }

        if (laboratorio) {
            whereConditions.laboratorio = {
                contains: String(laboratorio),
                mode: 'insensitive'
            };
        }

        if (requierePrescripcion !== undefined) {
            whereConditions.requierePrescripcion = requierePrescripcion === 'true';
        }

        if (stockMinimo) {
            whereConditions.stock = {
                gte: Number(stockMinimo)
            };
        }

        const medicamentos = await prisma.medicamento.findMany({
            where: whereConditions,
            include: {
                detalleServicios: true
            },
            orderBy: {
                nombre: 'asc'
            }
        });

        res.json(medicamentos);
    } catch (error) {
        next(error);
    }
}

export const getMedicamentosDisponibles = async (req: Request, res: Response, next: NextFunction) => {
    try {
        const medicamentos = await prisma.medicamento.findMany({
            where: {
                stock: {
                    gt: 0
                }
            },
            include: {
                detalleServicios: true
            },
            orderBy: {
                nombre: 'asc'
            }
        });

        res.json(medicamentos);
    } catch (error) {
        next(error);
    }
}

export const getEstadisticasMedicamentos = async (req: Request, res: Response, next: NextFunction) => {
    try {
        const [
            totalMedicamentos,
            medicamentosConStock,
            medicamentosSinStock,
            medicamentosConPrescripcion,
            stockTotal,
            valorTotalInventario
        ] = await Promise.all([
            prisma.medicamento.count(),
            prisma.medicamento.count({
                where: { stock: { gt: 0 } }
            }),
            prisma.medicamento.count({
                where: { stock: 0 }
            }),
            prisma.medicamento.count({
                where: { requierePrescripcion: true }
            }),
            prisma.medicamento.aggregate({
                _sum: { stock: true }
            }),
            prisma.medicamento.aggregate({
                _sum: {
                    precio: true
                }
            })
        ]);

        const estadisticas = {
            totalMedicamentos,
            medicamentosConStock,
            medicamentosSinStock,
            medicamentosConPrescripcion,
            medicamentosSinPrescripcion: totalMedicamentos - medicamentosConPrescripcion,
            stockTotal: stockTotal._sum.stock || 0,
            valorTotalInventario: valorTotalInventario._sum.precio || 0
        };

        res.json(estadisticas);
    } catch (error) {
        next(error);
    }
}