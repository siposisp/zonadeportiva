import { Router } from "express";
import { getCategories, getGroupedCategories, getProductsByCategories} from "../controllers/category.controller.js";   

const router = Router();

router.get("/", getCategories);
router.get("/get-grouped-categories/", getGroupedCategories);
router.post("/products-by-categories", getProductsByCategories);

export default router;