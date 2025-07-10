import InputField from "@/components/common/inputs/InputField"
import { isValidField } from "@/utils/validators"

export default function AddressFields({ data, onChange, states, cities, disabled = false }) {
    return (
        <div className="flex flex-col gap-2">
            <fieldset className="fieldset">
                <legend className="fieldset-legend md:text-sm text-xs w-full">Región</legend>
                <select 
                    defaultValue="Selecciona una región" 
                    className="select"
                    name="state_id"
                    onChange={onChange}
                    required
                    disabled={disabled}
                >
                    <option disabled={true}>Selecciona una región</option>
                    {states.map(state => (
                        <option key={state.id} value={state.id}>{state.name}</option>
                    ))}
                </select>
            </fieldset>
                            
            <fieldset className="fieldset">
                <legend className="fieldset-legend md:text-sm text-xs">Comuna</legend>
                <select 
                    defaultValue="Selecciona una comuna" 
                    className="select"
                    name="city_id"
                    onChange={onChange}
                    required
                    disabled={!data.state_id || disabled}
                >
                    <option disabled={true}>Selecciona una comuna</option>
                    {cities.map(city => (
                        <option key={city.id} value={city.id}>{city.name}</option>
                    ))}
                </select>
            </fieldset>

            <InputField
                label="Dirección"
                name="address"
                type="text"
                placeholder="Ej: Av. Siempre Viva 742"
                value={data.address}
                onChange={onChange}
                required
            />

            <InputField
                label="Número"
                name="number"
                type="text"
                placeholder="Ej: 1234"
                value={data.number}
                onChange={onChange}
                required
            />

            <InputField
                label="Información adicional"
                name="apartment"
                type="text"
                placeholder="Ej: Departamento 56, Torre B"
                value={data.apartment}
                onChange={onChange}
                required={false}
            />
        </div>
    )
}
