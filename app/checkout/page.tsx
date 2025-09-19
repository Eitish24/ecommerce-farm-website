import { redirect } from "next/navigation"
import { createClient } from "@/lib/supabase/server"
import { CheckoutForm } from "@/components/checkout-form"

export default async function CheckoutPage() {
  const supabase = await createClient()

  const {
    data: { user },
  } = await supabase.auth.getUser()

  if (!user) {
    redirect("/auth/login")
  }

  // Get cart items
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

  // Get user profile
  const { data: profile } = await supabase.from("profiles").select("*").eq("id", user.id).single()

  const items = cartItems || []

  if (items.length === 0) {
    redirect("/cart")
  }

  return (
    <div className="min-h-screen bg-gradient-to-b from-green-50 to-white">
      <div className="container mx-auto px-4 py-12">
        <div className="max-w-4xl mx-auto">
          <div className="text-center mb-8">
            <h1 className="text-3xl font-bold text-green-800 mb-2">Checkout</h1>
            <p className="text-green-600">Complete your fresh vegetable order</p>
          </div>

          <CheckoutForm items={items} profile={profile} />
        </div>
      </div>
    </div>
  )
}
