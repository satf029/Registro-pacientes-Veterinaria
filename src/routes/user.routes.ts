import { Router } from "express";
import { createUser,
    getUsers, 
    listUsers} from "../controllers/user.controller";
import { verifyToken } from "../middleware/auth";

const router = Router();

router.get('/users',verifyToken,getUsers);
router.post('/users',createUser);
router.get('/users/:id',verifyToken,listUsers)


export default router;