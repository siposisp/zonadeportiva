import { pool } from '../../database/connectionPostgreSQL.js';
import bcrypt from 'bcrypt';


// Verificar si existe un usuario por email
export const getUserByEmail = async (email) => {
  const query = `SELECT * FROM users WHERE email = $1`;
  const result = await pool.query(query, [email]);
  return result.rows[0] || null;
};

// Verificar si existe un usuario por ID
export const checkUserExists = async (userId) => {
  const query = `SELECT id FROM users WHERE id = $1`;
  const result = await pool.query(query, [userId]);
  return result.rows.length > 0;
};


// Cambiar contraseña de un usuario
export const setUserPassword = async (email, newPassword) => {
  try {
    // Cifrar la nueva contraseña con bcrypt
    const password_hash = await bcrypt.hash(newPassword, 12);
    
    // Actualizar en la base de datos usando password_hash (no password)
    const query = `UPDATE users SET password_hash = $1 WHERE email = $2`;
    const result = await pool.query(query, [password_hash, email]);
    
    return result.rowCount > 0;
  } catch (error) {
    console.error('Error al actualizar contraseña:', error);
    throw error;
  }
};