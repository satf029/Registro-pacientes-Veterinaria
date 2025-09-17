import {  PrismaClient } from "@prisma/client";
import { NextFunction, Request, Response } from "express";
import bcrypt from "bcryptjs";
import jwt from "jsonwebtoken";
import dotenv from "dotenv";
dotenv.config();
const SECRET_KEY = process.env.JWT_SECRET!;

const prisma =new  PrismaClient();

export const login = async(req: Request, res:Response, next: NextFunction)=>{
    const {username, password} = req.body;

    try {
        
        const userAccount = await prisma.user.findUnique({
            where:{username}
        })
    
        if (!userAccount ){
           return res.status(401).json({message: "Usuario  invalidas"})
        }
        if(!userAccount.password){
            return res.status(401).json({message: " contraseña invalidas"})
        }
        if (!userAccount.activo) {
            return res.status(401).json({ message: "Usuario inactivo" });
        }
    
        //validar password
        const passwordValid = await bcrypt.compare(password,userAccount.password);
        if (!passwordValid){
           return  res.status(401).json({message: "Usuario o contraseña invalidas"})
        }
    
        //crear token
        const token = jwt.sign(
            {userId: userAccount.id, username:userAccount.username},
            SECRET_KEY,
            {expiresIn: "1h"}
        );

        return res.json({ message: "Login exitoso", token, userId: userAccount.id});
    } catch (error) {
        next(error);
    }
    


}