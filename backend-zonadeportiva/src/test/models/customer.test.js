// src/test/models/customer.test.js
import { describe, it, expect } from '@jest/globals';
import Customer from '../../models/customer.js';

describe('Customer Model', () => {
  describe('constructor', () => {
    it('debería crear una instancia de Customer con todas las propiedades', () => {
      const customerData = {
        id: 1,
        user_id: 100,
        rut: '12345678-9',
        first_name: 'Juan',
        last_name: 'Pérez',
        phone: '+56912345678'
      };

      const customer = new Customer(customerData);

      expect(customer).toBeInstanceOf(Customer);
      expect(customer.id).toBe(1);
      expect(customer.user_id).toBe(100);
      expect(customer.rut).toBe('12345678-9');
      expect(customer.first_name).toBe('Juan');
      expect(customer.last_name).toBe('Pérez');
      expect(customer.phone).toBe('+56912345678');
    });

    it('debería crear una instancia con propiedades undefined si no se pasan datos', () => {
      const customer = new Customer({});

      expect(customer).toBeInstanceOf(Customer);
      expect(customer.id).toBeUndefined();
      expect(customer.user_id).toBeUndefined();
      expect(customer.rut).toBeUndefined();
      expect(customer.first_name).toBeUndefined();
      expect(customer.last_name).toBeUndefined();
      expect(customer.phone).toBeUndefined();
    });

    it('debería crear una instancia con propiedades parciales', () => {
      const customerData = {
        id: 2,
        first_name: 'María',
        last_name: 'González'
        // Otras propiedades omitidas
      };

      const customer = new Customer(customerData);

      expect(customer.id).toBe(2);
      expect(customer.first_name).toBe('María');
      expect(customer.last_name).toBe('González');
      expect(customer.user_id).toBeUndefined();
      expect(customer.rut).toBeUndefined();
      expect(customer.phone).toBeUndefined();
    });

    it('debería manejar valores null', () => {
      const customerData = {
        id: 1,
        user_id: null,
        rut: null,
        first_name: null,
        last_name: null,
        phone: null
      };

      const customer = new Customer(customerData);

      expect(customer.id).toBe(1);
      expect(customer.user_id).toBeNull();
      expect(customer.rut).toBeNull();
      expect(customer.first_name).toBeNull();
      expect(customer.last_name).toBeNull();
      expect(customer.phone).toBeNull();
    });

    it('debería manejar diferentes tipos de datos', () => {
      const customerData = {
        id: '1',
        user_id: '100',
        rut: 12345678,
        first_name: 123,
        last_name: true,
        phone: 912345678
      };

      const customer = new Customer(customerData);

      expect(customer.id).toBe('1');
      expect(customer.user_id).toBe('100');
      expect(customer.rut).toBe(12345678);
      expect(customer.first_name).toBe(123);
      expect(customer.last_name).toBe(true);
      expect(customer.phone).toBe(912345678);
    });

    it('debería crear instancia sin parámetros', () => {
      expect(() => new Customer()).toThrow();
    });
  });

  describe('propiedades', () => {
    it('debería permitir modificar las propiedades después de la creación', () => {
      const customer = new Customer({
        id: 1,
        user_id: 100,
        rut: '12345678-9',
        first_name: 'Original',
        last_name: 'Name',
        phone: '123456789'
      });

      customer.first_name = 'Modificado';
      customer.phone = '987654321';

      expect(customer.first_name).toBe('Modificado');
      expect(customer.phone).toBe('987654321');
    });

    it('debería mantener todas las propiedades como enumerables', () => {
      const customer = new Customer({
        id: 1,
        user_id: 100,
        rut: '12345678-9',
        first_name: 'Juan',
        last_name: 'Pérez',
        phone: '123456789'
      });
      const keys = Object.keys(customer);

      expect(keys).toContain('id');
      expect(keys).toContain('user_id');
      expect(keys).toContain('rut');
      expect(keys).toContain('first_name');
      expect(keys).toContain('last_name');
      expect(keys).toContain('phone');
    });
  });
});
