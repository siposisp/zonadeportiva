import axios from "axios"

const baseURL = 'https://zonadeportiva-yyqc.onrender.com/customer'

const getUser = async () => {
    const response = await axios.get(`${baseURL}`, {
        withCredentials: true
    })
    return response.data
}

const getUserAddress = async () => {
    const response = await axios.get(`${baseURL}/addresses`, {
        withCredentials: true
    })
    return response.data
}

const addUserAddress = async (address) => {
    const response = await axios.post(`${baseURL}/address`, address, {
        withCredentials: true
    })
    return response.data
}

const updateUserAddress = async (address_id, address) => {
    const response = await axios.put(`${baseURL}/address/${address_id}`, address, {
        withCredentials: true
    })
    return response.data
}

const removeUserAddress = async (address_id) => {
    const response = await axios.delete(`${baseURL}/address/${address_id}`, {
        withCredentials: true
    })
    return response.data
}

const userService = { getUser, getUserAddress, addUserAddress, updateUserAddress, removeUserAddress }

export default userService