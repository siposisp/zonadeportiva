// Importaciones y utilidades previas
import { pool } from '../../database/connectionPostgreSQL.js';
import { validateProductStock } from '../services/product.service.js';
import dotenv from 'dotenv';
dotenv.config();

/*
export const generateOrder = async (req, res) => {
  try {
    const isAuthenticated = !!req.user;
    const { cart, shipping_cost } = req.body;
    //const { cart, shipping_cost, provider_id, document_type } = req.body;

    if (!Array.isArray(cart) || cart.length === 0) {
      return res.status(400).json({ message: 'Debe enviar un arreglo “cart” con al menos un ítem.' });
    }

    // 1) Validar stock inicial
    for (const { product_id, quantity } of cart) {
      const { result } = await validateProductStock(product_id, quantity);
      if (result !== 1) {
        return res.status(400).json({ message: `Stock insuficiente para product_id ${product_id}` });
      }
    }

    // 2) Calcular totales
    let subtotal = 0;
    for (const { total_price } of cart) subtotal += total_price;
    const total = subtotal + shipping_cost;

    const client = await pool.connect();
    let orderId, orderDate;

    try {
      await client.query('BEGIN');

      // Determianr customerId
      let customerId = null;

      //Si está autenticado
      if(isAuthenticated) {
        // 3.a) Obtener customer_id desde la tabla customers
        const customerRes = await client.query(
          `SELECT id FROM customers WHERE user_id = $1 LIMIT 1`,
          [req.user.id]
        );
        if (!customerRes.rows.length) {
          await client.query('ROLLBACK');
          return res.status(400).json({ message: 'Cliente no existe para este usuario' });
        }
        customerId = customerRes.rows[0].id;


      // Si NO está autenticado
      } else {
        //
      }

      
      // 3.b) Insertar la orden
      const insertOrder = await client.query(
        `INSERT INTO orders
           (customer_id, address_id, subtotal, shipping_cost, total, status)
         VALUES ($1, NULL, $2, $3, $4, 'pending')
         RETURNING id, order_date`,
        [customerId, subtotal, shipping_cost, total]
      );
      orderId   = insertOrder.rows[0].id;
      orderDate = insertOrder.rows[0].order_date;

      // Insertar en pagos
      //const insertPayment = await client.query(
      //  `INSERT INTO orders
      //     (order_id, provider_id, amount, status, transaction_id, document_type)
      //   VALUES ($1, $2, $3, $4, $5, $6)`,
      //  [orderId, 1, total, 'pending', 'null', document_type]
      //);


      // 3.c) Insertar cada ítem y decrementar stock con verificación
      for (const { product_id, quantity, unit_price, total_price } of cart) {
        // Insertar en order_items
        await client.query(
          `INSERT INTO order_items
             (order_id, product_id, quantity, unit_price, total_price)
           VALUES ($1, $2, $3, $4, $5)`,
          [orderId, product_id, quantity, unit_price, total_price]
        );

        // Decrementar stock y obtener el nuevo valor
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

      await client.query('COMMIT');
    } catch (err) {
      await client.query('ROLLBACK');
      console.error('Error al crear orden:', err);
      return res.status(500).json({ message: 'Error interno al crear la orden' });
    } finally {
      client.release();
    }

    // 4) Revertir stock si la orden sigue 'pending' tras el delay configurado
    const REVERT_DELAY_MS = parseInt(process.env.REVERT_DELAY_MS, 10) || 5 * 60 * 1000;
    console.log(`Programado revertir stock para orden ${orderId} en ${REVERT_DELAY_MS} ms`);
    setTimeout(async () => {
      console.log(`Ejecutando revertir stock para orden ${orderId}`);
      try {
        const { rows: [{ status }] } = await pool.query(
          `SELECT status FROM orders WHERE id = $1`,
          [orderId]
        );
        console.log(`Estado actual de orden ${orderId}:`, status);
        if (status === 'pending') {
          // Cancelar la orden
          await pool.query(
            `UPDATE orders SET status = 'cancelled' WHERE id = $1`,
            [orderId]
          );
          console.log(`Orden ${orderId} cancelada`);

          // Restaurar stock
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
          console.log(`Reversión completa para orden ${orderId}`);
        } else {
          console.log(`No se revierte stock: orden ${orderId} está en estado '${status}'`);
        }
      } catch (e) {
        console.error('Error al revertir reserva para orden', orderId, e);
      }
    }, REVERT_DELAY_MS);

    // 5) Responder al cliente
    return res.status(201).json({
      message: 'Orden creada y stock reservado (caduca en 5 minutos)',
      order: { buyOrder: orderId, order_date: orderDate, subtotal, shipping_cost, total }
    });

  } catch (error) {
    console.error('Error en generateOrder:', error);
    return res.status(500).json({ message: 'Error interno al generar orden' });
  }
};
*/


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

// Generar una orden de compra
export const generateOrder = async (req, res) => {
  try {
    const isAuthenticated = !!req.user;
    //const { cart, shipping_cost, address_id = 'null', address, apartment, number, email, first_name, last_name, phone, city_id = 'null', state_id = 'null'} = req.body;
    const { cart, shipping_cost } = req.body;
    let address_id
    let address = 'Calle Falsa 123'
    let apartment = 'E12'
    let number = '123'
    let email = 'nicosuperapellido@gmail.com'
    let first_name = 'Nicolás'
    let last_name = 'Gajardo'
    let rut = '20576970-6'
    let phone = '987654321'
    let city_id = 310
    let state_id = 16

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
