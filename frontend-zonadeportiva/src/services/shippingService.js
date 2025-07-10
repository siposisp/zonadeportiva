import axios from "axios"

const baseURL = 'http://localhost:3000/shipping-method'

const getShippingMethods = async (state_id) => {
    const response = await axios.get(`${baseURL}/get-shipping-methods/${state_id}`, {
        withCredentials: true
    })
    return response.data
}

const shippingService = { getShippingMethods }

export default shippingService