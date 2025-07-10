import LoginForm from "@/components/features/Login/LoginForm"

export default function Login() {
    return (
        <div className="flex justify-center">
            <div className="flex flex-col rounded-lg border border-neutral-200 w-md p-12 gap-6">
                <div className="flex flex-col items-center gap-2">
                    <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" strokeWidth={1.5} stroke="currentColor" className="size-10 text-blue-600">
                        <path strokeLinecap="round" strokeLinejoin="round" d="M8.25 9V5.25A2.25 2.25 0 0 1 10.5 3h6a2.25 2.25 0 0 1 2.25 2.25v13.5A2.25 2.25 0 0 1 16.5 21h-6a2.25 2.25 0 0 1-2.25-2.25V15M12 9l3 3m0 0-3 3m3-3H2.25" />
                    </svg>
                    <div className="flex flex-col items-center gap-1">
                        <h2 className="text-xl font-semibold">¡Bienvenido!</h2>
                        <p>Inicia sesión con tu cuenta</p>
                    </div>
                </div>

                <LoginForm />
            </div>
        </div>
    )
}