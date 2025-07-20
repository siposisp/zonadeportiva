// src/test/services/email.service.test.js
import { jest, describe, it, expect, beforeEach, afterEach, beforeAll, afterAll } from '@jest/globals';

// Mock de nodemailer usando unstable_mockModule
const mockSendMail = jest.fn();
const mockVerify = jest.fn();
const mockTransporter = {
  sendMail: mockSendMail,
  verify: mockVerify,
};
const mockCreateTransport = jest.fn(() => mockTransporter);

// Mock de fs
const mockReadFile = jest.fn();

// Configurar mocks para ES Modules
jest.unstable_mockModule('nodemailer', () => ({
  default: {
    createTransport: mockCreateTransport
  }
}));

jest.unstable_mockModule('fs', () => ({
  promises: {
    readFile: mockReadFile
  }
}));

// Importar dinámicamente DESPUÉS de configurar los mocks
const { default: EmailService } = await import('../../services/email/email.service.js');

// Mock de las variables de entorno
const originalEnv = process.env;

beforeAll(() => {
  process.env = {
    ...originalEnv,
    EMAIL_USER: 'test@gmail.com',
    EMAIL_PASS: 'testpass',
    APP_NAME: 'Test App'
  };
});

afterAll(() => {
  process.env = originalEnv;
});

describe('EmailService', () => {
  let emailService;

  beforeEach(() => {
    jest.clearAllMocks();
    mockCreateTransport.mockReturnValue(mockTransporter);
    emailService = new EmailService();
  });

  afterEach(() => {
    jest.clearAllMocks();
  });

  it('debería crear un transporter con la configuración correcta', () => {
    expect(mockCreateTransport).toHaveBeenCalledWith({
      service: 'gmail',
      auth: {
        user: process.env.EMAIL_USER,
        pass: process.env.EMAIL_PASS,
      },
    });
    expect(emailService.transporter).toBe(mockTransporter);
  });

  describe('sendEmail', () => {
    it('debería enviar un correo exitosamente', async () => {
      mockSendMail.mockResolvedValue({ messageId: '123' });

      const to = 'recipient@example.com';
      const subject = 'Asunto de Prueba';
      const htmlContent = '<h1>Contenido HTML</h1>';

      const result = await emailService.sendEmail(to, subject, htmlContent);

      expect(mockSendMail).toHaveBeenCalledWith({
        from: `"${process.env.APP_NAME}" <${process.env.EMAIL_USER}>`,
        to,
        subject,
        html: htmlContent,
        attachments: []
      });
      expect(result).toEqual({ success: true, messageId: '123' });
    });

    it('debería lanzar un error si el envío del correo falla', async () => {
      const errorMessage = 'Error de conexión';
      mockSendMail.mockRejectedValue(new Error(errorMessage));

      const to = 'recipient@example.com';
      const subject = 'Asunto de Prueba';
      const htmlContent = '<h1>Contenido HTML</h1>';

      await expect(emailService.sendEmail(to, subject, htmlContent))
        .rejects.toThrow('Error al enviar correo');
      
      expect(mockSendMail).toHaveBeenCalledTimes(1);
    });
  });

  describe('loadTemplate', () => {
    it('debería cargar y reemplazar variables en una plantilla', async () => {
      const templateContent = '<h1>Hola {{nombre}}, tu edad es {{edad}}</h1>';
      const expectedResult = '<h1>Hola Juan, tu edad es 25</h1>';
      
      mockReadFile.mockResolvedValue(templateContent);

      const templateName = 'welcome';
      const variables = { nombre: 'Juan', edad: '25' };

      const result = await emailService.loadTemplate(templateName, variables);

      expect(mockReadFile).toHaveBeenCalledWith(
        expect.stringContaining('welcome.html'),
        'utf8'
      );
      expect(result).toBe(expectedResult);
    });

    it('debería manejar plantillas sin variables', async () => {
      const templateContent = '<h1>Plantilla sin variables</h1>';
      
      mockReadFile.mockResolvedValue(templateContent);

      const templateName = 'simple';
      const result = await emailService.loadTemplate(templateName);

      expect(mockReadFile).toHaveBeenCalledWith(
        expect.stringContaining('simple.html'),
        'utf8'
      );
      expect(result).toBe(templateContent);
    });

    it('debería manejar plantillas con espacios extra alrededor de las variables', async () => {
      const templateContent = '<h1>Hola {{ nombre }}, bienvenido</h1>';
      const expectedResult = '<h1>Hola Juan, bienvenido</h1>';
      
      mockReadFile.mockResolvedValue(templateContent);

      const templateName = 'spaced';
      const variables = { nombre: 'Juan' };

      const result = await emailService.loadTemplate(templateName, variables);

      expect(result).toBe(expectedResult);
    });

    it('debería lanzar un error si el archivo de plantilla no se encuentra', async () => {
      const errorMessage = 'ENOENT: no such file or directory';
      mockReadFile.mockRejectedValue(new Error(errorMessage));

      const templateName = 'nonexistent';
      const variables = { test: 'value' };

      await expect(emailService.loadTemplate(templateName, variables))
        .rejects.toThrow('Template no encontrado');
      
      expect(mockReadFile).toHaveBeenCalledTimes(1);
    });
  });

  describe('verifyConnection', () => {
    it('debería retornar true si la conexión es exitosa', async () => {
      mockVerify.mockResolvedValue(true);

      const result = await emailService.verifyConnection();

      expect(mockVerify).toHaveBeenCalledTimes(1);
      expect(result).toBe(true);
    });

    it('debería retornar false si la conexión falla', async () => {
      mockVerify.mockRejectedValue(new Error('Connection failed'));

      const result = await emailService.verifyConnection();

      expect(mockVerify).toHaveBeenCalledTimes(1);
      expect(result).toBe(false);
    });
  });
});