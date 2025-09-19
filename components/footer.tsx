import Link from "next/link"
import { Leaf, Mail, Phone, MapPin } from "lucide-react"

export function Footer() {
  return (
    <footer className="bg-green-800 text-white">
      <div className="container mx-auto px-4 py-12">
        <div className="grid grid-cols-1 md:grid-cols-4 gap-8">
          {/* Brand */}
          <div className="space-y-4">
            <div className="flex items-center space-x-2">
              <div className="w-8 h-8 bg-white rounded-full flex items-center justify-center">
                <Leaf className="w-4 h-4 text-green-600" />
              </div>
              <span className="font-playfair text-xl font-bold">Farm2Home</span>
            </div>
            <p className="text-green-200 text-sm">
              Bringing you the freshest vegetables straight from Farm2Home's sustainable farms to your table.
            </p>
          </div>

          {/* Quick Links */}
          <div>
            <h3 className="font-semibold mb-4">Quick Links</h3>
            <ul className="space-y-2 text-sm">
              <li>
                <Link href="/" className="text-green-200 hover:text-white">
                  Home
                </Link>
              </li>
              <li>
                <Link href="/products" className="text-green-200 hover:text-white">
                  Products
                </Link>
              </li>
              <li>
                <Link href="/about" className="text-green-200 hover:text-white">
                  About Us
                </Link>
              </li>
              <li>
                <Link href="/contact" className="text-green-200 hover:text-white">
                  Contact
                </Link>
              </li>
            </ul>
          </div>

          {/* Customer Service */}
          <div>
            <h3 className="font-semibold mb-4">Customer Service</h3>
            <ul className="space-y-2 text-sm">
              <li>
                <Link href="/shipping" className="text-green-200 hover:text-white">
                  Shipping Info
                </Link>
              </li>
              <li>
                <Link href="/returns" className="text-green-200 hover:text-white">
                  Returns
                </Link>
              </li>
              <li>
                <Link href="/faq" className="text-green-200 hover:text-white">
                  FAQ
                </Link>
              </li>
              <li>
                <Link href="/support" className="text-green-200 hover:text-white">
                  Support
                </Link>
              </li>
            </ul>
          </div>

          {/* Contact Info */}
          <div>
            <h3 className="font-semibold mb-4">Contact Us</h3>
            <div className="space-y-2 text-sm text-green-200">
              <div className="flex items-center space-x-2">
                <Phone className="w-4 h-4" />
                <span>(555) 123-4567</span>
              </div>
              <div className="flex items-center space-x-2">
                <Mail className="w-4 h-4" />
                <span>hello@farm2home.com</span>
              </div>
              <div className="flex items-center space-x-2">
                <MapPin className="w-4 h-4" />
                <span>123 Farm Road, Green Valley</span>
              </div>
            </div>
          </div>
        </div>

        <div className="border-t border-green-700 mt-8 pt-8 text-center text-sm text-green-200">
          <p>&copy; 2024 Farm2Home. All rights reserved. | Privacy Policy | Terms of Service</p>
        </div>
      </div>
    </footer>
  )
}
