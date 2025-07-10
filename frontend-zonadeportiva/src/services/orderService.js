import axios from "axios"

const baseURL = 'https://zonadeportiva-yyqc.onrender.com/order'

const createOrder = async (order) => {
    const response = await axios.post(`${baseURL}/generate-order`, order, {
        withCredentials: true
    })
    return response.data
}

const orderService = { createOrder }

export default orderService