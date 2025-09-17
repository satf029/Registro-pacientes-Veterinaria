/*import { Request, Response, NextFunction } from "express";
import { PrismaClient } from "@prisma/client";
import bcrypt from "bcryptjs";

const prisma = new PrismaClient();

// Obtener todos los propietarios con sus datos de persona y mascotas
export const getPropietarios = async (req: Request, res: Response) => {
  const propietarios = await prisma.propietario.findMany({
    include: {
      persona: {
        include: {
          user: true  // Incluye datos del usuario si existe
        }
      },
      mascotas: true    // Incluye las mascotas del propietario
    }
  });
  res.json(propietarios);
};

// Obtener un propietario por ID
export const getPropietarioById = async (req: Request, res: Response, next: NextFunction) => {
  try {
    const { id } = req.params;
    
    const propietario = await prisma.propietario.findUnique({
      where: { id: Number(id) },
      include: {
        persona: {
          include: {
            user: true
          }
        },
        mascotas: true
      }
    });

    if (!propietario) {
      return res.status(404).json({ message: "Propietario no encontrado" });
    }

    res.json(propietario);
  } catch (error) {
    next(error);
  }
};

// Crear propietario (crea persona, user y propietario)
export const createPropietario = async (req: Request, res: Response, next: NextFunction) => {
  try {
    const { nombre, apellido, telefono, email, direccion, documento } = req.body;

    // Validar que el documento sea obligatorio
    if (!documento) {
      return res.status(400).json({ message: "El documento es obligatorio" });
    }

    // Validar que el documento no exista
    const documentoExistente = await prisma.persona.findUnique({
      where: { documento }
    });
    
    if (documentoExistente) {
      return res.status(400).json({ message: "El documento ya está registrado" });
    }

    // Validar que el email no exista si se proporciona
    if (email) {
      const emailExistente = await prisma.persona.findUnique({
        where: { email }
      });
      
      if (emailExistente) {
        return res.status(400).json({ message: "El email ya está registrado" });
      }
    }

    // Crear propietario usando transacción para asegurar consistencia
    const propietario = await prisma.$transaction(async (tx) => {
      // 1. Crear la persona
      const persona = await tx.persona.create({
        data: {
          nombre,
          apellido,
          telefono,
          email,
          direccion,
          documento
        }
      });

      // 2. Crear el usuario con documento como username y password
      const hashedPassword = await bcrypt.hash(documento, 10);

      const user = await tx.user.create({
        data: {
          username: documento,  // Username = documento
          password: hashedPassword,  // Password = documento (hasheado)
          personaId: persona.id,
          activo: true
        }
      });

      // 3. Buscar o crear rol de "cliente"
      let rolCliente = await tx.rol.findUnique({
        where: { nombre: "cliente" }
      });

      if (!rolCliente) {
        rolCliente = await tx.rol.create({
          data: {
            nombre: "cliente",
            descripcion: "Cliente propietario de mascotas"
          }
        });
      }

      // 4. Asignar rol de cliente al usuario
      await tx.userRol.create({
        data: {
          userId: user.id,
          rolId: rolCliente.id
        }
      });

      // 5. Crear el propietario vinculado a la persona
      const nuevoPropietario = await tx.propietario.create({
        data: {
          personaId: persona.id
        },
        include: {
          persona: {
            include: {
              user: {
                include: {
                  roles: {
                    include: {
                      rol: true
                    }
                  }
                }
              }
            }
          }
        }
      });

      return nuevoPropietario;
    });

    // No enviar la contraseña hasheada en la respuesta
    const response = {
      ...propietario,
      persona: {
        ...propietario.persona,
        user: propietario.persona.user ? {
          ...propietario.persona.user,
          password: undefined, // Excluir contraseña hasheada
          credencialesAcceso: {
            username: documento,
            password: documento,
            mensaje: "Username y contraseña son el número de documento"
          }
        } : null
      }
    };

    res.status(201).json(response);
  } catch (error) {
    next(error);
  }
};

// Actualizar propietario (actualiza los datos de la persona)
export const updatePropietario = async (req: Request, res: Response, next: NextFunction) => {
  try {
    const { id } = req.params;
    const { nombre, apellido, telefono, email, direccion, documento } = req.body;

    // Verificar que el propietario existe
    const propietarioExistente = await prisma.propietario.findUnique({
      where: { id: Number(id) },
      include: { 
        persona: {
          include: {
            user: true
          }
        }
      }
    });

    if (!propietarioExistente) {
      return res.status(404).json({ message: "Propietario no encontrado" });
    }

    // Actualizar los datos de la persona
    const propietario = await prisma.persona.update({
      where: { id: propietarioExistente.personaId },
      data: {
        nombre,
        apellido,
        telefono,
        email,
        direccion,
        documento
      },
      include: {
        propietario: {
          include: {
            mascotas: true,
            persona: {
              include: {
                user: true
              }
            }
          }
        }
      }
    });

    res.json(propietario.propietario);
  } catch (error) {
    next(error);
  }
};

// Eliminar propietario (elimina propietario, usuario y persona en cascada)
export const deletePropietario = async (req: Request, res: Response, next: NextFunction) => {
  try {
    const { id } = req.params;

    // Verificar que el propietario existe
    const propietarioExistente = await prisma.propietario.findUnique({
      where: { id: Number(id) },
      include: { 
        persona: {
          include: {
            user: true
          }
        },
        mascotas: true 
      }
    });

    if (!propietarioExistente) {
      return res.status(404).json({ message: "Propietario no encontrado" });
    }

    // Verificar si tiene mascotas
    if (propietarioExistente.mascotas.length > 0) {
      return res.status(400).json({ 
        message: "No se puede eliminar el propietario porque tiene mascotas registradas" 
      });
    }

    // Eliminar usando transacción
    await prisma.$transaction(async (tx) => {
      // 1. Eliminar propietario
      await tx.propietario.delete({
        where: { id: Number(id) }
      });

      // 2. Eliminar usuario si existe
      if (propietarioExistente.persona.user) {
        await tx.user.delete({
          where: { id: propietarioExistente.persona.user.id }
        });
      }

      // 3. Eliminar persona
      await tx.persona.delete({
        where: { id: propietarioExistente.personaId }
      });
    });

    res.json({ message: "Propietario eliminado correctamente" });
  } catch (error) {
    next(error);
  }
};*/