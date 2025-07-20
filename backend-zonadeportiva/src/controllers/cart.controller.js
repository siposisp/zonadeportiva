import cartService from '../services/cart.service.js'
import { validateProductStock } from '../services/product.service.js'

/**
 * @swagger
 * /cart/create:
 *   post:
 *     summary: Crear o recuperar carrito de usuario
 *     description: Crea un nuevo carrito para el usuario autenticado o recupera uno existente si ya existe.
 *     tags:
 *       - Carrito
 *     security:
 *       - bearerAuth: []
 *     responses:
 *       201:
 *         description: Carrito creado o recuperado exitosamente
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 message:
 *                   type: string
 *                   example: "Carrito creado o recuperado exitosamente"
 *                 cart:
 *                   type: object
 *                   properties:
 *                     id:
 *                       type: integer
 *                       example: 1
 *                     user_id:
 *                       type: integer
 *                       example: 123
 *                     cart_items:
 *                       type: array
 *                       items:
 *                         type: object
 *                       example: []
 *                     total:
 *                       type: number
 *                       example: 0
 *                     quantity:
 *                       type: integer
 *                       example: 0
 *       401:
 *         description: Usuario no autenticado
 *       500:
 *         description: Error interno del servidor
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 message:
 *                   type: string
 *                   example: "Error interno del servidor"
 */
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

/**
 * @swagger
 * /cart/:
 *   get:
 *     summary: Obtener carrito del usuario
 *     description: Retorna el carrito completo del usuario autenticado con todos sus items.
 *     tags:
 *       - Carrito
 *     security:
 *       - bearerAuth: []
 *     responses:
 *       200:
 *         description: Carrito obtenido exitosamente
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 message:
 *                   type: string
 *                   example: "Carrito obtenido exitosamente"
 *                 cart:
 *                   type: object
 *                   properties:
 *                     id:
 *                       type: integer
 *                       example: 1
 *                     user_id:
 *                       type: integer
 *                       example: 123
 *                     cart_items:
 *                       type: array
 *                       items:
 *                         type: object
 *                         properties:
 *                           id:
 *                             type: integer
 *                             example: 1
 *                           product_id:
 *                             type: integer
 *                             example: 456
 *                           quantity:
 *                             type: integer
 *                             example: 2
 *                           unit_price:
 *                             type: number
 *                             example: 29.99
 *                           total_price:
 *                             type: number
 *                             example: 59.98
 *                     total:
 *                       type: number
 *                       example: 59.98
 *                     quantity:
 *                       type: integer
 *                       example: 2
 *       404:
 *         description: Carrito no encontrado
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 message:
 *                   type: string
 *                   example: "Carrito no encontrado"
 *       401:
 *         description: Usuario no autenticado
 *       500:
 *         description: Error interno del servidor
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 message:
 *                   type: string
 *                   example: "Error interno del servidor"
 */
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

/**
 * @swagger
 * /cart/add:
 *   post:
 *     summary: Agregar producto al carrito
 *     description: Agrega un producto al carrito del usuario autenticado o al carrito local para usuarios no autenticados. Si el producto ya existe, actualiza la cantidad.
 *     tags:
 *       - Carrito
 *     security:
 *       - bearerAuth: []
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *             required:
 *               - product_id
 *               - quantity
 *             properties:
 *               product_id:
 *                 type: integer
 *                 description: ID del producto a agregar
 *                 example: 456
 *               quantity:
 *                 type: integer
 *                 description: Cantidad del producto a agregar
 *                 minimum: 1
 *                 example: 2
 *               cart:
 *                 type: object
 *                 description: Carrito local (requerido solo para usuarios no autenticados)
 *                 properties:
 *                   cart_items:
 *                     type: array
 *                     items:
 *                       type: object
 *                       properties:
 *                         product_id:
 *                           type: integer
 *                         quantity:
 *                           type: integer
 *                         unit_price:
 *                           type: number
 *                         total_price:
 *                           type: number
 *     responses:
 *       200:
 *         description: Producto agregado/actualizado exitosamente
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 message:
 *                   type: string
 *                   example: "Producto agregado/actualizado en el carrito (BD)"
 *                 cart:
 *                   type: object
 *                   properties:
 *                     cart_items:
 *                       type: array
 *                       items:
 *                         type: object
 *                         properties:
 *                           product_id:
 *                             type: integer
 *                           quantity:
 *                             type: integer
 *                           unit_price:
 *                             type: number
 *                           total_price:
 *                             type: number
 *                     quantity:
 *                       type: integer
 *                       example: 3
 *                     total:
 *                       type: number
 *                       example: 89.97
 *                 item:
 *                   type: object
 *                   properties:
 *                     product_id:
 *                       type: integer
 *                       example: 456
 *                     quantity:
 *                       type: integer
 *                       example: 2
 *                     unit_price:
 *                       type: number
 *                       example: 29.99
 *                     total_price:
 *                       type: number
 *                       example: 59.98
 *                     product_name:
 *                       type: string
 *                       example: "Producto Ejemplo"
 *       400:
 *         description: Datos inválidos o stock insuficiente
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 message:
 *                   type: string
 *                   example: "No hay suficiente stock disponible"
 *       500:
 *         description: Error al agregar al carrito
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 message:
 *                   type: string
 *                   example: "Error al agregar al carrito"
 */
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

/**
 * @swagger
 * /cart/remove:
 *   post:
 *     summary: Eliminar producto del carrito
 *     description: Elimina completamente un producto del carrito del usuario autenticado o del carrito local.
 *     tags:
 *       - Carrito
 *     security:
 *       - bearerAuth: []
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *             required:
 *               - product_id
 *             properties:
 *               product_id:
 *                 type: integer
 *                 description: ID del producto a eliminar
 *                 example: 456
 *               cart:
 *                 type: object
 *                 description: Carrito local (requerido solo para usuarios no autenticados)
 *                 properties:
 *                   cart_items:
 *                     type: array
 *                     items:
 *                       type: object
 *                       properties:
 *                         product_id:
 *                           type: integer
 *                         quantity:
 *                           type: integer
 *                         unit_price:
 *                           type: number
 *                         total_price:
 *                           type: number
 *     responses:
 *       200:
 *         description: Producto eliminado exitosamente
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 message:
 *                   type: string
 *                   example: "Producto eliminado del carrito en base de datos"
 *                 cart:
 *                   type: object
 *                   properties:
 *                     cart_items:
 *                       type: array
 *                       items:
 *                         type: object
 *                         properties:
 *                           product_id:
 *                             type: integer
 *                           quantity:
 *                             type: integer
 *                           unit_price:
 *                             type: number
 *                           total_price:
 *                             type: number
 *                     quantity:
 *                       type: integer
 *                       example: 1
 *                     total:
 *                       type: number
 *                       example: 29.99
 *       400:
 *         description: Carrito inválido
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 message:
 *                   type: string
 *                   example: "Carrito inválido"
 *       500:
 *         description: Error al eliminar del carrito
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 message:
 *                   type: string
 *                   example: "Error al eliminar del carrito"
 */
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

/**
 * @swagger
 * /cart/product/{id}:
 *   get:
 *     summary: Obtener producto por ID
 *     description: Retorna la información completa de un producto específico por su ID.
 *     tags:
 *       - Carrito
 *     parameters:
 *       - in: path
 *         name: id
 *         required: true
 *         description: ID único del producto
 *         schema:
 *           type: integer
 *           example: 456
 *     responses:
 *       200:
 *         description: Producto obtenido exitosamente
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 product:
 *                   type: object
 *                   properties:
 *                     id:
 *                       type: integer
 *                       example: 456
 *                     title:
 *                       type: string
 *                       example: "Producto Ejemplo"
 *                     slug:
 *                       type: string
 *                       example: "producto-ejemplo"
 *                     metadata:
 *                       type: object
 *                       properties:
 *                         price:
 *                           type: number
 *                           example: 29.99
 *                         regular_price:
 *                           type: number
 *                           example: 34.99
 *                         sale_price:
 *                           type: number
 *                           example: 29.99
 *                         stock:
 *                           type: integer
 *                           example: 10
 *       500:
 *         description: Error al obtener el producto
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 message:
 *                   type: string
 *                   example: "Error al obtener el producto"
 */
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

/**
 * @swagger
 * /cart/sync:
 *   post:
 *     summary: Sincronizar carrito local con base de datos
 *     description: Sincroniza el carrito local del usuario con el carrito almacenado en la base de datos, combinando los items de ambos carritos.
 *     tags:
 *       - Carrito
 *     security:
 *       - bearerAuth: []
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *             required:
 *               - cart
 *             properties:
 *               cart:
 *                 type: object
 *                 description: Carrito local a sincronizar
 *                 properties:
 *                   cart_items:
 *                     type: array
 *                     items:
 *                       type: object
 *                       properties:
 *                         product_id:
 *                           type: integer
 *                           example: 456
 *                         quantity:
 *                           type: integer
 *                           example: 2
 *                         unit_price:
 *                           type: number
 *                           example: 29.99
 *                         total_price:
 *                           type: number
 *                           example: 59.98
 *     responses:
 *       200:
 *         description: Carrito sincronizado exitosamente
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 message:
 *                   type: string
 *                   example: "Carrito sincronizado exitosamente"
 *                 cart:
 *                   type: object
 *                   properties:
 *                     cart_items:
 *                       type: array
 *                       items:
 *                         type: object
 *                         properties:
 *                           product_id:
 *                             type: integer
 *                           quantity:
 *                             type: integer
 *                           unit_price:
 *                             type: number
 *                           total_price:
 *                             type: number
 *                     total:
 *                       type: number
 *                       example: 89.97
 *                     quantity:
 *                       type: integer
 *                       example: 3
 *       400:
 *         description: Carrito inválido
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 message:
 *                   type: string
 *                   example: "Carrito inválido"
 *       401:
 *         description: Usuario no autenticado
 *       500:
 *         description: Error al sincronizar el carrito
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 message:
 *                   type: string
 *                   example: "Error al sincronizar el carrito"
 */
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

/**
 * @swagger
 * /cart/validate:
 *   post:
 *     summary: Validar stock del carrito
 *     description: Valida la disponibilidad de stock para todos los productos en el carrito de compras, retornando el estado de cada item.
 *     tags:
 *       - Carrito
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *             required:
 *               - cart
 *             properties:
 *               cart:
 *                 type: array
 *                 description: Array de items del carrito a validar
 *                 minItems: 1
 *                 items:
 *                   type: object
 *                   required:
 *                     - product_id
 *                     - quantity
 *                     - unit_price
 *                     - total_price
 *                   properties:
 *                     product_id:
 *                       type: integer
 *                       description: ID del producto
 *                       example: 456
 *                     quantity:
 *                       type: integer
 *                       description: Cantidad solicitada
 *                       minimum: 1
 *                       example: 2
 *                     unit_price:
 *                       type: number
 *                       description: Precio unitario del producto
 *                       example: 29.99
 *                     total_price:
 *                       type: number
 *                       description: Precio total del item
 *                       example: 59.98
 *     responses:
 *       200:
 *         description: Carrito validado exitosamente
 *         content:
 *           application/json:
 *             schema:
 *               type: array
 *               items:
 *                 type: object
 *                 properties:
 *                   product_id:
 *                     type: integer
 *                     description: ID del producto
 *                     example: 456
 *                   quantity:
 *                     type: integer
 *                     description: Cantidad solicitada
 *                     example: 2
 *                   unit_price:
 *                     type: number
 *                     description: Precio unitario del producto
 *                     example: 29.99
 *                   total_price:
 *                     type: number
 *                     description: Precio total del item
 *                     example: 59.98
 *                   stock:
 *                     type: string
 *                     description: Estado del stock del producto
 *                     enum: [instock, outofstock]
 *                     example: "instock"
 *       400:
 *         description: Datos de entrada inválidos
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 message:
 *                   type: string
 *                   example: "Debe enviar un arreglo \"cart\" con al menos un ítem."
 *       500:
 *         description: Error interno al validar carrito
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 message:
 *                   type: string
 *                   example: "Error interno al validar carrito"
 */
// Valida producto por producto del carrito de compras, retorna instock si está en stock, sino outofstock 
export const validateCart = async (req, res) => {
    try {
      const { cart } = req.body
  
      if (!Array.isArray(cart) || cart.length === 0) {
        return res
          .status(400).json({ message: 'Debe enviar un arreglo "cart" con al menos un ítem.' })
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