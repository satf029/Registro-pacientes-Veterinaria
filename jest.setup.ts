jest.mock("./src/middleware/auth", () => ({
  verifyToken: (req: any, res: any, next: any) => next(), // siempre deja pasar
}));