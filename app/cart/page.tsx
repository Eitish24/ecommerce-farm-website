import { redirect } from "next/navigation"
import { createClient } from "@/lib/supabase/server"
import { CartItems } from "@/components/cart-items"
import { CartSummary } from "@/components/cart-summary"

export default async function CartPage() {
  const supabase = await createClient()

  const {
    data: { user },
  } = await supabase.auth.getUser()

  if (!user) {
    redirect("/auth/login")
  }

  const { data: cartItems } = await supabase
    .from("cart_items")
    .select(
      `
      *,
      products (
        id,
        name,
        price,
        image_url,
        stock_quantity,
        unit
      )
    `,
    )
    .eq("user_id", user.id)

  const items = cartItems || []

  return (
    <div className="min-h-screen bg-gradient-to-b from-green-50 to-white">
      <div className="container mx-auto px-4 py-12">
        <div className="max-w-6xl mx-auto">
          <div className="text-center mb-8">
            <h1 className="text-3xl font-bold text-green-800 mb-2">Shopping Cart</h1>
            <p className="text-green-600">Review your fresh selections</p>
          </div>

          {items.length === 0 ? (
            <div className="text-center py-12">
              <div className="w-24 h-24 bg-green-100 rounded-full flex items-center justify-center mx-auto mb-4">
                <span className="text-4xl">🛒</span>
              </div>
              <h2 className="text-xl font-semibold text-green-800 mb-2">Your cart is empty</h2>
              <p className="text-green-600 mb-6">Add some fresh vegetables to get started!</p>
              <a
                href="/"
                className="inline-flex items-center px-6 py-3 bg-green-600 text-white rounded-lg hover:bg-green-700 transition-colors"
              >
                Continue Shopping
              </a>
            </div>
          ) : (
            <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
              <div className="lg:col-span-2">
                <CartItems items={items} />
              </div>
              <div className="lg:col-span-1">
                <CartSummary items={items} />
              </div>
            </div>
          )}
        </div>
      </div>
    </div>
  )
}
