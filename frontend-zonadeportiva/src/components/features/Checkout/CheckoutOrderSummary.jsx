"use client"

import { useState, useEffect } from "react"
import { useRouter } from "next/navigation"
import loginService from "@/services/loginService"
import cartService from "@/services/cartService"
import orderService from "@/services/orderService"
import { getCart } from "@/utils/cartUtils"
import { formatCLP } from "@/utils/formatPrice"
import PrimaryButton from "@/components/common/buttons/PrimaryButton"

export default function CheckoutOrderSummary({ checkoutData, step }) {
    const [currentCart, setCurrentCart] = useState({})
    const router = useRouter()

    const loadCart = async () => {
        const isAuthenticated = await loginService.checkToken()

        if (isAuthenticated) {
            try {
                const cart = await cartService.getCart()
                setCurrentCart(cart)
            } catch (err) {
                console.error("Error cargando carrito de BD:", err)
          }
        } else {
            const existingCart = getCart()
            setCurrentCart(existingCart)
        }
    }

  const handleGenerateOrder = async () => {
      try {
          const newOrder = {
              cart: currentCart.cart_items,
              shipping_cost: checkoutData.shipping.cost
          }

          const { order } = await orderService.createOrder(newOrder)

          console.log("Orden creada:", order)

          const buyOrder = order.buyOrder
          const amount = order.total

          router.push(
              `${checkoutData.payment.redirectPath}?amount=${amount}&order=${buyOrder}`
          )
      } catch (error) {
          console.error("Error al crear la orden:", error)
      }
  }

    useEffect(() => {
        loadCart()
    }, [])

    const isReadyToPay =
        step === "summary" &&
        checkoutData?.contact?.email &&
        checkoutData?.contact?.firstName &&
        checkoutData?.contact?.lastName &&
        checkoutData?.contact?.phone &&
        checkoutData?.contact?.rut &&
        checkoutData?.address?.state_id &&
        checkoutData?.address?.city_id &&
        checkoutData?.address?.address &&
        checkoutData?.address?.number &&
        checkoutData?.shipping?.id &&
        checkoutData?.payment?.id

    return (
        <div className="flex flex-col gap-4">
            <div className="flex flex-col gap-6 border border-neutral-300 rounded-lg md:p-8 p-4">
                <div>
                    <h2 className="md:text-lg text-base font-semibold uppercase">Tu Pedido</h2>
                </div>
                <div>
                    <div className="flex flex-row justify-between">
                        <p>{currentCart.quantity} {currentCart.quantity > 1 ? "productos" : "producto"}</p>
                        <p>{formatCLP(currentCart.total)} CLP</p>
                    </div>
                    {checkoutData?.shipping &&
                      <div className="flex flex-row justify-between">
                          <p>Despacho</p>
                          <p>
                            {checkoutData?.shipping?.id && checkoutData?.shipping?.carrier !== "Por definir"
                                ? (checkoutData.shipping.cost > 0 ? `${formatCLP(checkoutData.shipping.cost)} CLP` : "Gratis")
                                : "Por definir"}
                          </p>
                      </div>
                    }
                </div>
                <div className="flex flex-row justify-between font-semibold border-b border-neutral-300 pb-4">
                    <p className="md:text-base text-sm">Total</p>
                    <p className="md:text-base text-sm">{formatCLP(currentCart.total + (checkoutData?.shipping?.cost || 0))} CLP</p>
                </div>
                <PrimaryButton
                    type="submit"
                    disabled={!isReadyToPay}
                    onClick={handleGenerateOrder}
                >
                    Ir al pago
                </PrimaryButton>
            </div>
        </div>
    )
}
