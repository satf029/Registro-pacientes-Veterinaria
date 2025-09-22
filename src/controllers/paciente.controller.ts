import { Response, Request, NextFunction } from "express";
import { PrismaClient } from "@prisma/client";

const prisma = new PrismaClient();

export const createPaciente = async (req: Request, res: Response, next: NextFunction)=>{
    const {
        nombre,
        especie,
        raza,
        edad,
        peso,
        sexo,
        color,
        duenoId
    } = req.body;

    try {
        const pacienteNuevo = await prisma.mascota.create({
            data:{
                nombre,
                especie,
                raza,
                edad,
                peso,
                sexo,
                color,
                duenoId:Number(duenoId)
            }
        });
        res.json(pacienteNuevo);
    } catch (error) {
        next(error);
    }
}
export const listPacientes = async (req: Request, res: Response, next: NextFunction)=>{

    try {
        const pacientes = await prisma.mascota.findMany({
            include:{
                dueno: {
                    include: {
                        persona: true
                    }
                }
            }
        })
        res.json(pacientes);
    } catch (error) {
        next(error);
    }

}