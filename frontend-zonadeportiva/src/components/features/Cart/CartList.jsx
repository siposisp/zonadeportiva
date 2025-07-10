"use client"

import CartItem from './CartItem'

export default function CartList({ cart, onDelete, onUpdate }) {
    return (
        <div className="flex flex-col gap-4">
            <h2 className="md:text-lg text-base font-semibold">Carrito de compras ({cart.quantity})</h2>
            <div className="border border-neutral-300 rounded-lg md:p-4 p-2">
                {cart.cart_items.map((item, index) => (
                    <div key={item.product_id}>
                        <CartItem item={item} onDelete={onDelete} onUpdate={onUpdate} />
                        {index < cart.cart_items.length - 1 && (
                            <div className="border-b border-neutral-300 my-4"></div>   
                        )}
                    </div>
                ))}
            </div>
        </div>
    )
}
