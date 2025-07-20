import { fetchStates } from '../services/state.service.js';

/**
 * @swagger
 * /state/get-states:
 *   get:
 *     summary: Obtener lista de regiones
 *     description: Retorna la lista completa de regiones disponibles para selección de direcciones
 *     tags:
 *       - Direcciones - Regiones
 *     responses:
 *       200:
 *         description: Lista de regiones obtenida exitosamente
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 states:
 *                   type: array
 *                   description: Arreglo de regiones disponibles
 *                   items:
 *                     type: object
 *                     properties:
 *                       id:
 *                         type: integer
 *                         description: ID numérico de la region
 *                         example: 13
 *                       name:
 *                         type: string
 *                         description: Nombre de la region
 *                         example: "Región Metropolitana"
 *                       short_name:
 *                         type: string
 *                         description: Nombre corto de la region
 *                         example: "RM"
 *       500:
 *         description: Error interno al obtener regiones
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 message:
 *                   type: string
 *                   description: Mensaje de error
 *                   example: "Error interno al obtener regiones"
 */

export const getStates = async (req, res) => {
  try {
    const states = await fetchStates();
    return res.status(200).json({ states });
  } catch (err) {
    console.error('Error al obtener regiones:', err);
    return res
      .status(500)
      .json({ message: 'Error interno al obtener regiones' });
  }
};
