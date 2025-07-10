import cartService from '../services/cart.service.js'
import { validateProductStock } from '../services/product.service.js'

const createCart = async (req, res) => {
    try {
        const user_id = req.user.id
        const cart = await cartService.createCart(user_id)

        return res.status(201).json({
            message: 'Carrito creado o recuperado exitosamente',
            cart
        })
    } catch (error) {
        res.status(500).json({ message: error.message })
    }
}

const getCart = async (req, res) => {
    try {
        const user_id = req.user.id

        const cart = await cartService.getCart(user_id)

        if (!cart) {
            return res.status(404).json({ message: 'Carrito no encontrado' })
        }

        return res.status(200).json({
            message: 'Carrito obtenido exitosamente',
            cart
        })
    } catch (error) {
        res.status(500).json({ message: error.message })
    }
}

// Mover a funciones de productos
const setPrice = (product) => {
    return product.metadata.sale_price || product.metadata.regular_price || product.metadata.price
}

// Mover a funciones de productos
const validateStock = (product, quantity) => {
    return product.metadata.stock >= quantity
}

const validateProduct = (cart, product, product_id, quantity) => {
    const existingItem = cart.find(item => item.product_id === product_id)

    if (existingItem) {
        return {
            ...existingItem,
            quantity: existingItem.quantity + quantity,
            total_price: existingItem.total_price + existingItem.unit_price * quantity
        }
    } else {
        const unit_price = Math.round(setPrice(product));
        return {
            id: cart.id || null,
            product_id,
            quantity,
            unit_price,
            total_price: unit_price * quantity
        }
    }
}

const addToCart = async (req, res) => {
    try {
        const { product_id, quantity, cart } = req.body
        const product = await cartService.getProduct(product_id)

        let cart_items = []
        let isAuthenticated = !!req.user

        let cart_id = null
        if (isAuthenticated) {
            const userCart = await cartService.getCart(req.user.id)

            cart_items = userCart.cart_items
            cart_id = userCart.id
        } else {
            if (!cart || !Array.isArray(cart.cart_items)) {
                return res.status(400).json({ message: 'Carrito inválido' })
            }
            cart_items = cart.cart_items
        }

        const updatedItem = validateProduct(cart_items,  product, product_id, quantity)

        if(!validateStock(product, updatedItem.quantity)) {
            return res.status(400).json({ message: 'No hay suficiente stock disponible' })
        }

        const updatedItems = cart_items.some(item => item.product_id === product_id)
            ? cart_items.map(item => item.product_id === product_id ? updatedItem : item)
            : [...cart_items, updatedItem]

        let cartResponse = {
            cart_items: updatedItems,
            quantity: updatedItems.reduce((sum, item) => sum + item.quantity, 0),
            total: updatedItems.reduce((sum, item) => sum + item.total_price, 0)
        };

        if (isAuthenticated) {
            await cartService.saveCart(cart_id, updatedItems);
            cartResponse = await cartService.getCart(req.user.id);
        }

        return res.status(200).json({
            message: isAuthenticated
                ? 'Producto agregado/actualizado en el carrito (BD)'
                : 'Producto agregado/actualizado en el carrito (local)',
            cart: cartResponse,
            item: {
                ...updatedItem,
                product_name: product.title
            }
        })
    } catch (error) {
        console.log(error)
        res.status(500).json({ message: 'Error al agregar al carrito' })
    }
}

const removeFromCart = async (req, res) => {
    try {
        const { product_id, cart } = req.body
        const isAuthenticated = !!req.user

        let cart_items = []
        let cart_id = null
        
        if (isAuthenticated) {
            const userCart = await cartService.getCart(req.user.id)
            cart_items = userCart.cart_items
            cart_id = userCart.id
        } else {
            if (!cart || !Array.isArray(cart.cart_items)) {
                return res.status(400).json({ message: 'Carrito inválido' })
            }
            cart_items = cart.cart_items
        }

        const updatedItems = cart_items.filter(item => item.product_id !== product_id)

        if (isAuthenticated) {
            await cartService.saveCart(cart_id, updatedItems)
        }

        const cartResponse = {
            cart_items: updatedItems,
            quantity: updatedItems.reduce((acc, item) => acc + item.quantity, 0),
            total: updatedItems.reduce((acc, item) => acc + item.total_price, 0)
        }

        return res.status(200).json({
            message: isAuthenticated
                ? 'Producto eliminado del carrito en base de datos'
                : 'Producto eliminado del carrito local',
            cart: cartResponse
        })
    } catch (error) {
        console.log(error)
        res.status(500).json({ message: 'Error al eliminar del carrito' })
    }
}

// Mover a controlador de productos
const getProductById = async (req, res) => {
    try {
        const product_id = req.params.id

        const product = await cartService.getProduct(product_id)

        return res.status(200).json({ product })
    } catch (error) {
        console.log(error)
        res.status(500).json({ message: 'Error al obtener el producto' })
    }       
}

// Mover a funciones del carrito
const mergeCartItems = (dbItems, localItems) => {
    const map = new Map()

    for (const item of dbItems) {
        map.set(item.product_id, { ...item })
    }

    for (const item of localItems) {
        if (map.has(item.product_id)) {
            const existing = map.get(item.product_id)
            existing.quantity += item.quantity
            existing.total_price = existing.quantity * existing.unit_price
        } else {
            map.set(item.product_id, { ...item })
        }
    }

    return Array.from(map.values())
}

const syncCart = async (req, res) => {
    try {
        const user_id = req.user.id
        const localCart = req.body.cart

        if (!localCart || !Array.isArray(localCart.cart_items)) {
            return res.status(400).json({ message: 'Carrito inválido' })
        }

        const dbCart = await cartService.getCart(user_id)

        const mergedItems = mergeCartItems(dbCart.cart_items, localCart.cart_items)

        await cartService.saveCart(dbCart.id, mergedItems)

        const total = mergedItems.reduce((sum, item) => sum + item.total_price, 0)
        const quantity = mergedItems.reduce((sum, item) => sum + item.quantity, 0)

        return res.status(200).json({
            message: 'Carrito sincronizado exitosamente',
            cart: {
                cart_items: mergedItems,
                total,
                quantity
            }
        })

    } catch (error) {
        console.log(error)
        res.status(500).json({ message: 'Error al sincronizar el carrito' })
    }
}

// Valida producto por producto del carrito de compras, retorna instock si está en stock, sino outofstock 
export const validateCart = async (req, res) => {
    try {
      const { cart } = req.body
  
      if (!Array.isArray(cart) || cart.length === 0) {
        return res
          .status(400).json({ message: 'Debe enviar un arreglo “cart” con al menos un ítem.' })
      }
      
  
      const validatedCart = []
  
      // Recorremos secuencialmente para poder await checkStock
      for (const item of cart) {
        const { product_id, quantity, unit_price, total_price } = item
  
        // Llamamos a checkStock, que devuelve 1 si hay stock, 0 si no
        let hasStock
        let stockDetails

        try {
          stockDetails = await validateProductStock(product_id, quantity)
          hasStock = stockDetails.result

        } catch (err) {
          console.error('Error en checkStock:', err)
          // Si checkStock lanza un error, lo tratamos como sin stock
          hasStock = 0
        }
  
        
        if(hasStock === 1){
          hasStock = 'instock'
        }else{
          hasStock = 'outofstock'
        }
          
  
        validatedCart.push({
          product_id,
          quantity,
          unit_price,
          total_price,
          stock: hasStock
        })
      }
  
      // Devolver el carrito validado con stock status
      return res.status(200).json(validatedCart)
    } catch (error) {
      console.error('Error en validateCart:', error)
      return res
        .status(500).json({ message: 'Error interno al validar carrito' })
    }
}
  
const cartController = { createCart, getCart, addToCart, removeFromCart, syncCart, getProductById, validateCart }

export default cartController

