"use client"

import { useState } from "react"
import { useRouter } from "next/navigation"

export default function SearchBar() {
    const [keyword, setKeyword] = useState("")
    const router = useRouter()

    const handleSearch = () => {
        const trimmed = keyword.trim()
        if (!trimmed) return

        const defaultSort = "name_asc"
        const defaultPage = 1

        router.push(`/search/${encodeURIComponent(trimmed)}?sort=${defaultSort}&page=${defaultPage}`)
    }

    const handleKeyDown = (e) => {
        if (e.key === "Enter") {
            handleSearch()
        }
    }

    return (
        <label className="input md:w-sm w-xs">
            <input
                type="search"
                className="grow"
                placeholder="Buscar productos"
                value={keyword}
                onChange={e => setKeyword(e.target.value)}
                onKeyDown={handleKeyDown}
            />
            <button onClick={handleSearch}>
                <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" strokeWidth={1.5} stroke="currentColor" className="size-6 cursor-pointer">
                    <path strokeLinecap="round" strokeLinejoin="round" d="m21 21-5.197-5.197m0 0A7.5 7.5 0 1 0 5.196 5.196a7.5 7.5 0 0 0 10.607 10.607Z" />
                </svg>
            </button>
        </label>
    )
}