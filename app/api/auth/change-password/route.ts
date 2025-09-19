import { createClient } from "@/lib/supabase/server"
import { PasswordSecurity } from "@/lib/auth/password-security"
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
    const { currentPassword, newPassword } = await request.json()

    if (!currentPassword || !newPassword) {
      return NextResponse.json({ error: "Missing required fields" }, { status: 400 })
    }

    // Validate new password strength
    const validation = PasswordSecurity.validatePasswordStrength(newPassword)
    if (!validation.isValid) {
      return NextResponse.json(
        {
          error: "Password does not meet security requirements",
          feedback: validation.feedback,
        },
        { status: 400 },
      )
    }

    // Update password using Supabase Auth
    const { error } = await supabase.auth.updateUser({
      password: newPassword,
    })

    if (error) throw error

    // Update password change timestamp in profile
    await supabase.from("profiles").update({ password_changed_at: new Date().toISOString() }).eq("id", user.id)

    // Log security event
    await supabase.rpc("log_security_event", {
      p_user_id: user.id,
      p_event_type: "password_change",
      p_metadata: { timestamp: new Date().toISOString() },
    })

    return NextResponse.json({ success: true })
  } catch (error) {
    console.error("Password change error:", error)
    return NextResponse.json({ error: "Failed to change password" }, { status: 500 })
  }
}
