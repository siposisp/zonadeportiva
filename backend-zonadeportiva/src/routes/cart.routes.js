import { Router } from "express"
import cartController from "../controllers/cart.controller.js"
import { authenticateToken, optionalAuth } from "../middleware/auth.js"

const router = Router()

// Usuario registrado
router.post("/", authenticateToken, cartController.createCart)
router.get("/", authenticateToken, cartController.getCart)
router.post("/validate-cart", authenticateToken, cartController.validateCart)
router.post("/add-to-cart", optionalAuth, cartController.addToCart)
router.post("/remove-from-cart", optionalAuth, cartController.removeFromCart)
router.post("/sync-cart", authenticateToken, cartController.syncCart)

// Mover a rutas de productos
router.get("/:id", cartController.getProductById)

//TODO: Implementar cotización de productos
// front envía lista de productos y sus cantidades, detalles del cliente y # de cotización

export default router