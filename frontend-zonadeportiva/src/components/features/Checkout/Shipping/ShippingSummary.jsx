import ActionButton from "@/components/common/buttons/ActionButton"
import { formatCLP } from "@/utils/formatPrice"

export default function ShippingSummary({ method, onEdit }) {
    return (
        <div className="flex flex-col gap-2">
            <div className="flex justify-between">
                <h2 className="md:text-lg text-base font-semibold uppercase">Opciones de entrega</h2>
            </div>
            <div className="flex justify-between gap-2 p-4 border border-neutral-300 rounded-md">
                <div className="flex flex-col gap-2 text-sm">
                    <p className="text-sm text-neutral-500 uppercase">Método seleccionado</p>
                    <div className="text-neutral-800 space-y-[2px]">
                        <p>{method.description}</p>
                        {method.carrier !== "Por definir" && (
                            <div>
                                <p>{method.carrier}</p>
                                <p>{method.cost > 0 ? `${formatCLP(method.cost)} CLP` : "Gratis"}</p>
                            </div>
                        )}
                    </div>
                </div>
                <ActionButton
                    icon={
                        <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" strokeWidth={1.5} stroke="currentColor" className="size-5">
                            <path strokeLinecap="round" strokeLinejoin="round" d="m16.862 4.487 1.687-1.688a1.875 1.875 0 1 1 2.652 2.652L10.582 16.07a4.5 4.5 0 0 1-1.897 1.13L6 18l.8-2.685a4.5 4.5 0 0 1 1.13-1.897l8.932-8.931Zm0 0L19.5 7.125M18 14v4.75A2.25 2.25 0 0 1 15.75 21H5.25A2.25 2.25 0 0 1 3 18.75V8.25A2.25 2.25 0 0 1 5.25 6H10" />
                        </svg>

                    }
                    onClick={onEdit}
                >
                    Editar
                </ActionButton>
            </div>
        </div>
    )
}
