export const getCart = () => {
    const storedCart = localStorage.getItem("cart")
    if (!storedCart) {
        return {
            cart_items: [],
            quantity: 0,
            total: 0
        }
    }

    try {
        return JSON.parse(storedCart)
    } catch {
        return {
            cart_items: [],
            quantity: 0,
            total: 0
        }
    }
}

export const setCart = (cart) => {
    localStorage.removeItem("cart")
    localStorage.setItem("cart", JSON.stringify(cart))
}

export const removeCart = () => {
    localStorage.removeItem("cart")
}