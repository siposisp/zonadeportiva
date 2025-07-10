"use client"

import { useEffect, useState } from "react"
import shippingService from "@/services/shippingService"
import ShippingSelector from "./ShippingSelector"
import ShippingSummary from "./ShippingSummary"

export default function CheckoutShippingForm({ step, address, onNext, onBack }) {
    const [methods, setMethods] = useState([])
    const [selectedMethodId, setSelectedMethodId] = useState(null)

    useEffect(() => {
        if (address?.city_id) {
            fetchMethods(address.city_id)
        }
    }, [address?.city_id])

    const fetchMethods = async (city_id) => {
        try {
            const { shipping_methods } = await shippingService.getShippingMethods(city_id)
            setMethods(shipping_methods)
            if (shipping_methods.length === 1) {
                setSelectedMethodId(shipping_methods[0].id)
            }
        } catch (err) {
            console.error("Error al obtener métodos de envío:", err)
        }
    }

    const handleSubmit = (e) => {
        e.preventDefault()
        const selected = methods.find(m => m.id === selectedMethodId)
        if (selected) {
            onNext({ ...selected, cost: Math.round(selected.cost) })
        }
    }

    const selectedMethod = methods.find(m => m.id === selectedMethodId)

    return (
        <div className="border-b border-neutral-300 pb-6">
            {step === "shipping" ? (
                <ShippingSelector
                    methods={methods}
                    selectedMethodId={selectedMethodId}
                    onSelect={setSelectedMethodId}
                    onSubmit={handleSubmit}
                />
            ) : selectedMethod ? (
                <ShippingSummary method={selectedMethod} onEdit={() => onBack("shipping")} />
            ) : (
                <h2 className="md:text-lg text-base font-semibold uppercase text-neutral-500">Opciones de entrega</h2>
            )}
        </div>
    )
}
