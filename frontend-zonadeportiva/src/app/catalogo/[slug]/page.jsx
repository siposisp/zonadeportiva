import categoryService from "@/services/categoryService"
import CatalogContent from "@/components/features/Catalog/CatalogContent"
import { notFound } from "next/navigation"

export default async function Category({ params, searchParams }) {
    const { slug } = await params
    const { page, sort } = await searchParams

    const content = {
        slug: slug,
        page: Number(page) || 1,
        sort: sort || 'default',
    }

    const fetchProducts = async (content) => {
        try {
            return await categoryService.getProductsByCategory(content)
        } catch (error) {
            console.error("Error fetching products:", error?.response?.status, error?.message)
            return null
        }
    }

    const { products, totalPages, totalProducts } = await fetchProducts(content) || {}

    if (!products) {
        notFound()
    }

    return (
        <CatalogContent products={products} sort={content.sort} page={content.page} totalPages={totalPages} totalProducts={totalProducts} />
    )
}