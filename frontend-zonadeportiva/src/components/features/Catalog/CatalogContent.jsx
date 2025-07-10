import CatalogHeader from "@/components/features/Catalog/CatalogHeader"
import CatalogGrid from "@/components/features/Catalog/CatalogGrid"
import CatalogPagination from "@/components/features/Catalog/CatalogPagination"

export default async function CatalogContent({ products, sort = "name_asc", page = 1, totalPages = 0, totalProducts = 0 }) {

    return (
        <div>
            {products.length > 0 && (
                    <div>
                        <CatalogHeader totalProducts={totalProducts} selectedSort={sort} />
                        <CatalogGrid products={products} />
                        <CatalogPagination currentPage={page} totalPages={totalPages} />
                    </div>
                )}
        </div>
    )
}