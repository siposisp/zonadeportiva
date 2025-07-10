"use client"

import { useRouter, useSearchParams } from "next/navigation"

export default function PaginationControls({ currentPage, totalPages }) {
    const router = useRouter()
    const searchParams = useSearchParams()

    const goToPage = (page) => {
        const params = new URLSearchParams(searchParams.toString())
        params.set("page", page)
        router.replace(`?${params.toString()}`)
    }

    return (
        <div className="flex justify-center join mt-6">
            <button 
                onClick={() => goToPage(currentPage - 1)}
                disabled={currentPage === 1}
                className="join-item btn"
            >
                «
            </button>
            <button className="join-item btn pointer-events-none">Página {currentPage}</button>
            <button
                onClick={() => goToPage(currentPage + 1)}
                disabled={currentPage === totalPages} 
                className="join-item btn"
            >
                »
            </button>
        </div>
    )
}