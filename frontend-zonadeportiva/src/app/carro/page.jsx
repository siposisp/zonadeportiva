"use client"

import { useEffect, useState } from "react"
import CartList from "@/components/features/cart/CartList"
import CartSummary from "@/components/features/cart/CartSummary"
import Link from "next/link"
import { getCart, setCart } from "@/utils/cartUtils"
import cartService from "@/services/cartService"
import loginService from "@/services/loginService"

export default function Cart() {
    const [currentCart, setCurrentCart] = useState({
        cart_items: [],
        quantity: 0,
        total: 0
    })

    const loadCart = async () => {
        const isAuthenticated = await loginService.checkToken()

        if (isAuthenticated) {
            try {
                const cart = await cartService.getCart()
                setCurrentCart(cart)
            } catch (error) {
                console.error("Error cargando carrito de BD:", error)
            }
        } else {
            const localCart = getCart()
            setCurrentCart(localCart || { cart_items: [], quantity: 0, total: 0 })
        }
    }

    useEffect(() => {
        loadCart()
    }, [])

    const handleDeleteItem = async (product_id) => {
        const { cart } = await cartService.removeFromCart(currentCart, product_id)

        setCart(cart || { cart_items: [], quantity: 0, total: 0 })
        setCurrentCart(cart)
        window.dispatchEvent(new CustomEvent("cartUpdated", { detail: { type: "remove" } }))
    }

    const handleUpdateItem = async () => {
        const isAuthenticated = await loginService.checkToken()

        if (isAuthenticated) {
            const cart = await cartService.getCart()
            setCurrentCart(cart)
        } else {
            const cart = getCart()
            setCurrentCart(cart)
        }

        window.dispatchEvent(new CustomEvent("cartUpdated", { detail: { type: "update" } }))
    }

    console.log("CURRENTCART", currentCart)

    return (
        currentCart.cart_items.length > 0
            ? (
                <div className="grid lg:grid-cols-6 grid-cols-4 gap-6">
                    <div className="md:col-span-4 col-span-4">
                        <CartList cart={currentCart} onDelete={handleDeleteItem} onUpdate={handleUpdateItem} />
                    </div>
                    <div className="lg:col-span-2 col-span-4">
                        <CartSummary cart={currentCart} />
                    </div>
                </div>
            ) : (
                <div className="flex flex-col items-center justify-center gap-2 h-80 border border-neutral-300 rounded-lg p-4">
                    <h2 className="font-semibold">Tu carrito está vacío</h2>
                    <p className="text-neutral-500">Agrega productos para ver el resumen aquí.</p>
                    <div className="flex justify-center">
                        <Link href="/" className="text-blue-600 text-sm hover:underline">
                            Seguir comprando
                        </Link>
                    </div>
                </div>
            )
    )
}
