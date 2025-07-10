import searchService from "@/services/searchService"
import CatalogContent from "@/components/features/Catalog/CatalogContent"
import { notFound } from "next/navigation"

export default async function Search({ params, searchParams }) {
    const { keyword } = await params
    const { sort, page } = await searchParams

    console.log("Params:", keyword)
    console.log("SearchParams:", { sort, page })

    const content = {
        keyword: keyword,
        page: Number(page) || 1,
        sort: sort || 'default',
    }

    const fetchProducts = async (content) => {
        try {
            return await searchService.getSearchByKeyword(content)
        } catch (error) {
            console.error("Error fetching products:", error?.response?.status, error?.message)
            return null
        }
    }

    const response = await fetchProducts(content)

    console.log("Response from search:", response)

    if (!response) {
        notFound()
    }

    const { products, totalPages, totalProducts } = response

    return (
        <CatalogContent products={products} sort={content.sort} page={content.page} totalPages={totalPages} totalProducts={totalProducts} />
    )
}