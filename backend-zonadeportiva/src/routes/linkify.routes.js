// src/routes/linkify.routes.js
import express from 'express';
import { 
  handleCrearPago,
  handleConsultarPago,
  handleCancelarPago,
  handleObtenerBancos,
  handleWebhook,
  handleConfig
} from '../controllers/paymentsMethods/linkify.controller.js';

const router = express.Router();

// ============= RUTAS PRINCIPALES =============

// Rutas para pagos
router.post('/crear-pago', handleCrearPago);
router.get('/consultar-pago/:invoice_id', handleConsultarPago);
router.delete('/cancelar-pago/:invoice_id', handleCancelarPago);

// Rutas para información
router.get('/bancos', handleObtenerBancos);
router.get('/config', handleConfig);

// ============= WEBHOOK =============

// IMPORTANTE: Esta ruta debe estar sin autenticación
// porque Linkify la llamará directamente
router.post('/webhook', handleWebhook);

// ============= RUTAS DE DESARROLLO =============

// Solo para testing en desarrollo
if (process.env.NODE_ENV === 'development') {
  // Ruta para simular webhooks manualmente
  router.post('/test-webhook/:invoice_id', async (req, res) => {
    try {
      const { invoice_id } = req.params;
      const { status = 'paid' } = req.body;
      
      const { simularWebhookLinkify } = await import('../services/linkify.service.js');
      const webhookData = simularWebhookLinkify(invoice_id, status);
      
      // Simular el webhook llamando a nuestro propio endpoint
      const webhookResponse = await fetch(`${req.protocol}://${req.get('host')}/linkify/webhook`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'X-Test-Webhook': 'true'
        },
        body: JSON.stringify(webhookData)
      });

      const result = await webhookResponse.json();
      
      res.json({
        success: true,
        message: 'Webhook simulado enviado',
        webhook_data: webhookData,
        webhook_response: result
      });

    } catch (err) {
      console.error('[test-webhook]', err);
      res.status(500).json({
        success: false,
        message: 'Error simulando webhook',
        error: err.message
      });
    }
  });

  // Ruta para ver el estado actual de todos los pagos mock
  router.get('/mock-status', (req, res) => {
    res.json({
      success: true,
      message: 'Modo desarrollo activo',
      environment: process.env.NODE_ENV,
      webhook_url: `${req.protocol}://${req.get('host')}/linkify/webhook`,
      test_webhook_url: `${req.protocol}://${req.get('host')}/linkify/test-webhook/{invoice_id}`,
      available_test_statuses: [
        'paid', 'pending', 'failed', 'cancelled', 'expired'
      ]
    });
  });
}

export default router;
