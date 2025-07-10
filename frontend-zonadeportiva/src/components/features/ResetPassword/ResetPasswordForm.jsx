"use client"

import { useState, useRef, Suspense } from "react"
import { useRouter } from "next/navigation"
import accountService from "@/services/accountService"
import InputField from "@/components/common/inputs/InputField"
import PrimaryButton from "@/components/common/buttons/PrimaryButton"
import ParamsTokenReader from "./ParamsTokenReader"

export default function ResetPasswordForm() {
  const [password, setPassword] = useState("")
  const [confirmPassword, setConfirmPassword] = useState("")
  const [submitted, setSubmitted] = useState(false)
  const [token, setToken] = useState("")
  const formRef = useRef(null)
  const router = useRouter()

  const isFormValid = () =>
    password.trim() !== "" &&
    confirmPassword.trim() !== "" &&
    (formRef.current?.checkValidity() ?? false)

  const handleToken = (tokenFromUrl) => {
    setToken(tokenFromUrl)
  }

  const handleSubmit = async (e) => {
    e.preventDefault()
    try {
      await accountService.resetPassword(token, password)
      setSubmitted(true)
      setTimeout(() => router.push("/login"), 3000)
    } catch (error) {
      alert("Ocurrió un error al cambiar la contraseña. Intenta nuevamente.")
      console.error("Reset error:", error)
    }
  }

  if (submitted) {
    return (
      <div className="flex flex-col gap-2 max-w-md mx-auto text-center">
        <h2 className="text-2xl font-bold">¡Contraseña actualizada!</h2>
        <p className="text-neutral-600">
          Tu contraseña fue cambiada exitosamente. Serás redirigido al inicio de sesión...
        </p>
      </div>
    )
  }

  return (
    <form ref={formRef} onSubmit={handleSubmit} className="flex flex-col gap-4">
      <Suspense fallback={null}>
        <ParamsTokenReader onToken={handleToken} />
      </Suspense>

      <div className="flex flex-col gap-2 border-b border-neutral-200 pb-4">
        <h2 className="text-2xl font-bold">Restablecer contraseña</h2>
        <p className="text-sm text-neutral-600">
          Ingresa y confirma tu nueva contraseña.
        </p>
      </div>

      <InputField
        label="Nueva contraseña"
        name="password"
        type="password"
        placeholder="Ingresa tu nueva contraseña"
        value={password}
        onChange={(e) => setPassword(e.target.value)}
        required
      />

      <InputField
        label="Confirmar contraseña"
        name="confirm_password"
        type="password"
        placeholder="Confirma tu nueva contraseña"
        value={confirmPassword}
        onChange={(e) => setConfirmPassword(e.target.value)}
        required
        context={{ password }}
      />

      <div className="flex justify-end">
        <PrimaryButton type="submit" disabled={!isFormValid()}>
          Cambiar contraseña
        </PrimaryButton>
      </div>
    </form>
  )
}
