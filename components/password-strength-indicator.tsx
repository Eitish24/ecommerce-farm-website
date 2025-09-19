"use client"

import { useState, useEffect } from "react"
import { Progress } from "@/components/ui/progress"
import { PasswordSecurity } from "@/lib/auth/password-security"
import { CheckCircle, XCircle, AlertCircle } from "lucide-react"

interface PasswordStrengthIndicatorProps {
  password: string
  onValidationChange?: (isValid: boolean) => void
}

export function PasswordStrengthIndicator({ password, onValidationChange }: PasswordStrengthIndicatorProps) {
  const [strength, setStrength] = useState({ isValid: false, score: 0, feedback: [] as string[] })

  useEffect(() => {
    if (password) {
      const validation = PasswordSecurity.validatePasswordStrength(password)
      setStrength(validation)
      onValidationChange?.(validation.isValid)
    } else {
      setStrength({ isValid: false, score: 0, feedback: [] })
      onValidationChange?.(false)
    }
  }, [password, onValidationChange])

  if (!password) return null

  const getStrengthColor = (score: number) => {
    if (score >= 8) return "bg-green-500"
    if (score >= 6) return "bg-yellow-500"
    if (score >= 4) return "bg-orange-500"
    return "bg-red-500"
  }

  const getStrengthText = (score: number) => {
    if (score >= 8) return "Very Strong"
    if (score >= 6) return "Strong"
    if (score >= 4) return "Medium"
    if (score >= 2) return "Weak"
    return "Very Weak"
  }

  return (
    <div className="space-y-3">
      <div className="space-y-2">
        <div className="flex items-center justify-between text-sm">
          <span className="text-gray-600">Password Strength</span>
          <span
            className={`font-medium ${strength.score >= 6 ? "text-green-600" : strength.score >= 4 ? "text-yellow-600" : "text-red-600"}`}
          >
            {getStrengthText(strength.score)}
          </span>
        </div>
        <Progress value={(strength.score / 10) * 100} className="h-2" />
      </div>

      {strength.feedback.length > 0 && (
        <div className="space-y-1">
          {strength.feedback.map((item, index) => (
            <div key={index} className="flex items-center text-xs text-red-600">
              <XCircle className="w-3 h-3 mr-2 flex-shrink-0" />
              <span>{item}</span>
            </div>
          ))}
        </div>
      )}

      {strength.isValid && (
        <div className="flex items-center text-xs text-green-600">
          <CheckCircle className="w-3 h-3 mr-2" />
          <span>Password meets security requirements</span>
        </div>
      )}

      <div className="bg-blue-50 border border-blue-200 rounded-md p-3">
        <div className="flex items-start">
          <AlertCircle className="w-4 h-4 text-blue-600 mt-0.5 mr-2 flex-shrink-0" />
          <div className="text-xs text-blue-700">
            <p className="font-medium mb-1">Security Tips:</p>
            <ul className="space-y-1">
              <li>• Use at least 12 characters</li>
              <li>• Mix uppercase, lowercase, numbers, and symbols</li>
              <li>• Avoid common words and patterns</li>
              <li>• Don't reuse passwords from other accounts</li>
            </ul>
          </div>
        </div>
      </div>
    </div>
  )
}
