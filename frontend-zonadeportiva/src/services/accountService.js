import axios from "axios"

const baseURL = 'http://localhost:3000'
const forgotPassword = async (email) => {
    const response = await axios.post(`${baseURL}/auth-email/forgot-password`, email)
    return response.data
}

const resetPassword = async (token, password) => {
    const response = await axios.put(`${baseURL}/user/reset-password`, {token, newPassword: password})
    return response.data
}

const accountService = { forgotPassword, resetPassword }

export default accountService