"use client"

import { Card, CardContent, CardFooter } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Badge } from "@/components/ui/badge"
import { ProtectedImage } from "@/components/protected-image"
import { ShoppingCart, Leaf, MapPin, Calendar } from "lucide-react"
import { useState } from "react"
import { createClient } from "@/lib/supabase/client"
import { useRouter } from "next/navigation"

interface Product {
  id: string
  name: string
  description: string
  price: number
  image_url: string
  stock_quantity: number
  unit: string
  is_organic: boolean
  harvest_date: string | null
  farm_location: string | null
  categories: {
    id: string
    name: string
  } | null
}

interface ProductCardProps {
  product: Product
}

export function ProductCard({ product }: ProductCardProps) {
  const [isLoading, setIsLoading] = useState(false)
  const [message, setMessage] = useState<string | null>(null)
  const supabase = createClient()
  const router = useRouter()

  const formatDate = (dateString: string | null) => {
    if (!dateString) return null
    return new Date(dateString).toLocaleDateString()
  }

  const addToCart = async () => {
    setIsLoading(true)
    setMessage(null)

    try {
      // Check if user is authenticated
      const {
        data: { user },
      } = await supabase.auth.getUser()

      if (!user) {
        router.push("/auth/login")
        return
      }

      const response = await fetch("/api/cart", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({
          productId: product.id,
          quantity: 1,
        }),
      })

      if (!response.ok) {
        throw new Error("Failed to add to cart")
      }

      setMessage("Added to cart!")
      setTimeout(() => setMessage(null), 2000)
    } catch (error) {
      setMessage("Failed to add to cart")
      setTimeout(() => setMessage(null), 2000)
    } finally {
      setIsLoading(false)
    }
  }

  return (
    <Card className="group hover:shadow-lg transition-shadow duration-300 border-green-100 select-none">
      <div className="relative overflow-hidden rounded-t-lg">
        <ProtectedImage
          src={product.image_url || "/placeholder.svg"}
          alt={product.name}
          width={300}
          height={200}
          className="w-full h-48 object-cover group-hover:scale-105 transition-transform duration-300"
          style={{ imageRendering: "crisp-edges" }}
        />
        {product.is_organic && (
          <Badge className="absolute top-2 left-2 bg-green-600 hover:bg-green-700">
            <Leaf className="w-3 h-3 mr-1" />
            Organic
          </Badge>
        )}
        {product.stock_quantity < 10 && product.stock_quantity > 0 && (
          <Badge variant="destructive" className="absolute top-2 right-2">
            Low Stock
          </Badge>
        )}
        {product.stock_quantity === 0 && (
          <Badge variant="destructive" className="absolute top-2 right-2">
            Out of Stock
          </Badge>
        )}
      </div>

      <CardContent className="p-4">
        <div className="flex justify-between items-start mb-2">
          <h3 className="font-semibold text-green-800 group-hover:text-green-600 transition-colors select-none">
            {product.name}
          </h3>
          <span className="text-lg font-bold text-green-700 select-none">
            ${product.price.toFixed(2)}
            <span className="text-sm font-normal text-gray-500">/{product.unit}</span>
          </span>
        </div>

        <p className="text-sm text-gray-600 mb-3 line-clamp-2 select-none">{product.description}</p>

        <div className="space-y-1 text-xs text-gray-500 select-none">
          {product.categories && (
            <div className="flex items-center gap-1">
              <Badge variant="secondary" className="text-xs select-none">
                {product.categories.name}
              </Badge>
            </div>
          )}

          {product.farm_location && (
            <div className="flex items-center gap-1">
              <MapPin className="w-3 h-3" />
              <span>{product.farm_location}</span>
            </div>
          )}

          {product.harvest_date && (
            <div className="flex items-center gap-1">
              <Calendar className="w-3 h-3" />
              <span>Harvested: {formatDate(product.harvest_date)}</span>
            </div>
          )}
        </div>
      </CardContent>

      <CardFooter className="p-4 pt-0">
        <div className="w-full space-y-2">
          <Button
            className="w-full bg-green-600 hover:bg-green-700"
            disabled={product.stock_quantity === 0 || isLoading}
            onClick={addToCart}
          >
            <ShoppingCart className="w-4 h-4 mr-2" />
            {isLoading ? "Adding..." : product.stock_quantity === 0 ? "Out of Stock" : "Add to Cart"}
          </Button>
          {message && (
            <p className={`text-sm text-center ${message.includes("Failed") ? "text-red-600" : "text-green-600"}`}>
              {message}
            </p>
          )}
        </div>
      </CardFooter>
    </Card>
  )
}
