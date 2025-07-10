'use client';
export const dynamic = "force-dynamic";

import { Suspense } from "react";
import ForgotPasswordForm from "@/components/features/ForgotPassword/ForgostPasswordForm";

export default function ForgotPassword() {
    return (
        <div className="flex justify-center">
            <div className="flex flex-col rounded-lg border border-neutral-200 w-xl p-12 gap-6">
                <Suspense fallback={<p className="text-sm text-neutral-600">Cargando formulario…</p>}>
                    <ForgotPasswordForm />
                </Suspense>
            </div>
        </div>
    );
}
