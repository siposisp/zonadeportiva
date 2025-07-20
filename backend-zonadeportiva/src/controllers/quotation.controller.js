import quotationEmailService from '../services/email/quotationEmail.service.js';
import { pool } from '../../database/connectionPostgreSQL.js';

class QuotationController {
  async requestQuotation(req, res) {
    try {
      const { productos, customerName, customerLastName, customerEmail, message } = req.body;
      
      // Determinar datos del cliente según si está logueado o no
      let clientData;
      
      if (req.user) {
        // Usuario logueado - obtener datos del customer usando la misma query de getCustomer
        try {
          const result = await pool.query(
            `SELECT 
               u.id    AS user_id,
               u.email,
               u.role,
               c.id    AS customer_id,
               c.rut,
               c.first_name,
               c.last_name,
               c.phone
             FROM users u
             LEFT JOIN customers c ON c.user_id = u.id
             WHERE u.id = $1`,
            [req.user.id]
          );

          if (result.rows.length === 0) {
            return res.status(404).json({ 
              error: 'No se encontraron datos del cliente' 
            });
          }

          const customerData = result.rows[0];
          
          clientData = {
            customerName: customerData.first_name,
            customerLastName: customerData.last_name,
            customerEmail: customerData.email,
            userId: req.user.id
          };
        } catch (dbError) {
          console.error('Error al consultar customer:', dbError);
          return res.status(500).json({ 
            error: 'Error al obtener datos del cliente',
            code: 'CUSTOMER_DATA_ERROR'
          });
        }
      } else {
        // Usuario no logueado - usar datos del body
        if (!customerName || !customerLastName || !customerEmail) {
          return res.status(400).json({ 
            error: 'Faltan campos requeridos: productos, customerName, customerLastName, customerEmail' 
          });
        }
        
        clientData = {
          customerName,
          customerLastName,
          customerEmail
        };
      }
      
      // Validación de productos (siempre requerida)
      if (!productos) {
        return res.status(400).json({ 
          error: 'Faltan campos requeridos: productos' 
        });
      }
      
      if (!Array.isArray(productos) || productos.length === 0) {
        return res.status(400).json({ 
          error: 'La lista de productos debe contener al menos un producto' 
        });
      }
      
      // Validar que cada producto tenga nombre y cantidad
      for (const producto of productos) {
        if (!producto.nombre || !producto.cantidad) {
          return res.status(400).json({ 
            error: 'Cada producto debe tener nombre y cantidad' 
          });
        }
        if (producto.cantidad < 1) {
          return res.status(400).json({ 
            error: 'La cantidad debe ser mayor a 0' 
          });
        }
      }
      
      // Validar email básico (solo si es usuario no logueado)
      if (!req.user) {
        const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
        if (!emailRegex.test(clientData.customerEmail)) {
          return res.status(400).json({ 
            error: 'El email del cliente no es válido' 
          });
        }
      }
      
      // Generar ID único para la cotización
      const quotationId = `COT-${new Date().getFullYear()}-${Date.now().toString().slice(-6)}`;
      
      // Preparar datos de la cotización
      const quotationData = {
        productos,
        customerName: clientData.customerName,
        customerLastName: clientData.customerLastName,
        customerEmail: clientData.customerEmail,
        message,
        userId: clientData.userId || null // Solo si está logueado
      };
      
      // Email del administrador (puedes configurarlo desde variables de entorno)
      const adminEmail = process.env.EMAIL_USER;
      
      // Enviar correos
      await quotationEmailService.sendQuotationEmails(adminEmail, quotationId, quotationData);
      
      res.json({
        message: 'Solicitud de cotización enviada exitosamente',
        success: true,
        quotationId
      });
      
    } catch (error) {
      console.error('Error en requestQuotation:', error);
      
      // Determinar tipo de error
      if (error.message.includes('correo')) {
        return res.status(500).json({
          error: 'Error al enviar los correos de cotización',
          code: 'EMAIL_SEND_FAILED'
        });
      }
      
      res.status(500).json({ 
        error: 'Error interno del servidor',
        code: 'INTERNAL_SERVER_ERROR'
      });
    }
  }
}

export default new QuotationController();