'use client'

import { useState, useCallback } from 'react'
import { motion, AnimatePresence } from 'framer-motion'
import { 
  Plus, 
  Edit, 
  Trash2, 
  X, 
  Save,
  Package,
  DollarSign,
  Tag,
  Hash,
  FileText,
  Image as ImageIcon
} from 'lucide-react'
import { Button } from '@/components/ui/button'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { Badge } from '@/components/ui/badge'
import { Input } from '@/components/ui/input'
import { Label } from '@/components/ui/label'
import { Textarea } from '@/components/ui/textarea'
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select'
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger } from '@/components/ui/dialog'
import ConfirmDialog from '@/components/ui/confirm-dialog'
import ProductImage from './product-image'
import ImageUpload from './image-upload'

interface Product {
  id: string
  name: string
  description?: string
  price: number
  category: string
  stock: number
  status: string
  sales: number
  rating?: number
  image?: string
}

interface ProductManagerProps {
  products: Product[]
  onRefresh: () => void
}

export default function ProductManager({ products, onRefresh }: ProductManagerProps) {
  const [isAddModalOpen, setIsAddModalOpen] = useState(false)
  const [isEditModalOpen, setIsEditModalOpen] = useState(false)
  const [editingProduct, setEditingProduct] = useState<Product | null>(null)
  const [loading, setLoading] = useState(false)
  const [deleteConfirmOpen, setDeleteConfirmOpen] = useState(false)
  const [productToDelete, setProductToDelete] = useState<Product | null>(null)
  const [formData, setFormData] = useState({
    name: '',
    description: '',
    price: '',
    category: '',
    stock: '',
    image: ''
  })

  const categories = [
    'Jerseys',
    'Shoes',
    'Accessories',
    'Equipment',
    'Collectibles',
    'Apparel',
    'Electronics',
    'Books'
  ]

  const resetForm = () => {
    setFormData({
      name: '',
      description: '',
      price: '',
      category: '',
      stock: '',
      image: ''
    })
  }

  const handleAddProduct = () => {
    resetForm()
    setIsAddModalOpen(true)
  }

  const handleEditProduct = (product: Product) => {
    setFormData({
      name: product.name,
      description: product.description || '',
      price: product.price.toString(),
      category: product.category,
      stock: product.stock.toString(),
      image: product.image || ''
    })
    setEditingProduct(product)
    setIsEditModalOpen(true)
  }


  const handleSaveProduct = async () => {
    if (!formData.name || !formData.price || !formData.category) {
      // TODO: Replace with proper toast notification
      console.error('Please fill in all required fields')
      return
    }

    setLoading(true)
    try {
      const method = editingProduct ? 'PUT' : 'POST'
      const body = editingProduct 
        ? { ...formData, id: editingProduct.id }
        : formData

      const response = await fetch('/api/admin/products', {
        method,
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(body)
      })

      if (!response.ok) {
        throw new Error('Failed to save product')
      }

      // Success - close modals and refresh
      setIsAddModalOpen(false)
      setIsEditModalOpen(false)
      setEditingProduct(null)
      resetForm()
      onRefresh()
    } catch (error) {
      console.error('Error saving product:', error)
      // TODO: Replace with proper toast notification
    } finally {
      setLoading(false)
    }
  }

  const handleDeleteClick = (product: Product) => {
    setProductToDelete(product)
    setDeleteConfirmOpen(true)
  }

  const handleDeleteConfirm = async () => {
    if (!productToDelete) return

    setLoading(true)
    try {
      const response = await fetch(`/api/admin/products?id=${productToDelete.id}`, {
        method: 'DELETE'
      })

      if (!response.ok) {
        throw new Error('Failed to delete product')
      }

      onRefresh()
      setProductToDelete(null)
    } catch (error) {
      console.error('Error deleting product:', error)
      // TODO: Replace with proper toast notification
    } finally {
      setLoading(false)
      setDeleteConfirmOpen(false)
    }
  }

  const getStatusColor = (status: string) => {
    switch (status) {
      case 'in_stock':
        return 'bg-emerald-100 text-emerald-800 border-emerald-200'
      case 'out_of_stock':
        return 'bg-red-100 text-red-800 border-red-200'
      default:
        return 'bg-gray-100 text-gray-800 border-gray-200'
    }
  }

  return (
    <Card className="shadow-lg border-0 bg-gradient-to-br from-white to-gray-50">
      <CardHeader className="bg-gradient-to-r from-kentucky-blue-600 to-kentucky-blue-700 text-white rounded-t-lg">
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-3">
            <Package className="h-6 w-6" />
            <CardTitle className="text-xl">Product Management</CardTitle>
          </div>
          <Button 
            onClick={handleAddProduct}
            variant="secondary"
            className="bg-white/20 hover:bg-white/30 text-white border-white/30"
          >
            <Plus className="h-4 w-4 mr-2" />
            Add Product
          </Button>
        </div>
      </CardHeader>

      <CardContent className="p-6">

        {/* Products Grid */}
        <div className="grid grid-cols-1 lg:grid-cols-2 xl:grid-cols-3 gap-6">
          {products.map((product) => (
            <motion.div
              key={product.id}
              className="bg-white rounded-xl shadow-lg hover:shadow-xl transition-all duration-300 overflow-hidden border border-gray-200"
              whileHover={{ y: -2 }}
            >
              {/* Product Image */}
              <div className="relative h-48 bg-gradient-to-br from-gray-100 to-gray-200">
                <ProductImage
                  src={product.image}
                  alt={product.name}
                  productId={product.id}
                />
                
                {/* Status Badge */}
                <div className="absolute top-3 right-3">
                  <Badge className={getStatusColor(product.status)}>
                    {product.status.replace('_', ' ')}
                  </Badge>
                </div>
              </div>

              {/* Product Info */}
              <div className="p-6">
                <div className="mb-4">
                  <h3 className="font-bold text-lg text-gray-900 mb-1">
                    {product.name}
                  </h3>
                  <p className="text-sm text-gray-600 mb-2">{product.category}</p>
                  {product.description && (
                    <p className="text-sm text-gray-500 line-clamp-2">
                      {product.description}
                    </p>
                  )}
                </div>

                {/* Price and Stock */}
                <div className="flex items-center justify-between mb-4">
                  <div className="flex items-center gap-1">
                    <DollarSign className="h-4 w-4 text-green-600" />
                    <span className="text-xl font-bold text-green-600">
                      {product.price.toFixed(2)}
                    </span>
                  </div>
                  <div className="text-right">
                    <p className="text-sm text-gray-600">
                      Stock: <span className="font-semibold">{product.stock}</span>
                    </p>
                    <p className="text-xs text-gray-500">
                      Sales: {product.sales}
                    </p>
                  </div>
                </div>

                {/* Action Buttons */}
                <div className="flex gap-2">
                  <Button
                    variant="outline"
                    size="sm"
                    onClick={() => handleEditProduct(product)}
                    className="flex-1 hover:bg-blue-50 hover:border-blue-300 hover:text-blue-600"
                  >
                    <Edit className="h-4 w-4 mr-1" />
                    Edit
                  </Button>
                  <Button
                    variant="outline"
                    size="sm"
                    onClick={() => handleDeleteClick(product)}
                    className="hover:bg-red-50 hover:border-red-300 hover:text-red-600"
                  >
                    <Trash2 className="h-4 w-4" />
                  </Button>
                </div>
              </div>
            </motion.div>
          ))}
        </div>

        {products.length === 0 && (
          <motion.div 
            className="text-center py-12"
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
          >
            <Package className="h-16 w-16 text-gray-400 mx-auto mb-4" />
            <p className="text-gray-500 text-lg mb-4">No products found</p>
            <Button
              onClick={handleAddProduct}
              className="bg-gradient-to-r from-kentucky-blue-600 to-kentucky-blue-700 hover:from-kentucky-blue-700 hover:to-kentucky-blue-800"
            >
              <Plus className="h-4 w-4 mr-2" />
              Add Your First Product
            </Button>
          </motion.div>
        )}
      </CardContent>

      {/* Add Product Modal */}
      <Dialog open={isAddModalOpen} onOpenChange={setIsAddModalOpen}>
        <DialogContent className="max-w-2xl max-h-[90vh] overflow-y-auto">
          <DialogHeader>
            <DialogTitle className="flex items-center gap-2">
              <Plus className="h-5 w-5" />
              Add New Product
            </DialogTitle>
          </DialogHeader>
          
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4 py-4">
            <div className="space-y-2">
              <Label htmlFor="add-name" className="flex items-center gap-2">
                <Tag className="h-4 w-4" />
                Product Name *
              </Label>
              <Input
                id="add-name"
                value={formData.name}
                onChange={(e) => setFormData({ ...formData, name: e.target.value })}
                placeholder="Enter product name"
              />
            </div>

            <div className="space-y-2">
              <Label htmlFor="add-category" className="flex items-center gap-2">
                <Package className="h-4 w-4" />
                Category *
              </Label>
              <Select
                value={formData.category}
                onValueChange={(value) => setFormData({ ...formData, category: value })}
              >
                <SelectTrigger>
                  <SelectValue placeholder="Select category" />
                </SelectTrigger>
                <SelectContent>
                  {categories.map((category) => (
                    <SelectItem key={category} value={category}>
                      {category}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>

            <div className="space-y-2">
              <Label htmlFor="add-price" className="flex items-center gap-2">
                <DollarSign className="h-4 w-4" />
                Price *
              </Label>
              <Input
                id="add-price"
                type="number"
                step="0.01"
                min="0"
                value={formData.price}
                onChange={(e) => setFormData({ ...formData, price: e.target.value })}
                placeholder="0.00"
              />
            </div>

            <div className="space-y-2">
              <Label htmlFor="add-stock" className="flex items-center gap-2">
                <Hash className="h-4 w-4" />
                Stock Quantity
              </Label>
              <Input
                id="add-stock"
                type="number"
                min="0"
                value={formData.stock}
                onChange={(e) => setFormData({ ...formData, stock: e.target.value })}
                placeholder="0"
              />
            </div>

            <div className="space-y-2 md:col-span-2">
              <ImageUpload
                value={formData.image}
                onChange={(value) => setFormData({ ...formData, image: value })}
                productId="add-preview"
              />
            </div>

            <div className="space-y-2 md:col-span-2">
              <Label htmlFor="add-description" className="flex items-center gap-2">
                <FileText className="h-4 w-4" />
                Description
              </Label>
              <Textarea
                id="add-description"
                value={formData.description}
                onChange={(e) => setFormData({ ...formData, description: e.target.value })}
                placeholder="Enter product description"
                rows={3}
              />
            </div>
          </div>

          <div className="flex justify-end gap-3">
            <Button
              variant="outline"
              onClick={() => {
                setIsAddModalOpen(false)
                resetForm()
              }}
            >
              Cancel
            </Button>
            <Button
              onClick={handleSaveProduct}
              disabled={loading}
              className="bg-gradient-to-r from-kentucky-blue-600 to-kentucky-blue-700 hover:from-kentucky-blue-700 hover:to-kentucky-blue-800"
            >
              <Save className="h-4 w-4 mr-2" />
              {loading ? 'Saving...' : 'Add Product'}
            </Button>
          </div>
        </DialogContent>
      </Dialog>

      {/* Edit Product Modal */}
      <Dialog open={isEditModalOpen} onOpenChange={setIsEditModalOpen}>
        <DialogContent className="max-w-2xl max-h-[90vh] overflow-y-auto">
          <DialogHeader>
            <DialogTitle className="flex items-center gap-2">
              <Edit className="h-5 w-5" />
              Edit Product
            </DialogTitle>
          </DialogHeader>
          
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4 py-4">
            <div className="space-y-2">
              <Label htmlFor="edit-name" className="flex items-center gap-2">
                <Tag className="h-4 w-4" />
                Product Name *
              </Label>
              <Input
                id="edit-name"
                value={formData.name}
                onChange={(e) => setFormData({ ...formData, name: e.target.value })}
                placeholder="Enter product name"
              />
            </div>

            <div className="space-y-2">
              <Label htmlFor="edit-category" className="flex items-center gap-2">
                <Package className="h-4 w-4" />
                Category *
              </Label>
              <Select
                value={formData.category}
                onValueChange={(value) => setFormData({ ...formData, category: value })}
              >
                <SelectTrigger>
                  <SelectValue placeholder="Select category" />
                </SelectTrigger>
                <SelectContent>
                  {categories.map((category) => (
                    <SelectItem key={category} value={category}>
                      {category}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>

            <div className="space-y-2">
              <Label htmlFor="edit-price" className="flex items-center gap-2">
                <DollarSign className="h-4 w-4" />
                Price *
              </Label>
              <Input
                id="edit-price"
                type="number"
                step="0.01"
                min="0"
                value={formData.price}
                onChange={(e) => setFormData({ ...formData, price: e.target.value })}
                placeholder="0.00"
              />
            </div>

            <div className="space-y-2">
              <Label htmlFor="edit-stock" className="flex items-center gap-2">
                <Hash className="h-4 w-4" />
                Stock Quantity
              </Label>
              <Input
                id="edit-stock"
                type="number"
                min="0"
                value={formData.stock}
                onChange={(e) => setFormData({ ...formData, stock: e.target.value })}
                placeholder="0"
              />
            </div>

            <div className="space-y-2 md:col-span-2">
              <ImageUpload
                value={formData.image}
                onChange={(value) => setFormData({ ...formData, image: value })}
                productId={editingProduct?.id || 'edit-preview'}
              />
            </div>

            <div className="space-y-2 md:col-span-2">
              <Label htmlFor="edit-description" className="flex items-center gap-2">
                <FileText className="h-4 w-4" />
                Description
              </Label>
              <Textarea
                id="edit-description"
                value={formData.description}
                onChange={(e) => setFormData({ ...formData, description: e.target.value })}
                placeholder="Enter product description"
                rows={3}
              />
            </div>
          </div>

          <div className="flex justify-end gap-3">
            <Button
              variant="outline"
              onClick={() => {
                setIsEditModalOpen(false)
                setEditingProduct(null)
                resetForm()
              }}
            >
              Cancel
            </Button>
            <Button
              onClick={handleSaveProduct}
              disabled={loading}
              className="bg-gradient-to-r from-kentucky-blue-600 to-kentucky-blue-700 hover:from-kentucky-blue-700 hover:to-kentucky-blue-800"
            >
              <Save className="h-4 w-4 mr-2" />
              {loading ? 'Saving...' : 'Update Product'}
            </Button>
          </div>
        </DialogContent>
      </Dialog>

      {/* Delete Confirmation Modal */}
      <ConfirmDialog
        open={deleteConfirmOpen}
        onOpenChange={setDeleteConfirmOpen}
        title="Delete Product"
        description={`Are you sure you want to delete "${productToDelete?.name}"? This action cannot be undone.`}
        confirmText="Delete"
        cancelText="Cancel"
        variant="destructive"
        onConfirm={handleDeleteConfirm}
        loading={loading}
      />
    </Card>
  )
}