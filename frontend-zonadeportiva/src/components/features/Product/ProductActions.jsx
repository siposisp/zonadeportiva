"use client"

import { useState } from "react"
import CartAddButton from "@/components/features/Cart/CartAddButton"
import SecondaryButton from "@/components/common/buttons/SecondaryButton"

export default function ProductActions({ productSelection }) {
    const [errorMessage, setErrorMessage] = useState("")
    
    return (
        <div className="flex flex-col gap-2 w-full">
            <div>
                {productSelection.stock_status === "outofstock" || Object.keys(productSelection).length === 0
                    ? (
                        <div role="alert" className="alert alert-warning">
                            <svg xmlns="http://www.w3.org/2000/svg" className="h-6 w-6 shrink-0 stroke-current" fill="none" viewBox="0 0 24 24">
                                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M12 9v2m0 4h.01m-6.938 4h13.856c1.54 0 2.502-1.667 1.732-3L13.732 4c-.77-1.333-2.694-1.333-3.464 0L3.34 16c-.77 1.333.192 3 1.732 3z" />
                            </svg>
                            <span>Disponibilidad solo para cotización.</span>
                        </div>
                    ) : null
                }
                {errorMessage && (
                    <div className="mt-2 w-full">
                        <div className="alert alert-error flex items-center gap-2 w-full">
                            <svg xmlns="http://www.w3.org/2000/svg" className="h-6 w-6 shrink-0 stroke-current" fill="none" viewBox="0 0 24 24">
                                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M10 14l2-2m0 0l2-2m-2 2l-2-2m2 2l2 2m7-2a9 9 0 11-18 0 9 9 0 0118 0z" />
                            </svg>
                            <span>{errorMessage}</span>
                        </div>
                    </div>
                )}
            </div>
            <div className="flex lg:flex-col sm:flex-row flex-col gap-2">
                <CartAddButton stock={productSelection.stock} productSelection={productSelection} setErrorMessage={setErrorMessage} />
                <SecondaryButton
                    icon={
                        <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" strokeWidth={1.5} stroke="currentColor" className="size-5">
                            <path strokeLinecap="round" strokeLinejoin="round" d="M19.5 14.25v-2.625a3.375 3.375 0 0 0-3.375-3.375h-1.5A1.125 1.125 0 0 1 13.5 7.125v-1.5a3.375 3.375 0 0 0-3.375-3.375H8.25m3.75 9v6m3-3H9m1.5-12H5.625c-.621 0-1.125.504-1.125 1.125v17.25c0 .621.504 1.125 1.125 1.125h12.75c.621 0 1.125-.504 1.125-1.125V11.25a9 9 0 0 0-9-9Z" />
                        </svg>

                    }
                >
                    Cotizar
                </SecondaryButton>
            </div>
        </div>
    )
}