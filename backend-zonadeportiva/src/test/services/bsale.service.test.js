// src/test/services/bsale.service.test.js
import { jest, describe, it, expect, beforeEach, afterEach, beforeAll, afterAll } from '@jest/globals';
// CONFIGURAR VARIABLES DE ENTORNO ANTES DE IMPORTAR
const originalEnv = process.env;

// Configurar el entorno ANTES de cualquier importación
process.env = {
  ...originalEnv,
  BSALE_TOKEN: 'test_bsale_token_123'
};

// Mock de axios
const mockAxios = {
  get: jest.fn(),
  post: jest.fn()
};

// Mock de PDFKit COMPLETO
const mockPdfDoc = {
  on: jest.fn(),
  pipe: jest.fn().mockReturnThis(),
  image: jest.fn().mockReturnThis(),
  font: jest.fn().mockReturnThis(),
  fontSize: jest.fn().mockReturnThis(),
  text: jest.fn().mockReturnThis(),
  rect: jest.fn().mockReturnThis(),
  stroke: jest.fn().mockReturnThis(),
  fillColor: jest.fn().mockReturnThis(),
  moveTo: jest.fn().mockReturnThis(),
  lineTo: jest.fn().mockReturnThis(),
  moveDown: jest.fn().mockReturnThis(),
  end: jest.fn(),
  removeAllListeners: jest.fn(), // ← AGREGAR ESTE MÉTODO
  page: { width: 600, margins: { top: 50, bottom: 50, left: 72, right: 72 } },
  y: 100 // Agregar propiedad y para evitar errores
};

// Mock del EmailService
const mockSendEmail = jest.fn();
const mockLoadTemplate = jest.fn();
const mockEmailService = {
  sendEmail: mockSendEmail,
  loadTemplate: mockLoadTemplate
};

// Configurar mocks usando unstable_mockModule
jest.unstable_mockModule('axios', () => ({
  default: mockAxios
}));

jest.unstable_mockModule('pdfkit', () => ({
  default: jest.fn(() => mockPdfDoc)
}));

jest.unstable_mockModule('../../services/email/email.service.js', () => ({
  default: jest.fn(() => mockEmailService)
}));

// Importar dinámicamente DESPUÉS de configurar los mocks
const {
  getIdVariantBySku,
  decreaseStock,
  generarYEnviarBoleta
} = await import('../../services/bsale.service.js');

describe('Bsale Service', () => {
  beforeAll(() => {
    // Variables ya configuradas arriba
  });

  afterAll(() => {
    process.env = originalEnv;
  });

  beforeEach(() => {
    jest.clearAllMocks();
  });

  afterEach(() => {
    jest.clearAllMocks();
  });

  describe('getIdVariantBySku', () => {
    it('debería retornar el ID de variante cuando encuentra el SKU', async () => {
      const mockResponse = {
        data: {
          items: [{ id: 123 }]
        }
      };
      
      mockAxios.get.mockResolvedValue(mockResponse);

      const result = await getIdVariantBySku('TEST-SKU');

      expect(result).toBe(123);
      expect(mockAxios.get).toHaveBeenCalledWith(
        'https://api.bsale.io/v1/variants.json?code=TEST-SKU',
        {
          headers: {
            'access_token': 'test_bsale_token_123'
          }
        }
      );
    });

    it('debería lanzar error si no encuentra items', async () => {
      const mockResponse = {
        data: {
          items: []
        }
      };
      
      mockAxios.get.mockResolvedValue(mockResponse);

      await expect(getIdVariantBySku('NOT-FOUND'))
        .rejects.toThrow('No se pudo obtener la variante');
    });

    it('debería lanzar error si la respuesta no tiene items', async () => {
      const mockResponse = {
        data: {}
      };
      
      mockAxios.get.mockResolvedValue(mockResponse);

      await expect(getIdVariantBySku('ANY-SKU'))
        .rejects.toThrow('No se pudo obtener la variante');
    });

    it('debería manejar errores de red', async () => {
      mockAxios.get.mockRejectedValue(new Error('Network Error'));

      await expect(getIdVariantBySku('ANY-SKU'))
        .rejects.toThrow('No se pudo obtener la variante');
    });
  });

  describe('decreaseStock', () => {
    const sku = 'SKU-001';
    const quantity = 5;
    const variantId = 456;

    it('debería disminuir stock exitosamente', async () => {
      // Mock para getIdVariantBySku
      mockAxios.get.mockResolvedValue({
        data: { items: [{ id: variantId }] }
      });
      
      // Mock para decreaseStock
      mockAxios.post.mockResolvedValue({
        data: { success: true, id: 789 }
      });

      const result = await decreaseStock(sku, quantity);

      expect(result).toEqual({ success: true, id: 789 });
      expect(mockAxios.get).toHaveBeenCalledTimes(1);
      expect(mockAxios.post).toHaveBeenCalledWith(
        'https://api.bsale.io/v1/stocks/consumptions.json',
        {
          note: 'Consumo por API',
          officeId: 1,
          details: [
            {
              quantity: quantity,
              variantId: variantId
            }
          ]
        },
        {
          headers: {
            access_token: 'test_bsale_token_123',
            'Content-Type': 'application/json'
          }
        }
      );
    });

    it('debería lanzar error si no encuentra el SKU', async () => {
      mockAxios.get.mockResolvedValue({
        data: { items: [] }
      });

      await expect(decreaseStock(sku, quantity))
        .rejects.toThrow('No se pudo consumir el stock');
      
      expect(mockAxios.post).not.toHaveBeenCalled();
    });

    it('debería manejar errores de la API de Bsale', async () => {
      mockAxios.get.mockResolvedValue({
        data: { items: [{ id: variantId }] }
      });
      
      const apiError = {
        response: {
          status: 500,
          data: { message: 'Internal Server Error' }
        }
      };
      mockAxios.post.mockRejectedValue(apiError);

      await expect(decreaseStock(sku, quantity))
        .rejects.toThrow('No se pudo consumir el stock: Internal Server Error');
    });

    it('debería manejar errores de red sin respuesta', async () => {
      mockAxios.get.mockResolvedValue({
        data: { items: [{ id: variantId }] }
      });
      
      const networkError = {
        request: 'Some request object'
      };
      mockAxios.post.mockRejectedValue(networkError);

      await expect(decreaseStock(sku, quantity))
        .rejects.toThrow('No se pudo consumir el stock');
    });
  });

  describe('generarYEnviarBoleta', () => {
    // DEFINIR CLIENTE AQUÍ PARA TODOS LOS TESTS
    const cliente = { nombre: 'Juan Pérez', email: 'juan@test.com' };
    const productos = [
      { nombre: 'Producto 1', cantidad: 2, precio: 1000 }
    ];
    const subtotal = 2000;
    const shipping = 500;
    const total = 2500;
    const orderId = 'ORD-123';

    it('debería generar PDF y enviar email exitosamente', async () => {
      let dataCallback;
      let endCallback;
      
      // Capturar los callbacks de los eventos
      mockPdfDoc.on.mockImplementation((event, callback) => {
        if (event === 'data') {
          dataCallback = callback;
        } else if (event === 'end') {
          endCallback = callback;
        }
      });

      mockLoadTemplate.mockResolvedValue('<html>Contenido del email</html>');
      mockSendEmail.mockResolvedValue({ success: true, messageId: 'msg-123' });

      const promise = generarYEnviarBoleta(
        cliente, 
        productos, 
        subtotal, 
        shipping, 
        total, 
        orderId
      );

      // Simular datos del PDF
      if (dataCallback) {
        dataCallback(Buffer.from('PDF content chunk'));
      }

      // Simular que el PDF terminó de generarse
      if (endCallback) {
        await endCallback();
      }

      const result = await promise;

      // La función no retorna nada en caso de éxito, solo resuelve
      expect(result).toBeUndefined();
      expect(mockPdfDoc.removeAllListeners).toHaveBeenCalled();
      expect(mockLoadTemplate).toHaveBeenCalledWith('boleta', expect.any(Object));
      expect(mockSendEmail).toHaveBeenCalledWith(
        'juan@test.com',
        'Tu boleta de compra',
        '<html>Contenido del email</html>',
        expect.arrayContaining([
          expect.objectContaining({
            filename: expect.stringMatching(/boleta-\d+\.pdf/),
            content: expect.any(Buffer),
            contentType: 'application/pdf'
          })
        ])
      );
    });

    it('debería rechazar si falla el envío del email', async () => {
      let dataCallback;
      let endCallback;
      
      mockPdfDoc.on.mockImplementation((event, callback) => {
        if (event === 'data') {
          dataCallback = callback;
        } else if (event === 'end') {
          endCallback = callback;
        }
      });

      mockLoadTemplate.mockResolvedValue('<html>Template</html>');
      const emailError = new Error('SMTP server down');
      mockSendEmail.mockRejectedValue(emailError);

      const promise = generarYEnviarBoleta(
        cliente, 
        productos, 
        subtotal, 
        shipping, 
        total, 
        orderId
      );

      // Simular datos del PDF
      if (dataCallback) {
        dataCallback(Buffer.from('PDF content chunk'));
      }

      // Simular que el PDF terminó de generarse
      if (endCallback) {
        await endCallback();
      }

      await expect(promise).rejects.toThrow('SMTP server down');
    });

    it('debería rechazar si falla la carga del template', async () => {
      const templateError = new Error('Template not found');
      mockLoadTemplate.mockRejectedValue(templateError);

      // Mock para simular que el evento 'end' se ejecuta inmediatamente
      mockPdfDoc.on.mockImplementation((event, callback) => {
        if (event === 'end') {
          // Ejecutar el callback inmediatamente para simular el fin del PDF
          process.nextTick(callback);
        }
      });

      await expect(
        generarYEnviarBoleta(cliente, productos, subtotal, shipping, total, orderId)
      ).rejects.toThrow('Template not found');
    });

    it('debería generar PDF con múltiples productos', async () => {
      let dataCallback;
      let endCallback;
      
      mockPdfDoc.on.mockImplementation((event, callback) => {
        if (event === 'data') {
          dataCallback = callback;
        } else if (event === 'end') {
          endCallback = callback;
        }
      });

      const productosMultiples = [
        { nombre: 'Producto 1', cantidad: 2, precio: 1000 },
        { nombre: 'Producto 2', cantidad: 1, precio: 1500 },
        { nombre: 'Producto 3', cantidad: 3, precio: 500 }
      ];

      mockLoadTemplate.mockResolvedValue('<html>Template</html>');
      mockSendEmail.mockResolvedValue({ success: true });

      const promise = generarYEnviarBoleta(
        cliente, 
        productosMultiples, 
        4000, 
        500, 
        4500, 
        orderId
      );

      // Simular datos del PDF
      if (dataCallback) {
        dataCallback(Buffer.from('PDF content chunk'));
      }

      // Simular que el PDF terminó de generarse
      if (endCallback) {
        await endCallback();
      }

      await promise;

      expect(mockPdfDoc.removeAllListeners).toHaveBeenCalled();
      expect(mockLoadTemplate).toHaveBeenCalledWith('boleta', expect.objectContaining({
        nombre: cliente.nombre,
        fecha: expect.any(String),
        itemList: expect.any(String),
        subtotal: '4.000',
        shipping: '500',
        total: '4.500',
        appName: 'Zona Deportiva'
      }));
    });
  });
});