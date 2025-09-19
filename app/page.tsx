import { createClient } from "@/lib/supabase/server"
import { ProductGrid } from "@/components/product-grid"
import { CategoryFilter } from "@/components/category-filter"
import { HeroSection } from "@/components/hero-section"

export default async function HomePage() {
  const supabase = await createClient()

  // Fetch categories and products
  const [categoriesResult, productsResult] = await Promise.all([
    supabase.from("categories").select("*").order("name"),
    supabase
      .from("products")
      .select(`
      *,
      categories (
        id,
        name
      )
    `)
      .eq("is_active", true)
      .order("created_at", { ascending: false }),
  ])

  const categories = categoriesResult.data || []
  const products = productsResult.data || []

  return (
    <div className="min-h-screen bg-gradient-to-b from-green-50 to-white">
      <HeroSection />

      <main className="container mx-auto px-4 py-12">
        <div className="text-center mb-12">
          <h2 className="text-3xl font-bold text-green-800 mb-4">Farm2Home Fresh</h2>
          <p className="text-lg text-green-600 max-w-2xl mx-auto">
            Discover the finest selection of fresh, locally grown vegetables. From Farm2Home to your table, we ensure
            quality and freshness in every harvest.
          </p>
        </div>

        <CategoryFilter categories={categories} />
        <ProductGrid products={products} />
      </main>
    </div>
  )
}
