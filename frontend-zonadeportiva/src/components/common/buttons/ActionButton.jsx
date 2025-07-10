export default function ActionButton({
    icon,
    children,
    onClick,
    disabled = false,
}) {
    return (
        <button
            type="button"
            onClick={onClick}
            disabled={disabled}
            className="btn flex items-center gap-2 bg-white border border-neutral-300 hover:border-blue-600 hover:text-blue-600 transition-colors"
        >
            {icon}
            {children && <span>{children}</span>}
        </button>
    )
}