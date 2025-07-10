import axios from "axios"

const baseURL = 'http://localhost:3000/product'

const getSearchByKeyword = async (keyword) => {
    const response = await axios.post(`${baseURL}/get-product-by-keyword`, keyword)
    return response.data
};

const searchService = { getSearchByKeyword }

export default searchService