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
export const restablecerContraseña = async (req: Request, res:Response, next: NextFunction)=>{
    const {documento, correo} = req.body;

    try {
        const usuarioBuscado = await  prisma.user.findUnique({
            where:{
                username: documento,
            },
            include:{
                persona:true
            }
        });
        if (!usuarioBuscado){
            return res.status(404).json({
                message: "No existe un usuario asociado al username y correo electronico proporcionado"
            });
        }
        const {persona} = usuarioBuscado;
        if (!persona || !persona.email == correo){
            return res.status(404).json({
                message: "No existe un usuario asociado al username y correo electronico proporcionado"
            })
        }

    } catch (error) {
        
    }
}
export const resetPassword = async (req: Request, res: Response, next: NextFunction) => {
    const {userId } = req.params;
    const {  newPassword } = req.body;

    try {

        const hashed = await bcrypt.hash(newPassword, 10);

        await prisma.$transaction([
            prisma.user.update({
                where: { id: Number(userId) },
                data: { password: hashed },
            })
        ]);

        return res.json({ message: "Contraseña actualizada correctamente" });
    } catch (err) {
        next(err);
    }
};