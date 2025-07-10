import { jest, describe, it, expect, beforeEach } from '@jest/globals';

// 1. Crear una función mock maestra para la consulta a la base de datos
const mockQuery = jest.fn();

// 2. Usar jest.unstable_mockModule para reemplazar el módulo de la BD
jest.unstable_mockModule('../../../database/connectionPostgreSQL.js', () => ({
  pool: {
    query: mockQuery,
  },
}));

// 3. Importar el servicio DINÁMICAMENTE (después de definir el mock)
const { validateProductStock } = await import('../../services/product.service.js');

describe('validateProductStock', () => {
  beforeEach(() => {
    // Limpiar el historial de la función mock antes de cada prueba
    mockQuery.mockClear();
  });

  it('debería lanzar error si faltan parámetros', async () => {
    await expect(validateProductStock(null, 1))
      .rejects.toThrow('Faltan parámetros: product_id y quantity son requeridos');

    await expect(validateProductStock(123, null))
      .rejects.toThrow('Faltan parámetros: product_id y quantity son requeridos');
  });

  it('debería retornar error si el producto no está en product_meta', async () => {
    // 4. Usar la función mock directamente para simular respuestas
    mockQuery.mockResolvedValueOnce({ rows: [] });

    const result = await validateProductStock(123, 1);

    expect(result).toEqual({
      success: false,
      result: 0,
      message: 'Producto no encontrado en product_meta'
    });
  });

  it('debería retornar result 1 si hay stock suficiente y status instock', async () => {
    mockQuery.mockResolvedValueOnce({
      rows: [{ stock: 10, stock_status: 'instock' }]
    });

    const result = await validateProductStock(123, 5);

    expect(result).toEqual({
      success: true,
      result: 1,
      stockData: {
        stock: 10,
        stock_status: 'instock',
        hasStock: true
      }
    });
  });

  it('debería retornar result 0 si no hay suficiente stock', async () => {
    mockQuery.mockResolvedValueOnce({
      rows: [{ stock: 2, stock_status: 'instock' }]
    });

    const result = await validateProductStock(123, 5);

    expect(result).toEqual({
      success: true,
      result: 0,
      stockData: {
        stock: 2,
        stock_status: 'instock',
        hasStock: false
      }
    });
  });

  it('debería retornar result 0 si el stock_status no es "instock"', async () => {
    mockQuery.mockResolvedValueOnce({
      rows: [{ stock: 10, stock_status: 'outofstock' }]
    });

    const result = await validateProductStock(123, 5);

    expect(result).toEqual({
      success: true,
      result: 0,
      stockData: {
        stock: 10,
        stock_status: 'outofstock',
        hasStock: false
      }
    });
  });

  it('debería lanzar un error si ocurre un error en la base de datos', async () => {
    // Mockear console.error para evitar output en las pruebas
    const consoleSpy = jest.spyOn(console, 'error').mockImplementation(() => {});
    
    mockQuery.mockRejectedValueOnce(new Error('DB crash'));

    await expect(validateProductStock(123, 1))
      .rejects.toThrow('Error interno al validar stock');

    // Verificar que console.error fue llamado con el error correcto
    expect(consoleSpy).toHaveBeenCalledWith('Error al validar stock:', new Error('DB crash'));
    
    // Restaurar console.error
    consoleSpy.mockRestore();
  });
});