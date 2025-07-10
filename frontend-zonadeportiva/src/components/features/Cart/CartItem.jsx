"use client"

import { useEffect, useState } from "react"
import CartHeader from "./CartHeader"
import CartActions from "./CartActions"
import productService from "@/services/productService"

export default function CartItem({ item, onDelete, onUpdate }) {
    const [product, setProduct] = useState([])

    useEffect(() => {
        const fetchProduct = async () => {
            try {
                const { product } = await productService.getProductById(item.product_id)
                setProduct(product)
            } catch (error) {
                console.error("Error al obtener el producto:", error)
            }
        }

        fetchProduct()
    }, [item.product_id])

    const handleIncrease = async () => {
        if (onUpdate) {
            await onUpdate();
        }
    };

    return (
        <div className="flex flex-row items-start gap-4 md:py-4 py-2 w-full">
            <div className="flex-1 min-w-0">
                <CartHeader item={item} product={product} />
            </div>
            <div className="flex-shrink-0">
                <CartActions item={item} product={product} onDelete={onDelete} onUpdate={onUpdate} />
            </div>
        </div>
    )
}