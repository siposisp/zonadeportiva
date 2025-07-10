"use client";

export default function PromotionalGallery({ images, columns = 2 }) {
    return (
        <div className={`grid gap-4 ${columns === 4 ? "grid-cols-4" : "grid-cols-2"}`}>
            {images.map((src, idx) => (
                <div key={idx} className="rounded-lg overflow-hidden">
                    <img
                        src={src}
                        alt={`Promoción ${idx + 1}`}
                        className="w-full h-auto object-cover"
                    />
                </div>
            ))}
        </div>
    );
}
