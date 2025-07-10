import Social from "./Social"
import Contact from "./Contact"
import Explore from "./Explore"

export default function Footer() {
    return (
        <footer>
            <div className="flex justify-center border-t border-neutral-200">
                <div className="grid grid-cols-1 lg:grid-cols-3 gap-y-8 px-4 py-16 w-7xl">
                    <div className="sm:col-span-2 lg:col-span-1">
                        <Social />
                    </div>
                    <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-2 sm:col-span-2 lg:col-span-2 gap-y-8">
                        <Explore />
                        <Contact />
                    </div>
                </div>
            </div>
            <div className="flex justify-center border-t border-neutral-300">
                <div className="px-4 py-6 w-7xl">
                    <aside className="md:block flex justify-center text-neutral-500 md:text-sm text-xs">
                        <p>Copyright © {new Date().getFullYear()} - All right reserved by Zona Deportiva</p>
                    </aside>
                </div>
            </div>
        </footer>
    )
}