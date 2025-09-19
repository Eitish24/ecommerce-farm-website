import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import Link from "next/link"
import { Mail, Leaf } from "lucide-react"

export default function VerifyEmailPage() {
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
        </div>

        <Card className="border-green-100 shadow-lg">
          <CardHeader className="text-center">
            <div className="w-16 h-16 bg-green-100 rounded-full flex items-center justify-center mx-auto mb-4">
              <Mail className="w-8 h-8 text-green-600" />
            </div>
            <CardTitle className="text-2xl text-green-800">Check Your Email</CardTitle>
            <CardDescription className="text-green-600">We've sent you a verification link</CardDescription>
          </CardHeader>
          <CardContent className="text-center space-y-4">
            <p className="text-sm text-gray-600">
              We've sent a verification email to your inbox. Please click the link in the email to verify your account
              and complete your registration.
            </p>
            <div className="bg-green-50 border border-green-200 rounded-md p-4">
              <p className="text-sm text-green-700">
                <strong>Didn't receive the email?</strong> Check your spam folder or wait a few minutes for it to
                arrive.
              </p>
            </div>
            <div className="pt-4">
              <Button asChild className="w-full bg-green-600 hover:bg-green-700">
                <Link href="/auth/login">Back to Sign In</Link>
              </Button>
            </div>
          </CardContent>
        </Card>
      </div>
    </div>
  )
}
