import { pool } from '../../database/connectionPostgreSQL.js';
import PaymentProvider from '../models/paymentProvider.js';

export const fetchPaymentProviders = async () => {
  const result = await pool.query(`
    SELECT id, name 
    FROM payment_providers;
    `);
  return result.rows.map(row => new PaymentProvider(row));
};
