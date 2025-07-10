import express from 'express';
//import { WebpayPlus } from 'transbank-sdk';
import pkg from 'transbank-sdk';
const { Options, IntegrationApiKeys, Environment, IntegrationCommerceCodes, WebpayPlus } = pkg;
import { createTransaction, commitTransaction } from '../controllers/paymentsMethods/webpay.controller.js';
import { optionalAuth} from "../middleware/auth.js";



const router = express.Router();

// Configuración del SDK para ambiente de integración
const tx = new WebpayPlus.Transaction(
  new Options(IntegrationCommerceCodes.WEBPAY_PLUS, IntegrationApiKeys.WEBPAY, Environment.Integration)
);


router.post('/create', optionalAuth, createTransaction);
router.get('/return', optionalAuth, commitTransaction);
router.post('/return', optionalAuth, commitTransaction); 


export default router;












/*
---------------------------Prueba-----------------------------

// Crear una transacción
router.post('/create', async (req, res) => {
  const { buyOrder, sessionId, amount, returnUrl } = req.body;

  try {
    const response = await tx.create(buyOrder, sessionId, amount, returnUrl);
    res.json(response);
  } catch (error) {
    res.status(500).json({ message: 'Error creando transacción', error });
  }
});

// Confirmar (commit) una transacción
router.post('/commit', async (req, res) => {
  const { token } = req.body;

  try {
    const response = await tx.commit(token);
    res.json(response);
  } catch (error) {
    res.status(500).json({ message: 'Error confirmando transacción', error });
  }
});


// Confirmación automática vía returnUrl
router.get('/return', async (req, res) => {
  const token = req.query.token_ws;

  try {
    const response = await tx.commit(token);
    res.send(`
      <h1>Operación</h1>
      <pre>${JSON.stringify(response, null, 2)}</pre>
    `);
  } catch (error) {
    console.error('Error en /webpay/return:', error);
    res.status(500).send('Error al confirmar la transacción');
  }
});


*/
