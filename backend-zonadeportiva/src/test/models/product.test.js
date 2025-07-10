import { jest } from '@jest/globals';

// Mock de dependencias
jest.unstable_mockModule('../../../database/connectionPostgreSQL.js', () => ({
  pool: {
    query: jest.fn()
  }
}));

// Importar módulos después de mockear
const { pool } = await import('../../../database/connectionPostgreSQL.js');
const Product = (await import('../../models/product.js')).default;

describe('Product Model', () => {
  // Datos de ejemplo para usar en las pruebas
  const productData = {
    id: 1,
    parent_id: null,
    title: 'Smartphone X',
    description: 'Un teléfono inteligente de última generación',
    short_desc: 'Smartphone avanzado',
    status: 'active',
    created_at: new Date('2023-01-01'),
    updated_at: new Date('2023-01-02'),
    length: 15.2,
    width: 7.5,
    height: 0.8,
    weight: 180,
    brand_id: 5,
    slug: 'smartphone-x',
    product_type: 'electronic'
  };

  beforeEach(() => {
    // Limpiamos las simulaciones antes de cada prueba
    jest.clearAllMocks();
  });

  test('debe crear una instancia de Product correctamente', () => {
    const product = new Product(productData);
    
    expect(product).toBeInstanceOf(Product);
    expect(product.id).toBe(productData.id);
    expect(product.parent_id).toBe(productData.parent_id);
    expect(product.title).toBe(productData.title);
    expect(product.description).toBe(productData.description);
    expect(product.short_desc).toBe(productData.short_desc);
    expect(product.status).toBe(productData.status);
    expect(product.created_at).toBe(productData.created_at);
    expect(product.updated_at).toBe(productData.updated_at);
    expect(product.length).toBe(productData.length);
    expect(product.width).toBe(productData.width);
    expect(product.height).toBe(productData.height);
    expect(product.weight).toBe(productData.weight);
    expect(product.brand_id).toBe(productData.brand_id);
    expect(product.slug).toBe(productData.slug);
    expect(product.product_type).toBe(productData.product_type);
  });

  test('debe manejar valores undefined correctamente', () => {
    const incompleteData = {
      id: 2,
      title: 'Producto Incompleto',
      status: 'draft'
      // omitiendo otros campos intencionalmente
    };

    const product = new Product(incompleteData);
    
    expect(product.id).toBe(incompleteData.id);
    expect(product.title).toBe(incompleteData.title);
    expect(product.status).toBe(incompleteData.status);
    expect(product.description).toBeUndefined();
    expect(product.short_desc).toBeUndefined();
    expect(product.length).toBeUndefined();
    expect(product.parent_id).toBeUndefined();
  });

  test('debe manejar diferentes tipos de producto correctamente', () => {
    const variants = [
      {...productData, product_type: 'electronic', id: 10},
      {...productData, product_type: 'clothing', id: 11},
      {...productData, product_type: 'food', id: 12}
    ];

    variants.forEach(data => {
      const product = new Product(data);
      expect(product.product_type).toBe(data.product_type);
      expect(product.id).toBe(data.id);
    });
  });
});