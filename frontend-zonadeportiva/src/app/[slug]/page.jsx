import ProductService from "@/services/productService"
import ProductGallery from "@/components/features/Product/ProductGallery"
import ProductDescription from "@/components/features/Product/ProductDescription"
import ProductClient from "@/components/features/Product/ProductClient"
import { notFound } from 'next/navigation'

export default async function Product({ params }) {
    const { slug } = await params

    const fetchProduct = async (slug) => {
        try {
            return await ProductService.getProductDetails(slug)
        } catch (error) {
            console.error("Error fetching product:", error?.response?.status, error?.message)
            return null
        }
    }

    const product = await fetchProduct(slug)    

    if (!product) {
        notFound()
    }

    return (
        <div className="flex justify-center">
            <div className="flex flex-col rounded-lg border border-neutral-200 w-full p-12 lg:flex-row gap-8">
                <div className="flex flex-col gap-2 h-full w-full basis-full lg:basis-4/6">
                    <ProductGallery />
                    <div className="hidden lg:inline">
                        <ProductDescription description={product.description || product.short_desc}/>
                    </div>
                </div>
                <div className="flex flex-col gap-4 basis-full lg:basis-2/6">
                    <div className="flex flex-col gap-4">
                        <h2 className="md:text-2xl text-xl font-semibold">{product.title}</h2>
                    </div>
                    <ProductClient product={product} /> 
                    <div className="inline lg:hidden">
                        <ProductDescription description={product.description || product.short_desc} />
                    </div>
                </div>
            </div>
        </div>
    )
}
