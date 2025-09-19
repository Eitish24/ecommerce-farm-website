import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Package, ShoppingCart, Users, DollarSign, AlertTriangle, CheckCircle } from "lucide-react"

interface AdminStatsProps {
  stats: {
    totalProducts: number
    activeProducts: number
    lowStockProducts: number
    totalOrders: number
    pendingOrders: number
    totalRevenue: number
    totalUsers: number
  }
}

export function AdminStats({ stats }: AdminStatsProps) {
  const statCards = [
    {
      title: "Total Products",
      value: stats.totalProducts,
      icon: Package,
      description: `${stats.activeProducts} active`,
      color: "text-blue-600",
      bgColor: "bg-blue-100",
    },
    {
      title: "Total Orders",
      value: stats.totalOrders,
      icon: ShoppingCart,
      description: `${stats.pendingOrders} pending`,
      color: "text-green-600",
      bgColor: "bg-green-100",
    },
    {
      title: "Total Revenue",
      value: `$${stats.totalRevenue.toFixed(2)}`,
      icon: DollarSign,
      description: "All time",
      color: "text-emerald-600",
      bgColor: "bg-emerald-100",
    },
    {
      title: "Total Users",
      value: stats.totalUsers,
      icon: Users,
      description: "Registered customers",
      color: "text-purple-600",
      bgColor: "bg-purple-100",
    },
    {
      title: "Low Stock Items",
      value: stats.lowStockProducts,
      icon: AlertTriangle,
      description: "Need restocking",
      color: "text-orange-600",
      bgColor: "bg-orange-100",
    },
    {
      title: "Active Products",
      value: stats.activeProducts,
      icon: CheckCircle,
      description: "Currently available",
      color: "text-green-600",
      bgColor: "bg-green-100",
    },
  ]

  return (
    <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
      {statCards.map((stat, index) => (
        <Card key={index} className="border-green-100">
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium text-green-800">{stat.title}</CardTitle>
            <div className={`p-2 rounded-full ${stat.bgColor}`}>
              <stat.icon className={`w-4 h-4 ${stat.color}`} />
            </div>
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold text-green-800">{stat.value}</div>
            <p className="text-xs text-gray-600 mt-1">{stat.description}</p>
          </CardContent>
        </Card>
      ))}
    </div>
  )
}
