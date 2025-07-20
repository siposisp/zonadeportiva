// Importaciones y utilidades previas
import { pool } from '../../database/connectionPostgreSQL.js';
import { validateProductStock } from '../services/product.service.js';
import dotenv from 'dotenv';
dotenv.config();



// Validar que el carrito es un arreglo y tiene al menos un ítem
function validateCartFormat(cart) {
  if (!Array.isArray(cart) || cart.length === 0) {
    return { valid: false, message: 'Debe enviar un arreglo “cart” con al menos un ítem.' };
  }
  return { valid: true };
}


// Validar stock de cada producto en el carrito
async function validateCartStock(cart) {
  for (const { product_id, quantity } of cart) {
    const { result } = await validateProductStock(product_id, quantity);
    if (result !== 1) {
      return {
        valid: false,
        message: `Stock insuficiente para product_id ${product_id}`
      };
    }
  }
  return { valid: true };
}



// Calcular el total y subtotal del carrito
function calculateTotals(cart, shipping_cost) {
  const subtotal = cart.reduce((sum, item) => sum + item.total_price, 0);
  const total = subtotal + shipping_cost;
  return { subtotal, total };
}



// Obtiene el customerId si el usuario está autenticado
async function getCustomerIdIfAuthenticated(client, userId) {
  const res = await client.query(
    `SELECT id FROM customers WHERE user_id = $1 LIMIT 1`,
    [userId]
  );
  if (!res.rows.length) {
    throw new Error('Cliente no existe para este usuario');
  }
  return res.rows[0].id;
}


// Insertar cliente invitado en la tabla customers
// Retorna el customerId del cliente invitado
async function insertGuestCustomer(client, { rut, first_name, last_name, phone, email }) {
  const insertCustomer = await client.query(
    `INSERT INTO customers
       (user_id, rut, first_name, last_name, phone, email)
     VALUES ($1, $2, $3, $4, $5, $6)
     RETURNING id`,
    [null, rut, first_name, last_name, phone, email]
  );
  return insertCustomer.rows[0].id;
}


// Insertar dirección para cliente invitado
// Retorna el address_id del cliente invitado
async function insertGuestAddress(client, customerId, { address, apartment, city_id, state_id, number }) {
  const insertAddress = await client.query(
    `INSERT INTO user_address
       (customer_id, address, apartment, city_id, state_id, number)
     VALUES ($1, $2, $3, $4, $5, $6)
     RETURNING id`,
    [customerId, address, apartment, city_id, state_id, number]
  );
  return insertAddress.rows[0].id;
}


// Insertar la orden de compra
async function insertOrder(client, address_id, customerId, subtotal, shipping_cost, total) {
  const res = await client.query(
    `INSERT INTO orders
       (customer_id, address_id, subtotal, shipping_cost, total, status)
     VALUES ($1, $2, $3, $4, $5, 'pending')
     RETURNING id, order_date`,
    [customerId, address_id, subtotal, shipping_cost, total]
  );
  return { orderId: res.rows[0].id, orderDate: res.rows[0].order_date };
}


// Insertar los items en el detalle de la orden y decrementar el stock de los productos
async function insertItemsAndDecrementStock(client, orderId, cart) {
  for (const { product_id, quantity, unit_price, total_price } of cart) {
    await client.query(
      `INSERT INTO order_items
         (order_id, product_id, quantity, unit_price, total_price)
       VALUES ($1, $2, $3, $4, $5)`,
      [orderId, product_id, quantity, unit_price, total_price]
    );

    const updateRes = await client.query(
      `UPDATE product_meta
         SET stock = stock - $1
       WHERE product_id = $2
       RETURNING stock`,
      [quantity, product_id]
    );

    if (updateRes.rowCount === 0) {
      console.error(`No se encontró product_meta para product_id ${product_id}`);
    } else {
      console.log(`Stock actualizado para product_id ${product_id}: nuevo stock = ${updateRes.rows[0].stock}`);
    }
  }
}

// Programar la reversión del stock si la orden sigue 'pending' después de un tiempo determinado
// no se revierte si está en estado 'processing'
function scheduleStockReversion(orderId, delayMs) {
  setTimeout(async () => {
    console.log(`Ejecutando revertir stock para orden ${orderId}`);
    try {
      const { rows: [{ status }] } = await pool.query(
        `SELECT status FROM orders WHERE id = $1`,
        [orderId]
      );
      if (status === 'pending') {
        await pool.query(
          `UPDATE orders SET status = 'cancelled' WHERE id = $1`,
          [orderId]
        );
        console.log(`Orden ${orderId} cancelada`);

        const { rows: items } = await pool.query(
          `SELECT product_id, quantity FROM order_items WHERE order_id = $1`,
          [orderId]
        );
        for (const { product_id, quantity } of items) {
          const restoreRes = await pool.query(
            `UPDATE product_meta
               SET stock = stock + $1
             WHERE product_id = $2
             RETURNING stock`,
            [quantity, product_id]
          );
          if (restoreRes.rowCount) {
            console.log(`Restaurado stock para product_id ${product_id}: nuevo stock = ${restoreRes.rows[0].stock}`);
          }
        }
      } else {
        console.log(`No se revierte stock: orden ${orderId} está en estado '${status}'`);
      }
    } catch (e) {
      console.error('Error al revertir reserva para orden', orderId, e);
    }
  }, delayMs);
}




/**
 * @swagger
 * /order/generate-order:
 *   post:
 *     summary: Generar una orden de compra
 *     description: Crea una orden con los datos del cliente, dirección, método de envío y carrito de productos. Puede ejecutarse con o sin autenticación (usuario registrado o invitado).
 *     tags:
 *       - Órdenes
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *             required:
 *               - contact
 *               - address
 *               - shipping
 *               - cart
 *             properties:
 *               contact:
 *                 type: object
 *                 description: Datos del cliente (registrado o invitado)
 *                 properties:
 *                   email:
 *                     type: string
 *                     format: email
 *                     example: "invitado@ejemplo.com"
 *                   first_name:
 *                     type: string
 *                     example: "Juan"
 *                   last_name:
 *                     type: string
 *                     example: "Pérez"
 *                   phone:
 *                     type: string
 *                     example: "+56912345678"
 *                   rut:
 *                     type: string
 *                     description: RUT chileno del cliente
 *                     example: "12.345.678-9"
 *               address:
 *                 type: object
 *                 description: Dirección del cliente
 *                 properties:
 *                   address_id:
 *                     type: integer
 *                     nullable: true
 *                     example: null
 *                   address:
 *                     type: string
 *                     example: "Av. Siempre Viva 742"
 *                   apartment:
 *                     type: string
 *                     example: "Depto. 201"
 *                   state_id:
 *                     type: integer
 *                     example: 13
 *                   city_id:
 *                     type: integer
 *                     example: 27
 *                   number:
 *                     type: integer
 *                     example: 742
 *               shipping:
 *                 type: object
 *                 description: Método de envío y su costo
 *                 properties:
 *                   shipping_cost:
 *                     type: number
 *                     format: float
 *                     example: 3990
 *               cart:
 *                 type: array
 *                 description: Productos seleccionados en el carrito
 *                 items:
 *                   type: object
 *                   required:
 *                     - product_id
 *                     - quantity
 *                   properties:
 *                     product_id:
 *                       type: integer
 *                       example: 123
 *                     quantity:
 *                       type: integer
 *                       example: 2
 *     responses:
 *       201:
 *         description: Orden creada correctamente
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 message:
 *                   type: string
 *                   example: "Orden creada y stock reservado (caduca en 5 minutos)"
 *                 order:
 *                   type: object
 *                   properties:
 *                     buyOrder:
 *                       type: integer
 *                       description: ID de la orden creada
 *                       example: 234
 *                     order_date:
 *                       type: string
 *                       format: date-time
 *                       example: "2025-07-15T12:34:56.000Z"
 *                     subtotal:
 *                       type: integer
 *                       example: 45980
 *                     shipping_cost:
 *                       type: integer
 *                       example: 3990
 *                     total:
 *                       type: integer
 *                       example: 49970
 *       400:
 *         description: Error de validación (carrito o stock)
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 message:
 *                   type: string
 *                   example: "Stock insuficiente para el producto X"
 *       500:
 *         description: Error interno al generar la orden
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 message:
 *                   type: string
 *                   example: "Error interno al crear la orden"
 */
// Generar una orden de compra
export const generateOrder = async (req, res) => {
  try {
    const isAuthenticated = !!req.user;

    const { contact, address: addressData, shipping, cart } = req.body;

    let { email, first_name, last_name, phone, rut } = contact
    let { address_id = null, address, apartment, state_id, city_id, number } = addressData
    let { shipping_cost } = shipping

    console.log("cart", cart)
    console.log("contact", { email, first_name, last_name, phone, rut })
    console.log("address", { address_id, address, apartment, state_id, city_id, number })
    console.log("shipping_cost", shipping_cost)
    
    // Validar formato de carrito
    const formatCheck = validateCartFormat(cart);
    if (!formatCheck.valid) {
      return res.status(400).json({ message: formatCheck.message });
    }

    //Validar stock de prodcutos de carrito
    const stockCheck = await validateCartStock(cart);
    if (!stockCheck.valid) {
      return res.status(400).json({ message: stockCheck.message });
    }

    // Calcular totales
    const { subtotal, total } = calculateTotals(cart, shipping_cost);

    const client = await pool.connect();
    let orderId, orderDate;

    try {
      await client.query('BEGIN');

      let customerId = null;

      //Si esta autenticado
      if (isAuthenticated) {
        customerId = await getCustomerIdIfAuthenticated(client, req.user.id);

        // Si no esta autenticado
      } else {
        
        // Insertar en customers y retornar el customerId
        // Solo se almacena el email si es invitado
        customerId = await insertGuestCustomer(client, {rut, first_name, last_name, phone, email});

        //Insertar en user_address y retornar el address_id
        address_id = await insertGuestAddress(client, customerId, {address, apartment, city_id, state_id, number});
      }

      ({ orderId, orderDate } = await insertOrder(client, address_id, customerId, subtotal, shipping_cost, total));

      await insertItemsAndDecrementStock(client, orderId, cart);

      await client.query('COMMIT');
    } catch (err) {
      await client.query('ROLLBACK');
      console.error('Error al crear orden:', err);
      return res.status(500).json({ message: 'Error interno al crear la orden' });
    } finally {
      client.release();
    }

    const REVERT_DELAY_MS = parseInt(process.env.REVERT_DELAY_MS, 10) || 5 * 60 * 1000;
    console.log(`Programado revertir stock para orden ${orderId} en ${REVERT_DELAY_MS} ms`);
    scheduleStockReversion(orderId, REVERT_DELAY_MS);

    return res.status(201).json({
      message: 'Orden creada y stock reservado (caduca en 5 minutos)',
      order: { buyOrder: orderId, order_date: orderDate, subtotal, shipping_cost, total }
    });

  } catch (error) {
    console.error('Error en generateOrder:', error);
    return res.status(500).json({ message: 'Error interno al generar orden' });
  }
};
