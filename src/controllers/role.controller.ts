import { Request, Response, NextFunction } from "express";
import { PrismaClient } from "@prisma/client";

const prisma = new PrismaClient();

export const createRol = async (req: Request, res:Response, next:NextFunction)=>{
    const {nombre, descripcion} = req.body;

    try {
        const alreadyCreated = await  prisma.rol.findMany({
            where:{
                nombre
            }
        });
        if (alreadyCreated){
            const newRole = await prisma.rol.create({
                data:{
                    nombre,
                    descripcion
                }
            })
            res.json(newRole);
        }
    } catch (error) {
        next(error);
    }

}

export const updateRole = async (req: Request, res:Response, next:NextFunction)=>{
    const {id} = req.params;
    const {nombre, descripcion} = req.body;

    try {
        const updatedRole = await prisma.rol.update({
            where:{
                id: Number(id),
            },
            data:{
                nombre,
                descripcion,
            }
        })
        res.json(updatedRole);
    } catch (error) {
        next(error);
    }
}
export const deleteRole = async (req: Request, res:Response, next:NextFunction)=>{
    const {id} = req.params

    try {
        await prisma.rol.delete({
            where: {
                id: Number(id)
            }
        });

        res.json({ 
            message: 'Rol eliminado correctamente'
        });
    } catch (error) {
        next(error);
    }
}