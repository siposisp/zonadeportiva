import { fetchShippingMethods } from '../services/shippingMethod.service.js';

export const getShippingMethods = async (req, res) => {
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
