"use client"

import { useState, useRef } from "react"
import { useRouter } from "next/navigation"
import registerService from "@/services/registerService"
import cartService from "@/services/cartService"
import { getCart, removeCart } from "@/utils/cartUtils"
import PrimaryButton from "@/components/common/buttons/PrimaryButton"
import InputField from "@/components/common/inputs/InputField"
import { isValidField } from "@/utils/validators"

export default function RegisterForm() {
    const [formData, setFormData] = useState({
        email: "",
        firstName: "",
        lastName: "",
        phone: "",
        rut: "",
        password: ""
    })
    const [errorMessage, setErrorMessage] = useState("")

    const formRef = useRef(null)
    const router = useRouter()

    const handleChange = (e) => {
        setFormData(prev => ({
            ...prev,
            [e.target.name]: e.target.value,
        }))
    }

    const isFormValid = () => {
        const allFieldsFilled = Object.values(formData).every(field => field.trim() !== "")
        return allFieldsFilled && Object.entries(formData).every(([key, value]) => isValidField(key, value))
    }

    const handleSubmit = async (e) => {
        e.preventDefault()
        setErrorMessage("")

        try {
            await registerService.registerUser(formData)

            await cartService.createCart()

            const cart = getCart()
            if (cart?.cart_items?.length > 0) {
                await cartService.syncCart(cart)
                removeCart()
            }

            window.dispatchEvent(new Event("authChanged"))
            router.push("/")
        } catch (error) {
            if (error.response?.status >= 400 && error.response.status < 500) {
                setErrorMessage("Ya existe una cuenta asociada a este correo electrónico. Por favor, intenta iniciar sesión o usa un correo diferente.")
            } else if (error.response) {
                setErrorMessage("Error del servidor. Intenta nuevamente más tarde.")
            } else if (error.request) {
                setErrorMessage("No se pudo conectar con el servidor. Verifica tu conexión.")
            } else {
                setErrorMessage("Ocurrió un error inesperado. Intenta nuevamente.")
            }
        }
    }

    return (
        <form ref={formRef} onSubmit={handleSubmit} className="flex flex-col">
            {errorMessage && (
                <div role="alert" className="alert alert-warning alert-soft">
                    <svg xmlns="http://www.w3.org/2000/svg" className="h-6 w-6 shrink-0 stroke-current" fill="none" viewBox="0 0 24 24">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M12 9v2m0 4h.01m-6.938 4h13.856c1.54 0 2.502-1.667 1.732-3L13.732 4c-.77-1.333-2.694-1.333-3.464 0L3.34 16c-.77 1.333.192 3 1.732 3z" />
                    </svg>
                    <span>{errorMessage}</span>
                </div>
            )}

            <div className="grid grid-cols-2 gap-x-6 gap-y-4">
                <InputField
                    label="Nombre"
                    name="firstName"
                    type="text"
                    placeholder="Ingresa un nombre"
                    value={formData.firstName}
                    onChange={handleChange}
                />

                <InputField
                    label="Apellidos"
                    name="lastName"
                    type="text"
                    placeholder="Ingresa un apellido"
                    value={formData.lastName}
                    onChange={handleChange}
                />

                <InputField
                    label="Correo electrónico"
                    name="email"
                    type="email"
                    placeholder="Ingresa un correo electrónico"
                    value={formData.email}
                    onChange={handleChange}
                />

                <InputField
                    label="Celular"
                    name="phone"
                    type="tel"
                    placeholder="9 1234 5678"
                    value={formData.phone}
                    onChange={handleChange}
                />

                <InputField
                    label="RUT"
                    name="rut"
                    type="text"
                    placeholder="12.345.678-9"
                    value={formData.rut}
                    onChange={handleChange}
                />

                <InputField
                    label="Contraseña"
                    name="password"
                    type="password"
                    placeholder="Ingresa una contraseña"
                    value={formData.password}
                    onChange={handleChange}
                />

                <div className="col-span-2 flex justify-end mt-2">
                    <PrimaryButton type="submit" disabled={!isFormValid()}>
                        Crear cuenta
                    </PrimaryButton>
                </div>
            </div>
        </form>
    )
}
