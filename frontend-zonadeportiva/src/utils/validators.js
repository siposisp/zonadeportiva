function escapeRegex(str) {
    return str.replace(/[.*+?^${}()|[\]\\]/g, '\\$&');
}

export const validators = {
    first_name: {
        pattern: /^[A-Za-zÀ-ÿ\s]{3,30}$/,
        title: "Ingresa un nombre sin símbolos ni caracteres especiales.",
    },
    last_name: {
        pattern: /^[A-Za-zÀ-ÿ\s]{3,30}$/,
        title: "Ingresa apellidos sin símbolos ni caracteres especiales.",
    },
    phone: {
        pattern: /^9\d{8}$/,
        title: "Ingresa un celular válido, recuerda comenzar con 9.",
    },
    email: {
        pattern: /^[^\s@]+@[^\s@]+\.[^\s@]+$/,
        title: "Ingresa un correo válido.",
    },
    password: {
        pattern: /(?=.*\d)(?=.*[a-z])(?=.*[A-Z]).{8,}/,
        title: `La contraseña debe contener:
            - Mínimo 8 caracteres
            - Al menos una mayúscula
            - Al menos una minúscula
            - Al menos un número`,
    },
    confirm_password: {
        dynamicPattern: (context) => {
            const password = context?.password ?? ""
            const escaped = password.replace(/[.*+?^${}()|[\]\\]/g, '\\$&')
            return password ? new RegExp(`^${escaped}$`) : undefined
            },
        title: "Las contraseñas deben coincidir.",
    },
    rut: {
        pattern: /^\d{1,2}\.?\d{3}\.?\d{3}-[1-9kK]$/,
        title: "Ingresa un RUT válido.",
    },
    address: {
        pattern: /^.{5,100}$/,
        title: "Dirección entre 5 y 100 caracteres.",
    },
    number: {
        pattern: /^[0-9]{1,6}$/,
        title: "Número de dirección válido (solo dígitos).",
    },
}

export function isValidField(name, value) {
    const rule = validators[name]
    if (!rule) return true

    const matchesPattern = rule.pattern?.test(value)
    if (!matchesPattern) return false

    const validCustom = rule.custom ? rule.custom(value) : true
    return validCustom
}
