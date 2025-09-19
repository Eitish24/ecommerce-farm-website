"use client"

import type React from "react"

import { useState } from "react"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Separator } from "@/components/ui/separator"
import { RadioGroup, RadioGroupItem } from "@/components/ui/radio-group"
import { Textarea } from "@/components/ui/textarea"
import { ProtectedImage } from "@/components/protected-image"
import { CreditCard, Truck, Shield } from "lucide-react"
import { useRouter } from "next/navigation"
import { formatIndianCurrency, validateIndianPhone, validateIndianPinCode } from "@/lib/utils"

interface CartItem {
  id: string
  quantity: number
  products: {
    id: string
    name: string
    price: number
    image_url: string
    stock_quantity: number
    unit: string
  }
}

interface Profile {
  id: string
  email: string
  full_name: string | null
  phone: string | null
  address: any
}

interface CheckoutFormProps {
  items: CartItem[]
  profile: Profile | null
}

export function CheckoutForm({ items, profile }: CheckoutFormProps) {
  const [isLoading, setIsLoading] = useState(false)
  const [paymentMethod, setPaymentMethod] = useState("card")
  const [shippingInfo, setShippingInfo] = useState({
    fullName: profile?.full_name || "",
    phone: profile?.phone || "",
    street: profile?.address?.street || "",
    city: profile?.address?.city || "",
    state: profile?.address?.state || "",
    pinCode: profile?.address?.pinCode || profile?.address?.zip || "",
  })
  const [paymentInfo, setPaymentInfo] = useState({
    cardNumber: "",
    expiryDate: "",
    cvv: "",
    cardName: "",
  })
  const [orderNotes, setOrderNotes] = useState("")
  const router = useRouter()

  const subtotal = items.reduce((sum, item) => sum + item.products.price * item.quantity, 0)
  const shipping = subtotal > 2000 ? 0 : 150
  const tax = subtotal * 0.18 // 18% GST
  const total = subtotal + shipping + tax

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    setIsLoading(true)

    if (!validateIndianPhone(shippingInfo.phone)) {
      alert("Please enter a valid Indian phone number")
      setIsLoading(false)
      return
    }

    if (!validateIndianPinCode(shippingInfo.pinCode)) {
      alert("Please enter a valid 6-digit PIN code")
      setIsLoading(false)
      return
    }

    try {
      // Create order
      const orderData = {
        items: items.map((item) => ({
          productId: item.products.id,
          quantity: item.quantity,
          unitPrice: item.products.price,
        })),
        totalAmount: total,
        shippingAddress: shippingInfo,
        paymentMethod,
        orderNotes,
      }

      const response = await fetch("/api/orders", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify(orderData),
      })

      if (!response.ok) {
        throw new Error("Failed to create order")
      }

      const { orderId } = await response.json()

      // Simulate payment processing
      await new Promise((resolve) => setTimeout(resolve, 2000))

      // Redirect to success page
      router.push(`/checkout/success?orderId=${orderId}`)
    } catch (error) {
      console.error("Checkout error:", error)
      alert("There was an error processing your order. Please try again.")
    } finally {
      setIsLoading(false)
    }
  }

  return (
    <form onSubmit={handleSubmit}>
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
        {/* Left Column - Forms */}
        <div className="space-y-6">
          {/* Shipping Information */}
          <Card className="border-green-100">
            <CardHeader>
              <CardTitle className="text-green-800 flex items-center select-none">
                <Truck className="w-5 h-5 mr-2" />
                Shipping Information
              </CardTitle>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="grid grid-cols-2 gap-4">
                <div>
                  <Label htmlFor="fullName" className="text-green-700 select-none">
                    Full Name
                  </Label>
                  <Input
                    id="fullName"
                    required
                    value={shippingInfo.fullName}
                    onChange={(e) => setShippingInfo({ ...shippingInfo, fullName: e.target.value })}
                    className="border-green-200 focus:border-green-500"
                  />
                </div>
                <div>
                  <Label htmlFor="phone" className="text-green-700 select-none">
                    Phone Number
                  </Label>
                  <Input
                    id="phone"
                    type="tel"
                    required
                    placeholder="+91-98765-43210"
                    value={shippingInfo.phone}
                    onChange={(e) => setShippingInfo({ ...shippingInfo, phone: e.target.value })}
                    className="border-green-200 focus:border-green-500"
                  />
                </div>
              </div>

              <div>
                <Label htmlFor="street" className="text-green-700 select-none">
                  Street Address
                </Label>
                <Input
                  id="street"
                  required
                  value={shippingInfo.street}
                  onChange={(e) => setShippingInfo({ ...shippingInfo, street: e.target.value })}
                  className="border-green-200 focus:border-green-500"
                />
              </div>

              <div className="grid grid-cols-3 gap-4">
                <div>
                  <Label htmlFor="city" className="text-green-700 select-none">
                    City
                  </Label>
                  <Input
                    id="city"
                    required
                    value={shippingInfo.city}
                    onChange={(e) => setShippingInfo({ ...shippingInfo, city: e.target.value })}
                    className="border-green-200 focus:border-green-500"
                  />
                </div>
                <div>
                  <Label htmlFor="state" className="text-green-700 select-none">
                    State
                  </Label>
                  <Input
                    id="state"
                    required
                    placeholder="Maharashtra"
                    value={shippingInfo.state}
                    onChange={(e) => setShippingInfo({ ...shippingInfo, state: e.target.value })}
                    className="border-green-200 focus:border-green-500"
                  />
                </div>
                <div>
                  <Label htmlFor="pinCode" className="text-green-700 select-none">
                    PIN Code
                  </Label>
                  <Input
                    id="pinCode"
                    required
                    placeholder="400001"
                    value={shippingInfo.pinCode}
                    onChange={(e) => setShippingInfo({ ...shippingInfo, pinCode: e.target.value })}
                    className="border-green-200 focus:border-green-500"
                  />
                </div>
              </div>
            </CardContent>
          </Card>

          {/* Payment Information */}
          <Card className="border-green-100">
            <CardHeader>
              <CardTitle className="text-green-800 flex items-center">
                <CreditCard className="w-5 h-5 mr-2" />
                Payment Information
              </CardTitle>
            </CardHeader>
            <CardContent className="space-y-4">
              <RadioGroup value={paymentMethod} onValueChange={setPaymentMethod}>
                <div className="flex items-center space-x-2">
                  <RadioGroupItem value="card" id="card" />
                  <Label htmlFor="card">Credit/Debit Card</Label>
                </div>
                <div className="flex items-center space-x-2">
                  <RadioGroupItem value="paypal" id="paypal" />
                  <Label htmlFor="paypal">PayPal</Label>
                </div>
                <div className="flex items-center space-x-2">
                  <RadioGroupItem value="upi" id="upi" />
                  <Label htmlFor="upi">UPI</Label>
                </div>
                <div className="flex items-center space-x-2">
                  <RadioGroupItem value="netbanking" id="netbanking" />
                  <Label htmlFor="netbanking">Net Banking</Label>
                </div>
              </RadioGroup>

              {paymentMethod === "card" && (
                <div className="space-y-4">
                  <div>
                    <Label htmlFor="cardName" className="text-green-700">
                      Name on Card
                    </Label>
                    <Input
                      id="cardName"
                      required
                      value={paymentInfo.cardName}
                      onChange={(e) => setPaymentInfo({ ...paymentInfo, cardName: e.target.value })}
                      className="border-green-200 focus:border-green-500"
                    />
                  </div>

                  <div>
                    <Label htmlFor="cardNumber" className="text-green-700">
                      Card Number
                    </Label>
                    <Input
                      id="cardNumber"
                      placeholder="1234 5678 9012 3456"
                      required
                      value={paymentInfo.cardNumber}
                      onChange={(e) => setPaymentInfo({ ...paymentInfo, cardNumber: e.target.value })}
                      className="border-green-200 focus:border-green-500"
                    />
                  </div>

                  <div className="grid grid-cols-2 gap-4">
                    <div>
                      <Label htmlFor="expiryDate" className="text-green-700">
                        Expiry Date
                      </Label>
                      <Input
                        id="expiryDate"
                        placeholder="MM/YY"
                        required
                        value={paymentInfo.expiryDate}
                        onChange={(e) => setPaymentInfo({ ...paymentInfo, expiryDate: e.target.value })}
                        className="border-green-200 focus:border-green-500"
                      />
                    </div>
                    <div>
                      <Label htmlFor="cvv" className="text-green-700">
                        CVV
                      </Label>
                      <Input
                        id="cvv"
                        placeholder="123"
                        required
                        value={paymentInfo.cvv}
                        onChange={(e) => setPaymentInfo({ ...paymentInfo, cvv: e.target.value })}
                        className="border-green-200 focus:border-green-500"
                      />
                    </div>
                  </div>
                </div>
              )}

              {paymentMethod === "upi" && (
                <div className="bg-blue-50 border border-blue-200 rounded-md p-4">
                  <p className="text-sm text-blue-700">
                    You will be redirected to your UPI app to complete the payment.
                  </p>
                </div>
              )}

              {paymentMethod === "netbanking" && (
                <div className="bg-green-50 border border-green-200 rounded-md p-4">
                  <p className="text-sm text-green-700">
                    You will be redirected to your bank's website to complete the payment.
                  </p>
                </div>
              )}
            </CardContent>
          </Card>

          {/* Order Notes */}
          <Card className="border-green-100">
            <CardHeader>
              <CardTitle className="text-green-800 select-none">Order Notes (Optional)</CardTitle>
            </CardHeader>
            <CardContent>
              <Textarea
                placeholder="Any special instructions for your order..."
                value={orderNotes}
                onChange={(e) => setOrderNotes(e.target.value)}
                className="border-green-200 focus:border-green-500"
              />
            </CardContent>
          </Card>
        </div>

        {/* Right Column - Order Summary */}
        <div className="space-y-6">
          <Card className="border-green-100 sticky top-4">
            <CardHeader>
              <CardTitle className="text-green-800 select-none">Order Summary</CardTitle>
            </CardHeader>
            <CardContent className="space-y-4">
              {/* Order Items */}
              <div className="space-y-3">
                {items.map((item) => (
                  <div key={item.id} className="flex items-center space-x-3">
                    <div className="relative w-12 h-12 flex-shrink-0">
                      <ProtectedImage
                        src={item.products.image_url || "/placeholder.svg"}
                        alt={item.products.name}
                        fill
                        className="object-cover rounded"
                      />
                    </div>
                    <div className="flex-grow">
                      <h4 className="font-medium text-green-800 text-sm select-none">{item.products.name}</h4>
                      <p className="text-xs text-gray-500 select-none">
                        Qty: {item.quantity} × {formatIndianCurrency(item.products.price)}
                      </p>
                    </div>
                    <span className="font-medium text-green-800 select-none">
                      {formatIndianCurrency(item.products.price * item.quantity)}
                    </span>
                  </div>
                ))}
              </div>

              <Separator />

              {/* Pricing */}
              <div className="space-y-2">
                <div className="flex justify-between text-sm">
                  <span className="text-gray-600">Subtotal</span>
                  <span className="text-green-800">{formatIndianCurrency(subtotal)}</span>
                </div>
                <div className="flex justify-between text-sm">
                  <span className="text-gray-600">Shipping</span>
                  <span className="text-green-800">{shipping === 0 ? "Free" : formatIndianCurrency(shipping)}</span>
                </div>
                <div className="flex justify-between text-sm">
                  <span className="text-gray-600">GST (18%)</span>
                  <span className="text-green-800">{formatIndianCurrency(tax)}</span>
                </div>
              </div>

              <Separator />

              <div className="flex justify-between font-semibold text-lg">
                <span className="text-green-800">Total</span>
                <span className="text-green-800">{formatIndianCurrency(total)}</span>
              </div>

              <Button type="submit" className="w-full bg-green-600 hover:bg-green-700" size="lg" disabled={isLoading}>
                {isLoading ? "Processing..." : `Pay ${formatIndianCurrency(total)}`}
              </Button>

              <div className="flex items-center justify-center space-x-2 text-sm text-gray-500 select-none">
                <Shield className="w-4 h-4" />
                <span>Secure checkout powered by SSL encryption</span>
              </div>
            </CardContent>
          </Card>
        </div>
      </div>
    </form>
  )
}
