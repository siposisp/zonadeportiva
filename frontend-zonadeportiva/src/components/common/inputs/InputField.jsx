import Link from "next/link"
import { validators } from "@/utils/validators"

export default function InputField({
  label,
  name,
  type = "text",
  placeholder = "",
  value,
  onChange,
  pattern,
  title,
  required = true,
  showPasswordRecovery = false,
  context = {},
  showHint = true
}) {
    const validator = validators[name] || {}

    const resolvedPattern =
        pattern || validator.dynamicPattern?.(context)?.source || validator.pattern?.source

    const inputTitle = title || validator.title

    return (
        <fieldset className="fieldset flex flex-col gap-0">
        <legend className="fieldset-legend md:text-sm text-xs flex justify-between items-center">
            {label}
            {showPasswordRecovery && name === "password" && (
            <Link
                href="/recuperar-contrasena"
                className="text-sm font-normal text-blue-600"
            >
                ¿Olvidaste tu contraseña?
            </Link>
            )}
        </legend>

        <label className="input validator flex items-center w-full">
            {name === "phone" && <span className="text-sm font-medium">+56</span>}
            <input
                className="grow"
                type={type}
                name={name}
                placeholder={placeholder}
                value={value}
                onChange={onChange}
                pattern={resolvedPattern}
                title={inputTitle}
                required={required}
            />
        </label>
        {showHint && (
            <p className="validator-hint hidden whitespace-pre-line">{inputTitle}</p>
            )}
        </fieldset>
    )
}