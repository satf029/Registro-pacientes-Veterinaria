import { Response, Request, NextFunction } from "express";
import { PrismaClient } from "@prisma/client";
import bcrypt from 'bcryptjs';

const prisma = new PrismaClient();

export const listarServicios =  async (req: Request, res: Response, next: NextFunction)=>{

  const services  = await  prisma.servicio.findMany();

  res.json(services);
}