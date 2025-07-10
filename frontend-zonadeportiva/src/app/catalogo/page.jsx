import productService from "@/services/productService"
import CatalogContent from "@/components/features/Catalog/CatalogContent"

export default async function Category({ searchParams }) {
    const { sort, page } = await searchParams

    let products = []
    
    const fetchProducts = async () => {
        try {
            return await productService.getProducts()
        } catch(error) {
            console.error("Error fetching products:", error?.response?.status, error?.message)
            return null
        }
    }

    products = await fetchProducts()

    if (!products) {
        notFound()
    }

    return (
        <CatalogContent products={products} sort={sort} page={page} />
    )
}