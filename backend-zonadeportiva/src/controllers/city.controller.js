import { fetchCities, fetchCitiesByStateId } from '../services/city.service.js';

/**
 * @swagger
 * /city/get-cities:
 *   get:
 *     summary: Obtener lista de comunas
 *     description: Retorna la lista completa de comunas disponibles, incluyendo su región asociada
 *     tags:
 *       - Direcciones - Comunas
 *     responses:
 *       200:
 *         description: Lista de comunas obtenida exitosamente
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 cities:
 *                   type: array
 *                   description: Arreglo de comunas disponibles
 *                   items:
 *                     type: object
 *                     properties:
 *                       id:
 *                         type: integer
 *                         description: ID de la comuna
 *                         example: 27
 *                       name:
 *                         type: string
 *                         description: Nombre de la comuna
 *                         example: "Maipú"
 *                       state_id:
 *                         type: integer
 *                         description: ID de la región a la que pertenece la comuna
 *                         example: 13
 *       500:
 *         description: Error interno al obtener comunas
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 message:
 *                   type: string
 *                   description: Mensaje de error
 *                   example: "Error interno al obtener comunas"
 */
export const getCities = async (req, res) => {
  try {
    const cities = await fetchCities();
    return res.status(200).json({ cities });
  } catch (err) {
    console.error('Error al obtener comunas:', err);
    return res
      .status(500)
      .json({ message: 'Error interno al obtener comunas' });
  }
};


/**
 * @swagger
 * /city/get-cities-by-state/{state_id}:
 *   get:
 *     summary: Obtener comunas por región
 *     description: Retorna todas las comunas que pertenecen a una región específica según su ID
 *     tags:
 *       - Direcciones - Comunas
 *     parameters:
 *       - in: path
 *         name: state_id
 *         required: true
 *         schema:
 *           type: integer
 *         description: ID de la región (state)
 *         example: 13
 *     responses:
 *       200:
 *         description: Lista de comunas obtenida exitosamente para la región especificada
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 cities:
 *                   type: array
 *                   description: Arreglo de comunas asociadas a la región
 *                   items:
 *                     type: object
 *                     properties:
 *                       id:
 *                         type: integer
 *                         description: ID de la comuna
 *                         example: 27
 *                       name:
 *                         type: string
 *                         description: Nombre de la comuna
 *                         example: "La Florida"
 *                       state_id:
 *                         type: integer
 *                         description: ID de la región correspondiente
 *                         example: 13
 *       500:
 *         description: Error interno al obtener comunas
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 message:
 *                   type: string
 *                   description: Mensaje de error
 *                   example: "Error interno al obtener comunas"
 */
export const getCitiesByStateId = async (req, res) => {
  const { state_id } = req.params;
  try {
    const cities = await fetchCitiesByStateId(state_id);
    return res.status(200).json({ cities });
  } catch (err) {
    console.error('Error al obtener comunas:', err);
    return res
      .status(500)
      .json({ message: 'Error interno al obtener comunas' });
  }
};
