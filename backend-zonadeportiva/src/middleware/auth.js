import jwt from 'jsonwebtoken';

// Variables de entorno
const JWT_SECRET = process.env.JWT_SECRET;
const JWT_EXPIRES_IN = process.env.JWT_EXPIRES_IN;
const COOKIE_MAX_AGE = process.env.COOKIE_MAX_AGE;

// Configuración de cookies
const COOKIE_OPTIONS = {
  httpOnly: true,
  secure: process.env.NODE_ENV === 'production', // Solo HTTPS en producción
  sameSite: process.env.NODE_ENV === 'production' ? 'none' : 'lax',
  maxAge: COOKIE_MAX_AGE,
  path: '/'
};

// Generar token
export const generateToken = (payload) => {
  return jwt.sign(payload, JWT_SECRET, { 
    expiresIn: JWT_EXPIRES_IN 
  });
};

// Verificar token
export const verifyToken = (token) => {
  return jwt.verify(token, JWT_SECRET);
};

// Extraer token de la request (cookies o header)
export const extractToken = (req) => {
  // Primero intentar obtener de cookies
  if (req.cookies && req.cookies.JWT) {
    return req.cookies.JWT;
  }
  
  // Si no hay cookie, intentar obtener del header Authorization
  const authHeader = req.headers['authorization'];
  if (authHeader && authHeader.startsWith('Bearer ')) {
    return authHeader.split(' ')[1];
  }
  
  return null;
};

// Middleware de autenticación mejorado
export const authenticateToken = (req, res, next) => {
  const token = extractToken(req);

  if (!token) {
    return res.status(401).json({ 
      error: 'Token de acceso requerido',
      code: 'NO_TOKEN'
    });
  }

  try {
    const decoded = verifyToken(token);
    req.user = decoded;
    next();
  } catch (error) {
    // Limpiar cookie si el token es inválido
    res.clearCookie('JWT', { 
      path: '/',
      httpOnly: true,
      secure: process.env.NODE_ENV === 'production',
      sameSite: process.env.NODE_ENV === 'production' ? 'none' : 'lax'
    });

    if (error.name === 'TokenExpiredError') {
      return res.status(401).json({ 
        error: 'Token expirado',
        code: 'TOKEN_EXPIRED'
      });
    } else if (error.name === 'JsonWebTokenError') {
      return res.status(403).json({ 
        error: 'Token inválido',
        code: 'INVALID_TOKEN'
      });
    }
    
    return res.status(403).json({ 
      error: 'Error al verificar token',
      code: 'TOKEN_ERROR'
    });
  }
};

// Función para establecer cookie con token
export const setTokenCookie = (res, token) => {
  res.cookie('JWT', token, COOKIE_OPTIONS);
};

// Función para limpiar cookie
export const clearTokenCookie = (res) => {
  res.clearCookie('JWT', {
    path: '/',
    httpOnly: true,
    secure: process.env.NODE_ENV === 'production',
    sameSite: process.env.NODE_ENV === 'production' ? 'none' : 'lax'
  });
};

// Middleware para verificar role de admin
export const requireAdmin = (req, res, next) => {
  if (!req.user || req.user.role !== 'admin') {
    return res.status(403).json({ 
      error: 'Acceso denegado. Se requieren permisos de administrador',
      code: 'INSUFFICIENT_PERMISSIONS'
    });
  }
  next();
};

// Middleware para verificar que sea customer o admin
export const requireCustomerOrAdmin = (req, res, next) => {
  if (!req.user || !['customer', 'admin'].includes(req.user.role)) {
    return res.status(403).json({ 
      error: 'Acceso denegado. Se requieren permisos de cliente o administrador',
      code: 'INSUFFICIENT_PERMISSIONS'
    });
  }
  next();
};

// Middleware opcional - verificar token sin forzar autenticación
export const optionalAuth = (req, res, next) => {
  const token = extractToken(req);
  
  if (token) {
    try {
      const decoded = verifyToken(token);
      req.user = decoded;
    } catch (error) {
      // No hacer nada, continuar sin usuario
      req.user = null;
    }
  }
  
  next();
};