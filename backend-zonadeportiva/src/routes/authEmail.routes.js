import { Router } from "express";
import AuthController from "../controllers/authEmail.controller.js";

const router = Router();

// Rutas públicas para recuperación de contraseña
// Para solicitar recuperación de contraseña
router.post("/forgot-password", AuthController.forgotPassword);
// Para cambiar la contraseña con el token enviado por email
router.put("/reset-password", AuthController.resetPassword);

export default router;