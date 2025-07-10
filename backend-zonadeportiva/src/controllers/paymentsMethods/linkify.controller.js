// src/controllers/paymentsMethods/linkify.controller.js
import { 
  crearPagoLinkify, 
  consultarPagoLinkify, 
  cancelarPagoLinkify, 
  obtenerBancosLinkify,
  procesarWebhookLinkify
} from '../../services/linkify.service.js';
import crypto from 'crypto';

// ============= CREAR PAGO =============
export async function handleCrearPago(req, res) {
  try {
    if (!req.body) {
      return res.status(400).json({ 
        error: 'No se recibieron datos en el body' 
      });
    }

    const {
      invoice_type,
      invoice_id,
      amount,
      description,
      rut,
      email,
      quantity,
      extra_data
    } = req.body;

    if (!invoice_type || !invoice_id || !amount || !rut || !email) {
      return res.status(400).json({ 
        error: 'Faltan datos obligatorios',
        required: ['invoice_type', 'invoice_id', 'amount', 'rut', 'email'],
        received: Object.keys(req.body)
      });
    }

    const resultado = await crearPagoLinkify({
      invoice_type,
      invoice_id,
      amount,
      description,
      rut,
      email,
      quantity,
      extra_data
    });

    return res.json({ success: true, resultado });
  } catch (err) {
    console.error('[linkify.controller]', err);
    const status = err.details ? 502 : 500;
    return res.status(status).json({ success: false, message: err.message });
  }
}

// ============= CONSULTAR PAGO =============
export async function handleConsultarPago(req, res) {
  try {
    const { invoice_id } = req.params;

    if (!invoice_id) {
      return res.status(400).json({ 
        error: 'invoice_id es requerido en los parámetros' 
      });
    }

    const resultado = await consultarPagoLinkify(invoice_id);
    return res.json({ success: true, resultado });

  } catch (err) {
    console.error('[linkify.controller] Error consultando pago:', err);
    const status = err.details ? 502 : 500;
    return res.status(status).json({ success: false, message: err.message });
  }
}

// ============= CANCELAR PAGO =============
export async function handleCancelarPago(req, res) {
  try {
    const { invoice_id } = req.params;

    if (!invoice_id) {
      return res.status(400).json({ 
        error: 'invoice_id es requerido en los parámetros' 
      });
    }

    const resultado = await cancelarPagoLinkify(invoice_id);
    return res.json({ success: true, resultado });

  } catch (err) {
    console.error('[linkify.controller] Error cancelando pago:', err);
    const status = err.details ? 502 : 500;
    return res.status(status).json({ success: false, message: err.message });
  }
}

// ============= OBTENER BANCOS =============
export async function handleObtenerBancos(req, res) {
  try {
    const resultado = await obtenerBancosLinkify();
    return res.json({ success: true, resultado });

  } catch (err) {
    console.error('[linkify.controller] Error obteniendo bancos:', err);
    const status = err.details ? 502 : 500;
    return res.status(status).json({ success: false, message: err.message });
  }
}

// ============= WEBHOOK HANDLER =============
export async function handleWebhook(req, res) {
  try {
    console.log('[linkify.webhook] Webhook recibido:', {
      headers: req.headers,
      body: req.body,
      timestamp: new Date().toISOString()
    });

    // 1. Validar que el webhook venga de Linkify
    if (!validarWebhookSignature(req)) {
      console.error('[linkify.webhook] Firma de webhook inválida');
      return res.status(401).json({ 
        error: 'Unauthorized webhook' 
      });
    }

    // 2. Extraer datos del webhook
    const webhookData = req.body;
    
    if (!webhookData.invoice_id) {
      return res.status(400).json({ 
        error: 'invoice_id requerido en webhook' 
      });
    }

    // 3. Procesar el webhook
    const resultado = await procesarWebhookLinkify(webhookData);

    // 4. Responder rápidamente a Linkify (muy importante!)
    res.status(200).json({ 
      received: true, 
      processed: true,
      invoice_id: webhookData.invoice_id,
      timestamp: new Date().toISOString()
    });

    // 5. Log para debugging
    console.log('[linkify.webhook] Webhook procesado exitosamente:', {
      invoice_id: webhookData.invoice_id,
      status: webhookData.status,
      resultado
    });

  } catch (err) {
    console.error('[linkify.webhook] Error procesando webhook:', err);
    
    // IMPORTANTE: Siempre responder con 200 a Linkify para evitar reenvíos
    // Pero loggear el error para debugging interno
    res.status(200).json({ 
      received: true, 
      processed: false,
      error: 'Internal processing error',
      timestamp: new Date().toISOString()
    });
  }
}

// ============= VALIDACIÓN DE WEBHOOK =============
function validarWebhookSignature(req) {
  try {
    const { LINKIFY_WEBHOOK_SECRET } = process.env;
    
    // En desarrollo, saltamos la validación
    if (process.env.NODE_ENV === 'development') {
      console.log('[linkify.webhook] Saltando validación en desarrollo');
      return true;
    }

    if (!LINKIFY_WEBHOOK_SECRET) {
      console.error('[linkify.webhook] LINKIFY_WEBHOOK_SECRET no configurado');
      return false;
    }

    // Obtener la firma del header
    const signature = req.headers['x-linkify-signature'] || req.headers['linkify-signature'];
    
    if (!signature) {
      console.error('[linkify.webhook] No se encontró firma en headers');
      return false;
    }

    // Calcular la firma esperada
    const payload = JSON.stringify(req.body);
    const expectedSignature = crypto
      .createHmac('sha256', LINKIFY_WEBHOOK_SECRET)
      .update(payload)
      .digest('hex');

    // Comparar firmas de forma segura
    const receivedSignature = signature.replace('sha256=', '');
    const isValid = crypto.timingSafeEqual(
      Buffer.from(expectedSignature, 'hex'),
      Buffer.from(receivedSignature, 'hex')
    );

    if (!isValid) {
      console.error('[linkify.webhook] Firmas no coinciden:', {
        received: receivedSignature,
        expected: expectedSignature
      });
    }

    return isValid;

  } catch (err) {
    console.error('[linkify.webhook] Error validando firma:', err);
    return false;
  }
}

// ============= ENDPOINT DE CONFIGURACIÓN =============
export async function handleConfig(req, res) {
  try {
    const config = {
      environment: process.env.NODE_ENV || 'development',
      isMockMode: process.env.NODE_ENV === 'development',
      webhookUrl: `${req.protocol}://${req.get('host')}/linkify/webhook`,
      version: '1.0.0'
    };

    return res.json({ success: true, config });

  } catch (err) {
    console.error('[linkify.controller] Error obteniendo config:', err);
    return res.status(500).json({ success: false, message: err.message });
  }
}