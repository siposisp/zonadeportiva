export default function PaymentOption({ option, isSelected, onSelect }) {
    return (
        <label
          className={`border p-4 rounded flex gap-3 cursor-pointer ${isSelected ? "border-blue-500 bg-blue-50" : "border-neutral-300"}`}
          onClick={() => onSelect(option.id)}
        >
            <input
                type="radio"
                name="payment"
                value={option.id}
                checked={isSelected}
                readOnly
                className="mt-1 accent-blue-500"
            />
            <div className="flex flex-col">
                <span className="font-semibold">{option.name}</span>
                <span className="text-sm">{option.description}</span>
            </div>
        </label>
    )
}