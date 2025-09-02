import { Request, Response, NextFunction } from "express";
import { PrismaClient } from "@prisma/client";

const prisma = new PrismaClient();

// Obtener todos los propietarios con sus pacientes
export const getPropietarios = async (req: Request, res: Response) => {
  const propietarios = await prisma.propietario.findMany({
    include: { pacientes: true },
  });
  res.json(propietarios);
};

// Crear propietario
export const createPropietario = async (req: Request, res: Response, next: NextFunction) => {
  try {
    const { nombre, telefono, email, direccion } = req.body;

    const propietario = await prisma.propietario.create({
      data: {
        nombre,
        telefono,
        email,
        direccion,
      },
    });

    res.json(propietario);
  } catch (error) {
    next(error);
  }
};

// Actualizar propietario
export const updatePropietario = async (req: Request, res: Response, next: NextFunction) => {
  try {
    const { id } = req.params;
    const { nombre, telefono, email, direccion } = req.body;

    const propietario = await prisma.propietario.update({
      where: { id: Number(id) },
      data: {
        nombre,
        telefono,
        email,
        direccion,
      },
    });

    res.json(propietario);
  } catch (error) {
    next(error);
  }
};

// Eliminar propietario
export const deletePropietario = async (req: Request, res: Response, next: NextFunction) => {
  try {
    const { id } = req.params;

    await prisma.propietario.delete({
      where: { id: Number(id) },
    });

    res.json({ message: "Propietario eliminado correctamente" });
  } catch (error) {
    next(error);
  }
};
