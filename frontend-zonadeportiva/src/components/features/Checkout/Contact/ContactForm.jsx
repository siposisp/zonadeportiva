"use client"

import { useState, useEffect, useRef } from "react"
import loginService from "@/services/loginService"
import userService from "@/services/userService"
import ContactEditor from "@/components/features/Checkout/Contact/ContactEditor"
import ContactSummary from "@/components/features/Checkout/Contact/ContactSummary"
import { isValidField } from "@/utils/validators"

export default function ContactForm({ step, onNext, onBack }) {
    const formRef = useRef(null)

    const [formData, setFormData] = useState({
        email: "",
        firstName: "",
        lastName: "",
        phone: "",
        rut: "",
    })

    const [isAuthenticated, setIsAuthenticated] = useState(false)

    useEffect(() => {
        const fetchUser = async () => {
            try {
                const authenticated = await loginService.checkToken()
                setIsAuthenticated(authenticated)

                if (authenticated) {
                    const { user } = await userService.getUser()
                    console.log("Usuario obtenido:", user)

                    const newData = {
                        email: user.email ?? "",
                        firstName: user.first_name ?? "",
                        lastName: user.last_name ?? "",
                        phone: user.phone ?? "",
                        rut: user.rut ?? "",
                    }
                    setFormData(newData)
                    onNext(newData)
                }
            } catch (error) {
                console.error("Error al obtener usuario:", error)
            }
        }

        fetchUser()
    }, [])

    const handleChange = (e) => {
        const { name, value } = e.target
        setFormData(prev => ({ ...prev, [name]: value }))
    }

    const handleSubmit = (e) => {
        e.preventDefault()
        if (formRef.current?.checkValidity()) {
            onNext(formData)
        }
    }

    const isFormValid = () => {
        return Object.entries(formData).every(
            ([key, value]) => value.trim() !== "" && isValidField(key, value)
        )
    }

    return (
        <div className="flex flex-col gap-2 border-b border-neutral-300 pb-6">
            {step === "contact" && !isAuthenticated ? (
                <ContactEditor
                    formRef={formRef}
                    formData={formData}
                    onChange={handleChange}
                    onSubmit={handleSubmit}
                    isFormValid={isFormValid}
                />
            ) : (
                formData.email 
                ? (
                    <ContactSummary
                        formData={formData}
                        isAuthenticated={isAuthenticated}
                        onEdit={() => onBack("contact")}
                    />
                ) : (
                    <h2 className="md:text-lg text-base font-semibold uppercase">Contacto</h2>
                )
            )}
        </div>
    )
}
