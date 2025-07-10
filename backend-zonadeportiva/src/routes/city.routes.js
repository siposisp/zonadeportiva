import { Router } from "express";
import { getCities, getCitiesByStateId } from "../controllers/city.controller.js";

const router = Router();

router.get("/get-cities/", getCities);
router.get("/get-cities-by-state/:state_id", getCitiesByStateId);

export default router;