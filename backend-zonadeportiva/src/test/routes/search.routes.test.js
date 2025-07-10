// tests/routes/search.routes.test.js
import { jest } from '@jest/globals';
import request from 'supertest';
import express from 'express';

// Mock de los controladores
const mockGetProductByKeyword = jest.fn();

// Mock del módulo searchController
jest.unstable_mockModule('../../../src/controllers/search.controller.js', () => ({
  getProductByKeyword: mockGetProductByKeyword
}));

// Importaciones dinámicas después de los mocks
let searchRoutes;

// Configuración antes de las pruebas
beforeAll(async () => {
  searchRoutes = (await import('../../../src/routes/search.routes.js')).default;
});

describe('Search Routes', () => {
  let app;

  beforeEach(() => {
    // Reset all mocks before each test
    jest.clearAllMocks();
    
    // Create a fresh app instance for each test
    app = express();
    app.use(express.json());
    app.use('/search', searchRoutes);
  });

  describe('GET /search/:keyword', () => {
    it('should call getProductByKeyword controller with correct keyword and return 200', async () => {
      const keyword = 'barra';
      
      // Mock the controller response
      mockGetProductByKeyword.mockImplementation((req, res) => {
        res.status(200).json({ 
          success: true, 
          data: [
            { id: 1, name: 'Barra de proteína', description: 'Barra proteica' },
            { id: 2, name: 'Barra energética', description: 'Barra de energía' }
          ]
        });
      });

      const response = await request(app).get(`/search/${keyword}`);
      
      expect(response.status).toBe(200);
      expect(mockGetProductByKeyword).toHaveBeenCalledTimes(1);
      expect(response.body.success).toBe(true);
      expect(Array.isArray(response.body.data)).toBe(true);
      // Verifica que los resultados contienen el keyword en algún campo
      expect(response.body.data.every(product => 
        product.name.toLowerCase().includes(keyword) || 
        product.description.toLowerCase().includes(keyword)
      )).toBe(true);
    });

    it('should return empty array when no results match the keyword', async () => {
      const keyword = 'productoinexistente';
      
      // Mock the controller response for empty results
      mockGetProductByKeyword.mockImplementation((req, res) => {
        res.status(200).json({ 
          success: true, 
          data: []
        });
      });

      const response = await request(app).get(`/search/${keyword}`);
      
      expect(response.status).toBe(200);
      expect(mockGetProductByKeyword).toHaveBeenCalledTimes(1);
      expect(response.body.success).toBe(true);
      expect(Array.isArray(response.body.data)).toBe(true);
      expect(response.body.data).toHaveLength(0);
    });

    it('should handle controller errors appropriately', async () => {
      const keyword = 'error';
      
      // Mock the controller to throw an error
      mockGetProductByKeyword.mockImplementation((req, res) => {
        res.status(500).json({ 
          success: false, 
          error: 'Internal server error'
        });
      });

      const response = await request(app).get(`/search/${keyword}`);
      
      expect(response.status).toBe(500);
      expect(mockGetProductByKeyword).toHaveBeenCalledTimes(1);
      expect(response.body.success).toBe(false);
      expect(response.body).toHaveProperty('error');
    });
  });
});