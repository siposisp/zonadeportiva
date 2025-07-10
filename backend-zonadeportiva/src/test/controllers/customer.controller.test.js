import { jest, describe, it, expect, beforeEach } from '@jest/globals';

// Mock de la conexión a la base de datos
const mockQuery = jest.fn();

await jest.unstable_mockModule('../../../database/connectionPostgreSQL.js', () => ({
  pool: { query: mockQuery }
}));

// Mock de los servicios
await jest.unstable_mockModule('../../services/customer.service.js', () => ({
  updateCustomerInfo: jest.fn(),
  getCustomerAddresses: jest.fn(),
  getCustomerIdByUserId: jest.fn(),
  createCustomerAddress: jest.fn(),
  updateCustomerAddress: jest.fn(),
  deleteCustomerAddress: jest.fn(),
  verifyAddressOwnership: jest.fn()
}));

// Importar después de los mocks
const { pool } = await import('../../../database/connectionPostgreSQL.js');
const {
  updateCustomerInfo,
  getCustomerAddresses,
  getCustomerIdByUserId,
  createCustomerAddress,
  updateCustomerAddress,
  deleteCustomerAddress,
  verifyAddressOwnership
} = await import('../../services/customer.service.js');

const {
  getCustomer,
  updateCustomer,
  getCustomerAddress,
  getCustomerAddressList,
  createAddress,
  updateAddress,
  deleteAddress
} = await import('../../controllers/customer.controller.js');

describe('Customer Controller', () => {
  let req, res;

  beforeEach(() => {
    jest.clearAllMocks();
    mockQuery.mockClear();
    updateCustomerInfo.mockClear();
    getCustomerAddresses.mockClear();
    getCustomerIdByUserId.mockClear();
    createCustomerAddress.mockClear();
    updateCustomerAddress.mockClear();
    deleteCustomerAddress.mockClear();
    verifyAddressOwnership.mockClear();

    req = {
      user: { id: 1 },
      body: {},
      params: {}
    };

    res = {
      status: jest.fn().mockReturnThis(),
      json: jest.fn()
    };
  });

  describe('getCustomer', () => {
    it('debería retornar información del usuario correctamente', async () => {
      const mockUserData = {
        user_id: 1,
        email: 'test@example.com',
        role: 'customer',
        customer_id: 1,
        rut: '12345678-9',
        first_name: 'Juan',
        last_name: 'Pérez',
        phone: '123456789'
      };

      mockQuery.mockResolvedValueOnce({ rows: [mockUserData] });

      await getCustomer(req, res);

      expect(mockQuery).toHaveBeenCalledWith(
        expect.stringContaining('SELECT'),
        [1]
      );
      expect(res.status).toHaveBeenCalledWith(200);
      expect(res.json).toHaveBeenCalledWith({ user: mockUserData });
    });

    it('debería retornar 404 si el usuario no existe', async () => {
      mockQuery.mockResolvedValueOnce({ rows: [] });

      await getCustomer(req, res);

      expect(res.status).toHaveBeenCalledWith(404);
      expect(res.json).toHaveBeenCalledWith({ message: 'Usuario no encontrado' });
    });

    it('debería manejar errores de base de datos', async () => {
      mockQuery.mockRejectedValueOnce(new Error('Database error'));

      await getCustomer(req, res);

      expect(res.status).toHaveBeenCalledWith(500);
      expect(res.json).toHaveBeenCalledWith({ message: 'Error interno al obtener usuario' });
    });
  });

  describe('updateCustomer', () => {
    it('debería actualizar la información del cliente correctamente', async () => {
      req.body = {
        rut: '12345678-9',
        first_name: 'Juan',
        last_name: 'Pérez',
        phone: '123456789'
      };

      const mockUpdatedCustomer = { id: 1, ...req.body };
      updateCustomerInfo.mockResolvedValueOnce(mockUpdatedCustomer);

      await updateCustomer(req, res);

      expect(updateCustomerInfo).toHaveBeenCalledWith(1, req.body);
      expect(res.status).toHaveBeenCalledWith(200);
      expect(res.json).toHaveBeenCalledWith({
        message: 'Información del cliente actualizada exitosamente'
      });
    });

    it('debería retornar 400 si no se proporciona ningún campo', async () => {
      req.body = {};

      await updateCustomer(req, res);

      expect(res.status).toHaveBeenCalledWith(400);
      expect(res.json).toHaveBeenCalledWith({
        message: 'Se debe proporcionar al menos un campo para actualizar'
      });
    });

    it('debería retornar 404 si el cliente no existe', async () => {
      req.body = { first_name: 'Juan' };
      updateCustomerInfo.mockResolvedValueOnce(null);

      await updateCustomer(req, res);

      expect(res.status).toHaveBeenCalledWith(404);
      expect(res.json).toHaveBeenCalledWith({ message: 'Cliente no encontrado' });
    });

    it('debería manejar errores del servicio', async () => {
      req.body = { first_name: 'Juan' };
      updateCustomerInfo.mockRejectedValueOnce(new Error('Service error'));

      await updateCustomer(req, res);

      expect(res.status).toHaveBeenCalledWith(500);
      expect(res.json).toHaveBeenCalledWith({ message: 'Error interno al actualizar cliente' });
    });
  });

  describe('getCustomerAddress', () => {
    it('debería retornar la dirección del cliente correctamente', async () => {
      const mockCustomer = { id: 1 };
      const mockAddress = {
        address_id: 1,
        address: 'Calle Principal 123',
        apartment: '4B',
        number: '123',
        city_id: 1,
        state_id: 1
      };

      mockQuery
        .mockResolvedValueOnce({ rows: [mockCustomer] })
        .mockResolvedValueOnce({ rows: [mockAddress] });

      await getCustomerAddress(req, res);

      expect(mockQuery).toHaveBeenCalledTimes(2);
      expect(res.status).toHaveBeenCalledWith(200);
      expect(res.json).toHaveBeenCalledWith({ address: mockAddress });
    });

    it('debería retornar null si no hay dirección', async () => {
      const mockCustomer = { id: 1 };

      mockQuery
        .mockResolvedValueOnce({ rows: [mockCustomer] })
        .mockResolvedValueOnce({ rows: [] });

      await getCustomerAddress(req, res);

      expect(res.status).toHaveBeenCalledWith(200);
      expect(res.json).toHaveBeenCalledWith({ address: null });
    });

    it('debería retornar 404 si el cliente no existe', async () => {
      mockQuery.mockResolvedValueOnce({ rows: [] });

      await getCustomerAddress(req, res);

      expect(res.status).toHaveBeenCalledWith(404);
      expect(res.json).toHaveBeenCalledWith({ message: 'Cliente no encontrado' });
    });

    it('debería manejar errores de base de datos', async () => {
      mockQuery.mockRejectedValueOnce(new Error('Database error'));

      await getCustomerAddress(req, res);

      expect(res.status).toHaveBeenCalledWith(500);
      expect(res.json).toHaveBeenCalledWith({
        message: 'Error interno al obtener dirección del cliente'
      });
    });
  });

  describe('getCustomerAddressList', () => {
    it('debería retornar todas las direcciones del cliente', async () => {
      const mockAddresses = [
        { id: 1, address: 'Dirección 1' },
        { id: 2, address: 'Dirección 2' }
      ];

      getCustomerIdByUserId.mockResolvedValueOnce(1);
      getCustomerAddresses.mockResolvedValueOnce(mockAddresses);

      await getCustomerAddressList(req, res);

      expect(getCustomerIdByUserId).toHaveBeenCalledWith(1);
      expect(getCustomerAddresses).toHaveBeenCalledWith(1);
      expect(res.status).toHaveBeenCalledWith(200);
      expect(res.json).toHaveBeenCalledWith({ addresses: mockAddresses });
    });

    it('debería retornar 404 si el cliente no existe', async () => {
      getCustomerIdByUserId.mockResolvedValueOnce(null);

      await getCustomerAddressList(req, res);

      expect(res.status).toHaveBeenCalledWith(404);
      expect(res.json).toHaveBeenCalledWith({ message: 'Cliente no encontrado' });
    });

    it('debería manejar errores del servicio', async () => {
      getCustomerIdByUserId.mockRejectedValueOnce(new Error('Service error'));

      await getCustomerAddressList(req, res);

      expect(res.status).toHaveBeenCalledWith(500);
      expect(res.json).toHaveBeenCalledWith({
        message: 'Error interno al obtener direcciones del cliente'
      });
    });
  });

  describe('createAddress', () => {
    it('debería crear una nueva dirección correctamente', async () => {
      req.body = {
        address: 'Nueva Dirección 123',
        apartment: '2A',
        number: '123',
        city_id: 1,
        state_id: 1
      };

      const mockNewAddress = { id: 1, ...req.body };
      getCustomerIdByUserId.mockResolvedValueOnce(1);
      createCustomerAddress.mockResolvedValueOnce(mockNewAddress);

      await createAddress(req, res);

      expect(getCustomerIdByUserId).toHaveBeenCalledWith(1);
      expect(createCustomerAddress).toHaveBeenCalledWith(1, req.body);
      expect(res.status).toHaveBeenCalledWith(201);
      expect(res.json).toHaveBeenCalledWith({
        message: 'Dirección creada exitosamente',
        address: mockNewAddress
      });
    });

    it('debería retornar 400 si faltan campos requeridos', async () => {
      req.body = { address: 'Dirección incompleta' };

      await createAddress(req, res);

      expect(res.status).toHaveBeenCalledWith(400);
      expect(res.json).toHaveBeenCalledWith({
        message: 'address, city_id y state_id son requeridos'
      });
    });

    it('debería retornar 404 si el cliente no existe', async () => {
      req.body = {
        address: 'Nueva Dirección',
        city_id: 1,
        state_id: 1
      };

      getCustomerIdByUserId.mockResolvedValueOnce(null);

      await createAddress(req, res);

      expect(res.status).toHaveBeenCalledWith(404);
      expect(res.json).toHaveBeenCalledWith({ message: 'Cliente no encontrado' });
    });

    it('debería manejar errores del servicio', async () => {
      req.body = {
        address: 'Nueva Dirección',
        city_id: 1,
        state_id: 1
      };

      getCustomerIdByUserId.mockRejectedValueOnce(new Error('Service error'));

      await createAddress(req, res);

      expect(res.status).toHaveBeenCalledWith(500);
      expect(res.json).toHaveBeenCalledWith({ message: 'Error interno al crear dirección' });
    });
  });

  describe('updateAddress', () => {
    beforeEach(() => {
      req.params.addressId = '1';
    });

    it('debería actualizar una dirección correctamente', async () => {
      req.body = {
        address: 'Dirección Actualizada',
        apartment: '3C',
        number: '456',
        city_id: 2,
        state_id: 2
      };

      const mockUpdatedAddress = { id: 1, ...req.body };
      getCustomerIdByUserId.mockResolvedValueOnce(1);
      verifyAddressOwnership.mockResolvedValueOnce(true);
      updateCustomerAddress.mockResolvedValueOnce(mockUpdatedAddress);

      await updateAddress(req, res);

      expect(getCustomerIdByUserId).toHaveBeenCalledWith(1);
      expect(verifyAddressOwnership).toHaveBeenCalledWith('1', 1);
      expect(updateCustomerAddress).toHaveBeenCalledWith('1', 1, req.body);
      expect(res.status).toHaveBeenCalledWith(200);
      expect(res.json).toHaveBeenCalledWith({
        message: 'Dirección actualizada exitosamente',
        address: mockUpdatedAddress
      });
    });

    it('debería retornar 400 si no se proporciona ningún campo', async () => {
      req.body = {};

      await updateAddress(req, res);

      expect(res.status).toHaveBeenCalledWith(400);
      expect(res.json).toHaveBeenCalledWith({
        message: 'Se debe proporcionar al menos un campo para actualizar'
      });
    });

    it('debería retornar 404 si el cliente no existe', async () => {
      req.body = { address: 'Nueva dirección' };
      getCustomerIdByUserId.mockResolvedValueOnce(null);

      await updateAddress(req, res);

      expect(res.status).toHaveBeenCalledWith(404);
      expect(res.json).toHaveBeenCalledWith({ message: 'Cliente no encontrado' });
    });

    it('debería retornar 403 si la dirección no pertenece al cliente', async () => {
      req.body = { address: 'Nueva dirección' };
      getCustomerIdByUserId.mockResolvedValueOnce(1);
      verifyAddressOwnership.mockResolvedValueOnce(false);

      await updateAddress(req, res);

      expect(res.status).toHaveBeenCalledWith(403);
      expect(res.json).toHaveBeenCalledWith({
        message: 'No tienes permisos para actualizar esta dirección'
      });
    });

    it('debería retornar 404 si la dirección no existe', async () => {
      req.body = { address: 'Nueva dirección' };
      getCustomerIdByUserId.mockResolvedValueOnce(1);
      verifyAddressOwnership.mockResolvedValueOnce(true);
      updateCustomerAddress.mockResolvedValueOnce(null);

      await updateAddress(req, res);

      expect(res.status).toHaveBeenCalledWith(404);
      expect(res.json).toHaveBeenCalledWith({ message: 'Dirección no encontrada' });
    });

    it('debería manejar errores del servicio', async () => {
      req.body = { address: 'Nueva dirección' };
      getCustomerIdByUserId.mockRejectedValueOnce(new Error('Service error'));

      await updateAddress(req, res);

      expect(res.status).toHaveBeenCalledWith(500);
      expect(res.json).toHaveBeenCalledWith({ message: 'Error interno al actualizar dirección' });
    });
  });

  describe('deleteAddress', () => {
    beforeEach(() => {
      req.params.addressId = '1';
    });

    it('debería eliminar una dirección correctamente', async () => {
      const mockDeletedAddress = { id: 1, address: 'Dirección eliminada' };
      getCustomerIdByUserId.mockResolvedValueOnce(1);
      verifyAddressOwnership.mockResolvedValueOnce(true);
      deleteCustomerAddress.mockResolvedValueOnce(mockDeletedAddress);

      await deleteAddress(req, res);

      expect(getCustomerIdByUserId).toHaveBeenCalledWith(1);
      expect(verifyAddressOwnership).toHaveBeenCalledWith('1', 1);
      expect(deleteCustomerAddress).toHaveBeenCalledWith('1', 1);
      expect(res.status).toHaveBeenCalledWith(200);
      expect(res.json).toHaveBeenCalledWith({
        message: 'Dirección eliminada exitosamente'
      });
    });

    it('debería retornar 404 si el cliente no existe', async () => {
      getCustomerIdByUserId.mockResolvedValueOnce(null);

      await deleteAddress(req, res);

      expect(res.status).toHaveBeenCalledWith(404);
      expect(res.json).toHaveBeenCalledWith({ message: 'Cliente no encontrado' });
    });

    it('debería retornar 403 si la dirección no pertenece al cliente', async () => {
      getCustomerIdByUserId.mockResolvedValueOnce(1);
      verifyAddressOwnership.mockResolvedValueOnce(false);

      await deleteAddress(req, res);

      expect(res.status).toHaveBeenCalledWith(403);
      expect(res.json).toHaveBeenCalledWith({
        message: 'No tienes permisos para eliminar esta dirección'
      });
    });

    it('debería retornar 404 si la dirección no existe', async () => {
      getCustomerIdByUserId.mockResolvedValueOnce(1);
      verifyAddressOwnership.mockResolvedValueOnce(true);
      deleteCustomerAddress.mockResolvedValueOnce(null);

      await deleteAddress(req, res);

      expect(res.status).toHaveBeenCalledWith(404);
      expect(res.json).toHaveBeenCalledWith({ message: 'Dirección no encontrada' });
    });

    it('debería manejar errores del servicio', async () => {
      getCustomerIdByUserId.mockRejectedValueOnce(new Error('Service error'));

      await deleteAddress(req, res);

      expect(res.status).toHaveBeenCalledWith(500);
      expect(res.json).toHaveBeenCalledWith({ message: 'Error interno al eliminar dirección' });
    });
  });
});
