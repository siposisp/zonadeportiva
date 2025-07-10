import CatalogResults from "./CatalogResults"
import CatalogSort from "./CatalogSort"

export default function CatalogHeader({ totalProducts, selectedSort  }) {
    return (
        <div className="flex justify-between items-end pb-4 border-b border-neutral-200 mb-6">
            <CatalogResults results={totalProducts} />
            {totalProducts > 0 ? <CatalogSort selected={selectedSort} /> : null}
        </div>
    )
}