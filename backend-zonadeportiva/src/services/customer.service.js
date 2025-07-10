import { pool } from '../../database/connectionPostgreSQL.js';

// Actualizar información del customer (sin email ni contraseña)
export const updateCustomerInfo = async (userId, customerData) => {
  const { rut, first_name, last_name, phone } = customerData;
  
  const query = `
    UPDATE customers 
    SET 
      rut = COALESCE($2, rut),
      first_name = COALESCE($3, first_name),
      last_name = COALESCE($4, last_name),
      phone = COALESCE($5, phone)
    WHERE user_id = $1
    RETURNING *
  `;
  
  const values = [userId, rut, first_name, last_name, phone];
  const result = await pool.query(query, values);
  return result.rows[0] || null;
};

//usadas en obtener addresses

// Obtener customer_id por user_id
export const getCustomerIdByUserId = async (userId) => {
  const query = `SELECT id FROM customers WHERE user_id = $1`;
  const result = await pool.query(query, [userId]);
  return result.rows[0]?.id || null;
};


// Obtener información del customer por user_id
export const getCustomerByUserId = async (userId) => {
  const query = `
    SELECT 
      u.id AS user_id,
      u.email,
      u.role,
      c.id AS customer_id,
      c.rut,
      c.first_name,
      c.last_name,
      c.phone
    FROM users u
    LEFT JOIN customers c ON c.user_id = u.id
    WHERE u.id = $1
  `;
  
  const result = await pool.query(query, [userId]);
  return result.rows[0] || null;
};

// Obtener todas las direcciones de un customer
export const getCustomerAddresses = async (customerId) => {
  const query = `
    SELECT 
      ua.id AS address_id,
      ua.address,
      ua.apartment,
      ua.number,
      ua.city_id,
      ua.state_id,
      c.name AS city_name,
      s.name AS state_name,
      s.short_name AS state_short_name
    FROM user_address ua
    LEFT JOIN cities c ON ua.city_id = c.id
    LEFT JOIN states s ON ua.state_id = s.id
    WHERE ua.customer_id = $1
    ORDER BY ua.id
  `;
  
  const result = await pool.query(query, [customerId]);
  return result.rows;
};


// Crear una nueva dirección para un customer
export const createCustomerAddress = async (customerId, addressData) => {
  const { address, apartment, number, city_id, state_id } = addressData;
  
  const query = `
    INSERT INTO user_address (customer_id, address, apartment, number, city_id, state_id)
    VALUES ($1, $2, $3, $4, $5, $6)
    RETURNING *
  `;
  
  const values = [customerId, address, apartment || null, number || null, city_id, state_id];
  const result = await pool.query(query, values);
  return result.rows[0];
};

// Actualizar una dirección específica
export const updateCustomerAddress = async (addressId, customerId, addressData) => {
  const { address, apartment, number, city_id, state_id } = addressData;
  
  const query = `
    UPDATE user_address 
    SET 
      address = COALESCE($3, address),
      apartment = COALESCE($4, apartment),
      number = COALESCE($5, number),
      city_id = COALESCE($6, city_id),
      state_id = COALESCE($7, state_id)
    WHERE id = $1 AND customer_id = $2
    RETURNING *
  `;
  
  const values = [addressId, customerId, address, apartment, number, city_id, state_id];
  const result = await pool.query(query, values);
  return result.rows[0] || null;
};

// Verificar si una dirección pertenece a un customer
export const verifyAddressOwnership = async (addressId, customerId) => {
  const query = `
    SELECT id FROM user_address 
    WHERE id = $1 AND customer_id = $2
  `;
  
  const result = await pool.query(query, [addressId, customerId]);
  return result.rows.length > 0;
};


// Eliminar una dirección específica
export const deleteCustomerAddress = async (addressId, customerId) => {
  const query = `
    DELETE FROM user_address 
    WHERE id = $1 AND customer_id = $2
    RETURNING *
  `;
  
  const result = await pool.query(query, [addressId, customerId]);
  return result.rows[0] || null;
};