"use client"

import { useState } from "react"
import { Card, CardContent } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { ProtectedImage } from "@/components/protected-image"
import { Minus, Plus, Trash2 } from "lucide-react"
import { useRouter } from "next/navigation"

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

interface CartItemsProps {
  items: CartItem[]
}

export function CartItems({ items }: CartItemsProps) {
  const [loadingItems, setLoadingItems] = useState<Set<string>>(new Set())
  const router = useRouter()

  const updateQuantity = async (itemId: string, newQuantity: number) => {
    if (newQuantity < 1) return

    setLoadingItems((prev) => new Set(prev).add(itemId))

    try {
      const response = await fetch(`/api/cart/${itemId}`, {
        method: "PUT",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({ quantity: newQuantity }),
      })

      if (!response.ok) {
        throw new Error("Failed to update quantity")
      }

      router.refresh()
    } catch (error) {
      console.error("Error updating quantity:", error)
    } finally {
      setLoadingItems((prev) => {
        const newSet = new Set(prev)
        newSet.delete(itemId)
        return newSet
      })
    }
  }

  const removeItem = async (itemId: string) => {
    setLoadingItems((prev) => new Set(prev).add(itemId))

    try {
      const response = await fetch(`/api/cart/${itemId}`, {
        method: "DELETE",
      })

      if (!response.ok) {
        throw new Error("Failed to remove item")
      }

      router.refresh()
    } catch (error) {
      console.error("Error removing item:", error)
    } finally {
      setLoadingItems((prev) => {
        const newSet = new Set(prev)
        newSet.delete(itemId)
        return newSet
      })
    }
  }

  return (
    <div className="space-y-4">
      <h2 className="text-xl font-semibold text-green-800 mb-4 select-none">Cart Items ({items.length})</h2>
      {items.map((item) => (
        <Card key={item.id} className="border-green-100">
          <CardContent className="p-6">
            <div className="flex items-center space-x-4">
              <div className="relative w-20 h-20 flex-shrink-0">
                <ProtectedImage
                  src={item.products.image_url || "/placeholder.svg"}
                  alt={item.products.name}
                  fill
                  className="object-cover rounded-lg"
                />
              </div>

              <div className="flex-grow">
                <h3 className="font-semibold text-green-800 select-none">{item.products.name}</h3>
                <p className="text-green-600 select-none">
                  ${item.products.price.toFixed(2)} per {item.products.unit}
                </p>
                <p className="text-sm text-gray-500 select-none">
                  {item.products.stock_quantity > 0 ? `${item.products.stock_quantity} in stock` : "Out of stock"}
                </p>
              </div>

              <div className="flex items-center space-x-2">
                <Button
                  variant="outline"
                  size="sm"
                  onClick={() => updateQuantity(item.id, item.quantity - 1)}
                  disabled={item.quantity <= 1 || loadingItems.has(item.id)}
                  className="w-8 h-8 p-0"
                >
                  <Minus className="w-4 h-4" />
                </Button>

                <Input
                  type="number"
                  value={item.quantity}
                  onChange={(e) => {
                    const newQuantity = Number.parseInt(e.target.value)
                    if (newQuantity > 0) {
                      updateQuantity(item.id, newQuantity)
                    }
                  }}
                  className="w-16 text-center border-green-200"
                  min="1"
                  max={item.products.stock_quantity}
                />

                <Button
                  variant="outline"
                  size="sm"
                  onClick={() => updateQuantity(item.id, item.quantity + 1)}
                  disabled={item.quantity >= item.products.stock_quantity || loadingItems.has(item.id)}
                  className="w-8 h-8 p-0"
                >
                  <Plus className="w-4 h-4" />
                </Button>
              </div>

              <div className="text-right">
                <p className="font-semibold text-green-800 select-none">
                  ${(item.products.price * item.quantity).toFixed(2)}
                </p>
                <Button
                  variant="ghost"
                  size="sm"
                  onClick={() => removeItem(item.id)}
                  disabled={loadingItems.has(item.id)}
                  className="text-red-600 hover:text-red-700 hover:bg-red-50 mt-2"
                >
                  <Trash2 className="w-4 h-4" />
                </Button>
              </div>
            </div>
          </CardContent>
        </Card>
      ))}
    </div>
  )
}
