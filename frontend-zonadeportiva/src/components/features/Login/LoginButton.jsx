"use client"

import Link from "next/link"
import { usePathname, useRouter } from "next/navigation"
import { useEffect, useState } from "react"
import loginService from "@/services/loginService"
import SecondaryButton from "@/components/common/buttons/SecondaryButton"

export default function LoginButton() {
    const pathname = usePathname()
    const router = useRouter()

    const [isAuthenticated, setIsAuthenticated] = useState(false)

    const handleLogout = async () => {
        try {
            await loginService.logoutUser()

            window.dispatchEvent(new Event("authChanged"))
            router.replace("/")
        } catch (error) {
            console.error("Error al cerrar sesión:", error)
        }
    }

    const checkAuth = async () => {
        try {
            const isAuthenticated = await loginService.checkToken()
            setIsAuthenticated(isAuthenticated === true)
        } catch (error) {
            console.warn("Sesión inválida o expirada.")
            setIsAuthenticated(false)
        }
    }

    useEffect(() => {
        checkAuth()

        window.addEventListener("authChanged", checkAuth)
        return () => {
            window.removeEventListener("authChanged", checkAuth)
        }
    }, [])


    if (!isAuthenticated) {
        return pathname === "/login" ? (
            <SecondaryButton
                href={"/"}
            >
                Volver al Inicio
            </SecondaryButton>
        ) : (
            <SecondaryButton
                href={"/login"}
            >
                Iniciar sesión
            </SecondaryButton>
        )
    }

    return (
        <div className="dropdown dropdown-end">
            <div tabIndex={0} role="button" className="btn btn-ghost m-1">
                Mi cuenta
                <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" strokeWidth={1.5} stroke="currentColor" className="size-4">
                    <path strokeLinecap="round" strokeLinejoin="round" d="m19.5 8.25-7.5 7.5-7.5-7.5" />
                </svg>
            </div>
            <ul tabIndex={0} className="dropdown-content menu bg-base-100 rounded-box z-1 w-52 p-2 shadow-sm mt-2">
                <li><Link href={"/"}>Perfil</Link></li>
                <li><Link href={"/"}>Mis compras</Link></li>
                <li><Link href={"/"} onClick={handleLogout}>Cerrar sesión</Link></li>
            </ul>
        </div>
    )
}