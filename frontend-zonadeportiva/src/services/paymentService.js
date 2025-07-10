import axios from "axios"

const baseURL = 'https://zonadeportiva-yyqc.onrender.com'

const initPayment = async (transaction) => {
    const response = await axios.post(`${baseURL}/webpay/create`, transaction)
    return response.data
}

const responsePayment = async (token) => {
    const response = await axios.get(`${baseURL}/webpay/return?token_ws=${token}`)
    return response.data
}

const paymentService = { initPayment, responsePayment }

export default paymentService