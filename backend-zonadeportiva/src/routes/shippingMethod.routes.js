import { Router } from "express";
import { getShippingMethods } from "../controllers/shippingMethod.controller.js";

const router = Router();

router.get("/get-shipping-methods/:city_id", getShippingMethods);

export default router;