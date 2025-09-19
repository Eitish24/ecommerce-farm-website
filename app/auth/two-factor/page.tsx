"use client"

import type React from "react"

import { useState, useEffect } from "react"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { InputOTP, InputOTPGroup, InputOTPSlot } from "@/components/ui/input-otp"
import { createClient } from "@/lib/supabase/client"
import { useRouter } from "next/navigation"
import { Shield } from "lucide-react"

export default function TwoFactorPage() {
  const [otp, setOtp] = useState("")
  const [isLoading, setIsLoading] = useState(false)
  const [error, setError] = useState("")
  const [userPhone, setUserPhone] = useState("")
  const router = useRouter()
  const supabase = createClient()

  useEffect(() => {
    const checkUser = async () => {
      const {
        data: { user },
      } = await supabase.auth.getUser()
      if (!user) {
        router.push("/auth/login")
        return
      }

      // Get user phone from profile
      const { data: profile } = await supabase.from("profiles").select("phone").eq("id", user.id).single()

      if (profile?.phone) {
        setUserPhone(profile.phone)
      }
    }

    checkUser()
  }, [supabase, router])

  const handleVerifyOTP = async (e: React.FormEvent) => {
    e.preventDefault()
    setIsLoading(true)
    setError("")

    try {
      const { error } = await supabase.auth.verifyOtp({
        phone: userPhone,
        token: otp,
        type: "sms",
      })

      if (error) throw error

      // Update user session to mark 2FA as completed
      const {
        data: { user },
      } = await supabase.auth.getUser()
      if (user) {
        await supabase.from("profiles").update({ two_factor_verified: true }).eq("id", user.id)
      }

      router.push("/")
    } catch (error: any) {
      setError(error.message || "Invalid OTP")
    } finally {
      setIsLoading(false)
    }
  }

  const handleResendOTP = async () => {
    setIsLoading(true)
    setError("")

    try {
      const { error } = await supabase.auth.signInWithOtp({
        phone: userPhone,
        options: {
          channel: "sms",
        },
      })

      if (error) throw error

      alert("New OTP sent to your phone")
    } catch (error: any) {
      setError(error.message || "Failed to resend OTP")
    } finally {
      setIsLoading(false)
    }
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-green-50 to-emerald-100 flex items-center justify-center p-4">
      <div className="w-full max-w-md">
        <Card className="border-green-200 shadow-lg">
          <CardHeader className="text-center">
            <div className="mx-auto w-12 h-12 bg-green-100 rounded-full flex items-center justify-center mb-4">
              <Shield className="w-6 h-6 text-green-600" />
            </div>
            <CardTitle className="text-green-800">Two-Factor Authentication</CardTitle>
            <CardDescription>Enter the 6-digit code sent to your registered phone number</CardDescription>
          </CardHeader>
          <CardContent>
            <form onSubmit={handleVerifyOTP} className="space-y-4">
              <div className="text-center">
                <div className="mt-2 flex justify-center">
                  <InputOTP maxLength={6} value={otp} onChange={(value) => setOtp(value)}>
                    <InputOTPGroup>
                      <InputOTPSlot index={0} />
                      <InputOTPSlot index={1} />
                      <InputOTPSlot index={2} />
                      <InputOTPSlot index={3} />
                      <InputOTPSlot index={4} />
                      <InputOTPSlot index={5} />
                    </InputOTPGroup>
                  </InputOTP>
                </div>
                {userPhone && (
                  <p className="text-sm text-gray-500 mt-2">
                    Code sent to {userPhone.replace(/(\d{3})\d{3}(\d{4})/, "$1***$2")}
                  </p>
                )}
              </div>

              {error && (
                <div className="bg-red-50 border border-red-200 rounded-md p-3">
                  <p className="text-sm text-red-600">{error}</p>
                </div>
              )}

              <Button
                type="submit"
                className="w-full bg-green-600 hover:bg-green-700"
                disabled={isLoading || otp.length !== 6}
              >
                {isLoading ? "Verifying..." : "Verify & Continue"}
              </Button>

              <Button
                type="button"
                variant="outline"
                className="w-full border-green-200 text-green-600 hover:bg-green-50 bg-transparent"
                onClick={handleResendOTP}
                disabled={isLoading}
              >
                Resend Code
              </Button>
            </form>
          </CardContent>
        </Card>
      </div>
    </div>
  )
}
