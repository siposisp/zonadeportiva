"use client"

import { usePathname } from "next/navigation"
import { useState, useEffect } from "react"
import Link from "next/link"
import CartButton from "./CartButton"
import CartModalItem from "./CartModalItem"
import { getCart, setCart } from "@/utils/cartUtils"
import loginService from "@/services/loginService"
import cartService from "@/services/cartService"

export default function CartModal() {
    const pathname = usePathname()
    const isCartPage = pathname === "/carro"

    const [currentCart, setCurrentCart] = useState({
        cart_items: [],
        quantity: 0,
        total: 0
    })
    const [item, setItem] = useState(null)
    const [isOpen, setIsOpen] = useState(false)

    const loadCart = async () => {
        const isAuthenticated = await loginService.checkToken()

        if (isAuthenticated) {
            try {
                const cart = await cartService.getCart()
                setCurrentCart(cart)
            } catch (err) {
                console.error("Error cargando carrito de BD:", err)
            }
        } else {
            const existingCart = getCart()
            if (!existingCart || !existingCart.cart_items) {
                const initialCart = {
                    cart_items: [],
                    quantity: 0,
                    total: 0
                }
                setCart(initialCart)
                setCurrentCart(initialCart)
            } else {
                setCurrentCart(existingCart)
            }
        }
    }

    const handleCartUpdate = (e) => {
        loadCart()

        const actionType = e?.detail?.type
        const newItem = e?.detail?.item

        if (actionType === "add" && newItem) {
            setItem(newItem)
            setIsOpen(true)
            setTimeout(() => setIsOpen(false), 4000)
        }
    }

    useEffect(() => {
        loadCart()

        window.addEventListener("cartUpdated", handleCartUpdate)
        window.addEventListener("authChanged", loadCart)

        return () => {
            window.removeEventListener("cartUpdated", handleCartUpdate)
            window.removeEventListener("authChanged", loadCart)
        }
    }, [])

    return (
        <div className={`dropdown dropdown-end ${isOpen ? "dropdown-open" : ""}`}>
            {isOpen ? (
                <div>
                    <Link href="/carro"><CartButton cart={currentCart} /></Link>
                    <div className="menu dropdown-content dropdown-end bg-base-100 rounded-box z-1 w-80 p-4 shadow-sm md:mt-4 mt-16">
                        <CartModalItem item={item} />
                    </div>
                </div>
            ) : (
                currentCart.cart_items.length > 0
                    ? !isCartPage
                        ? <Link href="/carro"><CartButton cart={currentCart} /></Link>
                        : <CartButton cart={currentCart} />
                    : (
                        <div>
                            <CartButton cart={currentCart} />
                            <div className="menu dropdown-content dropdown-end bg-base-100 rounded-box z-1 w-80 p-4 shadow-sm md:mt-4 mt-16">
                                <p className="text-center text-gray-500">Tu carrito está vacío</p>
                            </div>
                        </div>
                    )
            )}
        </div>
    )
}
