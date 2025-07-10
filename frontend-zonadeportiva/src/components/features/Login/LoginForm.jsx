"use client"

import { useState } from "react"
import { useRouter } from "next/navigation"
import Link from "next/link"
import loginService from "@/services/loginService"
import cartService from "@/services/cartService"
import { getCart, removeCart } from "@/utils/cartUtils"
import PrimaryButton from "@/components/common/buttons/PrimaryButton"
import InputField from "@/components/common/inputs/InputField"

export default function LoginForm() {
    const [formData, setFormData] = useState({
        email: "",
        password: ""
    })
    const [errorMessage, setErrorMessage] = useState("")

    const router = useRouter()

    const handleChange = (e) => {
        setFormData(prev => ({
            ...prev,
            [e.target.name]: e.target.value,
        }))
    }

    const isFormValid = () => {
        return formData.email.trim() !== "" && formData.password.trim() !== ""
    }

    const handleSubmit = async (e) => {
        console.log("SUBMIT...")
        e.preventDefault()
        setErrorMessage("")

        try {
            const response = await loginService.loginUser(formData)
            console.log("RESPONSE", response)
            const cart = getCart()

            if (cart?.cart_items?.length > 0) {
                await cartService.syncCart(cart)
                removeCart()
            }

            window.dispatchEvent(new Event("authChanged"))
            router.push("/")
        } catch (error) {
            if (error.response) {
                if (error.response.status >= 400 && error.response.status < 500) {
                    setErrorMessage("Correo electrónico o contraseña incorrecta. Por favor, vuelve a intentarlo nuevamente.")
                } else {
                    setErrorMessage("Error del servidor. Intenta nuevamente más tarde.")
                }
            } else if (error.request) {
                setErrorMessage("No se pudo conectar con el servidor. Verifica tu conexión.")
            } else {
                setErrorMessage("Ocurrió un error inesperado. Intenta nuevamente.")
            }
        }
    }

    return (
        <form onSubmit={handleSubmit} className="flex flex-col gap-4">
            {errorMessage && (
                <div role="alert" className="alert alert-warning alert-soft">
                    <svg xmlns="http://www.w3.org/2000/svg" className="h-6 w-6 shrink-0 stroke-current" fill="none" viewBox="0 0 24 24">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M12 9v2m0 4h.01m-6.938 4h13.856c1.54 0 2.502-1.667 1.732-3L13.732 4c-.77-1.333-2.694-1.333-3.464 0L3.34 16c-.77 1.333.192 3 1.732 3z" />
                    </svg>
                    <span>{errorMessage}</span>
                </div>
            )}

            <div className="flex flex-col gap-2">
                <InputField
                    label="Correo electrónico"
                    name="email"
                    type="email"
                    placeholder="Ingresa tu correo electrónico"
                    value={formData.email}
                    onChange={handleChange}
                    showHint={false}
                />

                <InputField
                    label="Contraseña"
                    name="password"
                    type="password"
                    placeholder="Ingresa tu contraseña"
                    value={formData.password}
                    onChange={handleChange}
                    showPasswordRecovery
                    showHint={false}
                />
            </div>

            <div className="flex flex-col gap-2">
                <PrimaryButton type="submit" disabled={!isFormValid()}>
                    Iniciar sesión
                </PrimaryButton>

                <div className="flex justify-center gap-1 md:text-sm text-xs">
                    <p>¿Aún no tienes cuenta?</p>
                    <Link href="/registro" className="text-blue-600 hover:underline">
                        Crear cuenta
                    </Link>
                </div>
            </div>
        </form>
    )
}