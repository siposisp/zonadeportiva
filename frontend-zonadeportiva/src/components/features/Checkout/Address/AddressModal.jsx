"use client"
import { useEffect, useRef } from "react"
import AddressFields from "./AddressFields"

export default function AddressModal({
      newAddress,
      onChange,
      onSubmit,
      onClose,
      states,
      cities
  }) {

    const dialogRef = useRef(null)

    useEffect(() => {
        dialogRef.current?.showModal()
    }, [])

    // Validación del formulario
    const isFormValid = () => {
        return (
            newAddress.state_id &&
            newAddress.city_id &&
            newAddress.address?.trim() &&
            newAddress.number?.trim()
        )
    }

    return (
        <dialog ref={dialogRef} className="modal" onClose={onClose}>
            <div className="modal-box w-fit p-10">
                <form method="dialog">
                    <button
                        type="button"
                        className="btn btn-sm btn-circle btn-ghost absolute right-2 top-2"
                        onClick={onClose}
                    >
                        ✕
                    </button>
                </form>
                <h3 className="font-medium text-lg mb-4">Nueva dirección</h3>
                <form onSubmit={onSubmit} className="space-y-4">
                    <AddressFields
                        data={newAddress}
                        onChange={onChange}
                        states={states}
                        cities={cities}
                    />
                    <div className="flex justify-end pt-2">
                        <button
                            type="submit"
                            disabled={!isFormValid()}
                            className="btn flex justify-between items-center gap-2 md:text-sm text-xs font-normal rounded-md bg-blue-600 hover:bg-blue-700 active:bg-blue-500 text-white disabled:bg-neutral-300 disabled:text-neutral-400 w-32 px-4"
                        >
                            Continuar
                            <svg
                                xmlns="http://www.w3.org/2000/svg"
                                fill="none"
                                viewBox="0 0 24 24"
                                strokeWidth={1.5}
                                stroke="currentColor"
                                className="size-5"
                            >
                                <path
                                    strokeLinecap="round"
                                    strokeLinejoin="round"
                                    d="M17.25 8.25 21 12m0 0-3.75 3.75M21 12H3"
                                />
                            </svg>
                        </button>
                    </div>
                </form>
            </div>
        </dialog>
    )
}
