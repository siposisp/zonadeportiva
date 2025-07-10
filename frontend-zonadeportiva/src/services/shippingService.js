import axios from "axios"

const baseURL = 'https://zonadeportiva-yyqc.onrender.com/shipping-method'

const getShippingMethods = async (city_id) => {
    const response = await axios.get(`${baseURL}/get-shipping-methods/${city_id}`)
    return response.data
}

const shippingService = { getShippingMethods }

export default shippingService