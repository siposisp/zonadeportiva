// src/test/models/state.test.js
import { describe, it, expect } from '@jest/globals';
import State from '../../models/state.js';

describe('State Model', () => {
  describe('constructor', () => {
    it('debería crear una instancia de State con todas las propiedades', () => {
      const stateData = {
        id: 1,
        name: 'Región Metropolitana',
        short_name: 'RM'
      };

      const state = new State(stateData);

      expect(state).toBeInstanceOf(State);
      expect(state.id).toBe(1);
      expect(state.name).toBe('Región Metropolitana');
      expect(state.short_name).toBe('RM');
    });

    it('debería crear una instancia con propiedades undefined si no se pasan datos', () => {
      const state = new State({});

      expect(state).toBeInstanceOf(State);
      expect(state.id).toBeUndefined();
      expect(state.name).toBeUndefined();
      expect(state.short_name).toBeUndefined();
    });

    it('debería crear una instancia con propiedades parciales', () => {
      const stateData = {
        id: 2,
        name: 'Valparaíso'
        // short_name omitido
      };

      const state = new State(stateData);

      expect(state.id).toBe(2);
      expect(state.name).toBe('Valparaíso');
      expect(state.short_name).toBeUndefined();
    });

    it('debería manejar valores null', () => {
      const stateData = {
        id: null,
        name: null,
        short_name: null
      };

      const state = new State(stateData);

      expect(state.id).toBeNull();
      expect(state.name).toBeNull();
      expect(state.short_name).toBeNull();
    });

    it('debería manejar diferentes tipos de datos', () => {
      const stateData = {
        id: '1',
        name: 123,
        short_name: true
      };

      const state = new State(stateData);

      expect(state.id).toBe('1');
      expect(state.name).toBe(123);
      expect(state.short_name).toBe(true);
    });

    it('debería crear instancia sin parámetros', () => {
      expect(() => new State()).toThrow();
    });

    it('debería manejar strings vacíos', () => {
      const stateData = {
        id: 1,
        name: '',
        short_name: ''
      };

      const state = new State(stateData);

      expect(state.name).toBe('');
      expect(state.short_name).toBe('');
    });

    it('debería manejar nombres largos y cortos', () => {
      const stateData = {
        id: 1,
        name: 'Región de Aysén del General Carlos Ibáñez del Campo',
        short_name: 'XI'
      };

      const state = new State(stateData);

      expect(state.name).toBe('Región de Aysén del General Carlos Ibáñez del Campo');
      expect(state.short_name).toBe('XI');
    });
  });

  describe('propiedades', () => {
    it('debería permitir modificar las propiedades después de la creación', () => {
      const state = new State({
        id: 1,
        name: 'Original',
        short_name: 'OR'
      });

      state.name = 'Modificado';
      state.short_name = 'MO';

      expect(state.name).toBe('Modificado');
      expect(state.short_name).toBe('MO');
    });

    it('debería mantener las propiedades como enumerables', () => {
      const state = new State({
        id: 1,
        name: 'Test',
        short_name: 'TE'
      });
      const keys = Object.keys(state);

      expect(keys).toContain('id');
      expect(keys).toContain('name');
      expect(keys).toContain('short_name');
      expect(keys).toHaveLength(3);
    });

    it('debería permitir agregar nuevas propiedades', () => {
      const state = new State({ id: 1, name: 'Test', short_name: 'TE' });
      state.country = 'Chile';

      expect(state.country).toBe('Chile');
      expect(Object.keys(state)).toContain('country');
    });
  });
});
