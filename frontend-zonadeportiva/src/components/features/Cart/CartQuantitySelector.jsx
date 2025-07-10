"use client"

import { useState, useEffect } from "react"
import { getCart, setCart } from "@/utils/cartUtils"
import cartService from "@/services/cartService"
import loginService from "@/services/loginService"

export default function CartQuantitySelector({ item, product, onUpdate }) {
    const [quantity, setQuantity] = useState(item.quantity)

    useEffect(() => {
        setQuantity(item.quantity)
    }, [item.quantity])

    const handleQuantityChange = async (delta) => {
        try {
            const isAuthenticated = await loginService.checkToken()
            const currentCart = isAuthenticated ? null : getCart()

            const { cart: updatedCart, item: updatedItem } = await cartService.addToCart(
                currentCart,
                item.product_id,
                delta
            )

            if (!isAuthenticated) {
                setCart(updatedCart)
            }

            setQuantity(updatedItem.quantity)

            window.dispatchEvent(new CustomEvent("cartUpdated", {
                detail: { type: "update", item: updatedItem }
            }))

            if (onUpdate) {
                await onUpdate()
            }

        } catch (error) {
            console.error("Error al actualizar la cantidad del producto:", error)
        }
    }

    return (
        <div className="flex flex-col-reverse items-center gap-1">
            <button
                type="button"
                className="btn btn-xs btn-circle rounded-full border border-neutral-300 flex items-center justify-center p-0"
                onClick={() => handleQuantityChange(-1)}
                disabled={quantity === 1}
            >
                <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" strokeWidth={1.5} stroke="currentColor" className="size-3 rotate-180">
                    <path strokeLinecap="round" strokeLinejoin="round" d="m4.5 15.75 7.5-7.5 7.5 7.5" />
                </svg>
            </button>
            <span className="flex items-center justify-center md:w-10 w-8 h-full text-center text-sm">
                {quantity}
            </span>
            <button
                type="button"
                className="btn btn-xs btn-circle rounded-full border border-neutral-300 flex items-center justify-center"
                onClick={() => handleQuantityChange(1)}
                disabled={quantity === product?.metadata?.stock}
            >
                <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" strokeWidth={1.5} stroke="currentColor" className="size-3">
                    <path strokeLinecap="round" strokeLinejoin="round" d="m4.5 15.75 7.5-7.5 7.5 7.5" />
                </svg>
            </button>
        </div>
    )
}
