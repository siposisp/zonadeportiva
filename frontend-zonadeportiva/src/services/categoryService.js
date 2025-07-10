import axios from "axios"

const baseURL = 'https://zonadeportiva-yyqc.onrender.com/category'

const getCategories = async () => {
    const response = await axios.get(`${baseURL}/get-grouped-categories`)
    return response.data
}

const getProductsByCategory = async (category) => {
    const response = await axios.post(`${baseURL}/products-by-categories`, category)
    return response.data
}

const categoryService = { getCategories, getProductsByCategory }

export default categoryService