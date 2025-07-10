import { Router } from "express";
//import { generateOrder} from "../controllers/order.controller.js";   
import { authenticateToken } from "../middleware/auth.js";
import { getCustomer, getCustomerAddress, updateCustomer, 
    getCustomerAddressList, createAddress, updateAddress, deleteAddress} from "../controllers/customer.controller.js";   

const router = Router();

//obtiene atributos del customer logueado
router.get("/", authenticateToken, getCustomer);
//actualiza atributos del customer logueado
router.put("/", authenticateToken, updateCustomer);

//---DIRECCIONES---
router.get("/address", authenticateToken, getCustomerAddress);
//----probar---
router.get("/addresses", authenticateToken, getCustomerAddressList);
router.post("/address", authenticateToken, createAddress);
//addressId es el id de la dirección a actualizar
router.put("/address/:addressId", authenticateToken, updateAddress); //pero en este caso debería recibir también el cambio...
router.delete("/address/:addressId", authenticateToken, deleteAddress);


export default router;