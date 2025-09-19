"use client"

import type React from "react"

import { useState, useEffect } from "react"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Textarea } from "@/components/ui/textarea"
import { Switch } from "@/components/ui/switch"
import { Badge } from "@/components/ui/badge"
import { Plus, Edit, Trash2, Package, Upload, X } from "lucide-react"
import { createClient } from "@/lib/supabase/client"

interface Product {
  id: string
  name: string
  description: string
  price: number
  stock_quantity: number
  unit: string
  is_organic: boolean
  is_active: boolean
  image_url?: string
}

export function ProductManagement() {
  const [products, setProducts] = useState<Product[]>([])
  const [isLoading, setIsLoading] = useState(true)
  const [showAddForm, setShowAddForm] = useState(false)
  const [editingProduct, setEditingProduct] = useState<Product | null>(null)
  const [imageFile, setImageFile] = useState<File | null>(null)
  const [imagePreview, setImagePreview] = useState<string | null>(null)
  const [uploadingImage, setUploadingImage] = useState(false)
  const [formData, setFormData] = useState({
    name: "",
    description: "",
    price: "",
    stock_quantity: "",
    unit: "kg",
    is_organic: false,
    is_active: true,
  })

  const supabase = createClient()

  useEffect(() => {
    fetchProducts()
  }, [])

  const fetchProducts = async () => {
    try {
      const { data, error } = await supabase.from("products").select("*").order("created_at", { ascending: false })

      if (error) throw error
      setProducts(data || [])
    } catch (error) {
      console.error("Error fetching products:", error)
    } finally {
      setIsLoading(false)
    }
  }

  const handleImageChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0]
    if (file) {
      setImageFile(file)
      const reader = new FileReader()
      reader.onload = (e) => {
        setImagePreview(e.target?.result as string)
      }
      reader.readAsDataURL(file)
    }
  }

  const uploadImage = async (file: File): Promise<string> => {
    const formData = new FormData()
    formData.append("file", file)

    const response = await fetch("/api/upload-image", {
      method: "POST",
      body: formData,
    })

    if (!response.ok) {
      throw new Error("Failed to upload image")
    }

    const { url } = await response.json()
    return url
  }

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    setIsLoading(true)

    try {
      let imageUrl = "/placeholder.svg?height=300&width=300"

      if (imageFile) {
        setUploadingImage(true)
        try {
          imageUrl = await uploadImage(imageFile)
        } catch (error) {
          console.error("Error uploading image:", error)
          alert("Error uploading image. Using placeholder instead.")
        } finally {
          setUploadingImage(false)
        }
      } else if (editingProduct?.image_url) {
        imageUrl = editingProduct.image_url
      }

      const productData = {
        name: formData.name,
        description: formData.description,
        price: Number.parseFloat(formData.price),
        stock_quantity: Number.parseInt(formData.stock_quantity),
        unit: formData.unit,
        is_organic: formData.is_organic,
        is_active: formData.is_active,
        image_url: imageUrl,
      }

      if (editingProduct) {
        const { error } = await supabase.from("products").update(productData).eq("id", editingProduct.id)
        if (error) throw error
      } else {
        const { error } = await supabase.from("products").insert([productData])
        if (error) throw error
      }

      setFormData({
        name: "",
        description: "",
        price: "",
        stock_quantity: "",
        unit: "kg",
        is_organic: false,
        is_active: true,
      })
      setImageFile(null)
      setImagePreview(null)
      setShowAddForm(false)
      setEditingProduct(null)
      fetchProducts()
    } catch (error) {
      console.error("Error saving product:", error)
      alert("Error saving product. Please try again.")
    } finally {
      setIsLoading(false)
    }
  }

  const handleEdit = (product: Product) => {
    setEditingProduct(product)
    setFormData({
      name: product.name,
      description: product.description,
      price: product.price.toString(),
      stock_quantity: product.stock_quantity.toString(),
      unit: product.unit,
      is_organic: product.is_organic,
      is_active: product.is_active,
    })
    setImagePreview(product.image_url || null)
    setImageFile(null)
    setShowAddForm(true)
  }

  const handleDelete = async (productId: string) => {
    if (!confirm("Are you sure you want to delete this product?")) return

    try {
      const { error } = await supabase.from("products").delete().eq("id", productId)
      if (error) throw error
      fetchProducts()
    } catch (error) {
      console.error("Error deleting product:", error)
      alert("Error deleting product. Please try again.")
    }
  }

  const toggleProductStatus = async (productId: string, currentStatus: boolean) => {
    try {
      const { error } = await supabase.from("products").update({ is_active: !currentStatus }).eq("id", productId)
      if (error) throw error
      fetchProducts()
    } catch (error) {
      console.error("Error updating product status:", error)
    }
  }

  if (isLoading && products.length === 0) {
    return (
      <Card className="border-green-100">
        <CardHeader>
          <CardTitle className="text-green-800">Product Management</CardTitle>
        </CardHeader>
        <CardContent>
          <p className="text-center py-4">Loading products...</p>
        </CardContent>
      </Card>
    )
  }

  return (
    <Card className="border-green-100">
      <CardHeader>
        <div className="flex items-center justify-between">
          <CardTitle className="text-green-800">Product Management</CardTitle>
          <Button
            onClick={() => {
              setShowAddForm(!showAddForm)
              setEditingProduct(null)
              setFormData({
                name: "",
                description: "",
                price: "",
                stock_quantity: "",
                unit: "kg",
                is_organic: false,
                is_active: true,
              })
              setImageFile(null)
              setImagePreview(null)
            }}
            className="bg-green-600 hover:bg-green-700"
          >
            <Plus className="w-4 h-4 mr-2" />
            Add Product
          </Button>
        </div>
      </CardHeader>
      <CardContent>
        {showAddForm && (
          <form onSubmit={handleSubmit} className="mb-6 p-4 border border-green-200 rounded-lg bg-green-50">
            <h3 className="font-semibold text-green-800 mb-4">{editingProduct ? "Edit Product" : "Add New Product"}</h3>
            <div className="mb-4">
              <Label htmlFor="image" className="text-green-700">
                Product Image
              </Label>
              <div className="mt-2">
                {imagePreview ? (
                  <div className="relative inline-block">
                    <img
                      src={imagePreview || "/placeholder.svg"}
                      alt="Product preview"
                      className="w-32 h-32 object-cover rounded-lg border border-green-200"
                    />
                    <Button
                      type="button"
                      variant="outline"
                      size="sm"
                      className="absolute -top-2 -right-2 h-6 w-6 rounded-full p-0 bg-red-100 hover:bg-red-200"
                      onClick={() => {
                        setImageFile(null)
                        setImagePreview(null)
                      }}
                    >
                      <X className="w-3 h-3" />
                    </Button>
                  </div>
                ) : (
                  <div className="w-32 h-32 border-2 border-dashed border-green-300 rounded-lg flex items-center justify-center bg-green-50">
                    <Upload className="w-8 h-8 text-green-400" />
                  </div>
                )}
                <Input
                  id="image"
                  type="file"
                  accept="image/*"
                  onChange={handleImageChange}
                  className="mt-2 border-green-200 focus:border-green-500"
                />
                <p className="text-sm text-green-600 mt-1">Upload a product image (JPG, PNG, WebP)</p>
              </div>
            </div>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div>
                <Label htmlFor="name" className="text-green-700">
                  Product Name
                </Label>
                <Input
                  id="name"
                  required
                  value={formData.name}
                  onChange={(e) => setFormData({ ...formData, name: e.target.value })}
                  className="border-green-200 focus:border-green-500"
                />
              </div>
              <div>
                <Label htmlFor="price" className="text-green-700">
                  Price ($)
                </Label>
                <Input
                  id="price"
                  type="number"
                  step="0.01"
                  required
                  value={formData.price}
                  onChange={(e) => setFormData({ ...formData, price: e.target.value })}
                  className="border-green-200 focus:border-green-500"
                />
              </div>
              <div>
                <Label htmlFor="stock_quantity" className="text-green-700">
                  Stock Quantity
                </Label>
                <Input
                  id="stock_quantity"
                  type="number"
                  required
                  value={formData.stock_quantity}
                  onChange={(e) => setFormData({ ...formData, stock_quantity: e.target.value })}
                  className="border-green-200 focus:border-green-500"
                />
              </div>
              <div>
                <Label htmlFor="unit" className="text-green-700">
                  Unit
                </Label>
                <Input
                  id="unit"
                  required
                  value={formData.unit}
                  onChange={(e) => setFormData({ ...formData, unit: e.target.value })}
                  className="border-green-200 focus:border-green-500"
                />
              </div>
            </div>
            <div className="mt-4">
              <Label htmlFor="description" className="text-green-700">
                Description
              </Label>
              <Textarea
                id="description"
                required
                value={formData.description}
                onChange={(e) => setFormData({ ...formData, description: e.target.value })}
                className="border-green-200 focus:border-green-500"
              />
            </div>
            <div className="flex items-center space-x-6 mt-4">
              <div className="flex items-center space-x-2">
                <Switch
                  id="is_organic"
                  checked={formData.is_organic}
                  onCheckedChange={(checked) => setFormData({ ...formData, is_organic: checked })}
                />
                <Label htmlFor="is_organic" className="text-green-700">
                  Organic
                </Label>
              </div>
              <div className="flex items-center space-x-2">
                <Switch
                  id="is_active"
                  checked={formData.is_active}
                  onCheckedChange={(checked) => setFormData({ ...formData, is_active: checked })}
                />
                <Label htmlFor="is_active" className="text-green-700">
                  Active
                </Label>
              </div>
            </div>
            <div className="flex space-x-2 mt-4">
              <Button type="submit" className="bg-green-600 hover:bg-green-700" disabled={isLoading || uploadingImage}>
                {uploadingImage
                  ? "Uploading Image..."
                  : isLoading
                    ? "Saving..."
                    : editingProduct
                      ? "Update Product"
                      : "Add Product"}
              </Button>
              <Button
                type="button"
                variant="outline"
                onClick={() => {
                  setShowAddForm(false)
                  setEditingProduct(null)
                  setImageFile(null)
                  setImagePreview(null)
                }}
                className="border-green-200 text-green-700 hover:bg-green-50"
              >
                Cancel
              </Button>
            </div>
          </form>
        )}

        <div className="space-y-3">
          {products.length === 0 ? (
            <div className="text-center py-8">
              <Package className="w-12 h-12 text-gray-400 mx-auto mb-4" />
              <p className="text-gray-500">No products yet. Add your first product to get started!</p>
            </div>
          ) : (
            products.slice(0, 5).map((product) => (
              <div
                key={product.id}
                className="flex items-center justify-between p-3 border border-green-100 rounded-lg"
              >
                <div className="flex-grow">
                  <div className="flex items-center space-x-3">
                    <h4 className="font-medium text-green-800">{product.name}</h4>
                    <div className="flex space-x-2">
                      {product.is_organic && <Badge className="bg-green-100 text-green-800">Organic</Badge>}
                      <Badge variant={product.is_active ? "default" : "secondary"}>
                        {product.is_active ? "Active" : "Inactive"}
                      </Badge>
                      {product.stock_quantity < 10 && (
                        <Badge variant="destructive" className="bg-orange-100 text-orange-800">
                          Low Stock
                        </Badge>
                      )}
                    </div>
                  </div>
                  <div className="flex items-center space-x-4 mt-1 text-sm text-gray-600">
                    <span>
                      ${product.price.toFixed(2)}/{product.unit}
                    </span>
                    <span>Stock: {product.stock_quantity}</span>
                  </div>
                </div>
                <div className="flex items-center space-x-2">
                  <Switch
                    checked={product.is_active}
                    onCheckedChange={() => toggleProductStatus(product.id, product.is_active)}
                  />
                  <Button
                    variant="outline"
                    size="sm"
                    onClick={() => handleEdit(product)}
                    className="border-green-200 text-green-700 hover:bg-green-50"
                  >
                    <Edit className="w-4 h-4" />
                  </Button>
                  <Button
                    variant="outline"
                    size="sm"
                    onClick={() => handleDelete(product.id)}
                    className="border-red-200 text-red-600 hover:bg-red-50"
                  >
                    <Trash2 className="w-4 h-4" />
                  </Button>
                </div>
              </div>
            ))
          )}
        </div>
      </CardContent>
    </Card>
  )
}
