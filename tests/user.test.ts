import request from "supertest";
import app from "../src/index"; 
import { PrismaClient } from "@prisma/client";
const prisma = new PrismaClient();

describe("Rutas de Usuario", () => {
  beforeAll(async () => {
    await prisma.rol.create({ data: { nombre: "Administrador" } });
  });
  it("Crear usuario, retornar el usuario nuevo", async () => {
    const res = await request(app).post("/api/users").send({
      nombre: "Prueba",
      apellido: "Correcta",
      telefono: "0981000000",
      email: "pruebacorrecta012-565@gmail.com",
      direccion: "Calle falsa 123",
      documento: "65432101216458",
      password: "1234",
    });

    expect(res.statusCode).toBe(201); 
    expect(res.body).toHaveProperty("id");
    expect(res.body).toHaveProperty("persona");
    expect(res.body.persona).toHaveProperty("nombre", "Prueba");
  });

  it("No crear usuario si faltan campos requeridos", async () => {
    const res = await request(app).post("/api/users").send({
      // falta documento, telefono, nombre, etc.
      email: "incompleto@gmail.com",
      password: "1234",
    });

    expect(res.statusCode).toBe(400);
    expect(res.body).toHaveProperty(
      "message",
      "Documento, password, nombre y telefono son requeridos"
    );
  });

  it("Listar todos los usuarios (GET /api/users)", async () => {
    const res = await request(app)
      .get("/api/users")
      .set("Authorization", "Bearer tokenfalso"); // si tenés auth, podés mockear
    expect([200, 401]).toContain(res.statusCode);
  });
});
