import PrimaryButton from "@/components/common/buttons/PrimaryButton"
import InputField from "@/components/common/inputs/InputField"

export default function ContactFormEditor({
    formRef,
    formData,
    onChange,
    onSubmit,
    isFormValid
}) {
    return (
        <div>
            <h2 className="md:text-lg text-base font-semibold uppercase">Contacto</h2>
            <form ref={formRef} onSubmit={onSubmit} className="grid grid-cols-2 gap-4">
                <InputField
                    label="Correo electrónico"
                    name="email"
                    type="email"
                    placeholder="Ingresa tu correo electrónico"
                    value={formData.email}
                    onChange={onChange}
                />
                <div></div>

                <InputField
                    label="Nombre"
                    name="first_name"
                    type="text"
                    placeholder="Ingresa tu nombre"
                    value={formData.first_name}
                    onChange={onChange}
                />

                <InputField
                    label="Apellido"
                    name="last_name"
                    type="text"
                    placeholder="Ingresa tu apellido"
                    value={formData.last_name}
                    onChange={onChange}
                />

                <InputField
                    label="Teléfono"
                    name="phone"
                    type="tel"
                    placeholder="9 1234 5678"
                    value={formData.phone}
                    onChange={onChange}
                />

                <InputField
                    label="RUT"
                    name="rut"
                    type="text"
                    placeholder="12.345.678-9"
                    value={formData.rut}
                    onChange={onChange}
                />

                <div className="col-span-2 flex justify-end">
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