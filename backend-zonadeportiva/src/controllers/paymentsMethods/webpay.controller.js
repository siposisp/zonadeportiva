import { pool } from '../../../database/connectionPostgreSQL.js';
import pkg from 'transbank-sdk'
import OrderEmailService from '../../services/email/orderEmail.service.js';
import { decreaseStock, generarYEnviarBoleta } from '../../services/bsale.service.js';
import {getSkuByProductId} from '../../services/productMeta.service.js';

import dotenv from 'dotenv';
dotenv.config();

const { Options, IntegrationApiKeys, Environment, IntegrationCommerceCodes, WebpayPlus } = pkg;

/**
 * @swagger
 * components:
 *   schemas:
 *     WebpayCreateRequest:
 *       type: object
 *       required:
 *         - buyOrder
 *         - amount
 *         - returnUrl
 *       properties:
 *         buyOrder:
 *           type: string
 *           description: Identificador único de la orden de compra
 *           example: "ORDER-12345"
 *         amount:
 *           type: number
 *           description: Monto total de la transacción en pesos chilenos
 *           example: 25000
 *         returnUrl:
 *           type: string
 *           format: uri
 *           description: URL de retorno después del pago
 *           example: "https://mitienda.com/webpay/return"
 *     
 *     WebpayCreateResponse:
 *       type: object
 *       properties:
 *         token:
 *           type: string
 *           description: Token de la transacción generado por Webpay
 *           example: "01ab23cd45ef67890123456789abcdef"
 *         url:
 *           type: string
 *           format: uri
 *           description: URL de redirección para completar el pago
 *           example: "https://webpay3gint.transbank.cl/webpayserver/initTransaction"
 *     
 *     WebpayCommitResponse:
 *       type: object
 *       properties:
 *         status:
 *           type: string
 *           enum: [success, failure, canceled]
 *           description: Estado de la transacción
 *           example: "success"
 *         data:
 *           type: object
 *           properties:
 *             vci:
 *               type: string
 *               description: Resultado de la validación de la tarjeta
 *               example: "TSY"
 *             amount:
 *               type: number
 *               description: Monto de la transacción
 *               example: 25000
 *             status:
 *               type: string
 *               description: Estado de la transacción en Webpay
 *               example: "AUTHORIZED"
 *             buy_order:
 *               type: string
 *               description: Orden de compra
 *               example: "ORDER-12345"
 *             session_id:
 *               type: string
 *               description: ID de sesión generado
 *               example: "U-123-1642089600000"
 *             card_detail:
 *               type: object
 *               properties:
 *                 card_number:
 *                   type: string
 *                   description: Últimos 4 dígitos de la tarjeta
 *                   example: "1234"
 *             accounting_date:
 *               type: string
 *               description: Fecha contable
 *               example: "0125"
 *             transaction_date:
 *               type: string
 *               format: date-time
 *               description: Fecha y hora de la transacción
 *               example: "2025-01-25T14:30:00Z"
 *             authorization_code:
 *               type: string
 *               description: Código de autorización
 *               example: "123456"
 *             payment_type_code:
 *               type: string
 *               description: Código del tipo de pago
 *               example: "VN"
 *             response_code:
 *               type: number
 *               description: Código de respuesta
 *               example: 0
 *             installments_number:
 *               type: number
 *               description: Número de cuotas
 *               example: 0
 *     
 *     ErrorResponse:
 *       type: object
 *       properties:
 *         status:
 *           type: string
 *           example: "failure"
 *         message:
 *           type: string
 *           description: Mensaje de error descriptivo
 *           example: "Faltan datos requeridos: buyOrder, amount y/o returnUrl"
 *         error:
 *           type: object
 *           properties:
 *             name:
 *               type: string
 *               description: Nombre del error
 *               example: "ValidationError"
 *             message:
 *               type: string
 *               description: Mensaje detallado del error
 *               example: "Invalid parameter format"
 *             response:
 *               type: object
 *               description: Respuesta del sistema de Transbank si está disponible
 *   
 *   securitySchemes:
 *     BearerAuth:
 *       type: http
 *       scheme: bearer
 *       bearerFormat: JWT
 *       description: Token JWT opcional para usuarios autenticados
 */

// Configuración Webpay para pruebas de integración
const tx = new WebpayPlus.Transaction(
  new Options(
    IntegrationCommerceCodes.WEBPAY_PLUS,
    IntegrationApiKeys.WEBPAY,
    Environment.Integration
  )
);

// Para producción
// Descomentar las siguientes líneas para usar en producción
/*
const COMMERCE_CODE = process.env.COMMERCE_CODE;
const API_KEY = process.env.API_KEY;

// Configuración Webpay para producción
const tx = WebpayPlus.Transaction.buildForProduction(
  COMMERCE_CODE,
  API_KEY
);
*/

/**
 * @swagger
 * /webpay/create:
 *   post:
 *     summary: Crear una transacción de pago con Webpay
 *     description: |
 *       Crea una nueva transacción de pago utilizando el servicio Webpay Plus de Transbank.
 *       Esta función puede ser utilizada tanto por usuarios autenticados como por invitados.
 *       
 *       **Funcionamiento:**
 *       - Valida que se proporcionen todos los datos requeridos
 *       - Genera un session_id único basado en si el usuario está autenticado o no
 *       - Crea la transacción en Webpay y retorna el token y URL de redirección
 *       
 *       **Tipos de sesión:**
 *       - Usuario autenticado: `U-{user_id}-{timestamp}`
 *       - Usuario invitado: `G-{timestamp}`
 *     tags:
 *       - Webpay
 *     security:
 *       - BearerAuth: []
 *       - {}
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             $ref: '#/components/schemas/WebpayCreateRequest'
 *           examples:
 *             ejemplo_basico:
 *               summary: Transacción básica
 *               value:
 *                 buyOrder: "ORDER-12345"
 *                 amount: 25000
 *                 returnUrl: "https://mitienda.com/webpay/return"
 *             ejemplo_monto_alto:
 *               summary: Transacción de monto alto
 *               value:
 *                 buyOrder: "ORDER-67890"
 *                 amount: 150000
 *                 returnUrl: "https://mitienda.com/webpay/return"
 *     responses:
 *       200:
 *         description: Transacción creada exitosamente
 *         content:
 *           application/json:
 *             schema:
 *               $ref: '#/components/schemas/WebpayCreateResponse'
 *             examples:
 *               success:
 *                 summary: Respuesta exitosa
 *                 value:
 *                   token: "01ab23cd45ef67890123456789abcdef"
 *                   url: "https://webpay3gint.transbank.cl/webpayserver/initTransaction"
 *       400:
 *         description: Datos de entrada inválidos o faltantes
 *         content:
 *           application/json:
 *             schema:
 *               $ref: '#/components/schemas/ErrorResponse'
 *             examples:
 *               missing_data:
 *                 summary: Datos faltantes
 *                 value:
 *                   status: "failure"
 *                   message: "Faltan datos requeridos: buyOrder, amount y/o returnUrl"
 *       500:
 *         description: Error interno del servidor o de Webpay
 *         content:
 *           application/json:
 *             schema:
 *               $ref: '#/components/schemas/ErrorResponse'
 *             examples:
 *               webpay_error:
 *                 summary: Error de Webpay
 *                 value:
 *                   status: "failure"
 *                   message: "Error creando transacción"
 *                   error:
 *                     name: "TransbankError"
 *                     message: "Invalid commerce code"
 *                     response: "Commerce code not found"
 */
export const createTransaction = async (req, res) => {
  const { buyOrder, amount, returnUrl } = req.body;
  const isAuthenticated = !!req.user;
  //console.log("Intentando crear con:", process.env.COMMERCE_CODE, process.env.API_KEY?.substring(0, 4));


  if (!buyOrder || !amount || !returnUrl) {
    return res.status(400).json({
      status: 'failure',
      message: 'Faltan datos requeridos: buyOrder, amount y/o returnUrl'
    });
  }

  let sessionId = null


  if (isAuthenticated){
    sessionId = `U-${req.user.id}-${Date.now()}`;
  } else {
    sessionId = `G-${Date.now()}`;
  }

  try {
    const response = await tx.create(buyOrder, sessionId, amount, returnUrl)
    res.json(response)

  } catch (error) {
    console.error("Error detallado de Webpay:", error);
    res.status(500).json({ 
      message: 'Error creando transacción', 
      error: {
        name: error.name,
        message: error.message,
        response: error.response // <- si existe, contiene el mensaje de Transbank
      }
    });
  }

};

// Utilidad para formatear la fecha al estilo: 9 de abril de 2025
const formatDate = (dateStr) => {
  const date = new Date(dateStr);
  return date.toLocaleDateString('es-CL', {
    day: 'numeric',
    month: 'long',
    year: 'numeric'
  });
};

/**
 * @swagger
 * /webpay/return:
 *   get:
 *     summary: Confirmar transacción de pago (GET)
 *     description: |
 *       Confirma y procesa una transacción de pago cuando el usuario regresa desde Webpay.
 *       Esta es la URL de retorno configurada en la creación de la transacción.
 *       
 *       **Proceso completo:**
 *       1. Confirma la transacción con Webpay usando el token
 *       2. Registra la transacción en la base de datos
 *       3. Actualiza el estado de la orden a "processing"
 *       4. Obtiene datos del cliente y productos
 *       5. Genera y envía boleta electrónica
 *       6. Envía correo de confirmación al administrador
 *       7. Decrementa el stock en Bsale en segundo plano
 *       
 *       **Importante:** Esta función maneja tanto usuarios autenticados como invitados.
 *     tags:
 *       - Webpay
 *     security:
 *       - BearerAuth: []
 *       - {}
 *     parameters:
 *       - name: token_ws
 *         in: query
 *         required: true
 *         description: Token de transacción proporcionado por Webpay
 *         schema:
 *           type: string
 *           example: "01ab23cd45ef67890123456789abcdef"
 *     responses:
 *       200:
 *         description: Transacción confirmada y procesada exitosamente
 *         content:
 *           application/json:
 *             schema:
 *               $ref: '#/components/schemas/WebpayCommitResponse'
 *             examples:
 *               success:
 *                 summary: Transacción exitosa
 *                 value:
 *                   status: "success"
 *                   data:
 *                     vci: "TSY"
 *                     amount: 25000
 *                     status: "AUTHORIZED"
 *                     buy_order: "ORDER-12345"
 *                     session_id: "U-123-1642089600000"
 *                     card_detail:
 *                       card_number: "1234"
 *                     accounting_date: "0125"
 *                     transaction_date: "2025-01-25T14:30:00Z"
 *                     authorization_code: "123456"
 *                     payment_type_code: "VN"
 *                     response_code: 0
 *                     installments_number: 0
 *       400:
 *         description: Token faltante o inválido
 *         content:
 *           application/json:
 *             schema:
 *               $ref: '#/components/schemas/ErrorResponse'
 *             examples:
 *               missing_token:
 *                 summary: Token faltante
 *                 value:
 *                   status: "canceled"
 *       500:
 *         description: Error interno durante el procesamiento
 *         content:
 *           application/json:
 *             schema:
 *               $ref: '#/components/schemas/ErrorResponse'
 *             examples:
 *               processing_error:
 *                 summary: Error de procesamiento
 *                 value:
 *                   status: "failure"
 *                   error: "Error al procesar la transacción"
 *   
 *   post:
 *     summary: Confirmar transacción de pago (POST)
 *     description: |
 *       Método alternativo para confirmar transacciones de pago. Funciona de manera idéntica
 *       al método GET, pero acepta el token en el cuerpo de la petición o como parámetro de consulta.
 *       
 *       **Funcionalidad idéntica al GET:**
 *       - Misma lógica de confirmación y procesamiento
 *       - Mismo flujo de trabajo completo
 *       - Mismas validaciones y respuestas
 *       
 *       **Casos de uso:**
 *       - Webhooks de Webpay
 *       - Integraciones que requieren POST
 *       - Sistemas que prefieren enviar datos en el cuerpo
 *     tags:
 *       - Webpay
 *     security:
 *       - BearerAuth: []
 *       - {}
 *     parameters:
 *       - name: token_ws
 *         in: query
 *         required: true
 *         description: Token de transacción proporcionado por Webpay
 *         schema:
 *           type: string
 *           example: "01ab23cd45ef67890123456789abcdef"
 *     requestBody:
 *       required: false
 *       description: Datos opcionales adicionales (el token se lee principalmente del query parameter)
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *             properties:
 *               token_ws:
 *                 type: string
 *                 description: Token alternativo si no se envía en query parameter
 *                 example: "01ab23cd45ef67890123456789abcdef"
 *     responses:
 *       200:
 *         description: Transacción confirmada y procesada exitosamente
 *         content:
 *           application/json:
 *             schema:
 *               $ref: '#/components/schemas/WebpayCommitResponse'
 *       400:
 *         description: Token faltante o inválido
 *         content:
 *           application/json:
 *             schema:
 *               $ref: '#/components/schemas/ErrorResponse'
 *       500:
 *         description: Error interno durante el procesamiento
 *         content:
 *           application/json:
 *             schema:
 *               $ref: '#/components/schemas/ErrorResponse'
 */
export const commitTransaction = async (req, res) => {
  const token = req.query.token_ws;
  if (!token) return res.status(400).json({ status: 'canceled' });

  try {
    const result = await tx.commit(token);

    const {
      vci,
      amount,
      status,
      buy_order: buyOrder,
      session_id: sessionId,
      card_detail: { card_number },
      accounting_date,
      transaction_date,
      authorization_code,
      payment_type_code,
      response_code,
      installments_number
    } = result;

    // 1. Registrar transacción Webpay
    await pool.query(
      `INSERT INTO webpay_transactions(
        vci, amount, status, buy_order, session_id, card_last_numbers,
        accounting_date, transaction_date, authorization_code,
        payment_type_code, response_code, installments_number, payment_id
      ) VALUES ($1,$2,$3,$4,$5,$6,$7,$8,$9,$10,$11,$12,$13)`,
      [
        vci, amount, status, buyOrder, sessionId, card_number,
        accounting_date, transaction_date, authorization_code,
        payment_type_code, response_code, installments_number, 1
      ]
    );

    // 2. Actualizar estado de la orden
    await pool.query(
      `UPDATE orders SET status = $1 WHERE id = $2`,
      ['processing', buyOrder]
    );

    // 3. Obtener datos del cliente y de la orden
    // COALESCE(u.email, c.email) toma el email de users si existe, o el de customers si no hay usuario registrado.
    const { rows: orderRows } = await pool.query(
      `SELECT o.total, o.subtotal, o.shipping_cost, o.order_date,
       COALESCE(u.email, c.email) AS email,
       c.first_name, c.last_name, o.address_id, c.rut
        FROM orders o
        JOIN customers c ON o.customer_id = c.id
        LEFT JOIN users u ON c.user_id = u.id
        WHERE o.id = $1`,
      [buyOrder]
    );

    if (!orderRows.length) {
      console.error('No se encontró la orden para enviar correo');
      return res.status(500).json({ status: 'failure', error: 'Orden no encontrada' });
    }

    const order = orderRows[0];
    const customerName = `${order.first_name} ${order.last_name}`;
    const formattedDate = formatDate(order.order_date);

    // 4. Obtener detalle de productos
    const { rows: itemRows } = await pool.query(
      `SELECT p.title, oi.quantity, oi.unit_price, oi.total_price, p.id
       FROM order_items oi
       JOIN products p ON oi.product_id = p.id
       WHERE oi.order_id = $1`,
      [buyOrder]
    );

    const items = itemRows.map(item => ({
      nombre: item.title,
      cantidad: item.quantity,
      precio: item.unit_price,
      id: item.id
    }));

    // 5. Obtener dirección del cliente
    const { rows: addressRows } = await pool.query(
      `SELECT ua.address
       FROM user_address ua
       WHERE ua.id = $1`,
      [order.address_id]
    );

    const address = addressRows[0]?.address || 'Dirección no disponible';

    const cliente = {
      nombre: customerName,
      email: order.email,
      direccion: address,
      rut: order.rut
    };

    // 6. Generar y enviar boleta
    console.log('Cliente para boleta:', cliente);
    await generarYEnviarBoleta(cliente, items, order.subtotal, order.shipping_cost, order.total, buyOrder);


    
    // 7. Enviar correo al administrador
    await OrderEmailService.sendOrderConfirmation(process.env.EMAIL_ADMIN, buyOrder, {
      subtotal: order.subtotal,
      shipping: order.shipping_cost,
      total: order.total,
      productos: items,
      customerName,
      orderDate: formattedDate
    });

    // 8. Enviar respuesta al cliente
    res.json({ status: 'success', data: result });

    // 9. Disminuir stock en segundo plano (sin interferir con respuesta HTTP)
    setImmediate(async () => {
      try {
        await decrementarStock(items);
      } catch (err) {
        console.error('Error post-respuesta al decrementar stock en Bsale:', err.message);
      }
    });

  } catch (err) {
    console.error('Error en commitTransaction:', err);
    if (!res.headersSent) {
      res.status(500).json({ status: 'failure', error: err.message });
    }
  }
};

// Decrementa el stock de productos en Bsale para cada producto de la orden de compra
export const decrementarStock = async (items) => {
  try {
    const tasks = items.map(async ({ id, cantidad, nombre }) => {
      const sku = await getSkuByProductId(id);

      if (!sku) {
        console.warn(`SKU no encontrado para producto "${nombre}" con ID ${id}`);
        return;
      }

      await decreaseStock(sku, cantidad);
      console.log(`Stock decrementado en Bsale: SKU ${sku} (${nombre}), cantidad ${cantidad}`);
    });

    await Promise.all(tasks);
    console.log('Stock actualizado correctamente en Bsale para todos los productos.');
  } catch (error) {
    console.error('Error al decrementar el stock en Bsale:', error.message);
    throw new Error('No se pudo completar la actualización de stock en Bsale');
  }
};