"use client"

import { useState } from "react"
import { useRouter } from "next/navigation"
import ContactForm from "@/components/features/Checkout/Contact/ContactForm"
import AddressForm from "@/components/features/Checkout/Address/AddressForm"
import ShippingForm from "@/components/features/Checkout/Shipping/ShippingForm"
import PaymentForm from "@/components/features/Checkout/Payment/PaymentForm"
import CheckoutOrderSummary from "@/components/features/Checkout/CheckoutOrderSummary"

export default function Checkout() {
  const [step, setStep] = useState("contact")
  const [checkoutData, setCheckoutData] = useState({
    contact: {
      email: "",
      first_name: "",
      last_name: "",
      phone: "",
      rut: ""
    },
    address: {
      state_id: "",
      city_id: "",
      address: "",
      number: "",
      apartment: ""
    },
    shipping: null,
    payment: null
  })

  const router = useRouter()

  const handleNextStep = (newData, nextStep) => {
    const updatedData = {
      ...checkoutData,
      ...newData
    }
    setCheckoutData(updatedData)
    if (nextStep === "complete") {
      router.push(updatedData.payment.redirectPath)
    } else {
      setStep(nextStep)
    }
  }

  const handleBack = (previousStep) => {
    setStep(previousStep)
  }

  return (
    <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
      <div className="lg:col-span-2 flex flex-col gap-6 border border-neutral-300 rounded-lg md:p-8 p-4">
        <ContactForm
          step={step}
          onNext={(contact) => handleNextStep({ contact }, "address")}
          onBack={() => handleBack("contact")}
        />

        <AddressForm
          step={step}
          initialData={checkoutData.address}
          onNext={(address) => handleNextStep({ address }, "shipping")}
          onBack={() => handleBack("address")}
        />

        <ShippingForm
          step={step}
          address={checkoutData.address}
          onNext={(shipping) => handleNextStep({ shipping }, "payment")}
          onBack={() => handleBack("shipping")}
        />

        <PaymentForm
          step={step}
          onNext={(payment) => handleNextStep({ payment }, "summary")}
          onBack={() => handleBack("payment")}
        />
      </div>

      <CheckoutOrderSummary
        checkoutData={checkoutData}
        step={step}
        onComplete={() => handleNextStep({}, "complete")}
      />
    </div>
  )
}