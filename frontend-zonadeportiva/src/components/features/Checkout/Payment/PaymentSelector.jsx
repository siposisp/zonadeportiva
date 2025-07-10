import PaymentOption from "./PaymentOption"
import PrimaryButton from "@/components/common/buttons/PrimaryButton"

export default function PaymentSelector({ options, selectedMethod, onSelect, onSubmit }) {
    return (
        <div className="flex flex-col gap-6">
            <h2 className="md:text-lg text-base font-semibold uppercase">Método de pago</h2>
            <form onSubmit={onSubmit} className="space-y-4">
                {options.map(option => (
                    <PaymentOption
                        key={option.id}
                        option={option}
                        isSelected={selectedMethod === option.id}
                        onSelect={onSelect}
                    />
                ))}
                <div className="flex justify-end">
                    <PrimaryButton
                        type="submit"
                        disabled={!selectedMethod}
                        icon={
                            <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" strokeWidth={1.5} stroke="currentColor" className="size-6">
                                <path strokeLinecap="round" strokeLinejoin="round" d="M17.25 8.25 21 12m0 0-3.75 3.75M21 12H3" />
                            </svg>

                        }
                    >
                        Continuar
                    </PrimaryButton>
                </div>
            </form>
        </div>
    )
}