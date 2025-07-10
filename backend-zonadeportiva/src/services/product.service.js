import { pool } from '../../database/connectionPostgreSQL.js';

export const validateProductStock = async (productId, quantity) => {
  // Validación de parámetros
  if (!productId || quantity == null) {
    throw new Error('Faltan parámetros: product_id y quantity son requeridos');
  }

  try {
    const query = `
      SELECT stock, stock_status 
      FROM product_meta 
      WHERE product_id = $1
    `;
    const { rows } = await pool.query(query, [productId]);

    if (rows.length === 0) {
      return {
        success: false,
        result: 0,
        message: 'Producto no encontrado en product_meta'
      };
    }

    const { stock, stock_status } = rows[0];
    const stockDisponible = stock_status === 'instock' && stock !== null && stock >= quantity;

    return {
      success: true,
      result: stockDisponible ? 1 : 0,
      stockData: {
        stock,
        stock_status,
        hasStock: stockDisponible
      }
    };

  } catch (error) {
    console.error('Error al validar stock:', error);
    throw new Error('Error interno al validar stock');
  }
};