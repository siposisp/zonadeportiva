import authEmailService from '../services/email/authEmail.service.js';
import { getUserByEmail, setUserPassword } from '../services/user.service.js';

class AuthEmailController {
  
  /**
   * @swagger
   * /auth-email/forgot-password:
   *   post:
   *     summary: Solicitar restablecimiento de contraseña
   *     description: Envía un correo electrónico con instrucciones para restablecer la contraseña del usuario
   *     tags:
   *       - Autenticación por Email
   *     requestBody:
   *       required: true
   *       content:
   *         application/json:
   *           schema:
   *             type: object
   *             required:
   *               - email
   *             properties:
   *               email:
   *                 type: string
   *                 format: email
   *                 description: Dirección de correo electrónico del usuario
   *                 example: usuario@ejemplo.com
   *     responses:
   *       200:
   *         description: Solicitud procesada exitosamente
   *         content:
   *           application/json:
   *             schema:
   *               type: object
   *               properties:
   *                 message:
   *                   type: string
   *                   description: Mensaje de confirmación
   *                   example: "Correo de recuperación enviado"
   *                 success:
   *                   type: boolean
   *                   description: Indicador de éxito
   *                   example: true
   *       400:
   *         description: Email requerido
   *         content:
   *           application/json:
   *             schema:
   *               type: object
   *               properties:
   *                 error:
   *                   type: string
   *                   description: Mensaje de error
   *                   example: "Email requerido"
   *       500:
   *         description: Error interno del servidor
   *         content:
   *           application/json:
   *             schema:
   *               type: object
   *               properties:
   *                 error:
   *                   type: string
   *                   description: Mensaje de error
   *                   example: "Error interno del servidor"
   */
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

  /**
   * @swagger
   * /auth-email/reset-password:
   *   post:
   *     summary: Restablecer contraseña con token
   *     description: Restablece la contraseña del usuario utilizando un token válido recibido por correo electrónico
   *     tags:
   *       - Autenticación por Email
   *     requestBody:
   *       required: true
   *       content:
   *         application/json:
   *           schema:
   *             type: object
   *             required:
   *               - token
   *               - newPassword
   *             properties:
   *               token:
   *                 type: string
   *                 description: Token de restablecimiento recibido por correo electrónico
   *                 example: "eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9..."
   *               newPassword:
   *                 type: string
   *                 format: password
   *                 description: Nueva contraseña del usuario
   *                 minLength: 8
   *                 example: "nuevaPassword123"
   *     responses:
   *       200:
   *         description: Contraseña actualizada exitosamente
   *         content:
   *           application/json:
   *             schema:
   *               type: object
   *               properties:
   *                 message:
   *                   type: string
   *                   description: Mensaje de confirmación
   *                   example: "Contraseña actualizada exitosamente"
   *                 success:
   *                   type: boolean
   *                   description: Indicador de éxito
   *                   example: true
   *       400:
   *         description: Token inválido o datos faltantes
   *         content:
   *           application/json:
   *             schema:
   *               type: object
   *               properties:
   *                 error:
   *                   type: string
   *                   description: Mensaje de error
   *                   examples:
   *                     missing_data:
   *                       value: "Token y nueva contraseña requeridos"
   *                     invalid_token:
   *                       value: "Token inválido o expirado"
   *       500:
   *         description: Error interno del servidor
   *         content:
   *           application/json:
   *             schema:
   *               type: object
   *               properties:
   *                 error:
   *                   type: string
   *                   description: Mensaje de error
   *                   example: "Error interno del servidor"
   *                 code:
   *                   type: string
   *                   description: Código de error específico
   *                   example: "UPDATE_FAILED"
   */
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