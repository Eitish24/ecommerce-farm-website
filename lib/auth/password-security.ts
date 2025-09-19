export class PasswordSecurity {
  // Password strength validation (browser-compatible)
  static validatePasswordStrength(password: string): {
    isValid: boolean
    score: number
    feedback: string[]
  } {
    const feedback: string[] = []
    let score = 0

    // Length check
    if (password.length >= 12) {
      score += 2
    } else if (password.length >= 8) {
      score += 1
    } else {
      feedback.push("Password must be at least 8 characters long")
    }

    // Character variety checks
    if (/[a-z]/.test(password)) score += 1
    else feedback.push("Include lowercase letters")

    if (/[A-Z]/.test(password)) score += 1
    else feedback.push("Include uppercase letters")

    if (/\d/.test(password)) score += 1
    else feedback.push("Include numbers")

    if (/[^a-zA-Z0-9]/.test(password)) score += 2
    else feedback.push("Include special characters")

    // Common patterns check
    if (this.hasCommonPatterns(password)) {
      score -= 2
      feedback.push('Avoid common patterns like "123" or "abc"')
    }

    // Dictionary check (simplified)
    if (this.isCommonPassword(password)) {
      score -= 3
      feedback.push("This password is too common")
    }

    return {
      isValid: score >= 5 && feedback.length === 0,
      score: Math.max(0, Math.min(10, score)),
      feedback,
    }
  }

  // Check for common patterns
  private static hasCommonPatterns(password: string): boolean {
    const patterns = [
      /123456/,
      /abcdef/,
      /qwerty/,
      /(.)\\1{2,}/, // Repeated characters
      /012345/,
      /987654/,
    ]

    return patterns.some((pattern) => pattern.test(password.toLowerCase()))
  }

  // Check against common passwords list (simplified)
  private static isCommonPassword(password: string): boolean {
    const commonPasswords = [
      "password",
      "123456",
      "password123",
      "admin",
      "qwerty",
      "letmein",
      "welcome",
      "monkey",
      "1234567890",
      "abc123",
    ]

    return commonPasswords.includes(password.toLowerCase())
  }

  static generateSecurePassword(length = 16): string {
    const charset = "abcdefghijklmnopqrstuvwxyzABCDEFGHIJKLMNOPQRSTUVWXYZ0123456789!@#$%^&*"
    const randomValues = new Uint8Array(length)

    if (typeof window !== "undefined" && window.crypto) {
      window.crypto.getRandomValues(randomValues)
    } else {
      // Fallback for server-side rendering
      for (let i = 0; i < length; i++) {
        randomValues[i] = Math.floor(Math.random() * 256)
      }
    }

    let password = ""
    for (let i = 0; i < length; i++) {
      password += charset[randomValues[i] % charset.length]
    }

    return password
  }
}
