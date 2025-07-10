'use client';
export const dynamic = 'force-dynamic';

import { Suspense } from 'react';
import ReturnClient from './ReturnClient';

export default function WebpayReturnPage() {
    return (
        <Suspense fallback={<p className="text-sm text-neutral-600">Cargando retorno de pago…</p>}>
            <ReturnClient />
        </Suspense>
    );
}
