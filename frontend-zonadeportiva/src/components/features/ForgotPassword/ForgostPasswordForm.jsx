"use client"

import { useState, useRef } from "react"
import accountService from "@/services/accountService"
import InputField from "@/components/common/inputs/InputField"
import PrimaryButton from "@/components/common/buttons/PrimaryButton"
import SecondaryButton from "@/components/common/buttons/SecondaryButton"

export default function ForgotPasswordForm() {
    const [email, setEmail] = useState("")
    const [submitted, setSubmitted] = useState(false)
    const formRef = useRef(null)

    const isFormValid = () => {
        return email.trim() !== "" && (formRef.current?.checkValidity() ?? false)
    }

    const handleSubmit = async (e) => {
        e.preventDefault()
        try {
            await accountService.forgotPassword({ email })
            setSubmitted(true)
        } catch (error) {
            console.error("Error:", error)
        }
    }

    if (submitted) {
        return (
            <div className="flex flex-col gap-2 max-w-md mx-auto text-center">
                <h2 className="text-2xl font-bold">¡Enlace enviado!</h2>
                <p className="text-neutral-600">
                    Te hemos enviado un correo para restablecer tu contraseña.
                </p>
                <p className="text-sm text-neutral-500">
                    Si no lo encuentras en tu bandeja de entrada, revisa la carpeta de spam o promociones.
                </p>
            </div>
        )
    }

    return (
        <form ref={formRef} onSubmit={handleSubmit} className="flex flex-col gap-4">
            <div className="flex flex-col gap-2 border-b border-neutral-200 pb-4">
                <h2 className="text-2xl font-bold">Recuperar contraseña</h2>
                <p className="text-sm text-neutral-600">
                    Ingresa tu correo electrónico y te enviaremos un enlace para restablecer tu contraseña.
                </p>
            </div>

            <InputField
                label="Correo electrónico"
                name="email"
                type="email"
                placeholder="Ingresa tu correo electrónico"
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                showHint={false}
            />

            <div className="grid grid-cols-2 gap-3">
                <SecondaryButton type="button" onClick={() => setEmail("")}>
                    Cancelar
                </SecondaryButton>
                <PrimaryButton type="submit" disabled={!isFormValid()}>
                    Enviar enlace
                </PrimaryButton>
            </div>
        </form>
    )
}