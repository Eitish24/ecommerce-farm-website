import { redirect } from "next/navigation"
import { createClient } from "@/lib/supabase/server"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Badge } from "@/components/ui/badge"

export default async function OrdersPage() {
  const supabase = await createClient()

  const {
    data: { user },
  } = await supabase.auth.getUser()

  if (!user) {
    redirect("/auth/login")
  }

  // Get user's orders
  const { data: orders } = await supabase
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
    .eq("user_id", user.id)
    .order("created_at", { ascending: false })

  const getStatusColor = (status: string) => {
    switch (status) {
      case "pending":
        return "bg-yellow-100 text-yellow-800"
      case "confirmed":
        return "bg-blue-100 text-blue-800"
      case "processing":
        return "bg-purple-100 text-purple-800"
      case "shipped":
        return "bg-green-100 text-green-800"
      case "delivered":
        return "bg-emerald-100 text-emerald-800"
      case "cancelled":
        return "bg-red-100 text-red-800"
      default:
        return "bg-gray-100 text-gray-800"
    }
  }

  return (
    <div className="min-h-screen bg-gradient-to-b from-green-50 to-white">
      <div className="container mx-auto px-4 py-12">
        <div className="max-w-4xl mx-auto">
          <div className="text-center mb-8">
            <h1 className="text-3xl font-bold text-green-800 mb-2">My Orders</h1>
            <p className="text-green-600">Track your fresh vegetable orders</p>
          </div>

          {!orders || orders.length === 0 ? (
            <Card className="border-green-100">
              <CardContent className="text-center py-12">
                <div className="w-24 h-24 bg-green-100 rounded-full flex items-center justify-center mx-auto mb-4">
                  <span className="text-4xl">📦</span>
                </div>
                <h2 className="text-xl font-semibold text-green-800 mb-2">No orders yet</h2>
                <p className="text-green-600 mb-6">Start shopping for fresh vegetables!</p>
                <a
                  href="/"
                  className="inline-flex items-center px-6 py-3 bg-green-600 text-white rounded-lg hover:bg-green-700 transition-colors"
                >
                  Start Shopping
                </a>
              </CardContent>
            </Card>
          ) : (
            <div className="space-y-6">
              {orders.map((order: any) => (
                <Card key={order.id} className="border-green-100">
                  <CardHeader>
                    <div className="flex items-center justify-between">
                      <CardTitle className="text-green-800">Order #{order.id.slice(0, 8).toUpperCase()}</CardTitle>
                      <Badge className={getStatusColor(order.status)}>{order.status}</Badge>
                    </div>
                    <div className="flex items-center justify-between text-sm text-gray-600">
                      <span>Placed on {new Date(order.created_at).toLocaleDateString()}</span>
                      <span className="font-semibold text-green-700">${order.total_amount.toFixed(2)}</span>
                    </div>
                  </CardHeader>
                  <CardContent>
                    <div className="space-y-3">
                      <h4 className="font-medium text-green-800">Items:</h4>
                      {order.order_items.map((item: any) => (
                        <div key={item.id} className="flex items-center justify-between text-sm">
                          <span className="text-gray-600">
                            {item.products.name} × {item.quantity}
                          </span>
                          <span className="text-green-800">${item.total_price.toFixed(2)}</span>
                        </div>
                      ))}
                    </div>

                    <div className="mt-4 pt-4 border-t border-green-100">
                      <div className="grid grid-cols-1 md:grid-cols-2 gap-4 text-sm">
                        <div>
                          <h5 className="font-medium text-green-800 mb-1">Shipping Address:</h5>
                          <div className="text-gray-600">
                            <p>{order.shipping_address.fullName}</p>
                            <p>{order.shipping_address.street}</p>
                            <p>
                              {order.shipping_address.city}, {order.shipping_address.state} {order.shipping_address.zip}
                            </p>
                          </div>
                        </div>
                        <div>
                          <h5 className="font-medium text-green-800 mb-1">Payment:</h5>
                          <div className="text-gray-600">
                            <p>Method: {order.payment_method}</p>
                            <p>Status: {order.payment_status}</p>
                          </div>
                        </div>
                      </div>
                    </div>
                  </CardContent>
                </Card>
              ))}
            </div>
          )}
        </div>
      </div>
    </div>
  )
}
