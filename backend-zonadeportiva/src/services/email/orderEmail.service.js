import EmailService from './email.service.js';

class OrderEmailService {
  constructor() {
    this.emailService = new EmailService();
  }

  async sendOrderConfirmation(email, orderId, { subtotal, shipping, total, productos, customerName = '', orderDate = '' }) {
    const itemHtml = productos.map(p =>
        `<tr>
          <td>${p.nombre}</td>
          <td>${p.cantidad}</td>
          <td>$${(p.precio ?? 0).toLocaleString()}</td>
        </tr>`
      ).join('');

    
    const htmlContent = await this.emailService.loadTemplate('order_confirmation', {
      orderId,
      customerName,
      orderDate,
      subtotal,
      shipping,
      total,
      itemList: itemHtml,
      appName: process.env.APP_NAME
    });

    await this.emailService.sendEmail(
      email,
      `Nuevo pedido (#${orderId})`,
      htmlContent
    );
  }

}

export default new OrderEmailService();
