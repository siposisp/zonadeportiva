import express from 'express';
import { getAllProducts, getAllStocks, updateAllStocks, handleBsaleWebhook, getVariant, postDecreaseStock, generarBoleta } from '../controllers/bsale.controller.js';

const router = express.Router();

router.get('/productos/', getAllProducts);
router.get('/get-all-stocks/', getAllStocks);
router.get('/update-all-stocks/', updateAllStocks);
router.get('/get-variant/:sku', getVariant);
router.post('/decrease-stock/:sku/:quantity', postDecreaseStock);
router.get('/boleta/', generarBoleta)


router.post('/handle-bsale-webhook/', handleBsaleWebhook);


export default router;
