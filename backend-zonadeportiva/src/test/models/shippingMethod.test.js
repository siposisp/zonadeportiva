// src/test/models/shippingMethod.test.js
import { describe, it, expect } from '@jest/globals';
import Shipping_method from '../../models/shippingMethod.js';

describe('Shipping_method Model', () => {
  describe('constructor', () => {
    it('debería crear una instancia de Shipping_method con todas las propiedades', () => {
      const shippingData = {
        id: 1,
        name: 'Express',
        description: 'Envío express en 24 horas',
        carrier: 'DHL',
        cost: 5000
      };

      const shipping = new Shipping_method(shippingData);

      expect(shipping).toBeInstanceOf(Shipping_method);
      expect(shipping.id).toBe(1);
      expect(shipping.name).toBe('Express');
      expect(shipping.description).toBe('Envío express en 24 horas');
      expect(shipping.carrier).toBe('DHL');
      expect(shipping.cost).toBe(5000);
    });

    it('debería crear una instancia con propiedades undefined si no se pasan datos', () => {
      const shipping = new Shipping_method({});

      expect(shipping).toBeInstanceOf(Shipping_method);
      expect(shipping.id).toBeUndefined();
      expect(shipping.name).toBeUndefined();
      expect(shipping.description).toBeUndefined();
      expect(shipping.carrier).toBeUndefined();
      expect(shipping.cost).toBeUndefined();
    });

    it('debería crear una instancia con propiedades parciales', () => {
      const shippingData = {
        id: 2,
        name: 'Standard',
        cost: 2000
        // description y carrier omitidos
      };

      const shipping = new Shipping_method(shippingData);

      expect(shipping.id).toBe(2);
      expect(shipping.name).toBe('Standard');
      expect(shipping.cost).toBe(2000);
      expect(shipping.description).toBeUndefined();
      expect(shipping.carrier).toBeUndefined();
    });

    it('debería manejar valores null', () => {
      const shippingData = {
        id: 1,
        name: null,
        description: null,
        carrier: null,
        cost: null
      };

      const shipping = new Shipping_method(shippingData);

      expect(shipping.id).toBe(1);
      expect(shipping.name).toBeNull();
      expect(shipping.description).toBeNull();
      expect(shipping.carrier).toBeNull();
      expect(shipping.cost).toBeNull();
    });

    it('debería manejar diferentes tipos de datos', () => {
      const shippingData = {
        id: '1',
        name: 123,
        description: true,
        carrier: 456,
        cost: '5000'
      };

      const shipping = new Shipping_method(shippingData);

      expect(shipping.id).toBe('1');
      expect(shipping.name).toBe(123);
      expect(shipping.description).toBe(true);
      expect(shipping.carrier).toBe(456);
      expect(shipping.cost).toBe('5000');
    });

    it('debería crear instancia sin parámetros', () => {
      expect(() => new Shipping_method()).toThrow();
    });

    it('debería manejar valores numéricos como strings', () => {
      const shippingData = {
        id: 1,
        name: 'Test',
        description: 'Test description',
        carrier: 'Test carrier',
        cost: '10.50'
      };

      const shipping = new Shipping_method(shippingData);

      expect(shipping.cost).toBe('10.50');
    });

    it('debería manejar strings vacíos', () => {
      const shippingData = {
        id: 1,
        name: '',
        description: '',
        carrier: '',
        cost: 0
      };

      const shipping = new Shipping_method(shippingData);

      expect(shipping.name).toBe('');
      expect(shipping.description).toBe('');
      expect(shipping.carrier).toBe('');
      expect(shipping.cost).toBe(0);
    });
  });

  describe('propiedades', () => {
    it('debería permitir modificar las propiedades después de la creación', () => {
      const shipping = new Shipping_method({
        id: 1,
        name: 'Original',
        description: 'Original description',
        carrier: 'Original carrier',
        cost: 1000
      });

      shipping.name = 'Modificado';
      shipping.cost = 2000;

      expect(shipping.name).toBe('Modificado');
      expect(shipping.cost).toBe(2000);
    });

    it('debería mantener todas las propiedades como enumerables', () => {
      const shipping = new Shipping_method({
        id: 1,
        name: 'Test',
        description: 'Test description',
        carrier: 'Test carrier',
        cost: 1000
      });
      const keys = Object.keys(shipping);

      expect(keys).toContain('id');
      expect(keys).toContain('name');
      expect(keys).toContain('description');
      expect(keys).toContain('carrier');
      expect(keys).toContain('cost');
      expect(keys).toHaveLength(5);
    });

    it('debería permitir agregar nuevas propiedades', () => {
      const shipping = new Shipping_method({ id: 1, name: 'Test' });
      shipping.active = true;

      expect(shipping.active).toBe(true);
      expect(Object.keys(shipping)).toContain('active');
    });
  });
});
