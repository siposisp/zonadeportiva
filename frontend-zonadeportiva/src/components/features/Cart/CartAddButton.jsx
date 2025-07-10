"use client"

import { getCart, setCart } from "@/utils/cartUtils"
import cartService from "@/services/cartService"
import loginService from "@/services/loginService"
import PrimaryButton from "@/components/common/buttons/PrimaryButton"

export default function CartAddButton({ stock, productSelection, setErrorMessage }) {
    const handleAddToCart = async () => {
        try {
            const isAuthenticated = await loginService.checkToken();
            const currentCart = isAuthenticated ? null : getCart();

            const { cart, item } = await cartService.addToCart(
                currentCart,
                productSelection.product_id,
                productSelection.quantity
            );

            if (!isAuthenticated) {
                setCart(cart);
            }

            window.dispatchEvent(new CustomEvent("cartUpdated", { detail: { type: "add" , item } }))
        } catch (error) {
            setErrorMessage("Ya alcanzaste la cantidad máxima permitida para este producto en tu carrito.");
            setTimeout(() => setErrorMessage(""), 12000);
        }
    };

    return (
        <PrimaryButton
            onClick={handleAddToCart}
            disabled={!stock}
            icon={
                <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" strokeWidth={1.5} stroke="currentColor" className="size-5">
                    <path strokeLinecap="round" strokeLinejoin="round" d="M15.75 10.5V6a3.75 3.75 0 1 0-7.5 0v4.5m11.356-1.993 1.263 12c.07.665-.45 1.243-1.119 1.243H4.25a1.125 1.125 0 0 1-1.12-1.243l1.264-12A1.125 1.125 0 0 1 5.513 7.5h12.974c.576 0 1.059.435 1.119 1.007ZM8.625 10.5a.375.375 0 1 1-.75 0 .375.375 0 0 1 .75 0Zm7.5 0a.375.375 0 1 1-.75 0 .375.375 0 0 1 .75 0Z" />
                </svg>
            }
        >
            Agregar
        </PrimaryButton>
    )
}