import { Router } from "express";
import { login } from "../controllers/auth.controller";

const router = Router();

router.use("/login", login );


export default router;