import DeleteButton from "@/components/common/buttons/DeleteButton"

export default function CheckoutAddressCard({ address, selected, onSelect, onDelete }) {
    const handleClick = () => onSelect(address)
    
    const handleDelete = (e) => {
        e.stopPropagation()
        onDelete(address.address_id)
    }

    return (
        <label
            className={`border rounded p-4 text-sm flex gap-3 items-start cursor-pointer transition-colors duration-200 ${
              selected ? "border-blue-500 bg-blue-50" : "border-neutral-300"
            }`}
            onClick={handleClick}
        >
            <input
                type="radio"
                name="addressOption"
                value={address.address_id}
                checked={selected}
                readOnly
                className="mt-1 accent-blue-500"
            />

            <div className="flex justify-between flex-1">
                <div>
                    <p className="font-bold">{address.address}, {address.number}</p>
                    <p>{address.state_name}, {address.city_name}, CL</p>
                </div>
                <DeleteButton onClick={handleDelete} />
            </div>
        </label>
    )
}
