"use client"

import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Badge } from "@/components/ui/badge"
import { Button } from "@/components/ui/button"
import { Shield, CheckCircle, FileText, Download, Verified } from "lucide-react"
import { useState } from "react"

interface DigitalSignature {
  signature: string
  timestamp: string
  algorithm: string
  publicKey: string
  documentHash: string
}

interface DigitalSignatureDisplayProps {
  signature: DigitalSignature | null
  orderId: string
  isVerified: boolean
  onDownloadCertificate?: () => void
}

export function DigitalSignatureDisplay({
  signature,
  orderId,
  isVerified,
  onDownloadCertificate,
}: DigitalSignatureDisplayProps) {
  const [showDetails, setShowDetails] = useState(false)

  if (!signature) {
    return (
      <Card className="border-yellow-200 bg-yellow-50">
        <CardContent className="p-4">
          <div className="flex items-center space-x-2">
            <Shield className="w-5 h-5 text-yellow-600" />
            <span className="text-sm text-yellow-700">Digital signature pending</span>
          </div>
        </CardContent>
      </Card>
    )
  }

  return (
    <Card className="border-green-100">
      <CardHeader>
        <CardTitle className="text-green-800 flex items-center">
          <Verified className="w-5 h-5 mr-2" />
          Digital Signature Certificate
        </CardTitle>
      </CardHeader>
      <CardContent className="space-y-4">
        <div className="flex items-center justify-between">
          <div className="flex items-center space-x-2">
            <CheckCircle className="w-5 h-5 text-green-600" />
            <span className="text-sm font-medium text-green-700">
              {isVerified ? "Signature Verified" : "Verification Pending"}
            </span>
          </div>
          <Badge variant={isVerified ? "default" : "secondary"} className="bg-green-100 text-green-800">
            {isVerified ? "Authentic" : "Unverified"}
          </Badge>
        </div>

        <div className="grid grid-cols-2 gap-4 text-sm">
          <div>
            <span className="text-gray-600">Order ID:</span>
            <p className="font-medium text-green-800">#{orderId.slice(0, 8).toUpperCase()}</p>
          </div>
          <div>
            <span className="text-gray-600">Signed:</span>
            <p className="font-medium text-green-800">{new Date(signature.timestamp).toLocaleDateString()}</p>
          </div>
          <div>
            <span className="text-gray-600">Algorithm:</span>
            <p className="font-medium text-green-800">{signature.algorithm}</p>
          </div>
          <div>
            <span className="text-gray-600">Document Hash:</span>
            <p className="font-mono text-xs text-green-800">{signature.documentHash.slice(0, 16)}...</p>
          </div>
        </div>

        <div className="flex items-center space-x-2">
          <Button
            variant="outline"
            size="sm"
            onClick={() => setShowDetails(!showDetails)}
            className="border-green-200 text-green-700 hover:bg-green-50"
          >
            <FileText className="w-4 h-4 mr-2" />
            {showDetails ? "Hide Details" : "View Details"}
          </Button>

          {onDownloadCertificate && (
            <Button
              variant="outline"
              size="sm"
              onClick={onDownloadCertificate}
              className="border-green-200 text-green-700 hover:bg-green-50 bg-transparent"
            >
              <Download className="w-4 h-4 mr-2" />
              Download Certificate
            </Button>
          )}
        </div>

        {showDetails && (
          <div className="bg-gray-50 rounded-md p-4 space-y-3">
            <div>
              <h4 className="text-sm font-medium text-gray-700 mb-2">Digital Signature:</h4>
              <p className="font-mono text-xs text-gray-600 break-all bg-white p-2 rounded border">
                {signature.signature}
              </p>
            </div>

            <div>
              <h4 className="text-sm font-medium text-gray-700 mb-2">Public Key (Verification):</h4>
              <p className="font-mono text-xs text-gray-600 break-all bg-white p-2 rounded border max-h-32 overflow-y-auto">
                {signature.publicKey}
              </p>
            </div>
          </div>
        )}

        <div className="bg-blue-50 border border-blue-200 rounded-md p-3">
          <div className="flex items-start">
            <Shield className="w-4 h-4 text-blue-600 mt-0.5 mr-2 flex-shrink-0" />
            <div className="text-xs text-blue-700">
              <p className="font-medium mb-1">Security Features:</p>
              <ul className="space-y-1">
                <li>• RSA-2048 encryption with SHA-256 hashing</li>
                <li>• Tamper-evident document integrity verification</li>
                <li>• Timestamped digital certificate</li>
                <li>• Non-repudiation guarantee</li>
              </ul>
            </div>
          </div>
        </div>
      </CardContent>
    </Card>
  )
}
