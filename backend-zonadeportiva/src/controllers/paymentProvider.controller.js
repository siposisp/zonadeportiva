import { fetchPaymentProviders } from '../services/paymentProvider.service.js';

/**
 * @swagger
 * /methods/:
 *   get:
 *     summary: Obtener listado de proveedores de pago
 *     description: Retorna todos los métodos o plataformas de pago disponibles registrados en la base de datos. Requiere autenticación.
 *     tags:
 *       - Pagos
 *     security:
 *       - bearerAuth: []
 *     responses:
 *       200:
 *         description: Proveedores de pago obtenidos exitosamente
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 providers:
 *                   type: array
 *                   items:
 *                     type: object
 *                     properties:
 *                       id:
 *                         type: integer
 *                         description: ID del proveedor de pago
 *                         example: 1
 *                       name:
 *                         type: string
 *                         description: Nombre del proveedor de pago
 *                         example: "Webpay"
 *       401:
 *         description: Token no válido o no proporcionado
 *       500:
 *         description: Error interno al obtener proveedores de pago
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 message:
 *                   type: string
 *                   example: "Error interno al obtener proveedores de pago"
 */
// Obtiene los todos los proveedores de pago
export const getPaymentProviders = async (req, res) => {
  try {
    const providers = await fetchPaymentProviders();
    return res.status(200).json({ providers });
  } catch (err) {
    console.error('Error al obtener payment providers:', err);
    return res
      .status(500)
      .json({ message: 'Error interno al obtener proveedores de pago' });
  }
};