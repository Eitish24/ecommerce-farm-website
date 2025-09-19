// Payment data encryption utilities
export class PaymentEncryption {
  private static readonly ALGORITHM = "AES-256-GCM"

  // Encrypt sensitive payment data
  static async encryptPaymentData(data: any): Promise<string> {
    // In production, use proper encryption with environment keys
    const crypto = await import("crypto")
    const key = crypto.scryptSync(process.env.PAYMENT_ENCRYPTION_KEY || "default-key", "salt", 32)
    const iv = crypto.randomBytes(16)
    const cipher = crypto.createCipher("aes-256-cbc", key)

    let encrypted = cipher.update(JSON.stringify(data), "utf8", "hex")
    encrypted += cipher.final("hex")

    return `${iv.toString("hex")}:${encrypted}`
  }

  // Decrypt payment data
  static async decryptPaymentData(encryptedData: string): Promise<any> {
    const crypto = await import("crypto")
    const key = crypto.scryptSync(process.env.PAYMENT_ENCRYPTION_KEY || "default-key", "salt", 32)
    const [ivHex, encrypted] = encryptedData.split(":")
    const iv = Buffer.from(ivHex, "hex")
    const decipher = crypto.createDecipher("aes-256-cbc", key)

    let decrypted = decipher.update(encrypted, "hex", "utf8")
    decrypted += decipher.final("utf8")

    return JSON.parse(decrypted)
  }

  // Tokenize card number (PCI compliance)
  static tokenizeCard(cardNumber: string): string {
    const last4 = cardNumber.slice(-4)
    const masked = "*".repeat(cardNumber.length - 4) + last4
    return masked
  }

  // Validate card number using Luhn algorithm
  static validateCardNumber(cardNumber: string): boolean {
    const digits = cardNumber.replace(/\D/g, "")
    let sum = 0
    let isEven = false

    for (let i = digits.length - 1; i >= 0; i--) {
      let digit = Number.parseInt(digits[i])

      if (isEven) {
        digit *= 2
        if (digit > 9) {
          digit -= 9
        }
      }

      sum += digit
      isEven = !isEven
    }

    return sum % 10 === 0
  }
}
