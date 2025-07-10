import Link from "next/link"

export default function SecondaryButton({
    children,
    icon,
    onClick,
    type = "button",
    disabled = false,
    href
}) {
    return !href ? (
        <button
            type={type}
            onClick={onClick}
            disabled={disabled}
            className="btn flex items-center justify-center gap-2 text-sm font-normal rounded-md w-full bg-neutral-100 text-neutral-700"
        >
            {children && <span>{children}</span>}
            {icon}
        </button>
    ) : (
        <Link href={href} className="btn flex items-center justify-center gap-2 text-sm font-normal rounded-md bg-neutral-100 text-neutral-700">
            {children && <span>{children}</span>}
            {icon}
        </Link>
    )
}
