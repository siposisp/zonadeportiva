// src/test/services/shippingMethod.service.test.js
import { jest, describe, it, expect, beforeEach } from '@jest/globals';

// 1. Crear el mock de la conexión (igual que en customer)
const mockQuery = jest.fn();

await jest.unstable_mockModule('../../../database/connectionPostgreSQL.js', () => ({
  pool: { query: mockQuery }
}));

// 2. Mock de los modelos - CLAVE: usar la ruta correcta
await jest.unstable_mockModule('../../models/shippingMethod.js', () => ({
  default: jest.fn((data) => ({ ...data, isMocked: true }))
}));

await jest.unstable_mockModule('../../models/city.js', () => ({
  default: jest.fn((data) => ({ ...data, isMocked: true }))
}));

// 3. Importar DESPUÉS de los mocks (igual que en customer)
const { pool } = await import('../../../database/connectionPostgreSQL.js');
const { fetchShippingMethods, fetchCitiesByStateId } = await import('../../services/shippingMethod.service.js');

describe('Servicios de Métodos de Envío', () => {
  beforeEach(() => {
    jest.clearAllMocks();
    mockQuery.mockClear();
  });

  describe('fetchShippingMethods', () => {
    it('debería retornar métodos específicos si la ciudad pertenece a RM', async () => {
      const cityId = 1;
      const rmStateId = 13;
      const shippingMethodIds = [{ shipping_method_id: 101 }, { shipping_method_id: 102 }];
      const shippingMethodsData = [{ id: 101, name: 'Método A' }, { id: 102, name: 'Método B' }];

      mockQuery
        .mockResolvedValueOnce({ rows: [{ id: rmStateId }] })
        .mockResolvedValueOnce({ rows: [{ state_id: rmStateId }] })
        .mockResolvedValueOnce({ rows: [{ name: 'Santiago' }] })
        .mockResolvedValueOnce({ rows: shippingMethodIds })
        .mockResolvedValueOnce({ rows: shippingMethodsData });

      const result = await fetchShippingMethods(cityId);

      expect(result).toHaveLength(2);
      expect(mockQuery).toHaveBeenCalledTimes(5);
    });

    // ... resto de tests
  });

  describe('fetchCitiesByStateId', () => {
    it('debería retornar las ciudades asociadas a una región', async () => {
      const stateId = 8;
      const mockCitiesData = [{ id: 1, name: 'Temuco' }, { id: 2, name: 'Villarrica' }];

      mockQuery.mockResolvedValueOnce({ rows: mockCitiesData });

      const result = await fetchCitiesByStateId(stateId);

      expect(result).toHaveLength(2);
      expect(result[0].name).toBe('Temuco');
      expect(mockQuery).toHaveBeenCalledTimes(1);
    });
  });
});
