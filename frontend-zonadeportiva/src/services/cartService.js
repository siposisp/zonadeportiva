import axios from "axios"

const baseURL = 'https://zonadeportiva-yyqc.onrender.com/cart'

const addToCart = async (cart, product_id, quantity) => {
    const response = await axios.post(`${baseURL}/add-to-cart`, { cart, product_id, quantity }, {
        withCredentials: true
    })
    return response.data
}

const removeFromCart = async (cart, product_id) => {
    const response = await axios.post(`${baseURL}/remove-from-cart`, { cart, product_id }, {
        withCredentials: true
    })
    return response.data
}

const removeCart = async () => {
    const response = await axios.delete(`${baseURL}/remove-cart`, {
        withCredentials: true
    })
    return response.data
}

const createCart = async () => {
    const response = await axios.post(`${baseURL}/`, {}, {
        withCredentials: true
    })
    return response.data
}

const getCart = async () => {
    const response = await axios.get(`${baseURL}/`, {
        withCredentials: true
    })
    return response.data.cart;
}

const syncCart = async (localCart) => {
    const response = await axios.post(`${baseURL}/sync-cart`, { cart: localCart }, {
        withCredentials: true
    })
    return response.data
}

const cartService = { addToCart, removeFromCart, removeCart, createCart, getCart, syncCart }

export default cartService