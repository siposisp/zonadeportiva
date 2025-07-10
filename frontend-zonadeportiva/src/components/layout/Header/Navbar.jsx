import Sidebar from "./Sidebar"
import SearchBar from "@/components/features/Search/SearchBar"
import LoginButton from "@/components/features/Login/LoginButton"
import CartModal from "@/components/features/Cart/CartModal"
import Link from "next/link"

export default function Navbar() {
    return (
        <div className="flex flex-col items-center bg-base-100 border-b border-neutral-200">
            <div className="navbar max-w-7xl mx-auto">
                <div className="navbar-start flex justify-start">
                    <Sidebar />
                    <Link href="/" className="font-bold whitespace-nowrap text-lg md:text-xl lg:text-2xl">Zona Deportiva</Link>
                </div>
                <div className="navbar-center">
                    <div className="hidden md:inline">
                        <SearchBar />
                    </div>
                </div>
                <div className="navbar-end gap-2">
                    <LoginButton />
                    <CartModal />
                </div>
            </div>
            <div className="md:hidden mb-2">
                <SearchBar />
            </div>
        </div>
    )
}