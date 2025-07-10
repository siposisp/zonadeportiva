import { fetchAllProducts, fetchAllStocks, syncStockFromDocument, updateAllStocksLocalBd, getIdVariantBySku, decreaseStock, generarYEnviarBoleta } from '../services/bsale.service.js';
import axios from 'axios';

// Obtener todos los productos de Bsale
export const getAllProducts = async (req, res) => {
  try {
    const allProducts = await fetchAllProducts();
    res.json(allProducts);
  } catch (error) {
    console.error('Error al obtener productos completos de Bsale:', error);
    res.status(500).json({ error: 'No se pudo obtener el listado completo' });
  }
};


// Obtener todos los stocks de Bsale
export const getAllStocks = async (req, res) => {
  try {
    const allStocks = await fetchAllStocks();
    res.json(allStocks);
  } catch (error) {
    console.error('Error al obtener stocks:', error.message);
    res.status(500).json({ error: 'No se pudo obtener el stock' });
  }
};




// Actualizar todos los stocks en la base de datos local, los toma directo de bsale. 
// Usa el SKU de cada producto para hacer el match
export const updateAllStocks = async (req, res) => {
  try {
    const allStocks = await updateAllStocksLocalBd();
    res.json(allStocks);
  } catch (error) {
    console.error('Error al actualizar stocks:', error.message);
    res.status(500).json({ error: 'No se pudieron actualizar los stocks' });
  }
};







const BSALE_API_BASE = 'https://api.bsale.io';
const BSALE_TOKEN = process.env.BSALE_TOKEN;


// Actualizar el stock de la base de datos local cuando Se agrega algo en Bsale, de momento no funciona 
// porque se necesita que la página esté en producción
export const handleBsaleWebhook = async (req, res) => {
  console.log('Webhook recibido:', req.body);

  const { topic, action, resource } = req.body;

  if (topic === 'document' && action === 'post') {
    try {
      const response = await axios.get(`${BSALE_API_BASE}${resource}`, {
        headers: {
          'access_token': process.env.BSALE_TOKEN
        }
      });

      const documentData = response.data;

      await syncStockFromDocument(documentData);

      return res.status(200).json({ message: 'Stock sincronizado correctamente desde documento.' });
    } catch (error) {
      console.error('Error al procesar documento de Bsale:', error.response?.data || error.message);
      return res.status(500).json({ error: 'Error al sincronizar el stock.' });
    }
  }

  return res.status(204).end();
};










// Obtener variante usando el sku (en Bsale se llama code)
export const getVariant = async (req, res) => {
  const { sku } = req.params;

  try {
    const variant = await getIdVariantBySku(sku);

    if (!variant) {
      return res.status(404).json({ message: `No se encontró variante con code ${sku}` });
    }

    return res.status(200).json({ variant });
  } catch (error) {
    console.error('Error en controller al obtener variante:', error.message);
    return res.status(500).json({ message: 'Error interno al obtener la variante' });
  }
};






































// Decrementa el stock de un producto en Bsale
export const postDecreaseStock = async (req, res) => {
  try {
    const { sku, quantity } = req.params;
    const quantityNumber = Number(quantity);

    if (!sku || isNaN(quantityNumber)) {
      return res.status(400).json({ error: 'Se requieren los campos sku (string) y quantity (número)' });
    }

    const result = await decreaseStock(sku, quantity);

    res.status(200).json({ message: 'Stock consumido correctamente', result });
  } catch (error) {
    console.error('Error en controlador al disminuir stock:', error.message);
    res.status(500).json({ error: error.message });
  }
};



















/*
// Genera una boeta, de momento solo está en prubas porque conlleva un costo 
// monetario, pero se deja el código para que se pueda usar en el futuro
export const generarBoleta = async (req, res) => {
  try {
    const payload = {
      emissionDate: new Date().toISOString().slice(0, 10), // YYYY-MM-DD
      documentTypeId: 3, // Nota de venta (válida para tu cuenta)
      officeId: 1,
      client: {
        activity: "Particular",
        city: "Santiago",
        commune: "Santiago",
        company: "Cliente Genérico",
        email: "nicolasgajardo11@gmail.com",
        address: "Sin dirección",
        identityNumber: "66666666-6"
      },
      details: [
        {
          quantity: 1,
          price: 1000,
          netUnitValue: false,
          variantId: 2 // Asegúrate que este ID sea válido
        }
      ]
    };

    const response = await axios.post('https://api.bsale.io/v1/documents.json', payload, {
      headers: {
        'access_token': BSALE_TOKEN,
        'Content-Type': 'application/json'
      }
    });

    console.log('Boleta generada:', response.data);

    // Devuelve la respuesta a Postman o al cliente HTTP
    return res.status(200).json(response.data);

  } catch (error) {
    console.error('Error al generar boleta:', error.response?.data || error.message);


    return res.status(500).json({
      error: 'No se pudo generar la boleta',
      detail: error.response?.data || error.message
    });
  }
};
*/


/*

export const generarBoleta = async (req, res) => {
  try {
    // Datos simulados de compra (pueden venir desde req.body si lo deseas)
    const cliente = {
      nombre: "Cliente Genérico",
      email: "nicolasgajardo11@gmail.com",
      direccion: "Sin dirección",
      rut: "66666666-6"
    };

    const productos = [
      { nombre: "Pelota fútbol", cantidad: 1, precio: 1000 }
    ];

    const total = productos.reduce((acc, p) => acc + p.precio * p.cantidad, 0);

    // 1. Generar PDF
    const doc = new PDFDocument();
    let buffers = [];
    doc.on('data', buffers.push.bind(buffers));
    doc.on('end', async () => {
      const pdfBuffer = Buffer.concat(buffers);

      // 2. Enviar PDF por correo
      const emailService = new EmailService();
      const html = await emailService.loadTemplate('boleta', {
        nombre: cliente.nombre,
        fecha: new Date().toLocaleDateString(),
        total: `$${total.toLocaleString()}`
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

      return res.status(200).json({
        message: 'Boleta generada y enviada por correo'
      });
    });

    // 3. Escribir contenido del PDF
    doc.fontSize(18).text('Boleta de compra', { align: 'center' });
    doc.moveDown();

    doc.fontSize(12).text(`Nombre: ${cliente.nombre}`);
    doc.text(`RUT: ${cliente.rut}`);
    doc.text(`Dirección: ${cliente.direccion}`);
    doc.text(`Fecha: ${new Date().toLocaleDateString()}`);
    doc.moveDown();

    doc.text('Detalle de la compra:');
    productos.forEach((p, i) => {
      doc.text(`  - ${p.cantidad} x ${p.nombre} — $${p.precio.toLocaleString()}`);
    });

    doc.moveDown();
    doc.text(`Total: $${total.toLocaleString()}`, { bold: true });

    doc.end(); // Finaliza la generación del PDF

  } catch (error) {
    console.error('Error al generar o enviar boleta:', error);
    return res.status(500).json({
      error: 'No se pudo generar ni enviar la boleta',
      detail: error.message
    });
  }
};
*/




export const generarBoleta = async (req, res) => {
  try {
    // Podrías recibir datos reales desde req.body en el futuro
    const cliente = {
      nombre: "Cliente Genérico",
      email: "nicolasgajardo11@gmail.com",
      direccion: "Sin dirección",
      rut: "66666666-6"
    };

    const productos = [
      { nombre: "Pelota fútbol", cantidad: 1, precio: 1000 }
    ];

    await generarYEnviarBoleta(cliente, productos);

    return res.status(200).json({
      message: 'Boleta generada y enviada por correo'
    });

  } catch (error) {
    console.error('Error al generar o enviar boleta:', error);
    return res.status(500).json({
      error: 'No se pudo generar ni enviar la boleta',
      detail: error.message
    });
  }
};


