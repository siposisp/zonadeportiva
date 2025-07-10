import HomeBannerCarousel from "@/components/features/Home/HomeBannerCarousel"
import QuoteSection from "@/components/features/Home/QuoteSection"
import PromotionalGallery from "@/components/features/Home/PromotionalGallery"
import CategoryCarousel from "@/components/features/Home/CategoryCarousel"

export default function Home() {
    const banners = [
        { src: "/banners/banner-01.webp" },
        { src: "/banners/banner-02.webp" },
        { src: "/banners/banner-03.jpg" },
        { src: "/banners/banner-04.webp" },
        { src: "/banners/banner-05.webp" },
        { src: "/banners/banner-06.jpg" },
        { src: "/banners/banner-07.webp" },
    ]

    const categories = [
        { name: "Balones", slug: "balones-2" },
        { name: "Máquinas y Estructuras", slug: "maquinas-y-estructuras" },
        { name: "Accesorios Deportivos", slug: "accesorios-deportivos" },
    ]

    const images = [
        "/promotional/promotional-01.webp",
        "/promotional/promotional-02.webp",
        "/promotional/promotional-03.webp",
        "/promotional/promotional-04.webp",
        "/promotional/promotional-05.webp",
        "/promotional/promotional-06.webp"
    ];

    return (
        <div className="flex flex-col justify-center pb-4">
            <div className="flex flex-col gap-10 w-full max-w-7xl mx-auto">
                <HomeBannerCarousel banners={banners} />
                <QuoteSection />
                <CategoryCarousel title={categories[0].name} category={categories[0].slug} />
                <PromotionalGallery images={images.slice(0, 2)} columns={2} />
                <CategoryCarousel title={categories[1].name} category={categories[1].slug} />
                <PromotionalGallery images={images.slice(2, 6)} columns={4} />
                <CategoryCarousel title={categories[2].name} category={categories[2].slug} />
            </div>
        </div>
    )
}
