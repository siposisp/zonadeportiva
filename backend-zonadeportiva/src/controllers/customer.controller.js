import { pool } from '../../database/connectionPostgreSQL.js';
import { updateCustomerInfo, getCustomerAddresses, getCustomerIdByUserId, createCustomerAddress, updateCustomerAddress, deleteCustomerAddress, verifyAddressOwnership} from '../services/customer.service.js';

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