import { createClient } from "@/lib/supabase/server"
import { DigitalSignatureGenerator } from "@/lib/digital-signature/signature-generator"
import { NextResponse } from "next/server"

export async function POST(request: Request, { params }: { params: Promise<{ orderId: string }> }) {
  const supabase = await createClient()
  const { orderId } = await params

  const {
    data: { user },
  } = await supabase.auth.getUser()

  if (!user) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 })
  }

  try {
    // Get order details
    const { data: order, error: orderError } = await supabase
      .from("orders")
      .select(`
        *,
        order_items (
          *,
          products (
            name,
            price
          )
        )
      `)
      .eq("id", orderId)
      .eq("user_id", user.id)
      .single()

    if (orderError || !order) {
      return NextResponse.json({ error: "Order not found" }, { status: 404 })
    }

    // Generate digital signature
    const signature = DigitalSignatureGenerator.generateInvoiceSignature(
      orderId,
      {
        userId: user.id,
        totalAmount: order.total_amount,
        items: order.order_items,
        shippingAddress: order.shipping_address,
      },
      {
        companyName: "Farm2Home",
        companyAddress: "123 Farm Street, Green Valley, CA 90210",
      },
    )

    // Store signature in database
    const { error: signatureError } = await supabase.from("order_signatures").insert({
      order_id: orderId,
      user_id: user.id,
      signature_data: signature,
      document_hash: signature.documentHash,
      is_verified: true,
      created_at: new Date().toISOString(),
    })

    if (signatureError) throw signatureError

    // Log security event
    await supabase.rpc("log_security_event", {
      p_user_id: user.id,
      p_event_type: "digital_signature_created",
      p_metadata: {
        order_id: orderId,
        signature_algorithm: signature.algorithm,
        document_hash: signature.documentHash,
      },
    })

    return NextResponse.json({ signature, isVerified: true })
  } catch (error) {
    console.error("Signature generation error:", error)
    return NextResponse.json({ error: "Failed to generate signature" }, { status: 500 })
  }
}

export async function GET(request: Request, { params }: { params: Promise<{ orderId: string }> }) {
  const supabase = await createClient()
  const { orderId } = await params

  const {
    data: { user },
  } = await supabase.auth.getUser()

  if (!user) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 })
  }

  try {
    // Get existing signature
    const { data: signatureRecord, error } = await supabase
      .from("order_signatures")
      .select("*")
      .eq("order_id", orderId)
      .eq("user_id", user.id)
      .single()

    if (error || !signatureRecord) {
      return NextResponse.json({ signature: null, isVerified: false })
    }

    return NextResponse.json({
      signature: signatureRecord.signature_data,
      isVerified: signatureRecord.is_verified,
    })
  } catch (error) {
    console.error("Signature retrieval error:", error)
    return NextResponse.json({ error: "Failed to retrieve signature" }, { status: 500 })
  }
}
