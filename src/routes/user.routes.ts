import { Router } from "express";
import { createUser,
    getUsers, 
    listUsers,
    updateUser} from "../controllers/user.controller";
import { verifyToken } from "../middleware/auth";

const router = Router();

router.get('/users',verifyToken,getUsers);
router.post('/users',createUser);
router.get('/users/:id',verifyToken,listUsers)
router.put('/users/:id', updateUser);



export default router;