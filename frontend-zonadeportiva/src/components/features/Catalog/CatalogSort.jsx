"use client"

import { useRouter, useSearchParams } from "next/navigation"

export default function CatalogSort({ selected }) {
    const router = useRouter()
    const searchParams = useSearchParams()

    const handleSortChange = e => {
        const params = new URLSearchParams(searchParams.toString())
        params.set("sort", e.target.value)
        params.set("page", "1")
        router.replace(`?${params.toString()}`)
    }

    return(
        <div className="flex justify-end">
                <select
                onChange={handleSortChange}
                value={selected}
                className="select select-sm md:select-md w-40 md:w-50 border p-2 rounded"
            >
                <option value="default">Ordenar por</option>
                <option value="name_asc">Nombre (A-Z)</option>
                <option value="name_desc">Nombre (Z-A)</option>
                <option value="price_asc">Precio (menor a mayor)</option>
                <option value="price_desc">Precio (mayor a menor)</option>
            </select>
        </div>
    )
}