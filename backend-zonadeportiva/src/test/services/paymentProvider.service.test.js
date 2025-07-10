import { jest, describe, it, expect, beforeEach } from '@jest/globals';

// 1. Crear funciones y clases mock maestras
const mockQuery = jest.fn();
const MockPaymentProvider = jest.fn();

// 2. Aplicar mocks con el método para ES Modules
jest.unstable_mockModule('../../../database/connectionPostgreSQL.js', () => ({
  pool: {
    query: mockQuery,
  },
}));

// El modelo es probablemente una exportación por defecto (default export)
jest.unstable_mockModule('../../models/paymentProvider.js', () => ({
  default: MockPaymentProvider,
}));


// 3. Importar el servicio DESPUÉS de definir los mocks
const { fetchPaymentProviders } = await import('../../services/paymentProvider.service.js');

describe('fetchPaymentProviders', () => {
  beforeEach(() => {
    // 4. Limpiar los mocks antes de cada prueba
    mockQuery.mockClear();
    MockPaymentProvider.mockClear();
  });

  it('debería retornar una lista de instancias de PaymentProvider', async () => {
    const mockData = [
      { id: 1, name: 'WebPay' },
      { id: 2, name: 'Paypal' }
    ];

    mockQuery.mockResolvedValueOnce({ rows: mockData });

    // Simular que la clase mock devuelve el objeto original
    MockPaymentProvider.mockImplementation(data => data);

    const result = await fetchPaymentProviders();

    expect(mockQuery).toHaveBeenCalledWith(expect.stringContaining('SELECT id, name'));
    expect(result).toEqual(mockData);
    expect(MockPaymentProvider).toHaveBeenCalledTimes(2);
    expect(MockPaymentProvider).toHaveBeenCalledWith(mockData[0]);
    expect(MockPaymentProvider).toHaveBeenCalledWith(mockData[1]);
  });

  it('debería retornar una lista vacía si no hay resultados', async () => {
    mockQuery.mockResolvedValueOnce({ rows: [] });

    const result = await fetchPaymentProviders();

    expect(result).toEqual([]);
    expect(MockPaymentProvider).not.toHaveBeenCalled();
  });

  it('debería lanzar un error si la query falla', async () => {
    const dbError = new Error('Database failed');
    mockQuery.mockRejectedValueOnce(dbError);

    await expect(fetchPaymentProviders()).rejects.toThrow('Database failed');
  });
});