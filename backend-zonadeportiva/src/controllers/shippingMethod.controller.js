import { fetchShippingMethods } from '../services/shippingMethod.service.js';

/**
 * @swagger
 * /shipping-method/get-shipping-methods/{city_id}:
 *   get:
 *     summary: Obtener métodos de envío para una comuna
 *     description: Retorna los métodos de envío disponibles para una comuna específica según su ID
 *     tags:
 *       - Envíos
 *     parameters:
 *       - in: path
 *         name: city_id
 *         required: true
 *         schema:
 *           type: integer
 *         description: ID de la comuna (city) para consultar métodos de envío
 *         example: 27
 *     responses:
 *       200:
 *         description: Métodos de envío obtenidos exitosamente para la comuna especificada
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 shipping_methods:
 *                   type: array
 *                   description: Arreglo de métodos de envío disponibles
 *                   items:
 *                     type: object
 *                     properties:
 *                       id:
 *                         type: integer
 *                         description: ID del método de envío
 *                         example: 3
 *                       name:
 *                         type: string
 *                         description: Nombre corto del método
 *                         example: "Despacho Express"
 *                       description:
 *                         type: string
 *                         description: Descripción detallada del método
 *                         example: "Entrega en el mismo día para comunas seleccionadas"
 *                       carrier:
 *                         type: string
 *                         description: Empresa transportista o canal logístico
 *                         example: "Chilexpress"
 *                       cost:
 *                         type: number
 *                         format: float
 *                         description: Costo del envío en CLP
 *                         example: 3990.00
 *       500:
 *         description: Error interno al obtener métodos de envío
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 message:
 *                   type: string
 *                   description: Mensaje de error
 *                   example: "Error interno al obtener el(los) metodo(s) de envio"
 */
export const  getShippingMethods = async (req, res) => {
  const { city_id } = req.params;
  try {
    const shipping_methods = await fetchShippingMethods(city_id);
    return res.status(200).json({ shipping_methods });
  } catch (err) {
    console.error('Error al obtener el(los) metodo(s) de envio:', err);
    return res
      .status(500)
      .json({ message: 'Error interno al obtener el(los) metodo(s) de envio' });
  }
};
