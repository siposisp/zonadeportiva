import AddressFields from "./AddressFields"
import PrimaryButton from "@/components/common/buttons/PrimaryButton"

export default function AddressEditor({
    formData,
    onChange,
    onSubmit,
    formRef,
    isFormValid,
    states,
    cities
}) {
    return (
        <div>           
            <h2 className="md:text-lg text-base font-semibold uppercase">Dirección</h2>
            <form ref={formRef} onSubmit={onSubmit} className="grid grid-cols-2 gap-4">
                <AddressFields
                    data={formData}
                    onChange={onChange}
                    states={states}
                    cities={cities}
                />
                <div className="col-span-2 mt-4 flex justify-end">
                    <PrimaryButton
                        type="submit"
                        disabled={!isFormValid()}
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