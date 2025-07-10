import { jest, describe, it, expect, beforeEach, afterEach } from '@jest/globals';

// Mock de la conexión a la base de datos
const mockQuery = jest.fn();
const mockConnect = jest.fn();
const mockRelease = jest.fn();
const mockClient = {
  query: jest.fn(),
  release: mockRelease
};

await jest.unstable_mockModule('../../../database/connectionPostgreSQL.js', () => ({
  pool: { 
    query: mockQuery,
    connect: mockConnect
  }
}));

// Mock del modelo Customer
await jest.unstable_mockModule('../../models/customer.js', () => ({
  default: jest.fn((data) => ({ ...data, isMocked: true }))
}));

// Mock del middleware de auth
await jest.unstable_mockModule('../../middleware/auth.js', () => ({
  generateToken: jest.fn(),
  setTokenCookie: jest.fn(),
  clearTokenCookie: jest.fn()
}));

// Mock de los servicios de usuario
await jest.unstable_mockModule('../../services/user.service.js', () => ({
  getUserByEmail: jest.fn(),
  checkUserExists: jest.fn()
}));

// Mock de bcrypt usando jest.unstable_mockModule
await jest.unstable_mockModule('bcrypt', () => ({
  default: {
    hash: jest.fn(),
    compare: jest.fn()
  }
}));

// Importar después de los mocks
const { pool } = await import('../../../database/connectionPostgreSQL.js');
const Customer = (await import('../../models/customer.js')).default;
const { generateToken, setTokenCookie, clearTokenCookie } = await import('../../middleware/auth.js');
const { getUserByEmail, checkUserExists } = await import('../../services/user.service.js');
const bcrypt = (await import('bcrypt')).default;
const {
  registerUser,
  registerGuestCustomer,
  loginUser,
  logoutUser,
  verifyToken,
  refreshToken
} = await import('../../controllers/user.controller.js');

describe('User Controller', () => {
  let req, res;

  beforeEach(() => {
    jest.clearAllMocks();
    mockQuery.mockClear();
    mockConnect.mockClear();
    mockRelease.mockClear();
    mockClient.query.mockClear();
    generateToken.mockClear();
    setTokenCookie.mockClear();
    clearTokenCookie.mockClear();
    getUserByEmail.mockClear();
    checkUserExists.mockClear();
    bcrypt.hash.mockClear();
    bcrypt.compare.mockClear();

    req = {
      body: {},
      user: null
    };

    res = {
      status: jest.fn().mockReturnThis(),
      json: jest.fn(),
      sendStatus: jest.fn()
    };

    // Silenciar console.error durante las pruebas
    jest.spyOn(console, 'error').mockImplementation(() => {});
  });

  afterEach(() => {
    console.error.mockRestore();
  });

  describe('registerUser', () => {
    it('debería registrar un usuario correctamente', async () => {
      req.body = {
        email: 'test@example.com',
        firstName: 'Juan',
        lastName: 'Pérez',
        phone: '123456789',
        rut: '12345678-9',
        password: 'password123'
      };

      const hashedPassword = 'hashedPassword123';
      const userId = 1;
      const token = 'generatedToken';

      bcrypt.hash.mockResolvedValueOnce(hashedPassword);
      mockConnect.mockResolvedValueOnce(mockClient);
      mockClient.query
        .mockResolvedValueOnce(undefined) // BEGIN
        .mockResolvedValueOnce({ rows: [{ id: userId }] }) // INSERT USER
        .mockResolvedValueOnce(undefined) // INSERT CUSTOMER
        .mockResolvedValueOnce(undefined); // COMMIT

      generateToken.mockReturnValueOnce(token);

      await registerUser(req, res);

      expect(bcrypt.hash).toHaveBeenCalledWith('password123', 12);
      expect(mockConnect).toHaveBeenCalled();
      expect(mockClient.query).toHaveBeenCalledWith('BEGIN');
      expect(mockClient.query).toHaveBeenCalledWith(
        expect.stringContaining('INSERT INTO users'),
        ['test@example.com', hashedPassword, 'customer']
      );
      expect(mockClient.query).toHaveBeenCalledWith(
        expect.stringContaining('INSERT INTO customers'),
        [userId, '12345678-9', 'Juan', 'Pérez', '123456789']
      );
      expect(mockClient.query).toHaveBeenCalledWith('COMMIT');
      expect(generateToken).toHaveBeenCalledWith({
        id: userId,
        email: 'test@example.com',
        role: 'customer'
      });
      expect(setTokenCookie).toHaveBeenCalledWith(res, token);
      expect(res.status).toHaveBeenCalledWith(201);
      expect(res.json).toHaveBeenCalledWith({ message: 'Usuario registrado correctamente' });
      expect(mockRelease).toHaveBeenCalled();
    });

    it('debería retornar error 400 si faltan campos obligatorios', async () => {
      req.body = {
        email: 'test@example.com',
        firstName: 'Juan'
        // Faltan campos obligatorios
      };

      await registerUser(req, res);

      expect(res.status).toHaveBeenCalledWith(400);
      expect(res.json).toHaveBeenCalledWith({
        error: 'Faltan datos obligatorios',
        code: 'MISSING_FIELDS'
      });
    });

    it('debería retornar error 409 si el email ya existe', async () => {
      req.body = {
        email: 'existing@example.com',
        firstName: 'Juan',
        lastName: 'Pérez',
        phone: '123456789',
        rut: '12345678-9',
        password: 'password123'
      };

      bcrypt.hash.mockResolvedValueOnce('hashedPassword');
      mockConnect.mockResolvedValueOnce(mockClient);
      
      const duplicateError = new Error('Duplicate key');
      duplicateError.code = '23505';
      
      mockClient.query
        .mockResolvedValueOnce(undefined) // BEGIN
        .mockRejectedValueOnce(duplicateError); // INSERT USER fails

      await registerUser(req, res);

      expect(mockClient.query).toHaveBeenCalledWith('ROLLBACK');
      expect(res.status).toHaveBeenCalledWith(409);
      expect(res.json).toHaveBeenCalledWith({
        error: 'El correo ya está registrado',
        code: 'EMAIL_ALREADY_EXISTS'
      });
      expect(mockRelease).toHaveBeenCalled();
    });

    it('debería manejar errores internos correctamente', async () => {
      req.body = {
        email: 'test@example.com',
        firstName: 'Juan',
        lastName: 'Pérez',
        phone: '123456789',
        rut: '12345678-9',
        password: 'password123'
      };

      bcrypt.hash.mockRejectedValueOnce(new Error('Hash error'));

      await registerUser(req, res);

      expect(res.status).toHaveBeenCalledWith(500);
      expect(res.json).toHaveBeenCalledWith({
        error: 'Error interno del servidor',
        code: 'INTERNAL_ERROR'
      });
    });
  });

  describe('registerGuestCustomer', () => {
    it('debería crear un cliente invitado correctamente', async () => {
      req.body = {
        firstName: 'Juan',
        lastName: 'Pérez',
        phone: '123456789',
        rut: '12345678-9'
      };

      const mockCustomer = {
        id: 1,
        rut: '12345678-9',
        first_name: 'Juan',
        last_name: 'Pérez',
        phone: '123456789',
        user_id: null
      };

      mockQuery.mockResolvedValueOnce({ rows: [mockCustomer] });

      await registerGuestCustomer(req, res);

      expect(mockQuery).toHaveBeenCalledWith(
        expect.stringContaining('INSERT INTO customers'),
        ['12345678-9', 'Juan', 'Pérez', '123456789']
      );
      expect(res.status).toHaveBeenCalledWith(201);
      // CORRECCIÓN: Eliminar isMocked de la expectativa ya que el controller no lo agrega
      expect(res.json).toHaveBeenCalledWith({
        message: 'Cliente invitado creado exitosamente',
        customer: {
          id: 1,
          rut: '12345678-9',
          first_name: 'Juan',
          last_name: 'Pérez',
          phone: '123456789',
          is_guest: true
        }
      });
    });

    it('debería retornar error 400 si faltan campos requeridos', async () => {
      req.body = {
        firstName: 'Juan'
        // Falta lastName
      };

      await registerGuestCustomer(req, res);

      expect(res.status).toHaveBeenCalledWith(400);
      expect(res.json).toHaveBeenCalledWith({
        error: 'Nombre y apellido son requeridos'
      });
    });

    it('debería manejar campos opcionales como null', async () => {
      req.body = {
        firstName: 'Juan',
        lastName: 'Pérez'
        // Sin phone ni rut
      };

      const mockCustomer = {
        id: 1,
        rut: null,
        first_name: 'Juan',
        last_name: 'Pérez',
        phone: null,
        user_id: null
      };

      mockQuery.mockResolvedValueOnce({ rows: [mockCustomer] });

      await registerGuestCustomer(req, res);

      expect(mockQuery).toHaveBeenCalledWith(
        expect.stringContaining('INSERT INTO customers'),
        [null, 'Juan', 'Pérez', null]
      );
      expect(res.status).toHaveBeenCalledWith(201);
    });

    it('debería manejar errores de base de datos', async () => {
      req.body = {
        firstName: 'Juan',
        lastName: 'Pérez'
      };

      mockQuery.mockRejectedValueOnce(new Error('Database error'));

      await registerGuestCustomer(req, res);

      expect(res.status).toHaveBeenCalledWith(500);
      expect(res.json).toHaveBeenCalledWith({
        error: 'Error interno del servidor'
      });
    });
  });

  describe('loginUser', () => {
    it('debería autenticar un usuario correctamente', async () => {
      req.body = {
        email: 'test@example.com',
        password: 'password123'
      };

      const mockUser = {
        id: 1,
        email: 'test@example.com',
        password_hash: 'hashedPassword',
        role: 'customer'
      };

      const token = 'generatedToken';

      getUserByEmail.mockResolvedValueOnce(mockUser);
      bcrypt.compare.mockResolvedValueOnce(true);
      generateToken.mockReturnValueOnce(token);

      await loginUser(req, res);

      expect(getUserByEmail).toHaveBeenCalledWith('test@example.com');
      expect(bcrypt.compare).toHaveBeenCalledWith('password123', 'hashedPassword');
      expect(generateToken).toHaveBeenCalledWith({
        id: 1,
        email: 'test@example.com',
        role: 'customer'
      });
      expect(setTokenCookie).toHaveBeenCalledWith(res, token);
      expect(res.sendStatus).toHaveBeenCalledWith(200);
    });

    it('debería retornar error 400 si no hay body', async () => {
      req.body = null;

      await loginUser(req, res);

      expect(res.status).toHaveBeenCalledWith(400);
      expect(res.json).toHaveBeenCalledWith({
        error: 'No se envió información',
        code: 'NO_BODY'
      });
    });

    it('debería retornar error 400 si faltan credenciales', async () => {
      req.body = {
        email: 'test@example.com'
        // Falta password
      };

      await loginUser(req, res);

      expect(res.status).toHaveBeenCalledWith(400);
      expect(res.json).toHaveBeenCalledWith({
        error: 'Email y contraseña son requeridos',
        code: 'MISSING_CREDENTIALS'
      });
    });

    it('debería retornar error 401 si el email es incorrecto', async () => {
      req.body = {
        email: 'nonexistent@example.com',
        password: 'password123'
      };

      getUserByEmail.mockResolvedValueOnce(null);

      await loginUser(req, res);

      expect(res.status).toHaveBeenCalledWith(401);
      expect(res.json).toHaveBeenCalledWith({
        error: 'Correo electrónico incorrecto',
        code: 'INVALID_EMAIL'
      });
    });

    it('debería retornar error 401 si la contraseña es incorrecta', async () => {
      req.body = {
        email: 'test@example.com',
        password: 'wrongpassword'
      };

      const mockUser = {
        id: 1,
        email: 'test@example.com',
        password_hash: 'hashedPassword',
        role: 'customer'
      };

      getUserByEmail.mockResolvedValueOnce(mockUser);
      bcrypt.compare.mockResolvedValueOnce(false);

      await loginUser(req, res);

      expect(res.status).toHaveBeenCalledWith(401);
      expect(res.json).toHaveBeenCalledWith({
        error: 'Contraseña incorrecta',
        code: 'INVALID_PASSWORD'
      });
    });

    it('debería manejar errores internos', async () => {
      req.body = {
        email: 'test@example.com',
        password: 'password123'
      };

      getUserByEmail.mockRejectedValueOnce(new Error('Database error'));

      await loginUser(req, res);

      expect(res.status).toHaveBeenCalledWith(500);
      expect(res.json).toHaveBeenCalledWith({
        error: 'Error interno del servidor',
        code: 'INTERNAL_ERROR'
      });
    });
  });

  describe('logoutUser', () => {
    it('debería cerrar sesión correctamente', async () => {
      await logoutUser(req, res);

      expect(clearTokenCookie).toHaveBeenCalledWith(res);
      expect(res.sendStatus).toHaveBeenCalledWith(200);
    });

    it('debería manejar errores durante el logout', async () => {
      clearTokenCookie.mockImplementationOnce(() => {
        throw new Error('Cookie error');
      });

      await logoutUser(req, res);

      expect(res.sendStatus).toHaveBeenCalledWith(500);
    });
  });

  describe('verifyToken', () => {
    it('debería retornar isAuthenticated: false si no hay usuario', async () => {
      req.user = null;

      await verifyToken(req, res);

      expect(res.status).toHaveBeenCalledWith(200);
      expect(res.json).toHaveBeenCalledWith({ isAuthenticated: false });
    });

    it('debería retornar isAuthenticated: true si el usuario es válido', async () => {
      req.user = { id: 1, email: 'test@example.com', role: 'customer' };

      checkUserExists.mockResolvedValueOnce(true);

      await verifyToken(req, res);

      expect(checkUserExists).toHaveBeenCalledWith(1);
      expect(res.status).toHaveBeenCalledWith(200);
      expect(res.json).toHaveBeenCalledWith({ isAuthenticated: true });
    });

    it('debería retornar error 401 si el usuario no existe', async () => {
      req.user = { id: 1, email: 'test@example.com', role: 'customer' };

      checkUserExists.mockResolvedValueOnce(false);

      await verifyToken(req, res);

      expect(clearTokenCookie).toHaveBeenCalledWith(res);
      expect(res.status).toHaveBeenCalledWith(401);
      expect(res.json).toHaveBeenCalledWith({
        isAuthenticated: false,
        error: 'Usuario no válido',
        code: 'INVALID_USER'
      });
    });

    it('debería manejar errores internos', async () => {
      req.user = { id: 1, email: 'test@example.com', role: 'customer' };

      checkUserExists.mockRejectedValueOnce(new Error('Database error'));

      await verifyToken(req, res);

      expect(res.status).toHaveBeenCalledWith(500);
      expect(res.json).toHaveBeenCalledWith({
        isAuthenticated: false,
        error: 'Error interno del servidor',
        code: 'INTERNAL_ERROR'
      });
    });
  });

  describe('refreshToken', () => {
    it('debería renovar el token correctamente', async () => {
      req.user = {
        id: 1,
        email: 'test@example.com',
        role: 'customer'
      };

      const newToken = 'newGeneratedToken';
      generateToken.mockReturnValueOnce(newToken);

      await refreshToken(req, res);

      expect(generateToken).toHaveBeenCalledWith({
        id: 1,
        email: 'test@example.com',
        role: 'customer',
        iat: expect.any(Number)
      });
      expect(setTokenCookie).toHaveBeenCalledWith(res, newToken);
      expect(res.status).toHaveBeenCalledWith(200);
      expect(res.json).toHaveBeenCalledWith({
        success: true,
        message: 'Token renovado exitosamente'
      });
    });

    it('debería incluir customer_id si existe', async () => {
      req.user = {
        id: 1,
        email: 'test@example.com',
        role: 'customer',
        customer_id: 123
      };

      const newToken = 'newGeneratedToken';
      generateToken.mockReturnValueOnce(newToken);

      await refreshToken(req, res);

      expect(generateToken).toHaveBeenCalledWith({
        id: 1,
        email: 'test@example.com',
        role: 'customer',
        customer_id: 123,
        iat: expect.any(Number)
      });
    });

    it('debería manejar errores durante la renovación', async () => {
      req.user = {
        id: 1,
        email: 'test@example.com',
        role: 'customer'
      };

      generateToken.mockImplementationOnce(() => {
        throw new Error('Token generation error');
      });

      await refreshToken(req, res);

      expect(res.status).toHaveBeenCalledWith(500);
      expect(res.json).toHaveBeenCalledWith({
        error: 'Error interno del servidor',
        code: 'INTERNAL_ERROR'
      });
    });
  });
});

