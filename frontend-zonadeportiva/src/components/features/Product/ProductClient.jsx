"use client"

import { useState, useEffect } from "react"
import productService from "@/services/productService"
import ProductPrice from "@/components/features/Product/ProductPrice"
import ProductQuantitySelector from "@/components/features/Product/ProductQuantitySelector"
import ProductAttribute from "@/components/features/Product/ProductAttribute"
import ProductActions from "@/components/features/Product/ProductActions"
import { getFirstAvailableVariant, getSimpleProductSelection } from "@/utils/productUtils"
import { formatCLP } from "@/utils/formatPrice"

export default function ProductClient({ product }) {
    const [productSelection, setProductSelection] = useState({})
    const [combinations, setCombinations] = useState([])

    const fetchVariants = async (slug) => {
        try {
            return await productService.getVariants(slug)
        } catch (error) {
            console.error("Error fetching variants:", error?.response?.status, error?.message)
            return null
        }
    }

    useEffect(() => {
        const handleDefaultProductSelection = async () => {
            setProductSelection(getSimpleProductSelection(product))

            if (product.variants) {
                const variants = await fetchVariants(product.slug)
                setCombinations(variants)

                const { variant, attributes } = getFirstAvailableVariant(product, variants)

                if (variant) {
                    setProductSelection({
                        ...variant,
                        attributes,
                    })
                }
            }
        }

        handleDefaultProductSelection()
    }, [])

    return (
        <div className="flex flex-col gap-4">
            <ProductPrice price={formatCLP(productSelection.metadata?.price)} regular_price={formatCLP(productSelection.metadata?.regular_price)} sale_price={formatCLP(productSelection.metadata?.sale_price)}/>
            <div className='border-t border-neutral-200 my-2'></div>
            <ProductQuantitySelector 
                stock={product.metadata.stock} 
                variants={product.variants} 
                productSelection={productSelection} 
                setProductSelection={setProductSelection} 
                />
            {product.variants && 
                <ProductAttribute 
                    variants={product.variants}
                    productSelection={productSelection} 
                    setProductSelection={setProductSelection}
                    combinations={combinations}
                />
            }
            <ProductActions 
                product={product}
                variants={product.variants} 
                productSelection={productSelection} 
            />
        </div>
    )
}