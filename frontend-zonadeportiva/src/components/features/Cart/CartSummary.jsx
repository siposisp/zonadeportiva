"use client"

import { formatCLP } from "@/utils/formatPrice"
import PrimaryButton from "@/components/common/buttons/PrimaryButton"
import Link from "next/link"

export default function CartSummary({ cart }) {
    return (
        <div className="flex flex-col gap-4">
            <h2 className="md:text-lg text-base font-semibold">Resumen de compras</h2>
            <div className="flex flex-col gap-4 border border-neutral-300 rounded-lg md:p-8 p-4">
                <div className="flex flex-row justify-between font-semibold border-b border-neutral-300 pb-4">
                    <p className="md:text-base text-sm text-neutral-500">Subtotal</p>
                    <p className="md:text-base text-sm">{formatCLP(cart.total)}</p>
                </div>
                <div className="flex flex-col gap-3">
                    <PrimaryButton
                        href="/checkout"
                    >
                        Continuar
                    </PrimaryButton>
                    <div className="flex justify-center">
                        <Link href="/" className="text-blue-600 md:text-sm text-xs hover:underline">
                            Seguir comprando
                        </Link>
                    </div>
                </div>
            </div>
        </div>
    )
}