export default function ShippingOption({ method, isSelected, onSelect }) {
    return (
        <label
            key={method.id}
            className={`border p-4 rounded flex gap-3 cursor-pointer ${isSelected ? "border-blue-500 bg-blue-50" : "border-neutral-300"}`}
            onClick={() => onSelect(method.id)}
        >
            <input
                type="radio"
                name="shipping"
                value={method.id}
                checked={isSelected}
                readOnly
                className="mt-1 accent-blue-500"
            />
            <div className="flex flex-col">
                <span className="font-semibold">{method.name}</span>
                <span className="text-sm">{method.description}</span>
                <span className="text-sm">{method.carrier}</span>
                <span className="text-sm">
                    {method.carrier !== "Por definir" &&
                        (method.cost > 0 ? `${method.cost.toLocaleString()} CLP` : "Gratis")}
                </span>
            </div>
        </label>
    )
}