// src/test/services/orderEmail.service.test.js
import { jest, describe, it, expect, beforeEach, afterEach } from '@jest/globals';

// Mock del EmailService
const mockSendEmail = jest.fn();
const mockLoadTemplate = jest.fn();

jest.unstable_mockModule('../../services/email/email.service.js', () => ({
  default: jest.fn().mockImplementation(() => ({
    sendEmail: mockSendEmail,
    loadTemplate: mockLoadTemplate
  }))
}));

// Importar la INSTANCIA (no la clase)
const { default: orderEmailService } = await import('../../services/email/orderEmail.service.js');

describe('OrderEmailService', () => {
  beforeEach(() => {
    jest.clearAllMocks();
  });

  afterEach(() => {
    jest.clearAllMocks();
  });

  describe('sendOrderConfirmation', () => {
    const mockOrderData = {
      subtotal: 100,
      shipping: 10,
      total: 110,
      productos: [
        {
          nombre: 'Producto 1',
          precio: 50,
          cantidad: 1
        }
      ],
      customerName: 'Juan Pérez',
      orderDate: '2024-01-15'
    };

    it('debería enviar correo de confirmación de orden exitosamente', async () => {
      const email = 'cliente@example.com';
      const orderId = 'ORD-12345';
      
      mockLoadTemplate.mockResolvedValue('<html>Template cargado</html>');
      mockSendEmail.mockResolvedValue({
        success: true,
        messageId: 'msg-123'
      });

      // Usar directamente la instancia, no crear nueva
      await orderEmailService.sendOrderConfirmation(
        email,
        orderId,
        mockOrderData
      );

      expect(mockLoadTemplate).toHaveBeenCalledWith('order_confirmation', {
        orderId: 'ORD-12345',
        customerName: 'Juan Pérez',
        orderDate: '2024-01-15',
        subtotal: 100,
        shipping: 10,
        total: 110,
        itemList: expect.stringContaining('Producto 1'),
        appName: process.env.APP_NAME
      });

      expect(mockSendEmail).toHaveBeenCalledWith(
        email,
        `Nuevo pedido (#${orderId})`,
        '<html>Template cargado</html>'
      );
    });

    it('debería generar HTML correcto para los productos', async () => {
      const email = 'cliente@example.com';
      const orderId = 'ORD-12345';
      
      mockLoadTemplate.mockResolvedValue('<html>Template</html>');
      mockSendEmail.mockResolvedValue({ success: true });

      await orderEmailService.sendOrderConfirmation(
        email,
        orderId,
        mockOrderData
      );

      const templateCall = mockLoadTemplate.mock.calls[0][1];
      const itemList = templateCall.itemList;

      expect(itemList).toContain('<tr>');
      expect(itemList).toContain('Producto 1');
      expect(itemList).toContain('$50');
      expect(itemList).toContain('1'); // cantidad
    });

    it('debería manejar productos con precios undefined', async () => {
      const email = 'cliente@example.com';
      const orderId = 'ORD-12345';
      const orderDataSinPrecio = {
        ...mockOrderData,
        productos: [
          {
            nombre: 'Producto Sin Precio',
            cantidad: 1
            // precio undefined
          }
        ]
      };
      
      mockLoadTemplate.mockResolvedValue('<html>Template</html>');
      mockSendEmail.mockResolvedValue({ success: true });

      await orderEmailService.sendOrderConfirmation(
        email,
        orderId,
        orderDataSinPrecio
      );

      const templateCall = mockLoadTemplate.mock.calls[0][1];
      const itemList = templateCall.itemList;

      expect(itemList).toContain('Producto Sin Precio');
      expect(itemList).toContain('$0'); // precio por defecto
    });

    it('debería lanzar error si falla el envío del correo', async () => {
      const email = 'cliente@example.com';
      const orderId = 'ORD-12345';
      
      mockLoadTemplate.mockResolvedValue('<html>Template</html>');
      mockSendEmail.mockRejectedValue(new Error('Error al enviar correo'));

      await expect(
        orderEmailService.sendOrderConfirmation(email, orderId, mockOrderData)
      ).rejects.toThrow('Error al enviar correo');

      expect(mockLoadTemplate).toHaveBeenCalledTimes(1);
      expect(mockSendEmail).toHaveBeenCalledTimes(1);
    });

    it('debería lanzar error si falla la carga del template', async () => {
      const email = 'cliente@example.com';
      const orderId = 'ORD-12345';
      
      mockLoadTemplate.mockRejectedValue(new Error('Template no encontrado'));

      await expect(
        orderEmailService.sendOrderConfirmation(email, orderId, mockOrderData)
      ).rejects.toThrow('Template no encontrado');

      expect(mockLoadTemplate).toHaveBeenCalledTimes(1);
      expect(mockSendEmail).not.toHaveBeenCalled();
    });
  });
});

