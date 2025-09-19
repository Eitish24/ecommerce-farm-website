import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Badge } from "@/components/ui/badge"
import { Button } from "@/components/ui/button"
import { Eye } from "lucide-react"

interface Order {
  id: string
  total_amount: number
  status: string
  created_at: string
  profiles: {
    full_name: string | null
    email: string
  } | null
}

interface RecentOrdersProps {
  orders: Order[]
}

export function RecentOrders({ orders }: RecentOrdersProps) {
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
    <Card className="border-green-100">
      <CardHeader>
        <CardTitle className="text-green-800">Recent Orders</CardTitle>
      </CardHeader>
      <CardContent>
        <div className="space-y-4">
          {orders.length === 0 ? (
            <p className="text-gray-500 text-center py-4">No orders yet</p>
          ) : (
            orders.map((order) => (
              <div key={order.id} className="flex items-center justify-between p-4 border border-green-100 rounded-lg">
                <div className="flex-grow">
                  <div className="flex items-center space-x-3">
                    <div>
                      <p className="font-medium text-green-800">#{order.id.slice(0, 8).toUpperCase()}</p>
                      <p className="text-sm text-gray-600">
                        {order.profiles?.full_name || order.profiles?.email || "Unknown Customer"}
                      </p>
                    </div>
                  </div>
                  <div className="flex items-center space-x-4 mt-2">
                    <span className="font-semibold text-green-700">${order.total_amount.toFixed(2)}</span>
                    <Badge className={getStatusColor(order.status)}>{order.status}</Badge>
                    <span className="text-xs text-gray-500">{new Date(order.created_at).toLocaleDateString()}</span>
                  </div>
                </div>
                <Button
                  variant="outline"
                  size="sm"
                  className="border-green-200 text-green-700 hover:bg-green-50 bg-transparent"
                >
                  <Eye className="w-4 h-4" />
                </Button>
              </div>
            ))
          )}
        </div>
      </CardContent>
    </Card>
  )
}
