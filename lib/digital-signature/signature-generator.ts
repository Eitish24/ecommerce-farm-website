import { createHash, createSign, createVerify, generateKeyPairSync } from "crypto"

export interface DigitalSignature {
  signature: string
  timestamp: string
  algorithm: string
  publicKey: string
  documentHash: string
}

export interface SignableDocument {
  orderId: string
  userId: string
  totalAmount: number
  items: any[]
  shippingAddress: any
  timestamp: string
}

export class DigitalSignatureGenerator {
  private static readonly ALGORITHM = "RSA-SHA256"

  // Generate key pair for signing (in production, store securely)
  static generateKeyPair() {
    return generateKeyPairSync("rsa", {
      modulusLength: 2048,
      publicKeyEncoding: {
        type: "spki",
        format: "pem",
      },
      privateKeyEncoding: {
        type: "pkcs8",
        format: "pem",
      },
    })
  }

  // Create document hash for integrity verification
  static createDocumentHash(document: SignableDocument): string {
    const documentString = JSON.stringify(document, Object.keys(document).sort())
    return createHash("sha256").update(documentString).digest("hex")
  }

  // Sign a document (invoice/order)
  static signDocument(document: SignableDocument, privateKey: string): DigitalSignature {
    const documentHash = this.createDocumentHash(document)
    const sign = createSign(this.ALGORITHM)

    sign.update(documentHash)
    const signature = sign.sign(privateKey, "base64")

    // Generate corresponding public key for verification
    const { publicKey } = this.generateKeyPair()

    return {
      signature,
      timestamp: new Date().toISOString(),
      algorithm: this.ALGORITHM,
      publicKey,
      documentHash,
    }
  }

  // Verify document signature
  static verifySignature(document: SignableDocument, digitalSignature: DigitalSignature): boolean {
    try {
      const documentHash = this.createDocumentHash(document)

      // Verify document hasn't been tampered with
      if (documentHash !== digitalSignature.documentHash) {
        return false
      }

      const verify = createVerify(digitalSignature.algorithm)
      verify.update(documentHash)

      return verify.verify(digitalSignature.publicKey, digitalSignature.signature, "base64")
    } catch (error) {
      console.error("Signature verification error:", error)
      return false
    }
  }

  // Generate invoice signature with additional metadata
  static generateInvoiceSignature(orderId: string, invoiceData: any, companyInfo: any): DigitalSignature {
    const document: SignableDocument = {
      orderId,
      userId: invoiceData.userId,
      totalAmount: invoiceData.totalAmount,
      items: invoiceData.items,
      shippingAddress: invoiceData.shippingAddress,
      timestamp: new Date().toISOString(),
    }

    // In production, use secure private key storage
    const privateKey = process.env.INVOICE_SIGNING_KEY || this.generateKeyPair().privateKey

    return this.signDocument(document, privateKey)
  }

  // Create tamper-evident seal for documents
  static createTamperSeal(documentContent: string): string {
    const timestamp = new Date().toISOString()
    const combined = `${documentContent}:${timestamp}:${process.env.TAMPER_SEAL_SECRET || "default-secret"}`

    return createHash("sha256").update(combined).digest("hex")
  }

  // Verify tamper seal
  static verifyTamperSeal(documentContent: string, seal: string, timestamp: string): boolean {
    const combined = `${documentContent}:${timestamp}:${process.env.TAMPER_SEAL_SECRET || "default-secret"}`
    const expectedSeal = createHash("sha256").update(combined).digest("hex")

    return seal === expectedSeal
  }
}
