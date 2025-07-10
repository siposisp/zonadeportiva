"use client"

import Link from "next/link"

export default function NotFound() {
    return (
        <div className="max-w-7xl mx-auto p-4">
            <div className="flex flex-col items-center justify-center gap-2 h-80 border border-neutral-300 rounded-lg p-4">
                <h2 className="font-semibold">Página no encontrada</h2>
                <p className="text-neutral-500"> Lo sentimos, no pudimos encontrar el recurso que estás buscando.</p>
                <div className="flex justify-center">
                    <Link href="/" className="text-blue-600 text-sm hover:underline">
                        Volver al inicio
                    </Link>
                </div>
            </div>
        </div>
    )
}
