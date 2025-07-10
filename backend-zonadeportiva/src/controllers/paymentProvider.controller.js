import { fetchPaymentProviders } from '../services/paymentProvider.service.js';

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