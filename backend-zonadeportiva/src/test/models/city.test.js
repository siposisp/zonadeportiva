// src/test/models/city.test.js
import { describe, it, expect } from '@jest/globals';
import City from '../../models/city.js';

describe('City Model', () => {
  describe('constructor', () => {
    it('debería crear una instancia de City con todas las propiedades', () => {
      const cityData = {
        id: 1,
        name: 'Santiago',
        state_id: 13
      };

      const city = new City(cityData);

      expect(city).toBeInstanceOf(City);
      expect(city.id).toBe(1);
      expect(city.name).toBe('Santiago');
      expect(city.state_id).toBe(13);
    });

    it('debería crear una instancia con propiedades undefined si no se pasan datos', () => {
      const city = new City({});

      expect(city).toBeInstanceOf(City);
      expect(city.id).toBeUndefined();
      expect(city.name).toBeUndefined();
      expect(city.state_id).toBeUndefined();
    });

    it('debería crear una instancia con propiedades parciales', () => {
      const cityData = {
        id: 2,
        name: 'Valparaíso'
        // state_id omitido
      };

      const city = new City(cityData);

      expect(city.id).toBe(2);
      expect(city.name).toBe('Valparaíso');
      expect(city.state_id).toBeUndefined();
    });

    it('debería manejar valores null', () => {
      const cityData = {
        id: null,
        name: null,
        state_id: null
      };

      const city = new City(cityData);

      expect(city.id).toBeNull();
      expect(city.name).toBeNull();
      expect(city.state_id).toBeNull();
    });

    it('debería manejar diferentes tipos de datos', () => {
      const cityData = {
        id: '1',
        name: 123,
        state_id: '13'
      };

      const city = new City(cityData);

      expect(city.id).toBe('1');
      expect(city.name).toBe(123);
      expect(city.state_id).toBe('13');
    });

    it('debería crear instancia sin parámetros', () => {
      expect(() => new City()).toThrow();
    });
  });

  describe('propiedades', () => {
    it('debería permitir modificar las propiedades después de la creación', () => {
      const city = new City({ id: 1, name: 'Original', state_id: 1 });

      city.id = 2;
      city.name = 'Modificado';
      city.state_id = 2;

      expect(city.id).toBe(2);
      expect(city.name).toBe('Modificado');
      expect(city.state_id).toBe(2);
    });

    it('debería mantener las propiedades como enumerables', () => {
      const city = new City({ id: 1, name: 'Test', state_id: 1 });
      const keys = Object.keys(city);

      expect(keys).toContain('id');
      expect(keys).toContain('name');
      expect(keys).toContain('state_id');
    });
  });
});
