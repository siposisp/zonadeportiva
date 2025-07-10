import { jest, beforeEach, describe, it, expect } from '@jest/globals';

// =============================================================================
// 1. CREACIÓN DE MOCKS
// Definimos los mocks que simularán las dependencias externas.
// Los creamos aquí para que estén disponibles en todo el archivo.
// =============================================================================

const mockQuery = jest.fn();
const mockState = jest.fn((data) => ({ ...data, isMocked: true })); // Simula el constructor del modelo

// =============================================================================
// 2. APLICACIÓN DE MOCKS (La parte más importante con ESM)
// Usamos jest.unstable_mockModule para asegurarnos de que estos mocks
// se apliquen ANTES de que el servicio sea importado.
// =============================================================================

jest.unstable_mockModule('../../../database/connectionPostgreSQL.js', () => ({
  pool: { query: mockQuery },
}));

jest.unstable_mockModule('../../models/state.js', () => ({
  default: mockState,
}));

// =============================================================================
// 3. IMPORTACIÓN DEL MÓDULO A PROBAR
// Ahora que los mocks están configurados, importamos el servicio.
// Jest se asegurará de que este import reciba las dependencias mockeadas.
// =============================================================================

const { fetchStates } = await import('../../services/state.service.js');

// =============================================================================
// 4. SUITE DE PRUEBAS
// Aquí definimos nuestras pruebas usando describe() e it().
// =============================================================================

describe('Servicio: fetchStates', () => {
  // beforeEach se ejecuta antes de CADA prueba (it) en este describe.
  // Es el lugar perfecto para limpiar el estado de los mocks.
  beforeEach(() => {
    // mockClear() limpia el historial de llamadas (.mock.calls)
    // sin eliminar las implementaciones falsas.
    mockQuery.mockClear();
    mockState.mockClear();
  });

  it('debería llamar a la base de datos con la consulta SQL correcta', async () => {
    // Arrange: Preparamos el escenario. Para esta prueba, no nos importa
    // el resultado, solo que la función sea llamada.
    mockQuery.mockResolvedValueOnce({ rows: [] });

    // Act: Ejecutamos la función que queremos probar.
    await fetchStates();

    // Assert: Verificamos que todo ocurrió como esperábamos.
    expect(mockQuery).toHaveBeenCalledTimes(1);
    expect(mockQuery).toHaveBeenCalledWith(
      expect.stringMatching(/SELECT .* FROM states/is) 
    );
  });

  it('debería retornar un array de instancias de State si la consulta es exitosa', async () => {
    // Arrange: Definimos los datos falsos que retornará la base de datos.
    const mockDbRows = [
      { id_state: 1, name: 'Activo', is_active: true },
      { id_state: 2, name: 'Inactivo', is_active: false },
    ];
    mockQuery.mockResolvedValueOnce({ rows: mockDbRows });

    // Act: Ejecutamos la función.
    const result = await fetchStates();

    // Assert: Verificamos que el resultado sea el correcto.
    expect(result).toHaveLength(2); // Debería haber 2 elementos.
    expect(mockState).toHaveBeenCalledTimes(2); // El constructor de State debió llamarse 2 veces.
    expect(result[0]).toEqual({ id_state: 1, name: 'Activo', is_active: true, isMocked: true });
    expect(result[1]).toEqual({ id_state: 2, name: 'Inactivo', is_active: false, isMocked: true });
  });

  it('debería lanzar un error si la consulta a la base de datos falla', async () => {
    // Arrange: Configuramos el mock para que simule un error (promesa rechazada).
    const dbError = new Error('Error de conexión a la base de datos');
    mockQuery.mockRejectedValueOnce(dbError);

    // Act & Assert: Verificamos que la función lanza un error.
    // Usamos el patrón expect(...).rejects.toThrow() para probar promesas fallidas.
    await expect(fetchStates()).rejects.toThrow(dbError);
  });

  it('debería retornar un array vacío si la base de datos no devuelve filas', async () => {
    // Arrange: Simulamos una respuesta exitosa pero sin datos.
    mockQuery.mockResolvedValueOnce({ rows: [] });

    // Act: Ejecutamos la función.
    const result = await fetchStates();

    // Assert: Verificamos que el resultado es un array vacío.
    expect(result).toEqual([]);
    expect(mockState).not.toHaveBeenCalled(); // No se debería llamar al constructor si no hay datos.
  });
});