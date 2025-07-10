import { fetchStates } from '../services/state.service.js';

export const getStates = async (req, res) => {
  try {
    const states = await fetchStates();
    return res.status(200).json({ states });
  } catch (err) {
    console.error('Error al obtener ciudades:', err);
    return res
      .status(500)
      .json({ message: 'Error interno al obtener ciudades' });
  }
};
