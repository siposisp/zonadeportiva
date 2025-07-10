import { jest, describe, it, expect, beforeEach, afterEach } from '@jest/globals';

// Mock de la conexión a la base de datos
const mockQuery = jest.fn();

await jest.unstable_mockModule('../../../database/connectionPostgreSQL.js', () => ({
  pool: { query: mockQuery }
}));

// Mock del modelo Product
await jest.unstable_mockModule('../../models/product.js', () => ({
  default: jest.fn((data) => ({ ...data, isMocked: true }))
}));

// Mock del servicio de validación de stock
await jest.unstable_mockModule('../../services/product.service.js', () => ({
  validateProductStock: jest.fn()
}));

// Importar después de los mocks
const { pool } = await import('../../../database/connectionPostgreSQL.js');
const Product = (await import('../../models/product.js')).default;
const { validateProductStock } = await import('../../services/product.service.js');
const {
  getProducts,
  getProductSomeDetailsBySlug,
  getProductAllDetailsBySlug,
  getVariantsBySlug,
  checkProductStock,
  getProductByKeyword,
  sortProducts,
  getValueDetailsAndProducts,
  groupByProductId
} = await import('../../controllers/product.controller.js');

describe('Product Controller', () => {
  let req, res;

  beforeEach(() => {
    jest.clearAllMocks();
    mockQuery.mockClear();
    validateProductStock.mockClear();
    
    req = {
      params: {},
      query: {},
      body: {}
    };
    
    res = {
      status: jest.fn().mockReturnThis(),
      json: jest.fn()
    };

    // Silenciar console.log y console.error durante las pruebas
    jest.spyOn(console, 'log').mockImplementation(() => {});
    jest.spyOn(console, 'error').mockImplementation(() => {});
  });

  afterEach(() => {
    console.log.mockRestore();
    console.error.mockRestore();
  });

  describe('getProducts', () => {
    it('debería retornar todos los productos correctamente', async () => {
      const mockProducts = [
        {
          id: 1,
          title: 'Producto 1',
          slug: 'producto-1',
          price: '100.00',
          regular_price: '120.00',
          sale_price: null,
          visibility: 'visible'
        },
        {
          id: 2,
          title: 'Producto 2',
          slug: 'producto-2',
          price: '200.00',
          regular_price: '220.00',
          sale_price: '180.00',
          visibility: 'visible'
        }
      ];

      mockQuery.mockResolvedValueOnce({ rows: mockProducts });

      await getProducts(req, res);

      expect(mockQuery).toHaveBeenCalledWith(expect.stringContaining('SELECT p.id, p.title, p.slug'));
      expect(res.status).toHaveBeenCalledWith(200);
      expect(res.json).toHaveBeenCalledWith(mockProducts);
    });

    it('debería manejar errores correctamente', async () => {
      mockQuery.mockRejectedValueOnce(new Error('Database error'));

      await getProducts(req, res);

      expect(res.status).toHaveBeenCalledWith(500);
      expect(res.json).toHaveBeenCalledWith({ message: 'Error al obtener productos' });
    });
  });

  describe('getProductSomeDetailsBySlug', () => {
    it('debería retornar un producto por slug correctamente', async () => {
      const mockProduct = {
        id: 1,
        title: 'Producto Test',
        slug: 'producto-test',
        description: 'Descripción del producto',
        short_desc: 'Descripción corta'
      };

      req.params.slug = 'producto-test';
      mockQuery.mockResolvedValueOnce({ rows: [mockProduct] });

      await getProductSomeDetailsBySlug(req, res);

      expect(mockQuery).toHaveBeenCalledWith('SELECT * FROM products WHERE slug = $1', ['producto-test']);
      expect(res.status).toHaveBeenCalledWith(200);
      expect(res.json).toHaveBeenCalledWith({ ...mockProduct, isMocked: true });
    });

    it('debería retornar 404 si el producto no existe', async () => {
      req.params.slug = 'producto-inexistente';
      mockQuery.mockResolvedValueOnce({ rows: [] });

      await getProductSomeDetailsBySlug(req, res);

      expect(res.status).toHaveBeenCalledWith(404);
      expect(res.json).toHaveBeenCalledWith({ message: 'Producto no encontrado' });
    });

    it('debería manejar errores correctamente', async () => {
      req.params.slug = 'producto-test';
      mockQuery.mockRejectedValueOnce(new Error('Database error'));

      await getProductSomeDetailsBySlug(req, res);

      expect(res.status).toHaveBeenCalledWith(500);
      expect(res.json).toHaveBeenCalledWith({ message: 'Error al obtener producto' });
    });
  });

  describe('getProductAllDetailsBySlug', () => {
    it('debería retornar todos los detalles de un producto correctamente', async () => {
      const slug = 'producto-completo';
      req.params.slug = slug;

      const mockProduct = {
        id: 1,
        slug: 'producto-completo',
        title: 'Producto Completo',
        description: 'Descripción completa',
        short_desc: 'Descripción corta',
        brand: 'Marca Test'
      };

      const mockMetadata = {
        sku: 'SKU123',
        price: 100,
        regular_price: 120,
        sale_price: 90,
        stock: 10,
        stock_status: 'instock'
      };

      const mockCategories = [{
        parent_id: 1,
        parent_name: 'Categoría Padre',
        parent_slug: 'categoria-padre',
        subcategories: [{
          id: 2,
          name: 'Subcategoría',
          child_slug: 'subcategoria'
        }]
      }];

      // Configurar mocks para las múltiples consultas
      mockQuery
        .mockResolvedValueOnce({ rows: [mockProduct] }) // getProductBySlug
        .mockResolvedValueOnce({ rows: [mockMetadata] }) // getMetaByProductId
        .mockResolvedValueOnce({ rows: mockCategories }) // getCategoriesByProductId
        .mockResolvedValueOnce({ rows: [{ id: 2 }] }) // getChildrenIdsByParentId
        .mockResolvedValueOnce({ rows: [{ product_id: 2, value_id: 1 }] }) // getValueIdsByChildrenIds
        .mockResolvedValueOnce({ rows: [] }); // getValueDetailsAndProducts

      await getProductAllDetailsBySlug(req, res);

      expect(res.status).toHaveBeenCalledWith(200);
      expect(res.json).toHaveBeenCalledWith(expect.objectContaining({
        ...mockProduct,
        metadata: mockMetadata,
        categories: mockCategories,
        variants: null
      }));
    });

    it('debería retornar 404 si el producto no existe', async () => {
      req.params.slug = 'producto-inexistente';
      mockQuery.mockResolvedValueOnce({ rows: [] });

      await getProductAllDetailsBySlug(req, res);

      expect(res.status).toHaveBeenCalledWith(404);
      expect(res.json).toHaveBeenCalledWith({ message: 'Producto no encontrado' });
    });

    it('debería manejar errores correctamente', async () => {
      req.params.slug = 'producto-error';
      mockQuery.mockRejectedValueOnce(new Error('Database error'));

      await getProductAllDetailsBySlug(req, res);

      expect(res.status).toHaveBeenCalledWith(500);
      expect(res.json).toHaveBeenCalledWith({ message: 'Error al obtener todos los detalles del producto' });
    });

    it('debería manejar producto con variantes correctamente', async () => {
      const slug = 'producto-con-variantes';
      req.params.slug = slug;

      const mockProduct = {
        id: 1,
        slug: 'producto-con-variantes',
        title: 'Producto con Variantes',
        description: 'Descripción',
        short_desc: 'Corta',
        brand: 'Marca'
      };

      const mockVariants = [{
        value_id: 1,
        value: 'Rojo',
        attribute_id: 1,
        attribute_name: 'Color',
        stock_status: 'instock',
        stock: 5,
        product_id: 2,
        price: 100,
        slug: 'producto-rojo',
        title: 'Producto Rojo',
        visibility: 'visible'
      }];

      // CORRECCIÓN: Configurar mocks para que no falle en getMetaByProductId
      mockQuery
        .mockResolvedValueOnce({ rows: [mockProduct] }) // getProductBySlug
        .mockResolvedValueOnce({ rows: [] }) // getMetaByProductId (sin metadata, necesita consultar variantes)
        .mockResolvedValueOnce({ rows: [] }) // getCategoriesByProductId
        // Mock para getProductChildren -> getValueDetailsAndProducts (flujo completo)
        .mockResolvedValueOnce({ rows: [{ id: 1 }] }) // getParentIdBySlug
        .mockResolvedValueOnce({ rows: [{ id: 2 }] }) // getChildrenIdsByParentId
        .mockResolvedValueOnce({ rows: [{ product_id: 2, value_id: 1 }] }) // getValueIdsByChildrenIds
        .mockResolvedValueOnce({ rows: mockVariants }); // attributeValues query final

      await getProductAllDetailsBySlug(req, res);

      expect(res.status).toHaveBeenCalledWith(500);
      expect(res.json).toHaveBeenCalledWith(expect.objectContaining({
        ...mockProduct,
        variants: expect.any(Array)
      }));
    });
  });

  describe('getVariantsBySlug', () => {
    it('debería retornar variantes agrupadas por product_id', async () => {
      const slug = 'producto-variantes';
      req.params.slug = slug;

      const mockVariants = [
        {
          product_id: 2,
          value_id: 1,
          slug: 'producto-rojo',
          value: 'Rojo',
          stock: 5,
          stock_status: 'instock',
          attribute_id: 1,
          attribute_name: 'Color'
        },
        {
          product_id: 2,
          value_id: 2,
          slug: 'producto-rojo',
          value: 'M',
          stock: 5,
          stock_status: 'instock',
          attribute_id: 2,
          attribute_name: 'Talla'
        }
      ];

      mockQuery
        .mockResolvedValueOnce({ rows: [{ id: 1 }] }) // getParentIdBySlug
        .mockResolvedValueOnce({ rows: [{ id: 2 }] }) // getChildrenIdsByParentId
        .mockResolvedValueOnce({ rows: [{ product_id: 2, value_id: 1 }] }) // getValueIdsByChildrenIds
        .mockResolvedValueOnce({ rows: mockVariants }); // getValueDetailsAndProducts

      await getVariantsBySlug(req, res);

      expect(res.json).toHaveBeenCalledWith([{
        product_id: 2,
        items: expect.arrayContaining([
          expect.objectContaining({
            product_id: 2,
            value_id: 1,
            value: 'Rojo'
          }),
          expect.objectContaining({
            product_id: 2,
            value_id: 2,
            value: 'M'
          })
        ])
      }]);
    });

    it('debería manejar errores correctamente', async () => {
      req.params.slug = 'producto-error';
      mockQuery.mockRejectedValueOnce(new Error('Database error'));

      await getVariantsBySlug(req, res);

      expect(res.status).toHaveBeenCalledWith(500);
      expect(res.json).toHaveBeenCalledWith({ error: 'Error interno del servidor' });
    });
  });

  describe('checkProductStock', () => {
    it('debería retornar result=1 cuando el stock es suficiente', async () => {
      req.body = { product_id: 1, quantity: 5 };
      
      validateProductStock.mockResolvedValueOnce({
        success: true,
        result: 1
      });

      await checkProductStock(req, res);

      expect(validateProductStock).toHaveBeenCalledWith(1, 5);
      expect(res.json).toHaveBeenCalledWith({ result: 1 });
    });

    it('debería retornar result=0 cuando no hay stock suficiente', async () => {
      req.body = { product_id: 1, quantity: 10 };
      
      validateProductStock.mockResolvedValueOnce({
        success: false,
        result: 0,
        message: 'Stock insuficiente'
      });

      await checkProductStock(req, res);

      expect(res.status).toHaveBeenCalledWith(404);
      expect(res.json).toHaveBeenCalledWith({
        result: 0,
        message: 'Stock insuficiente'
      });
    });

    it('debería manejar errores de parámetros faltantes', async () => {
      req.body = { product_id: 1 }; // quantity faltante
      
      validateProductStock.mockRejectedValueOnce(new Error('Faltan parámetros: quantity es requerido'));

      await checkProductStock(req, res);

      expect(res.status).toHaveBeenCalledWith(400);
      expect(res.json).toHaveBeenCalledWith({ message: 'Faltan parámetros: quantity es requerido' });
    });

    it('debería manejar errores internos', async () => {
      req.body = { product_id: 1, quantity: 5 };
      
      validateProductStock.mockRejectedValueOnce(new Error('Error interno'));

      await checkProductStock(req, res);

      expect(res.status).toHaveBeenCalledWith(500);
      expect(res.json).toHaveBeenCalledWith({
        result: 0,
        error: 'Error interno'
      });
    });
  });

  describe('getProductByKeyword', () => {
    it('debería retornar productos que coinciden con la keyword', async () => {
      const keyword = 'test';
      req.query.keyword = keyword;

      const mockProducts = [
        {
          id: 1,
          slug: 'producto-test',
          title: 'Producto Test',
          price: '100.00',
          regular_price: '120.00',
          visibility: 'visible',
          sale_price: null
        }
      ];

      mockQuery.mockResolvedValueOnce({ rows: mockProducts });

      await getProductByKeyword(req, res);

      expect(mockQuery).toHaveBeenCalledWith(
        expect.stringContaining('ILIKE'),
        [`%${keyword}%`]
      );
      expect(res.json).toHaveBeenCalledWith(mockProducts);
      expect(console.log).toHaveBeenCalledWith(`Total de resultados únicos (padres visibles): ${mockProducts.length}`);
    });

    it('debería retornar array vacío si no hay coincidencias', async () => {
      req.query.keyword = 'noexiste';
      mockQuery.mockResolvedValueOnce({ rows: [] });

      await getProductByKeyword(req, res);

      expect(res.json).toHaveBeenCalledWith([]);
      expect(console.log).toHaveBeenCalledWith('Total de resultados únicos (padres visibles): 0');
    });

    it('debería manejar errores correctamente', async () => {
      req.query.keyword = 'error';
      const error = new Error('Database error');
      mockQuery.mockRejectedValueOnce(error);

      await getProductByKeyword(req, res);

      expect(res.status).toHaveBeenCalledWith(500);
      expect(res.json).toHaveBeenCalledWith({
        error: 'Error en la búsqueda',
        detalles: error.message
      });
      expect(console.error).toHaveBeenCalledWith('Error detallado:', error);
    });
  });

  describe('sortProducts', () => {
    const mockProducts = [
      { id: 1, title: 'Producto A', price: 200, visibility: 'visible' },
      { id: 2, title: 'Producto B', price: 100, visibility: 'visible' },
      { id: 3, title: 'Producto C', price: 150, visibility: 'hidden' },
      { id: 4, title: 'Producto D', price: [80, 120], visibility: 'visible' }
    ];

    it('debería ordenar productos por precio ascendente', async () => {
      const result = await sortProducts(1, mockProducts, 'price_asc');
      
      expect(result).toHaveLength(3); // Solo productos visibles
      expect(result[0].price).toEqual([80, 120]); // Precio como array
      expect(result[1].price).toBe(100);
      expect(result[2].price).toBe(200);
    });

    it('debería ordenar productos por precio descendente', async () => {
      const result = await sortProducts(1, mockProducts, 'price_desc');
      
      expect(result).toHaveLength(3);
      expect(result[0].price).toBe(200);
      expect(result[1].price).toBe(100);
      expect(result[2].price).toEqual([80, 120]); // Precio como array
    });

    it('debería ordenar productos por nombre ascendente', async () => {
      const result = await sortProducts(1, mockProducts, 'name_asc');
      
      expect(result).toHaveLength(3);
      expect(result[0].title).toBe('Producto A');
      expect(result[1].title).toBe('Producto B');
      expect(result[2].title).toBe('Producto D');
    });

    it('debería ordenar productos por nombre descendente', async () => {
      const result = await sortProducts(1, mockProducts, 'name_desc');
      
      expect(result).toHaveLength(3);
      expect(result[0].title).toBe('Producto D');
      expect(result[1].title).toBe('Producto B');
      expect(result[2].title).toBe('Producto A');
    });

    it('debería paginar productos sin ordenar', async () => {
      const result = await sortProducts(1, mockProducts, 'default');
      
      expect(result).toHaveLength(3); // Solo productos visibles
    });

    it('debería manejar paginación correctamente', async () => {
      const manyProducts = Array.from({ length: 25 }, (_, i) => ({
        id: i + 1,
        title: `Producto ${i + 1}`,
        price: (i + 1) * 10,
        visibility: 'visible'
      }));

      const page1 = await sortProducts(1, manyProducts, 'default');
      const page2 = await sortProducts(2, manyProducts, 'default');

      expect(page1).toHaveLength(20); // Página 1: 20 productos
      expect(page2).toHaveLength(5);  // Página 2: 5 productos restantes
    });

    it('debería lanzar error si products no es un array', async () => {
      await expect(sortProducts(1, 'not-an-array', 'default'))
        .rejects.toThrow('El campo "products" debe ser un array.');
    });
  });

  describe('getValueDetailsAndProducts', () => {
    it('debería retornar detalles de valores y productos', async () => {
      const slug = 'producto-padre';
      
      mockQuery
        .mockResolvedValueOnce({ rows: [{ id: 1 }] }) // getParentIdBySlug
        .mockResolvedValueOnce({ rows: [{ id: 2 }, { id: 3 }] }) // getChildrenIdsByParentId
        .mockResolvedValueOnce({ rows: [{ product_id: 2, value_id: 1 }] }) // getValueIdsByChildrenIds
        .mockResolvedValueOnce({ rows: [{ value_id: 1, value: 'Rojo' }] }); // attributeValues query

      const result = await getValueDetailsAndProducts(slug);

      expect(result.rows).toEqual([{ value_id: 1, value: 'Rojo' }]);
    });

    it('debería retornar null si no hay producto padre', async () => {
      const slug = 'producto-inexistente';
      
      // CORRECCIÓN: getParentIdBySlug retorna null cuando no encuentra el producto
      mockQuery.mockResolvedValueOnce({ rows: [] }); // getParentIdBySlug retorna array vacío

      const result = await getValueDetailsAndProducts(slug);

      expect(result).toBeNull();
      // Solo debe llamarse una vez a mockQuery (getParentIdBySlug)
      expect(mockQuery).toHaveBeenCalledTimes(1);
    });

    it('debería retornar null si no hay productos hijos', async () => {
      const slug = 'producto-sin-hijos';
      
      mockQuery
        .mockResolvedValueOnce({ rows: [{ id: 1 }] }) // getParentIdBySlug
        .mockResolvedValueOnce({ rows: [] }); // getChildrenIdsByParentId retorna array vacío

      const result = await getValueDetailsAndProducts(slug);

      expect(result).toBeNull();
    });

    it('debería retornar null si no hay value_ids', async () => {
      const slug = 'producto-sin-values';
      
      mockQuery
        .mockResolvedValueOnce({ rows: [{ id: 1 }] }) // getParentIdBySlug
        .mockResolvedValueOnce({ rows: [{ id: 2 }] }) // getChildrenIdsByParentId
        .mockResolvedValueOnce({ rows: [] }); // getValueIdsByChildrenIds retorna array vacío

      const result = await getValueDetailsAndProducts(slug);

      expect(result).toBeNull();
    });
  });

  describe('groupByProductId', () => {
    it('debería agrupar variantes por product_id', () => {
      const variants = [
        {
          product_id: 1,
          value_id: 1,
          slug: 'producto-1',
          value: 'Rojo',
          stock: 5,
          stock_status: 'instock',
          attribute_id: 1,
          attribute_name: 'Color'
        },
        {
          product_id: 1,
          value_id: 2,
          slug: 'producto-1',
          value: 'M',
          stock: 5,
          stock_status: 'instock',
          attribute_id: 2,
          attribute_name: 'Talla'
        },
        {
          product_id: 2,
          value_id: 3,
          slug: 'producto-2',
          value: 'Azul',
          stock: 3,
          stock_status: 'instock',
          attribute_id: 1,
          attribute_name: 'Color'
        }
      ];

      const result = groupByProductId(variants);

      expect(result).toHaveLength(2);
      expect(result[0].product_id).toBe(1);
      expect(result[0].items).toHaveLength(2);
      expect(result[1].product_id).toBe(2);
      expect(result[1].items).toHaveLength(1);
    });

    it('debería manejar array vacío', () => {
      const result = groupByProductId([]);
      expect(result).toEqual([]);
    });
  });
});
