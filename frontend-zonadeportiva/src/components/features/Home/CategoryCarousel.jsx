"use client";

import { useEffect, useState, useRef } from "react";
import categoryService from "@/services/categoryService";
import ProductCard from "@/components/features/Product/ProductCard";

let carouselCount = 0;

export default function CategoryCarousel({ title, category }) {
    const [slides, setSlides] = useState([]);
    const [currentIndex, setCurrentIndex] = useState(0);
    const [carouselId] = useState(() => `carousel-${carouselCount++}`);
    const trackRef = useRef(null);

    useEffect(() => {
        const fetchProducts = async () => {
            const { products } = await categoryService.getProductsByCategory({ slug: category, sort: "default" });
            const chunked = chunkArray(products || [], 4);
            setSlides(chunked);
            setCurrentIndex(0);
        };

        fetchProducts();
    }, [category]);

    const chunkArray = (array, size) =>
        Array.from({ length: Math.ceil(array.length / size) }, (_, i) =>
            array.slice(i * size, i * size + size)
        );

    const handlePrev = () => {
        if (currentIndex > 0) {
            setCurrentIndex((prev) => prev - 1);
        }
    };

    const handleNext = () => {
        if (currentIndex < slides.length - 1) {
            setCurrentIndex((prev) => prev + 1);
        }
    };

    return (
        <section className="flex flex-col gap-6 w-full overflow-hidden">
            <h2 className="text-xl font-medium border-b border-neutral-200 pb-4">{title}</h2>
            <div className="relative w-full">
                {/* Flechas visibles solo si se puede avanzar o retroceder */}
                {slides.length > 1 && (
                    <div className="absolute top-1/2 -translate-y-1/2 flex justify-between w-full z-10 px-2 sm:px-4 md:px-6">
                        <div>
                            {currentIndex > 0 && (
                                <button
                                    onClick={handlePrev}
                                    className="btn btn-circle bg-white/80 hover:bg-white border-none shadow ml-[-1rem] md:ml-[-2rem]"
                                >
                                    ❮
                                </button>
                            )}
                        </div>
                        <div>
                            {currentIndex < slides.length - 1 && (
                                <button
                                    onClick={handleNext}
                                    className="btn btn-circle bg-white/80 hover:bg-white border-none shadow mr-[-1rem] md:mr-[-2rem]"
                                >
                                    ❯
                                </button>
                            )}
                        </div>
                    </div>
                )}

                {/* Carrusel animado */}
                <div className="overflow-hidden w-full">
                    <div
                        ref={trackRef}
                        className="flex transition-transform duration-500 ease-in-out"
                        style={{
                            width: `${slides.length * 100}%`,
                            transform: `translateX(-${currentIndex * (100 / slides.length)}%)`,
                        }}
                    >
                        {slides.map((group, i) => (
                            <div
                                key={i}
                                className="w-full shrink-0 px-6 sm:px-12 h-fit"
                                style={{ width: `${100 / slides.length}%` }}
                            >
                                <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-4 gap-4">
                                    {group.map((product) => (
                                        <ProductCard key={product.id} product={product} />
                                    ))}
                                </div>
                            </div>
                        ))}
                    </div>
                </div>
            </div>
        </section>
    );
}
