import { jest } from '@jest/globals';

// Mockear el modelo ProductMeta
const mockProductMeta = jest.fn();
await jest.unstable_mockModule('../../models/productMeta.js', () => ({
  default: mockProductMeta
}));

// Mockear el módulo de base de datos antes de importarlo
const mockQuery = jest.fn();
await jest.unstable_mockModule('../../../database/connectionPostgreSQL.js', () => ({
  pool: { query: mockQuery }
}));

// Luego de hacer el mock, importas lo necesario
const { updateProductStockBySku, getSkuByProductId } = await import('../../services/productMeta.service.js');
const { pool } = await import('../../../database/connectionPostgreSQL.js');

describe('updateProductStockBySku', () => {
  beforeEach(() => {
    mockQuery.mockReset();
    mockProductMeta.mockReset();
  });

  it('debería actualizar el stock y establecer status a "instock" cuando stock > 0', async () => {
    const sku = 'SKU123';
    const stock = 10;
    const mockRow = { 
      id: 1, 
      sku: 'SKU123', 
      product_id: 1, 
      stock: 10, 
      stock_status: 'instock' 
    };
    const mockProductMetaInstance = { 
      id: 1, 
      sku: 'SKU123', 
      productId: 1, 
      stock: 10, 
      stockStatus: 'instock' 
    };

    mockQuery.mockResolvedValueOnce({ rows: [mockRow] });
    mockProductMeta.mockReturnValueOnce(mockProductMetaInstance);

    const result = await updateProductStockBySku(sku, stock);

    expect(result).toEqual([mockProductMetaInstance]);
    expect(mockQuery).toHaveBeenCalledWith(
      expect.stringContaining('UPDATE product_meta'),
      [sku, stock]
    );
    expect(mockQuery).toHaveBeenCalledWith(
      expect.stringContaining('SET stock = $2'),
      [sku, stock]
    );
    expect(mockQuery).toHaveBeenCalledWith(
      expect.stringContaining('stock_status = CASE WHEN $2 > 0 THEN \'instock\' ELSE \'outofstock\' END'),
      [sku, stock]
    );
    expect(mockQuery).toHaveBeenCalledWith(
      expect.stringContaining('WHERE sku = $1'),
      [sku, stock]
    );
    expect(mockQuery).toHaveBeenCalledWith(
      expect.stringContaining('RETURNING *'),
      [sku, stock]
    );
    expect(mockProductMeta).toHaveBeenCalledWith(mockRow);
  });

  it('debería actualizar el stock y establecer status a "outofstock" cuando stock = 0', async () => {
    const sku = 'SKU456';
    const stock = 0;
    const mockRow = { 
      id: 2, 
      sku: 'SKU456', 
      product_id: 2, 
      stock: 0, 
      stock_status: 'outofstock' 
    };
    const mockProductMetaInstance = { 
      id: 2, 
      sku: 'SKU456', 
      productId: 2, 
      stock: 0, 
      stockStatus: 'outofstock' 
    };

    mockQuery.mockResolvedValueOnce({ rows: [mockRow] });
    mockProductMeta.mockReturnValueOnce(mockProductMetaInstance);

    const result = await updateProductStockBySku(sku, stock);

    expect(result).toEqual([mockProductMetaInstance]);
    expect(mockQuery).toHaveBeenCalledWith(
      expect.stringContaining('UPDATE product_meta'),
      [sku, stock]
    );
    expect(mockProductMeta).toHaveBeenCalledWith(mockRow);
  });

  it('debería manejar múltiples filas actualizadas', async () => {
    const sku = 'SKU789';
    const stock = 5;
    const mockRows = [
      { id: 3, sku: 'SKU789', product_id: 3, stock: 5, stock_status: 'instock' },
      { id: 4, sku: 'SKU789', product_id: 4, stock: 5, stock_status: 'instock' }
    ];
    const mockInstances = [
      { id: 3, sku: 'SKU789', productId: 3, stock: 5, stockStatus: 'instock' },
      { id: 4, sku: 'SKU789', productId: 4, stock: 5, stockStatus: 'instock' }
    ];

    mockQuery.mockResolvedValueOnce({ rows: mockRows });
    mockProductMeta
      .mockReturnValueOnce(mockInstances[0])
      .mockReturnValueOnce(mockInstances[1]);

    const result = await updateProductStockBySku(sku, stock);

    expect(result).toEqual(mockInstances);
    expect(mockProductMeta).toHaveBeenCalledTimes(2);
    expect(mockProductMeta).toHaveBeenNthCalledWith(1, mockRows[0]);
    expect(mockProductMeta).toHaveBeenNthCalledWith(2, mockRows[1]);
  });

  it('debería retornar array vacío si no se encuentra el SKU', async () => {
    const sku = 'NONEXISTENT';
    const stock = 10;

    mockQuery.mockResolvedValueOnce({ rows: [] });

    const result = await updateProductStockBySku(sku, stock);

    expect(result).toEqual([]);
    expect(mockQuery).toHaveBeenCalledWith(
      expect.stringContaining('UPDATE product_meta'),
      [sku, stock]
    );
    expect(mockProductMeta).not.toHaveBeenCalled();
  });

  it('debería lanzar un error si la query falla', async () => {
    const sku = 'SKU123';
    const stock = 10;

    mockQuery.mockRejectedValueOnce(new Error('Database error'));

    await expect(updateProductStockBySku(sku, stock)).rejects.toThrow('Database error');
    expect(mockQuery).toHaveBeenCalledWith(
      expect.stringContaining('UPDATE product_meta'),
      [sku, stock]
    );
    expect(mockProductMeta).not.toHaveBeenCalled();
  });

  it('debería manejar stock negativo estableciendo status a "outofstock"', async () => {
    const sku = 'SKU999';
    const stock = -5;
    const mockRow = { 
      id: 5, 
      sku: 'SKU999', 
      product_id: 5, 
      stock: -5, 
      stock_status: 'outofstock' 
    };
    const mockProductMetaInstance = { 
      id: 5, 
      sku: 'SKU999', 
      productId: 5, 
      stock: -5, 
      stockStatus: 'outofstock' 
    };

    mockQuery.mockResolvedValueOnce({ rows: [mockRow] });
    mockProductMeta.mockReturnValueOnce(mockProductMetaInstance);

    const result = await updateProductStockBySku(sku, stock);

    expect(result).toEqual([mockProductMetaInstance]);
    expect(mockQuery).toHaveBeenCalledWith(
      expect.stringContaining('UPDATE product_meta'),
      [sku, stock]
    );
    expect(mockProductMeta).toHaveBeenCalledWith(mockRow);
  });
});

describe('getSkuByProductId', () => {
  beforeEach(() => {
    mockQuery.mockReset();
  });

  it('debería retornar el SKU cuando se encuentra el producto', async () => {
    const productId = 1;
    const mockSku = 'SKU123';
    const mockRow = { sku: mockSku };

    mockQuery.mockResolvedValueOnce({ rows: [mockRow] });

    const result = await getSkuByProductId(productId);

    expect(result).toBe(mockSku);
    expect(mockQuery).toHaveBeenCalledWith(
      expect.stringContaining('SELECT sku'),
      [productId]
    );
    expect(mockQuery).toHaveBeenCalledWith(
      expect.stringContaining('FROM product_meta'),
      [productId]
    );
    expect(mockQuery).toHaveBeenCalledWith(
      expect.stringContaining('WHERE product_id = $1'),
      [productId]
    );
  });

  it('debería retornar null cuando no se encuentra el producto', async () => {
    const productId = 999;

    mockQuery.mockResolvedValueOnce({ rows: [] });

    const result = await getSkuByProductId(productId);

    expect(result).toBeNull();
    expect(mockQuery).toHaveBeenCalledWith(
      expect.stringContaining('SELECT sku'),
      [productId]
    );
  });

  it('debería retornar el primer SKU cuando hay múltiples resultados', async () => {
    const productId = 1;
    const mockRows = [
      { sku: 'SKU123' },
      { sku: 'SKU456' }
    ];

    mockQuery.mockResolvedValueOnce({ rows: mockRows });

    const result = await getSkuByProductId(productId);

    expect(result).toBe('SKU123');
    expect(mockQuery).toHaveBeenCalledWith(
      expect.stringContaining('SELECT sku'),
      [productId]
    );
  });

  it('debería lanzar un error si la query falla', async () => {
    const productId = 1;

    mockQuery.mockRejectedValueOnce(new Error('Database connection failed'));

    await expect(getSkuByProductId(productId)).rejects.toThrow('Database connection failed');
    expect(mockQuery).toHaveBeenCalledWith(
      expect.stringContaining('SELECT sku'),
      [productId]
    );
  });

  it('debería manejar productId como string', async () => {
    const productId = "1";
    const mockSku = 'SKU123';
    const mockRow = { sku: mockSku };

    mockQuery.mockResolvedValueOnce({ rows: [mockRow] });

    const result = await getSkuByProductId(productId);

    expect(result).toBe(mockSku);
    expect(mockQuery).toHaveBeenCalledWith(
      expect.stringContaining('SELECT sku'),
      [productId]
    );
  });

  it('debería manejar productId como 0', async () => {
    const productId = 0;

    mockQuery.mockResolvedValueOnce({ rows: [] });

    const result = await getSkuByProductId(productId);

    expect(result).toBeNull();
    expect(mockQuery).toHaveBeenCalledWith(
      expect.stringContaining('SELECT sku'),
      [productId]
    );
  });
});