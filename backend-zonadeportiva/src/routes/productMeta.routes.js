import express from 'express';
import { updateProductStockByProdSku } from '../controllers/productMeta.controller.js';

const router = express.Router();

router.patch('/update-product-stock/:sku/:stock', updateProductStockByProdSku);

export default router;
