import { Response, Request, NextFunction } from "express";
import { PrismaClient } from "@prisma/client";

const prisma = new PrismaClient();

export const getPropietarioByCi = async (req: Request, res: Response, next: NextFunction)=>{

  const {documento} = req.params;
  const propietario = await prisma.propietario.findFirst({
      where: { persona: { documento } }, 
      include: {
        persona: true, 
      },
    });

  res.json(propietario);
}

export const crearPropietario = async (req: Request, res: Response, next: NextFunction)=>{
  const {
    nombre,
    apellido,
    telefono,
    email,
    direccion,
    documento
  } = req.body;

  console.log('creando propietarios');
  const persona = await prisma.persona.create({
    data:{
      nombre,
      apellido,
      telefono,
      email,
      direccion,
      documento,
    }
  });
  console.log("craecion completa de entidad persona");
  const propietario = await prisma.propietario.create({
    data:{
      personaId: persona.id
    }
  })
  console.log("creacion completa");

  res.json(propietario)
}

export const listPropietarios = async(req: Request, res: Response, next: NextFunction)=>{
    try {
        const listaPropietarios = await prisma.propietario.findMany();
        res.json(listaPropietarios);
    } catch (error) {
        next(error);
    }
}