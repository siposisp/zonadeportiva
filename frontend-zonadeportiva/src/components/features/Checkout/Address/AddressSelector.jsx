import AddressCard from "./AddressCard"
import AddressModal from "./AddressModal"
import ActionButton from "@/components/common/buttons/ActionButton"
import PrimaryButton from "@/components/common/buttons/PrimaryButton"

export default function AddressSelector({
    userAddresses,
    selectedAddressId,
    onSelect,
    onDelete,
    onAdd,
    newAddress,
    showModal,
    setShowModal,
    handleChange,
    handleSubmit,
    states,
    cities
}) {
    return (
        <div className="flex flex-col gap-4">
            <div className="flex justify-between">
                <h2 className="md:text-lg text-base font-semibold uppercase">Dirección</h2>          
            </div>
            <div>
                <ActionButton
                    icon={
                        <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" strokeWidth={1.5} stroke="currentColor" className="size-5">
                            <path strokeLinecap="round" strokeLinejoin="round" d="M12 4.5v15m7.5-7.5h-15" />
                        </svg>
                    }
                    onClick={() => setShowModal(true)}
                >
                    Añadir dirección
                </ActionButton>      
            </div>
            {userAddresses.map(addr => (
                <AddressCard
                    key={addr.address_id}
                    address={addr}
                    selected={selectedAddressId === addr.address_id}
                    onSelect={onSelect}
                    onDelete={onDelete}
                />
            ))}
            <div className="flex justify-end">
                <PrimaryButton
                    type="submit"
                    onClick={onAdd}
                    icon={
                        <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" strokeWidth={1.5} stroke="currentColor" className="size-6">
                            <path strokeLinecap="round" strokeLinejoin="round" d="M17.25 8.25 21 12m0 0-3.75 3.75M21 12H3" />
                        </svg>

                    }
                >
                    Continuar
                </PrimaryButton>
            </div>
            {showModal && (
                <AddressModal
                    newAddress={newAddress}
                    onChange={(e) => handleChange(e, true)}
                    onClose={() => setShowModal(false)}
                    onSubmit={handleSubmit}
                    states={states}
                    cities={cities}
                />
            )}
        </div>
    )
}