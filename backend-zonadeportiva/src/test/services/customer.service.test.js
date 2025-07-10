import { jest } from '@jest/globals';

// Mock de la conexión a la base de datos
const mockQuery = jest.fn();
await jest.unstable_mockModule('../../../database/connectionPostgreSQL.js', () => ({
  pool: { query: mockQuery }
}));

// Importar después de hacer los mocks
const { pool } = await import('../../../database/connectionPostgreSQL.js');
const {
  updateCustomerInfo,
  getCustomerIdByUserId,
  getCustomerByUserId,
  getCustomerAddresses,
  createCustomerAddress,
  updateCustomerAddress,
  verifyAddressOwnership,
  deleteCustomerAddress
} = await import('../../services/customer.service.js');

describe('Customer Service', () => {
  let mockPool;

  beforeEach(() => {
    mockPool = { query: mockQuery };
    jest.clearAllMocks();
  });

  describe('updateCustomerInfo', () => {
    it('should update customer info successfully', async () => {
      const userId = 1;
      const customerData = {
        rut: '12345678-9',
        first_name: 'Juan',
        last_name: 'Pérez',
        phone: '+56912345678'
      };
      const updatedCustomer = { id: 1, user_id: userId, ...customerData };

      mockPool.query.mockResolvedValueOnce({ rows: [updatedCustomer] });

      const result = await updateCustomerInfo(userId, customerData);

      expect(result).toEqual(updatedCustomer);
      expect(mockPool.query).toHaveBeenCalledWith(
        expect.stringContaining('UPDATE customers'),
        [userId, customerData.rut, customerData.first_name, customerData.last_name, customerData.phone]
      );
    });

    it('should update customer with partial data', async () => {
      const userId = 1;
      const customerData = { first_name: 'Juan' };
      const updatedCustomer = { id: 1, user_id: userId, first_name: 'Juan' };

      mockPool.query.mockResolvedValueOnce({ rows: [updatedCustomer] });

      const result = await updateCustomerInfo(userId, customerData);

      expect(result).toEqual(updatedCustomer);
      expect(mockPool.query).toHaveBeenCalledWith(
        expect.stringContaining('UPDATE customers'),
        [userId, undefined, 'Juan', undefined, undefined]
      );
    });

    it('should return null when customer not found', async () => {
      const userId = 999;
      const customerData = { first_name: 'Juan' };

      mockPool.query.mockResolvedValueOnce({ rows: [] });

      const result = await updateCustomerInfo(userId, customerData);

      expect(result).toBeNull();
    });

    it('should handle database errors', async () => {
      const userId = 1;
      const customerData = { first_name: 'Juan' };
      const dbError = new Error('Database error');

      mockPool.query.mockRejectedValueOnce(dbError);

      await expect(updateCustomerInfo(userId, customerData)).rejects.toThrow('Database error');
    });
  });

  describe('getCustomerIdByUserId', () => {
    it('should return customer ID when found', async () => {
      mockPool.query.mockResolvedValueOnce({ rows: [{ id: 42 }] });
      const result = await getCustomerIdByUserId(1);
      expect(result).toBe(42);
    });

    it('should return null when no customer found', async () => {
      mockPool.query.mockResolvedValueOnce({ rows: [] });
      const result = await getCustomerIdByUserId(999);
      expect(result).toBeNull();
    });
  });

  describe('getCustomerByUserId', () => {
    it('should return customer details when found', async () => {
      const customer = { user_id: 1, email: 'test@mail.com', role: 'customer' };
      mockPool.query.mockResolvedValueOnce({ rows: [customer] });
      const result = await getCustomerByUserId(1);
      expect(result).toEqual(customer);
    });

    it('should return null when not found', async () => {
      mockPool.query.mockResolvedValueOnce({ rows: [] });
      const result = await getCustomerByUserId(999);
      expect(result).toBeNull();
    });
  });

  describe('getCustomerAddresses', () => {
    it('should return address list', async () => {
      const addresses = [{ address_id: 1, address: '123 Street' }];
      mockPool.query.mockResolvedValueOnce({ rows: addresses });
      const result = await getCustomerAddresses(1);
      expect(result).toEqual(addresses);
    });

    it('should return empty array when no addresses found', async () => {
      mockPool.query.mockResolvedValueOnce({ rows: [] });
      const result = await getCustomerAddresses(1);
      expect(result).toEqual([]);
    });

    it('should handle database errors', async () => {
      const dbError = new Error('Database connection failed');
      mockPool.query.mockRejectedValueOnce(dbError);

      await expect(getCustomerAddresses(1)).rejects.toThrow('Database connection failed');
    });
  });

  describe('createCustomerAddress', () => {
    it('should create and return new address', async () => {
      const addressData = {
        address: 'Calle 1',
        apartment: 'Dpto 2',
        number: '123',
        city_id: 10,
        state_id: 20
      };
      const insertedAddress = { id: 1, ...addressData };
      mockPool.query.mockResolvedValueOnce({ rows: [insertedAddress] });

      const result = await createCustomerAddress(5, addressData);
      expect(result).toEqual(insertedAddress);
    });

    it('should handle missing required fields', async () => {
      const addressData = {
        address: 'Calle 1'
        // Faltan campos requeridos
      };
      const dbError = new Error('Not null violation');
      mockPool.query.mockRejectedValueOnce(dbError);

      await expect(createCustomerAddress(5, addressData)).rejects.toThrow('Not null violation');
    });

    it('should handle invalid customer_id', async () => {
      const addressData = {
        address: 'Calle 1',
        number: '123',
        city_id: 10,
        state_id: 20
      };
      const dbError = new Error('Foreign key violation');
      mockPool.query.mockRejectedValueOnce(dbError);

      await expect(createCustomerAddress(999, addressData)).rejects.toThrow('Foreign key violation');
    });
  });

  describe('updateCustomerAddress', () => {
    it('should update and return address', async () => {
      const updated = {
        id: 1,
        address: 'Nueva Calle',
        apartment: null,
        number: '456',
        city_id: 11,
        state_id: 22
      };
      mockPool.query.mockResolvedValueOnce({ rows: [updated] });

      const result = await updateCustomerAddress(1, 5, {
        address: 'Nueva Calle',
        number: '456',
        city_id: 11,
        state_id: 22
      });

      expect(result).toEqual(updated);
    });

    it('should return null if no address updated', async () => {
      mockPool.query.mockResolvedValueOnce({ rows: [] });
      const result = await updateCustomerAddress(1, 5, {});
      expect(result).toBeNull();
    });

    it('should handle partial updates', async () => {
      const updated = {
        id: 1,
        address: 'Calle Original',
        apartment: null,
        number: '999',
        city_id: 10,
        state_id: 20
      };
      mockPool.query.mockResolvedValueOnce({ rows: [updated] });

      const result = await updateCustomerAddress(1, 5, { number: '999' });
      expect(result).toEqual(updated);
    });

    it('should handle database errors', async () => {
      const dbError = new Error('Database error');
      mockPool.query.mockRejectedValueOnce(dbError);

      await expect(updateCustomerAddress(1, 5, { address: 'Test' })).rejects.toThrow('Database error');
    });
  });

  describe('verifyAddressOwnership', () => {
    it('should return true if address belongs to customer', async () => {
      mockPool.query.mockResolvedValueOnce({ rows: [{ id: 1 }] });
      const result = await verifyAddressOwnership(1, 5);
      expect(result).toBe(true);
    });

    it('should return false if address does not belong to customer', async () => {
      mockPool.query.mockResolvedValueOnce({ rows: [] });
      const result = await verifyAddressOwnership(1, 99);
      expect(result).toBe(false);
    });

    it('should handle null or undefined parameters', async () => {
      // Mock para el primer caso (addressId = null)
      mockPool.query.mockResolvedValueOnce({ rows: [] });
      const result1 = await verifyAddressOwnership(null, 5);
      expect(result1).toBe(false);

      // Mock para el segundo caso (customerId = null)
      mockPool.query.mockResolvedValueOnce({ rows: [] });
      const result2 = await verifyAddressOwnership(1, null);
      expect(result2).toBe(false);

      // Mock para el caso de undefined
      mockPool.query.mockResolvedValueOnce({ rows: [] });
      const result3 = await verifyAddressOwnership(undefined, undefined);
      expect(result3).toBe(false);
    });

    it('should handle database errors', async () => {
      const dbError = new Error('Database error');
      mockPool.query.mockRejectedValueOnce(dbError);

      await expect(verifyAddressOwnership(1, 5)).rejects.toThrow('Database error');
    });
  });

  describe('deleteCustomerAddress', () => {
    it('should delete and return address', async () => {
      const deleted = { id: 1, address: 'Calle eliminada' };
      mockPool.query.mockResolvedValueOnce({ rows: [deleted] });
      const result = await deleteCustomerAddress(1, 5);
      expect(result).toEqual(deleted);
    });

    it('should return null if address not found', async () => {
      mockPool.query.mockResolvedValueOnce({ rows: [] });
      const result = await deleteCustomerAddress(1, 99);
      expect(result).toBeNull();
    });

    it('should handle invalid customer_id', async () => {
      mockPool.query.mockResolvedValueOnce({ rows: [] });
      const result = await deleteCustomerAddress(999, 1);
      expect(result).toBeNull();
    });

    it('should handle database errors', async () => {
      const dbError = new Error('Database error');
      mockPool.query.mockRejectedValueOnce(dbError);

      await expect(deleteCustomerAddress(1, 5)).rejects.toThrow('Database error');
    });
  });

  describe('Edge Cases', () => {
    it('should handle concurrent updates', async () => {
      const customerData = { first_name: 'Juan' };
      const updatedCustomer = { id: 1, user_id: 1, first_name: 'Juan' };

      mockPool.query.mockResolvedValueOnce({ rows: [updatedCustomer] });

      const result = await updateCustomerInfo(1, customerData);
      expect(result).toEqual(updatedCustomer);
    });

    it('should handle special characters in data', async () => {
      const customerData = {
        first_name: 'José María',
        last_name: "O'Connor",
        phone: '+56-9-1234-5678'
      };
      const updatedCustomer = { id: 1, user_id: 1, ...customerData };

      mockPool.query.mockResolvedValueOnce({ rows: [updatedCustomer] });

      const result = await updateCustomerInfo(1, customerData);
      expect(result).toEqual(updatedCustomer);
    });

    it('should handle large address data', async () => {
      const largeAddressData = {
        address: 'A'.repeat(500), // Dirección muy larga
        apartment: 'B'.repeat(100),
        number: '12345',
        city_id: 1,
        state_id: 1
      };
      
      mockPool.query.mockResolvedValueOnce({ rows: [{ id: 1, ...largeAddressData }] });

      const result = await createCustomerAddress(1, largeAddressData);
      expect(result.address).toBe(largeAddressData.address);
    });
  });
});