// tests/routes/category.routes.test.js
import { jest } from '@jest/globals';
import request from 'supertest';
import express from 'express';

// Mock de los controladores
const mockGetCategories = jest.fn();
const mockGetGroupedCategories = jest.fn();
const mockGetProductsByCategories = jest.fn();

// Mock del módulo categoryController
jest.unstable_mockModule('../../../src/controllers/category.controller.js', () => ({
  getCategories: mockGetCategories,
  getGroupedCategories: mockGetGroupedCategories,
  getProductsByCategories: mockGetProductsByCategories
}));

// Importaciones dinámicas después de los mocks
let categoryRoutes;

// Configuración antes de las pruebas
beforeAll(async () => {
  categoryRoutes = (await import('../../../src/routes/category.routes.js')).default;
});

describe('Category Routes', () => {
  let app;

  beforeEach(() => {
    // Reset all mocks before each test
    jest.clearAllMocks();
    
    // Create a fresh app instance for each test
    app = express();
    app.use(express.json());
    app.use('/category/categories', categoryRoutes);
  });

  describe('GET /category/categories', () => {
    it('should call getCategories controller and return 200', async () => {
      // Mock the controller response
      mockGetCategories.mockImplementation((req, res) => {
        res.status(200).json({ success: true, data: [{ id: 1, name: 'Category 1' }] });
      });

      const response = await request(app).get('/category/categories');
      
      expect(response.status).toBe(200);
      expect(mockGetCategories).toHaveBeenCalledTimes(1);
      expect(response.body).toEqual({ success: true, data: [{ id: 1, name: 'Category 1' }] });
    });
  });

  describe('GET /category/categories/get-grouped-categories', () => {
    it('should call getGroupedCategories controller and return 200', async () => {
      // Mock the controller response
      mockGetGroupedCategories.mockImplementation((req, res) => {
        res.status(200).json({ 
          success: true, 
          data: {
            group1: [{ id: 1, name: 'Category 1' }],
            group2: [{ id: 2, name: 'Category 2' }]
          } 
        });
      });

      const response = await request(app).get('/category/categories/get-grouped-categories');
      
      expect(response.status).toBe(200);
      expect(mockGetGroupedCategories).toHaveBeenCalledTimes(1);
      expect(response.body.success).toBe(true);
      expect(response.body.data).toHaveProperty('group1');
      expect(response.body.data).toHaveProperty('group2');
    });
  });

  describe('GET /category/categories/products-by-categories', () => {
    it('should call getProductsByCategories controller and return 200', async () => {
      // Mock the controller response
      mockGetProductsByCategories.mockImplementation((req, res) => {
        res.status(200).json({ 
          success: true, 
          data: [
            { 
              categoryId: 1, 
              categoryName: 'Category 1',
              products: [{ id: 1, name: 'Product 1' }] 
            }
          ] 
        });
      });

      const response = await request(app).get('/category/categories/products-by-categories');
      
      expect(response.status).toBe(200);
      expect(mockGetProductsByCategories).toHaveBeenCalledTimes(1);
      expect(response.body.success).toBe(true);
      expect(Array.isArray(response.body.data)).toBe(true);
      expect(response.body.data[0]).toHaveProperty('products');
    });
  });
});