import { jest } from '@jest/globals';

// Mock del pool de conexiones - ES modules compatible way
const mockPool = {
  query: jest.fn()
};

// Mock the entire module BEFORE importing
jest.unstable_mockModule('../../../database/connectionPostgreSQL.js', () => ({
  pool: mockPool
}));

// Import AFTER mocking
const { default: cartService } = await import('../../services/cart.service.js');

describe('Cart Service', () => {
  beforeEach(() => {
    jest.clearAllMocks();
  });

  describe('createCart', () => {
    it('should return existing cart if customer already has one', async () => {
      const userId = 1;
      const customerId = 10;
      const existingCart = { id: 1, customer_id: customerId, total: 0, quantity: 0 };

      // Mock getCustomerIdByUserId
      mockPool.query
        .mockResolvedValueOnce({ rows: [{ id: customerId }] }) // getCustomerIdByUserId
        .mockResolvedValueOnce({ rows: [existingCart] }); // check existing cart

      const result = await cartService.createCart(userId);

      expect(result).toEqual(existingCart);
      expect(mockPool.query).toHaveBeenCalledTimes(2);
    });

    it('should create new cart if customer does not have one', async () => {
      const userId = 1;
      const customerId = 10;
      const newCart = { id: 2, customer_id: customerId, total: 0, quantity: 0 };

      mockPool.query
        .mockResolvedValueOnce({ rows: [{ id: customerId }] }) // getCustomerIdByUserId
        .mockResolvedValueOnce({ rows: [] }) // no existing cart
        .mockResolvedValueOnce({ rows: [newCart] }); // create new cart

      const result = await cartService.createCart(userId);

      expect(result).toEqual(newCart);
      expect(mockPool.query).toHaveBeenCalledTimes(3);
      expect(mockPool.query).toHaveBeenLastCalledWith(
        expect.stringContaining('INSERT INTO carts'),
        [customerId, 0, 0]
      );
    });

    it('should throw error when customer not found', async () => {
      const userId = 999;

      mockPool.query
        .mockResolvedValueOnce({ rows: [] }); // customer not found

      await expect(cartService.createCart(userId)).rejects.toThrow('Error al crear el carrito');
    });

    it('should handle database errors', async () => {
      const userId = 1;
      const dbError = new Error('Database connection failed');

      mockPool.query.mockRejectedValueOnce(dbError);

      await expect(cartService.createCart(userId)).rejects.toThrow('Error al crear el carrito');
    });
  });

  describe('getCart', () => {
    it('should return cart with items', async () => {
      const userId = 1;
      const customerId = 10;
      const cart = { id: 1, customer_id: customerId, total: 100, quantity: 2 };
      const cartItems = [
        { id: 1, cart_id: 1, product_id: 1, quantity: 1, unit_price: 50, total_price: 50 },
        { id: 2, cart_id: 1, product_id: 2, quantity: 1, unit_price: 50, total_price: 50 }
      ];

      mockPool.query
        .mockResolvedValueOnce({ rows: [{ id: customerId }] }) // getCustomerIdByUserId
        .mockResolvedValueOnce({ rows: [cart] }) // get cart
        .mockResolvedValueOnce({ rows: cartItems }); // get cart items

      const result = await cartService.getCart(userId);

      expect(result).toEqual({
        ...cart,
        cart_items: cartItems
      });
      expect(mockPool.query).toHaveBeenCalledTimes(3);
    });

    it('should return null when cart does not exist', async () => {
      const userId = 1;
      const customerId = 10;

      mockPool.query
        .mockResolvedValueOnce({ rows: [{ id: customerId }] }) // getCustomerIdByUserId
        .mockResolvedValueOnce({ rows: [] }); // no cart found

      const result = await cartService.getCart(userId);

      expect(result).toBeNull();
      expect(mockPool.query).toHaveBeenCalledTimes(2);
    });

    it('should handle database errors', async () => {
      const userId = 1;
      const dbError = new Error('Database connection failed');

      mockPool.query.mockRejectedValueOnce(dbError);

      await expect(cartService.getCart(userId)).rejects.toThrow('Error al obtener el carrito');
    });
  });

  describe('saveCart', () => {
    it('should save cart items and update totals', async () => {
      const cartId = 1;
      const cartItems = [
        { product_id: 1, quantity: 2, unit_price: 25, total_price: 50 },
        { product_id: 2, quantity: 1, unit_price: 30, total_price: 30 }
      ];

      mockPool.query
        .mockResolvedValueOnce({ rows: [] }) // delete existing items
        .mockResolvedValueOnce({ rows: [] }) // insert item 1
        .mockResolvedValueOnce({ rows: [] }) // insert item 2
        .mockResolvedValueOnce({ rows: [] }); // update cart totals

      const result = await cartService.saveCart(cartId, cartItems);

      expect(result).toEqual({ message: 'Carrito actualizado correctamente' });
      expect(mockPool.query).toHaveBeenCalledTimes(4);
      
      // Verify cart totals update
      expect(mockPool.query).toHaveBeenLastCalledWith(
        'UPDATE carts SET quantity = $1, total = $2 WHERE id = $3',
        [3, 80, cartId] // total quantity: 3, total price: 80
      );
    });

    it('should handle empty cart items', async () => {
      const cartId = 1;
      const cartItems = [];

      mockPool.query
        .mockResolvedValueOnce({ rows: [] }) // delete existing items
        .mockResolvedValueOnce({ rows: [] }); // update cart totals

      const result = await cartService.saveCart(cartId, cartItems);

      expect(result).toEqual({ message: 'Carrito actualizado correctamente' });
      expect(mockPool.query).toHaveBeenCalledTimes(2);
      
      // Verify empty cart totals
      expect(mockPool.query).toHaveBeenLastCalledWith(
        'UPDATE carts SET quantity = $1, total = $2 WHERE id = $3',
        [0, 0, cartId]
      );
    });

    it('should handle database errors', async () => {
      const cartId = 1;
      const cartItems = [{ product_id: 1, quantity: 1, unit_price: 10, total_price: 10 }];
      const dbError = new Error('Database connection failed');

      mockPool.query.mockRejectedValueOnce(dbError);

      await expect(cartService.saveCart(cartId, cartItems)).rejects.toThrow('Error al guardar el carrito');
    });
  });

  describe('removeFromCart', () => {
    it('should remove item from cart successfully', async () => {
      const cartId = 1;
      const productId = 5;
      const removedItem = { id: 10, cart_id: cartId, product_id: productId };

      mockPool.query.mockResolvedValueOnce({ rows: [removedItem] });

      const result = await cartService.removeFromCart(cartId, productId);

      expect(result).toEqual(removedItem);
      expect(mockPool.query).toHaveBeenCalledWith(
        'DELETE FROM cart_items WHERE cart_id = $1 AND product_id = $2 RETURNING *',
        [cartId, productId]
      );
    });

    it('should handle when item does not exist', async () => {
      const cartId = 1;
      const productId = 999;

      mockPool.query.mockResolvedValueOnce({ rows: [] });

      const result = await cartService.removeFromCart(cartId, productId);

      expect(result).toBeUndefined();
    });

    it('should handle database errors', async () => {
      const cartId = 1;
      const productId = 5;
      const dbError = new Error('Database connection failed');

      mockPool.query.mockRejectedValueOnce(dbError);

      await expect(cartService.removeFromCart(cartId, productId)).rejects.toThrow('Error al eliminar del carrito');
    });
  });

  describe('getProduct', () => {
    it('should get product with metadata', async () => {
      const productId = 1;
      const product = { id: 1, name: 'Test Product', price: 100 };
      const metadata = { id: 1, product_id: 1, stock: 50, stock_status: 'instock' };

      mockPool.query
        .mockResolvedValueOnce({ rows: [product] })
        .mockResolvedValueOnce({ rows: [metadata] });

      const result = await cartService.getProduct(productId);

      expect(result).toEqual({
        ...product,
        metadata
      });
      expect(mockPool.query).toHaveBeenCalledTimes(2);
    });

    it('should handle product not found', async () => {
      const productId = 999;

      mockPool.query
        .mockResolvedValueOnce({ rows: [] })
        .mockResolvedValueOnce({ rows: [] });

      const result = await cartService.getProduct(productId);

      expect(result.id).toBeUndefined();
      expect(result.metadata).toBeUndefined();
    });

    it('should handle database errors', async () => {
      const productId = 1;
      const dbError = new Error('Database connection failed');

      mockPool.query.mockRejectedValueOnce(dbError);

      await expect(cartService.getProduct(productId)).rejects.toThrow('Error al obtener el producto');
    });
  });

  describe('getCustomerIdByUserId', () => {
    it('should return customer id for valid user', async () => {
      const userId = 1;
      const customerId = 10;
      const existingCart = { id: 1, customer_id: customerId, total: 0, quantity: 0 };

      mockPool.query
        .mockResolvedValueOnce({ rows: [{ id: customerId }] }) // getCustomerIdByUserId
        .mockResolvedValueOnce({ rows: [existingCart] }); // check existing cart

      // Esta función está exportada dentro del servicio, pero podemos testearla a través de createCart
      const result = await cartService.createCart(userId);

      expect(mockPool.query).toHaveBeenCalledWith(
        'SELECT id FROM customers WHERE user_id = $1',
        [userId]
      );
      expect(result).toEqual(existingCart);
    });

    it('should throw error when customer not found', async () => {
      const userId = 999;

      mockPool.query.mockResolvedValueOnce({ rows: [] });

      await expect(cartService.createCart(userId)).rejects.toThrow('Error al crear el carrito');
    });
  });

  // Test edge cases and error scenarios
  describe('Edge Cases', () => {
    it('should handle null/undefined parameters for createCart and getCart', async () => {
      // Estos deberían fallar porque requieren buscar customer_id
      mockPool.query.mockResolvedValue({ rows: [] });
      
      await expect(cartService.createCart(null)).rejects.toThrow();
      await expect(cartService.getCart(undefined)).rejects.toThrow();
    });

    it('should handle null parameters for saveCart', async () => {
      // saveCart con cartId null debería funcionar con array vacío
      mockPool.query
        .mockResolvedValueOnce({ rows: [] }) // delete existing items
        .mockResolvedValueOnce({ rows: [] }); // update cart totals

      const result = await cartService.saveCart(null, []);
      expect(result).toEqual({ message: 'Carrito actualizado correctamente' });
    });

    it('should handle null productId for removeFromCart', async () => {
      // removeFromCart con productId null debería lanzar error o no encontrar nada
      mockPool.query.mockResolvedValueOnce({ rows: [] });

      const result = await cartService.removeFromCart(1, null);
      expect(result).toBeUndefined();
    });

    it('should handle cart items with zero quantities', async () => {
      const cartId = 1;
      const cartItems = [
        { product_id: 1, quantity: 0, unit_price: 25, total_price: 0 }
      ];

      mockPool.query
        .mockResolvedValueOnce({ rows: [] }) // delete existing items
        .mockResolvedValueOnce({ rows: [] }) // insert item
        .mockResolvedValueOnce({ rows: [] }); // update cart totals

      const result = await cartService.saveCart(cartId, cartItems);

      expect(result).toEqual({ message: 'Carrito actualizado correctamente' });
    });

    it('should handle negative prices in cart items', async () => {
      const cartId = 1;
      const cartItems = [
        { product_id: 1, quantity: 1, unit_price: -10, total_price: -10 }
      ];

      mockPool.query
        .mockResolvedValueOnce({ rows: [] }) // delete existing items
        .mockResolvedValueOnce({ rows: [] }) // insert item
        .mockResolvedValueOnce({ rows: [] }); // update cart totals

      const result = await cartService.saveCart(cartId, cartItems);

      expect(result).toEqual({ message: 'Carrito actualizado correctamente' });
    });
  });
});