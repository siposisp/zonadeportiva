"use client"

import { useState, useEffect } from "react"
import { setProductPrice } from "@/utils/productUtils"

export default function ProductQuantitySelector({ productSelection, setProductSelection }) {
    const [quantity, setQuantity] = useState(productSelection.quantity)

    useEffect(() => {
        setQuantity(productSelection.quantity)
    }, [productSelection.product_id])

    const handleDecrement = () => {
        if (quantity > 1) {
            const newQuantity = quantity - 1

            setQuantity(newQuantity)
            setProductSelection({
                ...productSelection,
                quantity: newQuantity,
                total: setProductPrice(productSelection) * newQuantity
            })
        }
    }

    const handleIncrement = () => {
        if (quantity < productSelection.stock) {
            const newQuantity = quantity + 1

            setQuantity(newQuantity)
            setProductSelection({
                ...productSelection,
                quantity: newQuantity,
                total: setProductPrice(productSelection) * newQuantity
            })
        }
    }

    return (
        <div className="flex items-center">
            <h6 className="text-sm mr-4">Cantidad</h6>
            <button
                type="button"
                className="btn btn-sm rounded-none rounded-bl-2xl rounded-tl-2xl border border-neutral-300 flex items-center justify-center text-lg"
                onClick={handleDecrement}
                disabled={quantity === 1 || !productSelection.stock}
            >
                <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" strokeWidth={1.5} stroke="currentColor" className="size-4">
                    <path strokeLinecap="round" strokeLinejoin="round" d="M5 12h14" />
                </svg>
            </button>
            <span className="text-sm md:text-base flex items-center justify-center border-y border-neutral-300 md:w-10 w-8 h-full text-center">
                {quantity}
            </span>
            <button
                type="button"
                className="btn btn-sm rounded-none rounded-br-2xl rounded-tr-2xl border border-neutral-300 text-lg"
                onClick={handleIncrement}
                disabled={quantity === productSelection.stock || !productSelection.stock}
            >
                <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" strokeWidth={1.5} stroke="currentColor" className="size-4">
                    <path strokeLinecap="round" strokeLinejoin="round" d="M12 4.5v15m7.5-7.5h-15" />
                </svg>
            </button>
        </div>
    )
}