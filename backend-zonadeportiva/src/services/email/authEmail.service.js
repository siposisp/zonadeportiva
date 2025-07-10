import EmailService from './email.service.js';
import crypto from 'crypto';

class AuthEmailService {
  constructor() {
    this.resetTokens = new Map(); // En producción usar Redis o DB
    this.emailService = new EmailService(); // Crear instancia del servicio
  }

  // Enviar correo de recuperación de contraseña
  async sendPasswordReset(email) {
    const resetToken = this.generateResetToken();
    const expiresAt = Date.now() + 3600000; // 1 hora
    
    // Guardar token
    this.resetTokens.set(resetToken, { email, expiresAt });
    
    // Construir URL correcta con protocolo y variables de entorno
    const baseUrl = process.env.FRONTEND_URL ;
    const resetUrl = `${baseUrl}/restablecer-contrasena?token=${resetToken}`;

    const htmlContent = await this.emailService.loadTemplate('password_reset', {
      resetUrl,
      appName: process.env.APP_NAME,
      expirationTime: '1 hora'
    });
    
    await this.emailService.sendEmail(
      email,
      'Recuperación de contraseña',
      htmlContent
    );
    
    return { success: true, token: resetToken };
  }

  // Confirmar cambio de contraseña
  async sendPasswordChangeConfirmation(email) {
    const htmlContent = await this.emailService.loadTemplate('password_changed', {
      appName: process.env.APP_NAME,
      supportEmail: process.env.SUPPORT_EMAIL
    });
    
    await this.emailService.sendEmail(
      email,
      'Contraseña actualizada',
      htmlContent
    );
  }

  // Verificar token de reseteo
  validateResetToken(token) {
    const tokenData = this.resetTokens.get(token);
    
    if (!tokenData) {
      return { valid: false, error: 'Token inválido' };
    }
    
    if (Date.now() > tokenData.expiresAt) {
      this.resetTokens.delete(token);
      return { valid: false, error: 'Token expirado' };
    }
    
    return { valid: true, email: tokenData.email };
  }

  // Invalidar token
  invalidateToken(token) {
    this.resetTokens.delete(token);
  }

  generateResetToken() {
    return crypto.randomBytes(32).toString('hex');
  }
}

// Exportar una instancia única (singleton)
export default new AuthEmailService();