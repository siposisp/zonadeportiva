import { pool } from '../../database/connectionPostgreSQL.js';
import { updateCustomerInfo, getCustomerAddresses, getCustomerIdByUserId, createCustomerAddress, updateCustomerAddress, deleteCustomerAddress, verifyAddressOwnership} from '../services/customer.service.js';

/**
 * @swagger
 * components:
 *   schemas:
 *     Customer:
 *       type: object
 *       properties:
 *         user_id:
 *           type: integer
 *           description: ID del usuario
 *         email:
 *           type: string
 *           format: email
 *           description: Email del usuario
 *         role:
 *           type: string
 *           description: Rol del usuario
 *         customer_id:
 *           type: integer
 *           description: ID del cliente
 *         rut:
 *           type: string
 *           description: RUT del cliente
 *         first_name:
 *           type: string
 *           description: Nombre del cliente
 *         last_name:
 *           type: string
 *           description: Apellido del cliente
 *         phone:
 *           type: string
 *           description: Teléfono del cliente
 *     
 *     Address:
 *       type: object
 *       properties:
 *         address_id:
 *           type: integer
 *           description: ID de la dirección
 *         address:
 *           type: string
 *           description: Dirección completa
 *         apartment:
 *           type: string
 *           description: Número de apartamento
 *         number:
 *           type: string
 *           description: Número de la dirección
 *         city_id:
 *           type: integer
 *           description: ID de la ciudad
 *         state_id:
 *           type: integer
 *           description: ID del estado/región
 *     
 *     CustomerUpdateRequest:
 *       type: object
 *       properties:
 *         rut:
 *           type: string
 *           description: RUT del cliente
 *         first_name:
 *           type: string
 *           description: Nombre del cliente
 *         last_name:
 *           type: string
 *           description: Apellido del cliente
 *         phone:
 *           type: string
 *           description: Teléfono del cliente
 *     
 *     AddressRequest:
 *       type: object
 *       required:
 *         - address
 *         - city_id
 *         - state_id
 *       properties:
 *         address:
 *           type: string
 *           description: Dirección completa
 *         apartment:
 *           type: string
 *           description: Número de apartamento
 *         number:
 *           type: string
 *           description: Número de la dirección
 *         city_id:
 *           type: integer
 *           description: ID de la ciudad
 *         state_id:
 *           type: integer
 *           description: ID del estado/región
 *     
 *     Error:
 *       type: object
 *       properties:
 *         message:
 *           type: string
 *           description: Mensaje de error
 *     
 *     Success:
 *       type: object
 *       properties:
 *         message:
 *           type: string
 *           description: Mensaje de éxito
 *   
 *   securitySchemes:
 *     bearerAuth:
 *       type: http
 *       scheme: bearer
 *       bearerFormat: JWT
 */

/**
 * @swagger
 * /customer/:
 *   get:
 *     summary: Obtener información del cliente autenticado
 *     tags: [Customer]
 *     security:
 *       - bearerAuth: []
 *     responses:
 *       200:
 *         description: Información del cliente obtenida exitosamente
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 user:
 *                   $ref: '#/components/schemas/Customer'
 *       404:
 *         description: Usuario no encontrado
 *         content:
 *           application/json:
 *             schema:
 *               $ref: '#/components/schemas/Error'
 *       500:
 *         description: Error interno del servidor
 *         content:
 *           application/json:
 *             schema:
 *               $ref: '#/components/schemas/Error'
 */
// Obtener información del usuario que esta logueado
export const getCustomer = async (req, res) => {
  try {
    const userId = req.user.id;

    const result = await pool.query(
      `SELECT 
         u.id    AS user_id,
         u.email,
         u.role,
         c.id    AS customer_id,
         c.rut,
         c.first_name,
         c.last_name,
         c.phone
       FROM users u
       LEFT JOIN customers c ON c.user_id = u.id
       WHERE u.id = $1`,
      [userId]
    );

    if (result.rows.length === 0) {
      return res.status(404).json({ message: 'Usuario no encontrado' });
    }

    return res.status(200).json({ user: result.rows[0] });
  } catch (err) {
    console.error('Error en getCustomer:', err);
    return res.status(500).json({ message: 'Error interno al obtener usuario' });
  }
};

/**
 * @swagger
 * /customer/:
 *   put:
 *     summary: Actualizar información del cliente
 *     tags: [Customer]
 *     security:
 *       - bearerAuth: []
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             $ref: '#/components/schemas/CustomerUpdateRequest'
 *           example:
 *             rut: "12345678-9"
 *             first_name: "Juan"
 *             last_name: "Pérez"
 *             phone: "+56912345678"
 *     responses:
 *       200:
 *         description: Información del cliente actualizada exitosamente
 *         content:
 *           application/json:
 *             schema:
 *               $ref: '#/components/schemas/Success'
 *       400:
 *         description: Se debe proporcionar al menos un campo para actualizar
 *         content:
 *           application/json:
 *             schema:
 *               $ref: '#/components/schemas/Error'
 *       404:
 *         description: Cliente no encontrado
 *         content:
 *           application/json:
 *             schema:
 *               $ref: '#/components/schemas/Error'
 *       500:
 *         description: Error interno del servidor
 *         content:
 *           application/json:
 *             schema:
 *               $ref: '#/components/schemas/Error'
 */
// Actualizar información del customer (sin email ni contraseña)
export const updateCustomer = async (req, res) => {
  try {
    const userId = req.user.id;
    const { rut, first_name, last_name, phone } = req.body;

    // Validar que al menos un campo esté presente
    if (!rut && !first_name && !last_name && !phone) {
      return res.status(400).json({ 
        message: 'Se debe proporcionar al menos un campo para actualizar' 
      });
    }

    const updatedCustomer = await updateCustomerInfo(userId, {
      rut,
      first_name,
      last_name,
      phone
    });

    if (!updatedCustomer) {
      return res.status(404).json({ message: 'Cliente no encontrado' });
    }

    return res.status(200).json({ 
      message: 'Información del cliente actualizada exitosamente'
    });

  } catch (error) {
    console.error('Error en updateCustomer:', error);
    return res.status(500).json({ message: 'Error interno al actualizar cliente' });
  }
};

//---parte de direcciones---

/**
 * @swagger
 * /customer/address:
 *   get:
 *     summary: Obtener dirección del cliente autenticado (primera dirección)
 *     tags: [Customer]
 *     security:
 *       - bearerAuth: []
 *     responses:
 *       200:
 *         description: Dirección obtenida exitosamente
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 address:
 *                   allOf:
 *                     - $ref: '#/components/schemas/Address'
 *                     - type: object
 *                       nullable: true
 *       404:
 *         description: Cliente no encontrado
 *         content:
 *           application/json:
 *             schema:
 *               $ref: '#/components/schemas/Error'
 *       500:
 *         description: Error interno del servidor
 *         content:
 *           application/json:
 *             schema:
 *               $ref: '#/components/schemas/Error'
 */
// Obtener dirección del usuario que está logueado (nico, solo devuelve una)
export const getCustomerAddress = async (req, res) => {
  try {
    // 1) Obtenemos el user_id del token
    const userId = req.user.id;
    console.log('userId desde req.user:', userId);

    // 2) Buscar el customer_id asociado en la tabla customers
    const custRes = await pool.query(
      `SELECT id 
         FROM customers 
        WHERE user_id = $1`,
      [userId]
    );

    if (custRes.rows.length === 0) {
      return res.status(404).json({ message: 'Cliente no encontrado' });
    }

    const customerId = custRes.rows[0].id;
    console.log('customerId desde DB:', customerId);

    // 3) Ahora podemos buscar la dirección
    const addrRes = await pool.query(
      `SELECT 
         id            AS address_id,
         address,
         apartment,
         number,
         city_id,
         state_id
       FROM user_address
       WHERE customer_id = $1`,
      [customerId]
    );

    const address = addrRes.rows[0] || null;
    return res.status(200).json({ address });

  } catch (err) {
    console.error('Error en getCustomerAddress:', err);
    return res
      .status(500)
      .json({ message: 'Error interno al obtener dirección del cliente' });
  }
};

/**
 * @swagger
 * /customer/addresses:
 *   get:
 *     summary: Obtener todas las direcciones del cliente autenticado
 *     tags: [Customer]
 *     security:
 *       - bearerAuth: []
 *     responses:
 *       200:
 *         description: Direcciones obtenidas exitosamente
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 addresses:
 *                   type: array
 *                   items:
 *                     $ref: '#/components/schemas/Address'
 *       404:
 *         description: Cliente no encontrado
 *         content:
 *           application/json:
 *             schema:
 *               $ref: '#/components/schemas/Error'
 *       500:
 *         description: Error interno del servidor
 *         content:
 *           application/json:
 *             schema:
 *               $ref: '#/components/schemas/Error'
 */
// Obtener todas las direcciones del customer que está logueado (nueva)
export const getCustomerAddressList = async (req, res) => {
  try {
    const userId = req.user.id;
    const customerId = await getCustomerIdByUserId(userId);

    if (!customerId) {
      return res.status(404).json({ message: 'Cliente no encontrado' });
    }

    const addresses = await getCustomerAddresses(customerId);
    return res.status(200).json({ addresses });

  } catch (err) {
    console.error('Error en getCustomerAddressList:', err);
    return res.status(500).json({ 
      message: 'Error interno al obtener direcciones del cliente' 
    });
  }
};

/**
 * @swagger
 * /customer/address:
 *   post:
 *     summary: Crear una nueva dirección para el cliente
 *     tags: [Customer]
 *     security:
 *       - bearerAuth: []
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             $ref: '#/components/schemas/AddressRequest'
 *           example:
 *             address: "Av. Providencia 123"
 *             apartment: "Depto 4B"
 *             number: "123"
 *             city_id: 1
 *             state_id: 1
 *     responses:
 *       201:
 *         description: Dirección creada exitosamente
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 message:
 *                   type: string
 *                   example: "Dirección creada exitosamente"
 *                 address:
 *                   $ref: '#/components/schemas/Address'
 *       400:
 *         description: Campos requeridos faltantes
 *         content:
 *           application/json:
 *             schema:
 *               $ref: '#/components/schemas/Error'
 *       404:
 *         description: Cliente no encontrado
 *         content:
 *           application/json:
 *             schema:
 *               $ref: '#/components/schemas/Error'
 *       500:
 *         description: Error interno del servidor
 *         content:
 *           application/json:
 *             schema:
 *               $ref: '#/components/schemas/Error'
 */
//create address
// Crear una nueva dirección para el customer
export const createAddress = async (req, res) => {
  try {
    const userId = req.user.id;
    const { address, apartment, number, city_id, state_id } = req.body;

    // Validaciones básicas
    if (!address || !city_id || !state_id) {
      return res.status(400).json({ 
        message: 'address, city_id y state_id son requeridos' 
      });
    }

    const customerId = await getCustomerIdByUserId(userId);
    if (!customerId) {
      return res.status(404).json({ message: 'Cliente no encontrado' });
    }

    const newAddress = await createCustomerAddress(customerId, {
      address,
      apartment,
      number,
      city_id,
      state_id
    });

    return res.status(201).json({ 
      message: 'Dirección creada exitosamente',
      address: newAddress 
    });

  } catch (error) {
    console.error('Error en createAddress:', error);
    return res.status(500).json({ message: 'Error interno al crear dirección' });
  }
};

/**
 * @swagger
 * /customer/address/{addressId}:
 *   put:
 *     summary: Actualizar una dirección específica del cliente
 *     tags: [Customer]
 *     security:
 *       - bearerAuth: []
 *     parameters:
 *       - in: path
 *         name: addressId
 *         required: true
 *         schema:
 *           type: integer
 *         description: ID de la dirección a actualizar
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *             properties:
 *               address:
 *                 type: string
 *                 description: Dirección completa
 *               apartment:
 *                 type: string
 *                 description: Número de apartamento
 *               number:
 *                 type: string
 *                 description: Número de la dirección
 *               city_id:
 *                 type: integer
 *                 description: ID de la ciudad
 *               state_id:
 *                 type: integer
 *                 description: ID del estado/región
 *           example:
 *             address: "Av. Las Condes 456"
 *             apartment: "Oficina 12"
 *             number: "456"
 *             city_id: 2
 *             state_id: 1
 *     responses:
 *       200:
 *         description: Dirección actualizada exitosamente
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 message:
 *                   type: string
 *                   example: "Dirección actualizada exitosamente"
 *                 address:
 *                   $ref: '#/components/schemas/Address'
 *       400:
 *         description: Se debe proporcionar al menos un campo para actualizar
 *         content:
 *           application/json:
 *             schema:
 *               $ref: '#/components/schemas/Error'
 *       403:
 *         description: No tienes permisos para actualizar esta dirección
 *         content:
 *           application/json:
 *             schema:
 *               $ref: '#/components/schemas/Error'
 *       404:
 *         description: Cliente o dirección no encontrada
 *         content:
 *           application/json:
 *             schema:
 *               $ref: '#/components/schemas/Error'
 *       500:
 *         description: Error interno del servidor
 *         content:
 *           application/json:
 *             schema:
 *               $ref: '#/components/schemas/Error'
 */
//update address
// Actualizar una dirección específica del customer (se manda id del front)
export const updateAddress = async (req, res) => {
  try {
    const userId = req.user.id;
    const { addressId } = req.params;
    const { address, apartment, number, city_id, state_id } = req.body;

    // Validar que al menos un campo esté presente
    if (!address && !apartment && !number && !city_id && !state_id) {
      return res.status(400).json({ 
        message: 'Se debe proporcionar al menos un campo para actualizar' 
      });
    }

    const customerId = await getCustomerIdByUserId(userId);
    if (!customerId) {
      return res.status(404).json({ message: 'Cliente no encontrado' });
    }

    // Verificar que la dirección pertenece al customer
    const ownsAddress = await verifyAddressOwnership(addressId, customerId);
    if (!ownsAddress) {
      return res.status(403).json({ 
        message: 'No tienes permisos para actualizar esta dirección' 
      });
    }

    const updatedAddress = await updateCustomerAddress(addressId, customerId, {
      address,
      apartment,
      number,
      city_id,
      state_id
    });

    if (!updatedAddress) {
      return res.status(404).json({ message: 'Dirección no encontrada' });
    }

    return res.status(200).json({ 
      message: 'Dirección actualizada exitosamente',
      address: updatedAddress 
    });

  } catch (error) {
    console.error('Error en updateAddress:', error);
    return res.status(500).json({ message: 'Error interno al actualizar dirección' });
  }
};

/**
 * @swagger
 * /customer/address/{addressId}:
 *   delete:
 *     summary: Eliminar una dirección específica del cliente
 *     tags: [Customer]
 *     security:
 *       - bearerAuth: []
 *     parameters:
 *       - in: path
 *         name: addressId
 *         required: true
 *         schema:
 *           type: integer
 *         description: ID de la dirección a eliminar
 *     responses:
 *       200:
 *         description: Dirección eliminada exitosamente
 *         content:
 *           application/json:
 *             schema:
 *               $ref: '#/components/schemas/Success'
 *       403:
 *         description: No tienes permisos para eliminar esta dirección
 *         content:
 *           application/json:
 *             schema:
 *               $ref: '#/components/schemas/Error'
 *       404:
 *         description: Cliente o dirección no encontrada
 *         content:
 *           application/json:
 *             schema:
 *               $ref: '#/components/schemas/Error'
 *       500:
 *         description: Error interno del servidor
 *         content:
 *           application/json:
 *             schema:
 *               $ref: '#/components/schemas/Error'
 */
//delete
export const deleteAddress = async (req, res) => {
  try {
    const userId = req.user.id;
    const { addressId } = req.params;

    const customerId = await getCustomerIdByUserId(userId);
    if (!customerId) {
      return res.status(404).json({ message: 'Cliente no encontrado' });
    }

    // Verificar que la dirección pertenece al customer
    const ownsAddress = await verifyAddressOwnership(addressId, customerId);
    if (!ownsAddress) {
      return res.status(403).json({ 
        message: 'No tienes permisos para eliminar esta dirección' 
      });
    }

    const deletedAddress = await deleteCustomerAddress(addressId, customerId);

    if (!deletedAddress) {
      return res.status(404).json({ message: 'Dirección no encontrada' });
    }

    return res.status(200).json({ 
      message: 'Dirección eliminada exitosamente' 
    });

  } catch (error) {
    console.error('Error en deleteAddress:', error);
    return res.status(500).json({ message: 'Error interno al eliminar dirección' });
  }
};

export default { getCustomer, getCustomerAddress, updateCustomer, getCustomerAddressList, createAddress,updateAddress, deleteAddress};