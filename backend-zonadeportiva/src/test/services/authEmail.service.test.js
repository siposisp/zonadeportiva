// src/test/services/authEmail.service.test.js
import { jest, describe, it, expect, beforeEach, afterEach, beforeAll, afterAll } from '@jest/globals';

// Mock del EmailService
const mockSendEmail = jest.fn();
const mockLoadTemplate = jest.fn();

// Mock de crypto
const mockRandomBytes = jest.fn();

jest.unstable_mockModule('../../services/email/email.service.js', () => ({
  default: jest.fn().mockImplementation(() => ({
    sendEmail: mockSendEmail,
    loadTemplate: mockLoadTemplate
  }))
}));

jest.unstable_mockModule('crypto', () => ({
  default: {
    randomBytes: mockRandomBytes
  }
}));

// Importar la INSTANCIA (no la clase)
const { default: authEmailService } = await import('../../services/email/authEmail.service.js');

// Mock de las variables de entorno
const originalEnv = process.env;

beforeAll(() => {
  process.env = {
    ...originalEnv,
    FRONTEND_URL: 'https://miapp.com',
    APP_NAME: 'Mi App Test',
    SUPPORT_EMAIL: 'support@miapp.com'
  };
});

afterAll(() => {
  process.env = originalEnv;
});

describe('AuthEmailService', () => {
  beforeEach(() => {
    jest.clearAllMocks();
    // Limpiar tokens entre pruebas
    authEmailService.resetTokens.clear();
  });

  afterEach(() => {
    jest.clearAllMocks();
  });

  describe('sendPasswordReset', () => {
    it('debería enviar correo de recuperación de contraseña exitosamente', async () => {
      const email = 'usuario@example.com';
      const mockToken = 'abc123def456';
      
      mockRandomBytes.mockReturnValue({
        toString: jest.fn().mockReturnValue(mockToken)
      });
      mockLoadTemplate.mockResolvedValue('<html>Template de reset</html>');
      mockSendEmail.mockResolvedValue({
        success: true,
        messageId: 'msg-123'
      });

      const result = await authEmailService.sendPasswordReset(email);

      expect(mockRandomBytes).toHaveBeenCalledWith(32);
      expect(mockLoadTemplate).toHaveBeenCalledWith('password_reset', {
        resetUrl: `https://miapp.com/restablecer-contrasena?token=${mockToken}`,
        appName: 'Mi App Test',
        expirationTime: '1 hora'
      });

      expect(mockSendEmail).toHaveBeenCalledWith(
        email,
        'Recuperación de contraseña',
        '<html>Template de reset</html>'
      );

      expect(result).toEqual({
        success: true,
        token: mockToken
      });

      // Verificar que el token se guardó en el Map
      expect(authEmailService.resetTokens.has(mockToken)).toBe(true);
    });

    it('debería generar URL de reset correcta', async () => {
      const email = 'test@example.com';
      const mockToken = 'token123';
      
      mockRandomBytes.mockReturnValue({
        toString: jest.fn().mockReturnValue(mockToken)
      });
      mockLoadTemplate.mockResolvedValue('<html>Template</html>');
      mockSendEmail.mockResolvedValue({ success: true });

      await authEmailService.sendPasswordReset(email);

      const templateCall = mockLoadTemplate.mock.calls[0][1];
      expect(templateCall.resetUrl).toBe(`https://miapp.com/restablecer-contrasena?token=${mockToken}`);
    });

    it('debería guardar token con tiempo de expiración correcto', async () => {
      const email = 'test@example.com';
      const mockToken = 'token456';
      const beforeTime = Date.now();
      
      mockRandomBytes.mockReturnValue({
        toString: jest.fn().mockReturnValue(mockToken)
      });
      mockLoadTemplate.mockResolvedValue('<html>Template</html>');
      mockSendEmail.mockResolvedValue({ success: true });

      await authEmailService.sendPasswordReset(email);

      const tokenData = authEmailService.resetTokens.get(mockToken);
      expect(tokenData.email).toBe(email);
      expect(tokenData.expiresAt).toBeGreaterThan(beforeTime + 3500000); // ~1 hora menos margen
      expect(tokenData.expiresAt).toBeLessThan(beforeTime + 3700000); // ~1 hora más margen
    });

    it('debería lanzar error si falla el envío del correo', async () => {
      const email = 'test@example.com';
      
      mockRandomBytes.mockReturnValue({
        toString: jest.fn().mockReturnValue('token123')
      });
      mockLoadTemplate.mockResolvedValue('<html>Template</html>');
      mockSendEmail.mockRejectedValue(new Error('Error al enviar correo'));

      await expect(
        authEmailService.sendPasswordReset(email)
      ).rejects.toThrow('Error al enviar correo');

      expect(mockLoadTemplate).toHaveBeenCalledTimes(1);
      expect(mockSendEmail).toHaveBeenCalledTimes(1);
    });

    it('debería lanzar error si falla la carga del template', async () => {
      const email = 'test@example.com';
      
      mockRandomBytes.mockReturnValue({
        toString: jest.fn().mockReturnValue('token123')
      });
      mockLoadTemplate.mockRejectedValue(new Error('Template no encontrado'));

      await expect(
        authEmailService.sendPasswordReset(email)
      ).rejects.toThrow('Template no encontrado');

      expect(mockLoadTemplate).toHaveBeenCalledTimes(1);
      expect(mockSendEmail).not.toHaveBeenCalled();
    });
  });

  describe('sendPasswordChangeConfirmation', () => {
    it('debería enviar correo de confirmación de cambio de contraseña', async () => {
      const email = 'usuario@example.com';
      
      mockLoadTemplate.mockResolvedValue('<html>Template de confirmación</html>');
      mockSendEmail.mockResolvedValue({
        success: true,
        messageId: 'msg-456'
      });

      await authEmailService.sendPasswordChangeConfirmation(email);

      expect(mockLoadTemplate).toHaveBeenCalledWith('password_changed', {
        appName: 'Mi App Test',
        supportEmail: 'support@miapp.com'
      });

      expect(mockSendEmail).toHaveBeenCalledWith(
        email,
        'Contraseña actualizada',
        '<html>Template de confirmación</html>'
      );
    });

    it('debería lanzar error si falla el envío del correo de confirmación', async () => {
      const email = 'test@example.com';
      
      mockLoadTemplate.mockResolvedValue('<html>Template</html>');
      mockSendEmail.mockRejectedValue(new Error('Error al enviar correo'));

      await expect(
        authEmailService.sendPasswordChangeConfirmation(email)
      ).rejects.toThrow('Error al enviar correo');
    });
  });

  describe('validateResetToken', () => {
    it('debería validar token válido correctamente', () => {
      const token = 'valid-token';
      const email = 'test@example.com';
      const expiresAt = Date.now() + 1800000; // 30 minutos en el futuro

      // Simular token guardado
      authEmailService.resetTokens.set(token, { email, expiresAt });

      const result = authEmailService.validateResetToken(token);

      expect(result).toEqual({
        valid: true,
        email: email
      });
    });

    it('debería rechazar token inválido', () => {
      const result = authEmailService.validateResetToken('token-inexistente');

      expect(result).toEqual({
        valid: false,
        error: 'Token inválido'
      });
    });

    it('debería rechazar token expirado', () => {
      const token = 'expired-token';
      const email = 'test@example.com';
      const expiresAt = Date.now() - 1000; // 1 segundo en el pasado

      // Simular token expirado
      authEmailService.resetTokens.set(token, { email, expiresAt });

      const result = authEmailService.validateResetToken(token);

      expect(result).toEqual({
        valid: false,
        error: 'Token expirado'
      });

      // Verificar que el token expirado se eliminó
      expect(authEmailService.resetTokens.has(token)).toBe(false);
    });

    it('debería eliminar token expirado del Map', () => {
      const token = 'expired-token-2';
      const email = 'test@example.com';
      const expiresAt = Date.now() - 5000; // 5 segundos en el pasado

      authEmailService.resetTokens.set(token, { email, expiresAt });
      expect(authEmailService.resetTokens.has(token)).toBe(true);

      authEmailService.validateResetToken(token);

      expect(authEmailService.resetTokens.has(token)).toBe(false);
    });
  });

  describe('invalidateToken', () => {
    it('debería invalidar token existente', () => {
      const token = 'token-to-invalidate';
      const email = 'test@example.com';
      const expiresAt = Date.now() + 1800000;

      // Agregar token
      authEmailService.resetTokens.set(token, { email, expiresAt });
      expect(authEmailService.resetTokens.has(token)).toBe(true);

      // Invalidar token
      authEmailService.invalidateToken(token);

      expect(authEmailService.resetTokens.has(token)).toBe(false);
    });

    it('debería manejar invalidación de token inexistente sin error', () => {
      // No debería lanzar error
      expect(() => {
        authEmailService.invalidateToken('token-inexistente');
      }).not.toThrow();
    });
  });

  describe('generateResetToken', () => {
    it('debería generar token usando crypto.randomBytes', () => {
      const mockHex = 'abc123def456789';
      mockRandomBytes.mockReturnValue({
        toString: jest.fn().mockReturnValue(mockHex)
      });

      const token = authEmailService.generateResetToken();

      expect(mockRandomBytes).toHaveBeenCalledWith(32);
      expect(mockRandomBytes().toString).toHaveBeenCalledWith('hex');
      expect(token).toBe(mockHex);
    });
  });

  describe('integración completa', () => {
    it('debería completar flujo completo de reset de contraseña', async () => {
      const email = 'integration@example.com';
      const mockToken = 'integration-token';
      
      // Setup mocks
      mockRandomBytes.mockReturnValue({
        toString: jest.fn().mockReturnValue(mockToken)
      });
      mockLoadTemplate.mockResolvedValue('<html>Reset template</html>');
      mockSendEmail.mockResolvedValue({ success: true });

      // 1. Enviar reset
      const resetResult = await authEmailService.sendPasswordReset(email);
      expect(resetResult.success).toBe(true);
      expect(resetResult.token).toBe(mockToken);

      // 2. Validar token
      const validationResult = authEmailService.validateResetToken(mockToken);
      expect(validationResult.valid).toBe(true);
      expect(validationResult.email).toBe(email);

      // 3. Invalidar token después de uso
      authEmailService.invalidateToken(mockToken);
      const invalidResult = authEmailService.validateResetToken(mockToken);
      expect(invalidResult.valid).toBe(false);
    });
  });
});
