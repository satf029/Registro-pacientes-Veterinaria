import { Response, Request, NextFunction } from "express";
import { PrismaClient } from "@prisma/client";
import bcrypt from 'bcryptjs';

const prisma = new PrismaClient();
const ESTADOS_PERMITIDOS = ["pendiente","en_proceso","completado","cancelado"] as const;


export const listarServicios = async (req: Request, res: Response, next: NextFunction) => {
  try {
    const services = await prisma.servicio.findMany({
      orderBy: { fecha: "desc" },
      include: {
        mascota: true,                       // { id, nombre, ... }
        tipoServicio: true,                  // { id, nombre, ... }
        empleado: { select: { id: true, username: true } },
        // Si querés también enviar el detalle:
        // detalleServicios: { include: { medicamento: true } }
      },
    });

    res.json(services); // ← array simple (tu front ya soporta array)
  } catch (err) {
    next(err);
  }
};


export const addServicios = async (req: Request, res: Response, next: NextFunction)=>{
  let {
      mascotaId,
      tipoServicio,
      empleadoId,        // opcional
      fecha,             // opcional (ISO string)
      estado = "pendiente",
      precio,            // opcional number
      observaciones,     // opcional string
      detalleServicios   // opcional: [{ medicamentoId, cantidad, dosis }]
    } = req.body;

    const existeTipoServicio = await prisma.tipoServicio.findMany({
      where:{
        nombre:tipoServicio
      }
    })
    const tipoServicioNuevo = await prisma.tipoServicio.create({
      data:{
        nombre: tipoServicio,
        descripcion: tipoServicio,
        precio: precio
      }
    });
    const nuevoServicio = await prisma.servicio.create({
      data:{
        mascotaId,
        tipoServicioId: tipoServicioNuevo.id,
        empleadoId,
        fecha,
        estado,
        observaciones,
      }
    })

    res.json(nuevoServicio)
}