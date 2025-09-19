"use client"

import type React from "react"

import { createClient } from "@/lib/supabase/client"
import { Button } from "@/components/ui/button"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { PasswordStrengthIndicator } from "@/components/password-strength-indicator"
import Link from "next/link"
import { useRouter } from "next/navigation"
import { useState } from "react"
import { Leaf } from "lucide-react"

export default function RegisterPage() {
  const [email, setEmail] = useState("")
  const [password, setPassword] = useState("")
  const [confirmPassword, setConfirmPassword] = useState("")
  const [fullName, setFullName] = useState("")
  const [phone, setPhone] = useState("")
  const [error, setError] = useState<string | null>(null)
  const [isLoading, setIsLoading] = useState(false)
  const [isPasswordValid, setIsPasswordValid] = useState(false)
  const router = useRouter()

  const handleRegister = async (e: React.FormEvent) => {
    e.preventDefault()
    const supabase = createClient()
    setIsLoading(true)
    setError(null)

    if (password !== confirmPassword) {
      setError("Passwords do not match")
      setIsLoading(false)
      return
    }

    if (!isPasswordValid) {
      setError("Password does not meet security requirements")
      setIsLoading(false)
      return
    }

    try {
      const { error } = await supabase.auth.signUp({
        email,
        password,
        options: {
          emailRedirectTo: process.env.NEXT_PUBLIC_DEV_SUPABASE_REDIRECT_URL || `${window.location.origin}/`,
          data: {
            full_name: fullName,
            phone: phone,
          },
        },
      })
      if (error) throw error
      router.push("/auth/verify-email")
    } catch (error: unknown) {
      setError(error instanceof Error ? error.message : "An error occurred")
    } finally {
      setIsLoading(false)
    }
  }

  return (
    <div className="min-h-screen bg-gradient-to-b from-green-50 to-white flex items-center justify-center p-6">
      <div className="w-full max-w-md">
        <div className="text-center mb-8">
          <div className="flex items-center justify-center space-x-2 mb-4">
            <div className="w-10 h-10 bg-green-600 rounded-full flex items-center justify-center">
              <Leaf className="w-5 h-5 text-white" />
            </div>
            <span className="font-playfair text-2xl font-bold text-green-800">Farm2Home</span>
          </div>
          <p className="text-green-600">Join our community of fresh food lovers</p>
        </div>

        <Card className="border-green-100 shadow-lg">
          <CardHeader className="text-center">
            <CardTitle className="text-2xl text-green-800">Create Account</CardTitle>
            <CardDescription className="text-green-600">Sign up to start shopping for fresh vegetables</CardDescription>
          </CardHeader>
          <CardContent>
            <form onSubmit={handleRegister}>
              <div className="flex flex-col gap-4">
                <div className="grid gap-2">
                  <Label htmlFor="fullName" className="text-green-700">
                    Full Name
                  </Label>
                  <Input
                    id="fullName"
                    type="text"
                    placeholder="Rajesh Kumar"
                    required
                    value={fullName}
                    onChange={(e) => setFullName(e.target.value)}
                    className="border-green-200 focus:border-green-500"
                  />
                </div>
                <div className="grid gap-2">
                  <Label htmlFor="email" className="text-green-700">
                    Email
                  </Label>
                  <Input
                    id="email"
                    type="email"
                    placeholder="your@email.com"
                    required
                    value={email}
                    onChange={(e) => setEmail(e.target.value)}
                    className="border-green-200 focus:border-green-500"
                  />
                </div>
                <div className="grid gap-2">
                  <Label htmlFor="phone" className="text-green-700">
                    Phone Number
                  </Label>
                  <Input
                    id="phone"
                    type="tel"
                    placeholder="+91-98765-43210"
                    required
                    value={phone}
                    onChange={(e) => setPhone(e.target.value)}
                    className="border-green-200 focus:border-green-500"
                  />
                </div>
                <div className="grid gap-2">
                  <Label htmlFor="password" className="text-green-700">
                    Password
                  </Label>
                  <Input
                    id="password"
                    type="password"
                    placeholder="Create a strong password"
                    required
                    value={password}
                    onChange={(e) => setPassword(e.target.value)}
                    className="border-green-200 focus:border-green-500"
                  />
                  <PasswordStrengthIndicator password={password} onValidationChange={setIsPasswordValid} />
                </div>
                <div className="grid gap-2">
                  <Label htmlFor="confirmPassword" className="text-green-700">
                    Confirm Password
                  </Label>
                  <Input
                    id="confirmPassword"
                    type="password"
                    placeholder="Repeat your password"
                    required
                    value={confirmPassword}
                    onChange={(e) => setConfirmPassword(e.target.value)}
                    className={`border-green-200 focus:border-green-500 ${
                      confirmPassword && password !== confirmPassword ? "border-red-300" : ""
                    }`}
                  />
                  {confirmPassword && password !== confirmPassword && (
                    <p className="text-xs text-red-600">Passwords do not match</p>
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
                  disabled={isLoading || !isPasswordValid || password !== confirmPassword}
                >
                  {isLoading ? "Creating account..." : "Create Account"}
                </Button>
              </div>
              <div className="mt-6 text-center text-sm">
                <span className="text-gray-600">Already have an account? </span>
                <Link
                  href="/auth/login"
                  className="text-green-600 hover:text-green-700 font-medium underline underline-offset-4"
                >
                  Sign in
                </Link>
              </div>
            </form>
          </CardContent>
        </Card>
      </div>
    </div>
  )
}
