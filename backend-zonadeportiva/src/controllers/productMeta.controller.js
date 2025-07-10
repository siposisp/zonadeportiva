import { updateProductStockBySku } from '../services/productMeta.service.js';

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

