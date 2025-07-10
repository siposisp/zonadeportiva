// src/services/linkify.service.js
import dotenv from 'dotenv';
dotenv.config();

const {
  NODE_ENV,
  LINKIFY_USERNAME,
  LINKIFY_PASSWORD,
  LINKIFY_MERCHANT,
  LINKIFY_BANK,
  LINKIFY_WEBHOOK_SECRET,
  LINKIFY_TIMEOUT = 5000
} = process.env;

// ============= MOCKS PARA DESARROLLO =============

function mockCrearPago(payload) {
  return new Promise((resolve) => {
    setTimeout(() => {
      resolve({
        success: true,
        payment_id: `mock_${Date.now()}`,
        invoice_id: payload.invoice_id,
        amount: payload.amount,
        status: 'pending',
        payment_url: `https://linkify.cl/pay/mock_${payload.invoice_id}`,
        created_at: new Date().toISOString(),
        message: 'Pago creado exitosamente (MOCK)'
      });
    }, 1000);
  });
}

function mockConsultarPago(invoiceId) {
  return new Promise((resolve) => {
    setTimeout(() => {
      resolve({
        success: true,
        invoice_id: invoiceId,
        status: Math.random() > 0.5 ? 'paid' : 'pending',
        amount: 15000,
        paid_at: new Date().toISOString(),
        message: 'Consulta exitosa (MOCK)'
      });
    }, 500);
  });
}

function mockCancelarPago(invoiceId) {
  return new Promise((resolve) => {
    setTimeout(() => {
      resolve({
        success: true,
        invoice_id: invoiceId,
        status: 'cancelled',
        cancelled_at: new Date().toISOString(),
        message: 'Pago cancelado exitosamente (MOCK)'
      });
    }, 500);
  });
}

function mockObtenerBancos() {
  return new Promise((resolve) => {
    setTimeout(() => {
      resolve({
        success: true,
        banks: [
          { code: '001', name: 'Banco de Chile' },
          { code: '012', name: 'Banco del Estado' },
          { code: '016', name: 'BancoCredito e Inversiones' },
          { code: '037', name: 'Banco Santander Chile' }
        ],
        message: 'Bancos obtenidos exitosamente (MOCK)'
      });
    }, 300);
  });
}

// ============= FUNCIONES PRINCIPALES =============

export async function crearPagoLinkify(payload) {
  try {
    console.log('[linkify.service] Creando pago...');

    if (NODE_ENV === 'development') {
      return await mockCrearPago(payload);
    }

    // TODO: Implementar con API real cuando tengas credenciales
    throw new Error('Producción no implementada - necesita credenciales reales');

  } catch (err) {
    console.error('[linkify.service] Error creando pago:', err);
    const error = new Error('Error creando pago en Linkify');
    error.details = err;
    throw error;
  }
}

export async function consultarPagoLinkify(invoiceId) {
  try {
    console.log('[linkify.service] Consultando pago:', invoiceId);

    if (NODE_ENV === 'development') {
      return await mockConsultarPago(invoiceId);
    }

    // TODO: Implementar con API real
    throw new Error('Producción no implementada - necesita credenciales reales');

  } catch (err) {
    console.error('[linkify.service] Error consultando pago:', err);
    const error = new Error('Error consultando pago en Linkify');
    error.details = err;
    throw error;
  }
}

export async function cancelarPagoLinkify(invoiceId) {
  try {
    console.log('[linkify.service] Cancelando pago:', invoiceId);

    if (NODE_ENV === 'development') {
      return await mockCancelarPago(invoiceId);
    }

    // TODO: Implementar con API real
    throw new Error('Producción no implementada - necesita credenciales reales');

  } catch (err) {
    console.error('[linkify.service] Error cancelando pago:', err);
    const error = new Error('Error cancelando pago en Linkify');
    error.details = err;
    throw error;
  }
}

export async function obtenerBancosLinkify() {
  try {
    console.log('[linkify.service] Obteniendo bancos...');

    if (NODE_ENV === 'development') {
      return await mockObtenerBancos();
    }

    // TODO: Implementar con API real
    throw new Error('Producción no implementada - necesita credenciales reales');

  } catch (err) {
    console.error('[linkify.service] Error obteniendo bancos:', err);
    const error = new Error('Error obteniendo bancos de Linkify');
    error.details = err;
    throw error;
  }
}

// ============= PROCESAMIENTO DE WEBHOOKS =============

export async function procesarWebhookLinkify(webhookData) {
  try {
    console.log('[linkify.service] Procesando webhook:', webhookData);

    const {
      invoice_id,
      status,
      amount,
      transaction_id,
      payment_method,
      paid_at,
      bank_code,
      customer_email,
      metadata
    } = webhookData;

    // 1. Validar datos del webhook
    if (!invoice_id || !status) {
      throw new Error('Datos incompletos en webhook');
    }

    // 2. Normalizar el estado
    const normalizedStatus = normalizePaymentStatus(status);

    // 3. Crear objeto de pago procesado
    const paymentUpdate = {
      invoice_id,
      status: normalizedStatus,
      amount: amount || null,
      transaction_id: transaction_id || null,
      payment_method: payment_method || null,
      paid_at: paid_at || null,
      bank_code: bank_code || null,
      customer_email: customer_email || null,
      processed_at: new Date().toISOString(),
      webhook_data: webhookData
    };

    // 4. Aquí actualizarías tu base de datos
    await actualizarPagoEnBD(paymentUpdate);

    // 5. Disparar eventos/notificaciones según el estado
    await manejarEventosPago(paymentUpdate);

    console.log('[linkify.service] Webhook procesado exitosamente:', {
      invoice_id,
      status: normalizedStatus
    });

    return {
      success: true,
      invoice_id,
      status: normalizedStatus,
      processed_at: paymentUpdate.processed_at
    };

  } catch (err) {
    console.error('[linkify.service] Error procesando webhook:', err);
    
    // Re-lanzar el error para que el controller lo maneje
    throw new Error(`Error procesando webhook: ${err.message}`);
  }
}

// ============= FUNCIONES AUXILIARES =============

function normalizePaymentStatus(linkifyStatus) {
  // Mapear estados de Linkify a estados internos
  const statusMap = {
    'paid': 'completed',
    'successful': 'completed',
    'completed': 'completed',
    'approved': 'completed',
    'pending': 'pending',
    'waiting': 'pending',
    'processing': 'pending',
    'failed': 'failed',
    'error': 'failed',
    'rejected': 'failed',
    'cancelled': 'cancelled',
    'canceled': 'cancelled',
    'expired': 'expired',
    'timeout': 'expired'
  };

  return statusMap[linkifyStatus.toLowerCase()] || 'unknown';
}

async function actualizarPagoEnBD(paymentUpdate) {
  try {
    // TODO: Implementar actualización en base de datos
    // Ejemplo:
    // await db.payments.update(
    //   { invoice_id: paymentUpdate.invoice_id },
    //   { 
    //     status: paymentUpdate.status,
    //     transaction_id: paymentUpdate.transaction_id,
    //     paid_at: paymentUpdate.paid_at,
    //     updated_at: new Date()
    //   }
    // );

    console.log('[linkify.service] TODO: Actualizar pago en BD:', {
      invoice_id: paymentUpdate.invoice_id,
      status: paymentUpdate.status
    });

  } catch (err) {
    console.error('[linkify.service] Error actualizando BD:', err);
    throw err;
  }
}

async function manejarEventosPago(paymentUpdate) {
  try {
    const { invoice_id, status, customer_email } = paymentUpdate;

    switch (status) {
      case 'completed':
        console.log(`[linkify.service] Pago completado: ${invoice_id}`);
        // TODO: Enviar email de confirmación
        // TODO: Actualizar stock si es necesario
        // TODO: Generar factura
        // TODO: Notificar al frontend vía WebSocket
        await notificarPagoCompletado(paymentUpdate);
        break;

      case 'failed':
        console.log(`[linkify.service] Pago falló: ${invoice_id}`);
        // TODO: Enviar email de error
        // TODO: Liberar stock reservado
        await notificarPagoFallido(paymentUpdate);
        break;

      case 'cancelled':
        console.log(`[linkify.service] Pago cancelado: ${invoice_id}`);
        // TODO: Liberar recursos
        await notificarPagoCancelado(paymentUpdate);
        break;

      default:
        console.log(`[linkify.service] Estado de pago: ${status} para ${invoice_id}`);
    }

  } catch (err) {
    console.error('[linkify.service] Error manejando eventos:', err);
    // No re-lanzar el error para no afectar el procesamiento del webhook
  }
}

async function notificarPagoCompletado(paymentUpdate) {
  // TODO: Implementar notificaciones
  console.log('[linkify.service] TODO: Notificar pago completado');
}

async function notificarPagoFallido(paymentUpdate) {
  // TODO: Implementar notificaciones
  console.log('[linkify.service] TODO: Notificar pago fallido');
}

async function notificarPagoCancelado(paymentUpdate) {
  // TODO: Implementar notificaciones  
  console.log('[linkify.service] TODO: Notificar pago cancelado');
}

// ============= SIMULADOR DE WEBHOOK PARA DESARROLLO =============

export function simularWebhookLinkify(invoiceId, status = 'paid') {
  if (NODE_ENV !== 'development') {
    throw new Error('Simulador solo disponible en desarrollo');
  }

  const webhookData = {
    invoice_id: invoiceId,
    status: status,
    amount: 15000,
    transaction_id: `txn_mock_${Date.now()}`,
    payment_method: 'transfer',
    paid_at: new Date().toISOString(),
    bank_code: '001',
    customer_email: 'test@example.com',
    metadata: {
      source: 'mock',
      test: true
    }
  };

  console.log('[linkify.service] Webhook simulado generado:', webhookData);
  return webhookData;
}