import { Router } from "express";
import { getProducts, getProductSomeDetailsBySlug, getProductAllDetailsBySlug, checkProductStock, getVariantsBySlug, getProductByKeyword} from "../controllers/product.controller.js";   

const router = Router();

router.get("/", getProducts);
router.get("/get-product-some-details-by-slug/:slug", getProductSomeDetailsBySlug);
router.get("/get-product-all-details-by-slug/:slug", getProductAllDetailsBySlug);
router.get("/get-variants-by-slug/:slug", getVariantsBySlug);
router.post("/check-stock", checkProductStock);
router.post("/get-product-by-keyword", getProductByKeyword);


export default router;