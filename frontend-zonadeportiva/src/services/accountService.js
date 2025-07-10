import axios from "axios"

const baseURL = 'https://zonadeportiva-yyqc.onrender.com'
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