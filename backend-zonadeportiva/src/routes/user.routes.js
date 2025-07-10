import { Router } from "express";
import { 
  registerUser, 
  registerGuestCustomer, 
  loginUser,  
  verifyToken, 
  logoutUser,
  refreshToken,
  setPassword,
  resetPassword
} from "../controllers/user.controller.js";
import { authenticateToken, optionalAuth} from "../middleware/auth.js";

const router = Router();

// Rutas públicas (no requieren autenticación)
router.post("/register", registerUser);
router.post("/register-guest", registerGuestCustomer);
router.post("/login", loginUser);

// Rutas protegidas (requieren autenticación)
router.get("/verify-token", optionalAuth, verifyToken);
router.post("/logout", authenticateToken, logoutUser);
router.post("/refresh-token", authenticateToken, refreshToken);

// Ruta para cambiar la contraseña con TOKEN
router.put("/reset-password", resetPassword);

export default router;