"use client"

import { useState } from "react"
import PaymentSelector from "./PaymentSelector"
import PaymentSummary from "./PaymentSummary"

const paymentOptions = [
    {
        id: "webpay",
        name: "Débito / Crédito",
        description: "Paga con tarjeta a través de WebPay",
        redirectPath: "/payment/webpay/init"
    },
    {
        id: "transferencia",
        name: "Transferencia Bancaria",
        description: "Realiza una transferencia manual y envía el comprobante",
        redirectPath: "/payment/linkify/init"
    }
]

export default function CheckoutPaymentForm({ step, onNext, onBack }) {
    const [selectedMethod, setSelectedMethod] = useState(null)

    const handleSubmit = (e) => {
        e.preventDefault()
        const method = paymentOptions.find(p => p.id === selectedMethod)
        if (method) onNext(method)
    }

    const selected = paymentOptions.find(p => p.id === selectedMethod)

    return (
        <div className="pb-6">
            {step === "payment" ? (
                <PaymentSelector
                    options={paymentOptions}
                    selectedMethod={selectedMethod}
                    onSelect={setSelectedMethod}
                    onSubmit={handleSubmit}
                />
            ) : selected ? (
                <PaymentSummary method={selected} onEdit={() => onBack("payment")} />
            ) : (
                <h2 className="md:text-lg text-base font-semibold uppercase text-neutral-500">Método de pago</h2>
            )}
        </div>
    )
}