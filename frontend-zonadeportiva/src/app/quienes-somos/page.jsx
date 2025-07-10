import AboutDescription from "@/components/features/About/AboutDescription"
import AboutFAQ from "@/components/features/About/AboutFAQ"

export default function AboutPage() {
    return (
        <div className="flex flex-col justify-center">
            <div className="flex flex-col gap-8 rounded-lg border border-neutral-300 w-full p-8 lg:p-12 max-w-7xl mx-auto">
                <div className="flex flex-col gap-2 px-6 lg:px-20 text-center border-b border-neutral-200 pb-8">
                    <h1 className="text-4xl font-semibold">Conoce Zona Deportiva</h1>
                    <p className="text-lg text-neutral-600">
                        Más que una tienda, un equipo comprometido con el deporte y nuestros clientes.
                    </p>
                </div>
                <AboutDescription />
                <AboutFAQ />
            </div>
        </div>
    )
}