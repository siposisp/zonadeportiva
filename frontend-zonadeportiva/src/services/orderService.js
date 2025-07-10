import axios from "axios"

const baseURL = 'http://localhost:3000/order'

const createOrder = async (order) => {
    const response = await axios.post(`${baseURL}/generate-order`, order, {
        withCredentials: true
    })
    return response.data
}

const orderService = { createOrder }

export default orderService