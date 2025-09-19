import { redirect } from "next/navigation"
import { createClient } from "@/lib/supabase/server"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import Link from "next/link"
import { CheckCircle, Truck, Calendar } from "lucide-react"

interface PageProps {
  searchParams: Promise<{ orderId?: string }>
}

export default async function CheckoutSuccessPage({ searchParams }: PageProps) {
  const supabase = await createClient()
  const params = await searchParams

  const {
    data: { user },
  } = await supabase.auth.getUser()

  if (!user) {
    redirect("/auth/login")
  }

  if (!params.orderId) {
    redirect("/")
  }

  // Get order details
  const { data: order } = await supabase
    .from("orders")
    .select(
      `
      *,
      order_items (
        *,
        products (
          name,
          image_url
        )
      )
    `,
    )
    .eq("id", params.orderId)
    .eq("user_id", user.id)
    .single()

  if (!order) {
    redirect("/")
  }

  const estimatedDelivery = new Date()
  estimatedDelivery.setDate(estimatedDelivery.getDate() + 2)

  return (
    <div className="min-h-screen bg-gradient-to-b from-green-50 to-white">
      <div className="container mx-auto px-4 py-12">
        <div className="max-w-2xl mx-auto">
          <div className="text-center mb-8">
            <div className="w-20 h-20 bg-green-100 rounded-full flex items-center justify-center mx-auto mb-4">
              <CheckCircle className="w-10 h-10 text-green-600" />
            </div>
            <h1 className="text-3xl font-bold text-green-800 mb-2">Order Confirmed!</h1>
            <p className="text-green-600">Thank you for your purchase. Your fresh vegetables are on their way!</p>
          </div>

          <Card className="border-green-100 mb-6">
            <CardHeader>
              <CardTitle className="text-green-800">Order Details</CardTitle>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="grid grid-cols-2 gap-4 text-sm">
                <div>
                  <span className="text-gray-600">Order Number:</span>
                  <p className="font-medium text-green-800">#{order.id.slice(0, 8).toUpperCase()}</p>
                </div>
                <div>
                  <span className="text-gray-600">Total Amount:</span>
                  <p className="font-medium text-green-800">${order.total_amount.toFixed(2)}</p>
                </div>
                <div>
                  <span className="text-gray-600">Payment Status:</span>
                  <p className="font-medium text-green-600 capitalize">{order.payment_status}</p>
                </div>
                <div>
                  <span className="text-gray-600">Order Status:</span>
                  <p className="font-medium text-green-600 capitalize">{order.status}</p>
                </div>
              </div>

              <div className="border-t pt-4">
                <h4 className="font-medium text-green-800 mb-2">Items Ordered:</h4>
                <div className="space-y-2">
                  {order.order_items.map((item: any) => (
                    <div key={item.id} className="flex justify-between text-sm">
                      <span className="text-gray-600">
                        {item.products.name} × {item.quantity}
                      </span>
                      <span className="text-green-800">${item.total_price.toFixed(2)}</span>
                    </div>
                  ))}
                </div>
              </div>

              <div className="border-t pt-4">
                <h4 className="font-medium text-green-800 mb-2">Shipping Address:</h4>
                <div className="text-sm text-gray-600">
                  <p>{order.shipping_address.fullName}</p>
                  <p>{order.shipping_address.street}</p>
                  <p>
                    {order.shipping_address.city}, {order.shipping_address.state} {order.shipping_address.zip}
                  </p>
                  <p>{order.shipping_address.phone}</p>
                </div>
              </div>
            </CardContent>
          </Card>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-4 mb-6">
            <Card className="border-green-100">
              <CardContent className="p-4 text-center">
                <Truck className="w-8 h-8 text-green-600 mx-auto mb-2" />
                <h3 className="font-medium text-green-800 mb-1">Free Delivery</h3>
                <p className="text-sm text-gray-600">Your order will be delivered within 24-48 hours</p>
              </CardContent>
            </Card>

            <Card className="border-green-100">
              <CardContent className="p-4 text-center">
                <Calendar className="w-8 h-8 text-green-600 mx-auto mb-2" />
                <h3 className="font-medium text-green-800 mb-1">Estimated Delivery</h3>
                <p className="text-sm text-gray-600">{estimatedDelivery.toLocaleDateString()}</p>
              </CardContent>
            </Card>
          </div>

          <div className="text-center space-y-4">
            <p className="text-sm text-gray-600">
              We'll send you email updates about your order status and delivery information.
            </p>
            <div className="flex flex-col sm:flex-row gap-4 justify-center">
              <Button asChild className="bg-green-600 hover:bg-green-700">
                <Link href="/orders">View My Orders</Link>
              </Button>
              <Button
                asChild
                variant="outline"
                className="border-green-200 text-green-700 hover:bg-green-50 bg-transparent"
              >
                <Link href="/">Continue Shopping</Link>
              </Button>
            </div>
          </div>
        </div>
      </div>
    </div>
  )
}
