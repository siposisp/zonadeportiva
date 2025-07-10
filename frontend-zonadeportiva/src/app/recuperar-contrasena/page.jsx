import ForgotPasswordForm from "@/components/features/ForgotPassword/ForgostPasswordForm"

export default function ForgotPassword() {
    return (
        <div className="flex justify-center">
            <div className="flex flex-col rounded-lg border border-neutral-200 w-xl p-12 gap-6">
                <ForgotPasswordForm />
            </div>
        </div>
    )
}