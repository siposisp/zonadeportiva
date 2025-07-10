export default function ProductPrice({ price, regular_price, sale_price}) {
    return (
        <div>
            {sale_price ? (
                    <div className="flex flex-col gap-2">
                        <p className="text-sm md:text-base line-through text-gray-400">
                            {regular_price ? regular_price : price} CLP
                        </p>
                        <p className="text-white text-sm md:text-base bg-blue-600 px-3 py-1 w-fit rounded-3xl">
                            {sale_price} CLP
                        </p>
                    </div>
                ) : (
                    <p className="text-white text-sm md:text-base bg-blue-600 px-3 py-1 w-fit rounded-3xl">{regular_price ? regular_price : price} CLP</p>
            )}
        </div>
    )
}