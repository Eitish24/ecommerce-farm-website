"use client"

import { useState } from "react"
import { Button } from "@/components/ui/button"

interface Category {
  id: string
  name: string
  description: string | null
}

interface CategoryFilterProps {
  categories: Category[]
}

export function CategoryFilter({ categories }: CategoryFilterProps) {
  const [selectedCategory, setSelectedCategory] = useState<string | null>(null)

  return (
    <div className="mb-8">
      <h3 className="text-xl font-semibold text-green-800 mb-4">Shop by Category</h3>
      <div className="flex flex-wrap gap-2">
        <Button
          variant={selectedCategory === null ? "default" : "outline"}
          onClick={() => setSelectedCategory(null)}
          className="bg-green-600 hover:bg-green-700"
        >
          All Products
        </Button>
        {categories.map((category) => (
          <Button
            key={category.id}
            variant={selectedCategory === category.id ? "default" : "outline"}
            onClick={() => setSelectedCategory(category.id)}
            className="bg-green-600 hover:bg-green-700"
          >
            {category.name}
          </Button>
        ))}
      </div>
    </div>
  )
}
