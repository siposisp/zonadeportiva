import { pool } from '../../database/connectionPostgreSQL.js'

const createCart = async (user_id) => {
    try {
        const customer_id = await getCustomerIdByUserId(user_id)

        const exists = await pool.query(`SELECT * FROM carts WHERE customer_id = $1`, [customer_id])
        if (exists.rows.length > 0) {
            return exists.rows[0]
        }

        const cartQuery = `
            INSERT INTO carts (customer_id, total, quantity)
            VALUES ($1, $2, $3)
            RETURNING *`

        const cartInsert = await pool.query(cartQuery, [customer_id, 0, 0])

        return cartInsert.rows[0]

    } catch (error) {
        console.log(error)
        throw new Error('Error al crear el carrito')
    }
}

const getCart = async (user_id) => {
    try {
        const customer_id = await getCustomerIdByUserId(user_id)

        const cartQuery = `SELECT * FROM carts WHERE customer_id = $1`
        const cartSearch = await pool.query(cartQuery, [customer_id])

        if (cartSearch.rows.length === 0) {
            return null
        }

        const cart = cartSearch.rows[0]

        const cartItemsQuery = `SELECT * FROM cart_items WHERE cart_id = $1`
        const cartItemsSearch = await pool.query(cartItemsQuery, [cart.id])

        return {
            ...cart,
            cart_items: cartItemsSearch.rows
        }

    } catch (error) {
        console.log(error)
        throw new Error('Error al obtener el carrito')
    }
}

const saveCart = async (cart_id, cart_items) => {
    try {
        await pool.query('DELETE FROM cart_items WHERE cart_id = $1', [cart_id])
        
        for (const item of cart_items) {
            const { product_id, quantity, unit_price, total_price } = item

            const query = `INSERT INTO cart_items (cart_id, product_id, quantity, unit_price, total_price)
                           VALUES ($1, $2, $3, $4, $5)`
            await pool.query(query, [cart_id, product_id, quantity, unit_price, total_price])
        }

        // 🔄 Actualizar los campos quantity y total en la tabla carts
        const totalQuantity = cart_items.reduce((sum, item) => sum + item.quantity, 0)
        const totalPrice = cart_items.reduce((sum, item) => sum + item.total_price, 0)

        await pool.query(
            'UPDATE carts SET quantity = $1, total = $2 WHERE id = $3',
            [totalQuantity, totalPrice, cart_id]
        )

        return { message: 'Carrito actualizado correctamente' }
    } catch (error) {
        console.log(error)
        throw new Error('Error al guardar el carrito')
    }
}

const removeFromCart = async (cart_id, product_id) => {
    try {
        const deleteQuery = `DELETE FROM cart_items WHERE cart_id = $1 AND product_id = $2 RETURNING *`
        const deleteResult = await pool.query(deleteQuery, [cart_id, product_id])

        return deleteResult.rows[0]
    } catch (error) {
        console.log(error)
        throw new Error('Error al eliminar del carrito')
    }
}

// Mover a service de productos
const getProduct = async (product_id) => {
    try {
        const productQuery = `SELECT * FROM products WHERE id = $1`
        const productSearch = await pool.query(productQuery, [product_id])

        const productMetadataQuery = `SELECT * FROM product_meta WHERE product_id = $1`
        const productMetadataSearch = await pool.query(productMetadataQuery, [product_id])

        return {
            ...productSearch.rows[0],
            metadata: productMetadataSearch.rows[0]
        }
    } catch (error) {
        console.log(error)
        throw new Error('Error al obtener el producto')
    }
}

// Mover a service customers
const getCustomerIdByUserId = async (user_id) => {
    try {
        const query = `SELECT id FROM customers WHERE user_id = $1`
        const result = await pool.query(query, [user_id])

        if (result.rows.length === 0) {
            throw new Error('Cliente no encontrado')
        }

        return result.rows[0].id
    } catch (error) {
        console.log(error)
        throw new Error('Error al obtener el customer_id')
    }
}

const cartService = { createCart, getCart, saveCart, removeFromCart, getProduct }

export default cartService