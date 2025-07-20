import EmailService from './email.service.js';

class QuotationEmailService {
  constructor() {
    this.emailService = new EmailService();
  }

  /**
   * Envía correo de nueva cotización al administrador
   * @param {string} adminEmail - Email del administrador
   * @param {string} quotationId - ID de la cotización
   * @param {Object} quotationData - Datos de la cotización
   */
  async sendQuotationToAdmin(adminEmail, quotationId, quotationData) {
    const { productos, customerName, customerLastName, customerEmail, message } = quotationData;
    
    const itemHtml = productos.map(p =>
      `<tr>
        <td>${p.nombre}</td>
        <td>${p.cantidad}</td>
      </tr>`
    ).join('');

    const quotationDate = new Date().toLocaleDateString('es-ES');
    
    const htmlContent = await this.emailService.loadTemplate('quotation_admin', {
      quotationId,
      customerName: `${customerName} ${customerLastName}`,
      customerEmail,
      quotationDate,
      message: message || 'Sin mensaje adicional',
      itemList: itemHtml,
      appName: process.env.APP_NAME
    });

    await this.emailService.sendEmail(
      adminEmail,
      `Nueva solicitud de cotización (#${quotationId})`,
      htmlContent
    );
  }

  /**
   * Envía correo de confirmación de cotización al usuario
   * @param {string} customerEmail - Email del cliente
   * @param {string} quotationId - ID de la cotización
   * @param {Object} quotationData - Datos de la cotización
   */
  async sendQuotationConfirmationToUser(customerEmail, quotationId, quotationData) {
    const { productos, customerName, customerLastName } = quotationData;
    
    const itemHtml = productos.map(p =>
      `<tr>
        <td>${p.nombre}</td>
        <td>${p.cantidad}</td>
      </tr>`
    ).join('');

    const quotationDate = new Date().toLocaleDateString('es-ES');
    
    const htmlContent = await this.emailService.loadTemplate('quotation_user', {
      quotationId,
      customerName: `${customerName} ${customerLastName}`,
      quotationDate,
      itemList: itemHtml,
      appName: process.env.APP_NAME
    });

    await this.emailService.sendEmail(
      customerEmail,
      `Confirmación de solicitud de cotización (#${quotationId})`,
      htmlContent
    );
  }

  /**
   * Envía ambos correos (administrador y usuario)
   * @param {string} adminEmail - Email del administrador
   * @param {string} quotationId - ID de la cotización
   * @param {Object} quotationData - Datos de la cotización
   */
  async sendQuotationEmails(adminEmail, quotationId, quotationData) {
    try {
      // Enviar correo al administrador
      await this.sendQuotationToAdmin(adminEmail, quotationId, quotationData);
      
      // Enviar correo de confirmación al usuario
      await this.sendQuotationConfirmationToUser(quotationData.customerEmail, quotationId, quotationData);
      
      return { success: true };
    } catch (error) {
      console.error('Error enviando correos de cotización:', error);
      throw new Error('Error al enviar correos de cotización');
    }
  }
}

export default new QuotationEmailService();