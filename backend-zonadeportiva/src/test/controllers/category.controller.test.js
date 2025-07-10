import { jest, describe, it, expect, beforeEach } from '@jest/globals';

// Mock de la conexión a la base de datos
const mockQuery = jest.fn();

await jest.unstable_mockModule('../../../database/connectionPostgreSQL.js', () => ({
  pool: { query: mockQuery }
}));

// Mock del modelo Category
await jest.unstable_mockModule('../../models/category.js', () => ({
  default: jest.fn((data) => ({ ...data, isMocked: true }))
}));

// Mock del modelo Product
await jest.unstable_mockModule('../../models/product.js', () => ({
  default: jest.fn((data) => ({ ...data, isMocked: true }))
}));

// Mock de las funciones del product controller
await jest.unstable_mockModule('../../controllers/product.controller.js', () => ({
  getValueDetailsAndProducts: jest.fn(),
  sortProducts: jest.fn()
}));

// Importar después de los mocks
const { pool } = await import('../../../database/connectionPostgreSQL.js');
const Category = (await import('../../models/category.js')).default;
const Product = (await import('../../models/product.js')).default;
const { getValueDetailsAndProducts, sortProducts } = await import('../../controllers/product.controller.js');
const {
  getCategories,
  getProductsByCategorySlug,
  getGroupedCategories,
  getProductsByCategories
} = await import('../../controllers/category.controller.js');

describe('Category Controller', () => {
  let req, res;

  beforeEach(() => {
    jest.clearAllMocks();
    mockQuery.mockClear();
    getValueDetailsAndProducts.mockClear();
    sortProducts.mockClear();

    req = {
      params: {},
      query: {},
      body: {}
    };

    res = {
      status: jest.fn().mockReturnThis(),
      json: jest.fn()
    };

    // Silenciar console.error durante las pruebas
    jest.spyOn(console, 'error').mockImplementation(() => {});
  });

  afterEach(() => {
    console.error.mockRestore();
  });

  describe('getCategories', () => {
    it('debería retornar todas las categorías', async () => {
      const mockCategories = [
        { id: 1, name: 'Categoría 1', slug: 'categoria-1' },
        { id: 2, name: 'Categoría 2', slug: 'categoria-2' }
      ];

      mockQuery.mockResolvedValueOnce({ rows: mockCategories });

      await getCategories(req, res);

      expect(mockQuery).toHaveBeenCalledWith('SELECT * FROM categories');
      expect(res.status).toHaveBeenCalledWith(200);
      expect(res.json).toHaveBeenCalledWith([
        { id: 1, name: 'Categoría 1', slug: 'categoria-1', isMocked: true },
        { id: 2, name: 'Categoría 2', slug: 'categoria-2', isMocked: true }
      ]);
    });

    it('debería retornar array vacío si no hay categorías', async () => {
      mockQuery.mockResolvedValueOnce({ rows: [] });

      await getCategories(req, res);

      expect(res.status).toHaveBeenCalledWith(200);
      expect(res.json).toHaveBeenCalledWith([]);
    });

    it('debería manejar errores correctamente', async () => {
      mockQuery.mockRejectedValueOnce(new Error('Database error'));

      await getCategories(req, res);

      expect(console.error).toHaveBeenCalledWith('Error al obtener categorias:', expect.any(Error));
      expect(res.status).toHaveBeenCalledWith(500);
      expect(res.json).toHaveBeenCalledWith({ message: 'Error al obtener categorias' });
    });
  });

  describe('getProductsByCategorySlug', () => {
    it('debería retornar productos por slug de categoría', async () => {
      const slug = 'test-category';
      const mockProducts = [
        { id: 1, title: 'Producto 1', slug: 'producto-1' },
        { id: 2, title: 'Producto 2', slug: 'producto-2' }
      ];

      req.params.slug = slug;
      mockQuery.mockResolvedValueOnce({ rows: mockProducts });

      await getProductsByCategorySlug(req, res);

      expect(mockQuery).toHaveBeenCalledWith('SELECT * FROM productos WHERE slug = $1', [slug]);
      expect(res.status).toHaveBeenCalledWith(200);
      expect(res.json).toHaveBeenCalledWith([
        { id: 1, title: 'Producto 1', slug: 'producto-1', isMocked: true },
        { id: 2, title: 'Producto 2', slug: 'producto-2', isMocked: true }
      ]);
    });

    it('debería retornar array vacío si no hay productos', async () => {
      req.params.slug = 'categoria-sin-productos';
      mockQuery.mockResolvedValueOnce({ rows: [] });

      await getProductsByCategorySlug(req, res);

      expect(res.status).toHaveBeenCalledWith(200);
      expect(res.json).toHaveBeenCalledWith([]);
    });

    it('debería manejar errores correctamente', async () => {
      req.params.slug = 'test-category';
      mockQuery.mockRejectedValueOnce(new Error('Database error'));

      await getProductsByCategorySlug(req, res);

      expect(console.error).toHaveBeenCalledWith('Error al obtener productos por categoria:', expect.any(Error));
      expect(res.status).toHaveBeenCalledWith(500);
      expect(res.json).toHaveBeenCalledWith({ message: 'Error al obtener productos por categoria' });
    });
  });

  describe('getGroupedCategories', () => {
    it('debería retornar categorías agrupadas con subcategorías', async () => {
      const mockParentCategories = [
        { id: 1, name: 'Categoría Padre 1', slug: 'categoria-padre-1' },
        { id: 2, name: 'Categoría Padre 2', slug: 'categoria-padre-2' }
      ];
      const mockSubcategories1 = [
        { id: 3, name: 'Subcategoría 1', slug: 'subcategoria-1' }
      ];
      const mockSubcategories2 = [
        { id: 4, name: 'Subcategoría 2', slug: 'subcategoria-2' }
      ];

      mockQuery
        .mockResolvedValueOnce({ rows: mockParentCategories })
        .mockResolvedValueOnce({ rows: mockSubcategories1 })
        .mockResolvedValueOnce({ rows: mockSubcategories2 });

      await getGroupedCategories(req, res);

      expect(res.status).toHaveBeenCalledWith(200);
      expect(res.json).toHaveBeenCalledWith([
        {
          parent_id: 1,
          slug: 'categoria-padre-1',
          category: 'Categoría Padre 1',
          subcategories: mockSubcategories1
        },
        {
          parent_id: 2,
          slug: 'categoria-padre-2',
          category: 'Categoría Padre 2',
          subcategories: mockSubcategories2
        }
      ]);
    });

    it('debería retornar categorías padre sin subcategorías', async () => {
      const mockParentCategories = [
        { id: 1, name: 'Categoría Sin Hijos', slug: 'categoria-sin-hijos' }
      ];

      mockQuery
        .mockResolvedValueOnce({ rows: mockParentCategories })
        .mockResolvedValueOnce({ rows: [] }); // Sin subcategorías

      await getGroupedCategories(req, res);

      expect(res.status).toHaveBeenCalledWith(200);
      expect(res.json).toHaveBeenCalledWith([
        {
          parent_id: 1,
          slug: 'categoria-sin-hijos',
          category: 'Categoría Sin Hijos',
          subcategories: []
        }
      ]);
    });

    it('debería retornar array vacío si no hay categorías padre', async () => {
      mockQuery.mockResolvedValueOnce({ rows: [] });

      await getGroupedCategories(req, res);

      expect(res.status).toHaveBeenCalledWith(200);
      expect(res.json).toHaveBeenCalledWith([]);
    });

    it('debería manejar errores en getParentCategories', async () => {
      mockQuery.mockRejectedValueOnce(new Error('Database error'));

      await getGroupedCategories(req, res);

      expect(console.error).toHaveBeenCalledWith('Error al obtener categorías y subcategorías:', expect.any(Error));
      expect(res.status).toHaveBeenCalledWith(500);
      expect(res.json).toHaveBeenCalledWith({ message: 'Error al obtener categorías y subcategorías' });
    });

    it('debería manejar errores en getSubcategoriesByParent', async () => {
      const mockParentCategories = [
        { id: 1, name: 'Categoría Padre 1', slug: 'categoria-padre-1' }
      ];

      mockQuery
        .mockResolvedValueOnce({ rows: mockParentCategories })
        .mockRejectedValueOnce(new Error('Subcategory error'));

      await getGroupedCategories(req, res);

      expect(console.error).toHaveBeenCalledWith('Error al obtener categorías y subcategorías:', expect.any(Error));
      expect(res.status).toHaveBeenCalledWith(500);
      expect(res.json).toHaveBeenCalledWith({ message: 'Error al obtener categorías y subcategorías' });
    });
  });

  describe('getProductsByCategories', () => {
    it('debería retornar error 400 si no se proporciona slug', async () => {
      req.body = {};

      await getProductsByCategories(req, res);

      expect(res.status).toHaveBeenCalledWith(400);
      expect(res.json).toHaveBeenCalledWith({ message: 'Falta el parámetro: slug es requerido' });
    });

    it('debería retornar error 400 si slug es null', async () => {
      req.body = { slug: null };

      await getProductsByCategories(req, res);

      expect(res.status).toHaveBeenCalledWith(400);
      expect(res.json).toHaveBeenCalledWith({ message: 'Falta el parámetro: slug es requerido' });
    });

    it('debería retornar error 400 si slug es string vacío', async () => {
      req.body = { slug: '' };

      await getProductsByCategories(req, res);

      expect(res.status).toHaveBeenCalledWith(400);
      expect(res.json).toHaveBeenCalledWith({ message: 'Falta el parámetro: slug es requerido' });
    });

    it('debería manejar errores cuando no se encuentra la categoría', async () => {
      req.body = { slug: 'categoria-inexistente' };
      mockQuery.mockResolvedValueOnce({ rows: [] });

      await getProductsByCategories(req, res);

      expect(res.status).toHaveBeenCalledWith(200);
      expect(res.json).toHaveBeenCalledWith([]);
    });

    it('debería retornar productos vacíos si no hay productos en la categoría', async () => {
      const slug = 'categoria-sin-productos';
      req.body = { slug };

      mockQuery
        .mockResolvedValueOnce({ rows: [{ id: 1, parent_id: null }] })
        .mockResolvedValueOnce({ rows: [] });

      await getProductsByCategories(req, res);

      expect(res.status).toHaveBeenCalledWith(200);
      expect(res.json).toHaveBeenCalledWith([]);
    });

    it('debería retornar productos con detalles correctamente', async () => {
      const slug = 'categoria-con-productos';
      req.body = { slug, page: 1, sort: 'price_asc' };

      const mockProducts = [
        { id: 1, title: 'Producto 1', slug: 'producto-1' }
      ];
      const mockDetails = [
        { product_id: '1', price: 100, regular_price: 120, sale_price: null, visibility: 'visible' }
      ];
      const mockPaginatedProducts = [
        { id: 1, title: 'Producto 1', slug: 'producto-1', price: 100, visibility: 'visible' }
      ];

      mockQuery
        .mockResolvedValueOnce({ rows: [{ id: 1, parent_id: null }] })
        .mockResolvedValueOnce({ rows: mockProducts })
        .mockResolvedValueOnce({ rows: mockDetails });

      sortProducts.mockResolvedValueOnce(mockPaginatedProducts);

      await getProductsByCategories(req, res);

      expect(res.status).toHaveBeenCalledWith(200);
      expect(res.json).toHaveBeenCalledWith({
        slug,
        totalPages: expect.any(Number),
        page: 1,
        totalProducts: expect.any(Number),
        sortBy: 'price',
        order: 'asc',
        products: mockPaginatedProducts
      });
    });

    it('debería manejar productos con variantes cuando no hay metadata', async () => {
      const slug = 'categoria-con-variantes';
      req.body = { slug, page: 1, sort: 'default' };

      const mockProducts = [
        { id: 1, title: 'Producto con Variantes', slug: 'producto-variantes' }
      ];
      const mockVariants = {
        rows: [
          { price: 50, visibility: 'visible' },
          { price: 75, visibility: 'visible' }
        ]
      };
      const mockPaginatedProducts = [
        { id: 1, title: 'Producto con Variantes', slug: 'producto-variantes', price: [50, 75], visibility: 'visible' }
      ];

      mockQuery
        .mockResolvedValueOnce({ rows: [{ id: 1, parent_id: null }] })
        .mockResolvedValueOnce({ rows: mockProducts })
        .mockResolvedValueOnce({ rows: [] }); // Sin metadata

      getValueDetailsAndProducts.mockResolvedValueOnce(mockVariants);
      sortProducts.mockResolvedValueOnce(mockPaginatedProducts);

      await getProductsByCategories(req, res);

      expect(getValueDetailsAndProducts).toHaveBeenCalledWith('producto-variantes');
      expect(res.status).toHaveBeenCalledWith(200);
      expect(res.json).toHaveBeenCalledWith({
        slug,
        totalPages: expect.any(Number),
        page: 1,
        totalProducts: expect.any(Number),
        sortBy: 'default',
        order: null,
        products: mockPaginatedProducts
      });
    });

    it('debería manejar productos con variantes de precio único', async () => {
      const slug = 'categoria-precio-unico';
      req.body = { slug, page: 1 };

      const mockProducts = [
        { id: 1, title: 'Producto Precio Único', slug: 'producto-precio-unico' }
      ];
      const mockVariants = {
        rows: [
          { price: 100, visibility: 'visible' },
          { price: 100, visibility: 'visible' }
        ]
      };

      mockQuery
        .mockResolvedValueOnce({ rows: [{ id: 1, parent_id: null }] })
        .mockResolvedValueOnce({ rows: mockProducts })
        .mockResolvedValueOnce({ rows: [] });

      getValueDetailsAndProducts.mockResolvedValueOnce(mockVariants);
      sortProducts.mockResolvedValueOnce([]);

      await getProductsByCategories(req, res);

      expect(getValueDetailsAndProducts).toHaveBeenCalledWith('producto-precio-unico');
    });

    it('debería manejar productos sin variantes visibles', async () => {
      const slug = 'categoria-sin-variantes-visibles';
      req.body = { slug };

      const mockProducts = [
        { id: 1, title: 'Producto Sin Variantes', slug: 'producto-sin-variantes' }
      ];
      const mockVariants = {
        rows: [
          { price: 100, visibility: 'hidden' }
        ]
      };

      mockQuery
        .mockResolvedValueOnce({ rows: [{ id: 1, parent_id: null }] })
        .mockResolvedValueOnce({ rows: mockProducts })
        .mockResolvedValueOnce({ rows: [] });

      getValueDetailsAndProducts.mockResolvedValueOnce(mockVariants);
      sortProducts.mockResolvedValueOnce([]);

      await getProductsByCategories(req, res);

      expect(getValueDetailsAndProducts).toHaveBeenCalledWith('producto-sin-variantes');
    });

    it('debería manejar diferentes tipos de ordenamiento', async () => {
      const testCases = [
        { sort: 'price_desc', expectedSortBy: 'price', expectedOrder: 'desc' },
        { sort: 'name_asc', expectedSortBy: 'title', expectedOrder: 'asc' },
        { sort: 'name_desc', expectedSortBy: 'title', expectedOrder: 'desc' },
        { sort: 'unknown', expectedSortBy: 'default', expectedOrder: null }
      ];

      for (const testCase of testCases) {
        jest.clearAllMocks();
        mockQuery.mockClear();
        sortProducts.mockClear();

        req.body = { slug: 'test-category', sort: testCase.sort };

        mockQuery
          .mockResolvedValueOnce({ rows: [{ id: 1, parent_id: null }] })
          .mockResolvedValueOnce({ rows: [{ id: 1, title: 'Test', slug: 'test' }] })
          .mockResolvedValueOnce({ rows: [{ product_id: '1', price: 100, visibility: 'visible' }] });

        sortProducts.mockResolvedValueOnce([]);

        await getProductsByCategories(req, res);

        expect(res.json).toHaveBeenCalledWith(expect.objectContaining({
          sortBy: testCase.expectedSortBy,
          order: testCase.expectedOrder
        }));
      }
    });

    it('debería usar valores por defecto para page y sort', async () => {
      req.body = { slug: 'test-category' };

      mockQuery
        .mockResolvedValueOnce({ rows: [{ id: 1, parent_id: null }] })
        .mockResolvedValueOnce({ rows: [{ id: 1, title: 'Test', slug: 'test' }] })
        .mockResolvedValueOnce({ rows: [{ product_id: '1', price: 100, visibility: 'visible' }] });

      sortProducts.mockResolvedValueOnce([]);

      await getProductsByCategories(req, res);

      expect(res.json).toHaveBeenCalledWith(expect.objectContaining({
        page: 1,
        sortBy: 'default',
        order: null
      }));
    });

    it('debería manejar errores en getParentData', async () => {
      req.body = { slug: 'test-slug' };
      mockQuery.mockRejectedValueOnce(new Error('Database error'));

      await getProductsByCategories(req, res);

      expect(console.error).toHaveBeenCalledWith('Error al obtener productos por categoría y subcategoría:', expect.any(Error));
      expect(res.status).toHaveBeenCalledWith(500);
      expect(res.json).toHaveBeenCalledWith({ message: 'Error al obtener productos' });
    });

    it('debería manejar errores en getProductsByCategoryAndSubcategory', async () => {
      req.body = { slug: 'test-slug' };

      mockQuery
        .mockResolvedValueOnce({ rows: [{ id: 1, parent_id: null }] })
        .mockRejectedValueOnce(new Error('Products query error'));

      await getProductsByCategories(req, res);

      expect(console.error).toHaveBeenCalledWith('Error al obtener productos por categoría y subcategoría:', expect.any(Error));
      expect(res.status).toHaveBeenCalledWith(500);
      expect(res.json).toHaveBeenCalledWith({ message: 'Error al obtener productos' });
    });

    it('debería manejar errores en getMetaDetails', async () => {
      req.body = { slug: 'test-slug' };

      mockQuery
        .mockResolvedValueOnce({ rows: [{ id: 1, parent_id: null }] })
        .mockResolvedValueOnce({ rows: [{ id: 1, title: 'Test', slug: 'test' }] })
        .mockRejectedValueOnce(new Error('Meta details error'));

      await getProductsByCategories(req, res);

      expect(console.error).toHaveBeenCalledWith('Error al obtener productos por categoría y subcategoría:', expect.any(Error));
      expect(res.status).toHaveBeenCalledWith(500);
      expect(res.json).toHaveBeenCalledWith({ message: 'Error al obtener productos' });
    });

    it('debería manejar errores en mergeProductWithDetails', async () => {
      req.body = { slug: 'test-slug' };

      mockQuery
        .mockResolvedValueOnce({ rows: [{ id: 1, parent_id: null }] })
        .mockResolvedValueOnce({ rows: [{ id: 1, title: 'Test', slug: 'test' }] })
        .mockResolvedValueOnce({ rows: [] });

      getValueDetailsAndProducts.mockRejectedValueOnce(new Error('Variants error'));

      await getProductsByCategories(req, res);

      expect(console.error).toHaveBeenCalledWith('Error al obtener productos por categoría y subcategoría:', expect.any(Error));
      expect(res.status).toHaveBeenCalledWith(500);
      expect(res.json).toHaveBeenCalledWith({ message: 'Error al obtener productos' });
    });

    it('debería manejar errores en sortProducts', async () => {
      req.body = { slug: 'test-slug' };

      mockQuery
        .mockResolvedValueOnce({ rows: [{ id: 1, parent_id: null }] })
        .mockResolvedValueOnce({ rows: [{ id: 1, title: 'Test', slug: 'test' }] })
        .mockResolvedValueOnce({ rows: [{ product_id: '1', price: 100, visibility: 'visible' }] });

      sortProducts.mockRejectedValueOnce(new Error('Sort error'));

      await getProductsByCategories(req, res);

      expect(console.error).toHaveBeenCalledWith('Error al obtener productos por categoría y subcategoría:', expect.any(Error));
      expect(res.status).toHaveBeenCalledWith(500);
      expect(res.json).toHaveBeenCalledWith({ message: 'Error al obtener productos' });
    });
  });
});
