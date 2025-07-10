import nodemailer from 'nodemailer';
import path from 'path';
import { promises as fs } from 'fs';
import { fileURLToPath } from 'url';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

class EmailService {
  constructor() {
    this.transporter = nodemailer.createTransport({
      service: 'gmail',
      auth: {
        user: process.env.EMAIL_USER,
        pass: process.env.EMAIL_PASS
      }
    });
  }

  // Método principal para enviar correos
  async sendEmail(to, subject, htmlContent, attachments = []) {
    try {
      const mailOptions = {
        from: `"${process.env.APP_NAME}" <${process.env.EMAIL_USER}>`,
        to,
        subject,
        html: htmlContent,
        attachments
      };

      const result = await this.transporter.sendMail(mailOptions);
      console.log('Correo enviado:', result.messageId);
      return { success: true, messageId: result.messageId };
    } catch (error) {
      console.error('Error enviando correo:', error);
      throw new Error('Error al enviar correo');
    }
  }

  // Cargar template HTML
  async loadTemplate(templateName, variables = {}) {
    try {
      // Usamos path.resolve para obtener la ruta absoluta a src/templates/emails
      const templatePath = path.resolve(__dirname, '../../templates/email', `${templateName}.html`);
      let template = await fs.readFile(templatePath, 'utf8');

      // Reemplazar los placeholders {{variable}} con sus valores
      Object.keys(variables).forEach(key => {
        const regex = new RegExp(`{{\\s*${key}\\s*}}`, 'g'); // permite {{ key }} con espacios
        template = template.replace(regex, variables[key]);
      });

      return template;
    } catch (error) {
      console.error('Error cargando template:', error);
      throw new Error('Template no encontrado');
    }
  }

  // Verificar configuración
  async verifyConnection() {
    try {
      await this.transporter.verify();
      return true;
    } catch (error) {
      console.error('Error de conexión:', error);
      return false;
    }
  }
}

export default EmailService;