import { Router } from "express";
import { obtenerClima } from "../controllers/weather.controller";
import { verifyToken } from "../middleware/auth";


const route = Router();

route.get("/clima",  obtenerClima);

export default route;