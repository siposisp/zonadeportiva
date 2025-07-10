import authEmailService from '../services/email/authEmail.service.js';
import { getUserByEmail, setUserPassword } from '../services/user.service.js';

class AuthEmailController {
  async forgotPassword(req, res) {
    try {
      const { email } = req.body;
      
      if (!email) {
        return res.status(400).json({ error: 'Email requerido' });
      }
      
      // Verificar que el usuario existe usando tu servicio existente
      const user = await getUserByEmail(email);
      if (!user) {
        // Por seguridad, no revelamos si el email existe o no
        return res.status(200).json({ 
          message: 'El email existe, recibirá un correo de recuperación',
          success: true 
        });
      }
      
      await authEmailService.sendPasswordReset(email);
      
      res.json({ 
        message: 'Correo de recuperación enviado',
        success: true 
      });
      
    } catch (error) {
      console.error('Error en forgotPassword:', error);
      res.status(500).json({ error: 'Error interno del servidor' });
    }
  }

  async resetPassword(req, res) {
    try {
      const { token, newPassword } = req.body;
      
      if (!token || !newPassword) {
        return res.status(400).json({ error: 'Token y nueva contraseña requeridos' });
      }
      
      const validation = authEmailService.validateResetToken(token);
      if (!validation.valid) {
        return res.status(400).json({ error: validation.error });
      }
      
      // Usar tu función existente setUserPassword
      const updated = await setUserPassword(validation.email, newPassword);
      if (!updated) {
        return res.status(500).json({
          error: 'Error al actualizar la contraseña',
          code: 'UPDATE_FAILED'
        });
      }
      
      // Invalidar token
      authEmailService.invalidateToken(token);
      
      // Enviar confirmación
      await authEmailService.sendPasswordChangeConfirmation(validation.email);
      
      res.json({ 
        message: 'Contraseña actualizada exitosamente',
        success: true 
      });
      
    } catch (error) {
      console.error('Error en resetPassword:', error);
      res.status(500).json({ error: 'Error interno del servidor' });
    }
  }
}

export default new AuthEmailController();