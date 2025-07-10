import { pool } from '../../database/connectionPostgreSQL.js';
import ProductMeta from '../models/productMeta.js';



// Actualiza el stock de un producto por el ID del producto 
export const updateProductStockBySku = async (sku, stock) => {
  const result = await pool.query(`
    UPDATE product_meta
    SET stock = $2, 
        stock_status = CASE WHEN $2 > 0 THEN 'instock' ELSE 'outofstock' END
    WHERE sku = $1
    RETURNING *
  `, [sku, stock]);

  return result.rows.map(row => new ProductMeta(row));
}




export const getSkuByProductId = async (productId) => {
  const result = await pool.query(`
    SELECT sku
    FROM product_meta
    WHERE product_id = $1
  `, [productId]);

  return result.rows.length > 0 ? result.rows[0].sku : null;
};
