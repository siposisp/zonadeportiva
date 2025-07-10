import { jest } from '@jest/globals';

// Mock de la conexión a la base de datos primero
const mockQuery = jest.fn();
await jest.unstable_mockModule('../../../database/connectionPostgreSQL.js', () => ({
  pool: { query: mockQuery }
}));

// Mock del modelo City
const mockCity = jest.fn();
await jest.unstable_mockModule('../../models/city.js', () => ({
  default: mockCity
}));

// Importar después de hacer los mocks
const { pool } = await import('../../../database/connectionPostgreSQL.js');
const { fetchCities, fetchCitiesByStateId } = await import('../../services/city.service.js');

describe('City Service', () => {
  let mockPool;

  beforeEach(() => {
    mockPool = { query: mockQuery };
    jest.clearAllMocks();
    
    // Mock del constructor de City
    mockCity.mockImplementation((data) => ({
      id: data.id,
      name: data.name,
      state_id: data.state_id,
      ...data
    }));
  });

  describe('fetchCities', () => {
    it('should fetch all cities successfully', async () => {
      const mockCitiesData = [
        { id: 1, name: 'Santiago', state_id: 1 },
        { id: 2, name: 'Valparaíso', state_id: 2 },
        { id: 3, name: 'Concepción', state_id: 3 }
      ];

      mockPool.query.mockResolvedValueOnce({ rows: mockCitiesData });

      const result = await fetchCities();

      expect(mockPool.query).toHaveBeenCalledWith(`
        SELECT *
        FROM cities;
      `);
      expect(result).toHaveLength(3);
      expect(mockCity).toHaveBeenCalledTimes(3);
      expect(mockCity).toHaveBeenCalledWith(mockCitiesData[0]);
      expect(mockCity).toHaveBeenCalledWith(mockCitiesData[1]);
      expect(mockCity).toHaveBeenCalledWith(mockCitiesData[2]);
    });

    it('should return empty array when no cities exist', async () => {
      mockPool.query.mockResolvedValueOnce({ rows: [] });

      const result = await fetchCities();

      expect(result).toEqual([]);
      expect(mockCity).not.toHaveBeenCalled();
    });

    it('should handle database errors', async () => {
      const dbError = new Error('Database connection failed');
      mockPool.query.mockRejectedValueOnce(dbError);

      await expect(fetchCities()).rejects.toThrow('Database connection failed');
    });

    it('should handle null response from database', async () => {
      mockPool.query.mockResolvedValueOnce(null);

      await expect(fetchCities()).rejects.toThrow();
    });

    it('should handle undefined rows in response', async () => {
      mockPool.query.mockResolvedValueOnce({ rows: undefined });

      await expect(fetchCities()).rejects.toThrow();
    });
  });

  describe('fetchCitiesByStateId', () => {
    it('should fetch cities by state id successfully', async () => {
      const stateId = 1;
      const mockCitiesData = [
        { id: 1, name: 'Santiago', state_id: 1 },
        { id: 4, name: 'Puente Alto', state_id: 1 },
        { id: 5, name: 'Maipú', state_id: 1 }
      ];

      mockPool.query.mockResolvedValueOnce({ rows: mockCitiesData });

      const result = await fetchCitiesByStateId(stateId);

      expect(mockPool.query).toHaveBeenCalledWith(`
    SELECT *
    FROM cities
    WHERE cities.state_id = $1
  `, [stateId]);
      expect(result).toHaveLength(3);
      expect(mockCity).toHaveBeenCalledTimes(3);
      expect(mockCity).toHaveBeenCalledWith(mockCitiesData[0]);
      expect(mockCity).toHaveBeenCalledWith(mockCitiesData[1]);
      expect(mockCity).toHaveBeenCalledWith(mockCitiesData[2]);
    });

    it('should return empty array when no cities exist for state', async () => {
      const stateId = 999;
      mockPool.query.mockResolvedValueOnce({ rows: [] });

      const result = await fetchCitiesByStateId(stateId);

      expect(result).toEqual([]);
      expect(mockCity).not.toHaveBeenCalled();
    });

    it('should handle invalid state id', async () => {
      const invalidStateId = null;
      mockPool.query.mockResolvedValueOnce({ rows: [] });

      const result = await fetchCitiesByStateId(invalidStateId);

      expect(mockPool.query).toHaveBeenCalledWith(expect.any(String), [invalidStateId]);
      expect(result).toEqual([]);
    });

    it('should handle string state id', async () => {
      const stateId = '1';
      const mockCitiesData = [
        { id: 1, name: 'Santiago', state_id: 1 }
      ];

      mockPool.query.mockResolvedValueOnce({ rows: mockCitiesData });

      const result = await fetchCitiesByStateId(stateId);

      expect(mockPool.query).toHaveBeenCalledWith(expect.any(String), [stateId]);
      expect(result).toHaveLength(1);
    });

    it('should handle zero state id', async () => {
      const stateId = 0;
      mockPool.query.mockResolvedValueOnce({ rows: [] });

      const result = await fetchCitiesByStateId(stateId);

      expect(result).toEqual([]);
    });

    it('should handle negative state id', async () => {
      const stateId = -1;
      mockPool.query.mockResolvedValueOnce({ rows: [] });

      const result = await fetchCitiesByStateId(stateId);

      expect(result).toEqual([]);
    });

    it('should handle database errors', async () => {
      const stateId = 1;
      const dbError = new Error('Database connection failed');
      mockPool.query.mockRejectedValueOnce(dbError);

      await expect(fetchCitiesByStateId(stateId)).rejects.toThrow('Database connection failed');
    });

    it('should handle timeout errors', async () => {
      const stateId = 1;
      const timeoutError = new Error('Query timeout');
      mockPool.query.mockRejectedValueOnce(timeoutError);

      await expect(fetchCitiesByStateId(stateId)).rejects.toThrow('Query timeout');
    });

    it('should handle SQL injection attempts', async () => {
      const maliciousSateId = "1; DROP TABLE cities; --";
      mockPool.query.mockResolvedValueOnce({ rows: [] });

      const result = await fetchCitiesByStateId(maliciousSateId);

      // La query debería usar parámetros preparados, por lo que es segura
      expect(mockPool.query).toHaveBeenCalledWith(expect.any(String), [maliciousSateId]);
      expect(result).toEqual([]);
    });
  });

  describe('Edge Cases and Performance', () => {
    it('should handle large number of cities', async () => {
      const largeCitiesData = Array.from({ length: 1000 }, (_, i) => ({
        id: i + 1,
        name: `City ${i + 1}`,
        state_id: Math.floor(i / 10) + 1
      }));

      mockPool.query.mockResolvedValueOnce({ rows: largeCitiesData });

      const result = await fetchCities();

      expect(result).toHaveLength(1000);
      expect(mockCity).toHaveBeenCalledTimes(1000);
    });

    it('should handle cities with special characters in names', async () => {
      const specialCitiesData = [
        { id: 1, name: 'Ñuñoa', state_id: 1 },
        { id: 2, name: 'Vicuña', state_id: 2 },
        { id: 3, name: "O'Higgins", state_id: 3 },
        { id: 4, name: 'Ciudad-Estado', state_id: 4 }
      ];

      mockPool.query.mockResolvedValueOnce({ rows: specialCitiesData });

      const result = await fetchCities();

      expect(result).toHaveLength(4);
      expect(mockCity).toHaveBeenCalledWith(expect.objectContaining({ name: 'Ñuñoa' }));
      expect(mockCity).toHaveBeenCalledWith(expect.objectContaining({ name: 'Vicuña' }));
      expect(mockCity).toHaveBeenCalledWith(expect.objectContaining({ name: "O'Higgins" }));
      expect(mockCity).toHaveBeenCalledWith(expect.objectContaining({ name: 'Ciudad-Estado' }));
    });

    it('should handle cities with null or empty names', async () => {
      const citiesWithNullNames = [
        { id: 1, name: null, state_id: 1 },
        { id: 2, name: '', state_id: 1 },
        { id: 3, name: '   ', state_id: 1 }
      ];

      mockPool.query.mockResolvedValueOnce({ rows: citiesWithNullNames });

      const result = await fetchCities();

      expect(result).toHaveLength(3);
      expect(mockCity).toHaveBeenCalledWith(expect.objectContaining({ name: null }));
      expect(mockCity).toHaveBeenCalledWith(expect.objectContaining({ name: '' }));
      expect(mockCity).toHaveBeenCalledWith(expect.objectContaining({ name: '   ' }));
    });

    it('should maintain order of cities as returned by database', async () => {
      const orderedCitiesData = [
        { id: 3, name: 'C', state_id: 1 },
        { id: 1, name: 'A', state_id: 1 },
        { id: 2, name: 'B', state_id: 1 }
      ];

      mockPool.query.mockResolvedValueOnce({ rows: orderedCitiesData });

      const result = await fetchCities();

      expect(mockCity).toHaveBeenNthCalledWith(1, orderedCitiesData[0]);
      expect(mockCity).toHaveBeenNthCalledWith(2, orderedCitiesData[1]);
      expect(mockCity).toHaveBeenNthCalledWith(3, orderedCitiesData[2]);
    });
  });
});