// src/test/models/paymentProvider.test.js
import { describe, it, expect } from '@jest/globals';
import PaymentProvider from '../../models/paymentProvider.js';

describe('PaymentProvider Model', () => {
  describe('constructor', () => {
    it('debería crear una instancia de PaymentProvider con todas las propiedades', () => {
      const providerData = {
        id: 1,
        name: 'Visa'
      };

      const provider = new PaymentProvider(providerData);

      expect(provider).toBeInstanceOf(PaymentProvider);
      expect(provider.id).toBe(1);
      expect(provider.name).toBe('Visa');
    });

    it('debería crear una instancia con propiedades undefined si no se pasan datos', () => {
      const provider = new PaymentProvider({});

      expect(provider).toBeInstanceOf(PaymentProvider);
      expect(provider.id).toBeUndefined();
      expect(provider.name).toBeUndefined();
    });

    it('debería crear una instancia con propiedades parciales', () => {
      const providerData = {
        id: 2
        // name omitido
      };

      const provider = new PaymentProvider(providerData);

      expect(provider.id).toBe(2);
      expect(provider.name).toBeUndefined();
    });

    it('debería manejar valores null', () => {
      const providerData = {
        id: null,
        name: null
      };

      const provider = new PaymentProvider(providerData);

      expect(provider.id).toBeNull();
      expect(provider.name).toBeNull();
    });

    it('debería manejar diferentes tipos de datos', () => {
      const providerData = {
        id: '1',
        name: 123
      };

      const provider = new PaymentProvider(providerData);

      expect(provider.id).toBe('1');
      expect(provider.name).toBe(123);
    });

    it('debería crear instancia sin parámetros', () => {
      expect(() => new PaymentProvider()).toThrow();
    });

    it('debería manejar strings vacíos', () => {
      const providerData = {
        id: '',
        name: ''
      };

      const provider = new PaymentProvider(providerData);

      expect(provider.id).toBe('');
      expect(provider.name).toBe('');
    });

    it('debería manejar valores booleanos', () => {
      const providerData = {
        id: true,
        name: false
      };

      const provider = new PaymentProvider(providerData);

      expect(provider.id).toBe(true);
      expect(provider.name).toBe(false);
    });
  });

  describe('propiedades', () => {
    it('debería permitir modificar las propiedades después de la creación', () => {
      const provider = new PaymentProvider({ id: 1, name: 'Original' });

      provider.id = 2;
      provider.name = 'Modificado';

      expect(provider.id).toBe(2);
      expect(provider.name).toBe('Modificado');
    });

    it('debería mantener las propiedades como enumerables', () => {
      const provider = new PaymentProvider({ id: 1, name: 'Test' });
      const keys = Object.keys(provider);

      expect(keys).toContain('id');
      expect(keys).toContain('name');
      expect(keys).toHaveLength(2);
    });

    it('debería permitir agregar nuevas propiedades', () => {
      const provider = new PaymentProvider({ id: 1, name: 'Test' });
      provider.newProperty = 'nueva';

      expect(provider.newProperty).toBe('nueva');
      expect(Object.keys(provider)).toContain('newProperty');
    });
  });
});
