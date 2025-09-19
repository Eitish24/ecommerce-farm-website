"use client"

import type React from "react"

import { useState } from "react"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { PasswordStrengthIndicator } from "@/components/password-strength-indicator"
import { Lock, Shield } from "lucide-react"

export function ChangePasswordForm() {
  const [currentPassword, setCurrentPassword] = useState("")
  const [newPassword, setNewPassword] = useState("")
  const [confirmPassword, setConfirmPassword] = useState("")
  const [isLoading, setIsLoading] = useState(false)
  const [isPasswordValid, setIsPasswordValid] = useState(false)
  const [message, setMessage] = useState<{ type: "success" | "error"; text: string } | null>(null)

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    setIsLoading(true)
    setMessage(null)

    if (newPassword !== confirmPassword) {
      setMessage({ type: "error", text: "New passwords do not match" })
      setIsLoading(false)
      return
    }

    if (!isPasswordValid) {
      setMessage({ type: "error", text: "New password does not meet security requirements" })
      setIsLoading(false)
      return
    }

    try {
      const response = await fetch("/api/auth/change-password", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({
          currentPassword,
          newPassword,
        }),
      })

      const data = await response.json()

      if (!response.ok) {
        throw new Error(data.error || "Failed to change password")
      }

      setMessage({ type: "success", text: "Password changed successfully" })
      setCurrentPassword("")
      setNewPassword("")
      setConfirmPassword("")
    } catch (error: any) {
      setMessage({ type: "error", text: error.message })
    } finally {
      setIsLoading(false)
    }
  }

  return (
    <Card className="border-green-100">
      <CardHeader>
        <CardTitle className="text-green-800 flex items-center">
          <Lock className="w-5 h-5 mr-2" />
          Change Password
        </CardTitle>
      </CardHeader>
      <CardContent>
        <form onSubmit={handleSubmit} className="space-y-4">
          <div>
            <Label htmlFor="currentPassword" className="text-green-700">
              Current Password
            </Label>
            <Input
              id="currentPassword"
              type="password"
              required
              value={currentPassword}
              onChange={(e) => setCurrentPassword(e.target.value)}
              className="border-green-200 focus:border-green-500"
            />
          </div>

          <div>
            <Label htmlFor="newPassword" className="text-green-700">
              New Password
            </Label>
            <Input
              id="newPassword"
              type="password"
              required
              value={newPassword}
              onChange={(e) => setNewPassword(e.target.value)}
              className="border-green-200 focus:border-green-500"
            />
            <PasswordStrengthIndicator password={newPassword} onValidationChange={setIsPasswordValid} />
          </div>

          <div>
            <Label htmlFor="confirmNewPassword" className="text-green-700">
              Confirm New Password
            </Label>
            <Input
              id="confirmNewPassword"
              type="password"
              required
              value={confirmPassword}
              onChange={(e) => setConfirmPassword(e.target.value)}
              className={`border-green-200 focus:border-green-500 ${
                confirmPassword && newPassword !== confirmPassword ? "border-red-300" : ""
              }`}
            />
            {confirmPassword && newPassword !== confirmPassword && (
              <p className="text-xs text-red-600 mt-1">Passwords do not match</p>
            )}
          </div>

          {message && (
            <div
              className={`border rounded-md p-3 ${
                message.type === "success"
                  ? "bg-green-50 border-green-200 text-green-700"
                  : "bg-red-50 border-red-200 text-red-700"
              }`}
            >
              <p className="text-sm">{message.text}</p>
            </div>
          )}

          <Button
            type="submit"
            className="w-full bg-green-600 hover:bg-green-700"
            disabled={isLoading || !isPasswordValid || newPassword !== confirmPassword}
          >
            {isLoading ? "Changing Password..." : "Change Password"}
          </Button>

          <div className="flex items-center justify-center space-x-2 text-xs text-gray-500">
            <Shield className="w-3 h-3" />
            <span>Your password is encrypted and secure</span>
          </div>
        </form>
      </CardContent>
    </Card>
  )
}
