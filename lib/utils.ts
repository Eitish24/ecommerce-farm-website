import { clsx, type ClassValue } from "clsx"
import { twMerge } from "tailwind-merge"

export function cn(...inputs: ClassValue[]) {
  return twMerge(clsx(inputs))
}

export function formatIndianCurrency(amount: number): string {
  return new Intl.NumberFormat("en-IN", {
    style: "currency",
    currency: "INR",
    minimumFractionDigits: 2,
  }).format(amount)
}

export function formatIndianPhone(phone: string): string {
  // Remove all non-digits
  const digits = phone.replace(/\D/g, "")

  // Format as +91-XXXXX-XXXXX for 10-digit numbers
  if (digits.length === 10) {
    return `+91-${digits.slice(0, 5)}-${digits.slice(5)}`
  }

  // If already has country code
  if (digits.length === 12 && digits.startsWith("91")) {
    return `+91-${digits.slice(2, 7)}-${digits.slice(7)}`
  }

  return phone
}

export function validateIndianPhone(phone: string): boolean {
  const digits = phone.replace(/\D/g, "")
  // Valid if 10 digits or 12 digits starting with 91
  return (
    (digits.length === 10 && /^[6-9]/.test(digits)) ||
    (digits.length === 12 && digits.startsWith("91") && /^91[6-9]/.test(digits))
  )
}

export function validateIndianPinCode(pinCode: string): boolean {
  // Indian PIN codes are 6 digits
  return /^\d{6}$/.test(pinCode)
}
