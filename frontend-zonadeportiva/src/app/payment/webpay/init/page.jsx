'use client';
export const dynamic = "force-dynamic";

import { Suspense } from "react";
import InitClient from "./InitClient";

export default function WebpayInitPage() {
    return (
        <Suspense fallback={<p className="text-sm text-neutral-600">Cargando...</p>}>
            <InitClient />
        </Suspense>
    );
}
