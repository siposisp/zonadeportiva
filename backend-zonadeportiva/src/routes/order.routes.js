import { Router } from "express";
import { generateOrder} from "../controllers/order.controller.js";   
import { authenticateToken, optionalAuth } from "../middleware/auth.js";

const router = Router();

router.post("/generate-order", optionalAuth, generateOrder);


export default router;