"use client"

import { useState, useEffect } from "react"

export default function HomeBannerCarousel({ banners }) {
    const [activeIndex, setActiveIndex] = useState(1)
    const [isTransitioning, setIsTransitioning] = useState(false)

    const extendedBanners = [banners[banners.length - 1], ...banners, banners[0]]

    useEffect(() => {
        const interval = setInterval(() => {
            handleNextClick()
        }, 5000)
        return () => clearInterval(interval)
    }, [activeIndex])
    const handleDotClick = (index) => {
        if (isTransitioning) return
        setActiveIndex(index + 1)
    }

    const handlePrevClick = () => {
        if (isTransitioning) return
        
        setIsTransitioning(true)
        setActiveIndex(prev => prev - 1)
        
        setTimeout(() => {
            if (activeIndex - 1 === 0) {
                setActiveIndex(banners.length)
            }
            setIsTransitioning(false)
        }, 500)
    }

    const handleNextClick = () => {
        if (isTransitioning) return
        
        setIsTransitioning(true)
        setActiveIndex(prev => prev + 1)
        
        setTimeout(() => {
            if (activeIndex + 1 === extendedBanners.length - 1) {
                setActiveIndex(1)
            }
            setIsTransitioning(false)
        }, 500)
    }

    return (
        <div className="flex flex-col gap-4 w-full">
            <div className="relative overflow-hidden rounded-lg">
                <div 
                    className={`flex w-full ${isTransitioning ? 'transition-transform duration-500 ease-in-out' : ''}`}
                    style={{ transform: `translateX(-${activeIndex * 100}%)` }}
                >
                    {extendedBanners.map((banner, index) => (
                        <div key={index} className="w-full flex-shrink-0">
                            <img
                                src={banner.src}
                                alt={`Banner ${((index - 1 + banners.length) % banners.length) + 1}`}
                                className="w-full h-auto object-cover"
                            />
                        </div>
                    ))}
                </div>
                <div className="absolute left-5 right-5 top-1/2 flex -translate-y-1/2 transform justify-between pointer-events-none">
                    <button
                        className="btn btn-circle pointer-events-auto bg-white/80 hover:bg-white border-none shadow-lg"
                        onClick={handlePrevClick}
                        aria-label="Imagen anterior"
                    >
                        ❮
                    </button>
                    <button
                        className="btn btn-circle pointer-events-auto bg-white/80 hover:bg-white border-none shadow-lg"
                        onClick={handleNextClick}
                        aria-label="Imagen siguiente"
                    >
                        ❯
                    </button>
                </div>
            </div>
            <div className="flex w-full justify-center gap-3">
                {banners.map((_, index) => (
                    <button
                        key={index}
                        onClick={() => handleDotClick(index)}
                        className={`w-2 h-2 rounded-full transition-all duration-300 cursor-pointer ${
                            activeIndex === index + 1
                                ? 'bg-blue-500 scale-125' 
                                : 'bg-blue-200 hover:bg-base-content/20'
                        }`}
                        aria-label={`Ir a imagen ${index + 1}`}
                    />
                ))}
            </div>
        </div>
    )
}