// Mock de la conexión a PostgreSQL
jest.mock('../../database/connectionPostgreSQL.js', () => ({
  pool: {
    query: jest.fn()
  }
}));

// Mock de variables de entorno
process.env.NODE_ENV = 'test';
process.env.LINKIFY_USERNAME = 'test_user';
process.env.LINKIFY_PASSWORD = 'test_pass';
process.env.LINKIFY_MERCHANT = 'test_merchant';
process.env.LINKIFY_BANK = 'test_bank';
process.env.LINKIFY_WEBHOOK_SECRET = 'test_secret';
process.env.LINKIFY_TIMEOUT = '5000';

// Configuración global de timeouts
jest.setTimeout(10000);