import bcrypt from 'bcrypt';
import { pool } from '../../database/connectionPostgreSQL.js';
import Customer from '../models/customer.js';
import { generateToken, setTokenCookie, clearTokenCookie } from '../middleware/auth.js';
import { getUserByEmail, checkUserExists, setUserPassword } from '../services/user.service.js';
import authEmailService from '../services/email/authEmail.service.js';


// Register Customer (solo registro de clientes)
export const registerUser = async (req, res) => { 
  try {
    const { email, firstName, lastName, phone, rut, password } = req.body;

    if (!email || !firstName || !lastName || !phone || !rut || !password) {
      return res.status(400).json({
        error: 'Faltan datos obligatorios',
        code: 'MISSING_FIELDS'
      });
    }

    const password_hash = await bcrypt.hash(password, 12);
    const client = await pool.connect();

    try {
      await client.query('BEGIN');

      const insertUserQuery = `
        INSERT INTO users (email, password_hash, role)
        VALUES ($1, $2, $3)
        RETURNING id
      `;
      const userResult = await client.query(insertUserQuery, [email, password_hash, 'customer']);
      const userId = userResult.rows[0].id;

      const insertCustomerQuery = `
        INSERT INTO customers (user_id, rut, first_name, last_name, phone)
        VALUES ($1, $2, $3, $4, $5)
      `;
      await client.query(insertCustomerQuery, [userId, rut, firstName, lastName, phone]);

      await client.query('COMMIT');

      const tokenPayload = { id: userId, email, role: 'customer' };
      const token = generateToken(tokenPayload);
      setTokenCookie(res, token);

      return res.status(201).json({ message: 'Usuario registrado correctamente' });

    } catch (err) {
      await client.query('ROLLBACK');
      throw err;
    } finally {
      client.release();
    }

  } catch (error) {
    if (error.code === '23505') {
      // Error de clave duplicada, por ejemplo email ya registrado
      return res.status(409).json({
        error: 'El correo ya está registrado',
        code: 'EMAIL_ALREADY_EXISTS'
      });
    }
    console.error('Error en registro de usuario:', error);
    return res.status(500).json({
      error: 'Error interno del servidor',
      code: 'INTERNAL_ERROR'
    });
  }
};

// Create Guest Customer (cliente invitado sin usuario)
export const registerGuestCustomer = async (req, res) => {
  try {
    const { firstName, lastName, phone, rut } = req.body;

    // Validaciones básicas
    if (!firstName || !lastName) {
      return res.status(400).json({ 
        error: 'Nombre y apellido son requeridos' 
      });
    }

    // Insertar customer sin user_id (invitado)
    const insertCustomerQuery = `
      INSERT INTO customers (user_id, rut, first_name, last_name, phone)
      VALUES (NULL, $1, $2, $3, $4)
      RETURNING *
    `;
    
    const values = [rut || null, firstName, lastName, phone || null];
    const result = await pool.query(insertCustomerQuery, values);
    
    const newCustomer = new Customer(result.rows[0]);

    res.status(201).json({
      message: 'Cliente invitado creado exitosamente',
      customer: {
        id: newCustomer.id,
        rut: newCustomer.rut,
        first_name: newCustomer.first_name,
        last_name: newCustomer.last_name,
        phone: newCustomer.phone,
        is_guest: true
      }
    });

  } catch (error) {
    console.error('Error al crear cliente invitado:', error);
    res.status(500).json({ 
      error: 'Error interno del servidor' 
    });
  }
};

// Login User
export const loginUser = async (req, res) => {
  try {
    if (!req.body) return res.status(400).json({ error: 'No se envió información', code: 'NO_BODY' });

    const { email, password } = req.body;
    if (!email || !password) return res.status(400).json({ error: 'Email y contraseña son requeridos', code: 'MISSING_CREDENTIALS' });

    const user = await getUserByEmail(email);

    if (!user) {
      // Email incorrecto (no encontrado)
      return res.status(401).json({ error: 'Correo electrónico incorrecto', code: 'INVALID_EMAIL' });
    }

    const isValid = await bcrypt.compare(password, user.password_hash);
    if (!isValid) {
      // Contraseña incorrecta
      return res.status(401).json({ error: 'Contraseña incorrecta', code: 'INVALID_PASSWORD' });
    }

    const tokenPayload = { id: user.id, email: user.email, role: user.role };
    const token = generateToken(tokenPayload);
    setTokenCookie(res, token);

    return res.sendStatus(200); // OK

  } catch (error) {
    console.error('Error al iniciar sesión:', error);
    return res.status(500).json({ error: 'Error interno del servidor', code: 'INTERNAL_ERROR' });
  }
};

// Logout User
export const logoutUser = async (req, res) => {
  try {
    clearTokenCookie(res);
    return res.sendStatus(200); // OK
  } catch (error) {
    console.error('Logout error:', error);
    return res.sendStatus(500);
  }
};

// Verificar token (útil para el frontend)
export const verifyToken = async (req, res) => {
  try {
    const { user } = req;

    // Si no hay user en el request, no está autenticado
    if (!user) {
      return res.status(200).json({ isAuthenticated: false });
    }

    const userExists = await checkUserExists(user.id);

    if (!userExists) {
      clearTokenCookie(res);
      return res.status(401).json({
        isAuthenticated: false,
        error: 'Usuario no válido',
        code: 'INVALID_USER'
      });
    }

    return res.status(200).json({ isAuthenticated: true });
  } catch (error) {
    console.error('Error en verify token:', error);
    return res.status(500).json({
      isAuthenticated: false,
      error: 'Error interno del servidor',
      code: 'INTERNAL_ERROR'
    });
  }
};

// Refresh token (opcional)
export const refreshToken = async (req, res) => {
  try {
    const { user } = req;
    
    // Generar nuevo token
    const tokenPayload = {
      id: user.id,
      email: user.email,
      role: user.role,
      iat: Math.floor(Date.now() / 1000)
    };
    
    if (user.customer_id) {
      tokenPayload.customer_id = user.customer_id;
    }
    
    const newToken = generateToken(tokenPayload);
    setTokenCookie(res, newToken);
    
    res.status(200).json({
      success: true,
      message: 'Token renovado exitosamente'
    });
    
  } catch (error) {
    console.error('Error en refresh token:', error);
    res.status(500).json({
      error: 'Error interno del servidor',
      code: 'INTERNAL_ERROR'
    });
  }
};

/// Cambiar contraseña de usuario (recuperar contraseña)
export const setPassword = async (req, res) => {
  try {
    const { email, newPassword } = req.body;

    // Validación de campos requeridos
    if (!email || !newPassword) {
      return res.status(400).json({
        error: 'Email y nueva contraseña son requeridos',
        code: 'MISSING_FIELDS'
      });
    }

    // Verificar que el usuario existe
    const user = await getUserByEmail(email);
    if (!user) {
      // Por seguridad, no revelamos si el email existe o no
      return res.status(200).json({ 
        message: 'Si el email existe, la contraseña ha sido actualizada' 
      });
    }

    // Actualizar contraseña
    const updated = await setUserPassword(email, newPassword);
    if (!updated) {
      return res.status(500).json({
        error: 'Error al actualizar la contraseña',
        code: 'UPDATE_FAILED'
      });
    }

    return res.status(200).json({ 
      message: 'Contraseña actualizada correctamente' 
    });

  } catch (error) {
    console.error('Error al cambiar contraseña:', error);
    return res.status(500).json({
      error: 'Error interno del servidor',
      code: 'INTERNAL_ERROR'
    });
  }
};

// NUEVA FUNCIÓN: Reset password usando token del email
export const resetPassword = async (req, res) => {
  try {
    const { token, newPassword } = req.body;
    
    if (!token || !newPassword) {
      return res.status(400).json({ 
        error: 'Token y nueva contraseña son requeridos',
        code: 'MISSING_FIELDS'
      });
    }
    
    // Validar token usando el servicio de email
    const validation = authEmailService.validateResetToken(token);
    if (!validation.valid) {
      return res.status(400).json({ 
        error: validation.error,
        code: 'INVALID_TOKEN'
      });
    }
    
    // Actualizar contraseña usando el email del token
    const updated = await setUserPassword(validation.email, newPassword);
    if (!updated) {
      return res.status(500).json({
        error: 'Error al actualizar la contraseña',
        code: 'UPDATE_FAILED'
      });
    }
    
    // Invalidar token después de usarlo
    authEmailService.invalidateToken(token);
    
    // Enviar confirmación por email
    try {
      await authEmailService.sendPasswordChangeConfirmation(validation.email);
    } catch (emailError) {
      console.error('Error enviando confirmación:', emailError);
      // No fallar la operación si el email de confirmación falla
    }
    
    res.json({ 
      message: 'Contraseña actualizada exitosamente',
      success: true 
    });
    
  } catch (error) {
    console.error('Error en resetPassword:', error);
    res.status(500).json({ 
      error: 'Error interno del servidor',
      code: 'INTERNAL_ERROR'
    });
  }
};