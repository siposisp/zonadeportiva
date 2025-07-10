"use client"

import { useSearchParams, useRouter } from "next/navigation"
import { useEffect, useState } from "react"
import paymentService from "@/services/paymentService"
import { formatCLP } from "@/utils/formatPrice"

export default function WebpayReturnPage() {
    const params = useSearchParams()
    const router = useRouter()
    const token = params.get("token_ws")

    const [status, setStatus] = useState("loading")
    const [transaction, setTransaction] = useState(null)
    const [seconds, setSeconds] = useState(8)

    const fetchTransactionStatus = async () => {
        if (!token) {
            setStatus("canceled")
            return
        }

        try {
            const response = await paymentService.responsePayment(token)

            setStatus(response.status)
            setTransaction(response.data)
        } catch (err) {
            console.error("Error al procesar el retorno de Webpay:", err)
            setStatus("error")
        }
    }

    useEffect(() => {
        if (!token) {
            setStatus("canceled")
            return
        }

        fetchTransactionStatus()
    }, [token])

    useEffect(() => {
        if (status === "loading") return

        const countdown = setInterval(() => {
            setSeconds((prev) => prev - 1)
        }, 1000)

        const redirectTimeout = setTimeout(() => {
            router.push("/")
        }, seconds * 1000)

        return () => {
            clearInterval(countdown)
            clearTimeout(redirectTimeout)
        }
    }, [status])

    return (
        <div className="max-w-md mx-auto p-6">
            <div className="rounded-lg px-6 py-8 text-center space-y-4 border border-neutral-200">
                {status === "loading" ? (
                        <p className="text-sm text-neutral-600">Cargando detalle de transacción…</p>
                    ) : status === "success" ? (
                        <>
                            <div className="flex justify-center">
                                <div className="w-12 h-12 bg-green-100 text-green-700 rounded-full flex items-center justify-center text-xl">
                                    <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" strokeWidth={1.5} stroke="currentColor" className="size-6 font-bold">
                                    <path strokeLinecap="round" strokeLinejoin="round" d="m4.5 12.75 6 6 9-13.5" />
                                    </svg>
                                </div>
                            </div>
                            <h1 className="text-xl font-bold text-green-700">¡Pago exitoso!</h1>
                            <p className="text-sm text-neutral-600">Gracias por tu compra.</p>
                            <div className="bg-green-50 p-4 rounded-md text-sm text-left space-y-1">
                                <p><strong>Orden:</strong> {transaction?.buy_order}</p>
                                <p><strong>sessionId:</strong> {transaction?.sessionId}</p>
                                <p><strong>Autorización:</strong> {transaction?.authorization_code}</p>
                                <p><strong>Monto:</strong> {formatCLP(transaction?.amount)}</p>
                            </div>
                            <p className="text-sm text-neutral-500">Redirigiendo al inicio en {seconds} segundos…</p>
                        </>
                    ) : status === "canceled" ? (
                        <>
                            <div className="flex justify-center">
                                <div className="w-12 h-12 bg-yellow-100 text-yellow-700 rounded-full flex items-center justify-center text-xl">
                                ⚠️
                                </div>
                            </div>
                            <h1 className="text-xl font-bold text-yellow-700">Transacción cancelada</h1>
                            <p className="text-sm text-neutral-600">No se ha efectuado el pago.</p>
                            <p className="text-sm text-neutral-500">Redirigiendo al inicio en {seconds} segundos…</p>
                        </>
                    ) : (
                        <>
                            <div className="flex justify-center">
                                <div className="w-12 h-12 bg-red-100 text-red-700 rounded-full flex items-center justify-center text-xl">
                                ❌
                                </div>
                            </div>
                            <h1 className="text-xl font-bold text-red-700">Pago fallido</h1>
                            <p className="text-sm text-neutral-600">Hubo un problema al confirmar el pago.</p>
                            <p className="text-sm text-neutral-500">Redirigiendo al inicio en {seconds} segundos…</p>
                        </>
                )}
            </div>
        </div>
    )
}
