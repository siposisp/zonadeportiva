"use client"

import ActionButton from "@/components/common/buttons/ActionButton"

export default function QuoteSection() {
    return (
        <div className="border border-neutral-200 rounded-box p-6">
            <div className="flex flex-col md:flex-row items-start md:items-center justify-between gap-6">
                <div className="text-neutral-900">
                    <h3 className="text-base md:text-lg font-semibold mb-1">
                        ¿Necesitas mayor stock o una cotización?
                    </h3>
                    <p className="text-sm md:text-base text-neutral-600">
                        Escríbenos para gestionar cotizaciones personalizadas para instituciones, empresas o pedidos de gran volumen.
                    </p>
                </div>
                <div className="flex flex-col sm:flex-row gap-4 w-full md:w-auto">
                    <ActionButton
                        icon={
                            <svg xmlns="http://www.w3.org/2000/svg" fill="none"
                            viewBox="0 0 24 24" strokeWidth={1.5}
                            stroke="currentColor" className="size-5">
                                <path strokeLinecap="round" strokeLinejoin="round"
                                    d="M21.75 6.75v10.5a2.25 2.25 0 0 1-2.25 2.25h-15a2.25 2.25 0 0 1-2.25-2.25V6.75m19.5 
                                    0A2.25 2.25 0 0 0 19.5 4.5h-15a2.25 2.25 0 0 0-2.25 
                                    2.25m19.5 0v.243a2.25 2.25 0 0 1-1.07 
                                    1.916l-7.5 4.615a2.25 2.25 0 0 1-2.36 
                                    0L3.32 8.91a2.25 2.25 0 0 1-1.07-1.916V6.75" />
                            </svg>
                        }
                    >
                        Enviar email
                    </ActionButton>
                    <ActionButton
                        icon={
                            <svg xmlns="http://www.w3.org/2000/svg" fill="none"
                            viewBox="0 0 24 24" strokeWidth={1.5}
                            stroke="currentColor" className="size-5">
                                <path strokeLinecap="round" strokeLinejoin="round"
                                    d="M10.5 1.5H8.25A2.25 2.25 0 0 0 6 
                                    3.75v16.5a2.25 2.25 0 0 0 2.25 
                                    2.25h7.5A2.25 2.25 0 0 0 18 
                                    20.25V3.75a2.25 2.25 0 0 0-2.25-2.25H13.5m-3 
                                    0V3h3V1.5m-3 0h3m-3 18.75h3" />
                            </svg>
                        }
                    >
                        WhatsApp
                    </ActionButton>
                </div>
            </div>
        </div>
    );
}
