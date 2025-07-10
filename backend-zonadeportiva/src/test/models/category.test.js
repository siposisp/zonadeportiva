import { jest } from '@jest/globals';

// Mock de dependencias
jest.unstable_mockModule('../../../database/connectionPostgreSQL.js', () => ({
  pool: {
    query: jest.fn()
  }
}));

// Importar módulos después de mockear
const { pool } = await import('../../../database/connectionPostgreSQL.js');
const Category = (await import('../../models/category.js')).default;

describe('Category Model', () => {
  // Datos de ejemplo para usar en las pruebas
  const categoryData = {
    id: 1,
    slug: 'electronics',
    name: 'Electronics',
    parent_id: null
  };

  beforeEach(() => {
    // Limpiamos las simulaciones antes de cada prueba
    jest.clearAllMocks();
  });

  test('debe crear una instancia de Category correctamente', () => {
    const category = new Category(categoryData);
    
    expect(category).toBeInstanceOf(Category);
    expect(category.id).toBe(categoryData.id);
    expect(category.slug).toBe(categoryData.slug);
    expect(category.name).toBe(categoryData.name);
    expect(category.parent_id).toBe(categoryData.parent_id);
  });

  test('debe manejar valores undefined correctamente', () => {
    const incompleteData = {
      id: 2,
      name: 'Incomplete Category'
      // omitiendo slug y parent_id intencionalmente
    };

    const category = new Category(incompleteData);
    
    expect(category.id).toBe(incompleteData.id);
    expect(category.name).toBe(incompleteData.name);
    expect(category.slug).toBeUndefined();
    expect(category.parent_id).toBeUndefined();
  });
});