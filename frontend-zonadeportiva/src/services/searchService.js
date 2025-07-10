import axios from "axios"

const baseURL = 'https://zonadeportiva-yyqc.onrender.com/product'

const getSearchByKeyword = async (keyword) => {
    const response = await axios.post(`${baseURL}/get-product-by-keyword`, keyword)
    return response.data
};

const searchService = { getSearchByKeyword }

export default searchService