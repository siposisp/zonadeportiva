// src/test/services/linkify.service.test.js
import { jest, describe, it, expect, beforeEach, afterEach, beforeAll, afterAll } from '@jest/globals';

// CONFIGURAR VARIABLES DE ENTORNO ANTES DE IMPORTAR
const originalEnv = process.env;

// Configurar el entorno ANTES de cualquier importación
process.env = {
  ...originalEnv,
  NODE_ENV: 'development',
  LINKIFY_USERNAME: 'test_user',
  LINKIFY_PASSWORD: 'test_pass',
  LINKIFY_MERCHANT: 'test_merchant',
  LINKIFY_BANK: 'test_bank',
  LINKIFY_WEBHOOK_SECRET: 'test_secret',
  LINKIFY_TIMEOUT: '5000'
};

// AHORA SÍ importar dinámicamente con las variables correctas
const {
  crearPagoLinkify,
  consultarPagoLinkify,
  cancelarPagoLinkify,
  obtenerBancosLinkify,
  procesarWebhookLinkify,
  simularWebhookLinkify
} = await import('../../services/linkify.service.js');

describe('Linkify Service (modo desarrollo)', () => {
  beforeAll(() => {
    // Ya no necesitamos configurar aquí porque ya lo hicimos arriba
  });

  afterAll(() => {
    process.env = originalEnv;
  });

  beforeEach(() => {
    jest.clearAllMocks();
    // Suprimir console.log en todas las pruebas
    //jest.spyOn(console, 'log').mockImplementation(() => {});
  });

  describe('Funciones principales de pago', () => {
    it('crearPagoLinkify retorna datos simulados', async () => {
      const payload = {
        invoice_id: 'inv123',
        amount: 10000
      };

      const result = await crearPagoLinkify(payload);

      expect(result.success).toBe(true);
      expect(result.invoice_id).toBe(payload.invoice_id);
      expect(result.amount).toBe(payload.amount);
      expect(result.status).toBe('pending');
      expect(result.payment_url).toContain('linkify.cl/pay/mock_');
      expect(result.payment_id).toContain('mock_');
      expect(result.message).toBe('Pago creado exitosamente (MOCK)');
    });

    it('consultarPagoLinkify retorna estado válido', async () => {
      const invoiceId = 'inv123';
      const result = await consultarPagoLinkify(invoiceId);

      expect(result.success).toBe(true);
      expect(result.invoice_id).toBe(invoiceId);
      expect(['paid', 'pending']).toContain(result.status);
      expect(result.amount).toBe(15000);
      expect(result.message).toBe('Consulta exitosa (MOCK)');
    });

    it('cancelarPagoLinkify retorna cancelación exitosa', async () => {
      const invoiceId = 'inv123';
      const result = await cancelarPagoLinkify(invoiceId);

      expect(result.success).toBe(true);
      expect(result.invoice_id).toBe(invoiceId);
      expect(result.status).toBe('cancelled');
      expect(result.message).toBe('Pago cancelado exitosamente (MOCK)');
    });

    it('obtenerBancosLinkify retorna lista de bancos', async () => {
      const result = await obtenerBancosLinkify();

      expect(result.success).toBe(true);
      expect(Array.isArray(result.banks)).toBe(true);
      expect(result.banks.length).toBeGreaterThan(0);
      expect(result.banks[0]).toHaveProperty('code');
      expect(result.banks[0]).toHaveProperty('name');
      expect(result.message).toBe('Bancos obtenidos exitosamente (MOCK)');
    });
  });

  describe('Simulador de webhook', () => {
    it('simularWebhookLinkify genera webhook válido', () => {
      const invoiceId = 'inv123';
      const status = 'paid';
      const result = simularWebhookLinkify(invoiceId, status);

      expect(result.invoice_id).toBe(invoiceId);
      expect(result.status).toBe(status);
      expect(result.amount).toBe(15000);
      expect(result.transaction_id).toContain('txn_mock_');
      expect(result.payment_method).toBe('transfer');
      expect(result.bank_code).toBe('001');
      expect(result.customer_email).toBe('test@example.com');
      expect(result.metadata).toEqual({
        source: 'mock',
        test: true
      });
    });

    it('simularWebhookLinkify con estado personalizado', () => {
      const invoiceId = 'inv456';
      const status = 'failed';
      const result = simularWebhookLinkify(invoiceId, status);

      expect(result.invoice_id).toBe(invoiceId);
      expect(result.status).toBe(status);
    });
  });

  describe('Procesamiento de webhooks', () => {
    it('procesarWebhookLinkify procesa webhook con estado paid', async () => {
      const webhook = simularWebhookLinkify('inv456', 'paid');
      const result = await procesarWebhookLinkify(webhook);

      expect(result.success).toBe(true);
      expect(result.invoice_id).toBe('inv456');
      expect(result.status).toBe('completed');
      expect(result.processed_at).toBeDefined();
    });

    it('procesarWebhookLinkify normaliza diferentes estados', async () => {
      const testCases = [
        { input: 'paid', expected: 'completed' },
        { input: 'successful', expected: 'completed' },
        { input: 'pending', expected: 'pending' },
        { input: 'failed', expected: 'failed' },
        { input: 'cancelled', expected: 'cancelled' },
        { input: 'expired', expected: 'expired' }
      ];

      for (const testCase of testCases) {
        const webhook = simularWebhookLinkify('inv_test', testCase.input);
        const result = await procesarWebhookLinkify(webhook);
        
        expect(result.status).toBe(testCase.expected);
      }
    });

    it('procesarWebhookLinkify lanza error si faltan datos', async () => {
      const invalidWebhook = {
        invoice_id: null,
        status: null
      };

      await expect(procesarWebhookLinkify(invalidWebhook))
        .rejects.toThrow('Error procesando webhook: Datos incompletos en webhook');
    });

    it('procesarWebhookLinkify maneja webhook sin campos opcionales', async () => {
      const minimalWebhook = {
        invoice_id: 'inv_minimal',
        status: 'paid'
      };

      const result = await procesarWebhookLinkify(minimalWebhook);

      expect(result.success).toBe(true);
      expect(result.invoice_id).toBe('inv_minimal');
      expect(result.status).toBe('completed');
    });
  });

  describe('Timeouts y timing', () => {
    it('crearPagoLinkify respeta el timeout configurado', async () => {
      const startTime = Date.now();
      const payload = { invoice_id: 'inv_timeout', amount: 5000 };
      
      await crearPagoLinkify(payload);
      
      const endTime = Date.now();
      const duration = endTime - startTime;
      
      // Debería tomar al menos 1000ms (mock delay)
      expect(duration).toBeGreaterThanOrEqual(950);
    });

    it('consultarPagoLinkify es más rápido que crear pago', async () => {
      const startTime = Date.now();
      
      await consultarPagoLinkify('inv_speed');
      
      const endTime = Date.now();
      const duration = endTime - startTime;
      
      // Debería tomar al menos 500ms (mock delay)
      expect(duration).toBeGreaterThanOrEqual(450);
      expect(duration).toBeLessThan(1000);
    });
  });

  describe('Integración completa', () => {
    it('flujo completo de pago exitoso', async () => {
      const invoiceId = 'inv_integration';
      const amount = 25000;

      // 1. Crear pago
      const createResult = await crearPagoLinkify({
        invoice_id: invoiceId,
        amount: amount
      });
      expect(createResult.success).toBe(true);

      // 2. Consultar estado
      const consultResult = await consultarPagoLinkify(invoiceId);
      expect(consultResult.success).toBe(true);

      // 3. Simular webhook de pago completado
      const webhook = simularWebhookLinkify(invoiceId, 'paid');
      const webhookResult = await procesarWebhookLinkify(webhook);
      expect(webhookResult.status).toBe('completed');

      // 4. Verificar que todo el flujo funcionó
      expect(createResult.invoice_id).toBe(invoiceId);
      expect(consultResult.invoice_id).toBe(invoiceId);
      expect(webhookResult.invoice_id).toBe(invoiceId);
    });
  });

  describe('Funciones auxiliares y casos edge', () => {
    describe('normalizePaymentStatus', () => {
      it('normaliza todos los estados de pago correctamente', async () => {
        const testCases = [
          // Estados de completado
          { input: 'paid', expected: 'completed' },
          { input: 'successful', expected: 'completed' },
          { input: 'completed', expected: 'completed' },
          { input: 'approved', expected: 'completed' },
          
          // Estados pendientes
          { input: 'pending', expected: 'pending' },
          { input: 'waiting', expected: 'pending' },
          { input: 'processing', expected: 'pending' },
          
          // Estados fallidos
          { input: 'failed', expected: 'failed' },
          { input: 'error', expected: 'failed' },
          { input: 'rejected', expected: 'failed' },
          
          // Estados cancelados
          { input: 'cancelled', expected: 'cancelled' },
          { input: 'canceled', expected: 'cancelled' },
          
          // Estados expirados
          { input: 'expired', expected: 'expired' },
          { input: 'timeout', expected: 'expired' },
          
          // Estados desconocidos
          { input: 'unknown_status', expected: 'unknown' },
          { input: 'PAID', expected: 'completed' }, // Mayúsculas
          { input: 'Failed', expected: 'failed' }   // Mixto
        ];

        for (const testCase of testCases) {
          const webhook = {
            invoice_id: 'test_normalize',
            status: testCase.input,
            amount: 1000
          };
          
          const result = await procesarWebhookLinkify(webhook);
          expect(result.status).toBe(testCase.expected);
        }
      });
    });

    describe('Manejo de errores en webhooks', () => {
      it('maneja webhook con invoice_id vacío', async () => {
        const webhook = {
          invoice_id: '',
          status: 'paid'
        };

        await expect(procesarWebhookLinkify(webhook))
          .rejects.toThrow('Error procesando webhook: Datos incompletos en webhook');
      });

      it('maneja webhook con status vacío', async () => {
        const webhook = {
          invoice_id: 'inv123',
          status: ''
        };

        await expect(procesarWebhookLinkify(webhook))
          .rejects.toThrow('Error procesando webhook: Datos incompletos en webhook');
      });

      it('maneja webhook con datos undefined', async () => {
        const webhook = {
          invoice_id: undefined,
          status: undefined
        };

        await expect(procesarWebhookLinkify(webhook))
          .rejects.toThrow('Error procesando webhook: Datos incompletos en webhook');
      });

      it('procesa webhook con todos los campos opcionales', async () => {
        const webhook = {
          invoice_id: 'inv_complete',
          status: 'paid',
          amount: 25000,
          transaction_id: 'txn_123456',
          payment_method: 'credit_card',
          paid_at: '2024-01-15T10:30:00Z',
          bank_code: '012',
          customer_email: 'customer@example.com',
          metadata: {
            custom_field: 'value',
            order_id: 'ORD-123'
          }
        };

        const result = await procesarWebhookLinkify(webhook);

        expect(result.success).toBe(true);
        expect(result.invoice_id).toBe('inv_complete');
        expect(result.status).toBe('completed');
        expect(result.processed_at).toBeDefined();
      });
    });

    describe('Casos edge de funciones principales', () => {
      it('crearPagoLinkify con payload mínimo', async () => {
        const payload = {
          invoice_id: 'inv_minimal',
          amount: 1
        };

        const result = await crearPagoLinkify(payload);

        expect(result.success).toBe(true);
        expect(result.invoice_id).toBe('inv_minimal');
        expect(result.amount).toBe(1);
      });

      it('crearPagoLinkify con payload completo', async () => {
        const payload = {
          invoice_id: 'inv_complete',
          amount: 50000,
          customer_email: 'test@example.com',
          description: 'Pago de prueba completo',
          metadata: {
            order_id: 'ORD-456',
            source: 'web'
          }
        };

        const result = await crearPagoLinkify(payload);

        expect(result.success).toBe(true);
        expect(result.invoice_id).toBe('inv_complete');
        expect(result.amount).toBe(50000);
        expect(result.payment_url).toContain('linkify.cl/pay/mock_');
      });

      it('consultarPagoLinkify con diferentes tipos de invoice_id', async () => {
        const testIds = [
          'inv_123',
          'INV-456',
          'invoice_with_underscores',
          'invoice-with-dashes',
          '12345',
          'inv_very_long_invoice_id_with_many_characters'
        ];

        for (const invoiceId of testIds) {
          const result = await consultarPagoLinkify(invoiceId);
          expect(result.success).toBe(true);
          expect(result.invoice_id).toBe(invoiceId);
        }
      });

      it('cancelarPagoLinkify con diferentes invoice_ids', async () => {
        const testIds = ['inv_cancel_1', 'inv_cancel_2', 'inv_cancel_3'];

        for (const invoiceId of testIds) {
          const result = await cancelarPagoLinkify(invoiceId);
          expect(result.success).toBe(true);
          expect(result.invoice_id).toBe(invoiceId);
          expect(result.status).toBe('cancelled');
        }
      });

      it('obtenerBancosLinkify verifica estructura completa de bancos', async () => {
        const result = await obtenerBancosLinkify();

        expect(result.success).toBe(true);
        expect(Array.isArray(result.banks)).toBe(true);
        expect(result.banks.length).toBe(4); // Según tu mock

        // Verificar cada banco
        result.banks.forEach(bank => {
          expect(bank).toHaveProperty('code');
          expect(bank).toHaveProperty('name');
          expect(typeof bank.code).toBe('string');
          expect(typeof bank.name).toBe('string');
          expect(bank.code.length).toBeGreaterThan(0);
          expect(bank.name.length).toBeGreaterThan(0);
        });

        // Verificar bancos específicos
        const bankCodes = result.banks.map(b => b.code);
        expect(bankCodes).toContain('001');
        expect(bankCodes).toContain('012');
        expect(bankCodes).toContain('016');
        expect(bankCodes).toContain('037');
      });
    });

    describe('Simulador de webhook - casos adicionales', () => {
      it('simularWebhookLinkify con diferentes estados', () => {
        const estados = ['paid', 'pending', 'failed', 'cancelled', 'expired'];
        
        estados.forEach(status => {
          const result = simularWebhookLinkify('inv_test', status);
          
          expect(result.invoice_id).toBe('inv_test');
          expect(result.status).toBe(status);
          expect(result.amount).toBe(15000);
          expect(result.transaction_id).toContain('txn_mock_');
          expect(result.payment_method).toBe('transfer');
          expect(result.bank_code).toBe('001');
          expect(result.customer_email).toBe('test@example.com');
          expect(result.metadata).toEqual({
            source: 'mock',
            test: true
          });
          expect(result.paid_at).toBeDefined();
        });
      });

      it('simularWebhookLinkify sin parámetro status usa default', () => {
        const result = simularWebhookLinkify('inv_default');
        
        expect(result.status).toBe('paid'); // Default
        expect(result.invoice_id).toBe('inv_default');
      });

      it('simularWebhookLinkify genera transaction_id único', () => {
        const result1 = simularWebhookLinkify('inv1');
        const result2 = simularWebhookLinkify('inv2');
        
        expect(result1.transaction_id).not.toBe(result2.transaction_id);
        expect(result1.transaction_id).toContain('txn_mock_');
        expect(result2.transaction_id).toContain('txn_mock_');
      });
    });
    
    describe('Validación de variables de entorno', () => {
      it('verifica que las variables de entorno estén configuradas', () => {
        expect(process.env.NODE_ENV).toBe('development');
        expect(process.env.LINKIFY_USERNAME).toBe('test_user');
        expect(process.env.LINKIFY_PASSWORD).toBe('test_pass');
        expect(process.env.LINKIFY_MERCHANT).toBe('test_merchant');
        expect(process.env.LINKIFY_BANK).toBe('test_bank');
        expect(process.env.LINKIFY_WEBHOOK_SECRET).toBe('test_secret');
        expect(process.env.LINKIFY_TIMEOUT).toBe('5000');
      });
    });
  });

  describe('Casos de rendimiento y concurrencia', () => {
    it('maneja múltiples llamadas concurrentes a crearPagoLinkify', async () => {
      const promises = [];
      
      for (let i = 0; i < 5; i++) {
        promises.push(crearPagoLinkify({
          invoice_id: `inv_concurrent_${i}`,
          amount: 1000 * (i + 1)
        }));
      }
      
      const results = await Promise.all(promises);
      
      results.forEach((result, index) => {
        expect(result.success).toBe(true);
        expect(result.invoice_id).toBe(`inv_concurrent_${index}`);
        expect(result.amount).toBe(1000 * (index + 1));
      });
    });

    it('maneja múltiples webhooks concurrentes', async () => {
      const promises = [];
      
      for (let i = 0; i < 3; i++) {
        const webhook = simularWebhookLinkify(`inv_webhook_${i}`, 'paid');
        promises.push(procesarWebhookLinkify(webhook));
      }
      
      const results = await Promise.all(promises);
      
      results.forEach((result, index) => {
        expect(result.success).toBe(true);
        expect(result.invoice_id).toBe(`inv_webhook_${index}`);
        expect(result.status).toBe('completed');
      });
    });

    it('verifica que los timeouts de mock sean consistentes', async () => {
      const startTime = Date.now();
      
      // Ejecutar operaciones en paralelo
      await Promise.all([
        crearPagoLinkify({ invoice_id: 'inv_timeout_1', amount: 1000 }),
        consultarPagoLinkify('inv_timeout_2'),
        cancelarPagoLinkify('inv_timeout_3'),
        obtenerBancosLinkify()
      ]);
      
      const endTime = Date.now();
      const duration = endTime - startTime;
      
      // Debería tomar al menos 1000ms (el timeout más largo)
      expect(duration).toBeGreaterThanOrEqual(950);
    });
  });

});