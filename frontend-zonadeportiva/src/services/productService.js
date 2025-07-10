import axios from "axios"

const baseURL = 'http://localhost:3000/product'

const getProducts = async () => {
    const response = await axios.get(baseURL)
    return response.data
}

const getProductById = async (product_id) => {
    const response = await axios.get(`http://localhost:3000/cart/${product_id}`)
    return response.data
}

const getProductDetails = async (slug) => {
    const response = await axios.get(`${baseURL}/get-product-all-details-by-slug/${slug}`)
    return response.data
}

const getVariants = async (slug) => {
    const response = await axios.get(`${baseURL}/get-variants-by-slug/${slug}`)
    return response.data
}

const validateProductStock = async (product_id, quantity) => {
    const response = await axios.post(`${baseURL}/check-stock`, { product_id, quantity })
    return response.data
}

const productService = { getProducts, getProductById, getProductDetails, getVariants, validateProductStock }

export default productService