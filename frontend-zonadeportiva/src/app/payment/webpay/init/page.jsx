"use client"

import { useEffect, useState } from "react"
import { useRouter, useSearchParams } from "next/navigation"
import paymentService from "@/services/paymentService"

export default function WebpayInitPage() {
    const params = useSearchParams()
    const router = useRouter()

    const [loading, setLoading] = useState(true)

    const amount = params.get("amount")
    const buyOrder = params.get("order")

    const initPayment = async () => {
        try {
            const transaction = {
                buyOrder,
                amount: parseInt(amount),
                returnUrl: `http://localhost:3001/payment/webpay/return`
            }

            const response = await paymentService.initPayment(transaction)
            const { url, token } = response

            router.push(`${url}?token_ws=${token}`)
        } catch (err) {
            console.error("Error al iniciar el pago:", err)
            alert("No se pudo iniciar el pago.")
            setLoading(false)
        }
    }

    useEffect(() => {
        if (!amount || !buyOrder) {
            console.error("Faltan parámetros para iniciar el pago")
            setLoading(false)
            return
        }

        initPayment()
    }, [params])

    return (
        <main className="max-w-md mx-auto p-6 text-center">
            {loading ? (
                <p className="text-sm text-neutral-600">Redirigiendo a WebPay…</p>
            ) : (
                <p className="text-sm text-red-600">No se pudo iniciar el pago.</p>
            )}
        </main>
    )
}
