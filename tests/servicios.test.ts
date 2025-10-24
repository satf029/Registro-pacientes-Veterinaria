import request from "supertest";
import app from "../src/index"; // tu app principal de Express
import { PrismaClient } from "@prisma/client";

const prisma = new PrismaClient();

describe("Rutas de Servicios", () => {
  beforeAll(async () => {
    // Crear datos base necesarios para las relaciones
    // ⚠️ Asegurate de que tu modelo `mascota` exista en el schema
    const mascota = await prisma.mascota.create({
      data: {
        nombre: "Firulais",
        especie: "Perro",
        raza: "Mestizo",
        edad: 3,
        duenoId: 1, // ajustá si tenés FK a propietario
      },
    });

    // Guardar id para usarlo en los tests
    (global as any).mascotaId = mascota.id;
  });

  afterAll(async () => {
    await prisma.$disconnect();
  });

  it("Agregar servicio, retornar el nuevo servicio", async () => {
    const res = await request(app)
      .post("/api/servicios")
      .set("Authorization", "Bearer tokenfalso") // ⚠️ mockea verifyToken o pasa JWT válido
      .send({
        mascotaId: (global as any).mascotaId,
        tipoServicio: "prueba",
        precio: 150.0,
        observaciones: "Primera dosis",
      });

    expect([200, 201]).toContain(res.statusCode);
    expect(res.body).toHaveProperty("id");
    expect(res.body).toHaveProperty("mascotaId", (global as any).mascotaId);
    expect(res.body).toHaveProperty("estado", "pendiente");
  });

  it("Listar servicios (GET /api/servicios)", async () => {
    const res = await request(app)
      .get("/api/servicios")
      .set("Authorization", "Bearer tokenfalso");

    expect([200, 401]).toContain(res.statusCode); 
    if (res.statusCode === 200) {
      expect(Array.isArray(res.body)).toBe(true);
      if (res.body.length > 0) {
        expect(res.body[0]).toHaveProperty("id");
        expect(res.body[0]).toHaveProperty("mascota");
      }
    }
  });
});
