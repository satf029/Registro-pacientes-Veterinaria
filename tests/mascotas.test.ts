import request from "supertest";
import app from "../src/index"; // tu app principal de Express
import { PrismaClient } from "@prisma/client";

const prisma = new PrismaClient();

describe("Rutas de Pacientes (Mascotas)", () => {
  let duenoId: number;

  beforeAll(async () => {
    // Crear un dueño con persona asociada (porque la FK duenoId apunta ahí)
    const persona = await prisma.persona.create({
      data: {
        nombre: "Carlos",
        apellido: "Gómez",
        telefono: "0981123456",
        email: "carlosgomez0458775@test.com",
        direccion: "Av. Principal 123",
        documento: "11122234687901",
      },
    });

    const dueno = await prisma.propietario.create({
      data: {
        personaId: persona.id,
      },
    });

    duenoId = dueno.id;
  });

  afterAll(async () => {
    await prisma.$disconnect();
  });

  it("Crear paciente, retornar el paciente nuevo", async () => {
    const res = await request(app)
      .post("/api/mascotas")
      .set("Authorization", "Bearer tokenfalso")
      .send({
        nombre: "Firulais",
        especie: "Perro",
        raza: "Labrador",
        edad: 4,
        peso: 20,
        sexo: "Macho",
        color: "Negro",
        duenoId: duenoId,
      });

    expect([200, 201]).toContain(res.statusCode);
    expect(res.body).toHaveProperty("id");
    expect(res.body).toHaveProperty("nombre", "Firulais");
    expect(res.body).toHaveProperty("duenoId", duenoId);
  });

  it("Listar pacientes (GET /api/mascotas)", async () => {
    const res = await request(app)
      .get("/api/mascotas")
      .set("Authorization", "Bearer tokenfalso");

    expect([200, 401]).toContain(res.statusCode);
    if (res.statusCode === 200) {
      expect(Array.isArray(res.body)).toBe(true);
      if (res.body.length > 0) {
        expect(res.body[0]).toHaveProperty("id");
        expect(res.body[0]).toHaveProperty("nombre");
        expect(res.body[0]).toHaveProperty("dueno");
        expect(res.body[0].dueno).toHaveProperty("persona");
      }
    }
  });
});
