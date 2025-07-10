import express from 'express';
import { getPaymentProviders } from '../controllers/paymentProvider.controller.js';
import { authenticateToken } from "../middleware/auth.js";

const router = express.Router();

router.get('/', authenticateToken, getPaymentProviders);

export default router;