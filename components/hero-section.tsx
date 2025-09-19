import { Button } from "@/components/ui/button"

export function HeroSection() {
  return (
    <section className="relative bg-gradient-to-r from-green-600 to-green-700 text-white py-20">
      <div className="absolute inset-0 bg-black/20"></div>
      <div className="relative container mx-auto px-4 text-center">
        <h1 className="text-5xl font-bold mb-6 text-balance">
          Farm Fresh Vegetables
          <span className="block text-green-200">Delivered to Your Door</span>
        </h1>
        <p className="text-xl mb-8 text-green-100 max-w-2xl mx-auto text-pretty">
          Experience the taste of nature with our premium selection of organic and locally grown vegetables. Fresh,
          healthy, and sustainably farmed just for you.
        </p>
        <div className="flex flex-col sm:flex-row gap-4 justify-center">
          <Button size="lg" className="bg-white text-green-700 hover:bg-green-50">
            Shop Now
          </Button>
          <Button
            size="lg"
            variant="outline"
            className="border-white text-white hover:bg-white hover:text-green-700 bg-transparent"
          >
            Learn More
          </Button>
        </div>
      </div>
    </section>
  )
}
