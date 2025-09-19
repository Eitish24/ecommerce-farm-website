import { redirect } from "next/navigation"
import { createClient } from "@/lib/supabase/server"
import { AdminStats } from "@/components/admin-stats"
import { RecentOrders } from "@/components/recent-orders"
import { ProductManagement } from "@/components/product-management"

export default async function AdminPage() {
  const supabase = await createClient()

  const {
    data: { user },
  } = await supabase.auth.getUser()

  if (!user) {
    redirect("/auth/login")
  }

  // For demo purposes, we'll allow any logged-in user to access admin
  // In production, you'd check for admin role/permissions

  // Get dashboard stats
  const [productsResult, ordersResult, usersResult, recentOrdersResult] = await Promise.all([
    supabase.from("products").select("id, stock_quantity, is_active"),
    supabase.from("orders").select("id, total_amount, status, created_at"),
    supabase.from("profiles").select("id"),
    supabase
      .from("orders")
      .select(
        `
        *,
        profiles (
          full_name,
          email
        )
      `,
      )
      .order("created_at", { ascending: false })
      .limit(10),
  ])

  const products = productsResult.data || []
  const orders = ordersResult.data || []
  const users = usersResult.data || []
  const recentOrders = recentOrdersResult.data || []

  const stats = {
    totalProducts: products.length,
    activeProducts: products.filter((p) => p.is_active).length,
    lowStockProducts: products.filter((p) => p.stock_quantity < 10).length,
    totalOrders: orders.length,
    pendingOrders: orders.filter((o) => o.status === "pending").length,
    totalRevenue: orders.reduce((sum, order) => sum + Number(order.total_amount), 0),
    totalUsers: users.length,
  }

  return (
    <div className="min-h-screen bg-gradient-to-b from-green-50 to-white">
      <div className="container mx-auto px-4 py-12">
        <div className="max-w-7xl mx-auto">
          <div className="text-center mb-8">
            <h1 className="text-3xl font-bold text-green-800 mb-2">Admin Dashboard</h1>
            <p className="text-green-600">Manage your farm e-commerce platform</p>
          </div>

          <div className="space-y-8">
            <AdminStats stats={stats} />
            <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
              <RecentOrders orders={recentOrders} />
              <ProductManagement />
            </div>
          </div>
        </div>
      </div>
    </div>
  )
}
