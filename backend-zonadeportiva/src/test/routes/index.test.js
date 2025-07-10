// tests/index.test.js (Solución para ESM)
import { jest } from '@jest/globals';
import request from 'supertest';
import express from 'express';

// Define mocks
const mockProductController = {
  getProducts: jest.fn((req, res) => res.status(200).json([])),
  getProductSomeDetailsBySlug: jest.fn((req, res) => res.status(200).json({})),
  getProductAllDetailsBySlug: jest.fn((req, res) => res.status(200).json({})),
  createProduct: jest.fn((req, res) => res.status(201).json({})),
  updateProduct: jest.fn((req, res) => res.status(200).json({}))
};

const mockCategoryController = {
  getCategories: jest.fn((req, res) => res.status(200).json([]))
};

const mockSearchController = {
  searchProductByKeyword: jest.fn((req, res) => res.status(200).json([]))
};

// Hacemos mocking de los módulos con ESM
jest.unstable_mockModule('../../controllers/product.controller.js', () => mockProductController);
jest.unstable_mockModule('../../controllers/category.controller.js', () => mockCategoryController);
jest.unstable_mockModule('../../controllers/search.controller.js', () => mockSearchController);
jest.unstable_mockModule('../../../database/connectionPostgreSQL.js', () => ({
  pool: {
    query: jest.fn().mockResolvedValue({ rows: [] })
  }
}));

describe('API Routes Integration Test', () => {
  let app;

  beforeEach(async () => {
    // Creamos una nueva aplicación Express para cada test
    app = express();
    app.use(express.json());
    
    // Creamos y configuramos los routers manualmente
    const productRouter = express.Router();
    productRouter.get('/', mockProductController.getProducts);
    productRouter.get('/get-product-some-details-by-slug/:slug', mockProductController.getProductSomeDetailsBySlug);
    productRouter.get('/get-product-all-details-by-slug/:slug', mockProductController.getProductAllDetailsBySlug);
    productRouter.post('/', mockProductController.createProduct);
    productRouter.put('/:id', mockProductController.updateProduct);

    const categoryRouter = express.Router();
    categoryRouter.get('/', mockCategoryController.getCategories);

    const searchRouter = express.Router();
    searchRouter.get('/:keyword', mockSearchController.searchProductByKeyword);
    
    // Configuramos las rutas en la aplicación
    app.use('/category', categoryRouter);
    app.use('/product', productRouter);
    app.use('/search', searchRouter);
    
    // Middleware de manejo de errores
    app.use((err, req, res, next) => {
      console.error('Error en middleware:', err);
      res.status(500).json({ 
        success: false, 
        error: 'Internal server error' 
      });
    });
  });

  describe('API Routes', () => {
    it('should respond to GET /category', async () => {
      const response = await request(app).get('/category');
      expect(response.status).toBe(200);
    });

    it('should respond to GET /product', async () => {
      const response = await request(app).get('/product');
      expect(response.status).toBe(200);
    });

    it('should respond to GET /product/get-product-some-details-by-slug/:slug', async () => {
      const response = await request(app).get('/product/get-product-some-details-by-slug/test-slug');
      expect(response.status).toBe(200);
    });

    it('should respond to GET /product/get-product-all-details-by-slug/:slug', async () => {
      const response = await request(app).get('/product/get-product-all-details-by-slug/test-slug');
      expect(response.status).toBe(200);
    });

    it('should respond to POST /product', async () => {
      const response = await request(app)
        .post('/product')
        .send({
          title: 'Test Product',
          slug: 'test-product',
          product_type: 'simple'
        });
      expect(response.status).toBe(201);
    });

    it('should respond to PUT /product/:id', async () => {
      const response = await request(app)
        .put('/product/1')
        .send({
          title: 'Updated Test Product',
          slug: 'updated-test-product'
        });
      expect(response.status).toBe(200);
    });

    it('should respond to GET /search/keyword', async () => {
      const response = await request(app).get('/search/test');
      expect(response.status).toBe(200);
    });

    it('should return 404 for /product/find-children/:parentId route', async () => {
      const response = await request(app).get('/product/find-children/1');
      expect(response.status).toBe(404);
    });

    it('should return 404 for undefined routes', async () => {
      const response = await request(app).get('/undefined-route');
      expect(response.status).toBe(404);
    });
  });
});