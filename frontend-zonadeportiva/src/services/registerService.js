import axios from "axios"

const baseURL = 'https://zonadeportiva-yyqc.onrender.com/user'

const registerUser = async (user) => {
    const response = await axios.post(`${baseURL}/register`, user, {
        withCredentials: true
    })
    return response.data
}

const registerService = { registerUser }

export default registerService