import { createClient } from "@/lib/supabase/server"
import { SecurePaymentProcessor } from "@/lib/payment/secure-processor"
import { NextResponse } from "next/server"

export async function POST(request: Request) {
  const supabase = await createClient()

  const {
    data: { user },
  } = await supabase.auth.getUser()

  if (!user) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 })
  }

  try {
    const { paymentData, orderId } = await request.json()

    if (!paymentData || !orderId) {
      return NextResponse.json({ error: "Missing payment data or order ID" }, { status: 400 })
    }

    // Process secure payment
    const result = await SecurePaymentProcessor.processPayment(paymentData, orderId)

    if (result.success) {
      // Update order with payment information
      const { error: updateError } = await supabase
        .from("orders")
        .update({
          payment_status: "paid",
          transaction_id: result.transactionId,
          payment_processed_at: new Date().toISOString(),
        })
        .eq("id", orderId)
        .eq("user_id", user.id)

      if (updateError) throw updateError

      // Log security event
      await supabase.rpc("log_security_event", {
        p_user_id: user.id,
        p_event_type: "payment_success",
        p_metadata: {
          order_id: orderId,
          transaction_id: result.transactionId,
          fraud_score: result.fraudScore,
        },
      })

      return NextResponse.json({
        success: true,
        transactionId: result.transactionId,
      })
    } else {
      // Log failed payment
      await supabase.rpc("log_security_event", {
        p_user_id: user.id,
        p_event_type: "payment_failed",
        p_metadata: {
          order_id: orderId,
          error: result.error,
          fraud_score: result.fraudScore,
        },
      })

      return NextResponse.json(
        {
          error: result.error || "Payment processing failed",
        },
        { status: 400 },
      )
    }
  } catch (error) {
    console.error("Payment processing error:", error)
    return NextResponse.json({ error: "Payment system error" }, { status: 500 })
  }
}
