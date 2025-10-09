import { Response, Request, NextFunction } from "express";
import { PrismaClient } from "@prisma/client";
import bcrypt from 'bcryptjs';

const prisma = new PrismaClient();


export const  getUsers = async (req: Request, res: Response, next: NextFunction)=>{
    try {
        const users = await prisma.user.findMany();
        res.json(users);
    } catch (error) {
        next(error);
    }
}
export const listUsers = async (req: Request, res: Response, next: NextFunction)=>{
    const {id} = req.params;
    try {
        const users = await prisma.user.findMany({
            where:{
                id: {
                        not: Number(id) 
                    }
            },
            include:{
                persona: true
            }
        });
        res.json(users);
    } catch (error) {
        next(error);
    }
}
export const createUser = async (req: Request, res: Response, next: NextFunction) => {
    try {
        let { 
            password, 
            activo = true,
            nombre,
            apellido,
            telefono,
            email,
            direccion,
            documento,
            roleId
        } = req.body;
        
        // Validar que los campos requeridos estén presentes
        if ( !password || !nombre || !telefono || !documento) {
            return res.status(400).json({ 
                message: 'Documento, password, nombre y telefono son requeridos' 
            });
        }
        const users = getUsers

            roleId = 1;
        // Hash de la contraseña
        const hashPassword = await bcrypt.hash(password, 10);
        
        // Crear persona y usuario en una transacción
        const result = await prisma.$transaction(async (prisma) => {
            // Crear la persona primero
            const persona = await prisma.persona.create({
                data: {
                    nombre,
                    apellido,
                    telefono,
                    email,
                    direccion,
                    documento
                }
            });
            
            // Crear el usuario asociado a la persona
            const user = await prisma.user.create({
                data: {
                    username: documento,
                    password: hashPassword,
                    personaId: persona.id,
                    activo
                },
                include: {
                    persona: true,
                    roles: true,
                    servicios: true
                }
            });
            await prisma.userRol.create({
                data: {
                    userId: user.id,
                    rolId: roleId
                }
            });
            
            return user;
        });
        
        res.status(201).json(result);
    } catch (error) {
        next(error);
    }
};
export const updateUser = async (req: Request, res: Response, next: NextFunction) => {
  try {
    const { id } = req.params;
    const { nombre, apellido, telefono, email, direccion, activo } = req.body;

    // Validar que id sea numérico
    if (!id) {
      return res.status(400).json({ message: "ID de usuario requerido" });
    }

    // Actualizar datos
    const updatedUser = await prisma.user.update({
      where: { id: Number(id) },
      data: {
        persona: {
          update: {
            nombre,
            apellido,
            telefono,
            email,
            direccion
          }
        },
        activo
      },
      include: {
        persona: true,
        roles: true,
        servicios: true
      }
    });

    res.json(updatedUser);
  } catch (error) {
    next(error);
  }
};
