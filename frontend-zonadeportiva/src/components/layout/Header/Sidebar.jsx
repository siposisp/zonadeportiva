import categoryService from "@/services/categoryService"
import DrawerLink from "./DrawerLink"

export default async function Sidebar() {
    const categories = await categoryService.getCategories();

    const excludesdCategories = [64, 540, 697, 698]

    const filtredCategories = categories.filter(category => !excludesdCategories.includes(category.parent_id))

    return (
        <div className="drawer w-12">
            <input id="my-drawer" type="checkbox" className="drawer-toggle" />
            <div className="drawer-content w-0">
                <label htmlFor="my-drawer" aria-label="open sidebar" className="btn btn-square btn-ghost">
                    <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" strokeWidth={1.5} stroke="currentColor" className="size-6">
                        <path strokeLinecap="round" strokeLinejoin="round" d="M3.75 6.75h16.5M3.75 12h16.5m-16.5 5.25h16.5" />
                    </svg>
                </label>
            </div>
            <div className="drawer-side">
                <label htmlFor="my-drawer" aria-label="close sidebar" className="drawer-overlay"></label>
                <ul className="menu bg-base-200 md:text-base text-base-content min-h-full w-80 p-4">
                    <li className="flex flex-row items-center justify-between">
                        <h1 className="font-bold text-lg md:text-xl lg:text-2xl pointer-events-none">Catálogo</h1>
                        <label htmlFor="my-drawer" aria-label="close sidebar" className="flex justify-center p-2 rotate-45 rounded-4xl">
                            <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" strokeWidth={1.5} stroke="currentColor" className="size-6">
                                <path strokeLinecap="round" strokeLinejoin="round" d="M12 4.5v15m7.5-7.5h-15" />
                            </svg>
                        </label>
                    </li>
                    <div className="pb-3 mb-3 border-b border-gray-300"></div>
                    {filtredCategories.map(category => 
                        category.subcategories.length > 0
                            ?   <li key={category.parent_id}>
                                    <details>
                                        <summary>
                                            <DrawerLink href={`/catalogo/${category.slug}`}>{category.category}</DrawerLink>
                                        </summary>
                                        <ul>
                                            {category.subcategories.map(subcategory => 
                                                <li key={subcategory.id}>
                                                    <DrawerLink href={`/catalogo/${subcategory.slug}`}>{subcategory.name}</DrawerLink>
                                                </li>
                                            )}
                                        </ul>
                                    </details>
                                </li>
                            : <li key={category.parent_id}>
                                <DrawerLink href={`/catalogo/${category.slug}`}>{category.category}</DrawerLink>
                            </li>
                    )}
                    <li><DrawerLink href="/catalogo">Todos los productos</DrawerLink></li>
                </ul>
            </div>
        </div>
    )
}