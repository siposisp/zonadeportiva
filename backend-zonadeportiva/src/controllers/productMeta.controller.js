import { updateProductStockBySku } from '../services/productMeta.service.js';

/**
 * @swagger
 * /product-meta/update-product-stock/{sku}/{stock}:
 *   patch:
 *     summary: Actualizar stock de un producto por SKU
 *     description: Actualiza la cantidad de stock de un producto específico usando su SKU. Este valor se guarda en la tabla `product_meta`.
 *     tags:
 *       - Productos - Metadatos
 *     parameters:
 *       - in: path
 *         name: sku
 *         required: true
 *         schema:
 *           type: string
 *         description: SKU del producto a actualizar
 *         example: "ZAP123-NEG-42"
 *       - in: path
 *         name: stock
 *         required: true
 *         schema:
 *           type: integer
 *         description: Nueva cantidad de stock para el producto
 *         example: 15
 *     responses:
 *       200:
 *         description: Stock actualizado correctamente
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 product_meta:
 *                   type: object
 *                   description: Registro actualizado en la tabla product_meta
 *                   properties:
 *                     id:
 *                       type: integer
 *                       description: ID del registro de `product_meta`
 *                       example: 102
 *                     sku:
 *                       type: string
 *                       description: SKU del producto
 *                       example: "ZAP123-NEG-42"
 *                     stock:
 *                       type: integer
 *                       description: Nuevo stock actualizado
 *                       example: 15
 *                     stock_status:
 *                       type: string
 *                       description: Estado del stock
 *                       example: "instock"
 *       500:
 *         description: Error interno al actualizar el producto
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 message:
 *                   type: string
 *                   description: Mensaje de error
 *                   example: "Error interno al actualizar el producto"
 */
export const updateProductStockByProdSku = async (req, res) => {
  const { sku, stock } = req.params;
  try {
    const product_meta = await updateProductStockBySku(sku, stock);
    return res.status(200).json({ product_meta });
  } catch (err) {
    console.error('Error al actualizar el producto', err);
    return res
      .status(500)
      .json({ message: 'Error interno al actualizar el producto' });
  }
};

