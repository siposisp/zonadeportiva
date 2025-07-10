"use client"

import { findFirstInStock, getDefaultAttributesForMainVariant, getSelectedItem, getUpdatedAttributes  } from "@/utils/productUtils"

const MAIN_ATTRIBUTE = "color"

export default function ProductAttribute({ variants, productSelection, setProductSelection, combinations }) {
    const isMultipleAttributes = variants.some(variant => variant.attribute_name === MAIN_ATTRIBUTE) && variants.length > 1

    const handleClick = (variant, value) => {
        setProductSelection((prev) => {
            const shouldReset = variant.attribute_name === MAIN_ATTRIBUTE
            const defaultAttributes = shouldReset && isMultipleAttributes
                ? getDefaultAttributesForMainVariant(
                    findFirstInStock(value.items),
                    variant,
                    combinations
                ) : []

            const selectedItem = getSelectedItem(variant, value, prev.attributes)
            if (!selectedItem) return prev

            return {
                ...prev,
                product_id: selectedItem.product_id,
                slug: selectedItem.slug,
                stock: selectedItem.stock,
                stock_status: selectedItem.stock_status,
                quantity: selectedItem.stock ? 1 : 0,
                attributes: getUpdatedAttributes(variant, value, prev.attributes, shouldReset, defaultAttributes)
            }
        })
    }

    return (
        variants.map(variant =>
            <div key={variant.attribute_id}>
                <div className="flex flex-col gap-2">
                    <div className="text-sm">
                        {variant.attribute_name.charAt(0).toUpperCase() + variant.attribute_name.slice(1)}
                    </div>
                    <div className="grid grid-cols-5 gap-2 w-sm">
                        {variant.values.map(value => 
                            <button
                                type="button"
                                className={`btn flex justify-center items-center text-xs font-semibold py-3 rounded-none cursor-pointer ${
                                productSelection.attributes?.find(
                                    attr => attr.attribute_id === variant.attribute_id && attr.value_id === value.value_id
                                )
                                    ? "bg-blue-600 text-white"
                                    : "border-neutral-600 bg-transparent"
                                } disabled:border-none`}
                                key={value.value_id}
                                onClick={() => {
                                    handleClick(variant, value)}
                                }
                                    
                                disabled={isMultipleAttributes && variant.attribute_name !== MAIN_ATTRIBUTE
                                    ? value.items.every(v =>
                                        v.stock_status === "outofstock" || !productSelection.attributes?.find(attr =>
                                            attr.attribute_name === MAIN_ATTRIBUTE &&
                                            variants.find(a => a.attribute_name === MAIN_ATTRIBUTE)?.values.some(mainVal =>
                                                mainVal.product_id === v.product_id &&
                                                mainVal.value_id === attr.value_id
                                            )
                                        )
                                    )
                                    : value.items.every(v => v.stock_status === "outofstock")   
                                }
                            >
                                {value.value}
                            </button>
                        )}
                    </div>
                </div>
            </div>
        )
    )
}