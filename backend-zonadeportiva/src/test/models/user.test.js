// src/test/models/user.test.js
import { describe, it, expect } from '@jest/globals';
import User from '../../models/user.js';

describe('User Model', () => {
  describe('constructor', () => {
    it('debería crear una instancia de User con todas las propiedades', () => {
      const userData = {
        id: 1,
        email: 'test@example.com',
        password_hash: 'hashedpassword123',
        role: 'customer'
      };

      const user = new User(userData);

      expect(user).toBeInstanceOf(User);
      expect(user.id).toBe(1);
      expect(user.email).toBe('test@example.com');
      expect(user.password_hash).toBe('hashedpassword123');
      expect(user.role).toBe('customer');
    });

    it('debería crear una instancia con propiedades undefined si no se pasan datos', () => {
      const user = new User({});

      expect(user).toBeInstanceOf(User);
      expect(user.id).toBeUndefined();
      expect(user.email).toBeUndefined();
      expect(user.password_hash).toBeUndefined();
      expect(user.role).toBeUndefined();
    });

    it('debería crear una instancia con propiedades parciales', () => {
      const userData = {
        id: 2,
        email: 'partial@example.com'
        // password_hash y role omitidos
      };

      const user = new User(userData);

      expect(user.id).toBe(2);
      expect(user.email).toBe('partial@example.com');
      expect(user.password_hash).toBeUndefined();
      expect(user.role).toBeUndefined();
    });

    it('debería manejar valores null', () => {
      const userData = {
        id: 1,
        email: null,
        password_hash: null,
        role: null
      };

      const user = new User(userData);

      expect(user.id).toBe(1);
      expect(user.email).toBeNull();
      expect(user.password_hash).toBeNull();
      expect(user.role).toBeNull();
    });

    it('debería manejar diferentes tipos de datos', () => {
      const userData = {
        id: '1',
        email: 123,
        password_hash: true,
        role: 456
      };

      const user = new User(userData);

      expect(user.id).toBe('1');
      expect(user.email).toBe(123);
      expect(user.password_hash).toBe(true);
      expect(user.role).toBe(456);
    });

    it('debería crear instancia sin parámetros', () => {
      expect(() => new User()).toThrow();
    });

    it('debería manejar diferentes roles', () => {
      const roles = ['customer', 'admin', 'moderator', 'guest'];
      
      roles.forEach(role => {
        const user = new User({
          id: 1,
          email: 'test@example.com',
          password_hash: 'hash',
          role: role
        });
        
        expect(user.role).toBe(role);
      });
    });

    it('debería manejar emails con diferentes formatos', () => {
      const emails = [
        'simple@example.com',
        'user.name@example.com',
        'user+tag@example.co.uk',
        'user123@sub.domain.com'
      ];

      emails.forEach(email => {
        const user = new User({
          id: 1,
          email: email,
          password_hash: 'hash',
          role: 'customer'
        });
        
        expect(user.email).toBe(email);
      });
    });

    it('debería manejar strings vacíos', () => {
      const userData = {
        id: 1,
        email: '',
        password_hash: '',
        role: ''
      };

      const user = new User(userData);

      expect(user.email).toBe('');
      expect(user.password_hash).toBe('');
      expect(user.role).toBe('');
    });
  });

  describe('propiedades', () => {
    it('debería permitir modificar las propiedades después de la creación', () => {
      const user = new User({
        id: 1,
        email: 'original@example.com',
        password_hash: 'originalhash',
        role: 'customer'
      });

      user.email = 'modified@example.com';
      user.role = 'admin';

      expect(user.email).toBe('modified@example.com');
      expect(user.role).toBe('admin');
    });

    it('debería mantener todas las propiedades como enumerables', () => {
      const user = new User({
        id: 1,
        email: 'test@example.com',
        password_hash: 'hash',
        role: 'customer'
      });
      const keys = Object.keys(user);

      expect(keys).toContain('id');
      expect(keys).toContain('email');
      expect(keys).toContain('password_hash');
      expect(keys).toContain('role');
      expect(keys).toHaveLength(4);
    });

    it('debería permitir agregar nuevas propiedades', () => {
      const user = new User({
        id: 1,
        email: 'test@example.com',
        password_hash: 'hash',
        role: 'customer'
      });
      
      user.created_at = new Date();
      user.active = true;

      expect(user.created_at).toBeInstanceOf(Date);
      expect(user.active).toBe(true);
      expect(Object.keys(user)).toContain('created_at');
      expect(Object.keys(user)).toContain('active');
    });

    it('debería permitir eliminar propiedades', () => {
      const user = new User({
        id: 1,
        email: 'test@example.com',
        password_hash: 'hash',
        role: 'customer'
      });

      delete user.password_hash;

      expect(user.password_hash).toBeUndefined();
      expect(Object.keys(user)).not.toContain('password_hash');
    });
  });
});
