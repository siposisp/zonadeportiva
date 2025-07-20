// src/test/services/shippingMethod.service.test.js
import { jest, describe, it, expect, beforeEach } from '@jest/globals';

// 1. Crear el mock de la conexión
const mockQuery = jest.fn();

await jest.unstable_mockModule('../../../database/connectionPostgreSQL.js', () => ({
  pool: { query: mockQuery }
}));

// 2. Mock de los modelos
await jest.unstable_mockModule('../../models/shippingMethod.js', () => ({
  default: jest.fn((data) => ({ ...data, isMocked: true }))
}));

await jest.unstable_mockModule('../../models/city.js', () => ({
  default: jest.fn((data) => ({ ...data, isMocked: true }))
}));

// 3. Importar DESPUÉS de los mocks
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
      const shippingMethodsData = [
        { id: 101, name: 'Método A', price: 3500 }, 
        { id: 102, name: 'Método B', price: 5000 }
      ];

      mockQuery
        .mockResolvedValueOnce({ rows: [{ id: rmStateId }] }) // RM query
        .mockResolvedValueOnce({ rows: [{ state_id: rmStateId }] }) // city state query
        .mockResolvedValueOnce({ rows: shippingMethodIds }) // metropolitan options
        .mockResolvedValueOnce({ rows: shippingMethodsData }); // shipping methods

      const result = await fetchShippingMethods(cityId);

      expect(result).toHaveLength(2);
      expect(result[0].name).toBe('Método A');
      expect(result[1].name).toBe('Método B');
      expect(mockQuery).toHaveBeenCalledTimes(4);
      
      // Verificar que se llamaron las queries correctas
      expect(mockQuery).toHaveBeenNthCalledWith(1, expect.stringContaining('SELECT id'));
      expect(mockQuery).toHaveBeenNthCalledWith(2, expect.stringContaining('SELECT state_id'), [cityId]);
      expect(mockQuery).toHaveBeenNthCalledWith(3, expect.stringContaining('SELECT shipping_method_id'), [cityId]);
    });

    it('debería retornar array vacío si no hay métodos para ciudad de RM', async () => {
      const cityId = 1;
      const rmStateId = 13;

      mockQuery
        .mockResolvedValueOnce({ rows: [{ id: rmStateId }] })
        .mockResolvedValueOnce({ rows: [{ state_id: rmStateId }] })
        .mockResolvedValueOnce({ rows: [] }); // No hay métodos

      const result = await fetchShippingMethods(cityId);

      expect(result).toEqual([]);
      expect(mockQuery).toHaveBeenCalledTimes(3);
    });

    it('debería retornar método genérico si la ciudad NO pertenece a RM', async () => {
      const cityId = 2;
      const rmStateId = 13;
      const otherStateId = 8; // Región de la Araucanía
      const genericMethod = { id: 2, name: 'Envío Nacional', price: 4500 };

      mockQuery
        .mockResolvedValueOnce({ rows: [{ id: rmStateId }] })
        .mockResolvedValueOnce({ rows: [{ state_id: otherStateId }] })
        .mockResolvedValueOnce({ rows: [genericMethod] });

      const result = await fetchShippingMethods(cityId);

      expect(result).toHaveLength(1);
      expect(result[0].name).toBe('Envío Nacional');
      expect(mockQuery).toHaveBeenCalledTimes(3);
      
      // Verificar que se llamó la query del método genérico
      expect(mockQuery).toHaveBeenNthCalledWith(3, expect.stringContaining('SELECT *'), [2]);
    });

    it('debería manejar cuando no existe la región RM', async () => {
      const cityId = 1;

      mockQuery
        .mockResolvedValueOnce({ rows: [] }) // No encuentra RM
        .mockResolvedValueOnce({ rows: [{ state_id: 8 }] })
        .mockResolvedValueOnce({ rows: [{ id: 2, name: 'Envío Nacional' }] });

      const result = await fetchShippingMethods(cityId);

      expect(result).toHaveLength(1);
      expect(result[0].name).toBe('Envío Nacional');
      expect(mockQuery).toHaveBeenCalledTimes(3);
    });

    it('debería manejar cuando no existe la ciudad', async () => {
      const cityId = 999;

      mockQuery
        .mockResolvedValueOnce({ rows: [{ id: 13 }] })
        .mockResolvedValueOnce({ rows: [] }) // Ciudad no existe
        .mockResolvedValueOnce({ rows: [{ id: 2, name: 'Envío Nacional' }] });

      const result = await fetchShippingMethods(cityId);

      expect(result).toHaveLength(1);
      expect(result[0].name).toBe('Envío Nacional');
      expect(mockQuery).toHaveBeenCalledTimes(3);
    });

    it('debería manejar errores de base de datos', async () => {
      const cityId = 1;
      const errorMessage = 'Error de conexión a la base de datos';

      mockQuery.mockRejectedValueOnce(new Error(errorMessage));

      await expect(fetchShippingMethods(cityId)).rejects.toThrow(errorMessage);
      expect(mockQuery).toHaveBeenCalledTimes(1);
    });

    it('debería retornar array vacío cuando no existe el método genérico', async () => {
      const cityId = 2;
      const rmStateId = 13;
      const otherStateId = 8;

      mockQuery
        .mockResolvedValueOnce({ rows: [{ id: rmStateId }] })
        .mockResolvedValueOnce({ rows: [{ state_id: otherStateId }] })
        .mockResolvedValueOnce({ rows: [] }); // No existe método genérico

      const result = await fetchShippingMethods(cityId);

      expect(result).toEqual([]);
      expect(mockQuery).toHaveBeenCalledTimes(3);
    });
  });

  describe('fetchCitiesByStateId', () => {
    it('debería retornar las ciudades asociadas a una región', async () => {
      const stateId = 8;
      const mockCitiesData = [
        { id: 1, name: 'Temuco', state_id: 8 }, 
        { id: 2, name: 'Villarrica', state_id: 8 }
      ];

      mockQuery.mockResolvedValueOnce({ rows: mockCitiesData });

      const result = await fetchCitiesByStateId(stateId);

      expect(result).toHaveLength(2);
      expect(result[0].name).toBe('Temuco');
      expect(result[1].name).toBe('Villarrica');
      expect(result[0].isMocked).toBe(true); // Verifica que se creó con el mock del modelo
      expect(mockQuery).toHaveBeenCalledTimes(1);
      expect(mockQuery).toHaveBeenCalledWith(
        expect.stringContaining('SELECT *'),
        [stateId]
      );
    });

    it('debería retornar array vacío si no hay ciudades para la región', async () => {
      const stateId = 999;

      mockQuery.mockResolvedValueOnce({ rows: [] });

      const result = await fetchCitiesByStateId(stateId);

      expect(result).toEqual([]);
      expect(mockQuery).toHaveBeenCalledTimes(1);
    });

    it('debería retornar una ciudad si solo hay una en la región', async () => {
      const stateId = 15;
      const mockCityData = [{ id: 1, name: 'Arica', state_id: 15 }];

      mockQuery.mockResolvedValueOnce({ rows: mockCityData });

      const result = await fetchCitiesByStateId(stateId);

      expect(result).toHaveLength(1);
      expect(result[0].name).toBe('Arica');
      expect(mockQuery).toHaveBeenCalledTimes(1);
    });

    it('debería manejar errores de base de datos', async () => {
      const stateId = 8;
      const errorMessage = 'Error de conexión a la base de datos';

      mockQuery.mockRejectedValueOnce(new Error(errorMessage));

      await expect(fetchCitiesByStateId(stateId)).rejects.toThrow(errorMessage);
      expect(mockQuery).toHaveBeenCalledTimes(1);
    });

    it('debería manejar región con ID nulo o undefined', async () => {
      mockQuery.mockResolvedValue({ rows: [] });

      const resultNull = await fetchCitiesByStateId(null);
      const resultUndefined = await fetchCitiesByStateId(undefined);

      expect(resultNull).toEqual([]);
      expect(resultUndefined).toEqual([]);
      expect(mockQuery).toHaveBeenCalledTimes(2);
    });
  });
});