import { pool } from '../../../database/connectionPostgreSQL.js';
import pkg from 'transbank-sdk'
import OrderEmailService from '../../services/email/orderEmail.service.js';
import { decreaseStock, generarYEnviarBoleta } from '../../services/bsale.service.js';
import {getSkuByProductId} from '../../services/productMeta.service.js';

import dotenv from 'dotenv';
dotenv.config();

const { Options, IntegrationApiKeys, Environment, IntegrationCommerceCodes, WebpayPlus } = pkg;


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




/*
export const commitTransaction = async (req, res) => {
  const token = req.query.token_ws;
  if (!token) return res.status(400).json({ status: 'canceled' });

  try {
    const result = await tx.commit(token);

    const { vci, 
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
      installments_number } = result;

    await pool.query(
      'INSERT INTO webpay_transactions(vci, amount, status, buy_order, session_id, card_last_numbers, accounting_date, transaction_date, authorization_code, payment_type_code, response_code, installments_number, payment_id) VALUES($1,$2,$3,$4,$5,$6,$7,$8,$9,$10,$11,$12,$13)',
      [vci, amount, status ,buyOrder, sessionId, card_number, accounting_date, transaction_date, authorization_code, payment_type_code, response_code, installments_number, 1]
    );

    await pool.query(
      `UPDATE orders SET status = $1 WHERE id = $2`,
      ['processing',buyOrder]
    );



    //Buscar productos en la base de datos para enviar correo de confirmación


    res.json({ status: 'success', data: result });
  } catch (err) {
    res.status(500).json({ status: 'failure', error: err.message });
  }
};
*/

















































/*
// Utilidad para formatear la fecha al estilo: 9 de abril de 2025
const formatDate = (dateStr) => {
  const date = new Date(dateStr);
  return date.toLocaleDateString('es-CL', {
    day: 'numeric',
    month: 'long',
    year: 'numeric'
  });
};

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
    const { rows: orderRows } = await pool.query(
      `SELECT o.total, o.subtotal, o.shipping_cost, o.order_date, u.email,
              c.first_name, c.last_name, o.address_id
       FROM orders o
       JOIN customers c ON o.customer_id = c.id
       JOIN users u ON c.user_id = u.id
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

  
    // 5. Enviar correo de confirmación al cliente 
    /*
    await OrderEmailService.sendOrderConfirmation(order.email, buyOrder, {
      subtotal: order.subtotal,
      shipping: order.shipping_cost,
      total: order.total,
      items,
      customerName,
      orderDate: formattedDate
    });
    */

/*
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
      rut: "66666666-6"
    };

    await generarYEnviarBoleta(cliente, items, order.subtotal, order.shipping_cost, order.total );

    // Enviar correo al administrador
    await OrderEmailService.sendOrderConfirmation(process.env.EMAIL_ADMIN, buyOrder, {
      subtotal: order.subtotal,
      shipping: order.shipping_cost,
      total: order.total,
      items,
      customerName,
      orderDate: formattedDate
    });

    res.json({ status: 'success', data: result });

    
    
    //Lo puse aquí por el tiempo que tarda en ejecutarse
    // 6. Disminuir stock de productos en Bsale
    await decrementarStock(items);

  } catch (err) {
    console.error('Error en commitTransaction:', err);
    res.status(500).json({ status: 'failure', error: err.message });
  }
};







// Decrementa el stock de productos en Bsale para cada producto del la orden de compra
export const decrementarStock = async (items) => {
  try {
    const tasks = items.map(async ({ id, quantity, name }) => {
      const sku = await getSkuByProductId(id);

      if (!sku) {
        console.warn(`SKU no encontrado para producto "${name}" con ID ${id}`);
        return;
      }

      await decreaseStock(sku, quantity);
      console.log(`Stock decrementado en Bsale: SKU ${sku} (${name}), cantidad ${quantity}`);
    });

    await Promise.all(tasks);

    console.log('Stock actualizado correctamente en Bsale para todos los productos.');
  } catch (error) {
    console.error('Error al decrementar el stock en Bsale:', error.message);
    throw new Error('No se pudo completar la actualización de stock en Bsale');
  }
};
*/





// Utilidad para formatear la fecha al estilo: 9 de abril de 2025
const formatDate = (dateStr) => {
  const date = new Date(dateStr);
  return date.toLocaleDateString('es-CL', {
    day: 'numeric',
    month: 'long',
    year: 'numeric'
  });
};

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
