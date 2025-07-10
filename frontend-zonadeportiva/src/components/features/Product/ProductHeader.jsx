import ProductPrice from "./ProductPrice"
import { setProductPrice } from "@/utils/productUtils"

export default function ProductHeader({ product }) {
    const precios = setProductPrice(product)

    console.log("PRECIOS", precios)

    return (
        <div className="flex flex-col gap-4">
            <h2 className="md:text-2xl text-xl font-semibold">{product.title}</h2>
            <ProductPrice price={product.metadata.price} regular_price={product.metadata.regular_price} sale_price={product.metadata.sale_price}/>
        </div>
    )
}