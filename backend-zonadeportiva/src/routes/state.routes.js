import { Router } from "express";
import { getStates } from "../controllers/state.controller.js";

const router = Router();

router.get("/get-states/", getStates);

export default router;