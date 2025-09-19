import { createClient } from "@/lib/supabase/server"
import { NextResponse } from "next/server"

export async function POST(request: Request) {
  const supabase = await createClient()

  const {
    data: { user },
  } = await supabase.auth.getUser()

  if (!user) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 })
  }

  const { items, totalAmount, shippingAddress, paymentMethod, orderNotes } = await request.json()

  if (!items || !totalAmount || !shippingAddress) {
    return NextResponse.json({ error: "Missing required fields" }, { status: 400 })
  }

  try {
    // Create order
    const { data: order, error: orderError } = await supabase
      .from("orders")
      .insert({
        user_id: user.id,
        total_amount: totalAmount,
        status: "pending",
        payment_status: "pending",
        payment_method: paymentMethod,
        shipping_address: shippingAddress,
        order_notes: orderNotes,
      })
      .select()
      .single()

    if (orderError) throw orderError

    // Create order items
    const orderItems = items.map((item: any) => ({
      order_id: order.id,
      product_id: item.productId,
      quantity: item.quantity,
      unit_price: item.unitPrice,
      total_price: item.unitPrice * item.quantity,
    }))

    const { error: itemsError } = await supabase.from("order_items").insert(orderItems)

    if (itemsError) throw itemsError

    // Clear cart
    const { error: cartError } = await supabase.from("cart_items").delete().eq("user_id", user.id)

    if (cartError) throw cartError

    // Simulate payment processing
    // In a real app, you would integrate with Stripe, PayPal, etc.
    const paymentSuccess = Math.random() > 0.1 // 90% success rate for demo

    if (paymentSuccess) {
      // Update order status
      await supabase
        .from("orders")
        .update({
          status: "confirmed",
          payment_status: "paid",
        })
        .eq("id", order.id)
    } else {
      // Update order status to failed
      await supabase
        .from("orders")
        .update({
          status: "cancelled",
          payment_status: "failed",
        })
        .eq("id", order.id)

      return NextResponse.json({ error: "Payment failed" }, { status: 400 })
    }

    return NextResponse.json({ orderId: order.id })
  } catch (error) {
    console.error("Order creation error:", error)
    return NextResponse.json({ error: "Failed to create order" }, { status: 500 })
  }
}
