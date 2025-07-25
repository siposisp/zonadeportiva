import axios from "axios"

const baseURL = 'http://localhost:3000'

const getStates = async () => {
    const response = await axios.get(`${baseURL}/state/get-states/`)
    return response.data
}

const getCitiesById = async (state_id) => {
    const response = await axios.get(`${baseURL}/city/get-cities-by-state/${state_id}`)
    return response.data
}

const addressService = { getStates, getCitiesById }

export default addressService