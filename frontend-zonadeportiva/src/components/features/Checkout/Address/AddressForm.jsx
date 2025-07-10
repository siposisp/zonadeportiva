import { useState, useEffect, useRef } from "react"
import loginService from "@/services/loginService"
import userService from "@/services/userService"
import addressService from "@/services/addressService"
import AddressSummary from "./AddressSummary"
import AddressSelector from "./AddressSelector"
import AddressEditor from "./AddressEditor"
import { isValidField } from "@/utils/validators"

export default function AddressForm({ step, onNext, onBack }) {
    const [states, setStates] = useState([])
    const [cities, setCities] = useState([])
    const [isAuthenticated, setIsAuthenticated] = useState(false)
    const [userAddresses, setUserAddresses] = useState([])
    const [selectedAddressId, setSelectedAddressId] = useState(null)
    const [showModal, setShowModal] = useState(false)

    const [formData, setFormData] = useState({
        state_id: "",
        city_id: "",
        address: "",
        number: "",
        apartment: ""
    })

    const [newAddress, setNewAddress] = useState({
        state_id: "",
        city_id: "",
        address: "",
        number: "",
        apartment: ""
    })

    const formRef = useRef(null)

    useEffect(() => {
        fetchStates()
        checkAuthentication()
    }, [])

    useEffect(() => {
        if (formData.state_id) fetchCities(formData.state_id)
    }, [formData.state_id])

    useEffect(() => {
        if (newAddress.state_id) fetchCities(newAddress.state_id)
    }, [newAddress.state_id])

    const fetchStates = async () => {
        const { states } = await addressService.getStates()
        setStates(states)
    }

    const fetchCities = async (state_id) => {
        const { cities } = await addressService.getCitiesById(state_id)
        setCities(cities)
    }

    const checkAuthentication = async () => {
        try {
            const auth = await loginService.checkToken()
            setIsAuthenticated(auth)
            if (auth) fetchUserAddresses()
        } catch (e) {
            console.error("Error checking auth:", e)
        }
    }

    const fetchUserAddresses = async () => {
        try {
            const { addresses } = await userService.getUserAddress()
            setUserAddresses(addresses)
            if (addresses.length) handleUseAddress(addresses[0])
        } catch (e) {
            console.error("Error fetching addresses:", e)
        }
    }

    const handleUseAddress = (address) => {
        setFormData({
            state_id: String(address.state_id),
            city_id: String(address.city_id),
            address: address.address,
            number: address.number,
            apartment: address.apartment || ""
        })
        setSelectedAddressId(address.address_id)
    }

    const handleChange = (e, isNew = false) => {
        const { name, value } = e.target
        const setState = isNew ? setNewAddress : setFormData
        setState(prev => ({ ...prev, [name]: value }))
    }

    const isFormValid = () => {
        const requiredFields = ["state_id", "city_id", "address", "number"]

        const allRequiredFilled = requiredFields.every(k => String(formData[k] || "").trim())
        const allRequiredValid = requiredFields.every(k => isValidField(k, formData[k]))

        return allRequiredFilled && allRequiredValid
    }

    const handleSubmit = async (e) => {
        e.preventDefault()
        if (!isFormValid()) return

        try {
            if (isAuthenticated) {
                await userService.addUserAddress(formData)
                const { addresses } = await userService.getUserAddress()
                setUserAddresses(addresses)
                const latest = addresses[addresses.length - 1]
                handleUseAddress(latest)
            }
            onNext(formData)
        } catch (error) {
            console.error("Error al guardar dirección directa:", error)
        }
    }

    const handleNewAddressSubmit = async (e) => {
        e.preventDefault()
        try {
            await userService.addUserAddress(newAddress)
            setShowModal(false)
            await fetchUserAddresses()
        } catch (e) {
            console.error("Error creating new address:", e)
        }
    }

    const deleteUserAddress = async (id) => {
        try {
            await userService.removeUserAddress(id)
            await fetchUserAddresses()
        } catch (e) {
            console.error("Error deleting address:", e)
        }
    }

    return (
        <div className="border-b border-neutral-300 pb-6">
            {step === "address"
                ? (
                    isAuthenticated && userAddresses.length > 0 
                        ? (
                            <AddressSelector
                                userAddresses={userAddresses}
                                selectedAddressId={selectedAddressId}
                                onSelect={handleUseAddress}
                                onDelete={deleteUserAddress}
                                onAdd={() => onNext(formData)}
                                newAddress={newAddress}
                                showModal={showModal}
                                setShowModal={setShowModal}
                                handleChange={handleChange}
                                handleSubmit={handleNewAddressSubmit}
                                states={states}
                                cities={cities}
                            />
                        ) : (
                            <AddressEditor
                                formData={formData}
                                onChange={handleChange}
                                onSubmit={handleSubmit}
                                formRef={formRef}
                                isFormValid={isFormValid}
                                states={states}
                                cities={cities}
                            />
                        )
                ) : (
                    formData.address
                        ? (
                            <AddressSummary
                                formData={formData}
                                states={states}
                                cities={cities}
                                onEdit={() => onBack("address")}
                                isAuthenticated={isAuthenticated}
                            />
                        ) : (
                            <h2 className="md:text-lg text-base font-semibold uppercase text-neutral-500">Dirección</h2>
                        )
                ) 
            }
        </div>
    )
}
