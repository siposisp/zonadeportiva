import { formatCLP } from "@/utils/formatPrice"
import Link from "next/link";
import ProductPrice from "./ProductPrice"

export default function ProductCard({ product }) {
    const formattedProduct = {
        ...product,
        price: formatCLP(product.price),
        regular_price: formatCLP(product.regular_price),
        sale_price: formatCLP(product.sale_price),
    };
    
    return (
        <div className="h-full w-full">
            <Link href={`/${product.slug}`}>
                <div className="card border border-neutral-200 hover:border-blue-600 hover:cursor-pointer transition-colors duration-150 w-full h-full">
                    <div className="card-body p-4 md:p-6">
                        <div className="bg-neutral-100 border border-neutral-200 rounded-lg h-[12rem] md:h-[14rem] w-full transition-colors duration-100 group-hover:border-blue-600">

                        </div>
                        <h2 className="text-sm sm:text-base md:card-title font-semibold">{formattedProduct.title}</h2>
                        <ProductPrice price={formattedProduct.price} regular_price={formattedProduct.regular_price} sale_price={formattedProduct.sale_price}/>
                    </div>
                </div>
            </Link>
        </div>
    )
}