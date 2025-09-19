"use client"

import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Separator } from "@/components/ui/separator"
import Link from "next/link"
import { formatIndianCurrency } from "@/lib/utils"

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

interface CartSummaryProps {
  items: CartItem[]
}

export function CartSummary({ items }: CartSummaryProps) {
  const subtotal = items.reduce((sum, item) => sum + item.products.price * item.quantity, 0)
  const shipping = subtotal > 2000 ? 0 : 150 // Free shipping over ₹2000, ₹150 shipping cost
  const tax = subtotal * 0.18 // 18% GST in India
  const total = subtotal + shipping + tax

  return (
    <Card className="border-green-100 sticky top-4">
      <CardHeader>
        <CardTitle className="text-green-800">Order Summary</CardTitle>
      </CardHeader>
      <CardContent className="space-y-4">
        <div className="space-y-2">
          <div className="flex justify-between text-sm">
            <span className="text-gray-600">Subtotal ({items.length} items)</span>
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

        {shipping > 0 && (
          <div className="bg-green-50 border border-green-200 rounded-md p-3">
            <p className="text-sm text-green-700">
              Add {formatIndianCurrency(2000 - subtotal)} more for free shipping!
            </p>
          </div>
        )}

        <Button asChild className="w-full bg-green-600 hover:bg-green-700" size="lg">
          <Link href="/checkout">Proceed to Checkout</Link>
        </Button>

        <div className="text-center">
          <a href="/" className="text-sm text-green-600 hover:text-green-700 underline">
            Continue Shopping
          </a>
        </div>

        <div className="bg-gray-50 rounded-md p-3">
          <h4 className="font-medium text-green-800 mb-2">Delivery Information</h4>
          <ul className="text-sm text-gray-600 space-y-1">
            <li>• Fresh vegetables delivered within 24-48 hours</li>
            <li>• Free shipping on orders over ₹2000</li>
            <li>• 100% satisfaction guarantee</li>
          </ul>
        </div>
      </CardContent>
    </Card>
  )
}
