import RegisterForm from "@/components/features/Register/RegisterForm"

export default function Register() {
    return (
        <div className="flex justify-center">
            <div className="flex flex-col rounded-lg border border-neutral-200 w-3xl p-12 gap-6">
                <div className="flex flex-col items-center gap-2">
                    <svg
                        xmlns="http://www.w3.org/2000/svg"
                        fill="none"
                        viewBox="0 0 24 24"
                        strokeWidth={1.5}
                        stroke="currentColor"
                        className="size-12 text-blue-600"
                    >
                        <path
                        strokeLinecap="round"
                        strokeLinejoin="round"
                        d="M17.982 18.725A7.488 7.488 0 0 0 12 15.75a7.488 7.488 0 0 0-5.982 2.975m11.963 0a9 9 0 1 0-11.963 0m11.963 0A8.966 8.966 0 0 1 12 21a8.966 8.966 0 0 1-5.982-2.275M15 9.75a3 3 0 1 1-6 0 3 3 0 0 1 6 0Z"
                        />
                    </svg>
                    <h2 className="text-xl font-semibold">Crea tu cuenta</h2>
                </div>

                <RegisterForm />
            </div>
        </div>
    )
}        