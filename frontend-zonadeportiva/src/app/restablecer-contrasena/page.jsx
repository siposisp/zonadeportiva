import ResetPasswordForm from '@/components/features/ResetPassword/ResetPasswordForm';

export default function ResetPassword() {
    return (
        <div className="flex justify-center">
            <div className="flex flex-col rounded-lg border border-neutral-200 w-lg p-12 gap-6">
                <ResetPasswordForm />
            </div>
        </div>
    )
}