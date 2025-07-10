import Link from "next/link";

export default function PrimaryButton({
    children,
    icon,
    iconPosition = "right",
    onClick,
    type = "button",
    disabled = false,
    href = false
}) {
    return (
        !href
            ? (
                <button
                    type={type}
                    onClick={onClick}
                    disabled={disabled}
                    className="btn text-sm font-normal rounded-md bg-blue-600 hover:bg-blue-700 active:bg-blue-600 text-white disabled:text-neutral-400 border-0"
                >
                    {iconPosition === "left" && icon}
                    {children && <span>{children}</span>}
                    {iconPosition === "right" && icon}
                </button>
            ) : (
                <Link href={href} className="btn text-sm font-normal rounded-md bg-blue-600 hover:bg-blue-700 active:bg-blue-600 text-white disabled:text-neutral-400 border-0">
                    {iconPosition === "left" && icon}
                    {children && <span>{children}</span>}
                    {iconPosition === "right" && icon}
                </Link>
            )
    )
}
