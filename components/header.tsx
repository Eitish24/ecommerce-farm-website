"use client"

import { Button } from "@/components/ui/button"
import { ShoppingCart, User, Menu, LogOut, Settings } from "lucide-react"
import Link from "next/link"
import { useState, useEffect } from "react"
import { createClient } from "@/lib/supabase/client"
import type { User as SupabaseUser } from "@supabase/supabase-js"
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu"
import { useRouter } from "next/navigation"

export function Header() {
  const [isMenuOpen, setIsMenuOpen] = useState(false)
  const [user, setUser] = useState<SupabaseUser | null>(null)
  const [isLoading, setIsLoading] = useState(true)
  const [cartCount, setCartCount] = useState(0)
  const supabase = createClient()
  const router = useRouter()

  useEffect(() => {
    // Get initial user
    const getUser = async () => {
      const {
        data: { user },
      } = await supabase.auth.getUser()
      setUser(user)
      setIsLoading(false)

      // Get cart count if user is logged in
      if (user) {
        getCartCount(user.id)
      }
    }

    getUser()

    // Listen for auth changes
    const {
      data: { subscription },
    } = supabase.auth.onAuthStateChange((event, session) => {
      setUser(session?.user ?? null)
      setIsLoading(false)

      if (session?.user) {
        getCartCount(session.user.id)
      } else {
        setCartCount(0)
      }
    })

    return () => subscription.unsubscribe()
  }, [supabase.auth])

  const getCartCount = async (userId: string) => {
    const { data } = await supabase.from("cart_items").select("quantity").eq("user_id", userId)

    if (data) {
      const totalCount = data.reduce((sum, item) => sum + item.quantity, 0)
      setCartCount(totalCount)
    }
  }

  const handleSignOut = async () => {
    await supabase.auth.signOut()
    router.push("/")
  }

  return (
    <header className="bg-white shadow-sm border-b border-green-100">
      <div className="container mx-auto px-4">
        <div className="flex items-center justify-between h-16">
          {/* Logo */}
          <Link href="/" className="flex items-center space-x-2">
            <div className="w-8 h-8 bg-green-600 rounded-full flex items-center justify-center">
              <span className="text-white font-bold text-sm">F2H</span>
            </div>
            <span className="font-playfair text-xl font-bold text-green-800">Farm2Home</span>
          </Link>

          {/* Desktop Navigation */}
          <nav className="hidden md:flex items-center space-x-8">
            <Link href="/" className="text-green-700 hover:text-green-600 font-medium">
              Home
            </Link>
            <Link href="/products" className="text-green-700 hover:text-green-600 font-medium">
              Products
            </Link>
            <Link href="/about" className="text-green-700 hover:text-green-600 font-medium">
              About
            </Link>
            <Link href="/contact" className="text-green-700 hover:text-green-600 font-medium">
              Contact
            </Link>
          </nav>

          {/* Actions */}
          <div className="flex items-center space-x-4">
            {!isLoading && (
              <>
                {user ? (
                  <DropdownMenu>
                    <DropdownMenuTrigger asChild>
                      <Button variant="ghost" size="sm" className="text-green-700 hover:text-green-600">
                        <User className="w-4 h-4 mr-2" />
                        Account
                      </Button>
                    </DropdownMenuTrigger>
                    <DropdownMenuContent align="end" className="w-48">
                      <DropdownMenuItem asChild>
                        <Link href="/profile" className="cursor-pointer">
                          <User className="w-4 h-4 mr-2" />
                          Profile
                        </Link>
                      </DropdownMenuItem>
                      <DropdownMenuItem asChild>
                        <Link href="/orders" className="cursor-pointer">
                          <ShoppingCart className="w-4 h-4 mr-2" />
                          My Orders
                        </Link>
                      </DropdownMenuItem>
                      <DropdownMenuItem asChild>
                        <Link href="/admin" className="cursor-pointer">
                          <Settings className="w-4 h-4 mr-2" />
                          Admin Dashboard
                        </Link>
                      </DropdownMenuItem>
                      <DropdownMenuSeparator />
                      <DropdownMenuItem onClick={handleSignOut} className="cursor-pointer text-red-600">
                        <LogOut className="w-4 h-4 mr-2" />
                        Sign Out
                      </DropdownMenuItem>
                    </DropdownMenuContent>
                  </DropdownMenu>
                ) : (
                  <Button asChild variant="ghost" size="sm" className="text-green-700 hover:text-green-600">
                    <Link href="/auth/login">
                      <User className="w-4 h-4 mr-2" />
                      Sign In
                    </Link>
                  </Button>
                )}
              </>
            )}

            <Button asChild variant="ghost" size="sm" className="text-green-700 hover:text-green-600 relative">
              <Link href="/cart">
                <ShoppingCart className="w-4 h-4" />
                {cartCount > 0 && (
                  <span className="absolute -top-1 -right-1 bg-green-600 text-white text-xs rounded-full w-5 h-5 flex items-center justify-center">
                    {cartCount > 99 ? "99+" : cartCount}
                  </span>
                )}
              </Link>
            </Button>
            <Button variant="ghost" size="sm" className="md:hidden" onClick={() => setIsMenuOpen(!isMenuOpen)}>
              <Menu className="w-4 h-4" />
            </Button>
          </div>
        </div>

        {/* Mobile Navigation */}
        {isMenuOpen && (
          <div className="md:hidden py-4 border-t border-green-100">
            <nav className="flex flex-col space-y-2">
              <Link href="/" className="text-green-700 hover:text-green-600 font-medium py-2">
                Home
              </Link>
              <Link href="/products" className="text-green-700 hover:text-green-600 font-medium py-2">
                Products
              </Link>
              <Link href="/about" className="text-green-700 hover:text-green-600 font-medium py-2">
                About
              </Link>
              <Link href="/contact" className="text-green-700 hover:text-green-600 font-medium py-2">
                Contact
              </Link>
            </nav>
          </div>
        )}
      </div>
    </header>
  )
}
