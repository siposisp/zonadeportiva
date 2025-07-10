import ProductCard from "../Product/ProductCard"

export default function CatalogGrid({ products }) {
    return (
        <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-4 gap-2 md:gap-4 auto-rows-[22rem] md:auto-rows-[26rem]">
            {products.map(product => 
                product.visibility === 'visible' 
                    && <div key={product.id} className="flex h-full"><ProductCard product={product}/></div>
            )}
        </div>
    )
}