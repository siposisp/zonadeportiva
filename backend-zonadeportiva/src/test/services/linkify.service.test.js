
import {
  crearPagoLinkify,
  consultarPagoLinkify,
  cancelarPagoLinkify,
  obtenerBancosLinkify,
  procesarWebhookLinkify,
  simularWebhookLinkify
} from '../services/linkify.service.js'; // Ajusta la ruta si es distinta

describe('Linkify Service (modo desarrollo)', () => {
  const originalEnv = process.env;

  beforeEach(() => {
    jest.resetModules();
    process.env.NODE_ENV = 'development';
  });

  afterAll(() => {
    process.env = originalEnv;
  });

  it('crearPagoLinkify retorna datos simulados', async () => {
    const payload = { invoice_id: 'inv123', amount: 10000 };
    const result = await crearPagoLinkify(payload);
    expect(result.success).toBe(true);
    expect(result.invoice_id).toBe(payload.invoice_id);
    expect(result.status).toBe('pending');
  });

  it('consultarPagoLinkify retorna estado válido', async () => {
    const result = await consultarPagoLinkify('inv123');
    expect(result.success).toBe(true);
    expect(['paid', 'pending']).toContain(result.status);
  });

  it('cancelarPagoLinkify retorna cancelación exitosa', async () => {
    const result = await cancelarPagoLinkify('inv123');
    expect(result.success).toBe(true);
    expect(result.status).toBe('cancelled');
  });

  it('obtenerBancosLinkify retorna lista de bancos', async () => {
    const result = await obtenerBancosLinkify();
    expect(result.success).toBe(true);
    expect(Array.isArray(result.banks)).toBe(true);
  });

  it('simularWebhookLinkify genera webhook válido', () => {
    const result = simularWebhookLinkify('inv123', 'paid');
    expect(result.invoice_id).toBe('inv123');
    expect(result.status).toBe('paid');
    expect(result.amount).toBe(15000);
  });

  it('procesarWebhookLinkify procesa webhook con estado paid', async () => {
    const webhook = simularWebhookLinkify('inv456', 'paid');
    const result = await procesarWebhookLinkify(webhook);
    expect(result.success).toBe(true);
    expect(result.invoice_id).toBe('inv456');
    expect(result.status).toBe('completed');
  });

  it('procesarWebhookLinkify lanza error si faltan datos', async () => {
    const invalidWebhook = { invoice_id: null, status: null };
    await expect(procesarWebhookLinkify(invalidWebhook)).rejects.toThrow('Datos incompletos en webhook');
  });
});
