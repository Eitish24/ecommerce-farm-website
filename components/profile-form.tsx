"use client"

import type React from "react"

import { useState } from "react"
import { createClient } from "@/lib/supabase/client"
import { Button } from "@/components/ui/button"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { useRouter } from "next/navigation"
import type { User } from "@supabase/supabase-js"
import { validateIndianPhone, validateIndianPinCode } from "@/lib/utils"

interface Profile {
  id: string
  email: string
  full_name: string | null
  phone: string | null
  address: any
}

interface ProfileFormProps {
  user: User
  profile: Profile | null
}

export function ProfileForm({ user, profile }: ProfileFormProps) {
  const [fullName, setFullName] = useState(profile?.full_name || "")
  const [phone, setPhone] = useState(profile?.phone || "")
  const [street, setStreet] = useState(profile?.address?.street || "")
  const [city, setCity] = useState(profile?.address?.city || "")
  const [state, setState] = useState(profile?.address?.state || "")
  const [pinCode, setPinCode] = useState(profile?.address?.pinCode || profile?.address?.zip || "")
  const [isLoading, setIsLoading] = useState(false)
  const [message, setMessage] = useState<{ type: "success" | "error"; text: string } | null>(null)
  const router = useRouter()
  const supabase = createClient()

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    setIsLoading(true)
    setMessage(null)

    if (phone && !validateIndianPhone(phone)) {
      setMessage({ type: "error", text: "Please enter a valid Indian phone number" })
      setIsLoading(false)
      return
    }

    if (pinCode && !validateIndianPinCode(pinCode)) {
      setMessage({ type: "error", text: "Please enter a valid 6-digit PIN code" })
      setIsLoading(false)
      return
    }

    try {
      const address =
        street || city || state || pinCode
          ? {
              street,
              city,
              state,
              pinCode,
              country: "IN",
            }
          : null

      const { error } = await supabase.from("profiles").upsert({
        id: user.id,
        email: user.email!,
        full_name: fullName,
        phone: phone || null,
        address,
        updated_at: new Date().toISOString(),
      })

      if (error) throw error

      setMessage({ type: "success", text: "Profile updated successfully!" })
      router.refresh()
    } catch (error) {
      setMessage({
        type: "error",
        text: error instanceof Error ? error.message : "An error occurred",
      })
    } finally {
      setIsLoading(false)
    }
  }

  const handleSignOut = async () => {
    await supabase.auth.signOut()
    router.push("/")
  }

  return (
    <div className="space-y-6">
      <Card className="border-green-100">
        <CardHeader>
          <CardTitle className="text-green-800">Personal Information</CardTitle>
        </CardHeader>
        <CardContent>
          <form onSubmit={handleSubmit} className="space-y-4">
            <div className="grid gap-2">
              <Label htmlFor="email" className="text-green-700">
                Email
              </Label>
              <Input
                id="email"
                type="email"
                value={user.email || ""}
                disabled
                className="bg-gray-50 border-green-200"
              />
              <p className="text-xs text-gray-500">Email cannot be changed</p>
            </div>

            <div className="grid gap-2">
              <Label htmlFor="fullName" className="text-green-700">
                Full Name
              </Label>
              <Input
                id="fullName"
                type="text"
                value={fullName}
                onChange={(e) => setFullName(e.target.value)}
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
                value={phone}
                onChange={(e) => setPhone(e.target.value)}
                placeholder="+91-98765-43210"
                className="border-green-200 focus:border-green-500"
              />
            </div>

            <div className="space-y-4">
              <Label className="text-green-700 text-base font-medium">Shipping Address</Label>

              <div className="grid gap-2">
                <Label htmlFor="street" className="text-sm text-green-600">
                  Street Address
                </Label>
                <Input
                  id="street"
                  type="text"
                  value={street}
                  onChange={(e) => setStreet(e.target.value)}
                  placeholder="123 Main Street"
                  className="border-green-200 focus:border-green-500"
                />
              </div>

              <div className="grid grid-cols-2 gap-4">
                <div className="grid gap-2">
                  <Label htmlFor="city" className="text-sm text-green-600">
                    City
                  </Label>
                  <Input
                    id="city"
                    type="text"
                    value={city}
                    onChange={(e) => setCity(e.target.value)}
                    placeholder="Mumbai"
                    className="border-green-200 focus:border-green-500"
                  />
                </div>
                <div className="grid gap-2">
                  <Label htmlFor="state" className="text-sm text-green-600">
                    State
                  </Label>
                  <Input
                    id="state"
                    type="text"
                    value={state}
                    onChange={(e) => setState(e.target.value)}
                    placeholder="Maharashtra"
                    className="border-green-200 focus:border-green-500"
                  />
                </div>
              </div>

              <div className="grid gap-2">
                <Label htmlFor="pinCode" className="text-sm text-green-600">
                  PIN Code
                </Label>
                <Input
                  id="pinCode"
                  type="text"
                  value={pinCode}
                  onChange={(e) => setPinCode(e.target.value)}
                  placeholder="400001"
                  className="border-green-200 focus:border-green-500"
                />
              </div>
            </div>

            {message && (
              <div
                className={`p-3 rounded-md ${
                  message.type === "success"
                    ? "bg-green-50 border border-green-200 text-green-700"
                    : "bg-red-50 border border-red-200 text-red-700"
                }`}
              >
                <p className="text-sm">{message.text}</p>
              </div>
            )}

            <div className="flex gap-4 pt-4">
              <Button type="submit" className="bg-green-600 hover:bg-green-700" disabled={isLoading}>
                {isLoading ? "Saving..." : "Save Changes"}
              </Button>
              <Button
                type="button"
                variant="outline"
                onClick={handleSignOut}
                className="border-red-200 text-red-600 hover:bg-red-50 bg-transparent"
              >
                Sign Out
              </Button>
            </div>
          </form>
        </CardContent>
      </Card>
    </div>
  )
}
