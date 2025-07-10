import { fetchCities, fetchCitiesByStateId } from '../services/city.service.js';

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
