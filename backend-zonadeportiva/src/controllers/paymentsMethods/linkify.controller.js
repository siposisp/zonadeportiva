import { 
  crearPagoLinkify, 
  consultarPagoLinkify, 
  cancelarPagoLinkify, 
  obtenerBancosLinkify,
  procesarWebhookLinkify
} from '../../services/linkify.service.js';
import crypto from 'crypto';

/**
 * @swagger
 * /linkify/crear-pago:
 *   post:
 *     summary: Crear un nuevo pago con Linkify
 *     description: Crea una nueva transacción de pago utilizando el servicio de Linkify
 *     tags:
 *       - Linkify - Pagos
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *             required:
 *               - invoice_type
 *               - invoice_id
 *               - amount
 *               - rut
 *               - email
 *             properties:
 *               invoice_type:
 *                 type: string
 *                 description: Tipo de factura
 *                 example: "boleta"
 *               invoice_id:
 *                 type: string
 *                 description: ID único de la factura
 *                 example: "INV-2024-001"
 *               amount:
 *                 type: number
 *                 description: Monto del pago en pesos chilenos
 *                 example: 15000
 *               description:
 *                 type: string
 *                 description: Descripción del pago
 *                 example: "Pago de servicios"
 *               rut:
 *                 type: string
 *                 description: RUT del pagador
 *                 example: "12345678-9"
 *               email:
 *                 type: string
 *                 format: email
 *                 description: Email del pagador
 *                 example: "cliente@ejemplo.com"
 *               quantity:
 *                 type: number
 *                 description: Cantidad de productos/servicios
 *                 example: 1
 *               extra_data:
 *                 type: object
 *                 description: Datos adicionales
 *                 example: { "referencia": "REF-001" }
 *     responses:
 *       200:
 *         description: Pago creado exitosamente
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 success:
 *                   type: boolean
 *                   example: true
 *                 resultado:
 *                   type: object
 *                   description: Datos del pago creado
 *       400:
 *         description: Datos faltantes o inválidos
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 error:
 *                   type: string
 *                   example: "Faltan datos obligatorios"
 *                 required:
 *                   type: array
 *                   items:
 *                     type: string
 *                   example: ["invoice_type", "invoice_id", "amount", "rut", "email"]
 *                 received:
 *                   type: array
 *                   items:
 *                     type: string
 *                   example: ["invoice_type", "amount"]
 *       500:
 *         description: Error interno del servidor
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 success:
 *                   type: boolean
 *                   example: false
 *                 message:
 *                   type: string
 *                   example: "Error interno del servidor"
 *       502:
 *         description: Error en el servicio de Linkify
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 success:
 *                   type: boolean
 *                   example: false
 *                 message:
 *                   type: string
 *                   example: "Error en el servicio de Linkify"
 */
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

/**
 * @swagger
 * /linkify/consultar-pago/{invoice_id}:
 *   get:
 *     summary: Consultar estado de un pago
 *     description: Obtiene el estado actual de una transacción de pago específica
 *     tags:
 *       - Linkify - Pagos
 *     parameters:
 *       - in: path
 *         name: invoice_id
 *         required: true
 *         description: ID único de la factura a consultar
 *         schema:
 *           type: string
 *           example: "INV-2024-001"
 *     responses:
 *       200:
 *         description: Consulta exitosa
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 success:
 *                   type: boolean
 *                   example: true
 *                 resultado:
 *                   type: object
 *                   description: Datos del estado del pago
 *                   properties:
 *                     status:
 *                       type: string
 *                       example: "completed"
 *                     amount:
 *                       type: number
 *                       example: 15000
 *                     invoice_id:
 *                       type: string
 *                       example: "INV-2024-001"
 *       400:
 *         description: ID de factura requerido
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 error:
 *                   type: string
 *                   example: "invoice_id es requerido en los parámetros"
 *       500:
 *         description: Error interno del servidor
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 success:
 *                   type: boolean
 *                   example: false
 *                 message:
 *                   type: string
 *                   example: "Error interno del servidor"
 *       502:
 *         description: Error en el servicio de Linkify
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 success:
 *                   type: boolean
 *                   example: false
 *                 message:
 *                   type: string
 *                   example: "Error en el servicio de Linkify"
 */
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

/**
 * @swagger
 * /linkify/cancelar-pago/{invoice_id}:
 *   delete:
 *     summary: Cancelar un pago
 *     description: Cancela una transacción de pago específica
 *     tags:
 *       - Linkify - Pagos
 *     parameters:
 *       - in: path
 *         name: invoice_id
 *         required: true
 *         description: ID único de la factura a cancelar
 *         schema:
 *           type: string
 *           example: "INV-2024-001"
 *     responses:
 *       200:
 *         description: Pago cancelado exitosamente
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 success:
 *                   type: boolean
 *                   example: true
 *                 resultado:
 *                   type: object
 *                   description: Datos de la cancelación
 *                   properties:
 *                     status:
 *                       type: string
 *                       example: "cancelled"
 *                     invoice_id:
 *                       type: string
 *                       example: "INV-2024-001"
 *       400:
 *         description: ID de factura requerido
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 error:
 *                   type: string
 *                   example: "invoice_id es requerido en los parámetros"
 *       500:
 *         description: Error interno del servidor
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 success:
 *                   type: boolean
 *                   example: false
 *                 message:
 *                   type: string
 *                   example: "Error interno del servidor"
 *       502:
 *         description: Error en el servicio de Linkify
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 success:
 *                   type: boolean
 *                   example: false
 *                 message:
 *                   type: string
 *                   example: "Error en el servicio de Linkify"
 */
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

/**
 * @swagger
 * /linkify/bancos:
 *   get:
 *     summary: Obtener lista de bancos disponibles
 *     description: Obtiene la lista de bancos disponibles para realizar pagos a través de Linkify
 *     tags:
 *       - Linkify - Configuración
 *     responses:
 *       200:
 *         description: Lista de bancos obtenida exitosamente
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 success:
 *                   type: boolean
 *                   example: true
 *                 resultado:
 *                   type: array
 *                   description: Lista de bancos disponibles
 *                   items:
 *                     type: object
 *                     properties:
 *                       id:
 *                         type: string
 *                         example: "banco_chile"
 *                       nombre:
 *                         type: string
 *                         example: "Banco de Chile"
 *                       logo:
 *                         type: string
 *                         example: "https://example.com/logo.png"
 *                       activo:
 *                         type: boolean
 *                         example: true
 *       500:
 *         description: Error interno del servidor
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 success:
 *                   type: boolean
 *                   example: false
 *                 message:
 *                   type: string
 *                   example: "Error interno del servidor"
 *       502:
 *         description: Error en el servicio de Linkify
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 success:
 *                   type: boolean
 *                   example: false
 *                 message:
 *                   type: string
 *                   example: "Error en el servicio de Linkify"
 */
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

/**
 * @swagger
 * /linkify/webhook:
 *   post:
 *     summary: Webhook para notificaciones de Linkify
 *     description: Endpoint para recibir notificaciones de cambios de estado de pagos desde Linkify
 *     tags:
 *       - Linkify - Webhook
 *     security:
 *       - LinkifyWebhookSignature: []
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *             required:
 *               - invoice_id
 *             properties:
 *               invoice_id:
 *                 type: string
 *                 description: ID único de la factura
 *                 example: "INV-2024-001"
 *               status:
 *                 type: string
 *                 description: Nuevo estado del pago
 *                 enum: ["pending", "completed", "failed", "cancelled"]
 *                 example: "completed"
 *               amount:
 *                 type: number
 *                 description: Monto del pago
 *                 example: 15000
 *               transaction_id:
 *                 type: string
 *                 description: ID de la transacción en Linkify
 *                 example: "TXN-123456"
 *               payment_method:
 *                 type: string
 *                 description: Método de pago utilizado
 *                 example: "bank_transfer"
 *               timestamp:
 *                 type: string
 *                 format: date-time
 *                 description: Fecha y hora del evento
 *                 example: "2024-01-15T10:30:00Z"
 *     responses:
 *       200:
 *         description: Webhook procesado exitosamente
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 received:
 *                   type: boolean
 *                   example: true
 *                 processed:
 *                   type: boolean
 *                   example: true
 *                 invoice_id:
 *                   type: string
 *                   example: "INV-2024-001"
 *                 timestamp:
 *                   type: string
 *                   format: date-time
 *                   example: "2024-01-15T10:30:00.000Z"
 *       400:
 *         description: Datos requeridos faltantes
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 error:
 *                   type: string
 *                   example: "invoice_id requerido en webhook"
 *       401:
 *         description: Firma de webhook inválida
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 error:
 *                   type: string
 *                   example: "Unauthorized webhook"
 */
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

/**
 * @swagger
 * /linkify/config:
 *   get:
 *     summary: Obtener configuración de Linkify
 *     description: Obtiene la configuración actual del servicio de Linkify
 *     tags:
 *       - Linkify - Configuración
 *     responses:
 *       200:
 *         description: Configuración obtenida exitosamente
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 success:
 *                   type: boolean
 *                   example: true
 *                 config:
 *                   type: object
 *                   properties:
 *                     environment:
 *                       type: string
 *                       description: Entorno actual
 *                       example: "development"
 *                     isMockMode:
 *                       type: boolean
 *                       description: Si está en modo mock
 *                       example: true
 *                     webhookUrl:
 *                       type: string
 *                       description: URL del webhook
 *                       example: "https://api.ejemplo.com/linkify/webhook"
 *                     version:
 *                       type: string
 *                       description: Versión del servicio
 *                       example: "1.0.0"
 *       500:
 *         description: Error interno del servidor
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 success:
 *                   type: boolean
 *                   example: false
 *                 message:
 *                   type: string
 *                   example: "Error interno del servidor"
 */
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

/**
 * @swagger
 * components:
 *   securitySchemes:
 *     LinkifyWebhookSignature:
 *       type: apiKey
 *       in: header
 *       name: x-linkify-signature
 *       description: Firma HMAC SHA-256 del webhook de Linkify
 */