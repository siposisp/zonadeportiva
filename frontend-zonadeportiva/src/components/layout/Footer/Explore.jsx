import Link from "next/link"

export default function Explore() {
    return (
        <nav className="flex flex-col gap-2 text-neutral-700 sm:text-sm text-xs">
            <h6 className="sm:text-base text-sm font-semibold">Explorar</h6>
            <Link href="/" className="link link-hover">Home</Link>
            <Link href="/quienes-somos" className="link link-hover">Sobre Nosotros</Link>
            <Link href="/terminos-y-condiciones" className="link link-hover">Términos y Condiciones</Link>
            <Link href="/quienes-somos#faq" className="link link-hover">Preguntas Frecuentes</Link>
        </nav>
    )
}