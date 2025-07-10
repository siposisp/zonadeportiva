"use client"

import { useEffect, useState } from "react"
import { formatCLP } from "@/utils/formatPrice"
import productService from "@/services/productService"
import PrimaryButton from "@/components/common/buttons/PrimaryButton"

export default function CartModalItem({ item }) {
    const [product, setProduct] = useState([])

    useEffect(() => {
        const fetchProduct = async () => {
            try {
                const {message, product} = await productService.getProductById(item.product_id)
                setProduct(product)
            } catch (error) {
                console.error("Error al obtener el producto:", error)
            }
        }

        fetchProduct()
    }, [])

    return (
        <div className="flex flex-col gap-2">
            <div className="overflow-y-auto max-h-60">
                <div className="flex items-center justify-between">
                    <div className="flex items-center">
                        <div className="bg-neutral-100 border border-neutral-200 rounded-lg h-16 w-16">
                            {/* Galería */}
                        </div>
                        <div className="ml-2">
                            <h3 className="text-sm font-semibold">{product.title}</h3>
                            <p className="text-sm text-gray-500">Cantidad: {item.quantity}</p>
                            <span className="text-sm font-semibold">{formatCLP(item.unit_price)}</span>
                        </div>
                    </div>
                </div>
            </div>
            <PrimaryButton
                    href={`/carro`}
            >
                Ir al carro
            </PrimaryButton>
        </div>
    )
}