import bcrypt from 'bcrypt';
import { pool } from '../../database/connectionPostgreSQL.js';
import Customer from '../models/customer.js';
import { generateToken, setTokenCookie, clearTokenCookie } from '../middleware/auth.js';
import { getUserByEmail, checkUserExists, setUserPassword } from '../services/user.service.js';
import authEmailService from '../services/email/authEmail.service.js';

/**
 * @swagger
 * components:
 *   schemas:
 *     User:
 *       type: object
 *       required:
 *         - email
 *         - first_name
 *         - last_name
 *         - phone
 *         - rut
 *         - password
 *       properties:
 *         id:
 *           type: integer
 *           description: ID único del usuario
 *         email:
 *           type: string
 *           format: email
 *           description: Email del usuario
 *         first_name:
 *           type: string
 *           description: Nombre del usuario
 *         last_name:
 *           type: string
 *           description: Apellido del usuario
 *         phone:
 *           type: string
 *           description: Teléfono del usuario
 *         rut:
 *           type: string
 *           description: RUT del usuario
 *         password:
 *           type: string
 *           format: password
 *           description: Contraseña del usuario
 *         role:
 *           type: string
 *           enum: [customer, admin]
 *           default: customer
 *           description: Rol del usuario
 *       example:
 *         email: juan@ejemplo.com
 *         first_name: Juan
 *         last_name: Pérez
 *         phone: +56912345678
 *         rut: 12345678-9
 *         password: miContraseña123
 *     
 *     Customer:
 *       type: object
 *       required:
 *         - first_name
 *         - last_name
 *       properties:
 *         id:
 *           type: integer
 *           description: ID único del cliente
 *         user_id:
 *           type: integer
 *           nullable: true
 *           description: ID del usuario asociado (null para invitados)
 *         rut:
 *           type: string
 *           nullable: true
 *           description: RUT del cliente
 *         first_name:
 *           type: string
 *           description: Nombre del cliente
 *         last_name:
 *           type: string
 *           description: Apellido del cliente
 *         phone:
 *           type: string
 *           nullable: true
 *           description: Teléfono del cliente
 *         is_guest:
 *           type: boolean
 *           description: Indica si es un cliente invitado
 *       example:
 *         id: 1
 *         rut: 12345678-9
 *         first_name: Juan
 *         last_name: Pérez
 *         phone: +56912345678
 *         is_guest: false
 *     
 *     LoginCredentials:
 *       type: object
 *       required:
 *         - email
 *         - password
 *       properties:
 *         email:
 *           type: string
 *           format: email
 *           description: Email del usuario
 *         password:
 *           type: string
 *           format: password
 *           description: Contraseña del usuario
 *       example:
 *         email: juan@ejemplo.com
 *         password: miContraseña123
 *     
 *     PasswordReset:
 *       type: object
 *       required:
 *         - email
 *         - newPassword
 *       properties:
 *         email:
 *           type: string
 *           format: email
 *           description: Email del usuario
 *         newPassword:
 *           type: string
 *           format: password
 *           description: Nueva contraseña
 *       example:
 *         email: juan@ejemplo.com
 *         newPassword: nuevaContraseña123
 *     
 *     PasswordResetWithToken:
 *       type: object
 *       required:
 *         - token
 *         - newPassword
 *       properties:
 *         token:
 *           type: string
 *           description: Token de recuperación de contraseña
 *         newPassword:
 *           type: string
 *           format: password
 *           description: Nueva contraseña
 *       example:
 *         token: eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9...
 *         newPassword: nuevaContraseña123
 *     
 *     Error:
 *       type: object
 *       properties:
 *         error:
 *           type: string
 *           description: Mensaje de error
 *         code:
 *           type: string
 *           description: Código de error
 *         message:
 *           type: string
 *           description: Mensaje descriptivo del error
 *       example:
 *         error: Error interno del servidor
 *         code: INTERNAL_ERROR
 *     
 *     Success:
 *       type: object
 *       properties:
 *         message:
 *           type: string
 *           description: Mensaje de éxito
 *         success:
 *           type: boolean
 *           description: Indica si la operación fue exitosa
 *       example:
 *         message: Operación exitosa
 *         success: true
 *     
 *     AuthStatus:
 *       type: object
 *       properties:
 *         isAuthenticated:
 *           type: boolean
 *           description: Estado de autenticación
 *         error:
 *           type: string
 *           description: Error de autenticación (si aplica)
 *         code:
 *           type: string
 *           description: Código de error (si aplica)
 *       example:
 *         isAuthenticated: true
 */

/**
 * @swagger
 * /user/register:
 *   post:
 *     summary: Registrar nuevo usuario cliente
 *     tags: [Users]
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             $ref: '#/components/schemas/User'
 *     responses:
 *       201:
 *         description: Usuario registrado correctamente
 *         content:
 *           application/json:
 *             schema:
 *               $ref: '#/components/schemas/Success'
 *         headers:
 *           Set-Cookie:
 *             description: Cookie de autenticación JWT
 *             schema:
 *               type: string
 *       400:
 *         description: Faltan datos obligatorios
 *         content:
 *           application/json:
 *             schema:
 *               $ref: '#/components/schemas/Error'
 *             example:
 *               error: Faltan datos obligatorios
 *               code: MISSING_FIELDS
 *       409:
 *         description: Email ya registrado
 *         content:
 *           application/json:
 *             schema:
 *               $ref: '#/components/schemas/Error'
 *             example:
 *               error: El correo ya está registrado
 *               code: EMAIL_ALREADY_EXISTS
 *       500:
 *         description: Error interno del servidor
 *         content:
 *           application/json:
 *             schema:
 *               $ref: '#/components/schemas/Error'
 */
export const registerUser = async (req, res) => { 
  try {
    console.log("REGISTER: ", req.body)
    const { email, first_name, last_name, phone, rut, password } = req.body;

    if (!email || !first_name || !last_name || !phone || !rut || !password) {
        console.log("SEGUIMOS AQUI")
      return res.status(400).json({
        error: 'Faltan datos obligatorios',
        code: 'MISSING_FIELDS'
      });
    }

    const password_hash = await bcrypt.hash(password, 12);
    const client = await pool.connect();

    console.log("SEGUIMOS AQUI")

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
      await client.query(insertCustomerQuery, [userId, rut, first_name, last_name, phone]);

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

/**
 * @swagger
 * /user/register-guest:
 *   post:
 *     summary: Crear cliente invitado (sin usuario)
 *     tags: [Users]
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *             required:
 *               - first_name
 *               - last_name
 *             properties:
 *               first_name:
 *                 type: string
 *                 description: Nombre del cliente
 *               last_name:
 *                 type: string
 *                 description: Apellido del cliente
 *               phone:
 *                 type: string
 *                 description: Teléfono del cliente
 *               rut:
 *                 type: string
 *                 description: RUT del cliente
 *             example:
 *               first_name: Juan
 *               last_name: Pérez
 *               phone: +56912345678
 *               rut: 12345678-9
 *     responses:
 *       201:
 *         description: Cliente invitado creado exitosamente
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 message:
 *                   type: string
 *                 customer:
 *                   $ref: '#/components/schemas/Customer'
 *       400:
 *         description: Faltan datos obligatorios
 *         content:
 *           application/json:
 *             schema:
 *               $ref: '#/components/schemas/Error'
 *             example:
 *               error: Nombre y apellido son requeridos
 *       500:
 *         description: Error interno del servidor
 *         content:
 *           application/json:
 *             schema:
 *               $ref: '#/components/schemas/Error'
 */
export const registerGuestCustomer = async (req, res) => {
  try {
    const { first_name, last_name, phone, rut } = req.body;

    // Validaciones básicas
    if (!first_name || !last_name) {
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
    
    const values = [rut || null, first_name, last_name, phone || null];
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

/**
 * @swagger
 * /user/login:
 *   post:
 *     summary: Iniciar sesión
 *     tags: [Users]
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             $ref: '#/components/schemas/LoginCredentials'
 *     responses:
 *       200:
 *         description: Inicio de sesión exitoso
 *         headers:
 *           Set-Cookie:
 *             description: Cookie de autenticación JWT
 *             schema:
 *               type: string
 *       400:
 *         description: Faltan credenciales o datos inválidos
 *         content:
 *           application/json:
 *             schema:
 *               $ref: '#/components/schemas/Error'
 *             examples:
 *               no_body:
 *                 value:
 *                   error: No se envió información
 *                   code: NO_BODY
 *               missing_credentials:
 *                 value:
 *                   error: Email y contraseña son requeridos
 *                   code: MISSING_CREDENTIALS
 *       401:
 *         description: Credenciales inválidas
 *         content:
 *           application/json:
 *             schema:
 *               $ref: '#/components/schemas/Error'
 *             examples:
 *               invalid_email:
 *                 value:
 *                   error: Correo electrónico incorrecto
 *                   code: INVALID_EMAIL
 *               invalid_password:
 *                 value:
 *                   error: Contraseña incorrecta
 *                   code: INVALID_PASSWORD
 *       500:
 *         description: Error interno del servidor
 *         content:
 *           application/json:
 *             schema:
 *               $ref: '#/components/schemas/Error'
 */
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

/**
 * @swagger
 * /user/logout:
 *   post:
 *     summary: Cerrar sesión
 *     tags: [Users]
 *     responses:
 *       200:
 *         description: Sesión cerrada exitosamente
 *         headers:
 *           Set-Cookie:
 *             description: Cookie de autenticación eliminada
 *             schema:
 *               type: string
 *       500:
 *         description: Error interno del servidor
 */
export const logoutUser = async (req, res) => {
  try {
    clearTokenCookie(res);
    return res.sendStatus(200); // OK
  } catch (error) {
    console.error('Logout error:', error);
    return res.sendStatus(500);
  }
};

/**
 * @swagger
 * /user/verify-token:
 *   get:
 *     summary: Verificar token de autenticación
 *     tags: [Users]
 *     security:
 *       - bearerAuth: []
 *     responses:
 *       200:
 *         description: Estado de autenticación verificado
 *         content:
 *           application/json:
 *             schema:
 *               $ref: '#/components/schemas/AuthStatus'
 *             examples:
 *               authenticated:
 *                 value:
 *                   isAuthenticated: true
 *               not_authenticated:
 *                 value:
 *                   isAuthenticated: false
 *       401:
 *         description: Usuario no válido
 *         content:
 *           application/json:
 *             schema:
 *               allOf:
 *                 - $ref: '#/components/schemas/AuthStatus'
 *                 - $ref: '#/components/schemas/Error'
 *             example:
 *               isAuthenticated: false
 *               error: Usuario no válido
 *               code: INVALID_USER
 *       500:
 *         description: Error interno del servidor
 *         content:
 *           application/json:
 *             schema:
 *               allOf:
 *                 - $ref: '#/components/schemas/AuthStatus'
 *                 - $ref: '#/components/schemas/Error'
 */
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

/**
 * @swagger
 * /user/refresh-token:
 *   post:
 *     summary: Renovar token de autenticación
 *     tags: [Users]
 *     security:
 *       - bearerAuth: []
 *     responses:
 *       200:
 *         description: Token renovado exitosamente
 *         content:
 *           application/json:
 *             schema:
 *               $ref: '#/components/schemas/Success'
 *             example:
 *               success: true
 *               message: Token renovado exitosamente
 *         headers:
 *           Set-Cookie:
 *             description: Nueva cookie de autenticación JWT
 *             schema:
 *               type: string
 *       500:
 *         description: Error interno del servidor
 *         content:
 *           application/json:
 *             schema:
 *               $ref: '#/components/schemas/Error'
 */
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

/**
 * @swagger
 * /user/set-password:
 *   put:
 *     summary: Cambiar contraseña de usuario
 *     tags: [Users]
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             $ref: '#/components/schemas/PasswordReset'
 *     responses:
 *       200:
 *         description: Contraseña actualizada correctamente
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 message:
 *                   type: string
 *             examples:
 *               success:
 *                 value:
 *                   message: Contraseña actualizada correctamente
 *               security_response:
 *                 value:
 *                   message: Si el email existe, la contraseña ha sido actualizada
 *       400:
 *         description: Faltan datos obligatorios
 *         content:
 *           application/json:
 *             schema:
 *               $ref: '#/components/schemas/Error'
 *             example:
 *               error: Email y nueva contraseña son requeridos
 *               code: MISSING_FIELDS
 *       500:
 *         description: Error interno del servidor
 *         content:
 *           application/json:
 *             schema:
 *               $ref: '#/components/schemas/Error'
 */
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

/**
 * @swagger
 * /user/reset-password:
 *   post:
 *     summary: Restablecer contraseña usando token de email
 *     tags: [Users]
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             $ref: '#/components/schemas/PasswordResetWithToken'
 *     responses:
 *       200:
 *         description: Contraseña actualizada exitosamente
 *         content:
 *           application/json:
 *             schema:
 *               $ref: '#/components/schemas/Success'
 *             example:
 *               message: Contraseña actualizada exitosamente
 *               success: true
 *       400:
 *         description: Error en validación
 *         content:
 *           application/json:
 *             schema:
 *               $ref: '#/components/schemas/Error'
 *             examples:
 *               missing_fields:
 *                 value:
 *                   error: Token y nueva contraseña son requeridos
 *                   code: MISSING_FIELDS
 *               invalid_token:
 *                 value:
 *                   error: Token inválido o expirado
 *                   code: INVALID_TOKEN
 *       500:
 *         description: Error interno del servidor
 *         content:
 *           application/json:
 *             schema:
 *               $ref: '#/components/schemas/Error'
 */
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