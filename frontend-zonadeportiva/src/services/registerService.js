import axios from "axios"

const baseURL = 'http://localhost:3000/user'

const registerUser = async (user) => {
    const response = await axios.post(`${baseURL}/register`, user, {
        withCredentials: true
    })
    return response.data
}

const registerService = { registerUser }

export default registerService