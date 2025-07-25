import axios from 'axios';
import dotenv from 'dotenv';
import PDFDocument from 'pdfkit';
import EmailService from '../services/email/email.service.js';
dotenv.config();
//import { updateProductStockBySku } from '../services/productMeta.service.js';

const BSALE_TOKEN = process.env.BSALE_TOKEN;


// Obtiene el ID de la variante de un producto por su SKU
export const getIdVariantBySku = async (sku) => {
  try {
    const response = await axios.get(`https://api.bsale.io/v1/variants.json?code=${sku}`, {
      headers: {
        'access_token': BSALE_TOKEN
      }
    });

    const variantId = response.data.items[0].id;
    console.log('El id de la variante es:', variantId);

    return variantId;

  } catch (error) {
    console.error('Error al obtener la variante:', error.message);
    throw new Error('No se pudo obtener la variante');
  }
};









// Esta función disminuye el stock de un producto en Bsale
export const decreaseStock = async (code, quantity) => {
  try {
    const officeId = 1;
    const note = 'Consumo por API';

    console.log('Buscando variante con código:', code);
    const variantId = await getIdVariantBySku(code);

    if (!variantId) {
      throw new Error(`No se encontró variante con SKU/código ${code}`);
    }

    const payload = {
      note,
      officeId,
      details: [
        {
          quantity,
          variantId
        }
      ]
    };

    console.log('Payload que se enviará a Bsale:', JSON.stringify(payload, null, 2));

    const response = await axios.post(
      'https://api.bsale.io/v1/stocks/consumptions.json',
      payload,
      {
        headers: {
          access_token: BSALE_TOKEN,
          'Content-Type': 'application/json'
        }
      }
    );

    return response.data;

  } catch (error) {
    if (error.response) {
      console.error('Respuesta de Bsale:', {
        status: error.response.status,
        data: error.response.data
      });
    } else if (error.request) {
      console.error('No hubo respuesta de Bsale:', error.request);
    } else {
      console.error('Error al configurar la petición:', error.message);
    }

    // Lanza el error con más detalle para propagarlo si se necesita
    throw new Error('No se pudo consumir el stock: ' + (error.response?.data?.message || error.message));
  }
};






















//Genera y envía una boleta por email como PDF adjunto
export const generarYEnviarBoleta = async (cliente, productos, subtotal, shipping, total, orderId) => {
  return new Promise((resolve, reject) => {
    const doc = new PDFDocument();
    const buffers = [];

    doc.on('data', buffers.push.bind(buffers));

    doc.on('end', async () => {
      const pdfBuffer = Buffer.concat(buffers);

      const itemListHtml = productos.map(p =>
        `<tr>
          <td>${p.nombre}</td>
          <td>${p.cantidad}</td>
          <td>$${(p.precio ?? 0).toLocaleString()}</td>
        </tr>`
      ).join('');

      try {
        const emailService = new EmailService();
        const html = await emailService.loadTemplate('boleta', {
          nombre: cliente.nombre,
          fecha: new Date().toLocaleDateString(),
          itemList: itemListHtml,
          subtotal: subtotal.toLocaleString(),
          shipping: shipping.toLocaleString(),
          total: total.toLocaleString(),
          appName: 'Zona Deportiva'
        });

        await emailService.sendEmail(
          cliente.email,
          'Tu boleta de compra',
          html,
          [
            {
              filename: `boleta-${Date.now()}.pdf`,
              content: pdfBuffer,
              contentType: 'application/pdf'
            }
          ]
        );

        resolve();
      } catch (error) {
        reject(error);
      } finally {
        doc.removeAllListeners();
      }
    });

    // ========== ENCABEZADO ==========

    const margin = 50;
    const pageWidth = doc.page.width;
    const logoWidth = 70;
    const sectionY = 50;
    const boxWidth = 180;
    const boxHeight = 60;

    // LOGO izquierda
    doc.image('public/logo_zonadeportiva.jpg', margin, sectionY, { width: logoWidth });

    // EMPRESA - texto al lado del logo
    const empresaX = margin + logoWidth + 20;
    doc.fontSize(12).font('Helvetica-Bold').text('ZONA DEPORTIVA SPA', empresaX, sectionY);
    doc.fontSize(9).font('Helvetica').text('Giro: Venta de artículos deportivos', empresaX);
    doc.text('Dirección: Gral. Ordóñez 155 Of. 1002, Maipú', empresaX);

    // CUADRO ROJO derecha
    const boxX = pageWidth - margin - boxWidth;
    const boxY = sectionY;
    doc.rect(boxX, boxY, boxWidth, boxHeight).stroke();

    doc.fillColor('red');
    doc.font('Helvetica-Bold').fontSize(10).text('R.U.T.: 76.432.927-9', boxX + 10, boxY + 5);
    doc.fontSize(12).text('BOLETA ELECTRÓNICA', boxX + 10);
    doc.fontSize(11).text(`Nº ${orderId}`, boxX + 10);
    doc.fillColor('black');

    // ========== DATOS DEL CLIENTE ==========

    const clienteX = 50;
    const clienteY = sectionY + boxHeight + 20;

    doc.fontSize(10).font('Helvetica-Bold');
    doc.text(`Cliente: ${cliente.nombre}`, clienteX, clienteY);
    doc.text(`RUT: ${cliente.rut ?? 'No informado'}`);
    doc.text(`Dirección: ${cliente.direccion || 'Dirección no disponible'}`);
    doc.text(`Fecha: ${new Date().toLocaleDateString()}`);
    doc.moveDown(1.5);

    // ========== DETALLE DE LA COMPRA ==========

    doc.fontSize(11).text('Detalle de la compra:', clienteX, doc.y, { underline: true });
    doc.moveDown(0.5);

    // Encabezado de tabla
    const tableTop = doc.y;
    doc.fontSize(10);
    doc.text('Producto', clienteX, tableTop);
    doc.text('Cantidad', clienteX + 200, tableTop);
    doc.text('P. Unitario', clienteX + 300, tableTop);
    doc.text('Total', clienteX + 400, tableTop);

    // Línea divisoria
    if (!isNaN(doc.y)) {
      doc.moveTo(clienteX, doc.y + 15).lineTo(clienteX + 500, doc.y + 15).stroke();
    }

    let y = doc.y + 20;

    // Filas de productos
    productos.forEach(p => {
      const totalItem = p.precio * p.cantidad;
      doc.text(p.nombre, clienteX, y);
      doc.text(p.cantidad.toString(), clienteX + 200, y);
      doc.text(`$${(p.precio ?? 0).toLocaleString()}`, clienteX + 300, y);
      doc.text(`$${(totalItem ?? 0).toLocaleString()}`, clienteX + 400, y);
      y += 20;
    });

    // ========== TOTALES ==========

    doc.moveDown(2);
    doc.text(`Subtotal: $${subtotal.toLocaleString()}`, clienteX);
    doc.text(`IVA (19%): $${Math.round(subtotal * 0.19).toLocaleString()}`, clienteX);
    doc.text(`Envío: $${shipping.toLocaleString()}`, clienteX);
    doc.font('Helvetica-Bold').text(`TOTAL: $${total.toLocaleString()}`, clienteX);
    doc.font('Helvetica');

    // ========== TIMBRE ==========

    doc.moveDown(2);
    doc.fontSize(8).text('Timbre Electrónico Simulado', { align: 'center' });

    doc.end();
  });
};
