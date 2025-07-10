import { formatCLP } from "@/utils/formatPrice"

export default function CartHeader({ item, product }) {
    return (
        <div className="flex flex-row items-center gap-4 w-full">
            <div className="bg-neutral-100 border border-neutral-200 rounded-lg h-18 w-18">
                {/* Galería */}
            </div>
            <div className="flex flex-col gap-1 h-full flex-1 min-w-0">
                <h3 className="text-sm md:text-base font-semibold truncate">
                    {product.title}
                </h3>
                <div className="w-fit h-fit bg-blue-600 px-3 py-1 rounded-3xl">
                    <p className="md:text-sm text-xs text-white">{formatCLP(item.unit_price)} CLP</p>
                </div>
                {/* <div className="flex flex-row gap-2">
                    {item.attributes?.map((attribute) => (
                        <p key={attribute.attribute_id} className="bg-neutral-100 border border-neutral-200 w-fit px-3 py-1 rounded-md text-xs text-neutral-600 font-semibold">
                            {attribute.attribute_name.charAt(0).toUpperCase() + attribute.attribute_name.slice(1)} {attribute.value_name}
                        </p>
                    ))}
                </div> */}
            </div>
        </div>
    )
}