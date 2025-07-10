import axios from "axios"

const baseURL = 'http://localhost:3000/user'

const loginUser = async (user) => {
    const response = await axios.post(`${baseURL}/login`, user, {
        withCredentials: true
    })
    return response.data
}

const logoutUser = async () => {
    const response = await axios.post(`${baseURL}/logout`, {}, {
        withCredentials: true
    })
    return response.data
}

const checkToken = async () => {
    const response = await axios.get(`${baseURL}/verify-token`, {
        withCredentials: true
    })
    return response.data.isAuthenticated
}

const loginService = { loginUser, logoutUser, checkToken }

export default loginService