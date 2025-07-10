"use client"

import { useRouter } from "next/navigation"

export default function DrawerLink({ href, children }) {
    const router = useRouter()

    const handleClick = e => {
        e.preventDefault()
        const drawer = document.getElementById("my-drawer")
        if (drawer) drawer.checked = false
        router.push(href)
    }

    return (
        <a href={href} onClick={handleClick}>
            {children}
        </a>
    )
}